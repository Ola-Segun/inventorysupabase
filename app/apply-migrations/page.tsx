"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Database, CheckCircle, XCircle, AlertTriangle, Play } from "lucide-react"

interface MigrationResult {
  success?: boolean
  message?: string
  error?: string
  results?: Array<{
    step: string
    status: 'success' | 'error'
    message: string
  }>
  summary?: {
    total: number
    successful: number
    failed: number
  }
}

export default function ApplyMigrationsPage() {
  const [result, setResult] = useState<MigrationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const applyMigrations = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/apply-migrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed')
      }

      setResult(data)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-green-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusColor = (status: string) => {
    if (status === 'success') return 'bg-green-50 text-green-700 border-green-200'
    return 'bg-red-50 text-red-700 border-red-200'
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Apply Database Migrations</h1>
          <p className="text-muted-foreground">Fix database schema issues and apply missing features</p>
        </div>
        <Button onClick={applyMigrations} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Play className="h-4 w-4 mr-2" />}
          {loading ? 'Applying...' : 'Apply Migrations'}
        </Button>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> This will apply database schema changes. Make sure you have a backup of your data.
          Only run this if you're experiencing issues with user profile loading or database connectivity.
        </AlertDescription>
      </Alert>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-6">
          {/* Overall Result */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                Migration Result
              </CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            {result.summary && (
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold">{result.summary.total}</div>
                    <div className="text-sm text-muted-foreground">Total Steps</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{result.summary.successful}</div>
                    <div className="text-sm text-muted-foreground">Successful</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{result.summary.failed}</div>
                    <div className="text-sm text-muted-foreground">Failed</div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Detailed Results */}
          {result.results && result.results.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
                <CardDescription>Step-by-step migration results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.results.map((stepResult, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                      <div className="mt-0.5">
                        {getStatusIcon(stepResult.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{stepResult.step}</span>
                          <Badge className={getStatusColor(stepResult.status)}>
                            {stepResult.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{stepResult.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          {result.success && (
            <Card>
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>What to do after successful migration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">1. Test the Application</h4>
                  <p className="text-sm text-muted-foreground">
                    Go back to your application and check if user profiles are now loading correctly.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">2. Check Database Test Page</h4>
                  <p className="text-sm text-muted-foreground">
                    Visit <code className="bg-muted px-1 py-0.5 rounded">/test-db</code> to verify database connectivity and data integrity.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">3. Test User Management</h4>
                  <p className="text-sm text-muted-foreground">
                    Try accessing the admin user management page to ensure all features work properly.
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => window.location.href = '/test-db'}>
                    <Database className="h-4 w-4 mr-2" />
                    Test Database
                  </Button>
                  <Button variant="outline" onClick={() => window.location.href = '/admin/users'}>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Test User Management
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}