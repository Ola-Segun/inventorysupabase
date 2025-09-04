import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/client'

// POST /api/auth/reset-password - Reset password with token
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { token, newPassword } = await request.json()

    // Validate required fields
    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, password_reset_token, password_reset_expires')
      .eq('password_reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(user.password_reset_expires)

    if (now > expiresAt) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
    }

    // Update password in Supabase Auth
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword
    })

    if (authError) {
      console.error('Auth password update error:', authError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Clear reset token and update password change timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_reset_token: null,
        password_reset_expires: null,
        last_password_change: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('User profile update error:', updateError)
      // Don't fail the request if this update fails
    }

    // Log the password reset
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'password_reset_completed',
        table_name: 'users',
        record_id: user.id,
        new_values: { password_reset: true },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'Password reset successfully',
      email: user.email
    })

  } catch (error) {
    console.error('POST reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/reset-password - Validate reset token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required' }, { status: 400 })
    }

    const supabase = createRouteHandlerClient({ cookies })

    // Find user with valid reset token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name, password_reset_expires')
      .eq('password_reset_token', token)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 400 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(user.password_reset_expires)

    if (now > expiresAt) {
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      email: user.email,
      name: user.name
    })

  } catch (error) {
    console.error('GET validate reset token error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}