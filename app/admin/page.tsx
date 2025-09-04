"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/page-header"
import {
  Building2,
  Users,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  Sparkles,
  Zap,
  BarChart3,
  Settings,
  UserCheck
} from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import type { Organization } from "@/contexts/SupabaseAuthContext"

interface PlatformStats {
  totalOrganizations: number
  activeOrganizations: number
  totalUsers: number
  tierBreakdown: { [key: string]: number }
  recentOrganizations: Organization[]
}

export default function SuperAdminDashboard() {
  const router = useRouter()
  const { isSuperAdmin, getAllOrganizations, getPlatformStats } = useSupabaseAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/auth')
      return
    }

    loadDashboardData()
  }, [isSuperAdmin, router])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [orgs, stats] = await Promise.all([
        getAllOrganizations(),
        getPlatformStats()
      ])

      setOrganizations(orgs)
      setPlatformStats(stats)
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return <Crown className="h-4 w-4 text-purple-500" />
      case 'pro':
        return <Sparkles className="h-4 w-4 text-blue-500" />
      default:
        return <Zap className="h-4 w-4 text-gray-500" />
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
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Super Admin Dashboard"
        description="Platform-wide management and analytics"
      />

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Platform Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Organizations</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalOrganizations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats?.activeOrganizations || 0} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Across all organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {organizations.filter(org => org.subscription_status === 'trialing').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Organizations in trial
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0</div>
            <p className="text-xs text-muted-foreground">
              Monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Tier Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Distribution</CardTitle>
          <CardDescription>Breakdown of organizations by subscription tier</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {platformStats?.tierBreakdown && Object.entries(platformStats.tierBreakdown).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getTierIcon(tier)}
                  <div>
                    <div className="font-medium capitalize">{tier}</div>
                    <div className="text-sm text-muted-foreground">{count} organizations</div>
                  </div>
                </div>
                <div className="text-2xl font-bold">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Organizations Management */}
      <Card>
        <CardHeader>
          <CardTitle>Organization Management</CardTitle>
          <CardDescription>Manage all organizations on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {organizations.slice(0, 10).map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">{org.slug}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getTierIcon(org.subscription_tier)}
                    <span className="text-sm capitalize">{org.subscription_tier}</span>
                  </div>
                  {getStatusBadge(org.subscription_status)}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/organizations/${org.id}`)}
                  >
                    Manage
                  </Button>
                </div>
              </div>
            ))}

            {organizations.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" onClick={() => router.push('/admin/organizations')}>
                  View All Organizations ({organizations.length})
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/admin/organizations')}
            >
              <Building2 className="h-6 w-6" />
              Manage Organizations
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/admin/users')}
            >
              <Users className="h-6 w-6" />
              Manage Users
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/admin/analytics')}
            >
              <BarChart3 className="h-6 w-6" />
              Platform Analytics
            </Button>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2"
              onClick={() => router.push('/admin/settings')}
            >
              <Settings className="h-6 w-6" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}