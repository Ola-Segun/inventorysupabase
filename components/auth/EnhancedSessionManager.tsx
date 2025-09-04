"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Clock,
  Shield,
  LogOut,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface Session {
  id: string
  device_type: string
  device_name: string
  ip_address: string
  location: string
  last_active: string
  is_current: boolean
}

export function EnhancedSessionManager() {
  const { user, getActiveSessions, terminateSession } = useSupabaseAuth()
  const router = useRouter()

  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [terminating, setTerminating] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const sessionData = await getActiveSessions()
      setSessions(sessionData || [])
    } catch (error: any) {
      setError('Failed to load sessions')
      console.error('Load sessions error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTerminateSession = async (sessionId: string) => {
    setTerminating(sessionId)
    setError('')

    try {
      await terminateSession(sessionId)
      await loadSessions() // Reload sessions

      // If terminated current session, redirect to login
      const currentSession = sessions.find(s => s.is_current)
      if (currentSession && currentSession.id === sessionId) {
        router.push('/login?message=session_terminated')
      }
    } catch (error: any) {
      setError('Failed to terminate session')
      console.error('Terminate session error:', error)
    } finally {
      setTerminating(null)
    }
  }

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
      case 'phone':
        return <Smartphone className="h-4 w-4" />
      case 'tablet':
        return <Tablet className="h-4 w-4" />
      default:
        return <Monitor className="h-4 w-4" />
    }
  }

  const formatLastActive = (lastActive: string) => {
    const date = new Date(lastActive)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Active Sessions
          </CardTitle>
          <CardDescription>Loading your active sessions...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions across different devices
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active sessions found</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div key={session.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {getDeviceIcon(session.device_type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {session.device_name || `${session.device_type} Device`}
                      </span>
                      {session.is_current && (
                        <Badge variant="secondary" className="text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {session.location || session.ip_address}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatLastActive(session.last_active)}
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTerminateSession(session.id)}
                  disabled={terminating === session.id || session.is_current}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {terminating === session.id ? (
                    'Terminating...'
                  ) : (
                    <>
                      <LogOut className="h-3 w-3 mr-1" />
                      {session.is_current ? 'Current' : 'Terminate'}
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))
        )}

        <Separator />

        <div className="text-sm text-gray-600">
          <p className="font-medium mb-2">Security Tips:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Regularly review and terminate unused sessions</li>
            <li>Use strong, unique passwords for your account</li>
            <li>Enable two-factor authentication when available</li>
            <li>Log out from shared or public devices</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}