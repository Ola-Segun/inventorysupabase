/**
 * Security Monitoring and Alerting Service
 * Monitors security events and provides real-time alerts
 */

import { auditService } from './audit-service'
import { rateLimitService } from './rate-limit'

export interface AlertRule {
  id: string
  name: string
  description: string
  condition: (event: any) => boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  cooldown: number // minutes between alerts for same rule
  channels: AlertChannel[]
  metadata?: Record<string, any>
}

export interface AlertChannel {
  type: 'email' | 'webhook' | 'slack' | 'console'
  config: Record<string, any>
}

export interface SecurityAlert {
  id: string
  ruleId: string
  ruleName: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  details: Record<string, any>
  timestamp: Date
  resolved: boolean
  resolvedAt?: Date
  acknowledged: boolean
  acknowledgedAt?: Date
  acknowledgedBy?: string
}

export interface MonitoringConfig {
  enableRealTimeMonitoring: boolean
  alertCooldownMinutes: number
  maxAlertsPerHour: number
  retentionDays: number
  channels: AlertChannel[]
}

class SecurityMonitor {
  private rules: Map<string, AlertRule> = new Map()
  private alerts: SecurityAlert[] = []
  private alertCooldowns: Map<string, Date> = new Map()
  private monitoringConfig: MonitoringConfig
  private monitoringInterval: NodeJS.Timeout | null = null

  constructor(config: Partial<MonitoringConfig> = {}) {
    this.monitoringConfig = {
      enableRealTimeMonitoring: true,
      alertCooldownMinutes: 15,
      maxAlertsPerHour: 50,
      retentionDays: 30,
      channels: [
        {
          type: 'console',
          config: {}
        }
      ],
      ...config
    }

    this.initializeDefaultRules()
    this.startMonitoring()
  }

  private initializeDefaultRules(): void {
    // Brute force attack detection
    this.addRule({
      id: 'brute_force_login',
      name: 'Brute Force Login Attempts',
      description: 'Multiple failed login attempts from same IP',
      condition: (event) => {
        return event.action === 'login_failure' &&
               event.metadata?.attempts > 5
      },
      severity: 'high',
      enabled: true,
      cooldown: 30,
      channels: this.monitoringConfig.channels
    })

    // Account lockout alert
    this.addRule({
      id: 'account_lockout',
      name: 'Account Lockout',
      description: 'User account has been locked due to failed attempts',
      condition: (event) => event.action === 'account_locked',
      severity: 'medium',
      enabled: true,
      cooldown: 60,
      channels: this.monitoringConfig.channels
    })

    // Suspicious activity detection
    this.addRule({
      id: 'suspicious_activity',
      name: 'Suspicious Activity Detected',
      description: 'Suspicious patterns detected in requests',
      condition: (event) => event.action === 'suspicious_activity',
      severity: 'high',
      enabled: true,
      cooldown: 15,
      channels: this.monitoringConfig.channels
    })

    // Unauthorized access attempts
    this.addRule({
      id: 'unauthorized_access',
      name: 'Unauthorized Access Attempt',
      description: 'Attempted access to restricted resources',
      condition: (event) => event.action === 'unauthorized_access',
      severity: 'high',
      enabled: true,
      cooldown: 10,
      channels: this.monitoringConfig.channels
    })

    // Data breach attempt detection
    this.addRule({
      id: 'data_breach_attempt',
      name: 'Data Breach Attempt',
      description: 'Potential data breach or exfiltration attempt',
      condition: (event) => event.action === 'data_breach_attempt',
      severity: 'critical',
      enabled: true,
      cooldown: 5,
      channels: this.monitoringConfig.channels
    })

    // Rate limit violations
    this.addRule({
      id: 'rate_limit_violation',
      name: 'Rate Limit Violation',
      description: 'High number of requests violating rate limits',
      condition: (event) => {
        const rateLimitStats = rateLimitService.getAllEntries('security')
        const violations = rateLimitStats.filter(entry =>
          entry.entry.count > 10 && entry.entry.blockedUntil
        )
        return violations.length > 5
      },
      severity: 'medium',
      enabled: true,
      cooldown: 20,
      channels: this.monitoringConfig.channels
    })

    // Unusual login patterns
    this.addRule({
      id: 'unusual_login_pattern',
      name: 'Unusual Login Pattern',
      description: 'Login from unusual location or device',
      condition: (event) => {
        return event.action === 'login_success' &&
               event.metadata?.unusual_location === true
      },
      severity: 'low',
      enabled: true,
      cooldown: 60,
      channels: this.monitoringConfig.channels
    })
  }

  private startMonitoring(): void {
    if (!this.monitoringConfig.enableRealTimeMonitoring) return

    // Monitor every 30 seconds
    this.monitoringInterval = setInterval(() => {
      this.performMonitoringChecks()
    }, 30000)
  }

  private async performMonitoringChecks(): Promise<void> {
    try {
      // Get recent security events
      const recentEvents = await auditService.queryEvents({
        category: 'security',
        start_date: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        limit: 100
      })

      // Check each rule against recent events
      for (const event of recentEvents) {
        await this.checkRules(event)
      }

      // Clean up old alerts
      this.cleanupOldAlerts()

    } catch (error) {
      console.error('Security monitoring check failed:', error)
    }
  }

  private async checkRules(event: any): Promise<void> {
    for (const [ruleId, rule] of this.rules) {
      if (!rule.enabled) continue

      // Check cooldown
      const lastAlert = this.alertCooldowns.get(ruleId)
      if (lastAlert) {
        const cooldownEnd = new Date(lastAlert.getTime() + rule.cooldown * 60 * 1000)
        if (new Date() < cooldownEnd) continue
      }

      // Check condition
      if (rule.condition(event)) {
        await this.triggerAlert(rule, event)
        break // Only trigger one alert per event
      }
    }
  }

