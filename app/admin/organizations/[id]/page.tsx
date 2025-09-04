"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/page-header"
import {
  Building2,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Sparkles,
  Zap,
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Calendar,
  DollarSign
} from "lucide-react"
import { useSupabaseAuth, type Organization } from "@/contexts/SupabaseAuthContext"

interface OrganizationDetails extends Organization {
  userCount?: number
  productCount?: number
  orderCount?: number
  revenue?: number
}

export default function OrganizationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orgId = params?.id as string
  const { isSuperAdmin, getAllOrganizations, updateOrganizationStatus } = useSupabaseAuth()

  const [organization, setOrganization] = useState<OrganizationDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/auth')
      return
    }

    if (orgId) {
      loadOrganizationDetails()
    }
  }, [isSuperAdmin, orgId, router])

  const loadOrganizationDetails = async () => {
    try {
      setLoading(true)
      const organizations = await getAllOrganizations()
      const org = organizations.find(o => o.id === orgId)

      if (!org) {
        setError('Organization not found')
        return
      }

      // In a real implementation, you would fetch additional stats from the database
      // For now, we'll use mock data
      const orgDetails: OrganizationDetails = {
        ...org,
        userCount: Math.floor(Math.random() * 50) + 1, // Mock data
        productCount: Math.floor(Math.random() * 1000) + 10, // Mock data
        orderCount: Math.floor(Math.random() * 500) + 5, // Mock data
        revenue: Math.floor(Math.random() * 50000) + 1000 // Mock data
      }

      setOrganization(orgDetails)
    } catch (err: any) {
      setError(err.message || 'Failed to load organization details')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!organization) return

    try {
      setUpdating(true)
      await updateOrganizationStatus(organization.id, newStatus)
      setOrganization(prev => prev ? { ...prev, subscription_status: newStatus as any } : null)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to update organization status')
    } finally {
      setUpdating(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'pro':
        return <Sparkles className="h-5 w-5 text-blue-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
      case 'trialing':
        return <Badge variant="secondary">Trial</Badge>
      case 'canceled':
        return <Badge variant="destructive">Canceled</Badge>
      case 'past_due':
        return <Badge variant="destructive">Past Due</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization details...</p>
        </div>
      </div>
    )
  }

  if (!organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Organization Not Found</h2>
          <p className="text-muted-foreground">The requested organization could not be found.</p>
          <Button onClick={() => router.push('/admin/organizations')} className="mt-4">
            Back to Organizations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.push('/admin/organizations')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Organizations
        </Button>
        <div className="flex-1">
          <PageHeader
            title={organization.name}
            description={`Organization ID: ${organization.id}`}
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Organization Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            {getTierIcon(organization.subscription_tier)}
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusBadge(organization.subscription_status)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {organization.subscription_tier} plan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.userCount}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.productCount}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${organization.revenue?.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total revenue</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Organization Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Organization Name</Label>
                  <p className="text-sm text-muted-foreground">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Slug</Label>
                  <p className="text-sm text-muted-foreground">{organization.slug}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(organization.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(organization.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Plan</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTierIcon(organization.subscription_tier)}
                    <span className="capitalize">{organization.subscription_tier}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    {getStatusBadge(organization.subscription_status)}
                  </div>
                </div>
                {organization.trial_ends_at && (
                  <div>
                    <Label className="text-sm font-medium">Trial Ends</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(organization.trial_ends_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Administrative actions for this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('active')}
                  disabled={updating || organization.subscription_status === 'active'}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate('canceled')}
                  disabled={updating || organization.subscription_status === 'canceled'}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Suspend
                </Button>
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Users belonging to this organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">User Management</h3>
                <p className="text-muted-foreground mb-4">
                  View and manage users for this organization
                </p>
                <Button>View Users</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Configure organization-specific settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Settings Management</h3>
                <p className="text-muted-foreground mb-4">
                  Modify organization settings and preferences
                </p>
                <Button>Edit Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing Information</CardTitle>
              <CardDescription>Subscription and payment details</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Billing Management</h3>
                <p className="text-muted-foreground mb-4">
                  View billing history and manage subscriptions
                </p>
                <Button>View Billing</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Missing import
import { Label } from "@/components/ui/label"