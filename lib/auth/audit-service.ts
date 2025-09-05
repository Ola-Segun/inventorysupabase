/**
 * Comprehensive Audit Logging Service
 * Handles all security and operational audit logging with advanced features
 */

import { createClient } from '@supabase/supabase-js'

export interface AuditEvent {
  id?: string
  user_id?: string
  organization_id?: string
  store_id?: string
  action: string
  table_name?: string
  record_id?: string
  old_values?: Record<string, any>
  new_values?: Record<string, any>
  ip_address?: string
  user_agent?: string
  session_id?: string
  metadata?: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'data' | 'security' | 'system' | 'business'
  created_at?: string
}

export interface AuditQuery {
  user_id?: string
  organization_id?: string
  action?: string
  table_name?: string
  severity?: AuditEvent['severity']
  category?: AuditEvent['category']
  start_date?: Date
  end_date?: Date
  limit?: number
  offset?: number
}

export interface AuditStats {
  total_events: number
  events_today: number
  events_this_week: number
  events_by_severity: Record<string, number>
  events_by_category: Record<string, number>
  top_actions: Array<{ action: string; count: number }>
  recent_security_events: AuditEvent[]
}

class AuditService {
  private supabase: any
  private eventQueue: AuditEvent[] = []
  private isProcessing = false
  private batchSize = 10
  private flushInterval: NodeJS.Timeout | null = null

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Start periodic flush
    this.startPeriodicFlush()
  }

  private startPeriodicFlush() {
    // Flush every 30 seconds
    this.flushInterval = setInterval(() => {
      this.flushQueue()
    }, 30000)
  }

  private async flushQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return
    }

    this.isProcessing = true
    const eventsToProcess = this.eventQueue.splice(0, this.batchSize)

    try {
      const { error } = await this.supabase
        .from('audit_logs')
        .insert(eventsToProcess.map(event => ({
          user_id: event.user_id,
          organization_id: event.organization_id,
          store_id: event.store_id,
          action: event.action,
          table_name: event.table_name,
          record_id: event.record_id,
          old_values: event.old_values,
          new_values: event.new_values,
          ip_address: event.ip_address,
          user_agent: event.user_agent,
          session_id: event.session_id,
          metadata: { ...event.metadata, severity: event.severity, category: event.category },
          created_at: event.created_at || new Date().toISOString()
        })))

      if (error) {
        console.error('Failed to flush audit events:', error)
        // Re-queue failed events
        this.eventQueue.unshift(...eventsToProcess)
      }
    } catch (error) {
      console.error('Audit flush error:', error)
      // Re-queue failed events
      this.eventQueue.unshift(...eventsToProcess)
    } finally {
      this.isProcessing = false
    }
  }

  // Log an audit event
  async log(event: Omit<AuditEvent, 'id' | 'created_at'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      created_at: new Date().toISOString()
    }

    // Add to queue
    this.eventQueue.push(auditEvent)

    // For critical events, flush immediately
    if (event.severity === 'critical') {
      await this.flushQueue()
    }

    // For high severity events, also log to console
    if (event.severity === 'high' || event.severity === 'critical') {
      console.warn(`🔴 AUDIT [${event.severity.toUpperCase()}]: ${event.action}`, {
        user_id: event.user_id,
        table_name: event.table_name,
        record_id: event.record_id,
        metadata: event.metadata
      })
    }
  }

  // Log authentication events
  async logAuth(event: {
    user_id?: string
    email?: string
    action: 'login_success' | 'login_failure' | 'logout' | 'password_change' | 'password_reset'
    ip_address: string
    user_agent: string
    session_id?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    const severity = event.action === 'login_failure' ? 'medium' :
                    event.action === 'password_reset' ? 'high' : 'low'

    await this.log({
      user_id: event.user_id,
      action: event.action,
      table_name: 'auth',
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      session_id: event.session_id,
      metadata: event.metadata,
      severity,
      category: 'auth'
    })
  }

  // Log data modification events
  async logDataChange(event: {
    user_id: string
    table_name: string
    record_id: string
    action: 'create' | 'update' | 'delete'
    old_values?: Record<string, any>
    new_values?: Record<string, any>
    ip_address?: string
    user_agent?: string
    metadata?: Record<string, any>
  }): Promise<void> {
    // Determine severity based on table and action
    const sensitiveTables = ['users', 'organizations', 'stores', 'audit_logs']
    const severity = sensitiveTables.includes(event.table_name) ? 'high' : 'low'

    await this.log({
      user_id: event.user_id,
      action: event.action,
      table_name: event.table_name,
      record_id: event.record_id,
      old_values: event.old_values,
      new_values: event.new_values,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      metadata: event.metadata,
      severity,
      category: 'data'
    })
  }

  // Log security events
  async logSecurity(event: {
    user_id?: string
    action: 'suspicious_activity' | 'brute_force_attempt' | 'unauthorized_access' | 'data_breach_attempt'
    ip_address: string
    user_agent: string
    metadata: Record<string, any>
  }): Promise<void> {
    await this.log({
      user_id: event.user_id,
      action: event.action,
      table_name: 'security',
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      metadata: event.metadata,
      severity: 'critical',
      category: 'security'
    })
  }

  // Query audit events
  async queryEvents(query: AuditQuery): Promise<AuditEvent[]> {
    try {
      let supabaseQuery = this.supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (query.user_id) {
        supabaseQuery = supabaseQuery.eq('user_id', query.user_id)
      }

      if (query.organization_id) {
        supabaseQuery = supabaseQuery.eq('organization_id', query.organization_id)
      }

      if (query.action) {
        supabaseQuery = supabaseQuery.eq('action', query.action)
      }

      if (query.table_name) {
        supabaseQuery = supabaseQuery.eq('table_name', query.table_name)
      }

      if (query.severity) {
        supabaseQuery = supabaseQuery.eq('metadata->>severity', query.severity)
      }

      if (query.category) {
        supabaseQuery = supabaseQuery.eq('metadata->>category', query.category)
      }

      if (query.start_date) {
        supabaseQuery = supabaseQuery.gte('created_at', query.start_date.toISOString())
      }

      if (query.end_date) {
        supabaseQuery = supabaseQuery.lte('created_at', query.end_date.toISOString())
      }

      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit)
      }

      if (query.offset) {
        supabaseQuery = supabaseQuery.range(query.offset, (query.offset + (query.limit || 50)) - 1)
      }

      const { data, error } = await supabaseQuery

      if (error) {
        console.error('Audit query error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Audit query failed:', error)
      return []
    }
  }

  // Get audit statistics
  async getStats(organization_id?: string): Promise<AuditStats> {
    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      let baseQuery = this.supabase.from('audit_logs').select('*')

      if (organization_id) {
        baseQuery = baseQuery.eq('organization_id', organization_id)
      }

      // Get all events for stats
      const { data: allEvents, error: allError } = await baseQuery

      if (allError) {
        console.error('Audit stats error:', allError)
        return this.getEmptyStats()
      }

      const events: any[] = allEvents || []

      // Calculate statistics
      const total_events = events.length
      const events_today = events.filter((e: any) => new Date(e.created_at) >= today).length
      const events_this_week = events.filter((e: any) => new Date(e.created_at) >= weekAgo).length

      const events_by_severity = events.reduce((acc: Record<string, number>, event: any) => {
        const severity = event.metadata?.severity || 'low'
        acc[severity] = (acc[severity] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const events_by_category = events.reduce((acc: Record<string, number>, event: any) => {
        const category = event.metadata?.category || 'system'
        acc[category] = (acc[category] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const actionCounts = events.reduce((acc: Record<string, number>, event: any) => {
        acc[event.action] = (acc[event.action] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const top_actions = Object.entries(actionCounts)
        .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
        .slice(0, 10)
        .map(([action, count]: [string, number]) => ({ action, count }))

      const recent_security_events = events
        .filter((e: any) => e.metadata?.category === 'security')
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)

      return {
        total_events,
        events_today,
        events_this_week,
        events_by_severity,
        events_by_category,
        top_actions,
        recent_security_events
      }
    } catch (error) {
      console.error('Failed to get audit stats:', error)
      return this.getEmptyStats()
    }
  }

  private getEmptyStats(): AuditStats {
    return {
      total_events: 0,
      events_today: 0,
      events_this_week: 0,
      events_by_severity: {},
      events_by_category: {},
      top_actions: [],
      recent_security_events: []
    }
  }

  // Export audit data
  async exportAuditData(query: AuditQuery, format: 'json' | 'csv' = 'json'): Promise<string> {
    const events = await this.queryEvents({ ...query, limit: 10000 })

    if (format === 'csv') {
      const headers = ['timestamp', 'user_id', 'action', 'table_name', 'record_id', 'severity', 'category', 'ip_address']
      const csvData = [
        headers.join(','),
        ...events.map(event => [
          event.created_at,
          event.user_id || '',
          event.action,
          event.table_name || '',
          event.record_id || '',
          event.metadata?.severity || 'low',
          event.metadata?.category || 'system',
          event.ip_address || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n')

      return csvData
    }

    return JSON.stringify(events, null, 2)
  }

  // Cleanup old audit logs (keep last 90 days)
  async cleanupOldLogs(daysToKeep: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep)

      const { data, error } = await this.supabase
        .from('audit_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      if (error) {
        console.error('Audit cleanup error:', error)
        return 0
      }

      const deletedCount = data?.length || 0
      console.log(`Cleaned up ${deletedCount} old audit log entries`)

      return deletedCount
    } catch (error) {
      console.error('Audit cleanup failed:', error)
      return 0
    }
  }

  // Shutdown - flush remaining events
  async shutdown(): Promise<void> {
    if (this.flushInterval) {
      clearInterval(this.flushInterval)
      this.flushInterval = null
    }

    // Flush all remaining events
    while (this.eventQueue.length > 0) {
      await this.flushQueue()
    }
  }
}

// Export singleton instance
export const auditService = new AuditService()
export default auditService