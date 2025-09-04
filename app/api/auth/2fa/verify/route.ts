import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import speakeasy from 'speakeasy'

// Helper function to get current user
async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// POST /api/auth/2fa/verify - Verify 2FA token
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token, backupCode } = await request.json()

    if (!token && !backupCode) {
      return NextResponse.json({ error: 'Token or backup code is required' }, { status: 400 })
    }

    // Get user's 2FA settings
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('two_factor_enabled, two_factor_secret, two_factor_backup_codes')
      .eq('id', currentUser.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    if (!userProfile.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is not enabled for this account' }, { status: 400 })
    }

    let verified = false
    let usedBackupCode = false

    if (backupCode && userProfile.two_factor_backup_codes) {
      // Check if backup code is valid
      const backupCodeIndex = userProfile.two_factor_backup_codes.indexOf(backupCode)

      if (backupCodeIndex !== -1) {
        verified = true
        usedBackupCode = true

        // Remove used backup code
        const updatedBackupCodes = [...userProfile.two_factor_backup_codes]
        updatedBackupCodes.splice(backupCodeIndex, 1)

        const { error: updateError } = await supabase
          .from('users')
          .update({ two_factor_backup_codes: updatedBackupCodes })
          .eq('id', currentUser.id)

        if (updateError) {
          console.error('Error updating backup codes:', updateError)
          // Don't fail the request if backup code update fails
        }
      }
    } else if (token && userProfile.two_factor_secret) {
      // Verify TOTP token
      verified = speakeasy.totp.verify({
        secret: userProfile.two_factor_secret,
        encoding: 'base32',
        token: token,
        window: 2 // Allow 2 time steps (30 seconds) for clock skew
      })
    }

    if (!verified) {
      // Log failed 2FA attempt
      await supabase.rpc('log_login_attempt', {
        p_user_id: currentUser.id,
        p_success: false,
        p_failure_reason: 'Invalid 2FA token',
        p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        p_user_agent: request.headers.get('user-agent') || 'unknown'
      })

      return NextResponse.json({ error: 'Invalid 2FA token' }, { status: 400 })
    }

    // Log successful 2FA verification
    await supabase.rpc('log_login_attempt', {
      p_user_id: currentUser.id,
      p_success: true,
      p_ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
      p_user_agent: request.headers.get('user-agent') || 'unknown'
    })

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: '2fa_verified',
        table_name: 'users',
        record_id: currentUser.id,
        new_values: {
          verification_method: usedBackupCode ? 'backup_code' : 'totp',
          ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: '2FA verification successful',
      method: usedBackupCode ? 'backup_code' : 'totp'
    })
  } catch (error) {
    console.error('POST 2FA verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/2fa/verify - Check if 2FA is required for current user
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's 2FA status
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('two_factor_enabled, two_factor_backup_codes')
      .eq('id', currentUser.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    return NextResponse.json({
      twoFactorEnabled: userProfile.two_factor_enabled || false,
      backupCodesCount: userProfile.two_factor_backup_codes?.length || 0
    })
  } catch (error) {
    console.error('GET 2FA verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}