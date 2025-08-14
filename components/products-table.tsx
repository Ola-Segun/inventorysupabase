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
  Eye,
  MoreHorizontal,
  Copy,
  Download,
  Plus,
  Barcode,
  QrCode,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast, useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
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
import { Textarea } from "@/components/ui/textarea"
import { BarcodeGenerator } from "@/components/barcode-generator"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { ImageUpload } from "@/components/image-upload"
import { useEffect } from "react"

import { useProducts } from "@/hooks/useProducts"
import { productService } from "@/services/productService"

interface Product {
  id: string
  name: string
  sku: string
  category: string
  category_id: number
  stock: number
  price: number
  cost: number
  status: "active" | "draft" | "archived"
  image: string
  description?: string
  created_at: string
  updated_at: string
  barcode?: string
}



// const { data } = await api.get('/products')

const initialProducts: Product[] = [
  {
    id: "1",
    name: "Organic Apples",
    sku: "PRD-001",
    category: "Produce",
    stock: 45,
    price: 2.99,
    cost: 1.5,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Fresh organic apples sourced from local farms. Rich in flavor and nutrients.",
  },
  {
    id: "2",
    name: "Whole Wheat Bread",
    sku: "PRD-002",
    category: "Bakery",
    stock: 12,
    price: 3.49,
    cost: 1.75,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Freshly baked whole wheat bread made with organic flour.",
  },
  {
    id: "3",
    name: "Organic Milk",
    sku: "PRD-003",
    category: "Dairy",
    stock: 24,
    price: 4.99,
    cost: 3.25,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Organic whole milk from grass-fed cows. No hormones or antibiotics.",
  },
  {
    id: "4",
    name: "Chicken Breast",
    sku: "PRD-004",
    category: "Meat",
    stock: 8,
    price: 8.99,
    cost: 5.5,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Premium chicken breast, free-range and hormone-free.",
  },
  {
    id: "5",
    name: "Sparkling Water",
    sku: "PRD-005",
    category: "Beverages",
    stock: 36,
    price: 1.49,
    cost: 0.75,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Refreshing sparkling water with natural minerals.",
  },
  {
    id: "6",
    name: "Chocolate Cake",
    sku: "PRD-006",
    category: "Bakery",
    stock: 0,
    price: 15.99,
    cost: 8.25,
    status: "draft",
    image: "/placeholder.svg?height=40&width=40",
    description: "Rich chocolate cake with premium cocoa and a smooth ganache topping.",
  },
  {
    id: "7",
    name: "Fresh Strawberries",
    sku: "PRD-007",
    category: "Produce",
    stock: 5,
    price: 4.99,
    cost: 2.75,
    status: "archived",
    image: "/placeholder.svg?height=40&width=40",
    description: "Sweet and juicy strawberries, perfect for desserts or snacking.",
  },
  {
    id: "8",
    name: "Cheddar Cheese",
    sku: "PRD-008",
    category: "Dairy",
    stock: 18,
    price: 5.49,
    cost: 3.25,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Aged cheddar cheese with a sharp flavor profile.",
  },
  {
    id: "9",
    name: "Ground Beef",
    sku: "PRD-009",
    category: "Meat",
    stock: 15,
    price: 7.99,
    cost: 4.5,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Premium ground beef, 85% lean, perfect for burgers and meatloaf.",
  },
  {
    id: "10",
    name: "Orange Juice",
    sku: "PRD-010",
    category: "Beverages",
    stock: 24,
    price: 3.99,
    cost: 2.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Freshly squeezed orange juice, no added sugars or preservatives.",
  },
    {
    id: "11",
    name: "Choco",
    sku: "PRD-010",
    category: "Beverages",
    stock: 24,
    price: 3.99,
    cost: 2.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Freshly squeezed orange juice, no added sugars or preservatives.",
  },
    {
    id: "12",
    name: "Detergent",
    sku: "PRD-010",
    category: "Soap",
    stock: 24,
    price: 3.99,
    cost: 2.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Freshly squeezed orange juice, no added sugars or preservatives.",
  },
    {
    id: "13",
    name: "Shoe",
    sku: "PRD-010",
    category: "FootWares",
    stock: 24,
    price: 3.99,
    cost: 2.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Freshly squeezed orange juice, no added sugars or preservatives.",
  },
  {
    id: "14",
    name: "Banana",
    sku: "PRD-011",
    category: "Produce",
    stock: 60,
    price: 1.99,
    cost: 1.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Fresh bananas, perfect for snacking.",
  },
  {
    id: "15",
    name: "Greek Yogurt",
    sku: "PRD-012",
    category: "Dairy",
    stock: 30,
    price: 5.99,
    cost: 3.5,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Creamy Greek yogurt, high in protein.",
  },
  {
    id: "16",
    name: "Almond Milk",
    sku: "PRD-013",
    category: "Beverages",
    stock: 20,
    price: 3.49,
    cost: 2.1,
    status: "draft",
    image: "/placeholder.svg?height=40&width=40",
    description: "Dairy-free almond milk.",
  },
  {
    id: "17",
    name: "Sourdough Bread",
    sku: "PRD-014",
    category: "Bakery",
    stock: 15,
    price: 4.49,
    cost: 2.5,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Artisan sourdough bread.",
  },
  {
    id: "18",
    name: "Turkey Breast",
    sku: "PRD-015",
    category: "Meat",
    stock: 12,
    price: 9.99,
    cost: 6.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Lean turkey breast, oven roasted.",
  },
  {
    id: "19",
    name: "Sparkling Lemonade",
    sku: "PRD-016",
    category: "Beverages",
    stock: 40,
    price: 2.49,
    cost: 1.2,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Refreshing sparkling lemonade.",
  },
  {
    id: "20",
    name: "Butter Croissant",
    sku: "PRD-017",
    category: "Bakery",
    stock: 22,
    price: 2.99,
    cost: 1.4,
    status: "draft",
    image: "/placeholder.svg?height=40&width=40",
    description: "Flaky butter croissant.",
  },
  {
    id: "21",
    name: "Mozzarella Cheese",
    sku: "PRD-018",
    category: "Dairy",
    stock: 18,
    price: 6.49,
    cost: 4.0,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "Fresh mozzarella cheese.",
  },
  {
    id: "22",
    name: "Ground Turkey",
    sku: "PRD-019",
    category: "Meat",
    stock: 10,
    price: 8.49,
    cost: 5.0,
    status: "archived",
    image: "/placeholder.svg?height=40&width=40",
    description: "Lean ground turkey.",
  },
  {
    id: "23",
    name: "Apple Juice",
    sku: "PRD-020",
    category: "Beverages",
    stock: 25,
    price: 3.49,
    cost: 1.8,
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
    description: "100% apple juice.",
  },
]

