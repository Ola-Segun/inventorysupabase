import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    console.log('🧪 TEST EMAIL: Starting email test for:', email)

    // Test invitation email
    const testResult = await emailService.sendInvitationEmail({
      to: email,
      recipientName: 'Test User',
      inviterName: 'Test Admin',
      invitationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/test-invitation`,
      role: 'seller',
      message: 'This is a test invitation email to verify email configuration.',
      expiresIn: '7 days'
    })

    console.log('🧪 TEST EMAIL: Test result:', testResult)

    return NextResponse.json({
      success: testResult.success,
      message: testResult.success
        ? 'Test email sent successfully!'
        : 'Test email failed to send',
      method: testResult.method,
      error: testResult.error,
      messageId: testResult.messageId
    })

  } catch (error) {
    console.error('🧪 TEST EMAIL: Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}