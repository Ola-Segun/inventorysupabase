"use client"

import type React from "react"
import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  ShoppingCart,
  Users,
  BarChart3,
  Truck,
  FileText,
  Coffee,
  MessageSquare,
  Store,
  UserCog,
  Bell,
  Boxes,
  Tag,
  ArrowLeftRight,
  CreditCard,
  Home,
  Maximize2,
  FolderTree,
  LayoutDashboard,
  UserCircle,
  Calendar,
  Image,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import type { JSX } from "react"

// Size constraints for buttons
const MIN_WIDTH = 157
const MAX_WIDTH = 314
const MIN_HEIGHT = 120
const MAX_HEIGHT = 240

// localStorage key for button layouts
const BUTTON_LAYOUTS_KEY = "welcomePageButtonLayouts"

// Grid cell size (approximate)
const CELL_WIDTH = 157
const CELL_HEIGHT = 120

interface ButtonSize {
  width: number
  height: number
}

interface ActionButton {
  id: string
  title: string
  description: string
  icon: JSX.Element
  href: string
  color: string
}

export default function WelcomePage() {
  const router = useRouter()
  const { user, logout, isLoading, isAuthenticated } = useAuth()
  const userRole = user?.role
  const userName = user?.name || "User"
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [buttonSizes, setButtonSizes] = useState<Record<string, ButtonSize>>({})
  const [navigating, setNavigating] = useState(false)
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const buttonsRef = useRef<Record<string, HTMLDivElement | null>>({})
  const gridRef = useRef<HTMLDivElement | null>(null)
  
  useEffect(() => {
    // Don't do anything until auth is resolved
    if (isLoading) return
    
    // If not authenticated, redirect to login
    if (!isAuthenticated || !user) {
      console.log("❌ Not authenticated on welcome page, redirecting to auth")
      router.replace("/auth")
      return
    }

    console.log("✅ User authenticated on welcome page:", user)
    localStorage.setItem("welcomePageShown", "true")

    // Load saved layouts
    if (userRole) {
      const savedLayouts = localStorage.getItem(BUTTON_LAYOUTS_KEY)
      if (savedLayouts) {
        try {
          const parsedLayouts = JSON.parse(savedLayouts)
          setButtonSizes(parsedLayouts)
        } catch (e) {
          console.error("Failed to parse saved layouts", e)
          localStorage.removeItem(BUTTON_LAYOUTS_KEY)
        }
      }
    }

    // Forced layout recalculation when the component mounts
    const timer = setTimeout(() => {
      if (gridRef.current) {
        gridRef.current.style.width = `${gridRef.current.offsetWidth - 1}px`
        setTimeout(() => {
          if (gridRef.current) {
            gridRef.current.style.width = ""
          }
        }, 0)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [user, userRole, isLoading, isAuthenticated, router])

  // Save button layouts to localStorage
  const saveButtonLayouts = useCallback(() => {
    if (userRole) {
      localStorage.setItem(BUTTON_LAYOUTS_KEY, JSON.stringify(buttonSizes))
    }
  }, [buttonSizes, userRole])

  const handleResizeStart = (e: React.MouseEvent, buttonId: string) => {
    e.preventDefault()
    e.stopPropagation()

    const buttonEl = buttonsRef.current[buttonId]
    if (!buttonEl) return

    setIsResizing(buttonId)
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: buttonSizes[buttonId]?.width || buttonEl.offsetWidth,
      height: buttonSizes[buttonId]?.height || buttonEl.offsetHeight,
    }
  }

  const handleNavigate = async (href: string) => {
    if (isResizing || navigating) return
    
    console.log("🔄 Navigating to:", href)
    setNavigating(true)
    
    try {
      // Use router.push instead of router.replace to maintain history
      await router.push(href)
    } catch (error) {
      console.error("Navigation error:", error)
      setNavigating(false)
    }
  }

  // Add mouse event listeners for resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !resizeStartRef.current) return

      const buttonEl = buttonsRef.current[isResizing]
      if (!buttonEl) return

      // Calculate new dimensions
      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y

      let newWidth = resizeStartRef.current.width + deltaX
      let newHeight = resizeStartRef.current.height + deltaY

      // Apply constraints
      newWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth))
      newHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, newHeight))

      // Update button size
      setButtonSizes((prev) => ({
        ...prev,
        [isResizing]: { width: newWidth, height: newHeight },
      }))
    }

    const handleMouseUp = () => {
      if (isResizing) {
        // Snap to grid when done resizing
        const buttonEl = buttonsRef.current[isResizing]
        if (buttonEl) {
          const currentSize = buttonSizes[isResizing] || {
            width: buttonEl.offsetWidth,
            height: buttonEl.offsetHeight,
          }

          // Calculate grid spans
          const colSpan = Math.max(1, Math.round(currentSize.width / CELL_WIDTH))
          const rowSpan = Math.max(1, Math.round(currentSize.height / CELL_HEIGHT))

          // Set final snapped size
          const newSizes = {
            ...buttonSizes,
            [isResizing]: {
              width: colSpan * CELL_WIDTH,
              height: rowSpan * CELL_HEIGHT,
            },
          }

          setButtonSizes(newSizes)

          // Save the updated layouts
          localStorage.setItem(BUTTON_LAYOUTS_KEY, JSON.stringify(newSizes))
        }
      }

      setIsResizing(null)
      resizeStartRef.current = null
    }

    if (isResizing) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isResizing, buttonSizes])

  // Calculate grid spans based on button size
  const getGridSpans = (buttonId: string): { colSpan: number; rowSpan: number } => {
    const size = buttonSizes[buttonId] || {
      width: MIN_WIDTH,
      height: MIN_HEIGHT,
    }

    // Calculate spans based on size relative to cell size
    const colSpan = Math.max(1, Math.round(size.width / CELL_WIDTH))
    const rowSpan = Math.max(1, Math.round(size.height / CELL_HEIGHT))

    return { colSpan, rowSpan }
  }

  // Define action buttons based on user role
  const getActionButtons = (): ActionButton[] => {
    if (userRole === "admin") {
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "System overview",
          icon: <Home className="h-5 w-5" />,
          href: "/dashboard",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        {
          id: "products",
          title: "Products",
          description: "Manage products",
          icon: <Tag className="h-5 w-5" />,
          href: "/products",
          color: "bg-green-100 hover:bg-green-200 text-green-700",
        },
        {
          id: "categories",
          title: "categories",
          description: "Manage categories",
          icon: <FolderTree className="h-5 w-5" />,
          href: "/categories",
          color: "bg-green-100 hover:bg-green-200 text-green-700",
        },
        {
          id: "inventory",
          title: "Inventory",
          description: "Track stock",
          icon: <Boxes className="h-5 w-5" />,
          href: "/inventory",
          color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
        },
        {
          id: "stock-transfer",
          title: "Stock Transfer",
          description: "Move inventory",
          icon: <ArrowLeftRight className="h-5 w-5" />,
          href: "/stock-transfer",
          color: "bg-teal-100 hover:bg-teal-200 text-teal-700",
        },
        {
          id: "suppliers",
          title: "Suppliers",
          description: "Manage suppliers",
          icon: <Truck className="h-5 w-5" />,
          href: "/suppliers",
          color: "bg-cyan-100 hover:bg-cyan-200 text-cyan-700",
        },
        {
          id: "sales",
          title: "Point of Sale",
          description: "Process sales",
          icon: <ShoppingCart className="h-5 w-5" />,
          href: "/sales",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "sales-analytics",
          title: "Sales Analytics",
          description: "Analyse sales report",
          icon: <BarChart3 className="h-5 w-5" />,
          href: "/analytics/sales",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "inventory-reports",
          title: "Inventory Reports",
          description: "Analyse products",
          icon: <FileText className="h-5 w-5" />,
          href: "/analytics/inventory",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "financial-summary",
          title: "Financial Summary",
          description: "Finance Analytics",
          icon: <CreditCard className="h-5 w-5" />,
          href: "/analytics/financial",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "customers",
          title: "Customers",
          description: "Manage customers",
          icon: <Users className="h-5 w-5" />,
          href: "/customers",
          color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
        },
        {
          id: "gallery",
          title: "Gallery",
          description: "Manage Gallery",
          icon: <Image className="h-5 w-5" />,
          href: "/gallery",
          color: "bg-red-100 hover:bg-red-200 text-red-700",
        },
        {
          id: "reports",
          title: "Reports",
          description: "View reports",
          icon: <FileText className="h-5 w-5" />,
          href: "/reports",
          color: "bg-pink-100 hover:bg-pink-200 text-pink-700",
        },
        {
          id: "menu",
          title: "Restaurant",
          description: "Manage menu",
          icon: <Coffee className="h-5 w-5" />,
          href: "/menu",
          color: "bg-amber-100 hover:bg-amber-200 text-amber-700",
        },
        {
          id: "messaging",
          title: "Messaging",
          description: "Send messages",
          icon: <MessageSquare className="h-5 w-5" />,
          href: "/admin/messages",
          color: "bg-red-100 hover:bg-red-200 text-red-700",
        },
        {
          id: "users",
          title: "Users",
          description: "Manage users",
          icon: <UserCog className="h-5 w-5" />,
          href: "/admin/users",
          color: "bg-orange-100 hover:bg-orange-200 text-orange-700",
        },
        {
          id: "sellers",
          title: "Sellers",
          description: "Manage sellers",
          icon: <Store className="h-5 w-5" />,
          href: "/admin/sellers",
          color: "bg-red-100 hover:bg-red-200 text-red-700",
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "View alerts",
          icon: <Bell className="h-5 w-5" />,
          href: "/notifications",
          color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
        },
      ]
    } else if (userRole === "manager") {
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "System overview",
          icon: <Home className="h-5 w-5" />,
          href: "/dashboard",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        {
          id: "products",
          title: "Products",
          description: "Manage products",
          icon: <Tag className="h-5 w-5" />,
          href: "/products",
          color: "bg-green-100 hover:bg-green-200 text-green-700",
        },
        {
          id: "inventory",
          title: "Inventory",
          description: "Track stock",
          icon: <Boxes className="h-5 w-5" />,
          href: "/inventory",
          color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-700",
        },
        {
          id: "suppliers",
          title: "Suppliers",
          description: "Manage suppliers",
          icon: <Truck className="h-5 w-5" />,
          href: "/suppliers",
          color: "bg-cyan-100 hover:bg-cyan-200 text-cyan-700",
        },
        {
          id: "sales",
          title: "Point of Sale",
          description: "Process sales",
          icon: <ShoppingCart className="h-5 w-5" />,
          href: "/sales",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "sales-analytics",
          title: "Sales Analytics",
          description: "Analyse sales report",
          icon: <BarChart3 className="h-5 w-5" />,
          href: "/analytics/sales",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "inventory-reports",
          title: "Inventory Reports",
          description: "Analyse products",
          icon: <FileText className="h-5 w-5" />,
          href: "/analytics/inventory",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "financial-summary",
          title: "Financial Summary",
          description: "Finance Analytics",
          icon: <CreditCard className="h-5 w-5" />,
          href: "/analytics/financial",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "customers",
          title: "Customers",
          description: "Manage customers",
          icon: <Users className="h-5 w-5" />,
          href: "/customers",
          color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
        },
        {
          id: "reports",
          title: "Reports",
          description: "View reports",
          icon: <FileText className="h-5 w-5" />,
          href: "/reports",
          color: "bg-pink-100 hover:bg-pink-200 text-pink-700",
        },
        {
          id: "menu",
          title: "Restaurant",
          description: "Manage menu",
          icon: <Coffee className="h-5 w-5" />,
          href: "/menu",
          color: "bg-amber-100 hover:bg-amber-200 text-amber-700",
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "View alerts",
          icon: <Bell className="h-5 w-5" />,
          href: "/notifications",
          color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
        },
      ]
    } else if (userRole === "cashier") {
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "System overview",
          icon: <Home className="h-5 w-5" />,
          href: "/dashboard",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        {
          id: "sales",
          title: "Point of Sale",
          description: "Process sales",
          icon: <ShoppingCart className="h-5 w-5" />,
          href: "/sales",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "customers",
          title: "Customers",
          description: "View customers",
          icon: <Users className="h-5 w-5" />,
          href: "/customers",
          color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
        },
        {
          id: "menu",
          title: "Menu",
          description: "View menu",
          icon: <Coffee className="h-5 w-5" />,
          href: "/menu",
          color: "bg-amber-100 hover:bg-amber-200 text-amber-700",
        },
        {
          id: "tables",
          title: "Tables",
          description: "Manage tables",
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/tables",
          color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "View alerts",
          icon: <Bell className="h-5 w-5" />,
          href: "/notifications",
          color: "bg-red-100 hover:bg-red-200 text-red-700",
        },
      ]
    } else if (userRole === "seller") {
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "Seller dashboard",
          icon: <Store className="h-5 w-5" />,
          href: "/seller",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        {
          id: "purchase",
          title: "Purchase",
          description: "New purchase",
          icon: <ShoppingCart className="h-5 w-5" />,
          href: "/seller/purchase",
          color: "bg-green-100 hover:bg-green-200 text-green-700",
        },
        {
          id: "history",
          title: "History",
          description: "Purchase history",
          icon: <Calendar className="h-5 w-5" />,
          href: "/seller/history",
          color: "bg-purple-100 hover:bg-purple-200 text-purple-700",
        },
        {
          id: "invoices",
          title: "Invoices",
          description: "View invoices",
          icon: <CreditCard className="h-5 w-5" />,
          href: "/seller/invoices",
          color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-700",
        },
        {
          id: "messages",
          title: "Messages",
          description: "Your messages",
          icon: <MessageSquare className="h-5 w-5" />,
          href: "/seller/messages",
          color: "bg-pink-100 hover:bg-pink-200 text-pink-700",
        },
        {
          id: "profile",
          title: "Profile",
          description: "Your profile",
          icon: <UserCircle className="h-5 w-5" />,
          href: "/seller/profile",
          color: "bg-amber-100 hover:bg-amber-200 text-amber-700",
        },
        {
          id: "reports",
          title: "Reports",
          description: "View reports",
          icon: <BarChart3 className="h-5 w-5" />,
          href: "/seller/reports",
          color: "bg-cyan-100 hover:bg-cyan-200 text-cyan-700",
        },
        {
          id: "notifications",
          title: "Notifications",
          description: "View alerts",
          icon: <Bell className="h-5 w-5" />,
          href: "/notifications",
          color: "bg-yellow-100 hover:bg-yellow-200 text-yellow-700",
        },
      ]
    }

    return []
  }

  const handleLogout = async () => {
    try {
      // Clear saved layouts
      localStorage.removeItem(BUTTON_LAYOUTS_KEY)
      await logout()
      // Redirect to login
      router.replace("/auth")
    } catch (err) {
      console.error("Logout error: ", err)
    }
  }

  // Show loading state while auth is being resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium">Loading...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    )
  }

  // If no user role after auth resolved, show error
  if (!userRole || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-medium text-red-600">Authentication Error</h2>
          <p className="text-muted-foreground mt-2">Unable to load user data. Please try logging in again.</p>
          <Button onClick={() => router.replace("/auth")} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  const actionButtons = getActionButtons()

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto py-6 px-4 flex-1 flex flex-col">
        <div className="mb-6 text-center relative">
          <div className="absolute right-0 top-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="text-muted-foreground"
              disabled={navigating}
            >
              Logout
            </Button>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-2">
            Select an action below to get started with your {userRole} dashboard.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag the resize handle in the corner of any button to resize it.
          </p>
          {navigating && (
            <p className="text-xs text-blue-600 mt-2">
              Navigating...
            </p>
          )}
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-2 w-full">
            <div
              ref={gridRef}
              key={`grid-${Object.keys(buttonSizes).length}`}
              className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] auto-rows-[120px] gap-2 w-full max-w-6xl mx-auto"
              style={{ gridAutoFlow: "dense" }}
            >
              {actionButtons.map((button) => {
                const { colSpan, rowSpan } = getGridSpans(button.id)

                return (
                  <div
                    key={button.id}
                    ref={(el) => {
                      buttonsRef.current[button.id] = el
                    }}
                    className={`relative transition-all duration-150 rounded-lg ${isResizing === button.id ? "z-10 shadow-lg" : ""}`}
                    style={{
                      gridColumn: `span ${colSpan}`,
                      gridRow: `span ${rowSpan}`,
                      minWidth: MIN_WIDTH,
                      minHeight: MIN_HEIGHT,
                      maxWidth: MAX_WIDTH,
                      maxHeight: MAX_HEIGHT,
                      width: buttonSizes[button.id]?.width || "100%",
                      height: buttonSizes[button.id]?.height || "100%",
                    }}
                  >
                    <Button
                      variant="ghost"
                      className={`flex flex-col items-center text-center justify-center px-3 py-4 rounded-lg w-full h-full ${button.color} ${navigating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => handleNavigate(button.href)}
                      disabled={navigating}
                    >
                      <div className="mb-3">{button.icon}</div>
                      <span className="font-medium text-sm">{button.title}</span>
                      <span className="text-xs mt-1 opacity-80 line-clamp-2">{button.description}</span>
                    </Button>

                    {/* Resize handle */}
                    <div
                      className="absolute bottom-1 right-1 w-5 h-5 cursor-se-resize flex items-center justify-center rounded-full bg-opacity-60 hover:bg-opacity-100 bg-gray-200 dark:bg-gray-700 transition"
                      onMouseDown={(e) => handleResizeStart(e, button.id)}
                    >
                      <Maximize2 className="w-3 h-3 rotate-90" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}