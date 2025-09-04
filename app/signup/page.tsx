"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Package, Building2, Users, Crown, Zap, Sparkles, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

interface PricingPlan {
  id: 'free' | 'pro' | 'enterprise'
  name: string
  price: string
  icon: React.ReactNode
  popular?: boolean
  features: {
    [key: string]: boolean | string
  }
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    icon: <Zap className="h-5 w-5" />,
    features: {
      "Basic inventory tracking": true,
      "Simple sales reports": true,
      "Customer management": true,
      "Up to 100 products": true,
      "2 team members": true,
      "1GB storage": true,
      "Email support": true,
      "AI demand forecasting": false,
      "Price optimization": false,
      "Advanced analytics": false,
      "API access": false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29.99",
    icon: <Sparkles className="h-5 w-5" />,
    popular: true,
    features: {
      "Basic inventory tracking": true,
      "Simple sales reports": true,
      "Customer management": true,
      "Up to 10,000 products": true,
      "10 team members": true,
      "50GB storage": true,
      "Email support": true,
      "AI demand forecasting": true,
      "Price optimization": true,
      "Advanced analytics": true,
      "API access": true,
      "Priority support": true,
    },
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99.99",
    icon: <Crown className="h-5 w-5" />,
    features: {
      "Basic inventory tracking": true,
      "Simple sales reports": true,
      "Customer management": true,
      "Unlimited products": true,
      "Unlimited team members": true,
      "500GB storage": true,
      "Email support": true,
      "AI demand forecasting": true,
      "Price optimization": true,
      "Advanced analytics": true,
      "AI chatbot": true,
      "Predictive analytics": true,
      "Custom AI models": true,
      "API access": true,
      "Priority support": true,
      "Phone support": true,
      "White-label options": true,
      "Dedicated account manager": true,
    },
  },
]

