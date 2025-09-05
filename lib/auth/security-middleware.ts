/**
 * Security Middleware with Rate Limiting and DDoS Protection
 * Integrates with the rate limiting service for comprehensive protection
 */

import { NextRequest, NextResponse } from 'next/server'
import { rateLimitService, rateLimiters } from './rate-limit'
import { auditService } from './audit-service'

export interface SecurityMiddlewareConfig {
  enableRateLimiting?: boolean
  enableDDoSProtection?: boolean
  enableAuditLogging?: boolean
  customRateLimitConfig?: typeof rateLimiters.auth
  trustedIPs?: string[]
  blockedIPs?: string[]
}

export class SecurityMiddleware {
  private config: Required<SecurityMiddlewareConfig>

  constructor(config: SecurityMiddlewareConfig = {}) {
    this.config = {
      enableRateLimiting: true,
      enableDDoSProtection: true,
      enableAuditLogging: true,
      customRateLimitConfig: rateLimiters.auth,
      trustedIPs: [],
      blockedIPs: [],
      ...config
    }
  }

  // Main middleware function
  async handle(request: NextRequest): Promise<NextResponse | undefined> {
    const { pathname } = request.nextUrl
    const method = request.method
    const clientIP = this.getClientIP(request)

    // Skip middleware for static files and health checks
    if (this.shouldSkip(request)) {
      return undefined
    }

    // Check blocked IPs
    if (this.config.blockedIPs.includes(clientIP)) {
      if (this.config.enableAuditLogging) {
        await auditService.logSecurity({
          action: 'unauthorized_access',
          ip_address: clientIP,
          user_agent: request.headers.get('user-agent') || '',
          metadata: {
            reason: 'blocked_ip',
            url: request.url,
            method
          }
        })
      }

      return new NextResponse('Access denied', { status: 403 })
    }

    // Check trusted IPs (bypass rate limiting)
    const isTrustedIP = this.config.trustedIPs.includes(clientIP)

    // Apply rate limiting
    if (this.config.enableRateLimiting && !isTrustedIP) {
      const rateLimitConfig = this.getRateLimitConfig(pathname)
      const rateLimitResult = await rateLimitService.checkRateLimit(
        request,
        rateLimitConfig,
        'security'
      )

      if (!rateLimitResult.allowed && rateLimitResult.response) {
        return rateLimitResult.response
      }
    }

    // Log security events for sensitive endpoints
    if (this.config.enableAuditLogging && this.isSensitiveEndpoint(pathname)) {
      await auditService.log({
        action: 'api_access',
        table_name: 'security',
        ip_address: clientIP,
        user_agent: request.headers.get('user-agent') || '',
        metadata: {
          url: request.url,
          method,
          userAgent: request.headers.get('user-agent'),
          referer: request.headers.get('referer'),
          acceptLanguage: request.headers.get('accept-language')
        },
        severity: 'low',
        category: 'security'
      })
    }

    // Add security headers
    return this.addSecurityHeaders(new NextResponse())
  }

  private shouldSkip(request: NextRequest): boolean {
    const { pathname } = request.nextUrl

    // Skip static files, Next.js internals, and health checks
    return (
      pathname.startsWith('/_next/') ||
      pathname.startsWith('/favicon.ico') ||
      pathname.startsWith('/manifest.json') ||
      pathname.startsWith('/api/health') ||
      pathname.includes('.') && !pathname.startsWith('/api/')
    )
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown'
    )
  }

  private getRateLimitConfig(pathname: string): typeof rateLimiters.auth {
    // Use custom config if provided
    if (this.config.customRateLimitConfig) {
      return this.config.customRateLimitConfig
    }

    // Choose appropriate rate limiter based on endpoint
    if (pathname.includes('/auth/') || pathname.includes('/login')) {
      return rateLimiters.auth
    }

    if (pathname.startsWith('/api/')) {
      return rateLimiters.api
    }

    return rateLimiters.public
  }

  private isSensitiveEndpoint(pathname: string): boolean {
    const sensitivePaths = [
      '/api/auth/',
      '/api/admin/',
      '/api/users/',
      '/admin/',
      '/settings/'
    ]

    return sensitivePaths.some(path => pathname.startsWith(path))
  }

  private addSecurityHeaders(response: NextResponse): NextResponse {
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    // Content Security Policy (basic)
    response.headers.set('Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https:; " +
      "frame-ancestors 'none';"
    )

    // HSTS (HTTP Strict Transport Security)
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')

    return response
  }

  // Update configuration
  updateConfig(newConfig: Partial<SecurityMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  // Get current configuration
  getConfig(): SecurityMiddlewareConfig {
    return { ...this.config }
  }

  // Get rate limiting stats
  getRateLimitStats() {
    return rateLimitService.getAllEntries('security')
  }

  // Reset rate limit for an IP
  resetRateLimit(ip: string): boolean {
    return rateLimitService.resetRateLimit(ip, 'security')
  }

  // Add IP to blocked list
  blockIP(ip: string): void {
    if (!this.config.blockedIPs.includes(ip)) {
      this.config.blockedIPs.push(ip)
      rateLimitService.blacklistIP(ip)
    }
  }

  // Remove IP from blocked list
  unblockIP(ip: string): void {
    this.config.blockedIPs = this.config.blockedIPs.filter(item => item !== ip)
    rateLimitService.unblacklistIP(ip)
  }

  // Add IP to trusted list
  trustIP(ip: string): void {
    if (!this.config.trustedIPs.includes(ip)) {
      this.config.trustedIPs.push(ip)
      rateLimitService.whitelistIP(ip)
    }
  }

  // Remove IP from trusted list
  untrustIP(ip: string): void {
    this.config.trustedIPs = this.config.trustedIPs.filter(item => item !== ip)
    rateLimitService.whitelistIP(ip) // This will remove from whitelist
  }
}

// Create default security middleware instance
export const securityMiddleware = new SecurityMiddleware()

// Next.js middleware function
export async function withSecurity(request: NextRequest): Promise<NextResponse | undefined> {
  return await securityMiddleware.handle(request)
}

// Higher-order function to create middleware with custom config
export function createSecurityMiddleware(config: SecurityMiddlewareConfig) {
  const middleware = new SecurityMiddleware(config)

  return async (request: NextRequest): Promise<NextResponse | undefined> => {
    return await middleware.handle(request)
  }
}