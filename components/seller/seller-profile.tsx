"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, CreditCard, Bell, Building, Plus, Trash2 } from "lucide-react"

export function SellerProfile() {
  const [activeTab, setActiveTab] = useState("personal")
  const [personalInfo, setPersonalInfo] = useState({
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    businessName: "Smith Enterprises",
    taxId: "12-3456789",
    address: "123 Main St, Anytown, CA 12345",
  })

  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: "pm-1",
      type: "credit",
      name: "Visa ending in 4242",
      default: true,
    },
    {
      id: "pm-2",
      type: "bank",
      name: "Bank Account ending in 9876",
      default: false,
    },
  ])

  const [notificationPreferences, setNotificationPreferences] = useState({
    emailInvoices: true,
    emailReceipts: true,
    emailPromotions: false,
    emailPaymentReminders: true,
    smsPaymentReminders: false,
    smsOrderUpdates: true,
  })

  const handlePersonalInfoUpdate = () => {
    alert("Personal information updated successfully!")
  }

  const handleRemovePaymentMethod = (id: string) => {
    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id))
  }

  const handleSetDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        default: pm.id === id,
      })),
    )
  }

  const handleAddPaymentMethod = () => {
    alert("Add payment method functionality would open a payment provider form")
  }

  const handleNotificationUpdate = () => {
    alert("Notification preferences updated successfully!")
  }

  return (
    <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="personal">
          <User className="mr-2 h-4 w-4" />
          Personal Information
        </TabsTrigger>
        <TabsTrigger value="payment">
          <CreditCard className="mr-2 h-4 w-4" />
          Payment Methods
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="mr-2 h-4 w-4" />
          Notifications
        </TabsTrigger>
      </TabsList>

      <TabsContent value="personal" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal and business information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center gap-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/placeholder.svg?height=96&width=96" alt="Profile" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={personalInfo.name}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building className="mr-2 h-5 w-5" />
                Business Information
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={personalInfo.businessName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, businessName: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="taxId">Tax ID / EIN</Label>
                  <Input
                    id="taxId"
                    value={personalInfo.taxId}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, taxId: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handlePersonalInfoUpdate}>Save Changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>

      <TabsContent value="payment" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Manage your saved payment methods</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {method.type === "credit" ? (
                      <CreditCard className="h-8 w-8 text-primary" />
                    ) : (
                      <Building className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.default ? "Default payment method" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.default && (
                      <Button variant="outline" size="sm" onClick={() => handleSetDefaultPaymentMethod(method.id)}>
                        Set as Default
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleRemovePaymentMethod(method.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={handleAddPaymentMethod}>
              <Plus className="mr-2 h-4 w-4" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications" className="pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Manage how you receive notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Invoice Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email notifications when new invoices are generated
                    </div>
                  </div>
                  <Switch
                    checked={notificationPreferences.emailInvoices}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, emailInvoices: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Receipt Notifications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email notifications with receipts for completed purchases
                    </div>
                  </div>
                  <Switch
                    checked={notificationPreferences.emailReceipts}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, emailReceipts: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Payment Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Receive email reminders for upcoming and overdue payments
                    </div>
                  </div>
                  <Switch
                    checked={notificationPreferences.emailPaymentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, emailPaymentReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Promotional Emails</div>
                    <div className="text-sm text-muted-foreground">
                      Receive emails about special offers and promotions
                    </div>
                  </div>
                  <Switch
                    checked={notificationPreferences.emailPromotions}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, emailPromotions: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">SMS Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Payment Reminders</div>
                    <div className="text-sm text-muted-foreground">
                      Receive SMS reminders for upcoming and overdue payments
                    </div>
                  </div>
                  <Switch
                    checked={notificationPreferences.smsPaymentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, smsPaymentReminders: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Order Updates</div>
                    <div className="text-sm text-muted-foreground">
                      Receive SMS notifications when your order status changes
                    </div>
                  </div>
                  <Switch
                    checked={notificationPreferences.smsOrderUpdates}
                    onCheckedChange={(checked) =>
                      setNotificationPreferences({ ...notificationPreferences, smsOrderUpdates: checked })
                    }
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNotificationUpdate}>Save Preferences</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

