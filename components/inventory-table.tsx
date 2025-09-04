"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Edit, Trash2, Plus, ArrowUpDown, Download, RefreshCw, AlertTriangle, Building2, Bell, TrendingUp } from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string
  price: number
  supplier: string
  minStockLevel: number
  stockStatus: "in-stock" | "low-stock" | "out-of-stock"
  lastUpdated: Date
}

// Sample data
const inventoryData: InventoryItem[] = [
  {
    id: "PRD-001",
    name: "Organic Apples",
    category: "Produce",
    quantity: 150,
    unit: "kg",
    price: 2.99,
    supplier: "Green Farms Inc.",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 28),
  },
  {
    id: "PRD-002",
    name: "Whole Wheat Bread",
    category: "Bakery",
    quantity: 85,
    unit: "loaf",
    price: 3.49,
    supplier: "Artisan Bakers",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 27),
  },
  {
    id: "PRD-003",
    name: "Organic Milk",
    category: "Dairy",
    quantity: 45,
    unit: "gallon",
    price: 4.99,
    supplier: "Happy Cow Dairy",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 26),
  },
  {
    id: "PRD-004",
    name: "Chicken Breast",
    category: "Meat",
    quantity: 12,
    unit: "kg",
    price: 8.99,
    supplier: "Premium Meats Co.",
    minStockLevel: 10,
    stockStatus: "low-stock",
    lastUpdated: new Date(2025, 2, 25),
  },
  {
    id: "PRD-005",
    name: "Sparkling Water",
    category: "Beverages",
    quantity: 200,
    unit: "bottle",
    price: 1.49,
    supplier: "Crystal Springs",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 24),
  },
  {
    id: "PRD-006",
    name: "Chocolate Cake",
    category: "Bakery",
    quantity: 0,
    unit: "piece",
    price: 15.99,
    supplier: "Sweet Delights Bakery",
    minStockLevel: 10,
    stockStatus: "out-of-stock",
    lastUpdated: new Date(2025, 2, 23),
  },
  {
    id: "PRD-007",
    name: "Fresh Strawberries",
    category: "Produce",
    quantity: 8,
    unit: "kg",
    price: 4.99,
    supplier: "Green Farms Inc.",
    minStockLevel: 10,
    stockStatus: "low-stock",
    lastUpdated: new Date(2025, 2, 22),
  },
  {
    id: "PRD-008",
    name: "Cheddar Cheese",
    category: "Dairy",
    quantity: 35,
    unit: "kg",
    price: 5.49,
    supplier: "Happy Cow Dairy",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 21),
  },
  {
    id: "PRD-009",
    name: "Ground Beef",
    category: "Meat",
    quantity: 0,
    unit: "kg",
    price: 7.99,
    supplier: "Premium Meats Co.",
    minStockLevel: 10,
    stockStatus: "out-of-stock",
    lastUpdated: new Date(2025, 2, 20),
  },
  {
    id: "PRD-010",
    name: "Orange Juice",
    category: "Beverages",
    quantity: 65,
    unit: "bottle",
    price: 3.99,
    supplier: "Fresh Squeeze Co.",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 19),
  },
  {
    id: "PRD-011",
    name: "Paper Towels",
    category: "Household",
    quantity: 120,
    unit: "roll",
    price: 1.99,
    supplier: "Clean Home Supplies",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 18),
  },
  {
    id: "PRD-012",
    name: "Dish Soap",
    category: "Household",
    quantity: 75,
    unit: "bottle",
    price: 2.49,
    supplier: "Clean Home Supplies",
    minStockLevel: 10,
    stockStatus: "in-stock",
    lastUpdated: new Date(2025, 2, 17),
  },
]

