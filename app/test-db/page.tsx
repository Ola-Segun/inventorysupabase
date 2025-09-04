"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

interface TestResult {
  success?: boolean
  error?: string
  database?: {
    connection: string
    usersTable: string
    storesTable: string
    organizationsTable: string
  }
  auth?: {
    user: any
    error?: string
  }
  data?: {
    users: number
    stores: number
    organizations: number
    sampleUsers: any[]
    sampleStores: any[]
    sampleOrganizations: any[]
  }
}

export default function TestDatabasePage() {
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testDatabase = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Test failed')
      }

      setResult(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testDatabase()
  }, [])

  const getStatusIcon = (status: string) => {
    if (status === 'OK') return <CheckCircle className="h-4 w-4 text-green-500" />
    if (status === 'No data') return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (status: string) => {
    if (status === 'OK') return 'bg-green-50 text-green-700 border-green-200'
    if (status === 'No data') return 'bg-yellow-50 text-yellow-700 border-yellow-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Test</h1>
          <p className="text-muted-foreground">Test database connection and data integrity</p>
        </div>
        <Button onClick={testDatabase} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
          {loading ? 'Testing...' : 'Run Test'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-6">
          {/* Database Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Status
              </CardTitle>
              <CardDescription>Connection and table availability</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Connection:</span>
                  <Badge className={getStatusColor(result.database?.connection || 'Error')}>
                    {getStatusIcon(result.database?.connection || 'Error')}
                    {result.database?.connection || 'Error'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Users:</span>
                  <Badge className={getStatusColor(result.database?.usersTable || 'Error')}>
                    {getStatusIcon(result.database?.usersTable || 'Error')}
                    {result.database?.usersTable || 'Error'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Stores:</span>
                  <Badge className={getStatusColor(result.database?.storesTable || 'Error')}>
                    {getStatusIcon(result.database?.storesTable || 'Error')}
                    {result.database?.storesTable || 'Error'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Organizations:</span>
                  <Badge className={getStatusColor(result.database?.organizationsTable || 'Error')}>
                    {getStatusIcon(result.database?.organizationsTable || 'Error')}
                    {result.database?.organizationsTable || 'Error'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authentication Status */}
          <Card>
            <CardHeader>
              <CardTitle>Authentication Status</CardTitle>
              <CardDescription>Current user authentication state</CardDescription>
            </CardHeader>
            <CardContent>
              {result.auth?.user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Authenticated</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>ID:</strong> {result.auth.user.id}</p>
                    <p><strong>Email:</strong> {result.auth.user.email}</p>
                    <p><strong>Role:</strong> {result.auth.user.role || 'Not set'}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="font-medium">Not Authenticated</span>
                  {result.auth?.error && (
                    <span className="text-sm text-muted-foreground">({result.auth.error})</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Data Summary</CardTitle>
              <CardDescription>Records found in each table</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{result.data?.users || 0}</div>
                  <div className="text-sm text-muted-foreground">Users</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{result.data?.stores || 0}</div>
                  <div className="text-sm text-muted-foreground">Stores</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{result.data?.organizations || 0}</div>
                  <div className="text-sm text-muted-foreground">Organizations</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sample Data */}
          {result.data?.sampleUsers && result.data.sampleUsers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Users</CardTitle>
                <CardDescription>First few user records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.data.sampleUsers.map((user: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="text-sm">
                        <strong>ID:</strong> {user.id}<br />
                        <strong>Email:</strong> {user.email}<br />
                        <strong>Name:</strong> {user.name || 'Not set'}<br />
                        <strong>Role:</strong> {user.role || 'Not set'}<br />
                        <strong>Store ID:</strong> {user.store_id || 'Not set'}<br />
                        <strong>Organization ID:</strong> {user.organization_id || 'Not set'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {result.data?.sampleStores && result.data.sampleStores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sample Stores</CardTitle>
                <CardDescription>First few store records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.data.sampleStores.map((store: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="text-sm">
                        <strong>ID:</strong> {store.id}<br />
                        <strong>Name:</strong> {store.name}<br />
                        <strong>Owner ID:</strong> {store.owner_id}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}