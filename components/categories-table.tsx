"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Search, Edit, Trash2, Plus, ArrowUpDown, Download, AlertTriangle, RefreshCw } from "lucide-react"
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
import { ImageUpload } from "@/components/image-upload"

interface Category {
  id: string
  name: string
  description: string
  status: "active" | "inactive"
  productCount: number
  displayOrder: number
  parentCategory: string | null
  createdAt: Date
  updatedAt: Date
  image: string
}

// Sample data
const initialCategoriesData: Category[] = [
  {
    id: "CAT-001",
    name: "Produce",
    description: "Fresh fruits and vegetables",
    status: "active",
    productCount: 42,
    displayOrder: 1,
    parentCategory: null,
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2025, 2, 28),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-002",
    name: "Bakery",
    description: "Fresh baked goods including bread, pastries, and cakes",
    status: "active",
    productCount: 28,
    displayOrder: 2,
    parentCategory: null,
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2025, 2, 26),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-003",
    name: "Dairy",
    description: "Milk, cheese, yogurt, and other dairy products",
    status: "active",
    productCount: 35,
    displayOrder: 3,
    parentCategory: null,
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2025, 2, 25),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-004",
    name: "Meat",
    description: "Fresh and frozen meat products",
    status: "active",
    productCount: 22,
    displayOrder: 4,
    parentCategory: null,
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2025, 2, 24),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-005",
    name: "Beverages",
    description: "Drinks including water, juice, soda, and coffee",
    status: "active",
    productCount: 52,
    displayOrder: 5,
    parentCategory: null,
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2025, 2, 23),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-006",
    name: "Household",
    description: "Cleaning supplies, paper products, and other home essentials",
    status: "active",
    productCount: 45,
    displayOrder: 6,
    parentCategory: null,
    createdAt: new Date(2024, 9, 15),
    updatedAt: new Date(2025, 2, 22),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-007",
    name: "Organic Produce",
    description: "Certified organic fruits and vegetables",
    status: "active",
    productCount: 18,
    displayOrder: 1,
    parentCategory: "CAT-001",
    createdAt: new Date(2024, 9, 16),
    updatedAt: new Date(2025, 2, 21),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-008",
    name: "Artisan Bread",
    description: "Specialty and artisanal bread products",
    status: "active",
    productCount: 12,
    displayOrder: 1,
    parentCategory: "CAT-002",
    createdAt: new Date(2024, 9, 16),
    updatedAt: new Date(2025, 2, 20),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-009",
    name: "Seasonal Items",
    description: "Limited time seasonal products",
    status: "inactive",
    productCount: 0,
    displayOrder: 7,
    parentCategory: null,
    createdAt: new Date(2024, 9, 17),
    updatedAt: new Date(2025, 2, 19),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-010",
    name: "Imported Cheese",
    description: "Specialty cheeses from around the world",
    status: "active",
    productCount: 15,
    displayOrder: 1,
    parentCategory: "CAT-003",
    createdAt: new Date(2024, 9, 18),
    updatedAt: new Date(2025, 2, 18),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-011",
    name: "Gluten-Free",
    description: "Products made without gluten",
    status: "active",
    productCount: 25,
    displayOrder: 8,
    parentCategory: null,
    createdAt: new Date(2024, 9, 19),
    updatedAt: new Date(2025, 2, 17),
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "CAT-012",
    name: "Plant-Based",
    description: "Vegetarian and vegan alternatives",
    status: "active",
    productCount: 32,
    displayOrder: 9,
    parentCategory: null,
    createdAt: new Date(2024, 9, 20),
    updatedAt: new Date(2025, 2, 16),
    image: "/placeholder.svg?height=100&width=100",
  },
]

// Load categories from localStorage or use initial data
const loadCategories = (): Category[] => {
  if (typeof window === "undefined") return initialCategoriesData

  try {
    const savedCategories = localStorage.getItem("inventory-categories")
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories)
      // Convert string dates back to Date objects
      return parsed.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      }))
    }
    return initialCategoriesData
  } catch (error) {
    console.error("Error loading categories from localStorage:", error)
    return initialCategoriesData
  }
}

// Save categories to localStorage
const saveCategories = (categories: Category[]) => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem("inventory-categories", JSON.stringify(categories))
  } catch (error) {
    console.error("Error saving categories to localStorage:", error)
  }
}

