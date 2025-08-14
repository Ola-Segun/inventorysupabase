"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, Filter, Download, Eye, ArrowUpDown, RefreshCw } from "lucide-react"
import { DateRangePicker } from "@/components/date-range-picker"
import type { DateRange } from "@/components/ui/calendar"
import { ReceiptPrinter } from "@/components/receipt-printer"

interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface Order {
  id: string
  date: Date
  customer: string
  items: OrderItem[]
  subtotal: number
  tax: number
  total: number
  status: "pending" | "processing" | "completed" | "cancelled" | "refunded"
  paymentMethod: string
}

// Sample orders data
const sampleOrders: Order[] = [
  {
    id: "ORD-123456-789",
    date: new Date(2025, 4, 21, 10, 15),
    customer: "John Doe",
    items: [
      { name: "Classic Burger", quantity: 2, price: 8.99 },
      { name: "French Fries", quantity: 1, price: 3.99 },
      { name: "Cola", quantity: 2, price: 2.49 },
    ],
    subtotal: 26.95,
    tax: 2.16,
    total: 29.11,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-123457-790",
    date: new Date(2025, 4, 21, 11, 30),
    customer: "Jane Smith",
    items: [
      { name: "Veggie Burger", quantity: 1, price: 8.49 },
      { name: "Onion Rings", quantity: 1, price: 4.49 },
      { name: "Lemonade", quantity: 1, price: 2.99 },
    ],
    subtotal: 15.97,
    tax: 1.28,
    total: 17.25,
    status: "completed",
    paymentMethod: "cash",
  },
  {
    id: "ORD-123458-791",
    date: new Date(2025, 4, 21, 12, 45),
    customer: "Bob Johnson",
    items: [
      { name: "Cheeseburger", quantity: 1, price: 9.99 },
      { name: "Chicken Sandwich", quantity: 1, price: 7.99 },
      { name: "French Fries", quantity: 2, price: 3.99 },
      { name: "Iced Tea", quantity: 2, price: 2.49 },
    ],
    subtotal: 30.94,
    tax: 2.48,
    total: 33.42,
    status: "processing",
    paymentMethod: "card",
  },
  {
    id: "ORD-123459-792",
    date: new Date(2025, 4, 21, 14, 0),
    customer: "Alice Williams",
    items: [
      { name: "Margherita Pizza", quantity: 1, price: 12.99 },
      { name: "House Red Wine", quantity: 2, price: 7.99 },
    ],
    subtotal: 28.97,
    tax: 2.32,
    total: 31.29,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-123460-793",
    date: new Date(2025, 4, 21, 15, 15),
    customer: "Charlie Brown",
    items: [
      { name: "Pepperoni Pizza", quantity: 1, price: 14.99 },
      { name: "Beer", quantity: 2, price: 5.99 },
    ],
    subtotal: 26.97,
    tax: 2.16,
    total: 29.13,
    status: "pending",
    paymentMethod: "wallet",
  },
  {
    id: "ORD-123461-794",
    date: new Date(2025, 4, 21, 16, 30),
    customer: "David Miller",
    items: [
      { name: "Ice Cream", quantity: 2, price: 4.99 },
      { name: "Brownie", quantity: 2, price: 3.99 },
    ],
    subtotal: 17.96,
    tax: 1.44,
    total: 19.4,
    status: "completed",
    paymentMethod: "cash",
  },
  {
    id: "ORD-123462-795",
    date: new Date(2025, 4, 21, 17, 45),
    customer: "Emma Davis",
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 7.99 },
      { name: "French Fries", quantity: 1, price: 3.99 },
      { name: "Cola", quantity: 1, price: 2.49 },
    ],
    subtotal: 14.47,
    tax: 1.16,
    total: 15.63,
    status: "cancelled",
    paymentMethod: "card",
  },
  {
    id: "ORD-12343-796",
    date: new Date(2025, 4, 21, 17, 45),
    customer: "Emma Davis",
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 7.99 },
      { name: "French Fries", quantity: 1, price: 3.99 },
      { name: "Cola", quantity: 1, price: 2.49 },
    ],
    subtotal: 14.47,
    tax: 1.16,
    total: 15.63,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-123464-797",
    date: new Date(2025, 4, 21, 17, 45),
    customer: "Emma Davis",
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 7.99 },
      { name: "French Fries", quantity: 1, price: 3.99 },
      { name: "Cola", quantity: 1, price: 2.49 },
    ],
    subtotal: 14.47,
    tax: 1.16,
    total: 15.63,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-123465-798",
    date: new Date(2025, 4, 21, 17, 45),
    customer: "Emma Davis",
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 7.99 },
      { name: "French Fries", quantity: 1, price: 3.99 },
      { name: "Cola", quantity: 1, price: 2.49 },
    ],
    subtotal: 14.47,
    tax: 1.16,
    total: 15.63,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-123466-799",
    date: new Date(2025, 4, 21, 17, 45),
    customer: "Emma Davis",
    items: [
      { name: "Chicken Sandwich", quantity: 1, price: 7.99 },
      { name: "French Fries", quantity: 1, price: 3.99 },
      { name: "Cola", quantity: 1, price: 2.49 },
    ],
    subtotal: 14.47,
    tax: 1.16,
    total: 15.63,
    status: "completed",
    paymentMethod: "card",
  },
]