export default function SignupPage() {
  const router = useRouter()
  const { signUp } = useSupabaseAuth()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Organization details
    organizationName: "",
    organizationSlug: "",
    industry: "",

    // Step 2: Store details
    storeName: "",
    storeType: "retail_store" as 'retail_store' | 'warehouse' | 'distribution_center' | 'pop_up_store',
    businessName: "",
    country: "US",

    // Step 3: User details
    name: "",
    email: "",
    password: "",
    confirmPassword: "",

    // Step 4: Plan selection
    selectedPlan: "free" as 'free' | 'pro' | 'enterprise',

    // Terms
    acceptTerms: false,
    acceptMarketing: false,
  })

  // Generate slug from organization name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleOrganizationNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      organizationName: value,
      organizationSlug: generateSlug(value)
    }))
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.organizationName && formData.organizationSlug && formData.industry)
      case 2:
        return !!(formData.storeName && formData.businessName && formData.country)
      case 3:
        return !!(
          formData.name &&
          formData.email &&
          formData.password &&
          formData.confirmPassword &&
          formData.password === formData.confirmPassword &&
          formData.password.length >= 8
        )
      case 4:
        return formData.acceptTerms
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setError("")
      setStep(step + 1)
    } else {
      setError("Please fill in all required fields correctly")
    }
  }

  const handleBack = () => {
    setError("")
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) {
      setError("Please complete all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log('🔍 Signup Page: Creating account for:', formData.email)
      await signUp(formData.email, formData.password, {
        name: formData.name,
        storeName: formData.storeName,
        storeType: formData.storeType,
        businessName: formData.businessName,
        organizationName: formData.organizationName,
        organizationSlug: formData.organizationSlug,
        industry: formData.industry,
        country: formData.country,
        role: 'super_admin'
      })
      console.log('✅ Signup Page: Account created successfully')

      // The SupabaseAuthContext will handle the redirect automatically
      // But we can show a success message before redirect
      setError("")
      // The context will redirect to signup-success page
    } catch (err: any) {
      console.error('❌ Signup Page: Account creation failed:', err)
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Tell us about your organization</h2>
        <p className="text-muted-foreground">We'll set up your inventory management system</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationName">Organization Name *</Label>
        <Input
          id="organizationName"
          placeholder="Acme Corporation"
          value={formData.organizationName}
          onChange={(e) => handleOrganizationNameChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="organizationSlug">Organization URL *</Label>
        <div className="flex items-center">
          <span className="text-sm text-muted-foreground mr-2">inventorypro.com/</span>
          <Input
            id="organizationSlug"
            placeholder="acme-corp"
            value={formData.organizationSlug}
            onChange={(e) => setFormData(prev => ({ ...prev, organizationSlug: e.target.value }))}
          />
        </div>
        <p className="text-xs text-muted-foreground">This will be your unique URL for accessing the system</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">Industry *</Label>
        <Select value={formData.industry} onValueChange={(value) => setFormData(prev => ({ ...prev, industry: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select your industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="wholesale">Wholesale</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="restaurant">Restaurant/Food Service</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="automotive">Automotive</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Package className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Store Details</h2>
        <p className="text-muted-foreground">Tell us about your store for {formData.organizationName}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeName">Store Name *</Label>
        <Input
          id="storeName"
          placeholder="Main Store"
          value={formData.storeName}
          onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeType">Store Type *</Label>
        <Select value={formData.storeType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, storeType: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select store type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="retail_store">Retail Store</SelectItem>
            <SelectItem value="warehouse">Warehouse</SelectItem>
            <SelectItem value="distribution_center">Distribution Center</SelectItem>
            <SelectItem value="pop_up_store">Pop-up Store</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          placeholder="Acme Corporation LLC"
          value={formData.businessName}
          onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="country">Country *</Label>
        <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="US">United States</SelectItem>
            <SelectItem value="CA">Canada</SelectItem>
            <SelectItem value="GB">United Kingdom</SelectItem>
            <SelectItem value="AU">Australia</SelectItem>
            <SelectItem value="DE">Germany</SelectItem>
            <SelectItem value="FR">France</SelectItem>
            <SelectItem value="JP">Japan</SelectItem>
            <SelectItem value="NG">Nigeria</SelectItem>
            <SelectItem value="ZA">South Africa</SelectItem>
            <SelectItem value="IN">India</SelectItem>
            <SelectItem value="BR">Brazil</SelectItem>
            <SelectItem value="MX">Mexico</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Users className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Create your admin account</h2>
        <p className="text-muted-foreground">You'll be the administrator for {formData.organizationName}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@acme-corp.com"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
        />
        {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
          <p className="text-sm text-red-500">Passwords do not match</p>
        )}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Package className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Choose your plan</h2>
        <p className="text-muted-foreground">Start with a 14-day free trial, upgrade anytime</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all ${
              formData.selectedPlan === plan.id
                ? 'ring-2 ring-primary border-primary'
                : 'hover:border-primary/50'
            } ${plan.popular ? 'relative' : ''}`}
            onClick={() => setFormData(prev => ({ ...prev, selectedPlan: plan.id }))}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <div className="flex justify-center mb-2">{plan.icon}</div>
              <CardTitle>{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}<span className="text-base font-normal">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {Object.entries(plan.features).map(([feature, included]) => (
                  <li key={feature} className="flex items-center">
                    {included ? (
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    ) : (
                      <div className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    <span className={included ? '' : 'text-muted-foreground line-through'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptTerms: checked as boolean }))}
          />
          <Label htmlFor="acceptTerms" className="text-sm">
            I accept the <a href="/terms" className="text-primary hover:underline">Terms of Service</a> and{" "}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> *
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="acceptMarketing"
            checked={formData.acceptMarketing}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, acceptMarketing: checked as boolean }))}
          />
          <Label htmlFor="acceptMarketing" className="text-sm">
            I'd like to receive product updates and marketing emails
          </Label>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-primary mr-2" />
            <span className="text-2xl font-bold">InventoryPro</span>
          </div>
          <div className="flex justify-center mb-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNumber
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-primary' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <CardDescription>
            Step {step} of 4: {
              step === 1 ? 'Organization Setup' :
              step === 2 ? 'Store Details' :
              step === 3 ? 'Account Creation' :
              'Plan Selection'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
        </CardContent>

        <CardContent className="pt-0">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1 || loading}
            >
              Back
            </Button>

            {step < 4 ? (
              <Button
                onClick={handleNext}
                disabled={!validateStep(step) || loading}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(4) || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}