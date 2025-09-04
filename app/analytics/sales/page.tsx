"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { PageHeader } from "@/components/page-header"
import { Download, TrendingUp, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { SalesChart } from "@/components/sales-chart"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function SalesAnalyticsPage() {
  const { user } = useSupabaseAuth()
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })
  const [analytics, setAnalytics] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const startDate = dateRange.from.toISOString().split('T')[0]
      const endDate = dateRange.to.toISOString().split('T')[0]

      const response = await fetch(`/api/analytics/store?startDate=${startDate}&endDate=${endDate}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchAnalytics()
    }
  }, [user, dateRange])

  // Calculate totals from analytics data
  const totalSales = analytics.reduce((sum, day) => sum + (day.total_sales || 0), 0)
  const totalOrders = analytics.reduce((sum, day) => sum + (day.total_orders || 0), 0)
  const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Sales Analytics" description="Detailed analysis of your sales performance.">
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
            Export
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${totalSales.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+20.1%</span> from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+4.3%</span> from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">{totalOrders}</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+12.5%</span> from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-8">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {analytics.length > 0 ? analytics[analytics.length - 1]?.total_customers || 0 : 0}
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
                  <span className="text-green-500 font-medium">+8.4%</span> from last period
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select defaultValue="daily">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time Interval</SelectLabel>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
              <CardDescription>Sales performance over the selected period</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <SalesChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Distribution of sales across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Category 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Produce</div>
                      <div className="text-sm text-muted-foreground">$12,458.75</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "28%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">28% of total sales</div>
                  </div>

                  {/* Category 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Dairy</div>
                      <div className="text-sm text-muted-foreground">$9,872.40</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "22%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">22% of total sales</div>
                  </div>

                  {/* Category 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Meat & Seafood</div>
                      <div className="text-sm text-muted-foreground">$8,124.60</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "18%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">18% of total sales</div>
                  </div>

                  {/* Category 4 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Bakery</div>
                      <div className="text-sm text-muted-foreground">$6,789.32</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">15% of total sales</div>
                  </div>

                  {/* Category 5 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Beverages</div>
                      <div className="text-sm text-muted-foreground">$5,432.18</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "12%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">12% of total sales</div>
                  </div>

                  {/* Category 6 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Other</div>
                      <div className="text-sm text-muted-foreground">$2,554.64</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "5%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">5% of total sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Best performing products by revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-3 px-4 text-left font-medium">Product</th>
                          <th className="py-3 px-4 text-right font-medium">Units</th>
                          <th className="py-3 px-4 text-right font-medium">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-3 px-4">Organic Apples</td>
                          <td className="py-3 px-4 text-right">245</td>
                          <td className="py-3 px-4 text-right">$732.55</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Whole Wheat Bread</td>
                          <td className="py-3 px-4 text-right">189</td>
                          <td className="py-3 px-4 text-right">$659.61</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Organic Milk</td>
                          <td className="py-3 px-4 text-right">176</td>
                          <td className="py-3 px-4 text-right">$879.24</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-3 px-4">Chicken Breast</td>
                          <td className="py-3 px-4 text-right">154</td>
                          <td className="py-3 px-4 text-right">$1,385.46</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4">Sparkling Water</td>
                          <td className="py-3 px-4 text-right">143</td>
                          <td className="py-3 px-4 text-right">$213.07</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Detailed analysis of product sales</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Product</th>
                      <th className="py-3 px-4 text-left font-medium">Category</th>
                      <th className="py-3 px-4 text-right font-medium">Units Sold</th>
                      <th className="py-3 px-4 text-right font-medium">Revenue</th>
                      <th className="py-3 px-4 text-right font-medium">Profit Margin</th>
                      <th className="py-3 px-4 text-right font-medium">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Organic Apples</td>
                      <td className="py-3 px-4">Produce</td>
                      <td className="py-3 px-4 text-right">245</td>
                      <td className="py-3 px-4 text-right">$732.55</td>
                      <td className="py-3 px-4 text-right">32%</td>
                      <td className="py-3 px-4 text-right text-green-500">+12.4%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Whole Wheat Bread</td>
                      <td className="py-3 px-4">Bakery</td>
                      <td className="py-3 px-4 text-right">189</td>
                      <td className="py-3 px-4 text-right">$659.61</td>
                      <td className="py-3 px-4 text-right">28%</td>
                      <td className="py-3 px-4 text-right text-green-500">+8.2%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Organic Milk</td>
                      <td className="py-3 px-4">Dairy</td>
                      <td className="py-3 px-4 text-right">176</td>
                      <td className="py-3 px-4 text-right">$879.24</td>
                      <td className="py-3 px-4 text-right">24%</td>
                      <td className="py-3 px-4 text-right text-green-500">+5.8%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Chicken Breast</td>
                      <td className="py-3 px-4">Meat</td>
                      <td className="py-3 px-4 text-right">154</td>
                      <td className="py-3 px-4 text-right">$1,385.46</td>
                      <td className="py-3 px-4 text-right">22%</td>
                      <td className="py-3 px-4 text-right text-red-500">-2.3%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Sparkling Water</td>
                      <td className="py-3 px-4">Beverages</td>
                      <td className="py-3 px-4 text-right">143</td>
                      <td className="py-3 px-4 text-right">$213.07</td>
                      <td className="py-3 px-4 text-right">38%</td>
                      <td className="py-3 px-4 text-right text-green-500">+15.7%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Avocados</td>
                      <td className="py-3 px-4">Produce</td>
                      <td className="py-3 px-4 text-right">132</td>
                      <td className="py-3 px-4 text-right">$528.32</td>
                      <td className="py-3 px-4 text-right">35%</td>
                      <td className="py-3 px-4 text-right text-green-500">+18.2%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Ground Coffee</td>
                      <td className="py-3 px-4">Beverages</td>
                      <td className="py-3 px-4 text-right">128</td>
                      <td className="py-3 px-4 text-right">$896.45</td>
                      <td className="py-3 px-4 text-right">42%</td>
                      <td className="py-3 px-4 text-right text-green-500">+7.5%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Greek Yogurt</td>
                      <td className="py-3 px-4">Dairy</td>
                      <td className="py-3 px-4 text-right">124</td>
                      <td className="py-3 px-4 text-right">$432.18</td>
                      <td className="py-3 px-4 text-right">30%</td>
                      <td className="py-3 px-4 text-right text-green-500">+4.2%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales by Channel</CardTitle>
                <CardDescription>Distribution of sales across different channels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Channel 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">In-Store</div>
                      <div className="text-sm text-muted-foreground">$28,456.75</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "63%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">63% of total sales</div>
                  </div>

                  {/* Channel 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Online</div>
                      <div className="text-sm text-muted-foreground">$12,345.60</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "27%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">27% of total sales</div>
                  </div>

                  {/* Channel 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Mobile App</div>
                      <div className="text-sm text-muted-foreground">$4,429.54</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "10%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">10% of total sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
                <CardDescription>Key metrics by sales channel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Channel</th>
                        <th className="py-3 px-4 text-right font-medium">Orders</th>
                        <th className="py-3 px-4 text-right font-medium">Avg. Order</th>
                        <th className="py-3 px-4 text-right font-medium">Growth</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">In-Store</td>
                        <td className="py-3 px-4 text-right">845</td>
                        <td className="py-3 px-4 text-right">$33.68</td>
                        <td className="py-3 px-4 text-right text-green-500">+5.2%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Online</td>
                        <td className="py-3 px-4 text-right">412</td>
                        <td className="py-3 px-4 text-right">$29.96</td>
                        <td className="py-3 px-4 text-right text-green-500">+18.7%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Mobile App</td>
                        <td className="py-3 px-4 text-right">225</td>
                        <td className="py-3 px-4 text-right">$19.69</td>
                        <td className="py-3 px-4 text-right text-green-500">+42.3%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Segments</CardTitle>
                <CardDescription>Sales distribution by customer segment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Segment 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Regular Customers</div>
                      <div className="text-sm text-muted-foreground">$22,567.45</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "50%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">50% of total sales</div>
                  </div>

                  {/* Segment 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">New Customers</div>
                      <div className="text-sm text-muted-foreground">$13,540.67</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">30% of total sales</div>
                  </div>

                  {/* Segment 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">VIP Members</div>
                      <div className="text-sm text-muted-foreground">$9,123.77</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "20%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">20% of total sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
                <CardDescription>Highest spending customers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Customer</th>
                        <th className="py-3 px-4 text-right font-medium">Orders</th>
                        <th className="py-3 px-4 text-right font-medium">Spent</th>
                        <th className="py-3 px-4 text-right font-medium">Last Order</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">John Smith</td>
                        <td className="py-3 px-4 text-right">24</td>
                        <td className="py-3 px-4 text-right">$1,245.87</td>
                        <td className="py-3 px-4 text-right">2 days ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Sarah Johnson</td>
                        <td className="py-3 px-4 text-right">18</td>
                        <td className="py-3 px-4 text-right">$987.32</td>
                        <td className="py-3 px-4 text-right">5 days ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Michael Brown</td>
                        <td className="py-3 px-4 text-right">15</td>
                        <td className="py-3 px-4 text-right">$876.45</td>
                        <td className="py-3 px-4 text-right">1 week ago</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Emily Davis</td>
                        <td className="py-3 px-4 text-right">12</td>
                        <td className="py-3 px-4 text-right">$754.21</td>
                        <td className="py-3 px-4 text-right">3 days ago</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">David Wilson</td>
                        <td className="py-3 px-4 text-right">10</td>
                        <td className="py-3 px-4 text-right">$632.18</td>
                        <td className="py-3 px-4 text-right">Yesterday</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
