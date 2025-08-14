"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Download, BarChart3, PieChart, TrendingUp } from "lucide-react"
import { SellerSpendingChart } from "@/components/seller/seller-spending-chart"
import { SellerCategoryChart } from "@/components/seller/seller-category-chart"
import { SellerTopProducts } from "@/components/seller/seller-top-products"

export function SellerReports() {
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: new Date(2025, 0, 1),
    to: new Date(2025, 2, 31),
  })

  const [timeframe, setTimeframe] = useState("monthly")
  const [reportData, setReportData] = useState<any>(null) // Placeholder for report data

  // useEffect to fetch or generate report data based on selected timeframe
  useEffect(() => {
    // Simulate fetching data based on date range and timeframe
    const generateReportData = () => {
      console.log("Generating report data for timeframe:", timeframe, "and date range:", dateRange)
      // You can use the 'timeframe' and 'dateRange' to fetch or process your data accordingly.
      // For now, we'll just return a placeholder
      return {
        totalSpending: 24568.75,
        averageOrderValue: 245.69,
        totalOrders: 100,
      }
    }

    // Set simulated report data
    setReportData(generateReportData())
  }, [timeframe, dateRange])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Configure your report parameters and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-sm font-medium">Date Range</div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange}
                    onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Timeframe</div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Reset Filters</Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="spending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="spending">
            <BarChart3 className="mr-2 h-4 w-4" />
            Spending Analysis
          </TabsTrigger>
          <TabsTrigger value="categories">
            <PieChart className="mr-2 h-4 w-4" />
            Category Breakdown
          </TabsTrigger>
          <TabsTrigger value="products">
            <TrendingUp className="mr-2 h-4 w-4" />
            Top Products
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Spending Trends</CardTitle>
              <CardDescription>Your purchase history over time</CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <SellerSpendingChart />
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${reportData?.totalSpending.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">+12% from previous period</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-primary h-1 w-[70%]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${reportData?.averageOrderValue.toFixed(2) || "0.00"}</div>
                <p className="text-xs text-muted-foreground">+5% from previous period</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-primary h-1 w-[55%]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{reportData?.totalOrders || "0"}</div>
                <p className="text-xs text-muted-foreground">+8% from previous period</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-primary h-1 w-[62%]" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                <CardDescription>Spending breakdown by category</CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <SellerCategoryChart />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Details</CardTitle>
                <CardDescription>Detailed spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Grocery", value: "$10,245.50", percent: 42 },
                    { name: "Meat", value: "$5,825.75", percent: 24 },
                    { name: "Dairy", value: "$3,150.25", percent: 13 },
                    { name: "Bakery", value: "$2,129.17", percent: 9 },
                    { name: "Beverages", value: "$1,845.33", percent: 7 },
                    { name: "Household", value: "$1,372.75", percent: 5 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.value}</div>
                      </div>
                      <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                        <div className="bg-primary h-2" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Category Trends</CardTitle>
              <CardDescription>How your spending by category has changed over time</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <SellerSpendingChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Top Purchased Products</CardTitle>
              <CardDescription>Your most frequently purchased items</CardDescription>
            </CardHeader>
            <CardContent>
              <SellerTopProducts />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