export function OrdersTable() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [sortField, setSortField] = useState<keyof Order>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showReceipt, setShowReceipt] = useState(false)

  // Load orders from localStorage or use sample data
  useEffect(() => {
    setIsLoading(true)
    
    setTimeout(() => {
      try {
        const savedOrders = localStorage.getItem('pos-orders')
        let loadedOrders: Order[] = []
        
        if (savedOrders) {
          const parsed = JSON.parse(savedOrders)
          // Convert string dates back to Date objects
          loadedOrders = parsed.map((order: any) => ({
            ...order,
            date: new Date(order.date)
          }))
        }
        
        // Combine with sample orders if needed
        if (loadedOrders.length === 0) {
          loadedOrders = sampleOrders
        } else {
          // Merge with sample orders to ensure we have enough data
          loadedOrders = [...loadedOrders, ...sampleOrders]
        }
        
        setOrders(loadedOrders)
        setFilteredOrders(loadedOrders)
        setIsLoading(false)
      } catch (error) {
        console.error("Error loading orders:", error)
        setOrders(sampleOrders)
        setFilteredOrders(sampleOrders)
        setIsLoading(false)
      }
    }, 800)
  }, [])

  // Apply filters
  useEffect(() => {
    setIsLoading(true)
    
    // Simulate API call delay
    const timer = setTimeout(() => {
      let result = [...orders]
      
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        result = result.filter(order => 
          order.id.toLowerCase().includes(query) ||
          order.customer.toLowerCase().includes(query) ||
          order.items.some(item => item.name.toLowerCase().includes(query))
        )
      }
      
      // Apply status filter
      if (statusFilter !== "all") {
        result = result.filter(order => order.status === statusFilter)
      }
      
      // Apply payment filter
      if (paymentFilter !== "all") {
        result = result.filter(order => order.paymentMethod === paymentFilter)
      }
      
      // Apply date range filter
      if (dateRange?.from) {
        result = result.filter(order => {
          const orderDate = new Date(order.date)
          if (dateRange.from && orderDate < dateRange.from) return false
          if (dateRange.to && orderDate > dateRange.to) return false
          return true
        })
      }
      
      // Apply sorting
      result.sort((a, b) => {
        if (sortField === "date") {
          return sortDirection === "asc" 
            ? a.date.getTime() - b.date.getTime()
            : b.date.getTime() - a.date.getTime()
        }
        
        if (sortField === "total") {
          return sortDirection === "asc" 
            ? a.total - b.total
            : b.total - a.total
        }
        
        const aValue = String(a[sortField])
        const bValue = String(b[sortField])
        
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      })
      
      setFilteredOrders(result)
      setIsLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [orders, searchQuery, statusFilter, paymentFilter, dateRange, sortField, sortDirection])

  // Handle sort
  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  // Ensure currentPage is always valid
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [filteredOrders.length, totalPages])

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  // Only slice up to filteredOrders.length to avoid undefined
  const currentItems = filteredOrders.slice(indexOfFirstItem, Math.min(indexOfLastItem, filteredOrders.length))

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setPaymentFilter("all")
    setDateRange(undefined)
    setSortField("date")
    setSortDirection("desc")
    setCurrentPage(1)
  }

  // Export orders
  const exportOrders = () => {
    setIsLoading(true)
    
    // Simulate export delay
    setTimeout(() => {
      // In a real app, this would generate a CSV or Excel file
      alert("Orders exported successfully!")
      setIsLoading(false)
    }, 1000)
  }

  // View order details
  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order)
  }

  // View receipt
  const viewReceipt = (order: Order) => {
    setSelectedOrder(order)
    setShowReceipt(true)
  }

  // Get status badge
  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "refunded":
        return <Badge className="bg-purple-500">Refunded</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DateRangePicker
                value={dateRange}
                onValueChange={setDateRange}
                align="end"
                className="w-full md:w-auto"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="wallet">Digital Wallet</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetFilters} className="flex-1">
                  <Filter className="mr-2 h-4 w-4" />
                  Reset
                </Button>
                
                <Button variant="outline" onClick={exportOrders} disabled={isLoading} className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
        
        {/* Orders Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <RefreshCw className="animate-spin h-8 w-8 mb-2" />
              <span>Loading orders...</span>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("id")}>
                      <div className="flex items-center">
                        Order ID
                        {sortField === "id" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("date")}>
                      <div className="flex items-center">
                        Date
                        {sortField === "date" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("customer")}>
                      <div className="flex items-center">
                        Customer
                        {sortField === "customer" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead className="text-right cursor-pointer" onClick={() => handleSort("total")}>
                      <div className="flex items-center justify-end">
                        Total
                        {sortField === "total" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("status")}>
                      <div className="flex items-center">
                        Status
                        {sortField === "status" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentItems.length > 0 ? (
                    currentItems.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.date.toLocaleString()}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {order.items.map(item => `${item.quantity}x ${item.name}`).join(", ")}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => viewOrderDetails(order)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => viewReceipt(order)}
                            >
                              View Receipt
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length} orders
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(totalPages, 5) }).map((_, index) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = index + 1
                  } else if (currentPage <= 3) {
                    pageNumber = index + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + index
                  } else {
                    pageNumber = currentPage - 2 + index
                  }

                  return (
                    <Button
                      key={index}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
        
        {/* Order Details Dialog */}
        {selectedOrder && (
          <Dialog open={!!selectedOrder && !showReceipt} onOpenChange={(open) => !open && setSelectedOrder(null)}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Order Details - {selectedOrder.id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm">{selectedOrder.date.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Customer</p>
                    <p className="text-sm">{selectedOrder.customer}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Payment Method</p>
                    <p className="text-sm capitalize">{selectedOrder.paymentMethod}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Items</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${(item.quantity * item.price).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="border-t pt-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${selectedOrder.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${selectedOrder.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-base pt-1">
                      <span>Total</span>
                      <span>${selectedOrder.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowReceipt(true)
                }}>
                  View Receipt
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Receipt Dialog */}
        {selectedOrder && showReceipt && (
          <Dialog open={showReceipt} onOpenChange={(open) => !open && setShowReceipt(false)}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Order Receipt</DialogTitle>
              </DialogHeader>
              <ReceiptPrinter
                orderNumber={selectedOrder.id}
                date={selectedOrder.date}
                items={selectedOrder.items}
                subtotal={selectedOrder.subtotal}
                tax={selectedOrder.tax}
                total={selectedOrder.total}
                paymentMethod={selectedOrder.paymentMethod}
                onClose={() => {
                  setShowReceipt(false)
                  setSelectedOrder(null)
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
  )
}
