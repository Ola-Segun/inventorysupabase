"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Building,
  Phone,
  Mail,
  MapPin,
  FileText,
  ShoppingBag,
} from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Avatar } from "@/components/ui/avatar"

interface Supplier {
  id: string
  name: string
  contactName: string
  email: string
  phone: string
  address: string
  status: "active" | "inactive"
  productsCount: number
}

const initialSuppliers: Supplier[] = [
  {
    id: "SUP-001",
    name: "Fresh Farms Inc.",
    contactName: "John Smith",
    email: "john@freshfarms.com",
    phone: "(555) 123-4567",
    address: "123 Farm Rd, Countryside, CA 12345",
    status: "active",
    productsCount: 24,
  },
  {
    id: "SUP-002",
    name: "Bakery Supplies Co.",
    contactName: "Sarah Johnson",
    email: "sarah@bakerysupplies.com",
    phone: "(555) 234-5678",
    address: "456 Flour St, Breadville, CA 12345",
    status: "active",
    productsCount: 18,
  },
  {
    id: "SUP-003",
    name: "Dairy Distributors",
    contactName: "Michael Brown",
    email: "michael@dairydist.com",
    phone: "(555) 345-6789",
    address: "789 Milk Ave, Cheesetown, CA 12345",
    status: "active",
    productsCount: 15,
  },
  {
    id: "SUP-004",
    name: "Premium Meats LLC",
    contactName: "Emily Davis",
    email: "emily@premiummeats.com",
    phone: "(555) 456-7890",
    address: "101 Butcher Ln, Steakville, CA 12345",
    status: "inactive",
    productsCount: 12,
  },
  {
    id: "SUP-005",
    name: "Beverage Brothers",
    contactName: "David Wilson",
    email: "david@bevbrothers.com",
    phone: "(555) 567-8901",
    address: "202 Drink Blvd, Sipville, CA 12345",
    status: "active",
    productsCount: 30,
  },
]

export function SuppliersTable() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const { toast } = useToast()

  // Filter suppliers based on search query
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.id.toLowerCase().includes(searchQuery.toLowerCase())

    return matchesSearch
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSuppliers(filteredSuppliers.map((supplier) => supplier.id))
    } else {
      setSelectedSuppliers([])
    }
  }

  const handleSelectSupplier = (supplierId: string, checked: boolean) => {
    if (checked) {
      setSelectedSuppliers([...selectedSuppliers, supplierId])
    } else {
      setSelectedSuppliers(selectedSuppliers.filter((id) => id !== supplierId))
    }
  }

  const handleBulkDelete = () => {
    if (selectedSuppliers.length === 0) return

    setSuppliers(suppliers.filter((supplier) => !selectedSuppliers.includes(supplier.id)))

    toast({
      title: `${selectedSuppliers.length} suppliers deleted`,
      description: "The selected suppliers have been deleted successfully.",
      variant: "success",
    })

    setSelectedSuppliers([])
  }

  const handleBulkUpdateStatus = (status: Supplier["status"]) => {
    if (selectedSuppliers.length === 0) return

    setSuppliers(
      suppliers.map((supplier) => (selectedSuppliers.includes(supplier.id) ? { ...supplier, status } : supplier)),
    )

    toast({
      title: `${selectedSuppliers.length} suppliers updated`,
      description: `The selected suppliers have been marked as ${status}.`,
      variant: "success",
    })
  }

  const getStatusBadge = (status: Supplier["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      default:
        return null
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Checkbox id="active" className="mr-2" />
              <label htmlFor="active">Active suppliers</label>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Checkbox id="inactive" className="mr-2" />
              <label htmlFor="inactive">Inactive suppliers</label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {selectedSuppliers.length > 0 && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedSuppliers.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all suppliers"
                />
                <span className="text-sm font-medium">
                  {selectedSuppliers.length} supplier{selectedSuppliers.length > 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Update Status
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleBulkUpdateStatus("active")}>Mark as Active</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBulkUpdateStatus("inactive")}>
                      Mark as Inactive
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={filteredSuppliers.length > 0 && selectedSuppliers.length === filteredSuppliers.length}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all suppliers"
                />
              </TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No suppliers found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedSuppliers.includes(supplier.id)}
                      onCheckedChange={(checked) => handleSelectSupplier(supplier.id, checked as boolean)}
                      aria-label={`Select ${supplier.name}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-primary/10">
                        <Building className="h-5 w-5 text-primary" />
                      </Avatar>
                      <div>
                        <div className="font-medium">{supplier.name}</div>
                        <div className="text-sm text-muted-foreground">{supplier.id}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{supplier.contactName}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {supplier.email}
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        {supplier.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <MapPin className="mr-1 h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{supplier.address}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{supplier.productsCount}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(supplier.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Supplier
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShoppingBag className="mr-2 h-4 w-4" />
                          Create Purchase Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          View Purchase History
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Supplier
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

