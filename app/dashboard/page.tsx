"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { PageHeader } from "@/components/page-header"
import {
  Download,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Bell,
  Clock,
} from "lucide-react"
import { Overview } from "@/components/dashboard/overview"
import { RecentSales } from "@/components/dashboard/recent-sales"
import { SalesTrendChart } from "@/components/dashboard/sales-trend-chart"
import { InventoryStatusChart } from "@/components/dashboard/inventory-status-chart"
import { CalendarWidget } from "@/components/calendar-widget"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
        router.push("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "Low stock alert",
      message: "5 products are running low on stock",
      time: "2 hours ago",
      type: "warning",
    },
    { id: 2, title: "New order received", message: "Order #1234 has been placed", time: "3 hours ago", type: "info" },
    {
      id: 3,
      title: "Payment received",
      message: "Payment for Invoice #5678 has been received",
      time: "5 hours ago",
      type: "success",
    },
    {
      id: 4,
      title: "New customer registered",
      message: "John Smith has registered as a new customer",
      time: "1 day ago",
      type: "info",
    },
    {
      id: 5,
      title: "System update",
      message: "System will be updated tonight at 2:00 AM",
      time: "1 day ago",
      type: "info",
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Dashboard" description="Welcome back to your inventory management system.">
        <div className="flex items-center gap-2">
          <DateRangePicker
            date={dateRange}
            onDateChange={(range) => {
              if (range && range.from && range.to) {
                setDateRange({ from: range.from, to: range.to })
              }
            }}
          />
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +12.2% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              +8.4% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />5 items need immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Sales performance for the current period</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <Overview />
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Latest transactions processed</CardDescription>
              </CardHeader>
              <CardContent>
                <RecentSales />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend</CardTitle>
                <CardDescription>Daily sales performance over time</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <SalesTrendChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current inventory levels by category</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <InventoryStatusChart />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Top selling products and their performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Top Products Table */}
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-left font-medium">Category</th>
                        <th className="py-3 px-4 text-right font-medium">Sales</th>
                        <th className="py-3 px-4 text-right font-medium">Revenue</th>
                        <th className="py-3 px-4 text-right font-medium">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Organic Apples</td>
                        <td className="py-3 px-4">Produce</td>
                        <td className="py-3 px-4 text-right">245</td>
                        <td className="py-3 px-4 text-right">$732.55</td>
                        <td className="py-3 px-4 text-right text-green-500">+12.4%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Whole Wheat Bread</td>
                        <td className="py-3 px-4">Bakery</td>
                        <td className="py-3 px-4 text-right">189</td>
                        <td className="py-3 px-4 text-right">$659.61</td>
                        <td className="py-3 px-4 text-right text-green-500">+8.2%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Organic Milk</td>
                        <td className="py-3 px-4">Dairy</td>
                        <td className="py-3 px-4 text-right">176</td>
                        <td className="py-3 px-4 text-right">$879.24</td>
                        <td className="py-3 px-4 text-right text-green-500">+5.8%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Chicken Breast</td>
                        <td className="py-3 px-4">Meat</td>
                        <td className="py-3 px-4 text-right">154</td>
                        <td className="py-3 px-4 text-right">$1,385.46</td>
                        <td className="py-3 px-4 text-right text-red-500">-2.3%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Sparkling Water</td>
                        <td className="py-3 px-4">Beverages</td>
                        <td className="py-3 px-4 text-right">143</td>
                        <td className="py-3 px-4 text-right">$213.07</td>
                        <td className="py-3 px-4 text-right text-green-500">+15.7%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Sales Reports</CardTitle>
                <CardDescription>View and download sales reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Daily Sales Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Weekly Sales Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Monthly Sales Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Custom Date Range Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Reports</CardTitle>
                <CardDescription>View and download inventory reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Current Stock Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Low Stock Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Stock Movement Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Inventory Valuation Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Reports</CardTitle>
                <CardDescription>View and download financial reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Revenue Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Profit & Loss Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Tax Report
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Expense Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>Configure automated report delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Report Name</th>
                        <th className="py-3 px-4 text-left font-medium">Frequency</th>
                        <th className="py-3 px-4 text-left font-medium">Recipients</th>
                        <th className="py-3 px-4 text-left font-medium">Next Delivery</th>
                        <th className="py-3 px-4 text-right font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Daily Sales Summary</td>
                        <td className="py-3 px-4">Daily</td>
                        <td className="py-3 px-4">3 recipients</td>
                        <td className="py-3 px-4">Tomorrow, 8:00 AM</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Weekly Inventory Report</td>
                        <td className="py-3 px-4">Weekly</td>
                        <td className="py-3 px-4">2 recipients</td>
                        <td className="py-3 px-4">Monday, 9:00 AM</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Monthly Financial Summary</td>
                        <td className="py-3 px-4">Monthly</td>
                        <td className="py-3 px-4">5 recipients</td>
                        <td className="py-3 px-4">May 1, 7:00 AM</td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="ghost" size="sm">
                            Edit
                          </Button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <Button>Schedule New Report</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
              <CardDescription>Your latest system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div
                      className={`rounded-full p-2 ${
                        notification.type === "warning"
                          ? "bg-amber-100 text-amber-600"
                          : notification.type === "success"
                            ? "bg-green-100 text-green-600"
                            : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      {notification.type === "warning" ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : notification.type === "success" ? (
                        <DollarSign className="h-4 w-4" />
                      ) : (
                        <Bell className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-sm text-muted-foreground">{notification.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{notification.time}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      Mark as read
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure your notification preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Email Notifications</h4>
                      <p className="text-xs text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">System Notifications</h4>
                      <p className="text-xs text-muted-foreground">In-app notification settings</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Alert Thresholds</h4>
                      <p className="text-xs text-muted-foreground">Configure alert trigger thresholds</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Configure
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendar</CardTitle>
                <CardDescription>Upcoming events and reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <CalendarWidget />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
