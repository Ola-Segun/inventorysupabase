"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { formatDistanceToNow } from 'date-fns'

interface Session {
  id: string
  user_id: string
  device_info: {
    browser: string
    platform: string
    userAgent: string
  }
  ip_address: string
  created_at: string
  last_activity: string
  is_active: boolean
}

export function SessionManager() {
  const { getActiveSessions, terminateSession, user } = useSupabaseAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [terminatingId, setTerminatingId] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const sessionData = await getActiveSessions()
      setSessions(sessionData)
    } catch (error: any) {
      setError(error.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to terminate this session?')) {
      return
    }

    setTerminatingId(sessionId)

    try {
      await terminateSession(sessionId)
      // Remove the terminated session from the list
      setSessions(sessions.filter(session => session.id !== sessionId))
    } catch (error: any) {
      setError(error.message || 'Failed to terminate session')
    } finally {
      setTerminatingId(null)
    }
  }

  const getDeviceIcon = (platform: string) => {
    if (platform.toLowerCase().includes('mobile') || platform.toLowerCase().includes('android') || platform.toLowerCase().includes('ios')) {
      return <Smartphone className="h-4 w-4" />
    }
    if (platform.toLowerCase().includes('tablet') || platform.toLowerCase().includes('ipad')) {
      return <Tablet className="h-4 w-4" />
    }
    return <Monitor className="h-4 w-4" />
  }

  const getBrowserIcon = (browser: string) => {
    // You could add specific browser icons here
    return <Globe className="h-4 w-4" />
  }

  const isCurrentSession = (session: Session) => {
    // This is a simplified check - in a real app you'd compare session tokens
    return session.last_activity === sessions
      .filter(s => s.is_active)
      .sort((a, b) => new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime())[0]?.last_activity
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            Loading sessions...
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>
              Manage your active sessions across devices
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadSessions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No active sessions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.device_info?.platform || 'Unknown')}
                    {getBrowserIcon(session.device_info?.browser || 'Unknown')}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {session.device_info?.browser || 'Unknown Browser'} on {session.device_info?.platform || 'Unknown Device'}
                      </p>
                      {isCurrentSession(session) && (
                        <Badge variant="outline" className="text-xs">
                          Current Session
                        </Badge>
                      )}
                      {!session.is_active && (
                        <Badge variant="secondary" className="text-xs">
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.ip_address}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active {formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Started {formatDistanceToNow(new Date(session.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {session.is_active && (
                    <div className="h-2 w-2 bg-green-500 rounded-full" title="Active" />
                  )}

                  {!isCurrentSession(session) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={terminatingId === session.id}
                    >
                      {terminatingId === session.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <LogOut className="h-4 w-4 mr-2" />
                          Terminate
                        </>
                      )}
                    </Button>
                  )}

                  {isCurrentSession(session) && (
                    <Badge variant="outline">Current</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Tip:</strong> Regularly review and terminate suspicious sessions.
            If you see unfamiliar devices, change your password immediately.
          </AlertDescription>
        </Alert>

        <div className="text-sm text-muted-foreground">
          <p><strong>Total Sessions:</strong> {sessions.length}</p>
          <p><strong>Active Sessions:</strong> {sessions.filter(s => s.is_active).length}</p>
        </div>
      </CardContent>
    </Card>
  )
}