// Modify the saveProducts function to handle large data more efficiently
const saveProducts = (products: Product[]) => {
  if (typeof window === "undefined") return

  try {
    // Create a copy of products with optimized image data
    const optimizedProducts = products.map((product) => {
      // If the image is a data URL (base64), store a reference instead
      if (product.image && product.image.startsWith("data:image")) {
        // Store the image separately with a unique key
        const imageKey = `product-image-${product.id}`
        try {
          localStorage.setItem(imageKey, product.image)
        } catch (error) {
          console.error(`Error saving image for product ${product.id}:`, error)
          // If we can't save the image, use a placeholder
          return {
            ...product,
            image: `/placeholder.svg?height=40&width=40`,
          }
        }
        // Store just the reference to the image
        return {
          ...product,
          image: `local-storage-ref:${imageKey}`,
        }
      }
      return product
    })

    // Try to save the optimized products
    localStorage.setItem("inventory-products", JSON.stringify(optimizedProducts))
  } catch (error) {
    console.error("Error saving products to localStorage:", error)

    // If we still have quota issues, try a more aggressive approach
    try {
      // Create a minimal version with just essential data
      const minimalProducts = products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        stock: product.stock,
        price: product.price,
        cost: product.cost,
        status: product.status,
        // Always use placeholder for images in the minimal version
        image: `/placeholder.svg?height=40&width=40`,
      }))
      localStorage.setItem("inventory-products", JSON.stringify(minimalProducts))

      // Show warning that some data couldn't be saved
      toast({
        title: "Storage limitation",
        description: "Some product details couldn't be saved due to storage limitations.",
        variant: "warning",
      })
    } catch (secondError) {
      console.error("Failed to save even minimal product data:", secondError)
      toast({
        title: "Storage error",
        description: "Unable to save product data. Try reducing the number of products.",
        variant: "destructive",
      })
    }
  }
}

