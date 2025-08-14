"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Download, FileText, BarChart3, PieChart, TrendingUp, Filter, RefreshCw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SalesChart } from "@/components/sales-chart"
import { ProductsChart } from "@/components/products-chart"
import { SalesTable } from "@/components/sales-table"
import { DateRangePicker } from "@/components/date-range-picker"
import { format, subDays, subMonths } from "date-fns"
import { useToast } from "@/components/ui/use-toast"

export function ReportsInterface() {
  const { toast } = useToast()
  const [reportType, setReportType] = useState("sales")
  const [isLoading, setIsLoading] = useState(false)
  const [dateRange, setDateRange] = useState<{
    from: Date
    to: Date
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [comparison, setComparison] = useState("previous")
  const [exportFormat, setExportFormat] = useState("pdf")
  const [timeframe, setTimeframe] = useState("30days")

  // Function to handle timeframe changes
  const handleTimeframeChange = (value: string) => {
    setTimeframe(value)
    const today = new Date()

    switch (value) {
      case "7days":
        setDateRange({ from: subDays(today, 7), to: today })
        break
      case "30days":
        setDateRange({ from: subDays(today, 30), to: today })
        break
      case "90days":
        setDateRange({ from: subDays(today, 90), to: today })
        break
      case "6months":
        setDateRange({ from: subMonths(today, 6), to: today })
        break
      case "12months":
        setDateRange({ from: subMonths(today, 12), to: today })
        break
      // Custom timeframe is handled by the DateRangePicker component
    }
  }

  // Function to handle report generation
  const handleGenerateReport = () => {
    setIsLoading(true)

    // Simulate API call to generate report
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Report Generated",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report for ${format(dateRange.from, "MMM d, yyyy")} to ${format(dateRange.to, "MMM d, yyyy")} has been generated.`,
      })
    }, 1500)
  }

  // Function to handle report export
  const handleExportReport = () => {
    setIsLoading(true)

    // Simulate API call to export report
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Report Exported",
        description: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report has been exported as ${exportFormat.toUpperCase()}.`,
      })
    }, 1500)
  }

  // Function to handle filter reset
  const handleResetFilters = () => {
    setReportType("sales")
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    })
    setComparison("previous")
    setExportFormat("pdf")
    setTimeframe("30days")

    toast({
      title: "Filters Reset",
      description: "All report filters have been reset to default values.",
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Settings</CardTitle>
          <CardDescription>Configure your report parameters and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger id="report-type">
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales Report</SelectItem>
                  <SelectItem value="inventory">Inventory Report</SelectItem>
                  <SelectItem value="products">Product Performance</SelectItem>
                  <SelectItem value="customers">Customer Analysis</SelectItem>
                  <SelectItem value="profit">Profit & Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timeframe</Label>
              <Select value={timeframe} onValueChange={handleTimeframeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                  <SelectItem value="6months">Last 6 Months</SelectItem>
                  <SelectItem value="12months">Last 12 Months</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <DateRangePicker
                date={dateRange}
                onDateChange={(range) => {
                  if (range && range.from && range.to) {
                    setDateRange({ from: range.from, to: range.to })
                    setTimeframe("custom")
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comparison">Comparison</Label>
              <Select value={comparison} onValueChange={setComparison}>
                <SelectTrigger id="comparison">
                  <SelectValue placeholder="Select comparison" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="previous">Previous Period</SelectItem>
                  <SelectItem value="year">Year Over Year</SelectItem>
                  <SelectItem value="none">No Comparison</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="format">Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Document</SelectItem>
                  <SelectItem value="csv">CSV Spreadsheet</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleResetFilters}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateReport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </>
              )}
            </Button>
            <Button onClick={handleExportReport} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="charts">
            <BarChart3 className="mr-2 h-4 w-4" />
            Charts
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <PieChart className="mr-2 h-4 w-4" />
            Breakdown
          </TabsTrigger>
          <TabsTrigger value="data">
            <TrendingUp className="mr-2 h-4 w-4" />
            Raw Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Sales Trend</CardTitle>
                  <CardDescription>Daily sales for the selected period</CardDescription>
                </div>
                <Select defaultValue="daily">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="h-80">
                <SalesChart startDate={dateRange.from} endDate={dateRange.to} comparison={comparison} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Product Distribution</CardTitle>
                  <CardDescription>Sales by product category</CardDescription>
                </div>
                <Select defaultValue="units">
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="View" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="units">By Units</SelectItem>
                    <SelectItem value="revenue">By Revenue</SelectItem>
                    <SelectItem value="profit">By Profit</SelectItem>
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent className="h-80">
                <ProductsChart startDate={dateRange.from} endDate={dateRange.to} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales by Time of Day</CardTitle>
                <CardDescription>Hourly sales distribution</CardDescription>
              </div>
              <Select defaultValue="weekday">
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="View" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekday">Weekdays</SelectItem>
                  <SelectItem value="weekend">Weekends</SelectItem>
                  <SelectItem value="all">All Days</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="h-80">
              <SalesChart isHourly startDate={dateRange.from} endDate={dateRange.to} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$12,345.67</div>
                <p className="text-xs text-muted-foreground">+18% from previous period</p>
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
                <div className="text-2xl font-bold">$42.50</div>
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
                <div className="text-2xl font-bold">289</div>
                <p className="text-xs text-muted-foreground">+12% from previous period</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-primary h-1 w-[62%]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24.8%</div>
                <p className="text-xs text-muted-foreground">+2% from previous period</p>
                <div className="mt-4 h-1 w-full bg-muted overflow-hidden rounded-full">
                  <div className="bg-primary h-1 w-[24.8%]" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products</CardTitle>
                <CardDescription>Products with highest sales volume</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Organic Apples", value: 245, percent: 85 },
                    { name: "Whole Wheat Bread", value: 189, percent: 65 },
                    { name: "Organic Milk", value: 145, percent: 50 },
                    { name: "Chicken Breast", value: 127, percent: 44 },
                    { name: "Sparkling Water", value: 92, percent: 32 },
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.value} units</div>
                      </div>
                      <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                        <div className="bg-primary h-2" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution of payment types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Credit Card", value: "$5,240.50", percent: 42 },
                    { name: "Cash", value: "$3,825.75", percent: 31 },
                    { name: "Digital Wallet", value: "$2,150.25", percent: 17 },
                    { name: "Gift Card", value: "$1,129.17", percent: 10 },
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
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Sales Data</CardTitle>
                <CardDescription>Detailed sales transactions for the selected period</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <SalesTable startDate={dateRange.from} endDate={dateRange.to} />
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-muted-foreground">Showing 10 of 289 transactions</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

