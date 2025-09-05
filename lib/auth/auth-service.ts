/**
 * Centralized Authentication Service
 * Provides a unified interface for all authentication operations
 * with comprehensive security, logging, and monitoring
 */

import { createClient } from '@supabase/supabase-js'
import { validatePassword, DEFAULT_PASSWORD_POLICY, type PasswordValidationResult } from './passwordPolicy'
import type { User, Session } from '@supabase/supabase-js'

// Types
export interface AuthUser {
  id: string
  email: string
  name: string
  role: 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'
  status: 'active' | 'inactive' | 'suspended'
  store_id?: string
  organization_id?: string
  is_store_owner?: boolean
  permissions?: string[]
  last_login_at?: string
  login_attempts?: number
  locked_until?: string
}

export interface LoginAttempt {
  email: string
  ip_address: string
  user_agent: string
  success: boolean
  timestamp: Date
  failure_reason?: string
}

export interface AuthMetrics {
  total_logins: number
  failed_logins: number
  account_lockouts: number
  password_resets: number
  active_sessions: number
  unique_users_today: number
}

export interface SecurityEvent {
  type: 'login_success' | 'login_failure' | 'account_locked' | 'password_reset' | 'session_created' | 'session_destroyed' | 'permission_denied' | 'user_created'
  user_id?: string
  email?: string
  ip_address: string
  user_agent: string
  metadata?: Record<string, any>
  timestamp: Date
}

class AuthService {
  private supabase: any
  private metrics: AuthMetrics
  private securityEvents: SecurityEvent[] = []
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>()

  constructor() {
    // Use anon key for client-side operations, service role key only in server-side API routes
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    this.metrics = {
      total_logins: 0,
      failed_logins: 0,
      account_lockouts: 0,
      password_resets: 0,
      active_sessions: 0,
      unique_users_today: 0
    }

    // Initialize metrics from database
    this.initializeMetrics()
  }

  private async initializeMetrics() {
    try {
      // Get today's metrics from audit logs
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: loginEvents } = await this.supabase
        .from('audit_logs')
        .select('action, created_at')
        .gte('created_at', today.toISOString())
        .in('action', ['login_success', 'login_failed'])

      if (loginEvents) {
        this.metrics.total_logins = loginEvents.filter((e: any) => e.action === 'login_success').length
        this.metrics.failed_logins = loginEvents.filter((e: any) => e.action === 'login_failed').length
      }
    } catch (error) {
      console.error('Failed to initialize auth metrics:', error)
    }
  }

  // Rate limiting
  private checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000): boolean {
    const now = Date.now()
    const key = `${identifier}_rate_limit`

    const existing = this.rateLimitCache.get(key)

    if (!existing || now > existing.resetTime) {
      this.rateLimitCache.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (existing.count >= maxAttempts) {
      return false
    }

    existing.count++
    return true
  }

  private getClientIP(request: Request): string {
    return (
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown'
    )
  }

  private getUserAgent(request: Request): string {
    return request.headers.get('user-agent') || 'unknown'
  }

  // Authentication methods - moved to server-side API routes for security
  // This method is now handled by /api/auth/login to prevent service role key exposure
  async authenticateUser(): Promise<never> {
    throw new Error('authenticateUser() has been moved to server-side API routes for security. Use /api/auth/login instead.')
  }

  async validatePasswordStrength(password: string, personalInfo: string[] = []): Promise<PasswordValidationResult> {
    return validatePassword(password, DEFAULT_PASSWORD_POLICY, personalInfo)
  }

  // User creation - moved to server-side API routes for security
  // This method is now handled by /api/auth/signup to prevent service role key exposure
  async createUser(): Promise<never> {
    throw new Error('createUser() has been moved to server-side API routes for security. Use /api/auth/signup instead.')
  }

  private getDefaultPermissions(role: AuthUser['role']): string[] {
    const rolePermissions: Record<string, string[]> = {
      super_admin: ['*'],
      admin: [
        'users.read', 'users.create', 'users.update', 'users.delete',
        'products.*', 'orders.*', 'reports.*', 'settings.*'
      ],
      manager: [
        'products.*', 'orders.*', 'customers.*', 'reports.read'
      ],
      cashier: [
        'products.read', 'orders.*', 'customers.*'
      ],
      seller: [
        'products.read', 'orders.create', 'customers.read'
      ]
    }
    return rolePermissions[role] || []
  }

  async checkPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('role, permissions, status')
        .eq('id', userId)
        .single()

      if (!user || user.status !== 'active') {
        return false
      }

      // Super admin has all permissions
      if (user.role === 'super_admin') {
        return true
      }

      // Check specific permissions
      const userPermissions = user.permissions || []
      return userPermissions.includes(permission) || userPermissions.includes('*')
    } catch (error) {
      console.error('Permission check error:', error)
      return false
    }
  }

  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      this.securityEvents.push(event)

      // Keep only last 1000 events in memory
      if (this.securityEvents.length > 1000) {
        this.securityEvents = this.securityEvents.slice(-1000)
      }

      // Log to database
      await this.supabase.rpc('log_audit_event', {
        p_action: event.type,
        p_table_name: 'auth_events',
        p_record_id: event.user_id,
        p_old_values: null,
        p_new_values: {
          email: event.email,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          metadata: event.metadata
        }
      })
    } catch (error) {
      console.error('Failed to log security event:', error)
    }
  }

  getMetrics(): AuthMetrics {
    return { ...this.metrics }
  }

  getSecurityEvents(hours: number = 24): SecurityEvent[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000)
    return this.securityEvents.filter(event => event.timestamp > cutoff)
  }

  async getActiveSessions(): Promise<any[]> {
    try {
      // This would integrate with your session management system
      const { data } = await this.supabase
        .from('user_sessions')
        .select('*')
        .eq('active', true)

      return data || []
    } catch (error) {
      console.error('Failed to get active sessions:', error)
      return []
    }
  }

  async terminateSession(sessionId: string, request: Request): Promise<boolean> {
    try {
      await this.supabase
        .from('user_sessions')
        .update({ active: false, terminated_at: new Date().toISOString() })
        .eq('id', sessionId)

      await this.logSecurityEvent({
        type: 'session_destroyed',
        ip_address: this.getClientIP(request),
        user_agent: this.getUserAgent(request),
        metadata: { session_id: sessionId },
        timestamp: new Date()
      })

      return true
    } catch (error) {
      console.error('Failed to terminate session:', error)
      return false
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
export default authService