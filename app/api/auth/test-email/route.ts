import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Test Email API: Received request')
    const body = await request.text()
    console.log('🔍 Test Email API: Raw body:', body)

    let parsedBody
    try {
      parsedBody = JSON.parse(body)
    } catch (parseError) {
      console.error('❌ Test Email API: JSON parse error:', parseError)
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { email } = parsedBody
    console.log('🔍 Test Email API: Parsed email:', email)

    if (!email) {
      console.log('❌ Test Email API: Missing email')
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Test email sending by attempting to send a password reset email
    console.log('🔄 Test Email API: Sending test email to:', email)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
    })

    if (error) {
      console.error('❌ Test Email API: Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to send test email', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Test Email API: Test email sent successfully')
    return NextResponse.json({
      message: 'Test email sent successfully. Check your inbox and spam folder.',
      note: 'If you receive this email, email confirmation should work. If not, check Supabase SMTP settings.'
    })
  } catch (error) {
    console.error('❌ Test Email API: Internal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}