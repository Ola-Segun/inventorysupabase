"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { PageHeader } from "@/components/page-header"
import { Download, TrendingUp, ArrowUpRight, ArrowDownRight, DollarSign, CreditCard, Wallet } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function FinancialAnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

    // Prevent automatic redirection
    useEffect(() => {
      // Store a flag in localStorage to indicate the welcome page has been shown
      localStorage.setItem("FinancialAnalyticsPageShown", "true")
    }, [])


  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Financial Analytics" description="Detailed analysis of your financial performance.">
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
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+20.1%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gross Profit</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$18,092.75</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+15.3%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9,046.38</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+12.7%</span> from last period
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$9,046.37</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
              <span className="text-red-500 font-medium">+8.4%</span> from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select defaultValue="monthly">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select interval" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Time Interval</SelectLabel>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
              <CardDescription>Key financial metrics over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <div className="h-full w-full rounded-md border">
                {/* This would be a chart in a real implementation */}
                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">Financial Overview Chart</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      (Revenue, Expenses, and Profit trends over time)
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profit & Loss Summary</CardTitle>
                <CardDescription>Key financial metrics for the period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Revenue */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Revenue</div>
                      <div className="text-sm font-medium">$45,231.89</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  {/* Cost of Goods Sold */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Cost of Goods Sold</div>
                      <div className="text-sm font-medium">$27,139.14</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                  </div>

                  {/* Gross Profit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Gross Profit</div>
                      <div className="text-sm font-medium">$18,092.75</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "40%" }}></div>
                    </div>
                  </div>

                  {/* Operating Expenses */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Operating Expenses</div>
                      <div className="text-sm font-medium">$9,046.37</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>

                  {/* Net Profit */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Net Profit</div>
                      <div className="text-sm font-medium">$9,046.38</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Financial Ratios</CardTitle>
                <CardDescription>Performance indicators for the business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Ratio</th>
                        <th className="py-3 px-4 text-right font-medium">Value</th>
                        <th className="py-3 px-4 text-right font-medium">vs Last Period</th>
                        <th className="py-3 px-4 text-right font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Gross Profit Margin</td>
                        <td className="py-3 px-4 text-right">40.0%</td>
                        <td className="py-3 px-4 text-right text-green-500">+2.5%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Good
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Net Profit Margin</td>
                        <td className="py-3 px-4 text-right">20.0%</td>
                        <td className="py-3 px-4 text-right text-green-500">+1.2%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Good
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Operating Expense Ratio</td>
                        <td className="py-3 px-4 text-right">20.0%</td>
                        <td className="py-3 px-4 text-right text-red-500">+0.8%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                            Average
                          </span>
                        </td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Inventory Turnover</td>
                        <td className="py-3 px-4 text-right">4.7x</td>
                        <td className="py-3 px-4 text-right text-green-500">+0.3x</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Good
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Return on Investment</td>
                        <td className="py-3 px-4 text-right">15.2%</td>
                        <td className="py-3 px-4 text-right text-green-500">+1.8%</td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                            Good
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Revenue by source and category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Revenue Source</th>
                      <th className="py-3 px-4 text-right font-medium">Amount</th>
                      <th className="py-3 px-4 text-right font-medium">% of Total</th>
                      <th className="py-3 px-4 text-right font-medium">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Product Sales</td>
                      <td className="py-3 px-4 text-right">$38,456.78</td>
                      <td className="py-3 px-4 text-right">85.0%</td>
                      <td className="py-3 px-4 text-right text-green-500">+18.7%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Service Fees</td>
                      <td className="py-3 px-4 text-right">$4,523.19</td>
                      <td className="py-3 px-4 text-right">10.0%</td>
                      <td className="py-3 px-4 text-right text-green-500">+25.3%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Membership Fees</td>
                      <td className="py-3 px-4 text-right">$1,809.28</td>
                      <td className="py-3 px-4 text-right">4.0%</td>
                      <td className="py-3 px-4 text-right text-green-500">+32.1%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Other Revenue</td>
                      <td className="py-3 px-4 text-right">$442.64</td>
                      <td className="py-3 px-4 text-right">1.0%</td>
                      <td className="py-3 px-4 text-right text-red-500">-5.2%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Product sales by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Category 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Produce</div>
                      <div className="text-sm text-muted-foreground">$10,767.90</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "28%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">28% of product sales</div>
                  </div>

                  {/* Category 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Dairy</div>
                      <div className="text-sm text-muted-foreground">$8,460.49</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "22%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">22% of product sales</div>
                  </div>

                  {/* Category 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Meat & Seafood</div>
                      <div className="text-sm text-muted-foreground">$6,922.22</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "18%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">18% of product sales</div>
                  </div>

                  {/* Category 4 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Bakery</div>
                      <div className="text-sm text-muted-foreground">$5,768.52</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">15% of product sales</div>
                  </div>

                  {/* Category 5 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Beverages</div>
                      <div className="text-sm text-muted-foreground">$4,614.81</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "12%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">12% of product sales</div>
                  </div>

                  {/* Category 6 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Other</div>
                      <div className="text-sm text-muted-foreground">$1,922.84</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "5%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">5% of product sales</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Payment Method</CardTitle>
                <CardDescription>Sales distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Payment Method 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Credit Card</div>
                      <div className="text-sm text-muted-foreground">$24,877.54</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "55%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">55% of total revenue</div>
                  </div>

                  {/* Payment Method 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Debit Card</div>
                      <div className="text-sm text-muted-foreground">$13,569.57</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "30%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">30% of total revenue</div>
                  </div>

                  {/* Payment Method 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Cash</div>
                      <div className="text-sm text-muted-foreground">$4,523.19</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "10%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">10% of total revenue</div>
                  </div>

                  {/* Payment Method 4 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Mobile Payment</div>
                      <div className="text-sm text-muted-foreground">$2,261.59</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "5%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">5% of total revenue</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Breakdown</CardTitle>
              <CardDescription>Expenses by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Expense Category</th>
                      <th className="py-3 px-4 text-right font-medium">Amount</th>
                      <th className="py-3 px-4 text-right font-medium">% of Total</th>
                      <th className="py-3 px-4 text-right font-medium">vs Last Period</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Salaries & Wages</td>
                      <td className="py-3 px-4 text-right">$4,523.19</td>
                      <td className="py-3 px-4 text-right">50.0%</td>
                      <td className="py-3 px-4 text-right text-red-500">+5.2%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Rent & Utilities</td>
                      <td className="py-3 px-4 text-right">$1,809.27</td>
                      <td className="py-3 px-4 text-right">20.0%</td>
                      <td className="py-3 px-4 text-right text-red-500">+2.1%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Marketing & Advertising</td>
                      <td className="py-3 px-4 text-right">$904.64</td>
                      <td className="py-3 px-4 text-right">10.0%</td>
                      <td className="py-3 px-4 text-right text-green-500">-3.5%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Equipment & Maintenance</td>
                      <td className="py-3 px-4 text-right">$723.71</td>
                      <td className="py-3 px-4 text-right">8.0%</td>
                      <td className="py-3 px-4 text-right text-red-500">+1.8%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Insurance</td>
                      <td className="py-3 px-4 text-right">$542.78</td>
                      <td className="py-3 px-4 text-right">6.0%</td>
                      <td className="py-3 px-4 text-right text-green-500">0.0%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Other Expenses</td>
                      <td className="py-3 px-4 text-right">$542.78</td>
                      <td className="py-3 px-4 text-right">6.0%</td>
                      <td className="py-3 px-4 text-right text-red-500">+4.2%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Expense Trends</CardTitle>
                <CardDescription>Monthly expense trends</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <div className="h-full w-full rounded-md border">
                  {/* This would be a chart in a real implementation */}
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground">Expense Trends Chart</p>
                      <p className="text-xs text-muted-foreground mt-1">(Monthly expense trends by category)</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Expense Items</CardTitle>
                <CardDescription>Highest individual expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Item</th>
                        <th className="py-3 px-4 text-left font-medium">Category</th>
                        <th className="py-3 px-4 text-right font-medium">Amount</th>
                        <th className="py-3 px-4 text-right font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Monthly Rent</td>
                        <td className="py-3 px-4">Rent & Utilities</td>
                        <td className="py-3 px-4 text-right">$1,500.00</td>
                        <td className="py-3 px-4 text-right">May 1, 2023</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Staff Payroll</td>
                        <td className="py-3 px-4">Salaries & Wages</td>
                        <td className="py-3 px-4 text-right">$4,523.19</td>
                        <td className="py-3 px-4 text-right">May 15, 2023</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Refrigerator Repair</td>
                        <td className="py-3 px-4">Equipment & Maintenance</td>
                        <td className="py-3 px-4 text-right">$450.00</td>
                        <td className="py-3 px-4 text-right">May 8, 2023</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Social Media Ads</td>
                        <td className="py-3 px-4">Marketing & Advertising</td>
                        <td className="py-3 px-4 text-right">$350.00</td>
                        <td className="py-3 px-4 text-right">May 5, 2023</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Liability Insurance</td>
                        <td className="py-3 px-4">Insurance</td>
                        <td className="py-3 px-4 text-right">$325.00</td>
                        <td className="py-3 px-4 text-right">May 10, 2023</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profitability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profitability Analysis</CardTitle>
              <CardDescription>Profit margins by product category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Category</th>
                      <th className="py-3 px-4 text-right font-medium">Revenue</th>
                      <th className="py-3 px-4 text-right font-medium">Cost</th>
                      <th className="py-3 px-4 text-right font-medium">Profit</th>
                      <th className="py-3 px-4 text-right font-medium">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Produce</td>
                      <td className="py-3 px-4 text-right">$10,767.90</td>
                      <td className="py-3 px-4 text-right">$7,537.53</td>
                      <td className="py-3 px-4 text-right">$3,230.37</td>
                      <td className="py-3 px-4 text-right">30.0%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Dairy</td>
                      <td className="py-3 px-4 text-right">$8,460.49</td>
                      <td className="py-3 px-4 text-right">$5,922.34</td>
                      <td className="py-3 px-4 text-right">$2,538.15</td>
                      <td className="py-3 px-4 text-right">30.0%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Meat & Seafood</td>
                      <td className="py-3 px-4 text-right">$6,922.22</td>
                      <td className="py-3 px-4 text-right">$4,845.55</td>
                      <td className="py-3 px-4 text-right">$2,076.67</td>
                      <td className="py-3 px-4 text-right">30.0%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Bakery</td>
                      <td className="py-3 px-4 text-right">$5,768.52</td>
                      <td className="py-3 px-4 text-right">$3,461.11</td>
                      <td className="py-3 px-4 text-right">$2,307.41</td>
                      <td className="py-3 px-4 text-right">40.0%</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Beverages</td>
                      <td className="py-3 px-4 text-right">$4,614.81</td>
                      <td className="py-3 px-4 text-right">$2,768.89</td>
                      <td className="py-3 px-4 text-right">$1,845.92</td>
                      <td className="py-3 px-4 text-right">40.0%</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Other</td>
                      <td className="py-3 px-4 text-right">$1,922.84</td>
                      <td className="py-3 px-4 text-right">$1,153.70</td>
                      <td className="py-3 px-4 text-right">$769.14</td>
                      <td className="py-3 px-4 text-right">40.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Most Profitable Products</CardTitle>
                <CardDescription>Top products by profit margin</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-left font-medium">Category</th>
                        <th className="py-3 px-4 text-right font-medium">Revenue</th>
                        <th className="py-3 px-4 text-right font-medium">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Organic Coffee</td>
                        <td className="py-3 px-4">Beverages</td>
                        <td className="py-3 px-4 text-right">$896.45</td>
                        <td className="py-3 px-4 text-right">65%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Artisan Bread</td>
                        <td className="py-3 px-4">Bakery</td>
                        <td className="py-3 px-4 text-right">$659.61</td>
                        <td className="py-3 px-4 text-right">58%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Premium Olive Oil</td>
                        <td className="py-3 px-4">Other</td>
                        <td className="py-3 px-4 text-right">$432.18</td>
                        <td className="py-3 px-4 text-right">55%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Organic Avocados</td>
                        <td className="py-3 px-4">Produce</td>
                        <td className="py-3 px-4 text-right">$528.32</td>
                        <td className="py-3 px-4 text-right">52%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Specialty Cheese</td>
                        <td className="py-3 px-4">Dairy</td>
                        <td className="py-3 px-4 text-right">$879.24</td>
                        <td className="py-3 px-4 text-right">48%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Least Profitable Products</CardTitle>
                <CardDescription>Products with lowest profit margins</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-left font-medium">Category</th>
                        <th className="py-3 px-4 text-right font-medium">Revenue</th>
                        <th className="py-3 px-4 text-right font-medium">Margin</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Basic Milk</td>
                        <td className="py-3 px-4">Dairy</td>
                        <td className="py-3 px-4 text-right">$345.67</td>
                        <td className="py-3 px-4 text-right">12%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">White Bread</td>
                        <td className="py-3 px-4">Bakery</td>
                        <td className="py-3 px-4 text-right">$234.56</td>
                        <td className="py-3 px-4 text-right">15%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Bananas</td>
                        <td className="py-3 px-4">Produce</td>
                        <td className="py-3 px-4 text-right">$189.32</td>
                        <td className="py-3 px-4 text-right">18%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Ground Beef</td>
                        <td className="py-3 px-4">Meat</td>
                        <td className="py-3 px-4 text-right">$456.78</td>
                        <td className="py-3 px-4 text-right">20%</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">Bottled Water</td>
                        <td className="py-3 px-4">Beverages</td>
                        <td className="py-3 px-4 text-right">$123.45</td>
                        <td className="py-3 px-4 text-right">22%</td>
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