export function InventoryTable() {
  const { toast } = useToast()
  const { user, organization, store } = useSupabaseAuth()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockStatusFilter, setstockStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<keyof InventoryItem>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [lowStockAlerts, setLowStockAlerts] = useState<InventoryItem[]>([])

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAdjustStockDialogOpen, setIsAdjustStockDialogOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: "",
    category: "Produce",
    quantity: 0,
    unit: "kg",
    price: 0,
    supplier: "",
    minStockLevel: 10,
    stockStatus: "in-stock",
  })
  const [stockAdjustment, setStockAdjustment] = useState({
    quantity: 0,
    reason: "restock",
  })

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      let filteredData = [...inventoryData]

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredData = filteredData.filter(
          (item) =>
            item.name.toLowerCase().includes(query) ||
            item.id.toLowerCase().includes(query) ||
            item.supplier.toLowerCase().includes(query),
        )
      }

      // Filter by category
      if (categoryFilter !== "all") {
        filteredData = filteredData.filter((item) => item.category === categoryFilter)
      }

      // Filter by stockStatus
      if (stockStatusFilter !== "all") {
        filteredData = filteredData.filter((item) => item.stockStatus === stockStatusFilter)
      }

      // Sort data
      filteredData.sort((a, b) => {
        if (sortField === "lastUpdated") {
          return sortDirection === "asc"
            ? a.lastUpdated.getTime() - b.lastUpdated.getTime()
            : b.lastUpdated.getTime() - a.lastUpdated.getTime()
        }

        if (typeof a[sortField] === "string" && typeof b[sortField] === "string") {
          return sortDirection === "asc"
            ? (a[sortField] as string).localeCompare(b[sortField] as string)
            : (b[sortField] as string).localeCompare(a[sortField] as string)
        }

        return sortDirection === "asc"
          ? (a[sortField] as number) - (b[sortField] as number)
          : (b[sortField] as number) - (a[sortField] as number)
      })

      setInventory(filteredData)
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [searchQuery, categoryFilter, stockStatusFilter, sortField, sortDirection])

  const getstockStatusBadge = (stockStatus: InventoryItem["stockStatus"]) => {
    switch (stockStatus) {
      case "in-stock":
        return <Badge className="bg-green-500">In Stock</Badge>
      case "low-stock":
        return <Badge className="bg-amber-500">Low Stock</Badge>
      case "out-of-stock":
        return <Badge className="bg-red-500">Out of Stock</Badge>
      default:
        return null
    }
  }

  const handleSort = (field: keyof InventoryItem) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = inventory.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(inventory.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Check for low stock alerts
  useEffect(() => {
    const lowStockItems = inventory.filter(item =>
      item.stockStatus === "low-stock" || item.stockStatus === "out-of-stock"
    )
    setLowStockAlerts(lowStockItems)
  }, [inventory])

  // Add new item
  const handleAddItem = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newId = `PRD-${String(inventoryData.length + 1).padStart(3, "0")}`
      const itemToAdd: InventoryItem = {
        id: newId,
        name: newItem.name || "",
        category: newItem.category || "Produce",
        quantity: newItem.quantity || 0,
        unit: newItem.unit || "kg",
        price: newItem.price || 0,
        supplier: newItem.supplier || "",
        minStockLevel: newItem.minStockLevel || 0,
        stockStatus:
          newItem.quantity && newItem.quantity > 20
            ? "in-stock"
            : newItem.quantity && newItem.quantity > 0
              ? "low-stock"
              : "out-of-stock",
        lastUpdated: new Date(),
      }

      inventoryData.unshift(itemToAdd)

      // Reset form and close dialog
      setNewItem({
        name: "",
        category: "Produce",
        quantity: 0,
        unit: "kg",
        price: 0,
        supplier: "",
        minStockLevel: 0,
        stockStatus: "in-stock",
      })
      setIsAddDialogOpen(false)

      // Show success toast
      toast({
        title: "Item Added",
        description: `${itemToAdd.name} has been added to inventory.`,
      })

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Edit item
  const handleEditItem = () => {
    if (!selectedItem) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const index = inventoryData.findIndex((item) => item.id === selectedItem.id)
      if (index !== -1) {
        inventoryData[index] = {
          ...selectedItem,
          lastUpdated: new Date(),
        }
      }

      // Close dialog
      setIsEditDialogOpen(false)
      setSelectedItem(null)

      // Show success toast
      toast({
        title: "Item Updated",
        description: `${selectedItem.name} has been updated.`,
      })

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Delete item
  const handleDeleteItem = () => {
    if (!selectedItem) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const index = inventoryData.findIndex((item) => item.id === selectedItem.id)
      if (index !== -1) {
        inventoryData.splice(index, 1)
      }

      // Close dialog
      setIsDeleteDialogOpen(false)

      // Show success toast
      toast({
        title: "Item Deleted",
        description: `${selectedItem.name} has been removed from inventory.`,
      })

      // Reset selected item
      setSelectedItem(null)

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Adjust stock
  const handleAdjustStock = () => {
    if (!selectedItem) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const index = inventoryData.findIndex((item) => item.id === selectedItem.id)
      if (index !== -1) {
        const newQuantity = selectedItem.quantity + stockAdjustment.quantity
        const newstockStatus = newQuantity > 20 ? "in-stock" : newQuantity > 0 ? "low-stock" : "out-of-stock"

        inventoryData[index] = {
          ...selectedItem,
          quantity: newQuantity,
          stockStatus: newstockStatus,
          lastUpdated: new Date(),
        }
      }

      // Close dialog
      setIsAdjustStockDialogOpen(false)

      // Show success toast
      toast({
        title: "Stock Adjusted",
        description: `${selectedItem.name} stock has been ${stockAdjustment.quantity >= 0 ? "increased" : "decreased"} by ${Math.abs(stockAdjustment.quantity)} ${selectedItem.unit}(s).`,
      })

      // Reset form and selected item
      setStockAdjustment({
        quantity: 0,
        reason: "restock",
      })
      setSelectedItem(null)

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Export inventory
  const handleExportInventory = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Inventory Exported",
        description: "Inventory data has been exported successfully.",
      })

      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-4">
      {/* Organization Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-600" />
            <div>
              <h3 className="font-semibold text-lg">{organization?.name || store?.name || "Inventory Management"}</h3>
              <p className="text-sm text-muted-foreground">
                {user?.user_metadata?.name || user?.email} • {inventory.length} items tracked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <TrendingUp className="h-3 w-3 mr-1" />
              {inventory.filter(item => item.stockStatus === "in-stock").length} In Stock
            </Badge>
            {lowStockAlerts.length > 0 && (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {lowStockAlerts.length} Low Stock
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockAlerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-5 w-5 text-amber-600" />
            <h4 className="font-medium text-amber-800 dark:text-amber-200">Low Stock Alerts</h4>
          </div>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {lowStockAlerts.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded border">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.quantity} {item.unit} remaining
                  </p>
                </div>
                <Badge variant={item.stockStatus === "out-of-stock" ? "destructive" : "secondary"}>
                  {item.stockStatus.replace("-", " ")}
                </Badge>
              </div>
            ))}
          </div>
          {lowStockAlerts.length > 6 && (
            <p className="text-sm text-muted-foreground mt-2">
              +{lowStockAlerts.length - 6} more items need attention
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search inventory..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Produce">Produce</SelectItem>
              <SelectItem value="Bakery">Bakery</SelectItem>
              <SelectItem value="Dairy">Dairy</SelectItem>
              <SelectItem value="Meat">Meat</SelectItem>
              <SelectItem value="Beverages">Beverages</SelectItem>
              <SelectItem value="Household">Household</SelectItem>
            </SelectContent>
          </Select>

          <Select value={stockStatusFilter} onValueChange={setstockStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="stockStatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stockStatuses</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleExportInventory} disabled={isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Export Inventory
        </Button>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center justify-center text-muted-foreground">
            <svg
              className="animate-spin h-8 w-8 mb-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>Loading inventory...</span>
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
                      ID
                      {sortField === "id" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                    <div className="flex items-center">
                      Name
                      {sortField === "name" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("category")}>
                    <div className="flex items-center">
                      Category
                      {sortField === "category" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("quantity")}>
                    <div className="flex items-center justify-end">
                      Quantity
                      {sortField === "quantity" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("price")}>
                    <div className="flex items-center justify-end">
                      Price
                      {sortField === "price" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("supplier")}>
                    <div className="flex items-center">
                      Supplier
                      {sortField === "supplier" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("stockStatus")}>
                    <div className="flex items-center">
                      Stock Status
                      {sortField === "stockStatus" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length > 0 ? (
                  currentItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell className="text-right">
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: store?.currency || organization?.settings?.currency || 'USD'
                        }).format(item.price)}
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell>{getstockStatusBadge(item.stockStatus)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {item.stockStatus === "low-stock" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-600 hover:text-blue-700"
                              onClick={() => {
                                // Quick reorder action
                                toast({
                                  title: "Reorder Initiated",
                                  description: `Reorder request sent for ${item.name}`,
                                })
                              }}
                            >
                              Reorder
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item)
                              setIsAdjustStockDialogOpen(true)
                            }}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedItem(item)
                              setIsEditDialogOpen(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => {
                              setSelectedItem(item)
                              setIsDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No inventory items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, inventory.length)} of {inventory.length} items
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
          </div>
        </>
      )}

      {/* Add Item Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Add a new item to your inventory. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input
                  id="name"
                  value={newItem.name || ""}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Produce">Produce</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Dairy">Dairy</SelectItem>
                    <SelectItem value="Meat">Meat</SelectItem>
                    <SelectItem value="Beverages">Beverages</SelectItem>
                    <SelectItem value="Household">Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="quantity">Quantity (Stock)</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  value={newItem.quantity || 0}
                  onChange={(e) => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="unit">Unit</Label>
                <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="g">Gram (g)</SelectItem>
                    <SelectItem value="lb">Pound (lb)</SelectItem>
                    <SelectItem value="oz">Ounce (oz)</SelectItem>
                    <SelectItem value="l">Liter (l)</SelectItem>
                    <SelectItem value="ml">Milliliter (ml)</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="can">Can</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="price">Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={newItem.price || 0}
                  onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={newItem.supplier || ""}
                onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
              />
              <div className="grid gap-2">
                <Label htmlFor="price">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  step="1"
                  value={newItem.minStockLevel || 0}
                  onChange={(e) => setNewItem({ ...newItem, minStockLevel: Number(e.target.value) })}
                />
              </div>
          </div>
        </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!newItem.name || !newItem.supplier}>
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      {selectedItem && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>Make changes to the inventory item. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Item Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedItem.name}
                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">Category</Label>
                  <Select
                    value={selectedItem.category}
                    onValueChange={(value) => setSelectedItem({ ...selectedItem, category: value })}
                  >
                    <SelectTrigger id="edit-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Produce">Produce</SelectItem>
                      <SelectItem value="Bakery">Bakery</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Meat">Meat</SelectItem>
                      <SelectItem value="Beverages">Beverages</SelectItem>
                      <SelectItem value="Household">Household</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-quantity">Quantity (Stock)</Label>
                  <Input
                    id="edit-quantity"
                    type="number"
                    min="0"
                    value={selectedItem.quantity}
                    onChange={(e) => setSelectedItem({ ...selectedItem, quantity: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-unit">Unit</Label>
                  <Select
                    value={selectedItem.unit}
                    onValueChange={(value) => setSelectedItem({ ...selectedItem, unit: value })}
                  >
                    <SelectTrigger id="edit-unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="g">Gram (g)</SelectItem>
                      <SelectItem value="lb">Pound (lb)</SelectItem>
                      <SelectItem value="oz">Ounce (oz)</SelectItem>
                      <SelectItem value="l">Liter (l)</SelectItem>
                      <SelectItem value="ml">Milliliter (ml)</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="bottle">Bottle</SelectItem>
                      <SelectItem value="can">Can</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-price">Price ($)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={selectedItem.price}
                    onChange={(e) => setSelectedItem({ ...selectedItem, price: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-supplier">Supplier</Label>
                <Input
                  id="edit-supplier"
                  value={selectedItem.supplier}
                  onChange={(e) => setSelectedItem({ ...selectedItem, supplier: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">                
                <div className="grid gap-2">
                  <Label htmlFor="edit-stockStatus">stockStatus</Label>
                  <Select
                    value={selectedItem.stockStatus}
                    onValueChange={(value: InventoryItem["stockStatus"]) =>
                      setSelectedItem({ ...selectedItem, stockStatus: value })
                    }
                  >
                    <SelectTrigger id="edit-stockStatus">
                      <SelectValue placeholder="Select stockStatus" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in-stock">In Stock</SelectItem>
                      <SelectItem value="low-stock">Low Stock</SelectItem>
                      <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                <Label htmlFor="price">Min Stock Level</Label>
                <Input
                  id="minStockLevel"
                  type="number"
                  min="0"
                  step="1"
                  value={selectedItem.minStockLevel}
                  onChange={(e) => setSelectedItem({ ...selectedItem, minStockLevel: Number(e.target.value) })}
                />
              </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditItem}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Item Dialog */}
      {selectedItem && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Inventory Item</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this item? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <AlertTriangle className="h-24 w-24 text-red-500" />
                <div>
                  <h3 className="font-medium">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">ID: {selectedItem.id}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedItem.quantity} {selectedItem.unit} • ${selectedItem.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteItem}>
                Delete Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Adjust Stock Dialog */}
      {selectedItem && (
        <Dialog open={isAdjustStockDialogOpen} onOpenChange={setIsAdjustStockDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adjust Stock</DialogTitle>
              <DialogDescription>Update the stock quantity for {selectedItem.name}.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 p-4 border rounded-md">
                <div>
                  <h3 className="font-medium">{selectedItem.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Current Stock: {selectedItem.quantity} {selectedItem.unit}
                  </p>
                  <p className="text-sm text-muted-foreground">stockStatus: {selectedItem.stockStatus.replace("-", " ")}</p>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="adjustment">Quantity Adjustment</Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, quantity: stockAdjustment.quantity - 1 })}
                  >
                    -
                  </Button>
                  <Input
                    id="adjustment"
                    type="number"
                    value={stockAdjustment.quantity}
                    onChange={(e) => setStockAdjustment({ ...stockAdjustment, quantity: Number(e.target.value) })}
                    className="text-center"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setStockAdjustment({ ...stockAdjustment, quantity: stockAdjustment.quantity + 1 })}
                  >
                    +
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  New Stock: {selectedItem.quantity + stockAdjustment.quantity} {selectedItem.unit}
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason for Adjustment</Label>
                <Select
                  value={stockAdjustment.reason}
                  onValueChange={(value) => setStockAdjustment({ ...stockAdjustment, reason: value })}
                >
                  <SelectTrigger id="reason">
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restock">Restock</SelectItem>
                    <SelectItem value="sale">Sale</SelectItem>
                    <SelectItem value="return">Return</SelectItem>
                    <SelectItem value="damage">Damage/Loss</SelectItem>
                    <SelectItem value="correction">Inventory Correction</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAdjustStockDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustStock} disabled={stockAdjustment.quantity === 0}>
                Update Stock
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

