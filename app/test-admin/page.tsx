"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Loader2, Shield, Users, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

interface PermissionTest {
  permission: string
  result: boolean | null
  error?: string
}

export default function TestAdminPage() {
  const { user, userProfile, hasPermission, getUserPermissions } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [permissionTests, setPermissionTests] = useState<PermissionTest[]>([])
  const [userPermissions, setUserPermissions] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  const testPermissions = [
    'users.read',
    'users.create',
    'users.update',
    'users.delete',
    'products.read',
    'products.create',
    'orders.read',
    'orders.create',
    'inventory.read',
    'reports.read',
    'settings.read',
    'audit.read'
  ]

  const runPermissionTests = async () => {
    if (!user) {
      setError('No user logged in')
      return
    }

    setLoading(true)
    setError(null)
    const results: PermissionTest[] = []

    for (const permission of testPermissions) {
      try {
        const result = await hasPermission(permission)
        results.push({ permission, result })
      } catch (error: any) {
        results.push({ permission, result: null, error: error.message })
      }
    }

    setPermissionTests(results)
    setLoading(false)
  }

  const loadUserPermissions = async () => {
    if (!user) return

    try {
      const permissions = await getUserPermissions()
      setUserPermissions(permissions || [])
    } catch (error: any) {
      setError(`Failed to load user permissions: ${error.message}`)
    }
  }

  useEffect(() => {
    if (user) {
      runPermissionTests()
      loadUserPermissions()
    }
  }, [user])

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must be logged in to test admin permissions. Please log in first.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Permission Test</h1>
          <p className="text-muted-foreground">Test admin permissions and access control</p>
        </div>
        <Button onClick={runPermissionTests} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Shield className="h-4 w-4 mr-2" />}
          {loading ? 'Testing...' : 'Run Tests'}
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current User
          </CardTitle>
          <CardDescription>User information and role</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">User ID</label>
              <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Badge variant={userProfile?.role === 'admin' ? 'default' : 'secondary'}>
                {userProfile?.role || 'Not loaded'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium">Store Owner</label>
              <Badge variant={userProfile?.is_store_owner ? 'default' : 'secondary'}>
                {userProfile?.is_store_owner ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
          {userProfile?.store_id && (
            <div>
              <label className="text-sm font-medium">Store ID</label>
              <p className="text-sm text-muted-foreground font-mono">{userProfile.store_id}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permission Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Permission Tests</CardTitle>
          <CardDescription>Test results for various permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {permissionTests.length === 0 ? (
            <p className="text-muted-foreground">No tests run yet. Click "Run Tests" to test permissions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {permissionTests.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-sm font-medium">{test.permission}</span>
                  <div className="flex items-center gap-2">
                    {test.result === null ? (
                      <Badge variant="destructive">Error</Badge>
                    ) : test.result ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Allowed
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="h-3 w-3 mr-1" />
                        Denied
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>All User Permissions</CardTitle>
          <CardDescription>Complete list of permissions for this user</CardDescription>
        </CardHeader>
        <CardContent>
          {userPermissions.length === 0 ? (
            <p className="text-muted-foreground">No permissions loaded or user has no permissions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {userPermissions.map((perm: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="text-sm font-medium">{perm.permission_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {perm.resource}.{perm.action}
                  </div>
                  {perm.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {perm.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expected Results */}
      <Card>
        <CardHeader>
          <CardTitle>Expected Results for Admin</CardTitle>
          <CardDescription>What permissions should be available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">users.read - Should be allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">users.create - Should be allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">products.read - Should be allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">orders.read - Should be allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">inventory.read - Should be allowed</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">reports.read - Should be allowed</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>If permissions are not working as expected</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Check Database Setup</h4>
            <p className="text-sm text-muted-foreground">
              Visit <code className="bg-muted px-1 py-0.5 rounded">/test-db</code> to verify database connectivity and schema.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">2. Apply Migrations</h4>
            <p className="text-sm text-muted-foreground">
              Visit <code className="bg-muted px-1 py-0.5 rounded">/apply-migrations</code> to ensure all database fixes are applied.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">3. Check User Profile</h4>
            <p className="text-sm text-muted-foreground">
              Ensure your user profile is properly loaded with correct role and store_id.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">4. Verify RLS Policies</h4>
            <p className="text-sm text-muted-foreground">
              The RLS policies should allow store owners to access users in their store.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}