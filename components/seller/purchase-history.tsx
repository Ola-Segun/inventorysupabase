"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, Download, ChevronDown, ChevronUp, Search, Filter } from "lucide-react"
import { cn } from "@/lib/utils"

interface Purchase {
  id: string
  date: Date
  items: {
    name: string
    quantity: number
    price: number
  }[]
  total: number
  paymentMethod: string
  status: "completed" | "processing" | "shipped" | "cancelled"
}

const purchaseHistory: Purchase[] = [
  {
    id: "PO-2023-001",
    date: new Date(2025, 2, 25),
    items: [
      { name: "Organic Apples (Case)", quantity: 2, price: 45.99 },
      { name: "Whole Wheat Bread (24 Pack)", quantity: 1, price: 36.49 },
      { name: "Organic Milk (12 Gallons)", quantity: 1, price: 54.99 },
    ],
    total: 183.46,
    paymentMethod: "Credit Card",
    status: "completed",
  },
  {
    id: "PO-2023-002",
    date: new Date(2025, 2, 22),
    items: [
      { name: "Chicken Breast (40 lbs)", quantity: 1, price: 89.99 },
      { name: "Ground Beef (40 lbs)", quantity: 1, price: 127.99 },
      { name: "Cheddar Cheese (20 lbs)", quantity: 1, price: 75.49 },
    ],
    total: 293.47,
    paymentMethod: "Invoice",
    status: "shipped",
  },
  {
    id: "PO-2023-003",
    date: new Date(2025, 2, 18),
    items: [
      { name: "Paper Towels (Industrial)", quantity: 3, price: 32.99 },
      { name: "Dish Soap (Gallon)", quantity: 5, price: 18.99 },
      { name: "Sparkling Water (24 Case)", quantity: 2, price: 21.49 },
    ],
    total: 237.92,
    paymentMethod: "Digital Wallet",
    status: "completed",
  },
  {
    id: "PO-2023-004",
    date: new Date(2025, 2, 15),
    items: [
      { name: "Fresh Strawberries (Bulk)", quantity: 2, price: 34.99 },
      { name: "Orange Juice (24 Pack)", quantity: 1, price: 43.99 },
    ],
    total: 113.97,
    paymentMethod: "Credit Card",
    status: "completed",
  },
  {
    id: "PO-2023-005",
    date: new Date(2025, 2, 10),
    items: [
      { name: "Chocolate Cake (Wholesale)", quantity: 1, price: 65.99 },
      { name: "Organic Milk (12 Gallons)", quantity: 1, price: 54.99 },
    ],
    total: 120.98,
    paymentMethod: "Invoice",
    status: "completed",
  },
  {
    id: "PO-2023-006",
    date: new Date(2025, 2, 5),
    items: [
      { name: "Paper Towels (Industrial)", quantity: 2, price: 32.99 },
      { name: "Dish Soap (Gallon)", quantity: 3, price: 18.99 },
    ],
    total: 122.95,
    paymentMethod: "Credit Card",
    status: "completed",
  },
  {
    id: "PO-2023-007",
    date: new Date(2025, 2, 1),
    items: [
      { name: "Organic Apples (Case)", quantity: 1, price: 45.99 },
      { name: "Whole Wheat Bread (24 Pack)", quantity: 2, price: 36.49 },
      { name: "Sparkling Water (24 Case)", quantity: 3, price: 21.49 },
    ],
    total: 183.44,
    paymentMethod: "Digital Wallet",
    status: "completed",
  },
]

export function PurchaseHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined
    to: Date | undefined
  }>({
    from: undefined,
    to: undefined,
  })
  const [expandedPurchase, setExpandedPurchase] = useState<string | null>(null)

  const toggleExpand = (purchaseId: string) => {
    if (expandedPurchase === purchaseId) {
      setExpandedPurchase(null)
    } else {
      setExpandedPurchase(purchaseId)
    }
  }

  const filteredPurchases = purchaseHistory.filter((purchase) => {
    // Filter by search query
    const matchesSearch =
      purchase.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      purchase.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()))

    // Filter by status
    const matchesStatus = statusFilter === "all" || purchase.status === statusFilter

    // Filter by date range
    const matchesDateRange =
      (!dateRange.from || purchase.date >= dateRange.from) && (!dateRange.to || purchase.date <= dateRange.to)

    return matchesSearch && matchesStatus && matchesDateRange
  })

  const getStatusBadge = (status: Purchase["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-amber-500">Processing</Badge>
      case "shipped":
        return <Badge className="bg-blue-500">Shipped</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      default:
        return null
    }
  }

  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setDateRange({ from: undefined, to: undefined })
  }

  const exportToCsv = () => {
    alert("Exporting purchase history to CSV...")
  }

  const exportToPdf = () => {
    alert("Exporting purchase history to PDF...")
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Purchase History</CardTitle>
            <CardDescription>View and manage your past purchases</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportToCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
            <Button onClick={exportToPdf}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by order ID or product..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
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
                  defaultMonth={new Date()}
                  selected={dateRange}
                  onSelect={(range) => setDateRange(range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" onClick={resetFilters}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPurchases.map((purchase) => (
              <>
                <TableRow key={purchase.id} className={cn(expandedPurchase === purchase.id && "bg-muted/50")}>
                  <TableCell className="font-medium">{purchase.id}</TableCell>
                  <TableCell>{format(purchase.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>{purchase.items.length} items</TableCell>
                  <TableCell className="text-right">${purchase.total.toFixed(2)}</TableCell>
                  <TableCell>{purchase.paymentMethod}</TableCell>
                  <TableCell>{getStatusBadge(purchase.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => toggleExpand(purchase.id)}>
                      {expandedPurchase === purchase.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      <span className="sr-only">Toggle Details</span>
                    </Button>
                  </TableCell>
                </TableRow>

                {expandedPurchase === purchase.id && (
                  <TableRow>
                    <TableCell colSpan={7} className="bg-muted/50 p-4">
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Order Details</h4>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Quantity</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right">Subtotal</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {purchase.items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>{item.name}</TableCell>
                                  <TableCell className="text-right">{item.quantity}</TableCell>
                                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                  <TableCell className="text-right">
                                    ${(item.quantity * item.price).toFixed(2)}
                                  </TableCell>
                                </TableRow>
                              ))}
                              <TableRow>
                                <TableCell colSpan={3} className="text-right font-medium">
                                  Total:
                                </TableCell>
                                <TableCell className="text-right font-bold">${purchase.total.toFixed(2)}</TableCell>
                              </TableRow>
                            </TableBody>
                          </Table>
                        </div>

                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Download Receipt
                          </Button>
                          <Button size="sm">Reorder Items</Button>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            ))}

            {filteredPurchases.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No purchases found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredPurchases.length} of {purchaseHistory.length} purchases
        </div>
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
  )
}