export function CategoriesTable() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>(loadCategories())
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [parentFilter, setParentFilter] = useState("all")
  const [sortField, setSortField] = useState<keyof Category>("displayOrder")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
    status: "active",
    displayOrder: 1,
    parentCategory: null,
    productCount: 0,
    image: "/placeholder.svg?height=100&width=100",
  })

  // Save categories to localStorage when they change
  useEffect(() => {
    saveCategories(categories)
  }, [categories])

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      let filteredData = [...categories]

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredData = filteredData.filter(
          (category) =>
            category.name.toLowerCase().includes(query) ||
            category.id.toLowerCase().includes(query) ||
            category.description.toLowerCase().includes(query),
        )
      }

      // Filter by status
      if (statusFilter !== "all") {
        filteredData = filteredData.filter((category) => category.status === statusFilter)
      }

      // Filter by parent category
      if (parentFilter !== "all") {
        if (parentFilter === "parent") {
          filteredData = filteredData.filter((category) => category.parentCategory === null)
        } else if (parentFilter === "sub") {
          filteredData = filteredData.filter((category) => category.parentCategory !== null)
        } else {
          filteredData = filteredData.filter((category) => category.parentCategory === parentFilter)
        }
      }

      // Sort data
      filteredData.sort((a, b) => {
        if (sortField === "updatedAt" || sortField === "createdAt") {
          return sortDirection === "asc"
            ? a[sortField].getTime() - b[sortField].getTime()
            : b[sortField].getTime() - a[sortField].getTime()
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

      setCategories(filteredData)
      setIsLoading(false)
    }, 600)

    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter, parentFilter, sortField, sortDirection])

  const getStatusBadge = (status: Category["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Inactive</Badge>
      default:
        return null
    }
  }

  const getParentCategoryName = (parentId: string | null) => {
    if (!parentId) return "—"
    const parent = categories.find((cat) => cat.id === parentId)
    return parent ? parent.name : "Unknown"
  }

  const handleSort = (field: keyof Category) => {
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
  const currentItems = categories.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(categories.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // Add new category
  const handleAddCategory = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newId = `CAT-${String(categories.length + 1).padStart(3, "0")}`
      const categoryToAdd: Category = {
        id: newId,
        name: newCategory.name || "",
        description: newCategory.description || "",
        status: newCategory.status || "active",
        productCount: 0,
        displayOrder: newCategory.displayOrder || 1,
        parentCategory: newCategory.parentCategory,
        createdAt: new Date(),
        updatedAt: new Date(),
        image: newCategory.image || "/placeholder.svg?height=100&width=100",
      }

      setCategories([categoryToAdd, ...categories])

      // Reset form and close dialog
      setNewCategory({
        name: "",
        description: "",
        status: "active",
        displayOrder: 1,
        parentCategory: null,
        productCount: 0,
        image: "/placeholder.svg?height=100&width=100",
      })
      setIsAddDialogOpen(false)

      // Show success toast
      toast({
        title: "Category Added",
        description: `${categoryToAdd.name} has been added to categories.`,
      })

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Edit category
  const handleEditCategory = () => {
    if (!selectedCategory) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const updatedCategories = categories.map((category) =>
        category.id === selectedCategory.id ? { ...selectedCategory, updatedAt: new Date() } : category,
      )

      setCategories(updatedCategories)

      // Close dialog
      setIsEditDialogOpen(false)
      setSelectedCategory(null)

      // Show success toast
      toast({
        title: "Category Updated",
        description: `${selectedCategory.name} has been updated.`,
      })

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Delete category
  const handleDeleteCategory = () => {
    if (!selectedCategory) return

    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setCategories(categories.filter((category) => category.id !== selectedCategory.id))

      // Close dialog
      setIsDeleteDialogOpen(false)

      // Show success toast
      toast({
        title: "Category Deleted",
        description: `${selectedCategory.name} has been removed from categories.`,
      })

      // Reset selected category
      setSelectedCategory(null)

      // Refresh data
      setIsLoading(false)
    }, 800)
  }

  // Export categories
  const handleExportCategories = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Categories Exported",
        description: "Categories data has been exported successfully.",
      })

      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={parentFilter} onValueChange={setParentFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="parent">Parent Categories</SelectItem>
              <SelectItem value="sub">Subcategories</SelectItem>
              {categories
                .filter((cat) => cat.parentCategory === null)
                .map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    Children of {category.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleExportCategories} disabled={isLoading}>
          <Download className="mr-2 h-4 w-4" />
          Export Categories
        </Button>

        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
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
            <span>Loading categories...</span>
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
                  <TableHead>Image</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort("parentCategory")}>
                    <div className="flex items-center">
                      Parent Category
                      {sortField === "parentCategory" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("productCount")}>
                    <div className="flex items-center justify-end">
                      Products
                      {sortField === "productCount" && (
                        <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead className="text-right cursor-pointer" onClick={() => handleSort("displayOrder")}>
                    <div className="flex items-center justify-end">
                      Order
                      {sortField === "displayOrder" && (
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
                  currentItems.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">{category.id}</TableCell>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>
                        <div className="h-10 w-10 rounded-md overflow-hidden">
                          <img
                            src={category.image || "/placeholder.svg"}
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={category.description}>
                        {category.description}
                      </TableCell>
                      <TableCell>{getParentCategoryName(category.parentCategory)}</TableCell>
                      <TableCell className="text-right">{category.productCount}</TableCell>
                      <TableCell className="text-right">{category.displayOrder}</TableCell>
                      <TableCell>{getStatusBadge(category.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedCategory(category)
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
                              setSelectedCategory(category)
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
                    <TableCell colSpan={9} className="h-24 text-center">
                      No categories found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, categories.length)} of {categories.length}{" "}
              categories
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

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Add a new product category. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4  md:grid-cols-2">
            <div className="grid gap-4">
              <Label>Category Image</Label>
              <ImageUpload
                initialImage={newCategory.image}
                onImageChange={(imageData) =>
                  setNewCategory({ ...newCategory, image: imageData || "/placeholder.svg?height=100&width=100" })
                }
                aspectRatio={1}
                entityName="category"
                enableGallerySelection={true}
              />
            </div>

            <div className="grid md:gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={newCategory.name || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCategory.description || ""}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="parentCategory">Parent Category</Label>
                  <Select
                    value={newCategory.parentCategory || "none"}
                    onValueChange={(value) =>
                      setNewCategory({ ...newCategory, parentCategory: value === "none" ? null : value })
                    }
                  >
                    <SelectTrigger id="parentCategory">
                      <SelectValue placeholder="Select parent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {categories
                        .filter((cat) => cat.parentCategory === null)
                        .map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newCategory.status}
                    onValueChange={(value: Category["status"]) => setNewCategory({ ...newCategory, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  min="1"
                  value={newCategory.displayOrder || 1}
                  onChange={(e) => setNewCategory({ ...newCategory, displayOrder: Number(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">Categories are sorted by this number in ascending order.</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategory.name || isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Category"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Make changes to the category. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4  md:grid-cols-2">
              <div className="grid gap-4">
                <Label>Category Image</Label>
                <ImageUpload
                  initialImage={selectedCategory.image}
                  onImageChange={(imageData) =>
                    setSelectedCategory({
                      ...selectedCategory,
                      image: imageData || "/placeholder.svg?height=100&width=100",
                    })
                  }
                  aspectRatio={1}
                  entityName="category"
                  enableGallerySelection={true}
                />
              </div>

              <div className="grid md:gap-4">                
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Category Name</Label>
                  <Input
                    id="edit-name"
                    value={selectedCategory.name}
                    onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedCategory.description}
                    onChange={(e) => setSelectedCategory({ ...selectedCategory, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-parentCategory">Parent Category</Label>
                    <Select
                      value={selectedCategory.parentCategory || "none"}
                      onValueChange={(value) =>
                        setSelectedCategory({
                          ...selectedCategory,
                          parentCategory: value === "none" ? null : value,
                        })
                      }
                    >
                      <SelectTrigger id="edit-parentCategory">
                        <SelectValue placeholder="Select parent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {categories
                          .filter((cat) => cat.parentCategory === null && cat.id !== selectedCategory.id)
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={selectedCategory.status}
                      onValueChange={(value: Category["status"]) =>
                        setSelectedCategory({ ...selectedCategory, status: value })
                      }
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-displayOrder">Display Order</Label>
                  <Input
                    id="edit-displayOrder"
                    type="number"
                    min="1"
                    value={selectedCategory.displayOrder}
                    onChange={(e) => setSelectedCategory({ ...selectedCategory, displayOrder: Number(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Categories are sorted by this number in ascending order.
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCategory} disabled={isLoading}>
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

      {/* Delete Category Dialog */}
      {selectedCategory && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Category</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this category? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex items-center space-x-2 text-amber-600">
                <AlertTriangle className="h-5 w-5" />
                <div className="font-medium">Warning</div>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                Deleting a category may impact products assigned to this category and could affect your store's
                navigation.
                {selectedCategory.productCount > 0 && (
                  <p className="mt-2 font-semibold">
                    This category contains {selectedCategory.productCount} products that will need to be reassigned.
                  </p>
                )}
                {categories.some((cat) => cat.parentCategory === selectedCategory.id) && (
                  <p className="mt-2 font-semibold">
                    Warning: This category has subcategories that will also be affected.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteCategory} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Category"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
