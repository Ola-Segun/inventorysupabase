"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Minus, ShoppingCart, CreditCard, Banknote, Wallet, Tag, X } from "lucide-react"

interface Product {
  id: string
  name: string
  category: string
  price: number
  bulkPrice: number
  minBulkQuantity: number
  image: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
}

const products: Product[] = [
  {
    id: "1",
    name: "Organic Apples (Case)",
    category: "grocery",
    price: 45.99,
    bulkPrice: 42.99,
    minBulkQuantity: 5,
    image: "/placeholder.svg?height=80&width=80",
    stock: 50,
  },
  {
    id: "2",
    name: "Whole Wheat Bread (24 Pack)",
    category: "grocery",
    price: 36.49,
    bulkPrice: 33.99,
    minBulkQuantity: 3,
    image: "/placeholder.svg?height=80&width=80",
    stock: 30,
  },
  {
    id: "3",
    name: "Organic Milk (12 Gallons)",
    category: "grocery",
    price: 54.99,
    bulkPrice: 49.99,
    minBulkQuantity: 2,
    image: "/placeholder.svg?height=80&width=80",
    stock: 25,
  },
  {
    id: "4",
    name: "Chicken Breast (40 lbs)",
    category: "meat",
    price: 89.99,
    bulkPrice: 84.99,
    minBulkQuantity: 2,
    image: "/placeholder.svg?height=80&width=80",
    stock: 15,
  },
  {
    id: "5",
    name: "Sparkling Water (24 Case)",
    category: "beverages",
    price: 21.49,
    bulkPrice: 19.99,
    minBulkQuantity: 4,
    image: "/placeholder.svg?height=80&width=80",
    stock: 40,
  },
  {
    id: "6",
    name: "Chocolate Cake (Wholesale)",
    category: "bakery",
    price: 65.99,
    bulkPrice: 59.99,
    minBulkQuantity: 3,
    image: "/placeholder.svg?height=80&width=80",
    stock: 10,
  },
  {
    id: "7",
    name: "Fresh Strawberries (Bulk)",
    category: "grocery",
    price: 34.99,
    bulkPrice: 31.99,
    minBulkQuantity: 3,
    image: "/placeholder.svg?height=80&width=80",
    stock: 20,
  },
  {
    id: "8",
    name: "Cheddar Cheese (20 lbs)",
    category: "dairy",
    price: 75.49,
    bulkPrice: 69.99,
    minBulkQuantity: 2,
    image: "/placeholder.svg?height=80&width=80",
    stock: 15,
  },
  {
    id: "9",
    name: "Ground Beef (40 lbs)",
    category: "meat",
    price: 127.99,
    bulkPrice: 119.99,
    minBulkQuantity: 2,
    image: "/placeholder.svg?height=80&width=80",
    stock: 12,
  },
  {
    id: "10",
    name: "Orange Juice (24 Pack)",
    category: "beverages",
    price: 43.99,
    bulkPrice: 39.99,
    minBulkQuantity: 3,
    image: "/placeholder.svg?height=80&width=80",
    stock: 30,
  },
  {
    id: "11",
    name: "Paper Towels (Industrial)",
    category: "household",
    price: 32.99,
    bulkPrice: 29.99,
    minBulkQuantity: 4,
    image: "/placeholder.svg?height=80&width=80",
    stock: 50,
  },
  {
    id: "12",
    name: "Dish Soap (Gallon)",
    category: "household",
    price: 18.99,
    bulkPrice: 16.99,
    minBulkQuantity: 5,
    image: "/placeholder.svg?height=80&width=80",
    stock: 40,
  },
]

