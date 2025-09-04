
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PageHeader } from "@/components/page-header"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Building2,
  Users,
  Settings,
  CreditCard,
  Shield,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Crown,
  Sparkles,
  Zap
} from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  joinedAt: string
}

interface OrganizationSettings {
  name: string
  description: string
  address: string
  phone: string
  email: string
  timezone: string
  currency: string
  taxRate: number
}

export default function OrganizationPage() {
  const router = useRouter()
  const { user, organization, isAuthenticated, hasFeature } = useSupabaseAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Organization settings state
  const [settings, setSettings] = useState<OrganizationSettings>({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    timezone: 'UTC',
    currency: 'USD',
    taxRate: 0
  })

  // Team members state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState('cashier')

  // Billing state
  const [billingInfo, setBillingInfo] = useState<any>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth')
      return
    }

    if (organization) {
      setSettings({
        name: organization.name || '',
        description: organization.description || '',
        address: organization.address || '',
        phone: organization.phone || '',
        email: organization.email || '',
        timezone: organization.timezone || 'UTC',
        currency: organization.currency || 'USD',
        taxRate: organization.tax_rate || 0
      })

      loadTeamMembers()
      loadBillingInfo()
    }
  }, [isAuthenticated, organization, router])

  const loadTeamMembers = async () => {
    try {
      // This would typically fetch from your API
      // For now, we'll use mock data
      setTeamMembers([
        {
          id: '1',
          name: user?.name || 'You',
          email: user?.email || '',
          role: 'admin',
          status: 'active',
          joinedAt: new Date().toISOString()
        }
      ])
    } catch (error) {
      console.error('Error loading team members:', error)
    }
  }

  const loadBillingInfo = async () => {
    try {
      // This would fetch billing info from Stripe
      setBillingInfo({
        plan: organization?.subscription_tier || 'free',
        status: 'active',
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: organization?.subscription_tier === 'pro' ? 29.99 :
                organization?.subscription_tier === 'enterprise' ? 99.99 : 0
      })
    } catch (error) {
      console.error('Error loading billing info:', error)
    }
  }

  const updateOrganizationSettings = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // This would call your API to update organization settings
      // For now, we'll simulate the update
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess('Organization settings updated successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  const inviteTeamMember = async () => {
    if (!newMemberEmail.trim()) return

    setLoading(true)
    setError(null)

    try {
      // This would call your API to invite a team member
      await new Promise(resolve => setTimeout(resolve, 1000))

      const newMember: TeamMember = {
        id: Date.now().toString(),
        name: newMemberEmail.split('@')[0],
        email: newMemberEmail,
        role: newMemberRole,
        status: 'pending',
        joinedAt: new Date().toISOString()
      }

      setTeamMembers(prev => [...prev, newMember])
      setNewMemberEmail('')
      setNewMemberRole('cashier')
      setSuccess('Team member invited successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to invite team member')
    } finally {
      setLoading(false)
    }
  }

  const removeTeamMember = async (memberId: string) => {
    try {
      // This would call your API to remove a team member
      setTeamMembers(prev => prev.filter(member => member.id !== memberId))
      setSuccess('Team member removed successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to remove team member')
    }
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return <Crown className="h-5 w-5 text-purple-500" />
      case 'pro':
        return <Sparkles className="h-5 w-5 text-blue-500" />
      default:
        return <Zap className="h-5 w-5 text-gray-500" />
    }
  }

  const getPlanBadgeVariant = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'default'
      case 'pro':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  if (!isAuthenticated || !organization) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Organization Management"
        description="Manage your organization settings, team members, and billing"
      />

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Plan</CardTitle>
                {getPlanIcon(organization.subscription_tier)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">
                  {organization.subscription_tier}
                </div>
                <Badge variant={getPlanBadgeVariant(organization.subscription_tier)} className="mt-2">
                  {organization.subscription_tier === 'free' ? 'Free Plan' :
                   organization.subscription_tier === 'pro' ? 'Pro Plan' :
                   'Enterprise Plan'}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers.length}</div>
                <p className="text-xs text-muted-foreground">
                  Active members
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${billingInfo?.amount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {billingInfo?.status === 'trialing' ? 'Free trial' : 'Per month'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Next Billing</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {billingInfo?.nextBilling ?
                    new Date(billingInfo.nextBilling).toLocaleDateString() :
                    'N/A'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {billingInfo?.status === 'trialing' ? 'Trial ends' : 'Next charge'}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
              <CardDescription>Basic information about your organization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-sm font-medium">Organization Name</Label>
                  <p className="text-sm text-muted-foreground">{organization.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {new Date(organization.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Subscription Status</Label>
                  <Badge variant={organization.subscription_status === 'active' ? 'default' : 'secondary'}>
                    {organization.subscription_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Plan Features</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {organization.subscription_tier === 'free' && (
                      <>
                        <Badge variant="outline" className="text-xs">100 Products</Badge>
                        <Badge variant="outline" className="text-xs">2 Team Members</Badge>
                      </>
                    )}
                    {organization.subscription_tier === 'pro' && (
                      <>
                        <Badge variant="outline" className="text-xs">10K Products</Badge>
                        <Badge variant="outline" className="text-xs">10 Team Members</Badge>
                        <Badge variant="outline" className="text-xs">AI Features</Badge>
                      </>
                    )}
                    {organization.subscription_tier === 'enterprise' && (
                      <>
                        <Badge variant="outline" className="text-xs">Unlimited Products</Badge>
                        <Badge variant="outline" className="text-xs">Unlimited Team</Badge>
                        <Badge variant="outline" className="text-xs">Advanced AI</Badge>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>Update your organization information and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-email">Contact Email</Label>
                  <Input
                    id="org-email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-description">Description</Label>
                <Textarea
                  id="org-description"
                  value={settings.description}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of your organization"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="org-address">Address</Label>
                  <Input
                    id="org-address"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="org-phone">Phone</Label>
                  <Input
                    id="org-phone"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                  <Input
                    id="tax-rate"
                    type="number"
                    step="0.01"
                    value={settings.taxRate}
                    onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <Button onClick={updateOrganizationSettings} disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your organization's team members and their roles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Team Member */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter email address"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                />
                <Select value={newMemberRole} onValueChange={setNewMemberRole}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cashier">Cashier</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={inviteTeamMember} disabled={loading || !newMemberEmail.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite
                </Button>
              </div>

              {/* Team Members List */}
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {member.role}
                      </Badge>
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status}
                      </Badge>
                      {member.id !== '1' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTeamMember(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Billing & Subscription</CardTitle>
              <CardDescription>Manage your subscription and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getPlanIcon(organization.subscription_tier)}
                  <div>
                    <div className="font-medium capitalize">
                      {organization.subscription_tier} Plan
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${billingInfo?.amount || 0}/month
                    </div>
                  </div>
                </div>
                <Badge variant={billingInfo?.status === 'active' ? 'default' : 'secondary'}>
                  {billingInfo?.status || 'Unknown'}
                </Badge>
              </div>

              {billingInfo?.nextBilling && (
                <div className="text-sm text-muted-foreground">
                  Next billing date: {new Date(billingInfo.nextBilling).toLocaleDateString()}
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => window.location.href = '/billing'}>
                  Manage Billing
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/billing'}>
                  Upgrade Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}