// Modify the loadProducts function to handle the image references
const loadProducts = (): Product[] => {
  if (typeof window === "undefined") return initialProducts

  try {
    const savedProducts = localStorage.getItem("inventory-products")
    if (!savedProducts) return initialProducts

    const parsedProducts = JSON.parse(savedProducts)

    // Restore images from separate storage if needed
    return parsedProducts.map((product: Product) => {
      if (product.image && product.image.startsWith("local-storage-ref:")) {
        const imageKey = product.image.replace("local-storage-ref:", "")
        const storedImage = localStorage.getItem(imageKey)

        if (storedImage) {
          return {
            ...product,
            image: storedImage,
          }
        } else {
          // If image reference is broken, use placeholder
          return {
            ...product,
            image: `/placeholder.svg?height=40&width=40`,
          }
        }
      }
      return product
    })
  } catch (error) {
    console.error("Error loading products from localStorage:", error)
    return initialProducts
  }
}

export function ProductsTable() {
  const [products, setProducts] = useState<Product[]>(loadProducts())
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortColumn, setSortColumn] = useState<keyof Product | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isViewProductOpen, setIsViewProductOpen] = useState(false)
  const [isBarcodeGeneratorOpen, setIsBarcodeGeneratorOpen] = useState(false)
  const [isQRCodeGeneratorOpen, setIsQRCodeGeneratorOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    sku: "",
    category: "Produce",
    stock: 0,
    price: 0,
    cost: 0,
    status: "draft",
    image: "/placeholder.svg?height=40&width=40",
    description: "",
  })
  const { toast } = useToast()
  const {realProducts, loading, error} = useProducts()

  if(loading) console.log('Loading...');
  if(error) console.log('Error!!!');

  console.log(realProducts);


  // Save products to localStorage when they change
  useEffect(() => {
    saveProducts(products)
  }, [products])

  // Filter products based on search query and active tab
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    return matchesSearch && product.status === activeTab
  })

  // Sort products based on column and direction
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!sortColumn) return 0

    const aValue = a[sortColumn]
    const bValue = b[sortColumn]

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
    }

    return 0
  })

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage)
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset to first page if filter/search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, activeTab, products.length])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedProducts(filteredProducts.map((product) => product.id))
    } else {
      setSelectedProducts([])
    }
  }

  const handleSelectProduct = (productId: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts([...selectedProducts, productId])
    } else {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    }
  }

  const handleSort = (column: keyof Product) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  const handleBulkDelete = () => {
    if (selectedProducts.length === 0) return

    setProducts(products.filter((product) => !selectedProducts.includes(product.id)))

    toast({
      title: `${selectedProducts.length} products deleted`,
      description: "The selected products have been deleted successfully.",
      variant: "default",
    })

    setSelectedProducts([])
  }

  const handleBulkUpdateStatus = (status: Product["status"]) => {
    if (selectedProducts.length === 0) return

    setProducts(products.map((product) => (selectedProducts.includes(product.id) ? { ...product, status } : product)))

    toast({
      title: `${selectedProducts.length} products updated`,
      description: `The selected products have been marked as ${status}.`,
      variant: "default",
    })
  }

  const handleAddProduct = async () => {
    try {
      // Validate form
      if (!newProduct.name || !newProduct.sku || !newProduct.category) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields.",
          variant: "destructive",
        })
        return
      }

      // Create new product via API
      const response = await productService.createProduct(newProduct);
      
      // Add to local state
      setProducts([...products, response.data]);

      toast({
        title: "Product added",
        description: "The product has been added successfully.",
        variant: "default",
      })

      // Reset form and close dialog
      setNewProduct({
        name: "",
        sku: "",
        category: "Produce", 
        stock: 0,
        price: 0,
        cost: 0,
        status: "draft",
        image: "/placeholder.svg?height=40&width=40",
        description: "",
      })
      setIsAddProductOpen(false)

    } catch (error) {
      console.error('Error adding product:', error);
      toast({
        title: "Error",
        description: "Failed to add product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = () => {
    if (!selectedProduct) return

    // Update product
    setProducts(products.map((product) => (product.id === selectedProduct.id ? selectedProduct : product)))

    // Show success message
    toast({
      title: "Product updated",
      description: "The product has been updated successfully.",
      variant: "default",
    })

    // Close dialog
    setIsEditProductOpen(false)
  }

  const handleDeleteProduct = (productId: string) => {
    // Delete product
    setProducts(products.filter((product) => product.id !== productId))

    // Show success message
    toast({
      title: "Product deleted",
      description: "The product has been deleted successfully.",
      variant: "default",
    })
  }

  const handleDuplicateProduct = (product: Product) => {
    // Create duplicate product with new ID
    const duplicatedProduct: Product = {
      ...product,
      id: `PRD-${Math.floor(Math.random() * 1000)}`,
      name: `${product.name} (Copy)`,
      sku: `${product.sku}-COPY`,
    }

    // Add to products
    setProducts([...products, duplicatedProduct])

    // Show success message
    toast({
      title: "Product duplicated",
      description: "The product has been duplicated successfully.",
      variant: "default",
    })
  }

  const handleGenerateBarcode = (product: Product) => {
    setSelectedProduct(product)
    setIsBarcodeGeneratorOpen(true)
  }

  const handleGenerateQRCode = (product: Product) => {
    setSelectedProduct(product)
    setIsQRCodeGeneratorOpen(true)
  }

  const handleBulkGenerateBarcodes = () => {
    if (selectedProducts.length === 0) return
    setIsBarcodeGeneratorOpen(true)
  }

  const handleImageChange = (productId: string, imageData: string | null) => {
    setProducts(
      products.map((product) =>
        product.id === productId ? { ...product, image: imageData || "/placeholder.svg?height=40&width=40" } : product,
      ),
    )
  }

  const getStatusBadge = (status: Product["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return null
    }
  }

  const getSortIcon = (column: keyof Product) => {
    if (sortColumn !== column) return null
    return sortDirection === "asc" ? "↑" : "↓"
  }

  const handleExportProducts = () => {
    // In a real app, this would export product data to CSV/PDF
    toast({
      title: "Products exported",
      description: "Product data has been exported successfully.",
      variant: "default",
    })
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="draft">Drafts</TabsTrigger>
            <TabsTrigger value="archived">Archived</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8 w-[200px] md:w-[300px]"
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
                <div className="p-2">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs font-medium">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All categories</SelectItem>
                          <SelectItem value="produce">Produce</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                          <SelectItem value="dairy">Dairy</SelectItem>
                          <SelectItem value="meat">Meat</SelectItem>
                          <SelectItem value="beverages">Beverages</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-xs font-medium">Stock Status</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Any stock" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any">Any stock</SelectItem>
                          <SelectItem value="in-stock">In stock</SelectItem>
                          <SelectItem value="low-stock">Low stock</SelectItem>
                          <SelectItem value="out-of-stock">Out of stock</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Add New Product</DialogTitle>
                  <DialogDescription>
                    Enter the product details to add a new product to your inventory.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 md:grid-cols-2">
                  <div className="grid gap-4">
                    <Label>Product Image</Label>
                    <ImageUpload
                      initialImage={newProduct.image}
                      onImageChange={(imageData) =>
                        setNewProduct({ ...newProduct, image: imageData || "/placeholder.svg?height=40&width=40" })
                      }
                      aspectRatio={1}
                      entityName="product"
                      enableGallerySelection={true}
                    />
                  </div>

                  <div className="grid md:gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="sku">SKU *</Label>
                        <Input
                          id="sku"
                          value={newProduct.sku}
                          onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={newProduct.category}
                          onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Produce">Produce</SelectItem>
                            <SelectItem value="Bakery">Bakery</SelectItem>
                            <SelectItem value="Dairy">Dairy</SelectItem>
                            <SelectItem value="Meat">Meat</SelectItem>
                            <SelectItem value="Beverages">Beverages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={newProduct.status}
                          onValueChange={(value: Product["status"]) => setNewProduct({ ...newProduct, status: value })}
                        >
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="stock">Stock Quantity</Label>
                        <Input
                          id="stock"
                          type="number"
                          min="0"
                          value={newProduct.stock?.toString() || "0"}
                          onChange={(e) => setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value) || 0 })}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.price?.toString() || "0"}
                          onChange={(e) =>
                            setNewProduct({ ...newProduct, price: Number.parseFloat(e.target.value) || 0 })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="cost">Cost ($)</Label>
                        <Input
                          id="cost"
                          type="number"
                          min="0"
                          step="0.01"
                          value={newProduct.cost?.toString() || "0"}
                          onChange={(e) => setNewProduct({ ...newProduct, cost: Number.parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddProduct}>Add Product</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          {renderProductsTable(paginatedProducts, sortedProducts.length, totalPages, currentPage, setCurrentPage)}
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          {renderProductsTable(paginatedProducts, sortedProducts.length, totalPages, currentPage, setCurrentPage)}
        </TabsContent>

        <TabsContent value="draft" className="mt-4">
          {renderProductsTable(paginatedProducts, sortedProducts.length, totalPages, currentPage, setCurrentPage)}
        </TabsContent>

        <TabsContent value="archived" className="mt-4">
          {renderProductsTable(paginatedProducts, sortedProducts.length, totalPages, currentPage, setCurrentPage)}
        </TabsContent>
      </Tabs>

      {/* View Product Dialog */}
      {selectedProduct && (
        <Dialog open={isViewProductOpen} onOpenChange={setIsViewProductOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Product Details</DialogTitle>
              <DialogDescription>Detailed information about the selected product.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={selectedProduct.image || "/placeholder.svg"}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedProduct.sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Category</h4>
                  <p>{selectedProduct.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Status</h4>
                  <div className="mt-1">{getStatusBadge(selectedProduct.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <h4 className="text-sm font-medium">Stock</h4>
                  <p
                    className={cn(
                      selectedProduct.stock === 0
                        ? "text-destructive"
                        : selectedProduct.stock < 10
                          ? "text-amber-500"
                          : "",
                    )}
                  >
                    {selectedProduct.stock}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Price</h4>
                  <p>${selectedProduct.price.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Cost</h4>
                  <p>${selectedProduct.cost.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm mt-1">{selectedProduct.description || "No description available."}</p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewProductOpen(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setIsViewProductOpen(false)
                  setIsEditProductOpen(true)
                }}
              >
                Edit Product
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Edit Product</DialogTitle>
              <DialogDescription>Update the product details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 grid-cols-2">
              <div className="grid gap-4">
                <Label>Product Image</Label>
                <ImageUpload
                  initialImage={selectedProduct.image}
                  onImageChange={(imageData) =>
                    setSelectedProduct({
                      ...selectedProduct,
                      image: imageData || "/placeholder.svg?height=40&width=40",
                    })
                  }
                  aspectRatio={1}
                  entityName="product"
                  enableGallerySelection={true}
                />
              </div>

              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">Product Name</Label>
                    <Input
                      id="edit-name"
                      value={selectedProduct.name}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, name: e.target.value })}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sku">SKU</Label>
                    <Input
                      id="edit-sku"
                      value={selectedProduct.sku}
                      onChange={(e) => setSelectedProduct({ ...selectedProduct, sku: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={selectedProduct.category}
                      onValueChange={(value) => setSelectedProduct({ ...selectedProduct, category: value })}
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
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={selectedProduct.status}
                      onValueChange={(value: Product["status"]) =>
                        setSelectedProduct({ ...selectedProduct, status: value })
                      }
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-stock">Stock Quantity</Label>
                    <Input
                      id="edit-stock"
                      type="number"
                      min="0"
                      disabled
                      value={selectedProduct.stock.toString()}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, stock: Number.parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-price">Price ($)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedProduct.price.toString()}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, price: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-cost">Cost ($)</Label>
                    <Input
                      id="edit-cost"
                      type="number"
                      min="0"
                      step="0.01"
                      value={selectedProduct.cost.toString()}
                      onChange={(e) =>
                        setSelectedProduct({ ...selectedProduct, cost: Number.parseFloat(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={selectedProduct.description || ""}
                    onChange={(e) => setSelectedProduct({ ...selectedProduct, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleEditProduct}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Barcode Generator Dialog */}
      <BarcodeGenerator
        product={selectedProduct || undefined}
        products={selectedProducts.length > 0 ? products.filter((p) => selectedProducts.includes(p.id)) : products}
        open={isBarcodeGeneratorOpen}
        onClose={() => setIsBarcodeGeneratorOpen(false)}
      />

      {/* QR Code Generator Dialog */}
      {selectedProduct && (
        <QRCodeGenerator
          data={`${selectedProduct.sku}|${selectedProduct.name}|${selectedProduct.price}`}
          title={selectedProduct.name}
          description={`QR Code for ${selectedProduct.sku}`}
          open={isQRCodeGeneratorOpen}
          onClose={() => setIsQRCodeGeneratorOpen(false)}
        />
      )}
    </div>
  )

  // Add pagination controls to the table footer
  function renderProductsTable(
    products: Product[],
    totalFiltered: number,
    totalPages: number,
    currentPage: number,
    setCurrentPage: (page: number) => void
  ) {
    return (
      <>
        {selectedProducts.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedProducts.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all products"
                  />
                  <span className="text-sm font-medium">
                    {selectedProducts.length} product{selectedProducts.length > 1 ? "s" : ""} selected
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
                      <DropdownMenuItem onClick={() => handleBulkUpdateStatus("active")}>
                        Mark as Active
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdateStatus("draft")}>Mark as Draft</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkUpdateStatus("archived")}>Archive</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button variant="outline" size="sm" onClick={handleBulkGenerateBarcodes}>
                    <Barcode className="mr-2 h-4 w-4" />
                    Generate Barcodes
                  </Button>
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
                    checked={products.length > 0 && selectedProducts.length === products.length}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all products"
                  />
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="font-medium p-0 h-auto" onClick={() => handleSort("name")}>
                    Product {getSortIcon("name")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="font-medium p-0 h-auto" onClick={() => handleSort("sku")}>
                    SKU {getSortIcon("sku")}
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" className="font-medium p-0 h-auto" onClick={() => handleSort("category")}>
                    Category {getSortIcon("category")}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="font-medium p-0 h-auto" onClick={() => handleSort("stock")}>
                    Stock {getSortIcon("stock")}
                  </Button>
                </TableHead>
                <TableHead className="text-right">
                  <Button variant="ghost" className="font-medium p-0 h-auto" onClick={() => handleSort("price")}>
                    Price {getSortIcon("price")}
                  </Button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                        aria-label={`Select ${product.name}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="font-medium">{product.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          product.stock === 0 ? "text-destructive" : product.stock < 10 ? "text-amber-500" : "",
                        )}
                      >
                        {product.stock}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium">${product.price.toFixed(2)}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsViewProductOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedProduct(product)
                              setIsEditProductOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Product
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateProduct(product)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleGenerateBarcode(product)}>
                            <Barcode className="mr-2 h-4 w-4" />
                            Generate Barcode
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGenerateQRCode(product)}>
                            <QrCode className="mr-2 h-4 w-4" />
                            Generate QR Code
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Product
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

        <div className="flex items-center justify-between px-4 py-2 ">
          <div className="text-sm text-muted-foreground">
            Showing {products.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            {" - "}
            {Math.min(currentPage * itemsPerPage, totalFiltered)} of {totalFiltered} products
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
            {Array.from({ length: totalPages }, (_, idx) => (
              <Button
                key={idx + 1}
                variant={currentPage === idx + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(idx + 1)}
              >
                {idx + 1}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </Button>
          </div>
        </div>
      </>
    )
  }
}
}
