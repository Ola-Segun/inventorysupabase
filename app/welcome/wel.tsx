"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
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
} from "lucide-react"
import type { JSX } from "react"

// Size constraints for buttons
const MIN_WIDTH = 140
const MAX_WIDTH = 300
const MIN_HEIGHT = 120
const MAX_HEIGHT = 250

// Grid cell size (approximate)
const CELL_WIDTH = 140
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
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("User")
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [buttonSizes, setButtonSizes] = useState<Record<string, ButtonSize>>({})
  const resizeStartRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const buttonsRef = useRef<Record<string, HTMLDivElement | null>>({})
  const gridRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Get user info from localStorage
    const storedRole = localStorage.getItem("userRole")
    const storedEmail = localStorage.getItem("userEmail")

    if (storedRole) {
      setUserRole(storedRole)
    } else {
      // If no user role is found, redirect to login
      router.push("/auth")
    }

    if (storedEmail) {
      // Extract name from email
      const name = storedEmail
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
      setUserName(name)
    }

    // Add mouse event listeners for resizing
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
          setButtonSizes((prev) => ({
            ...prev,
            [isResizing]: {
              width: colSpan * CELL_WIDTH,
              height: rowSpan * CELL_HEIGHT,
            },
          }))
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
  }, [isResizing, router, buttonSizes])

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

  const handleNavigate = (href: string) => {
    // Don't navigate if we're resizing
    if (isResizing) return
    router.push(href)
  }

  // Calculate grid spans based on button size
  const getGridSpans = (buttonId: string): { colSpan: number; rowSpan: number } => {
    const buttonEl = buttonsRef.current[buttonId]
    if (!buttonEl) return { colSpan: 1, rowSpan: 1 }

    const size = buttonSizes[buttonId] || {
      width: buttonEl.offsetWidth || MIN_WIDTH,
      height: buttonEl.offsetHeight || MIN_HEIGHT,
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
      // Similar structure for manager buttons
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "System overview",
          icon: <Home className="h-5 w-5" />,
          href: "/dashboard",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        // ... other manager buttons
      ]
    } else if (userRole === "cashier") {
      // Similar structure for cashier buttons
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "System overview",
          icon: <Home className="h-5 w-5" />,
          href: "/dashboard",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        // ... other cashier buttons
      ]
    } else if (userRole === "seller") {
      // Similar structure for seller buttons
      return [
        {
          id: "dashboard",
          title: "Dashboard",
          description: "Seller dashboard",
          icon: <Store className="h-5 w-5" />,
          href: "/seller",
          color: "bg-blue-100 hover:bg-blue-200 text-blue-700",
        },
        // ... other seller buttons
      ]
    }

    return []
  }

  // If no user role, show loading state
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h2 className="text-xl font-medium">Loading...</h2>
          <p className="text-muted-foreground mt-2">Please wait while we prepare your dashboard</p>
        </div>
      </div>
    )
  }

  const actionButtons = getActionButtons()

  return (
    <div className="min-h-screen max-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="container mx-auto py-6 px-4 flex-1 flex flex-col">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome, {userName}!</h1>
          <p className="text-muted-foreground mt-2">
            Select an action below to get started with your {userRole} dashboard.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Drag the resize handle in the corner of any button to resize it.
          </p>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <div className="overflow-y-auto max-h-[calc(100vh-200px)] p-2 w-full">
            <div
              ref={gridRef}
              className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] auto-rows-[120px] gap-2 w-full max-w-6xl mx-auto"
              style={{ gridAutoFlow: "dense" }} // This is key for filling in gaps
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
                      className={`flex flex-col items-center text-center justify-center px-3 py-4 rounded-lg w-full h-full ${button.color}`}
                      onClick={() => handleNavigate(button.href)}
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
                      <Maximize2 className="w-3 h-3" />
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
