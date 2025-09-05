/**
 * Enhanced Authentication Middleware
 * Integrates all security services for comprehensive protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { authService } from './auth-service'
import { auditService } from './audit-service'
import { securityMiddleware } from './security-middleware'
import { securityMonitor } from './security-monitor'

export interface AuthMiddlewareConfig {
  requireAuth?: boolean
  allowedRoles?: string[]
  publicPaths?: string[]
  adminPaths?: string[]
  apiPaths?: string[]
  redirectTo?: string
  enableSecurityHeaders?: boolean
  enableAuditLogging?: boolean
}

export class AuthMiddleware {
  private supabase: any
  private config: Required<AuthMiddlewareConfig>

  constructor(config: AuthMiddlewareConfig = {}) {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    this.config = {
      requireAuth: true,
      allowedRoles: [],
      publicPaths: ['/', '/login', '/signup', '/auth/forgot-password', '/auth/reset-password'],
      adminPaths: ['/admin', '/api/admin'],
      apiPaths: ['/api'],
      redirectTo: '/login',
      enableSecurityHeaders: true,
      enableAuditLogging: true,
      ...config
    }
  }

  async handle(request: NextRequest): Promise<NextResponse | undefined> {
    const { pathname } = request.nextUrl
    const method = request.method

    // Apply security middleware first
    const securityResponse = await securityMiddleware.handle(request)
    if (securityResponse) {
      return securityResponse
    }

    // Check if path is public
    if (this.isPublicPath(pathname)) {
      return this.addSecurityHeaders(new NextResponse())
    }

    // Get authentication tokens
    const accessToken = request.cookies.get('sb-access-token')?.value
    const refreshToken = request.cookies.get('sb-refresh-token')?.value

    let user = null
    let userProfile = null

    // Verify authentication
    if (accessToken) {
      try {
        const { data: { user: sessionUser }, error } = await this.supabase.auth.getUser(accessToken)

        if (!error && sessionUser) {
          user = sessionUser

          // Get user profile
          const { data: profile } = await this.supabase
            .from('users')
            .select('*, store:stores(*), organization:organizations(*)')
            .eq('id', sessionUser.id)
            .single()

          if (profile) {
            userProfile = profile

            // Check if account is active
            if (profile.status !== 'active') {
              if (this.config.enableAuditLogging) {
                await auditService.logAuth({
                  action: 'login_failure',
                  ip_address: this.getClientIP(request),
                  user_agent: request.headers.get('user-agent') || '',
                  metadata: { reason: 'account_inactive', user_id: profile.id }
                })
              }

              return this.redirectToLogin(request, 'Account is inactive')
            }

            // Check role-based access
            if (!this.hasRequiredRole(profile.role, pathname)) {
              if (this.config.enableAuditLogging) {
                await auditService.log({
                  action: 'unauthorized_access',
                  user_id: profile.id,
                  table_name: 'auth',
                  ip_address: this.getClientIP(request),
                  user_agent: request.headers.get('user-agent') || '',
                  metadata: {
                    path: pathname,
                    method,
                    required_role: this.getRequiredRole(pathname),
                    user_role: profile.role
                  },
                  severity: 'medium',
                  category: 'security'
                })
              }

              return this.redirectToUnauthorized(request)
            }
          }
        }
      } catch (error) {
        console.error('Auth middleware error:', error)
      }
    }

    // Require authentication for protected paths
    if (this.config.requireAuth && !user && !this.isPublicPath(pathname)) {
      if (this.config.enableAuditLogging) {
        await auditService.log({
          action: 'unauthorized_access',
          table_name: 'auth',
          ip_address: this.getClientIP(request),
          user_agent: request.headers.get('user-agent') || '',
          metadata: {
            path: pathname,
            method,
            reason: 'not_authenticated'
          },
          severity: 'low',
          category: 'auth'
        })
      }

      return this.redirectToLogin(request)
    }

    // Log successful access for sensitive endpoints
    if (user && this.isSensitiveEndpoint(pathname) && this.config.enableAuditLogging) {
      await auditService.log({
        action: 'api_access',
        user_id: user.id,
        table_name: 'auth',
        ip_address: this.getClientIP(request),
        user_agent: request.headers.get('user-agent') || '',
        metadata: {
          path: pathname,
          method,
          user_role: userProfile?.role
        },
        severity: 'low',
        category: 'auth'
      })
    }

    // Add user context to request headers for API routes
    const response = new NextResponse()

    if (pathname.startsWith('/api/') && userProfile) {
      response.headers.set('X-User-ID', user.id)
      response.headers.set('X-User-Role', userProfile.role)
      response.headers.set('X-Organization-ID', userProfile.organization_id || '')
      response.headers.set('X-Store-ID', userProfile.store_id || '')
    }

    return this.addSecurityHeaders(response)
  }

  private isPublicPath(pathname: string): boolean {
    return this.config.publicPaths.some(path =>
      pathname === path || pathname.startsWith(path + '/')
    )
  }

  private isSensitiveEndpoint(pathname: string): boolean {
    return (
      pathname.includes('/admin') ||
      pathname.includes('/api/admin') ||
      pathname.includes('/settings') ||
      pathname.includes('/users')
    )
  }

  private hasRequiredRole(userRole: string, pathname: string): boolean {
    const requiredRole = this.getRequiredRole(pathname)

    if (!requiredRole) return true

    // Super admin has access to everything
    if (userRole === 'super_admin') return true

    // Check specific role requirements
    const roleHierarchy = {
      'super_admin': 4,
      'admin': 3,
      'manager': 2,
      'cashier': 1,
      'seller': 0
    }

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0
    const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0

    return userLevel >= requiredLevel
  }

  private getRequiredRole(pathname: string): string | null {
    if (this.config.adminPaths.some(path => pathname.startsWith(path))) {
      return 'admin'
    }

    if (pathname.includes('/manager')) {
      return 'manager'
    }

    if (pathname.includes('/cashier')) {
      return 'cashier'
    }

    return null
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown'
    )
  }

  private redirectToLogin(request: NextRequest, error?: string): NextResponse {
    const loginUrl = new URL(this.config.redirectTo!, request.url)

    if (error) {
      loginUrl.searchParams.set('error', error)
    }

    // Store intended destination
    if (!this.isPublicPath(request.nextUrl.pathname)) {
      loginUrl.searchParams.set('from', request.nextUrl.pathname)
    }

    return NextResponse.redirect(loginUrl)
  }

  private redirectToUnauthorized(request: NextRequest): NextResponse {
    // For API routes, return 403
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Forbidden', { status: 403 })
    }

    // For pages, redirect to dashboard with error
    const dashboardUrl = new URL('/dashboard', request.url)
    dashboardUrl.searchParams.set('error', 'unauthorized')
    return NextResponse.redirect(dashboardUrl)
  }

  private addSecurityHeaders(response: NextResponse): NextResponse {
    if (!this.config.enableSecurityHeaders) return response

    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

    return response
  }

  // Utility methods for external use
  async getCurrentUser(request: NextRequest): Promise<any> {
    const accessToken = request.cookies.get('sb-access-token')?.value
    if (!accessToken) return null

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(accessToken)
      return error ? null : user
    } catch {
      return null
    }
  }

  async getCurrentUserProfile(request: NextRequest): Promise<any> {
    const user = await this.getCurrentUser(request)
    if (!user) return null

    try {
      const { data: profile } = await this.supabase
        .from('users')
        .select('*, store:stores(*), organization:organizations(*)')
        .eq('id', user.id)
        .single()

      return profile
    } catch {
      return null
    }
  }

  updateConfig(newConfig: Partial<AuthMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  getConfig(): AuthMiddlewareConfig {
    return { ...this.config }
  }
}

// Create default auth middleware instance
export const authMiddleware = new AuthMiddleware()

// Next.js middleware function
export async function withAuth(request: NextRequest): Promise<NextResponse | undefined> {
  return await authMiddleware.handle(request)
}

// Higher-order function to create middleware with custom config
export function createAuthMiddleware(config: AuthMiddlewareConfig) {
  const middleware = new AuthMiddleware(config)

  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    return await middleware.handle(request)
  }
}

// Combined middleware that includes both auth and security
export async function withAuthAndSecurity(request: NextRequest): Promise<NextResponse | undefined> {
  // Apply security middleware first
  const securityResponse = await securityMiddleware.handle(request)
  if (securityResponse) {
    return securityResponse
  }

  // Then apply auth middleware
  return await authMiddleware.handle(request)
}