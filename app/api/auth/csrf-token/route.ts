import { NextRequest, NextResponse } from 'next/server'
import { csrfProtection } from '@/lib/auth/csrf'

export async function GET(request: NextRequest) {
  try {
    // Get existing token or generate new one
    const existingToken = csrfProtection.getToken(request)
    const token = existingToken || csrfProtection.generateToken()

    // Create response with CSRF token
    const response = NextResponse.json({
      token,
      success: true
    })

    // Set CSRF token cookie if not already set
    if (!existingToken) {
      return csrfProtection.createResponseWithToken(response, token)
    }

    return response
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}