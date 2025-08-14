"use client"

import { useState, useRef, useEffect, createRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Coffee,
  Sandwich,
  Cookie,
  Wine,
  Pizza,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  Receipt,
  CreditCard,
  Banknote,
  Wallet,
  Search,
  Tag,
  User,
  X,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { MiniOrdersTable } from "./mini-orders-table"

interface Product {
  id: string
  name: string
  price: number
  image: string
  category: string
  stock: number
}

interface CartItem extends Product {
  quantity: number
  notes?: string
}

interface Category {
  id: string
  name: string
  icon: JSX.Element
}

// Add more categories to the categories array
const categories: Category[] = [
  { id: "all", name: "All", icon: <Tag className="h-4 w-4" /> },
  { id: "food", name: "Food", icon: <Sandwich className="h-4 w-4" /> },
  { id: "drink", name: "Drinks", icon: <Coffee className="h-4 w-4" /> },
  { id: "dessert", name: "Desserts", icon: <Cookie className="h-4 w-4" /> },
  { id: "alcohol", name: "Alcohol", icon: <Wine className="h-4 w-4" /> },
  { id: "pizza", name: "Pizza", icon: <Pizza className="h-4 w-4" /> },
  { id: "breakfast", name: "Breakfast", icon: <Sandwich className="h-4 w-4" /> },
  { id: "salad", name: "Salads", icon: <Sandwich className="h-4 w-4" /> },
  { id: "soup", name: "Soups", icon: <Sandwich className="h-4 w-4" /> },
  { id: "grill", name: "Grill", icon: <Sandwich className="h-4 w-4" /> },
  { id: "seafood", name: "Seafood", icon: <Sandwich className="h-4 w-4" /> },
  { id: "vegan", name: "Vegan", icon: <Sandwich className="h-4 w-4" /> },
  { id: "kids", name: "Kids Menu", icon: <Sandwich className="h-4 w-4" /> },
  { id: "snacks", name: "Snacks", icon: <Sandwich className="h-4 w-4" /> },
  { id: "specials", name: "Specials", icon: <Sandwich className="h-4 w-4" /> },
  // ...add more as needed
]

// Sample product data
const products: Product[] = [
  {
    id: "p1",
    name: "Classic Burger",
    price: 8.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "food",
    stock: 30,
  },
  {
    id: "p2",
    name: "Cheeseburger",
    price: 9.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "food",
    stock: 30,
  },
  {
    id: "p3",
    name: "Chicken Sandwich",
    price: 7.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "food",
    stock: 30,
  },
  {
    id: "p4",
    name: "Veggie Burger",
    price: 8.49,
    image: "/placeholder.svg?height=80&width=80",
    category: "food",
    stock: 30,
  },
  {
    id: "p5",
    name: "French Fries",
    price: 3.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "food",
    stock: 30,
  },
  {
    id: "p6",
    name: "Onion Rings",
    price: 4.49,
    image: "/placeholder.svg?height=80&width=80",
    category: "food",
    stock: 30,
  },
  {
    id: "p7",
    name: "Cola",
    price: 2.49,
    image: "/placeholder.svg?height=80&width=80",
    category: "drink",
    stock: 30,
  },
  {
    id: "p8",
    name: "Lemonade",
    price: 2.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "drink",
    stock: 30,
  },
  {
    id: "p9",
    name: "Iced Tea",
    price: 2.49,
    image: "/placeholder.svg?height=80&width=80",
    category: "drink",
    stock: 30,
  },
  {
    id: "p10",
    name: "Coffee",
    price: 3.49,
    image: "/placeholder.svg?height=80&width=80",
    category: "drink",
    stock: 30,
  },
  {
    id: "p11",
    name: "Chocolate Cake",
    price: 5.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "dessert",
    stock: 30,
  },
  {
    id: "p12",
    name: "Cheesecake",
    price: 6.49,
    image: "/placeholder.svg?height=80&width=80",
    category: "dessert",
    stock: 30,
  },
  {
    id: "p13",
    name: "Ice Cream",
    price: 4.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "dessert",
    stock: 30,
  },
  {
    id: "p14",
    name: "Brownie",
    price: 3.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "dessert",
    stock: 30,
  },
  {
    id: "p15",
    name: "House Red Wine",
    price: 7.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "alcohol",
    stock: 30,
  },
  {
    id: "p16",
    name: "House White Wine",
    price: 7.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "alcohol",
    stock: 30,
  },
  {
    id: "p17",
    name: "Beer",
    price: 5.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "alcohol",
    stock: 30,
  },
  {
    id: "p18",
    name: "Margarita",
    price: 8.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "alcohol",
    stock: 30,
  },
  {
    id: "p19",
    name: "Margherita Pizza",
    price: 12.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "pizza",
    stock: 30,
  },
  {
    id: "p20",
    name: "Pepperoni Pizza",
    price: 14.99,
    image: "/placeholder.svg?height=80&width=80",
    category: "pizza",
    stock: 30,
  },
]

// Receipt Printer Component
// Add proper TypeScript interface for ReceiptPrinter props
interface ReceiptPrinterProps {
  orderNumber: string
  date: Date
  items: Array<{
    name: string
    quantity: number
    price: number
  }>
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  onClose: () => void
}

// Update the ReceiptPrinter component with proper typing
export function ReceiptPrinter({
  orderNumber,
  date,
  items,
  subtotal,
  tax,
  total,
  paymentMethod,
  onClose,
}: ReceiptPrinterProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="border-b">
        <div className="flex justify-between items-center">
          <CardTitle>Receipt</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="font-bold text-xl">CAFE POS SYSTEM</h2>
            <p className="text-sm text-muted-foreground">123 Main Street</p>
            <p className="text-sm text-muted-foreground">City, State 12345</p>
          </div>

          <div className="flex justify-between text-sm">
            <div>
              <p>Order #: {orderNumber}</p>
              <p>Date: {date.toLocaleString()}</p>
            </div>
            <div>
              <p>Payment: {paymentMethod.toUpperCase()}</p>
            </div>
          </div>

          <div className="border-t border-b py-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Item</th>
                  <th className="text-center py-2">Qty</th>
                  <th className="text-right py-2">Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="border-b border-dashed">
                    <td className="py-2">{item.name}</td>
                    <td className="text-center py-2">{item.quantity}</td>
                    <td className="text-right py-2">${item.price.toFixed(2)}</td>
                    <td className="text-right py-2">${(item.quantity * item.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center text-sm pt-6 space-y-2">
            <p>Thank you for your purchase!</p>
            <p className="text-muted-foreground">Please keep this receipt for your records</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SalesInterface() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerName, setCustomerName] = useState("")
  const [showCheckout, setShowCheckout] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [isProcessing, setIsProcessing] = useState(false)
  const [discountCode, setDiscountCode] = useState("")
  const [discountAmount, setDiscountAmount] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptData, setReceiptData] = useState<{
    orderNumber: string
    date: Date
    items: { name: string; quantity: number; price: number }[]
    subtotal: number
    tax: number
    total: number
    paymentMethod: string
  } | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12) // You can adjust this as needed

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const cartScrollRef = useRef<HTMLDivElement>(null)
  const cartItemsRef = useRef<HTMLDivElement>(null)
  const cartContainerRef = useRef<HTMLDivElement>(null)

  // Add new state for item refs
  const [itemRefs, setItemRefs] = useState<{ [key: string]: React.RefObject<HTMLDivElement> }>({})

  // Add state for expandable categories
  const [showAllCategories, setShowAllCategories] = useState(false)
  const maxVisibleCategories = 6

  // Replace existing useEffect with this one
  useEffect(() => {
    if (cartContainerRef.current) {
      cartContainerRef.current.scrollTo({
        top: cartContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [cart])

  // Filter products based on search and category
  const filteredProducts = products.filter(
    (product) =>
      (activeCategory === "all" || product.category === activeCategory) &&
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  )

  // Reset to page 1 if filter/search changes and current page is out of range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1)
  }, [activeCategory, searchQuery, totalPages])


  // Calculate cart totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxRate = 0.08
  const tax = subtotal * taxRate
  const total = subtotal - discountAmount > 0 ? (subtotal - discountAmount) * (1 + taxRate) : 0

  // Replace the addToCart function
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      const newCart = existingItem
        ? prevCart.map((item) => 
            item.id === product.id 
              ? { ...item, quantity: item.quantity + 1 } 
              : item
          )
        : [...prevCart, { ...product, quantity: 1 }]

      // Create ref for new items
      if (!existingItem) {
        setItemRefs(prev => ({...prev, [product.id]: createRef<HTMLDivElement>()}))
      } else {
        // Scroll to existing item and highlight it
        setTimeout(() => {
          const ref = itemRefs[product.id]
          if (ref.current) {
            ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ref.current.classList.add('highlight-item')
            setTimeout(() => {
              ref.current?.classList.remove('highlight-item')
            }, 1000)
          }
        }, 0)
      }

      return newCart
    })
  }

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id))
  }

  // Update item quantity
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const applyDiscount = () => {
    // Simple discount logic - in a real app, this would validate against a database
    if (discountCode === "SAVE10") {
      setDiscountAmount(subtotal * 0.1)
    } else if (discountCode === "SAVE20") {
      setDiscountAmount(subtotal * 0.2)
    } else {
      setDiscountAmount(0)
      alert("Invalid discount code")
    }
  }

  const generateOrderNumber = () => {
    const timestamp = new Date().getTime().toString().slice(-6)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `ORD-${timestamp}-${random}`
  }

  const handleCheckout = () => {
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      const orderNumber = generateOrderNumber()
      
      // Prepare receipt data
      const receiptItems = cart.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }))
      
      setReceiptData({
        orderNumber,
        date: new Date(),
        items: receiptItems,
        subtotal,
        tax,
        total,
        paymentMethod
      })
      
      setIsProcessing(false)
      setShowCheckout(false)
      setShowReceipt(true)
    }, 1500)
  }

  const closeReceiptAndReset = () => {
    setShowReceipt(false)
    setCart([])
    setCustomerName("")
    setDiscountCode("")
    setDiscountAmount(0)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="md:col-span-1 lg:col-span-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <CardTitle>Products</CardTitle>
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-full"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Dynamic Categories with Expandable Button */}
                <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                  <div className="relative w-full">
                    <ScrollArea className="w-full overflow-auto" orientation="horizontal">
                      <TabsList className="inline-flex h-10" style={{ minWidth: '100%' }}>
                        {(showAllCategories ? categories : categories.slice(0, maxVisibleCategories)).map((category) => (
                          <TabsTrigger 
                            key={category.id} 
                            value={category.id} 
                            className="flex items-center gap-1"
                          >
                            {category.icon} {category.name}
                          </TabsTrigger>
                        ))}
                        {categories.length > maxVisibleCategories && (
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={() => setShowAllCategories((v) => !v)}
                            className="ml-2"
                          >
                            {showAllCategories
                              ? "Show Less"
                              : `+${categories.length - maxVisibleCategories} More`}
                          </Button>
                        )}
                      </TabsList>
                    </ScrollArea>
                  </div>
                </Tabs>

                {/* Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {paginatedProducts.length === 0 ? (
                    <div className="col-span-full text-center text-muted-foreground py-8">
                      No products found.
                    </div>
                  ) : (
                    paginatedProducts.map((product) => (
                      <Card
                        key={product.id}
                        className="overflow-hidden cursor-pointer hover:border-primary transition-colors hover:bg-accent"
                        onClick={() => addToCart(product)}
                      >
                        <div className="aspect-square bg-muted flex items-center justify-center">
                          <img src={product.image || "/placeholder.svg"} alt={product.name} className="object-cover" />
                        </div>
                        <CardContent className="p-3">
                          <div className="text-sm font-medium">{product.name}</div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-md text-muted-foreground">${product.price.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground mt-1">In stock: {product.stock}</div>
                        </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex justify-end items-center gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      aria-label="Previous Page"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 5) }) .map((_, index) => {
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
                      size="sm"
                      aria-label="Next Page"
                      variant="outline"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Shopping Cart Area - Fixed Position */}
      <div className="md:col-span-1 lg:col-span-1">
        <div className="sticky top-4 max-h-[calc(100vh-2rem)] overflow-hidden">
          <Card className="lg:fixed lg:top-16 lg:right-0 lg:h-[calc(100vh-4rem)] lg:w-[calc(100%/3)] flex flex-col overflow-hidden">
            <CardHeader className="pb-3 flex-shrink-0">
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" /> Cart
                {cart.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {cart.reduce((sum, item) => sum + item.quantity, 0)}
                  </Badge>
                )}
              </CardTitle>
              {!showCheckout && (
                <div className="relative">
                  <User className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Customer name (optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="pl-8"
                  />
                </div>
              )}
            </CardHeader>

            {!showCheckout ? (
              <>
                <div 
                  ref={cartContainerRef}
                  className="flex-grow overflow-y-auto scroll-bar-thin scrollbar-thumb-rounded scrollbar-thumb-muted "
                  style={{ maxHeight: 'calc(100vh - 20rem)' }}
                >
                  <div className="p-4 pt-0">
                    {cart.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 text-center">
                        <ShoppingCart className="h-12 w-12 text-muted-foreground mb-3 opacity-20" />
                        <p className="text-muted-foreground">Your cart is empty</p>
                        <p className="text-xs text-muted-foreground mt-1">Add products to get started</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div 
                            key={item.id} 
                            ref={itemRefs[item.id]}
                            className="flex items-start py-2 border-b transition-colors duration-300 hover:bg-accent hover:border-primary"

                          >
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="font-medium mb-1 truncate">{item.name}</div>
                              <div className="text-sm text-muted-foreground">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </div>
                            </div>
                            <div className="flex flex-col items-end space-y-2">
                              <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                              <div className="flex items-center">
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
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Discount Code Section */}
                <CardContent className="border-t p-4 flex-shrink-0">
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Discount code"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-1"
                    />
                    <Button variant="outline" onClick={applyDiscount} disabled={!discountCode || cart.length === 0}>
                      Apply
                    </Button>
                  </div>

                  {/* Cart summary and actions */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {discountAmount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax (8%)</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-medium text-base pt-1">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setCart([])}
                      disabled={cart.length === 0}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Clear
                    </Button>
                    <Button className="flex-1" onClick={() => setShowCheckout(true)} disabled={cart.length === 0}>
                      <Receipt className="mr-2 h-4 w-4" /> Checkout
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardContent className="flex-grow flex flex-col">
                  <div className="space-y-4 mb-4">
                    <div>
                      <h3 className="font-medium mb-2">Payment Method</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant={paymentMethod === "cash" ? "default" : "outline"}
                          className={cn(
                            "justify-start",
                            paymentMethod === "cash" && "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                          onClick={() => setPaymentMethod("cash")}
                        >
                          <Banknote className="mr-2 h-4 w-4" /> Cash
                        </Button>
                        <Button
                          variant={paymentMethod === "card" ? "default" : "outline"}
                          className={cn(
                            "justify-start",
                            paymentMethod === "card" && "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                          onClick={() => setPaymentMethod("card")}
                        >
                          <CreditCard className="mr-2 h-4 w-4" /> Card
                        </Button>
                        <Button
                          variant={paymentMethod === "wallet" ? "default" : "outline"}
                          className={cn(
                            "justify-start",
                            paymentMethod === "wallet" && "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                          onClick={() => setPaymentMethod("wallet")}
                        >
                          <Wallet className="mr-2 h-4 w-4" /> Digital Wallet
                        </Button>
                        <Button
                          variant={paymentMethod === "split" ? "default" : "outline"}
                          className={cn(
                            "justify-start",
                            paymentMethod === "split" && "bg-primary text-primary-foreground hover:bg-primary/90",
                          )}
                          onClick={() => setPaymentMethod("split")}
                        >
                          <CreditCard className="mr-2 h-4 w-4" /> Split Pay
                        </Button>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h3 className="font-medium mb-2">Order Summary</h3>
                      <ScrollArea className="h-[140px] mb-2 -mx-1 px-1">
                        <div className="space-y-2">
                          {cart.map((item) => (
                            <div key={item.id} className="flex justify-between text-sm">
                              <span>
                                {item.quantity} × {item.name}
                              </span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-auto">
                    <div className="space-y-1 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discountAmount > 0 && (
                        <div className="flex justify-between text-sm text-green-600">
                          <span>Discount</span>
                          <span>-${discountAmount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Tax (8%)</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg pt-1">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>

                <CardContent className="border-t p-4 flex-shrink-0">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowCheckout(false)}
                      disabled={isProcessing}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button className="flex-1" onClick={handleCheckout} disabled={isProcessing}>
                      {isProcessing ? (
                        <>Processing...</>
                      ) : (
                        <>
                          <CreditCard className="mr-2 h-4 w-4" /> Pay ${total.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
      {/* Receipt Modal - Add proper typing for receiptData */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <ReceiptPrinter
              orderNumber={receiptData.orderNumber}
              date={receiptData.date}
              items={receiptData.items}
              subtotal={receiptData.subtotal}
              tax={receiptData.tax}
              total={receiptData.total}
              paymentMethod={receiptData.paymentMethod}
              onClose={closeReceiptAndReset}
            />
          </div>
        </div>
      )}
    </div>
  )
}