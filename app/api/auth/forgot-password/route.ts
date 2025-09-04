import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { emailService } from '@/lib/email-service'
import crypto from 'crypto'

// POST /api/auth/forgot-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { email } = await request.json()

    // Validate required fields
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    // Store reset token in database
    const { error: tokenError } = await supabase
      .from('users')
      .update({
        password_reset_token: resetToken,
        password_reset_expires: resetExpires.toISOString()
      })
      .eq('id', user.id)

    if (tokenError) {
      console.error('Token storage error:', tokenError)
      return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
    }

    // Generate reset URL
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`

    // Log the password reset request
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'password_reset_requested',
        table_name: 'users',
        record_id: user.id,
        new_values: { reset_requested: true },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    // Send password reset email
    const emailResult = await emailService.sendPasswordResetEmail({
      to: user.email,
      recipientName: user.name,
      resetUrl,
      expiresIn: '1 hour'
    })

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      // Don't fail the request if email fails, but log it
    }

    // For development, you might want to return the reset URL
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({
        message: 'Password reset link generated and email sent (check console for development)',
        resetUrl,
        expires: resetExpires,
        emailSent: emailResult.success,
        emailMethod: emailResult.method
      })
    }

    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.',
      emailSent: emailResult.success
    })

  } catch (error) {
    console.error('POST forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}