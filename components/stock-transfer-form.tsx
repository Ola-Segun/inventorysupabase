"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Search, Plus, Trash2, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  sku: string
  stock: number
  image: string
}

interface TransferItem {
  productId: string
  quantity: number
  product: Product
}

const products: Product[] = [
  {
    id: "1",
    name: "Organic Apples",
    sku: "PRD-001",
    stock: 45,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Whole Wheat Bread",
    sku: "PRD-002",
    stock: 12,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Organic Milk",
    sku: "PRD-003",
    stock: 24,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Chicken Breast",
    sku: "PRD-004",
    stock: 8,
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Sparkling Water",
    sku: "PRD-005",
    stock: 36,
    image: "/placeholder.svg?height=40&width=40",
  },
]

const locations = [
  { id: "1", name: "Main Warehouse" },
  { id: "2", name: "Store Front" },
  { id: "3", name: "Secondary Storage" },
  { id: "4", name: "Distribution Center" },
]

export function StockTransferForm() {
  const [sourceLocation, setSourceLocation] = useState("")
  const [destinationLocation, setDestinationLocation] = useState("")
  const [transferDate, setTransferDate] = useState("")
  const [reference, setReference] = useState("")
  const [notes, setNotes] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Product[]>([])
  const [transferItems, setTransferItems] = useState<TransferItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length > 1) {
      setIsSearching(true)

      // Simulate API call
      setTimeout(() => {
        const results = products.filter(
          (product) =>
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.sku.toLowerCase().includes(query.toLowerCase()),
        )
        setSearchResults(results)
        setIsSearching(false)
      }, 300)
    } else {
      setSearchResults([])
    }
  }

  const handleAddProduct = (product: Product) => {
    // Check if product already exists in transfer items
    if (transferItems.some((item) => item.productId === product.id)) {
      toast({
        title: "Product already added",
        description: "This product is already in the transfer list.",
        variant: "destructive",
      })
      return
    }

    setTransferItems([
      ...transferItems,
      {
        productId: product.id,
        quantity: 1,
        product,
      },
    ])

    setSearchQuery("")
    setSearchResults([])
  }

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return

    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (quantity > product.stock) {
      toast({
        title: "Invalid quantity",
        description: "Quantity cannot exceed available stock.",
        variant: "destructive",
      })
      return
    }

    setTransferItems(transferItems.map((item) => (item.productId === productId ? { ...item, quantity } : item)))
  }

  const handleRemoveItem = (productId: string) => {
    setTransferItems(transferItems.filter((item) => item.productId !== productId))
  }

  const handleSubmitTransfer = () => {
    if (!sourceLocation) {
      toast({
        title: "Source location required",
        description: "Please select a source location.",
        variant: "destructive",
      })
      return
    }

    if (!destinationLocation) {
      toast({
        title: "Destination location required",
        description: "Please select a destination location.",
        variant: "destructive",
      })
      return
    }

    if (sourceLocation === destinationLocation) {
      toast({
        title: "Invalid locations",
        description: "Source and destination locations cannot be the same.",
        variant: "destructive",
      })
      return
    }

    if (transferItems.length === 0) {
      toast({
        title: "No items to transfer",
        description: "Please add at least one product to transfer.",
        variant: "destructive",
      })
      return
    }

    if (!transferDate) {
      toast({
        title: "Transfer date required",
        description: "Please select a transfer date.",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would submit to an API
    toast({
      title: "Stock transfer created",
      description: `Successfully created transfer of ${transferItems.length} products.`,
      variant: "success",
    })

    // Reset form
    setSourceLocation("")
    setDestinationLocation("")
    setTransferDate("")
    setReference("")
    setNotes("")
    setTransferItems([])
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
          <CardDescription>Enter the details for this stock transfer</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="source">Source Location</Label>
              <Select value={sourceLocation} onValueChange={setSourceLocation}>
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination Location</Label>
              <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                <SelectTrigger id="destination">
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id} disabled={location.id === sourceLocation}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Transfer Date</Label>
              <Input id="date" type="date" value={transferDate} onChange={(e) => setTransferDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference Number</Label>
              <Input
                id="reference"
                placeholder="Optional"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional information"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Items</CardTitle>
          <CardDescription>Add products to transfer between locations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products by name or SKU..."
              className="pl-8 pr-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
            {isSearching && (
              <div className="absolute right-2.5 top-2.5">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-10 max-h-[200px] overflow-auto">
                {searchResults.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-2 p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{product.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        SKU: {product.sku} • Stock: {product.stock}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {transferItems.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transferItems.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            <img
                              src={item.product.image || "/placeholder.svg"}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-xs text-muted-foreground">{item.product.sku}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">{item.product.stock}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          type="number"
                          min="1"
                          max={item.product.stock}
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.productId, Number.parseInt(e.target.value) || 1)}
                          className="w-20 ml-auto"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.productId)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="border rounded-md p-8 flex flex-col items-center justify-center text-center">
              <div className="bg-muted rounded-full p-3 mb-3">
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No items added</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Search for products above to add them to this transfer
              </p>
              <Button variant="outline" onClick={() => setSearchQuery("a")}>
                Browse Products
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSubmitTransfer}>Create Transfer</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

