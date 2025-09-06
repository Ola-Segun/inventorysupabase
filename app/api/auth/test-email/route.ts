import { NextRequest, NextResponse } from 'next/server'
import { emailService } from '@/lib/email-service'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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

    // Test admin.createUser
    console.log('🧪 TEST ADMIN: Testing admin.createUser...')
    const testEmail = `test-${Date.now()}@example.com`
    const testPassword = 'testpassword123'

    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: 'Test User',
        role: 'seller'
      }
    })

    console.log('🧪 TEST ADMIN: Admin createUser result:', {
      hasData: !!adminData,
      hasUser: !!adminData?.user,
      userId: adminData?.user?.id,
      email: adminData?.user?.email,
      error: adminError ? {
        message: adminError.message,
        status: adminError.status
      } : null
    })

    // Clean up test user if created
    if (adminData?.user?.id && !adminError) {
      console.log('🧪 TEST ADMIN: Cleaning up test user...')
      await supabase.auth.admin.deleteUser(adminData.user.id)
      console.log('🧪 TEST ADMIN: Test user cleaned up')
    }

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
      messageId: testResult.messageId,
      adminTest: {
        success: !adminError,
        userCreated: !!adminData?.user,
        userId: adminData?.user?.id,
        error: adminError?.message
      }
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