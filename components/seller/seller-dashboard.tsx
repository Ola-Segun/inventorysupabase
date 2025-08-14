"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Receipt, Wallet, AlertTriangle, Tag, Clock, FileText } from "lucide-react"
import Link from "next/link"
import { SellerSpendingChart } from "@/components/seller/seller-spending-chart"
import { SellerRecentPurchases } from "@/components/seller/seller-recent-purchases"

export function SellerDashboard() {
  return (
    <div className="space-y-6">
      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,568.75</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,250.00</div>
            <p className="text-xs text-muted-foreground">3 invoices pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Discounts</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15%</div>
            <p className="text-xs text-muted-foreground">Bulk purchase discount</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,450</div>
            <p className="text-xs text-muted-foreground">Worth $245 in discounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/seller/purchase">
          <Button className="w-full h-20 flex flex-col gap-1">
            <ShoppingBag className="h-5 w-5" />
            <span>Make a New Purchase</span>
          </Button>
        </Link>

        <Link href="/seller/invoices">
          <Button className="w-full h-20 flex flex-col gap-1" variant="outline">
            <FileText className="h-5 w-5" />
            <span>View Invoices</span>
          </Button>
        </Link>

        <Link href="/seller/history">
          <Button className="w-full h-20 flex flex-col gap-1" variant="outline">
            <Clock className="h-5 w-5" />
            <span>Track Orders</span>
          </Button>
        </Link>
      </div>

      {/* Spending Chart and Recent Purchases */}
      <div className="grid gap-6 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Spending Trends</CardTitle>
            <CardDescription>Your purchase history over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <SellerSpendingChart />
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Recent Purchases</CardTitle>
            <CardDescription>Your latest transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <SellerRecentPurchases />
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/seller/history">View All Purchases</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Important notifications requiring your attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-4 rounded-lg border p-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <div>
                <h3 className="font-medium">Payment Due</h3>
                <p className="text-sm text-muted-foreground">Invoice #INV-2023-004 for $450.00 is due in 3 days.</p>
                <Button variant="link" className="px-0 text-sm" asChild>
                  <Link href="/seller/invoices">Pay Now</Link>
                </Button>
              </div>
            </div>

            <div className="flex items-start gap-4 rounded-lg border p-4">
              <Tag className="h-5 w-5 text-green-500" />
              <div>
                <h3 className="font-medium">Special Discount Available</h3>
                <p className="text-sm text-muted-foreground">
                  You qualify for a 20% discount on bulk grocery purchases this week.
                </p>
                <Button variant="link" className="px-0 text-sm" asChild>
                  <Link href="/seller/purchase">Shop Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Top Purchased Products</CardTitle>
          <CardDescription>Your most frequently purchased items this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: "Organic Apples (Case)", quantity: 24, total: 1103.76 },
              { name: "Whole Wheat Bread (24 Pack)", quantity: 18, total: 656.82 },
              { name: "Organic Milk (12 Gallons)", quantity: 15, total: 824.85 },
              { name: "Chicken Breast (40 lbs)", quantity: 12, total: 1079.88 },
              { name: "Sparkling Water (24 Case)", quantity: 20, total: 429.8 },
            ].map((product, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.quantity} units • ${product.total.toFixed(2)}
                  </div>
                </div>
                <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-2"
                    style={{ width: `${Math.max(5, Math.min(100, (product.quantity / 24) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

