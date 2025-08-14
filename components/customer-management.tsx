"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Edit, Trash2, User, History, Gift, Mail, Phone, QrCode, RefreshCw } from "lucide-react"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { ImageUpload } from "@/components/image-upload"
import { useToast } from "@/hooks/use-toast"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  loyaltyPoints: number
  totalSpent: number
  lastVisit: string
  status: "active" | "inactive" | "new"
  image: string
}

const initialCustomers: Customer[] = [
  {
    id: "CUST-001",
    name: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    address: "123 Main St, Anytown, CA 12345",
    loyaltyPoints: 250,
    totalSpent: 1245.75,
    lastVisit: "Mar 28, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-002",
    name: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 234-5678",
    address: "456 Oak Ave, Somewhere, CA 12345",
    loyaltyPoints: 180,
    totalSpent: 875.5,
    lastVisit: "Mar 25, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-003",
    name: "Michael Brown",
    email: "mbrown@example.com",
    phone: "(555) 345-6789",
    address: "789 Pine St, Nowhere, CA 12345",
    loyaltyPoints: 320,
    totalSpent: 1560.25,
    lastVisit: "Mar 22, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-004",
    name: "Emily Davis",
    email: "emily.d@example.com",
    phone: "(555) 456-7890",
    address: "101 Maple Dr, Elsewhere, CA 12345",
    loyaltyPoints: 75,
    totalSpent: 350.99,
    lastVisit: "Mar 15, 2025",
    status: "inactive",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-005",
    name: "David Wilson",
    email: "dwilson@example.com",
    phone: "(555) 567-8901",
    address: "202 Cedar Ln, Anywhere, CA 12345",
    loyaltyPoints: 420,
    totalSpent: 1875.25,
    lastVisit: "Mar 20, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-006",
    name: "Jennifer Taylor",
    email: "jtaylor@example.com",
    phone: "(555) 678-9012",
    address: "303 Birch Rd, Someplace, CA 12345",
    loyaltyPoints: 150,
    totalSpent: 725.5,
    lastVisit: "Mar 18, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-007",
    name: "Robert Anderson",
    email: "randerson@example.com",
    phone: "(555) 789-0123",
    address: "404 Elm St, Othertown, CA 12345",
    loyaltyPoints: 90,
    totalSpent: 450.75,
    lastVisit: "Mar 10, 2025",
    status: "inactive",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-008",
    name: "Lisa Thomas",
    email: "lisa.t@example.com",
    phone: "(555) 890-1234",
    address: "505 Walnut Ave, Thisplace, CA 12345",
    loyaltyPoints: 280,
    totalSpent: 1350.0,
    lastVisit: "Mar 26, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-009",
    name: "James Martin",
    email: "jmartin@example.com",
    phone: "(555) 901-2345",
    address: "606 Spruce Dr, Thatplace, CA 12345",
    loyaltyPoints: 0,
    totalSpent: 0,
    lastVisit: "Never",
    status: "new",
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CUST-010",
    name: "Patricia White",
    email: "pwhite@example.com",
    phone: "(555) 012-3456",
    address: "707 Fir Ln, Lastplace, CA 12345",
    loyaltyPoints: 210,
    totalSpent: 980.25,
    lastVisit: "Mar 24, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
    {
    id: "CUST-011",
    name: "Johanna White",
    email: "pwhite@example.com",
    phone: "(555) 012-3456",
    address: "707 Fir Ln, Lastplace, CA 12345",
    loyaltyPoints: 210,
    totalSpent: 980.25,
    lastVisit: "Mar 24, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
    {
    id: "CUST-012",
    name: "Bryan White",
    email: "pwhite@example.com",
    phone: "(555) 012-3456",
    address: "707 Fir Ln, Lastplace, CA 12345",
    loyaltyPoints: 210,
    totalSpent: 980.25,
    lastVisit: "Mar 24, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
    {
    id: "CUST-013",
    name: "Seaan White",
    email: "pwhite@example.com",
    phone: "(555) 012-3456",
    address: "707 Fir Ln, Lastplace, CA 12345",
    loyaltyPoints: 210,
    totalSpent: 980.25,
    lastVisit: "Mar 24, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
    {
    id: "CUST-014",
    name: "Joe White",
    email: "pwhite@example.com",
    phone: "(555) 012-3456",
    address: "707 Fir Ln, Lastplace, CA 12345",
    loyaltyPoints: 210,
    totalSpent: 980.25,
    lastVisit: "Mar 24, 2025",
    status: "active",
    image: "/placeholder.svg?height=100&width=100",
  },
]

interface PurchaseHistory {
  id: string
  date: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  paymentMethod: string
}

const purchaseHistory: Record<string, PurchaseHistory[]> = {
  "CUST-001": [
    {
      id: "INV-001",
      date: "Mar 28, 2025",
      items: [
        { name: "Organic Apples", quantity: 2, price: 5.98 },
        { name: "Whole Wheat Bread", quantity: 1, price: 3.49 },
        { name: "Organic Milk", quantity: 1, price: 4.99 },
        { name: "Chicken Breast", quantity: 1, price: 8.99 },
        { name: "Sparkling Water", quantity: 2, price: 2.98 },
      ],
      total: 26.43,
      paymentMethod: "Credit Card",
    },
    {
      id: "INV-015",
      date: "Mar 25, 2025",
      items: [
        { name: "Fresh Strawberries", quantity: 1, price: 4.99 },
        { name: "Chocolate Cake", quantity: 1, price: 15.99 },
        { name: "Orange Juice", quantity: 1, price: 3.99 },
      ],
      total: 24.97,
      paymentMethod: "Cash",
    },
    {
      id: "INV-032",
      date: "Mar 20, 2025",
      items: [
        { name: "Ground Beef", quantity: 1, price: 7.99 },
        { name: "Cheddar Cheese", quantity: 1, price: 5.49 },
        { name: "Whole Wheat Bread", quantity: 1, price: 3.49 },
        { name: "Sparkling Water", quantity: 3, price: 4.47 },
      ],
      total: 21.44,
      paymentMethod: "Digital Wallet",
    },
  ],
}

// Load customers from localStorage or use initial data
const loadCustomers = (): Customer[] => {
  if (typeof window === "undefined") return initialCustomers

  try {
    const savedCustomers = localStorage.getItem("inventory-customers")
    return savedCustomers ? JSON.parse(savedCustomers) : initialCustomers
  } catch (error) {
    console.error("Error loading customers from localStorage:", error)
    return initialCustomers
  }
}

// Save customers to localStorage
const saveCustomers = (customers: Customer[]) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("inventory-customers", JSON.stringify(customers))
  } catch (error) {
    console.error("Error saving customers to localStorage:", error)
  }
}

export function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>(loadCustomers())
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false)
  const [isEditCustomerOpen, setIsEditCustomerOpen] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    image: "/placeholder.svg?height=100&width=100",
  })

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  const [showQrCode, setShowQrCode] = useState(false)
  const [qrCodeCustomer, setQrCodeCustomer] = useState<Customer | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  // Save customers to localStorage when they change
  useEffect(() => {
    saveCustomers(customers)
  }, [customers])

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery)

    if (activeTab === "all") return matchesSearch
    return matchesSearch && customer.status === activeTab
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  
  const handleAddCustomer = () => {
    // Validate form
    if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (name, email, phone)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Create new customer
      const customer: Customer = {
        id: `CUST-${String(customers.length + 1).padStart(3, "0")}`,
        name: newCustomer.name,
        email: newCustomer.email,
        phone: newCustomer.phone,
        address: newCustomer.address,
        loyaltyPoints: 0,
        totalSpent: 0,
        lastVisit: "Never",
        status: "new",
        image: newCustomer.image,
      }

      // Add to customers
      setCustomers([customer, ...customers])

      // Show success message
      toast({
        title: "Customer added",
        description: `${customer.name} has been added successfully.`,
        variant: "default",
      })

      // Reset form and close dialog
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        image: "/placeholder.svg?height=100&width=100",
      })
      setIsAddCustomerOpen(false)
      setIsLoading(false)
    }, 800)
  }

  const handleEditCustomer = () => {
    if (!selectedCustomer) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Update customer
      setCustomers(customers.map((c) => (c.id === selectedCustomer.id ? selectedCustomer : c)))

      // Show success message
      toast({
        title: "Customer updated",
        description: `${selectedCustomer.name} has been updated successfully.`,
        variant: "default",
      })

      // Close dialog
      setIsEditCustomerOpen(false)
      setIsLoading(false)
    }, 800)
  }

  const handleDeleteCustomer = (customerId: string) => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Delete customer
      setCustomers(customers.filter((c) => c.id !== customerId))

      // Show success message
      toast({
        title: "Customer deleted",
        description: "Customer has been deleted successfully.",
        variant: "default",
      })

      // Reset selected customer if it was deleted
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null)
      }

      setIsLoading(false)
    }, 800)
  }

  

  const getStatusBadge = (status: Customer["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge variant="outline">Inactive</Badge>
      case "new":
        return <Badge className="bg-blue-500">New</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-0.5">
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage your customer database</CardDescription>
            </div>
            <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>Enter the customer details below to add them to your database.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4  md:grid-cols-2">
                  <div className="grid gap-4">
                    <Label>Customer Photo</Label>
                    <ImageUpload
                      initialImage={newCustomer.image}
                      onImageChange={(imageData) =>
                        setNewCustomer({ ...newCustomer, image: imageData || "/placeholder.svg?height=100&width=100" })
                      }
                      aspectRatio={1}
                      entityName="customer"
                      enableGallerySelection={true}
                    />
                  </div>

                  <div className="grid md:gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={newCustomer.address}
                        onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddCustomerOpen(false)} disabled={isLoading}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCustomer} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Customer"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select defaultValue="all" onValueChange={setActiveTab}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="new">New</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Loyalty Points</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (currentItems.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full overflow-hidden">
                        <img
                          src={customer.image || "/placeholder.svg"}
                          alt={customer.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{customer.email}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{customer.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Gift className="h-4 w-4 text-amber-500" />
                      {customer.loyaltyPoints}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">${customer.totalSpent.toFixed(2)}</TableCell>
                  <TableCell>{customer.lastVisit}</TableCell>
                  <TableCell>{getStatusBadge(customer.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(customer)}>
                        <User className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedCustomer(customer)
                          setIsEditCustomerOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleDeleteCustomer(customer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))) : (
                <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No Customers found.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredCustomers.length)} of {customers.length} {" "} customers
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }) .map((_, index) => {
              let pageNumber
              if (totalPages <=5) {
                pageNumber = index + 1
              } else if (currentPage <=3) {
                pageNumber = index + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index
              } else {
                pageNumber = currentPage - 2 + index
              }

              return(
                <Button
                  key={index}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => paginate(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {selectedCustomer && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Customer Details</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
            <CardDescription>Detailed information for {selectedCustomer.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">
                  <User className="mr-2 h-4 w-4" />
                  Information
                </TabsTrigger>
                <TabsTrigger value="history">
                  <History className="mr-2 h-4 w-4" />
                  Purchase History
                </TabsTrigger>
                <TabsTrigger value="loyalty">
                  <Gift className="mr-2 h-4 w-4" />
                  Loyalty Program
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-4 pt-4">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div className="rounded-md overflow-hidden border border-border mb-4">
                      <img
                        src={selectedCustomer.image || "/placeholder.svg"}
                        alt={selectedCustomer.name}
                        className="w-full aspect-square object-cover"
                      />
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setSelectedCustomer(selectedCustomer)
                        setIsEditCustomerOpen(true)
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Customer
                    </Button>
                  </div>

                  <div className="md:w-2/3 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Customer ID</Label>
                        <div className="rounded-md border p-2">{selectedCustomer.id}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <div className="rounded-md border p-2">{selectedCustomer.name}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <div className="rounded-md border p-2">{selectedCustomer.email}</div>
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <div className="rounded-md border p-2">{selectedCustomer.phone}</div>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address</Label>
                        <div className="rounded-md border p-2">{selectedCustomer.address}</div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setQrCodeCustomer(selectedCustomer)
                          setShowQrCode(true)
                        }}
                      >
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR Code
                      </Button>
                      <Button variant="destructive" onClick={() => handleDeleteCustomer(selectedCustomer.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Customer
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="pt-4">
                {purchaseHistory[selectedCustomer.id] ? (
                  <div className="space-y-4">
                    {purchaseHistory[selectedCustomer.id].map((purchase) => (
                      <Card key={purchase.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-base">{purchase.id}</CardTitle>
                            <Badge variant="outline">{purchase.date}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
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
                            </TableBody>
                          </Table>
                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-muted-foreground">
                              Payment Method: {purchase.paymentMethod}
                            </div>
                            <div className="text-lg font-bold">Total: ${purchase.total.toFixed(2)}</div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <History className="h-10 w-10 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No purchase history available</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="loyalty" className="pt-4">
                <div className="space-y-6">
                  <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                    <div className="flex flex-col items-center justify-center space-y-4 text-center">
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary">
                        <Gift className="h-10 w-10 text-primary-foreground" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold">{selectedCustomer.loyaltyPoints}</h3>
                        <p className="text-sm text-muted-foreground">Current Loyalty Points</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Points History</CardTitle>
                        <CardDescription>Recent loyalty point transactions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Purchase</div>
                              <div className="text-sm text-muted-foreground">Mar 28, 2025</div>
                            </div>
                            <div className="text-green-600">+25 points</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Purchase</div>
                              <div className="text-sm text-muted-foreground">Mar 25, 2025</div>
                            </div>
                            <div className="text-green-600">+20 points</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Reward Redemption</div>
                              <div className="text-sm text-muted-foreground">Mar 22, 2025</div>
                            </div>
                            <div className="text-red-600">-50 points</div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Purchase</div>
                              <div className="text-sm text-muted-foreground">Mar 20, 2025</div>
                            </div>
                            <div className="text-green-600">+15 points</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Available Rewards</CardTitle>
                        <CardDescription>Rewards that can be redeemed with current points</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">$5 Off Coupon</div>
                              <div className="text-sm text-muted-foreground">100 points</div>
                            </div>
                            <Button size="sm" disabled={selectedCustomer.loyaltyPoints < 100}>
                              Redeem
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">$10 Off Coupon</div>
                              <div className="text-sm text-muted-foreground">200 points</div>
                            </div>
                            <Button size="sm" disabled={selectedCustomer.loyaltyPoints < 200}>
                              Redeem
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Free Product</div>
                              <div className="text-sm text-muted-foreground">300 points</div>
                            </div>
                            <Button size="sm" disabled={selectedCustomer.loyaltyPoints < 300}>
                              Redeem
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">$25 Off Coupon</div>
                              <div className="text-sm text-muted-foreground">500 points</div>
                            </div>
                            <Button size="sm" disabled={selectedCustomer.loyaltyPoints < 500}>
                              Redeem
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Adjust Points</CardTitle>
                      <CardDescription>Manually add or remove loyalty points</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-end gap-4">
                        <div className="grid gap-2 flex-1">
                          <Label htmlFor="points">Points</Label>
                          <Input id="points" type="number" placeholder="Enter points" />
                        </div>
                        <div className="grid gap-2 flex-1">
                          <Label htmlFor="reason">Reason</Label>
                          <Input id="reason" placeholder="Enter reason" />
                        </div>
                        <Button>Add Points</Button>
                        <Button variant="outline">Remove Points</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Edit Customer Dialog */}
      {selectedCustomer && (
        <Dialog open={isEditCustomerOpen} onOpenChange={setIsEditCustomerOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Edit Customer</DialogTitle>
              <DialogDescription>Update customer information</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4  md:grid-cols-2">
              <div className="grid gap-4">
                <Label>Customer Photo</Label>
                <ImageUpload
                  initialImage={selectedCustomer.image}
                  onImageChange={(imageData) =>
                    setSelectedCustomer({
                      ...selectedCustomer,
                      image: imageData || "/placeholder.svg?height=100&width=100",
                    })
                  }
                  aspectRatio={1}
                  entityName="customer"
                  enableGallerySelection={true}
                />
              </div>

              <div className="grid md:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedCustomer.name}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={selectedCustomer.email}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, email: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-phone">Phone Number</Label>
                  <Input
                    id="edit-phone"
                    value={selectedCustomer.phone}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, phone: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea
                    id="edit-address"
                    value={selectedCustomer.address}
                    onChange={(e) => setSelectedCustomer({ ...selectedCustomer, address: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={selectedCustomer.status}
                    onValueChange={(value: Customer["status"]) =>
                      setSelectedCustomer({ ...selectedCustomer, status: value })
                    }
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditCustomerOpen(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleEditCustomer} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {showQrCode && qrCodeCustomer && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <QRCodeGenerator
              data={`customer:${qrCodeCustomer.id}`}
              title={`Loyalty Card: ${qrCodeCustomer.name}`}
              description={`Customer ID: ${qrCodeCustomer.id} • Loyalty Points: ${qrCodeCustomer.loyaltyPoints}`}
              onClose={() => setShowQrCode(false)}
              open={showQrCode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
