"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Building2, Users, Package, Settings, ArrowRight } from "lucide-react"

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  completed: boolean
}

interface OrganizationSetupProps {
  organizationId: string
  onComplete: () => void
}

export default function OrganizationSetup({ organizationId, onComplete }: OrganizationSetupProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  
  const [setupData, setSetupData] = useState({
    // Company details
    companySize: "",
    timezone: "",
    currency: "USD",
    
    // Initial categories
    categories: ["Electronics", "Clothing", "Home & Garden"],
    customCategory: "",
    
    // Initial team members
    teamMembers: [{ email: "", role: "manager" as const }],
    
    // Business settings
    taxRate: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
  })

  const steps: OnboardingStep[] = [
    {
      id: "company",
      title: "Company Details",
      description: "Basic information about your business",
      icon: <Building2 className="h-5 w-5" />,
      completed: !!(setupData.companySize && setupData.timezone && setupData.currency)
    },
    {
      id: "categories",
      title: "Product Categories",
      description: "Set up your initial product categories",
      icon: <Package className="h-5 w-5" />,
      completed: setupData.categories.length > 0
    },
    {
      id: "team",
      title: "Team Members",
      description: "Invite your team to join",
      icon: <Users className="h-5 w-5" />,
      completed: setupData.teamMembers.some(member => member.email)
    },
    {
      id: "settings",
      title: "Business Settings",
      description: "Configure tax rates and business info",
      icon: <Settings className="h-5 w-5" />,
      completed: !!(setupData.taxRate && setupData.businessAddress)
    }
  ]

  const completedSteps = steps.filter(step => step.completed).length
  const progress = (completedSteps / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    setLoading(true)
    try {
      // Save setup data to Supabase
      // This would typically involve multiple API calls to set up:
      // - Organization settings
      // - Initial categories
      // - Team member invitations
      // - Business configuration
      
      // For now, we'll simulate the API calls
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      onComplete()
    } catch (error) {
      console.error("Setup error:", error)
    } finally {
      setLoading(false)
    }
  }

  const addCategory = () => {
    if (setupData.customCategory.trim()) {
      setSetupData(prev => ({
        ...prev,
        categories: [...prev.categories, prev.customCategory.trim()],
        customCategory: ""
      }))
    }
  }

  const removeCategory = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }))
  }

  const addTeamMember = () => {
    setSetupData(prev => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { email: "", role: "manager" }]
    }))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setSetupData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const removeTeamMember = (index: number) => {
    setSetupData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index)
    }))
  }

  const renderCompanyStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="companySize">Company Size</Label>
          <Select value={setupData.companySize} onValueChange={(value) => setSetupData(prev => ({ ...prev, companySize: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select company size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1-10">1-10 employees</SelectItem>
              <SelectItem value="11-50">11-50 employees</SelectItem>
              <SelectItem value="51-200">51-200 employees</SelectItem>
              <SelectItem value="201-1000">201-1000 employees</SelectItem>
              <SelectItem value="1000+">1000+ employees</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={setupData.timezone} onValueChange={(value) => setSetupData(prev => ({ ...prev, timezone: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
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
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Default Currency</Label>
        <Select value={setupData.currency} onValueChange={(value) => setSetupData(prev => ({ ...prev, currency: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USD">USD - US Dollar</SelectItem>
            <SelectItem value="EUR">EUR - Euro</SelectItem>
            <SelectItem value="GBP">GBP - British Pound</SelectItem>
            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderCategoriesStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Product Categories</Label>
        <p className="text-sm text-muted-foreground">
          Set up categories to organize your products. You can add more later.
        </p>
        <div className="flex flex-wrap gap-2">
          {setupData.categories.map((category, index) => (
            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeCategory(index)}>
              {category} ×
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Add custom category"
          value={setupData.customCategory}
          onChange={(e) => setSetupData(prev => ({ ...prev, customCategory: e.target.value }))}
          onKeyPress={(e) => e.key === 'Enter' && addCategory()}
        />
        <Button onClick={addCategory} disabled={!setupData.customCategory.trim()}>
          Add
        </Button>
      </div>
    </div>
  )

  const renderTeamStep = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Team Members</Label>
        <p className="text-sm text-muted-foreground">
          Invite team members to join your organization. They'll receive email invitations.
        </p>
      </div>

      {setupData.teamMembers.map((member, index) => (
        <div key={index} className="flex gap-2 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor={`email-${index}`}>Email</Label>
            <Input
              id={`email-${index}`}
              type="email"
              placeholder="colleague@company.com"
              value={member.email}
              onChange={(e) => updateTeamMember(index, 'email', e.target.value)}
            />
          </div>
          <div className="w-32 space-y-2">
            <Label htmlFor={`role-${index}`}>Role</Label>
            <Select value={member.role} onValueChange={(value) => updateTeamMember(index, 'role', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {setupData.teamMembers.length > 1 && (
            <Button variant="outline" size="sm" onClick={() => removeTeamMember(index)}>
              Remove
            </Button>
          )}
        </div>
      ))}

      <Button variant="outline" onClick={addTeamMember}>
        Add Team Member
      </Button>
    </div>
  )

  const renderSettingsStep = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="taxRate">Default Tax Rate (%)</Label>
          <Input
            id="taxRate"
            type="number"
            placeholder="8.5"
            value={setupData.taxRate}
            onChange={(e) => setSetupData(prev => ({ ...prev, taxRate: e.target.value }))}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="businessPhone">Business Phone</Label>
          <Input
            id="businessPhone"
            placeholder="+1 (555) 123-4567"
            value={setupData.businessPhone}
            onChange={(e) => setSetupData(prev => ({ ...prev, businessPhone: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessEmail">Business Email</Label>
        <Input
          id="businessEmail"
          type="email"
          placeholder="contact@company.com"
          value={setupData.businessEmail}
          onChange={(e) => setSetupData(prev => ({ ...prev, businessEmail: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessAddress">Business Address</Label>
        <Textarea
          id="businessAddress"
          placeholder="123 Main St, City, State 12345"
          value={setupData.businessAddress}
          onChange={(e) => setSetupData(prev => ({ ...prev, businessAddress: e.target.value }))}
        />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome to InventoryPro!</h1>
          <p className="text-muted-foreground">Let's set up your organization in just a few steps</p>
          
          <div className="mt-6">
            <Progress value={progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedSteps} of {steps.length} steps completed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Steps sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : step.completed
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-muted text-muted-foreground'
                  }`}
                  onClick={() => setCurrentStep(index)}
                >
                  <div className="mr-3">
                    {step.completed ? <CheckCircle className="h-5 w-5" /> : step.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{step.title}</div>
                    <div className="text-xs opacity-75">{step.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {steps[currentStep].icon}
                  <span className="ml-2">{steps[currentStep].title}</span>
                </CardTitle>
                <CardDescription>{steps[currentStep].description}</CardDescription>
              </CardHeader>
              <CardContent>
                {currentStep === 0 && renderCompanyStep()}
                {currentStep === 1 && renderCategoriesStep()}
                {currentStep === 2 && renderTeamStep()}
                {currentStep === 3 && renderSettingsStep()}
              </CardContent>
              <CardContent className="pt-0">
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                  >
                    {loading ? (
                      "Setting up..."
                    ) : currentStep === steps.length - 1 ? (
                      "Complete Setup"
                    ) : (
                      <>
                        Next <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}