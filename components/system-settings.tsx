"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export function SystemSettings() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("general")

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your system settings have been saved successfully.",
    })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 w-full">
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="pos">POS Settings</TabsTrigger>
        <TabsTrigger value="invoices">Invoices & Receipts</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>

      {/* General Settings */}
      <TabsContent value="general" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Configure your business details that appear on receipts and invoices.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-name">Business Name</Label>
                <Input id="business-name" defaultValue="InventoryPOS Store" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="business-email">Business Email</Label>
                <Input id="business-email" type="email" defaultValue="contact@inventorypos.com" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-phone">Business Phone</Label>
                <Input id="business-phone" defaultValue="+1 (555) 123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-id">Tax ID / VAT Number</Label>
                <Input id="tax-id" defaultValue="US123456789" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="business-address">Business Address</Label>
              <Input id="business-address" defaultValue="123 Main Street, Suite 101" />
              <Input className="mt-2" defaultValue="New York, NY 10001, USA" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regional Settings</CardTitle>
            <CardDescription>Configure timezone, language, and currency settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="America/New_York">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">Greenwich Mean Time (GMT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Default Language</Label>
                <Select defaultValue="en-US">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (UK)</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Default Currency</Label>
                <Select defaultValue="USD">
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                    <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                    <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date-format">Date Format</Label>
                <Select defaultValue="MM/DD/YYYY">
                  <SelectTrigger id="date-format">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Theme & Appearance</CardTitle>
            <CardDescription>Customize the look and feel of your application.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Default Theme</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <Select defaultValue="blue">
                  <SelectTrigger id="accent-color">
                    <SelectValue placeholder="Select accent color" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Blue</SelectItem>
                    <SelectItem value="green">Green</SelectItem>
                    <SelectItem value="purple">Purple</SelectItem>
                    <SelectItem value="red">Red</SelectItem>
                    <SelectItem value="orange">Orange</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="compact-mode">Compact Mode</Label>
                <p className="text-sm text-muted-foreground">Reduce spacing and padding throughout the interface</p>
              </div>
              <Switch id="compact-mode" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* POS Settings */}
      <TabsContent value="pos" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Point of Sale Configuration</CardTitle>
            <CardDescription>Configure how the POS system behaves during checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="quick-checkout">Quick Checkout</Label>
                <p className="text-sm text-muted-foreground">Skip confirmation screen for faster checkout</p>
              </div>
              <Switch id="quick-checkout" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="barcode-scanning">Barcode Scanning</Label>
                <p className="text-sm text-muted-foreground">Enable barcode scanning for product lookup</p>
              </div>
              <Switch id="barcode-scanning" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="customer-display">Customer Display</Label>
                <p className="text-sm text-muted-foreground">Show order details on secondary display</p>
              </div>
              <Switch id="customer-display" />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="cash-drawer">Cash Drawer Control</Label>
                <p className="text-sm text-muted-foreground">Automatically open cash drawer after cash payment</p>
              </div>
              <Switch id="cash-drawer" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="default-payment">Default Payment Method</Label>
              <Select defaultValue="cash">
                <SelectTrigger id="default-payment">
                  <SelectValue placeholder="Select default payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="credit">Credit Card</SelectItem>
                  <SelectItem value="debit">Debit Card</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tax Configuration</CardTitle>
            <CardDescription>Configure tax rates and calculation methods.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tax-calculation">Tax Calculation Method</Label>
              <Select defaultValue="inclusive">
                <SelectTrigger id="tax-calculation">
                  <SelectValue placeholder="Select tax calculation method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inclusive">Tax Inclusive (prices include tax)</SelectItem>
                  <SelectItem value="exclusive">Tax Exclusive (tax added at checkout)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-tax-rate">Default Tax Rate (%)</Label>
              <Input id="default-tax-rate" type="number" defaultValue="8.5" min="0" max="100" step="0.1" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tax-exemption">Allow Tax Exemption</Label>
                <p className="text-sm text-muted-foreground">Enable tax exemption for eligible customers</p>
              </div>
              <Switch id="tax-exemption" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Discount Settings</CardTitle>
            <CardDescription>Configure discount options and permissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-discounts">Allow Discounts</Label>
                <p className="text-sm text-muted-foreground">Enable discounts at checkout</p>
              </div>
              <Switch id="allow-discounts" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="max-discount">Maximum Discount (%)</Label>
              <Input id="max-discount" type="number" defaultValue="25" min="0" max="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount-approval">Discount Approval Required For</Label>
              <Select defaultValue="15">
                <SelectTrigger id="discount-approval">
                  <SelectValue placeholder="Select threshold" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">Discounts over 10%</SelectItem>
                  <SelectItem value="15">Discounts over 15%</SelectItem>
                  <SelectItem value="20">Discounts over 20%</SelectItem>
                  <SelectItem value="25">Discounts over 25%</SelectItem>
                  <SelectItem value="any">Any discount</SelectItem>
                  <SelectItem value="none">No approval required</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Invoices & Receipts */}
      <TabsContent value="invoices" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Receipt Settings</CardTitle>
            <CardDescription>Configure how receipts are generated and printed.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-print">Auto-Print Receipt</Label>
                <p className="text-sm text-muted-foreground">Automatically print receipt after sale</p>
              </div>
              <Switch id="auto-print" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-receipt">Email Receipt Option</Label>
                <p className="text-sm text-muted-foreground">Allow customers to receive receipts via email</p>
              </div>
              <Switch id="email-receipt" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="receipt-footer">Receipt Footer Text</Label>
              <Input id="receipt-footer" defaultValue="Thank you for your business!" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-printer">Default Receipt Printer</Label>
              <Select defaultValue="thermal-printer">
                <SelectTrigger id="receipt-printer">
                  <SelectValue placeholder="Select printer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thermal-printer">Thermal Printer (Main)</SelectItem>
                  <SelectItem value="backup-printer">Backup Printer</SelectItem>
                  <SelectItem value="kitchen-printer">Kitchen Printer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoice Settings</CardTitle>
            <CardDescription>Configure invoice numbering and content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice-prefix">Invoice Number Prefix</Label>
              <Input id="invoice-prefix" defaultValue="INV-" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next-invoice">Next Invoice Number</Label>
              <Input id="next-invoice" type="number" defaultValue="1001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-terms">Default Payment Terms</Label>
              <Select defaultValue="net-30">
                <SelectTrigger id="payment-terms">
                  <SelectValue placeholder="Select payment terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-receipt">Due on Receipt</SelectItem>
                  <SelectItem value="net-15">Net 15 Days</SelectItem>
                  <SelectItem value="net-30">Net 30 Days</SelectItem>
                  <SelectItem value="net-60">Net 60 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-tax-breakdown">Show Tax Breakdown</Label>
                <p className="text-sm text-muted-foreground">Display detailed tax information on invoices</p>
              </div>
              <Switch id="show-tax-breakdown" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Notifications */}
      <TabsContent value="notifications" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Email Notifications</CardTitle>
            <CardDescription>Configure email notifications for various system events.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="order-confirmation">Order Confirmation</Label>
                <p className="text-sm text-muted-foreground">Send email confirmation for new orders</p>
              </div>
              <Switch id="order-confirmation" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="invoice-notification">Invoice Notifications</Label>
                <p className="text-sm text-muted-foreground">Send email when invoices are created or due</p>
              </div>
              <Switch id="invoice-notification" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="low-stock">Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Send email when products reach low stock threshold</p>
              </div>
              <Switch id="low-stock" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="email-sender">Email Sender Name</Label>
              <Input id="email-sender" defaultValue="InventoryPOS System" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-from">From Email Address</Label>
              <Input id="email-from" type="email" defaultValue="notifications@inventorypos.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
            <CardDescription>Configure internal system notifications and alerts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inventory-alerts">Inventory Alerts</Label>
                <p className="text-sm text-muted-foreground">Show alerts for low stock and out of stock items</p>
              </div>
              <Switch id="inventory-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sales-alerts">Sales Alerts</Label>
                <p className="text-sm text-muted-foreground">Show notifications for new sales</p>
              </div>
              <Switch id="sales-alerts" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">System Update Notifications</Label>
                <p className="text-sm text-muted-foreground">Show alerts when system updates are available</p>
              </div>
              <Switch id="system-updates" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="low-stock-threshold">Low Stock Threshold</Label>
              <Input id="low-stock-threshold" type="number" defaultValue="10" min="0" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Security */}
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Settings</CardTitle>
            <CardDescription>Configure user authentication and security policies.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin accounts</p>
              </div>
              <Switch id="two-factor" />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="password-policy">Password Policy</Label>
              <Select defaultValue="strong">
                <SelectTrigger id="password-policy">
                  <SelectValue placeholder="Select password policy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic (minimum 8 characters)</SelectItem>
                  <SelectItem value="medium">Medium (8+ chars, mixed case)</SelectItem>
                  <SelectItem value="strong">Strong (8+ chars, mixed case, numbers, symbols)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-expiry">Password Expiration</Label>
              <Select defaultValue="90">
                <SelectTrigger id="password-expiry">
                  <SelectValue placeholder="Select expiration period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Session Timeout</Label>
              <Select defaultValue="30">
                <SelectTrigger id="session-timeout">
                  <SelectValue placeholder="Select timeout period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Control</CardTitle>
            <CardDescription>Configure role-based permissions and access control.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="role-based-access">Role-Based Access Control</Label>
                <p className="text-sm text-muted-foreground">Enforce strict role-based permissions</p>
              </div>
              <Switch id="role-based-access" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="audit-logging">Audit Logging</Label>
                <p className="text-sm text-muted-foreground">Log all user actions for security auditing</p>
              </div>
              <Switch id="audit-logging" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="login-attempts">Maximum Login Attempts</Label>
              <Input id="login-attempts" type="number" defaultValue="5" min="1" max="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockout-duration">Account Lockout Duration (minutes)</Label>
              <Input id="lockout-duration" type="number" defaultValue="30" min="5" />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Advanced */}
      <TabsContent value="advanced" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Recovery</CardTitle>
            <CardDescription>Configure system backup settings and data recovery options.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-backup">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground">Schedule regular system backups</p>
              </div>
              <Switch id="auto-backup" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Backup Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger id="backup-frequency">
                  <SelectValue placeholder="Select backup frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-retention">Backup Retention Period</Label>
              <Select defaultValue="30">
                <SelectTrigger id="backup-retention">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="backup-location">Backup Storage Location</Label>
              <Select defaultValue="cloud">
                <SelectTrigger id="backup-location">
                  <SelectValue placeholder="Select storage location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Storage</SelectItem>
                  <SelectItem value="cloud">Cloud Storage</SelectItem>
                  <SelectItem value="both">Both Local and Cloud</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Maintenance</CardTitle>
            <CardDescription>Configure system maintenance and optimization settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-update">Automatic Updates</Label>
                <p className="text-sm text-muted-foreground">Automatically install system updates</p>
              </div>
              <Switch id="auto-update" defaultChecked />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="update-schedule">Update Schedule</Label>
              <Select defaultValue="off-hours">
                <SelectTrigger id="update-schedule">
                  <SelectValue placeholder="Select update schedule" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediately when available</SelectItem>
                  <SelectItem value="off-hours">During off-hours (2 AM - 5 AM)</SelectItem>
                  <SelectItem value="manual">Manual updates only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-cleanup">Automatic Data Cleanup</Label>
                <p className="text-sm text-muted-foreground">Periodically clean up old temporary data</p>
              </div>
              <Switch id="data-cleanup" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label htmlFor="log-retention">System Log Retention</Label>
              <Select defaultValue="90">
                <SelectTrigger id="log-retention">
                  <SelectValue placeholder="Select log retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API & Integrations</CardTitle>
            <CardDescription>Configure API access and third-party integrations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="api-access">Enable API Access</Label>
                <p className="text-sm text-muted-foreground">Allow external applications to access system API</p>
              </div>
              <Switch id="api-access" defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="webhook-notifications">Webhook Notifications</Label>
                <p className="text-sm text-muted-foreground">Send system events to external webhooks</p>
              </div>
              <Switch id="webhook-notifications" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-rate-limit">API Rate Limit (requests per minute)</Label>
              <Input id="api-rate-limit" type="number" defaultValue="100" min="10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="api-token-expiry">API Token Expiration</Label>
              <Select defaultValue="30">
                <SelectTrigger id="api-token-expiry">
                  <SelectValue placeholder="Select token expiration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="never">Never expire</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Reset to Defaults</Button>
        <Button onClick={handleSave}>Save Settings</Button>
      </div>
    </Tabs>
  )
}

