"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Building2, MapPin, Phone, Globe, CreditCard, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import { SetupGuard } from "@/components/setup-guard"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function SetupPage() {
  const router = useRouter()
  const { user, store } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)

  const [formData, setFormData] = useState({
    // Business details
    businessName: store?.business_name || "",
    businessRegistrationNumber: store?.business_registration_number || "",
    taxNumber: store?.tax_number || "",

    // Contact details
    phone: store?.phone || "",
    website: store?.website_url || "",

    // Address details
    address: store?.address || "",
    city: store?.city || "",
    state: store?.state || "",
    postalCode: store?.postal_code || "",
    country: store?.country || "US",

    // Store settings
    timezone: store?.timezone || "UTC",
    currency: store?.currency || "USD",
    description: store?.description || "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateStep = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return !!(formData.businessName && formData.businessRegistrationNumber)
      case 2:
        return !!(formData.phone && formData.address && formData.city && formData.country)
      case 3:
        return !!(formData.timezone && formData.currency)
      default:
        return false
    }
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setError("")
      setStep(step + 1)
    } else {
      setError("Please fill in all required fields")
    }
  }

  const handleBack = () => {
    setError("")
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError("Please fill in all required fields")
      return
    }

    if (!store?.id) {
      setError("Store not found")
      return
    }

    setLoading(true)
    setError("")

    try {
      const supabase = createClientComponentClient()

      const { error: updateError } = await supabase
        .from('stores')
        .update({
          business_name: formData.businessName,
          business_registration_number: formData.businessRegistrationNumber,
          tax_number: formData.taxNumber,
          phone: formData.phone,
          website_url: formData.website,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postal_code: formData.postalCode,
          country: formData.country,
          timezone: formData.timezone,
          currency: formData.currency,
          description: formData.description,
          status: 'active'
        })
        .eq('id', store.id)

      if (updateError) throw updateError

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || "Failed to update store details")
    } finally {
      setLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Business Information</h2>
        <p className="text-muted-foreground">Tell us more about your business</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessName">Business Name *</Label>
        <Input
          id="businessName"
          placeholder="Your Business Name"
          value={formData.businessName}
          onChange={(e) => handleInputChange('businessName', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="businessRegistrationNumber">Business Registration Number *</Label>
        <Input
          id="businessRegistrationNumber"
          placeholder="Registration Number"
          value={formData.businessRegistrationNumber}
          onChange={(e) => handleInputChange('businessRegistrationNumber', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taxNumber">Tax Number</Label>
        <Input
          id="taxNumber"
          placeholder="Tax ID or VAT Number"
          value={formData.taxNumber}
          onChange={(e) => handleInputChange('taxNumber', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Business Description</Label>
        <Textarea
          id="description"
          placeholder="Brief description of your business"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
        />
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Contact & Address</h2>
        <p className="text-muted-foreground">How can customers reach you?</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          placeholder="https://yourwebsite.com"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Street Address *</Label>
        <Input
          id="address"
          placeholder="123 Main Street"
          value={formData.address}
          onChange={(e) => handleInputChange('address', e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="City"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input
            id="state"
            placeholder="State"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input
            id="postalCode"
            placeholder="12345"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
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
              <SelectItem value="IT">Italy</SelectItem>
              <SelectItem value="ES">Spain</SelectItem>
              <SelectItem value="NL">Netherlands</SelectItem>
              <SelectItem value="BE">Belgium</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Store Settings</h2>
        <p className="text-muted-foreground">Configure your store preferences</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone *</Label>
          <Select value={formData.timezone} onValueChange={(value) => handleInputChange('timezone', value)}>
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
              <SelectItem value="Australia/Sydney">Sydney</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Currency *</Label>
          <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD ($)</SelectItem>
              <SelectItem value="EUR">EUR (€)</SelectItem>
              <SelectItem value="GBP">GBP (£)</SelectItem>
              <SelectItem value="CAD">CAD (C$)</SelectItem>
              <SelectItem value="AUD">AUD (A$)</SelectItem>
              <SelectItem value="JPY">JPY (¥)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <h3 className="font-semibold mb-2">Setup Summary</h3>
        <div className="space-y-1 text-sm">
          <p><strong>Business:</strong> {formData.businessName}</p>
          <p><strong>Location:</strong> {formData.city}, {formData.country}</p>
          <p><strong>Timezone:</strong> {formData.timezone}</p>
          <p><strong>Currency:</strong> {formData.currency}</p>
        </div>
      </div>
    </div>
  )

  if (!user || !store) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <SetupGuard requireSetup={true}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Building2 className="h-8 w-8 text-primary mr-2" />
              <span className="text-2xl font-bold">Complete Your Setup</span>
            </div>
            <div className="flex justify-center mb-4">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNumber
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={`w-12 h-0.5 mx-2 ${
                      step > stepNumber ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <CardDescription>
              Step {step} of 3: {
                step === 1 ? 'Business Details' :
                step === 2 ? 'Contact & Address' :
                'Store Settings'
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

              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  disabled={!validateStep(step) || loading}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!validateStep(3) || loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Completing Setup...
                    </>
                  ) : (
                    'Complete Setup'
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </SetupGuard>
  )
}