export function NewPurchase() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = activeCategory === "all" || product.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      if (existingItem) {
        return prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        return [...prevCart, { ...product, quantity: 1 }]
      }
    })
  }

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => prevCart.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item)))
  }

  const applyDiscount = () => {
    // Simple discount logic - in a real app, this would validate against a database
    if (discountCode === "BULK15") {
      setDiscountAmount(15)
    } else if (discountCode === "SELLER20") {
      setDiscountAmount(20)
    } else {
      setDiscountAmount(0)
      alert("Invalid discount code")
    }
  }

  const calculateItemPrice = (item: CartItem) => {
    return item.quantity >= item.minBulkQuantity ? item.bulkPrice : item.price
  }

  const subtotal = cart.reduce((sum, item) => sum + calculateItemPrice(item) * item.quantity, 0)
  const discount = subtotal * (discountAmount / 100)
  const tax = (subtotal - discount) * 0.08 // 8% tax
  const total = subtotal - discount + tax

  const handleCheckout = () => {
    if (cart.length === 0) return

    // Show processing state
    const processingMessage = `Processing purchase of $${total.toFixed(2)}...`
    alert(processingMessage)

    // Simulate processing delay
    setTimeout(() => {
      alert(`Purchase successful! Total: $${total.toFixed(2)}`)
      setCart([])
      setDiscountCode("")
      setDiscountAmount(0)
    }, 1000)
  }

  return (
    <div className="grid gap-12 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <Button variant="outline" size="sm">
                View Promotions
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" onValueChange={setActiveCategory}>
              <TabsList className="mb-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="grocery">Grocery</TabsTrigger>
                <TabsTrigger value="bakery">Bakery</TabsTrigger>
                <TabsTrigger value="dairy">Dairy</TabsTrigger>
                <TabsTrigger value="meat">Meat</TabsTrigger>
                <TabsTrigger value="beverages">Beverages</TabsTrigger>
                <TabsTrigger value="household">Household</TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="m-0">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                      onClick={() => addToCart(product)}
                    >
                      <div className="aspect-square bg-muted flex items-center justify-center">
                        <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover" />
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm font-medium">{product.name}</div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-sm text-muted-foreground">${product.price.toFixed(2)}</div>
                          {product.bulkPrice < product.price && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              <Tag className="h-3 w-3 mr-1" />
                              Bulk: ${product.bulkPrice.toFixed(2)}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">In stock: {product.stock}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {["grocery", "bakery", "dairy", "meat", "beverages", "household"].map((category) => (
                <TabsContent key={category} value={category} className="m-0">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {products
                      .filter((product) => product.category === category)
                      .map((product) => (
                        <Card
                          key={product.id}
                          className="overflow-hidden cursor-pointer hover:border-primary transition-colors"
                          onClick={() => addToCart(product)}
                        >
                          <div className="aspect-square bg-muted flex items-center justify-center">
                            <img
                              src={product.image || "/placeholder.svg"}
                              alt={product.name}
                              className="object-cover"
                            />
                          </div>
                          <CardContent className="p-3">
                            <div className="text-sm font-medium">{product.name}</div>
                            <div className="flex items-center justify-left mt-1">
                              <div className="text-sm text-muted-foreground">${product.price.toFixed(2)}</div>
                              {product.bulkPrice < product.price && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <Tag className="h-3 w-3 mr-1" />
                                  Bulk: ${product.bulkPrice.toFixed(2)}
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">In stock: {product.stock}</div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Fixed Cart Area */}
      <div className="lg:col-span-1">
        <Card className="lg:fixed lg:top-16 lg:right-0 lg:h-[calc(100vh-4rem)] lg:w-[calc(100%/3)] flex flex-col overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Cart
              {cart.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                <ShoppingCart className="h-10 w-10 text-muted-foreground mb-3 opacity-20" />
                <p className="text-muted-foreground">Your cart is empty</p>
                <p className="text-xs text-muted-foreground">Add items by clicking on products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                      <img src={item.image || "/placeholder.svg"} alt={item.name} className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${calculateItemPrice(item).toFixed(2)} each
                        {item.quantity >= item.minBulkQuantity && (
                          <Badge variant="outline" className="ml-2 text-green-600 border-green-600">
                            <Tag className="h-3 w-3 mr-1" />
                            Bulk Price
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateQuantity(item.id, item.quantity - 1)
                        }}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateQuantity(item.id, item.quantity + 1)
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-red-500 ml-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeFromCart(item.id)
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <Button variant="outline" onClick={applyDiscount}>
                  Apply
                </Button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({discountAmount}%)</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (8%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-2 w-full">
              <Button variant="outline" className="flex flex-col items-center h-auto py-2">
                <CreditCard className="h-4 w-4 mb-1" />
                <span className="text-xs">Card</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center h-auto py-2">
                <Banknote className="h-4 w-4 mb-1" />
                <span className="text-xs">Invoice</span>
              </Button>
              <Button variant="outline" className="flex flex-col items-center h-auto py-2">
                <Wallet className="h-4 w-4 mb-1" />
                <span className="text-xs">Digital</span>
              </Button>
            </div>
            <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={handleCheckout}>
              Complete Purchase
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

