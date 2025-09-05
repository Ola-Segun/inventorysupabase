"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/page-header"
import {
  Building2,
  Search,
  Filter,
  Crown,
  Sparkles,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Users,
  Package
} from "lucide-react"
import { useSupabaseAuth, type Organization } from "@/contexts/SupabaseAuthContext"

export default function OrganizationsManagementPage() {
  const router = useRouter()
  const { isSuperAdmin, getAllOrganizations, updateOrganizationStatus } = useSupabaseAuth()
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [tierFilter, setTierFilter] = useState<string>("all")

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/auth')
      return
    }

    loadOrganizations()
  }, [isSuperAdmin, router])

  useEffect(() => {
    filterOrganizations()
  }, [organizations, searchTerm, statusFilter, tierFilter])

  const loadOrganizations = async () => {
    try {
      setLoading(true)
      const orgs = await getAllOrganizations()
      setOrganizations(orgs)
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations')
    } finally {
      setLoading(false)
    }
  }

  const filterOrganizations = () => {
    let filtered = organizations

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(org =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.slug.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(org => org.subscription_status === statusFilter)
    }

    // Tier filter
    if (tierFilter !== "all") {
      filtered = filtered.filter(org => org.subscription_tier === tierFilter)
    }

    setFilteredOrganizations(filtered)
  }

  const handleStatusUpdate = async (orgId: string, newStatus: string) => {
    try {
      await updateOrganizationStatus(orgId, newStatus)
      // Refresh the organizations list
      await loadOrganizations()
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to update organization status')
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
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
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
          <p className="text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organization Management"
        description="Manage your organization's settings and details"
      />

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="trialing">Trial</SelectItem>
                <SelectItem value="canceled">Canceled</SelectItem>
                <SelectItem value="past_due">Past Due</SelectItem>
              </SelectContent>
            </Select>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tiers</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Organization</CardTitle>
          <CardDescription>
            Manage your organization's subscription and settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredOrganizations.map((org) => (
              <div key={org.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{org.name}</div>
                    <div className="text-sm text-muted-foreground">{org.slug}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {new Date(org.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {getTierIcon(org.subscription_tier)}
                    <span className="text-sm capitalize">{org.subscription_tier}</span>
                  </div>

                  {getStatusBadge(org.subscription_status)}

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/organizations/${org.id}`)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>

                    <Select
                      value={org.subscription_status}
                      onValueChange={(value) => handleStatusUpdate(org.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="trialing">Trial</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="past_due">Past Due</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}

            {filteredOrganizations.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No organizations found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || tierFilter !== "all"
                    ? "Try adjusting your search or filters"
                    : "No organizations have been created yet"
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Organization Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <div className="text-2xl font-bold">{organizations[0]?.name || 'N/A'}</div>
            </div>
            <p className="text-xs text-muted-foreground">Organization Name</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div className="text-2xl font-bold">
                {organizations[0]?.subscription_status === 'active' ? 'Active' : organizations[0]?.subscription_status || 'N/A'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Subscription Status</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {getTierIcon(organizations[0]?.subscription_tier || 'free')}
              <div className="text-2xl font-bold capitalize">
                {organizations[0]?.subscription_tier || 'free'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Subscription Tier</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div className="text-2xl font-bold">
                {organizations[0]?.id ? 'Available' : 'N/A'}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Organization Access</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}