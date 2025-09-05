/**
 * Advanced Rate Limiting and DDoS Protection Service
 * Provides multi-layer protection against abuse and attacks
 */

import { NextRequest, NextResponse } from 'next/server'
import { auditService } from './audit-service'

export interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
  keyGenerator?: (request: NextRequest) => string // Custom key generator
  skip?: (request: NextRequest) => boolean // Skip rate limiting for certain requests
  handler?: (request: NextRequest, response: NextResponse) => NextResponse // Custom handler when limit exceeded
  onLimitReached?: (key: string, config: RateLimitConfig) => void // Callback when limit reached
}

export interface RateLimitEntry {
  count: number
  resetTime: number
  firstRequest: number
  lastRequest: number
  blockedUntil?: number
}

export interface DDoSProtectionConfig {
  enabled: boolean
  maxConcurrentConnections: number
  suspiciousPatterns: RegExp[]
  blockDuration: number // in milliseconds
  whitelist: string[] // IP addresses to whitelist
  blacklist: string[] // IP addresses to blacklist
}

class RateLimitService {
  private stores = new Map<string, Map<string, RateLimitEntry>>()
  private cleanupInterval: NodeJS.Timeout | null = null
  private ddosConfig: DDoSProtectionConfig

  constructor() {
    // Default DDoS protection config
    this.ddosConfig = {
      enabled: true,
      maxConcurrentConnections: 100,
      suspiciousPatterns: [
        /\.\./, // Directory traversal
        /<script/i, // XSS attempts
        /union.*select/i, // SQL injection
        /eval\(/i, // Code injection
        /base64/i, // Base64 encoded attacks
      ],
      blockDuration: 15 * 60 * 1000, // 15 minutes
      whitelist: [],
      blacklist: []
    }

    // Start cleanup interval
    this.startCleanup()
  }

  private startCleanup() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  private cleanup() {
    const now = Date.now()

    for (const [storeName, store] of this.stores) {
      for (const [key, entry] of store) {
        if (now > entry.resetTime) {
          store.delete(key)
        }
      }

      if (store.size === 0) {
        this.stores.delete(storeName)
      }
    }
  }

  // Get or create a rate limit store
  private getStore(storeName: string): Map<string, RateLimitEntry> {
    if (!this.stores.has(storeName)) {
      this.stores.set(storeName, new Map())
    }
    return this.stores.get(storeName)!
  }

  // Generate rate limit key
  private generateKey(request: NextRequest, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request)
    }

    // Default: Use IP address
    const ip = this.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const path = request.nextUrl.pathname

    // For auth endpoints, include path to prevent cross-endpoint abuse
    if (path.includes('/auth/') || path.includes('/login')) {
      return `${ip}:${path}`
    }

