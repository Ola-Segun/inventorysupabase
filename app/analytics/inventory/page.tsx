"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { DateRangePicker } from "@/components/date-range-picker"
import { PageHeader } from "@/components/page-header"
import { Download, AlertTriangle, TrendingUp, ArrowUpRight, ArrowDownRight, Package } from "lucide-react"
import { ProductsChart } from "@/components/products-chart"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function InventoryAnalyticsPage() {
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  })

      // Prevent automatic redirection
      useEffect(() => {
        // Store a flag in localStorage to indicate the welcome page has been shown
        localStorage.setItem("InventoryAnalyticsPageShown", "true")
      }, [])

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Inventory Analytics" description="Detailed analysis of your inventory performance.">
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
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,568.32</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+8.2%</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Turnover Rate</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7x</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+0.3x</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">-3</span> from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">-2</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="movement">Stock Movement</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Categories</SelectLabel>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="produce">Produce</SelectItem>
                  <SelectItem value="dairy">Dairy</SelectItem>
                  <SelectItem value="meat">Meat & Seafood</SelectItem>
                  <SelectItem value="bakery">Bakery</SelectItem>
                  <SelectItem value="beverages">Beverages</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Levels</CardTitle>
              <CardDescription>Current inventory levels over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ProductsChart />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Inventory by Category</CardTitle>
                <CardDescription>Distribution of inventory value across categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Category 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Produce</div>
                      <div className="text-sm text-muted-foreground">$32,458.75</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "26%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">26% of total inventory</div>
                  </div>

                  {/* Category 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Meat & Seafood</div>
                      <div className="text-sm text-muted-foreground">$29,872.40</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "24%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">24% of total inventory</div>
                  </div>

                  {/* Category 3 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Dairy</div>
                      <div className="text-sm text-muted-foreground">$22,124.60</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "18%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">18% of total inventory</div>
                  </div>

                  {/* Category 4 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Beverages</div>
                      <div className="text-sm text-muted-foreground">$18,789.32</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "15%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">15% of total inventory</div>
                  </div>

                  {/* Category 5 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Bakery</div>
                      <div className="text-sm text-muted-foreground">$12,432.18</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "10%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">10% of total inventory</div>
                  </div>

                  {/* Category 6 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Other</div>
                      <div className="text-sm text-muted-foreground">$8,891.07</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: "7%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">7% of total inventory</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Status</CardTitle>
                <CardDescription>Current stock levels by status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Status</th>
                        <th className="py-3 px-4 text-right font-medium">Products</th>
                        <th className="py-3 px-4 text-right font-medium">Value</th>
                        <th className="py-3 px-4 text-right font-medium">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">In Stock (Healthy)</td>
                        <td className="py-3 px-4 text-right">245</td>
                        <td className="py-3 px-4 text-right">$98,765.32</td>
                        <td className="py-3 px-4 text-right">79%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Low Stock</td>
                        <td className="py-3 px-4 text-right">12</td>
                        <td className="py-3 px-4 text-right">$22,345.67</td>
                        <td className="py-3 px-4 text-right">18%</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Out of Stock</td>
                        <td className="py-3 px-4 text-right">3</td>
                        <td className="py-3 px-4 text-right">$3,457.33</td>
                        <td className="py-3 px-4 text-right">3%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Performance</CardTitle>
              <CardDescription>Detailed analysis of inventory by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Category</th>
                      <th className="py-3 px-4 text-right font-medium">Products</th>
                      <th className="py-3 px-4 text-right font-medium">Value</th>
                      <th className="py-3 px-4 text-right font-medium">Turnover Rate</th>
                      <th className="py-3 px-4 text-right font-medium">Low Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Produce</td>
                      <td className="py-3 px-4 text-right">78</td>
                      <td className="py-3 px-4 text-right">$32,458.75</td>
                      <td className="py-3 px-4 text-right">6.2x</td>
                      <td className="py-3 px-4 text-right">4</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Meat & Seafood</td>
                      <td className="py-3 px-4 text-right">45</td>
                      <td className="py-3 px-4 text-right">$29,872.40</td>
                      <td className="py-3 px-4 text-right">5.8x</td>
                      <td className="py-3 px-4 text-right">2</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Dairy</td>
                      <td className="py-3 px-4 text-right">32</td>
                      <td className="py-3 px-4 text-right">$22,124.60</td>
                      <td className="py-3 px-4 text-right">4.9x</td>
                      <td className="py-3 px-4 text-right">3</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Beverages</td>
                      <td className="py-3 px-4 text-right">56</td>
                      <td className="py-3 px-4 text-right">$18,789.32</td>
                      <td className="py-3 px-4 text-right">3.7x</td>
                      <td className="py-3 px-4 text-right">1</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Bakery</td>
                      <td className="py-3 px-4 text-right">28</td>
                      <td className="py-3 px-4 text-right">$12,432.18</td>
                      <td className="py-3 px-4 text-right">7.2x</td>
                      <td className="py-3 px-4 text-right">2</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Other</td>
                      <td className="py-3 px-4 text-right">21</td>
                      <td className="py-3 px-4 text-right">$8,891.07</td>
                      <td className="py-3 px-4 text-right">2.8x</td>
                      <td className="py-3 px-4 text-right">0</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Stock Movement</CardTitle>
                <CardDescription>Inventory movement over the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Movement Type 1 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Incoming Stock</div>
                      <div className="text-sm text-muted-foreground">$45,678.90</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: "55%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">55% of total movement</div>
                  </div>

                  {/* Movement Type 2 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">Outgoing Stock</div>
                      <div className="text-sm text-muted-foreground">$37,456.78</div>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-red-500 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <div className="text-xs text-muted-foreground">45% of total movement</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Stock Movements</CardTitle>
                <CardDescription>Latest inventory transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="py-3 px-4 text-left font-medium">Date</th>
                        <th className="py-3 px-4 text-left font-medium">Type</th>
                        <th className="py-3 px-4 text-left font-medium">Product</th>
                        <th className="py-3 px-4 text-right font-medium">Quantity</th>
                        <th className="py-3 px-4 text-right font-medium">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 px-4">Today</td>
                        <td className="py-3 px-4 text-green-500">Incoming</td>
                        <td className="py-3 px-4">Organic Apples</td>
                        <td className="py-3 px-4 text-right">+50</td>
                        <td className="py-3 px-4 text-right">$245.50</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Today</td>
                        <td className="py-3 px-4 text-red-500">Outgoing</td>
                        <td className="py-3 px-4">Whole Wheat Bread</td>
                        <td className="py-3 px-4 text-right">-25</td>
                        <td className="py-3 px-4 text-right">$87.25</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Yesterday</td>
                        <td className="py-3 px-4 text-green-500">Incoming</td>
                        <td className="py-3 px-4">Organic Milk</td>
                        <td className="py-3 px-4 text-right">+100</td>
                        <td className="py-3 px-4 text-right">$349.00</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 px-4">Yesterday</td>
                        <td className="py-3 px-4 text-red-500">Outgoing</td>
                        <td className="py-3 px-4">Chicken Breast</td>
                        <td className="py-3 px-4 text-right">-30</td>
                        <td className="py-3 px-4 text-right">$179.70</td>
                      </tr>
                      <tr>
                        <td className="py-3 px-4">2 days ago</td>
                        <td className="py-3 px-4 text-green-500">Incoming</td>
                        <td className="py-3 px-4">Sparkling Water</td>
                        <td className="py-3 px-4 text-right">+200</td>
                        <td className="py-3 px-4 text-right">$159.80</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Alerts</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium">Product</th>
                      <th className="py-3 px-4 text-left font-medium">Category</th>
                      <th className="py-3 px-4 text-right font-medium">Current Stock</th>
                      <th className="py-3 px-4 text-right font-medium">Reorder Level</th>
                      <th className="py-3 px-4 text-right font-medium">Status</th>
                      <th className="py-3 px-4 text-right font-medium">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Organic Apples</td>
                      <td className="py-3 px-4">Produce</td>
                      <td className="py-3 px-4 text-right">5</td>
                      <td className="py-3 px-4 text-right">20</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Low Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Whole Wheat Bread</td>
                      <td className="py-3 px-4">Bakery</td>
                      <td className="py-3 px-4 text-right">0</td>
                      <td className="py-3 px-4 text-right">15</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Out of Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Organic Milk</td>
                      <td className="py-3 px-4">Dairy</td>
                      <td className="py-3 px-4 text-right">8</td>
                      <td className="py-3 px-4 text-right">25</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Low Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Chicken Breast</td>
                      <td className="py-3 px-4">Meat</td>
                      <td className="py-3 px-4 text-right">3</td>
                      <td className="py-3 px-4 text-right">10</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                          Low Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Sparkling Water</td>
                      <td className="py-3 px-4">Beverages</td>
                      <td className="py-3 px-4 text-right">0</td>
                      <td className="py-3 px-4 text-right">30</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                          Out of Stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button variant="outline" size="sm">
                          Reorder
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
