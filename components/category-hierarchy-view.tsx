"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ChevronRight, ChevronDown, Plus, Edit, Trash2, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

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
}

// Sample data - same as in categories-table.tsx
const categoriesData: Category[] = [
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
  },
]

export function CategoryHierarchyView() {
  const { toast } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({})
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    description: "",
    status: "active",
    displayOrder: 1,
    parentCategory: null,
    productCount: 0,
  })

  useEffect(() => {
    setIsLoading(true)

    // Simulate API call delay
    const timer = setTimeout(() => {
      let filteredData = [...categoriesData]

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

      // Sort by display order
      filteredData.sort((a, b) => a.displayOrder - b.displayOrder)

      setCategories(filteredData)
      setIsLoading(false)

      // Expand all parent categories by default
      const expanded: Record<string, boolean> = {}
      filteredData.forEach((category) => {
        if (category.parentCategory === null) {
          expanded[category.id] = true
        }
      })
      setExpandedCategories(expanded)
    }, 600)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }))
  }

  const getChildCategories = (parentId: string) => {
    return categories.filter((category) => category.parentCategory === parentId)
  }

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

  // Add new category
  const handleAddCategory = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      const newId = `CAT-${String(categoriesData.length + 1).padStart(3, "0")}`
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
      }

      categoriesData.unshift(categoryToAdd)

      // Reset form and close dialog
      setNewCategory({
        name: "",
        description: "",
        status: "active",
        displayOrder: 1,
        parentCategory: null,
        productCount: 0,
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
      const index = categoriesData.findIndex((category) => category.id === selectedCategory.id)
      if (index !== -1) {
        categoriesData[index] = {
          ...selectedCategory,
          updatedAt: new Date(),
        }
      }

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
      const index = categoriesData.findIndex((category) => category.id === selectedCategory.id)
      if (index !== -1) {
        categoriesData.splice(index, 1)
      }

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

  const renderCategoryTree = (parentId: string | null = null, level = 0) => {
    const filteredCategories = categories.filter((category) => category.parentCategory === parentId)

    if (filteredCategories.length === 0) {
      return null
    }

    return (
      <div className={`space-y-2 ${level > 0 ? "ml-6 mt-2 border-l pl-4" : ""}`}>
        {filteredCategories.map((category) => {
          const hasChildren = getChildCategories(category.id).length > 0
          const isExpanded = expandedCategories[category.id]

          return (
            <div key={category.id} className="space-y-2">
              <div className="flex items-center justify-between rounded-md border p-2 hover:bg-muted/50">
                <div className="flex items-center gap-2">
                  {hasChildren ? (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => toggleExpand(category.id)}>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  ) : (
                    <div className="w-6" />
                  )}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{category.name}</span>
                      {getStatusBadge(category.status)}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {category.productCount} products • ID: {category.id}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => {
                      setSelectedCategory(category)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setNewCategory({
                            ...newCategory,
                            parentCategory: category.id,
                          })
                        }}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              </div>
              {hasChildren && isExpanded && renderCategoryTree(category.id, level + 1)}
            </div>
          )
        })}
      </div>
    )
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

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Root Category
            </Button>
          </DialogTrigger>
        </Dialog>
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
        <div className="rounded-md border">
          <Card>
            <CardContent className="p-6">
              {categories.filter((category) => category.parentCategory === null).length > 0 ? (
                renderCategoryTree()
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No categories found</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    {searchQuery
                      ? "No categories match your search criteria."
                      : "You haven't created any categories yet."}
                  </p>
                  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Category
                      </Button>
                    </DialogTrigger>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Add a new product category. Click save when you're done.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
                    {categoriesData
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCategory} disabled={!newCategory.name}>
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      {selectedCategory && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
              <DialogDescription>Make changes to the category. Click save when you're done.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
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
                      {categoriesData
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
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditCategory}>Save Changes</Button>
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
                {categoriesData.some((cat) => cat.parentCategory === selectedCategory.id) && (
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
              <Button variant="destructive" onClick={handleDeleteCategory}>
                Delete Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