    return ip
  }

  private getClientIP(request: NextRequest): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      request.headers.get('x-client-ip') ||
      'unknown'
    )
  }

  // Check if request should be skipped
  private shouldSkip(request: NextRequest, config: RateLimitConfig): boolean {
    if (config.skip) {
      return config.skip(request)
    }

    // Skip health checks, static files
    const path = request.nextUrl.pathname
    return (
      path.startsWith('/_next/') ||
      path.startsWith('/api/health') ||
      path.includes('.') && !path.includes('/api/')
    )
  }

  // Check for DDoS patterns
  private checkDDoSPatterns(request: NextRequest): boolean {
    if (!this.ddosConfig.enabled) return false

    const ip = this.getClientIP(request)

    // Check whitelist/blacklist
    if (this.ddosConfig.whitelist.includes(ip)) return false
    if (this.ddosConfig.blacklist.includes(ip)) return true

    // Check suspicious patterns in URL and headers
    const url = request.url
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''

    const checkString = `${url} ${userAgent} ${referer}`.toLowerCase()

    return this.ddosConfig.suspiciousPatterns.some(pattern => pattern.test(checkString))
  }

  // Main rate limiting function
  async checkRateLimit(
    request: NextRequest,
    config: RateLimitConfig,
    storeName: string = 'default'
  ): Promise<{ allowed: boolean; response?: NextResponse; entry?: RateLimitEntry }> {
    // Skip if configured to skip
    if (this.shouldSkip(request, config)) {
      return { allowed: true }
    }

    const key = this.generateKey(request, config)
    const store = this.getStore(storeName)
    const now = Date.now()

    // Check DDoS protection first
    if (this.checkDDoSPatterns(request)) {
      await auditService.logSecurity({
        action: 'suspicious_activity',
        ip_address: this.getClientIP(request),
        user_agent: request.headers.get('user-agent') || '',
        metadata: {
          pattern: 'ddos_suspicious_pattern',
          url: request.url,
          method: request.method
        }
      })

      const blockedResponse = NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )

      return { allowed: false, response: blockedResponse }
    }

    let entry = store.get(key)

    if (!entry || now > entry.resetTime) {
      // Create new entry
      entry = {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
        lastRequest: now
      }
      store.set(key, entry)
    } else {
      // Update existing entry
      entry.count++
      entry.lastRequest = now

      // Check if blocked
      if (entry.blockedUntil && now < entry.blockedUntil) {
        const blockedResponse = NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil((entry.blockedUntil - now) / 1000).toString()
            }
          }
        )

        return { allowed: false, response: blockedResponse }
      }

      // Check if limit exceeded
      if (entry.count > config.maxRequests) {
        // Block the key
        entry.blockedUntil = now + (15 * 60 * 1000) // 15 minutes

        // Call limit reached callback
        if (config.onLimitReached) {
          config.onLimitReached(key, config)
        }

        // Log rate limit violation
        await auditService.logSecurity({
          action: 'brute_force_attempt',
          ip_address: this.getClientIP(request),
          user_agent: request.headers.get('user-agent') || '',
          metadata: {
            limit: config.maxRequests,
            windowMs: config.windowMs,
            attempts: entry.count,
            url: request.url
          }
        })

        const limitResponse = NextResponse.json(
          {
            error: 'Too many requests',
            retryAfter: Math.ceil(config.windowMs / 1000)
          },
          {
            status: 429,
            headers: {
              'Retry-After': Math.ceil(config.windowMs / 1000).toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(entry.resetTime).toISOString()
            }
          }
        )

        if (config.handler) {
          return { allowed: false, response: config.handler(request, limitResponse) }
        }

        return { allowed: false, response: limitResponse }
      }
    }

    // Add rate limit headers to successful requests
    const remaining = Math.max(0, config.maxRequests - entry.count)
    const resetTime = new Date(entry.resetTime)

    return {
      allowed: true,
      entry,
      response: new NextResponse(null, {
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toISOString()
        }
      })
    }
  }

  // Middleware function for Next.js
  createMiddleware(config: RateLimitConfig, storeName: string = 'default') {
    return async (request: NextRequest): Promise<NextResponse | undefined> => {
      const result = await this.checkRateLimit(request, config, storeName)

      if (!result.allowed && result.response) {
        return result.response
      }

      // If allowed but has response headers, merge them
      if (result.allowed && result.response) {
        // This would be handled by the calling middleware
        return undefined
      }

      return undefined
    }
  }

  // Get rate limit status for a key
  getRateLimitStatus(key: string, storeName: string = 'default'): RateLimitEntry | null {
    const store = this.stores.get(storeName)
    return store?.get(key) || null
  }

  // Reset rate limit for a key
  resetRateLimit(key: string, storeName: string = 'default'): boolean {
    const store = this.stores.get(storeName)
    if (store?.has(key)) {
      store.delete(key)
      return true
    }
    return false
  }

  // Get all rate limit entries for monitoring
  getAllEntries(storeName: string = 'default'): Array<{ key: string; entry: RateLimitEntry }> {
    const store = this.stores.get(storeName)
    if (!store) return []

    return Array.from(store.entries()).map(([key, entry]) => ({ key, entry }))
  }

  // Update DDoS protection config
  updateDDoSConfig(config: Partial<DDoSProtectionConfig>): void {
    this.ddosConfig = { ...this.ddosConfig, ...config }
  }

  // Add IP to blacklist
  blacklistIP(ip: string): void {
    if (!this.ddosConfig.blacklist.includes(ip)) {
      this.ddosConfig.blacklist.push(ip)
    }
  }

  // Remove IP from blacklist
  unblacklistIP(ip: string): void {
    this.ddosConfig.blacklist = this.ddosConfig.blacklist.filter(item => item !== ip)
  }

  // Add IP to whitelist
  whitelistIP(ip: string): void {
    if (!this.ddosConfig.whitelist.includes(ip)) {
      this.ddosConfig.whitelist.push(ip)
    }
  }

  // Get DDoS protection stats
  getDDoSStats(): {
    blacklistedIPs: string[]
    whitelistedIPs: string[]
    suspiciousPatterns: RegExp[]
    enabled: boolean
  } {
    return {
      blacklistedIPs: [...this.ddosConfig.blacklist],
      whitelistedIPs: [...this.ddosConfig.whitelist],
      suspiciousPatterns: [...this.ddosConfig.suspiciousPatterns],
      enabled: this.ddosConfig.enabled
    }
  }

  // Shutdown service
  shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.stores.clear()
  }
}

// Pre-configured rate limiters for common use cases
export const rateLimiters = {
  // Strict rate limiting for auth endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  } as RateLimitConfig,

  // Moderate rate limiting for API endpoints
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  } as RateLimitConfig,

  // Lenient rate limiting for public pages
  public: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 500, // 500 requests per minute
    skipSuccessfulRequests: false,
    skipFailedRequests: false
  } as RateLimitConfig
}

// Export singleton instance
export const rateLimitService = new RateLimitService()
export default rateLimitService