/**
 * CSRF Protection Utilities
 * Provides secure CSRF token generation and validation
 */

import { randomBytes } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

export interface CSRFConfig {
  cookieName?: string
  headerName?: string
  tokenLength?: number
  maxAge?: number // in seconds
}

export class CSRFProtection {
  private config: Required<CSRFConfig>

  constructor(config: CSRFConfig = {}) {
    this.config = {
      cookieName: 'csrf-token',
      headerName: 'x-csrf-token',
      tokenLength: 32,
      maxAge: 60 * 60, // 1 hour
      ...config
    }
  }

  // Generate a secure random CSRF token
  generateToken(): string {
    return randomBytes(this.config.tokenLength).toString('hex')
  }

  // Create response with CSRF token cookie
  createResponseWithToken(response: NextResponse, token?: string): NextResponse {
    const csrfToken = token || this.generateToken()

    response.cookies.set(this.config.cookieName, csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: this.config.maxAge,
      path: '/'
    })

    // Add token to response for client-side use
    response.headers.set('X-CSRF-Token', csrfToken)

    return response
  }

  // Validate CSRF token from request
  validateToken(request: NextRequest): boolean {
    const cookieToken = request.cookies.get(this.config.cookieName)?.value
    const headerToken = request.headers.get(this.config.headerName)

    if (!cookieToken || !headerToken) {
      return false
    }

    // Use constant-time comparison to prevent timing attacks
    return this.constantTimeEquals(cookieToken, headerToken)
  }

  // Get CSRF token for client-side use
  getToken(request: NextRequest): string | null {
    return request.cookies.get(this.config.cookieName)?.value || null
  }

  // Constant-time string comparison to prevent timing attacks
  private constantTimeEquals(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false
    }

    let result = 0
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i)
    }

    return result === 0
  }

  // Middleware function for CSRF protection
  middleware(request: NextRequest): NextResponse | undefined {
    // Skip CSRF check for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return undefined
    }

    // Skip CSRF check for API routes that don't need it
    if (request.nextUrl.pathname.startsWith('/api/auth/') &&
        !['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      return undefined
    }

    if (!this.validateToken(request)) {
      const errorResponse = NextResponse.json(
        { error: 'CSRF token validation failed' },
        { status: 403 }
      )

      // Log CSRF attempt
      console.warn('CSRF validation failed:', {
        path: request.nextUrl.pathname,
        method: request.method,
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        userAgent: request.headers.get('user-agent')
      })

      return errorResponse
    }

    return undefined
  }
}

// Default CSRF protection instance
export const csrfProtection = new CSRFProtection()

// Helper function to get CSRF token for forms
export async function getCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to get CSRF token')
    }

    const data = await response.json()
    return data.token
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
    throw error
  }
}