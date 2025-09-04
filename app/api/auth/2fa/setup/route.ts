import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import speakeasy from 'speakeasy'
import qrcode from 'qrcode'

// Helper function to check if user is authenticated
async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// POST /api/auth/2fa/setup - Setup 2FA for user
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if 2FA is already enabled
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('two_factor_enabled, two_factor_secret')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    if (userProfile?.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is already enabled for this account' }, { status: 400 })
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Inventory POS (${currentUser.email})`,
      issuer: 'Inventory POS'
    })

    // Generate QR code
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url!)

    // Store secret temporarily (will be confirmed later)
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_secret: secret.base32,
        two_factor_enabled: false // Will be set to true after verification
      })
      .eq('id', currentUser.id)

    if (updateError) {
      console.error('Error updating user with 2FA secret:', updateError)
      return NextResponse.json({ error: 'Failed to setup 2FA' }, { status: 500 })
    }

    return NextResponse.json({
      message: '2FA setup initiated',
      secret: secret.base32,
      qrCode: qrCodeUrl,
      otpauthUrl: secret.otpauth_url
    })
  } catch (error) {
    console.error('POST 2FA setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/auth/2fa/setup - Verify and enable 2FA
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Get user's 2FA secret
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', currentUser.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    if (!userProfile.two_factor_secret) {
      return NextResponse.json({ error: '2FA setup not initiated' }, { status: 400 })
    }

    if (userProfile.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is already enabled' }, { status: 400 })
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: userProfile.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2 // Allow 2 time steps (30 seconds) for clock skew
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    // Generate backup codes
    const backupCodes = []
    for (let i = 0; i < 10; i++) {
      backupCodes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
    }

    // Enable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: true,
        two_factor_backup_codes: backupCodes
      })
      .eq('id', currentUser.id)

    if (updateError) {
      console.error('Error enabling 2FA:', updateError)
      return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: '2fa_enabled',
        table_name: 'users',
        record_id: currentUser.id,
        new_values: { two_factor_enabled: true },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: '2FA enabled successfully',
      backupCodes: backupCodes
    })
  } catch (error) {
    console.error('PUT 2FA setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/auth/2fa/setup - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token } = await request.json()

    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 })
    }

    // Get user's 2FA secret
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('two_factor_secret, two_factor_enabled')
      .eq('id', currentUser.id)
      .single()

    if (profileError || !userProfile) {
      console.error('Error fetching user profile:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    if (!userProfile.two_factor_enabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 })
    }

    // Verify token before disabling
    const verified = speakeasy.totp.verify({
      secret: userProfile.two_factor_secret,
      encoding: 'base32',
      token: token,
      window: 2
    })

    if (!verified) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 })
    }

    // Disable 2FA
    const { error: updateError } = await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null,
        two_factor_backup_codes: null
      })
      .eq('id', currentUser.id)

    if (updateError) {
      console.error('Error disabling 2FA:', updateError)
      return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: '2fa_disabled',
        table_name: 'users',
        record_id: currentUser.id,
        old_values: { two_factor_enabled: true },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({ message: '2FA disabled successfully' })
  } catch (error) {
    console.error('DELETE 2FA setup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}