  private async triggerAlert(rule: AlertRule, event: any): Promise<void> {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `${rule.name}: ${rule.description}`,
      details: {
        event,
        rule,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date(),
      resolved: false,
      acknowledged: false
    }

    // Add to alerts list
    this.alerts.push(alert)

    // Set cooldown
    this.alertCooldowns.set(rule.id, new Date())

    // Send alerts through configured channels
    await this.sendAlerts(alert, rule.channels)

    // Log the alert
    await auditService.log({
      action: 'security_alert_triggered',
      table_name: 'security',
      metadata: {
        alert_id: alert.id,
        rule_id: rule.id,
        severity: rule.severity,
        message: alert.message
      },
      severity: rule.severity,
      category: 'security'
    })

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(-1000)
    }
  }

  private async sendAlerts(alert: SecurityAlert, channels: AlertChannel[]): Promise<void> {
    for (const channel of channels) {
      try {
        switch (channel.type) {
          case 'console':
            this.sendConsoleAlert(alert)
            break
          case 'email':
            await this.sendEmailAlert(alert, channel.config)
            break
          case 'webhook':
            await this.sendWebhookAlert(alert, channel.config)
            break
          case 'slack':
            await this.sendSlackAlert(alert, channel.config)
            break
        }
      } catch (error) {
        console.error(`Failed to send alert via ${channel.type}:`, error)
      }
    }
  }

  private sendConsoleAlert(alert: SecurityAlert): void {
    const color = {
      low: '\x1b[32m',     // Green
      medium: '\x1b[33m',  // Yellow
      high: '\x1b[31m',    // Red
      critical: '\x1b[35m' // Magenta
    }[alert.severity] || '\x1b[0m'

    console.log(`${color}🚨 SECURITY ALERT [${alert.severity.toUpperCase()}]: ${alert.message}\x1b[0m`)
    console.log(`   Time: ${alert.timestamp.toISOString()}`)
    console.log(`   Rule: ${alert.ruleName}`)
    console.log(`   Details:`, JSON.stringify(alert.details, null, 2))
  }

  private async sendEmailAlert(alert: SecurityAlert, config: any): Promise<void> {
    // Implementation would integrate with email service
    console.log(`📧 Email alert would be sent: ${alert.message}`)
    // TODO: Integrate with email service like SendGrid, AWS SES, etc.
  }

  private async sendWebhookAlert(alert: SecurityAlert, config: any): Promise<void> {
    if (!config.url) return

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': config.authorization || ''
        },
        body: JSON.stringify({
          alert,
          timestamp: alert.timestamp.toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`Webhook failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Webhook alert failed:', error)
    }
  }

  private async sendSlackAlert(alert: SecurityAlert, config: any): Promise<void> {
    if (!config.webhookUrl) return

    const slackMessage = {
      text: `🚨 Security Alert: ${alert.message}`,
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: `🚨 ${alert.severity.toUpperCase()} Security Alert`
          }
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${alert.ruleName}*\n${alert.message}`
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: `*Severity:* ${alert.severity}`
            },
            {
              type: 'mrkdwn',
              text: `*Time:* ${alert.timestamp.toISOString()}`
            }
          ]
        }
      ]
    }

    try {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slackMessage)
      })

      if (!response.ok) {
        throw new Error(`Slack webhook failed: ${response.status}`)
      }
    } catch (error) {
      console.error('Slack alert failed:', error)
    }
  }

  // Public API methods
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule)
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId)
  }

  updateRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.rules.get(ruleId)
    if (!rule) return false

    this.rules.set(ruleId, { ...rule, ...updates })
    return true
  }

  getRules(): AlertRule[] {
    return Array.from(this.rules.values())
  }

  getAlerts(options: {
    resolved?: boolean
    acknowledged?: boolean
    severity?: SecurityAlert['severity']
    limit?: number
  } = {}): SecurityAlert[] {
    let filtered = this.alerts

    if (options.resolved !== undefined) {
      filtered = filtered.filter(alert => alert.resolved === options.resolved)
    }

    if (options.acknowledged !== undefined) {
      filtered = filtered.filter(alert => alert.acknowledged === options.acknowledged)
    }

    if (options.severity) {
      filtered = filtered.filter(alert => alert.severity === options.severity)
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit)
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  acknowledgeAlert(alertId: string, acknowledgedBy?: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.acknowledged = true
    alert.acknowledgedAt = new Date()
    alert.acknowledgedBy = acknowledgedBy

    return true
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (!alert) return false

    alert.resolved = true
    alert.resolvedAt = new Date()

    return true
  }

  private cleanupOldAlerts(): void {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - this.monitoringConfig.retentionDays)

    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffDate)
  }

  getStats(): {
    totalAlerts: number
    activeAlerts: number
    resolvedAlerts: number
    acknowledgedAlerts: number
    alertsBySeverity: Record<string, number>
    recentAlerts: SecurityAlert[]
  } {
    const totalAlerts = this.alerts.length
    const activeAlerts = this.alerts.filter(a => !a.resolved).length
    const resolvedAlerts = this.alerts.filter(a => a.resolved).length
    const acknowledgedAlerts = this.alerts.filter(a => a.acknowledged).length

    const alertsBySeverity = this.alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const recentAlerts = this.alerts
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)

    return {
      totalAlerts,
      activeAlerts,
      resolvedAlerts,
      acknowledgedAlerts,
      alertsBySeverity,
      recentAlerts
    }
  }

  updateConfig(newConfig: Partial<MonitoringConfig>): void {
    this.monitoringConfig = { ...this.monitoringConfig, ...newConfig }
  }

  shutdown(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor()
export default securityMonitor