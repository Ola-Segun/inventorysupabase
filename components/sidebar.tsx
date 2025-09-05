"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Truck,
  Settings,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  Bell,
  HelpCircle,
  LogOut,
  CreditCard,
  Calendar,
  PieChart,
  MessageSquare,
  UserCircle,
  Store,
  Boxes,
  Tag,
  DollarSign,
  ClipboardList,
  BarChart2,
  UserCog,
  Percent,
  ArrowLeftRight,
  Coffee,
  ChevronLeft,
  AlignJustify,
  Monitor,
  Grid,
  X,
  FolderTree,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useMobile } from "@/hooks/use-mobile"
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import { useToast } from "./ui/use-toast"

import { hasPermission, type Permission } from "@/lib/permissions"

interface SidebarProps {
  open?: boolean
  setOpen?: (open: boolean) => void
  collapsed?: boolean
  setCollapsed?: (collapsed: boolean) => void
}

const SIDEBAR_COOKIE_NAME = "inventory-pos:sidebar-state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

export function Sidebar({ open, setOpen, collapsed = false, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isMobile = useMobile()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [mobileIconsOnly, setMobileIconsOnly] = useState(false)
  const { user, userProfile, store, signOut } = useSupabaseAuth()
  const { toast } = useToast()

  // Get user role from multiple sources with fallbacks
  const userProfileRole = userProfile?.role
  const userRoleProp = user?.role
  const userMetadataRole = user?.user_metadata?.role
  const isStoreOwner = userProfile?.is_store_owner

  // Priority: userProfile.role > JWT token role > user metadata role > default
  // But prioritize super_admin from metadata if available
  let actualRole = userProfileRole || userRoleProp || userMetadataRole

  // Special case: if metadata shows super_admin, always use that (overrides fallback profile)
  if (userMetadataRole === 'super_admin') {
    actualRole = 'super_admin'
  }

  console.log("🔍 DEBUG: User role determination:", {
    userProfileRole,
    userRoleProp,
    userMetadataRole,
    isStoreOwner,
    actualRole,
    profileLoaded: !!userProfile
  })

  console.log('🔍 DEBUG: User object:', user)

  // Determine effective role: store owners get admin, otherwise use assigned role
  // If user is authenticated but no specific role found, check if they might be admin based on email or other indicators
  let userRole = "guest"
  if (user) {
    if (actualRole) {
      userRole = actualRole
    } else if (isStoreOwner) {
      userRole = "admin"
    } else {
      // Check if user might be admin based on email pattern or other indicators
      const adminEmails = ['admin', 'olaniyanpaul012@gmail.com'] // Add known admin emails
      const superAdminEmails = ['superadmin', 'olaniyanpaul012@gmail.com'] // Add known super admin emails

      if (superAdminEmails.some(email => user.email?.includes(email))) {
        userRole = "super_admin"
      } else if (adminEmails.some(email => user.email?.includes(email))) {
        userRole = "admin"
      } else {
        userRole = "seller" // Default for authenticated users
      }
    }
  }

  // If user profile is not loaded yet but we have a user, show loading state
  if (user && !userProfile && userRole === "guest") {
    userRole = "loading"
  }

  const userName = userProfile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || "Guest"
  const userEmail = user?.email || ""
  const storeName = store?.name || "Store"

  // Log role detection for debugging
  if (user) {
    console.log("🔍 DEBUG: User role detection:", {
      userId: user.id,
      userEmail: user.email,
      userProfileRole,
      userRoleProp,
      userMetadataRole,
      isStoreOwner,
      actualRole,
      finalUserRole: userRole,
      userProfileLoaded: !!userProfile,
      userProfileKeys: userProfile ? Object.keys(userProfile) : null,
      userKeys: Object.keys(user),
      userMetadataKeys: user.user_metadata ? Object.keys(user.user_metadata) : null
    })
  }


  // Show loading state if user is not available yet
  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-xs text-muted-foreground">Loading user data...</p>
      </div>
    )
  }

  // If user is available but profile is still loading, show basic navigation
  if (!userProfile) {
    console.log("User profile not loaded yet, showing basic navigation")
  }

  // Get initial state from cookie if available
  useState(() => {
    if (typeof window !== "undefined") {
      const cookie = document.cookie.split("; ").find((row) => row.startsWith(SIDEBAR_COOKIE_NAME))

      if (cookie) {
        return cookie.split("=")[1] === "open"
      }
    }
    return !isMobile
  })

  // Use either the prop or internal state
  const isCollapsed = collapsed !== undefined ? collapsed : internalCollapsed
  const toggleCollapsed = (value: boolean) => {
    if (setCollapsed) {
      setCollapsed(value)
    } else {
      setInternalCollapsed(value)
    }
  }

    // Update cookie when sidebar state changes
  useEffect(() => {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${open ? "open" : "collapsed"}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
  }, [open])

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    // Expand the section that contains the current path
    if (pathname) {
      const pathSegments = pathname.split("/dashboard").filter(Boolean)
      if (pathSegments.length > 0) {
        const mainSection = pathSegments[0]
        setExpandedGroups((prev) => ({
          ...prev,
          [mainSection]: true,
        }))
      }
    }
  }, [pathname])

  const toggleGroup = (group: string) => {
    if (isCollapsed && !isMobile) return
    if (isMobile && mobileIconsOnly) return
    setExpandedGroups((prev) => ({
      ...prev,
      [group]: !prev[group],
    }))
  }

  const closeSidebar = () => {
    if (isMobile && setOpen) {
      setOpen(false)
    }
  }

  // Define navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      {
        group: "Overview",
        icon: <Home className="h-4 w-4" />,
        items: [
          {
            title: "Dashboard",
            href: "/dashboard",
            icon: <Home className="h-4 w-4" />,
            roles: ["admin", "manager", "cashier", "seller", "super_admin"],
          },
        ],
      },
    ]

    const inventoryItems = {
      group: "Inventory",
      icon: <Package className="h-4 w-4" />,
      items: [
        {
          title: "Products",
          href: "/products",
          icon: <Tag className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Categories",
          href: "/categories",
          icon: <FolderTree className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Image Gallery",
          href: "/image-gallery",
          icon: <ImageIcon className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier", "seller"],
        },
        {
          title: "Inventory",
          href: "/inventory",
          icon: <Boxes className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Stock Transfer",
          href: "/stock-transfer",
          icon: <ArrowLeftRight className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Suppliers",
          href: "/suppliers",
          icon: <Truck className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
      ],
    }

    const salesItems = {
      group: "Sales & Customers",
      icon: <ShoppingCart className="h-4 w-4" />,
      items: [
        {
          title: "Point of Sale",
          href: "/sales",
          icon: <ShoppingCart className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier"],
        },
        {
          title: "Customers",
          href: "/customers",
          icon: <Users className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier"],
        },
        {
          title: "Invoices",
          href: "/invoices",
          icon: <FileText className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier"],
        },
        {
          title: "Discounts",
          href: "/discounts",
          icon: <Percent className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
      ],
    }

    const restaurantItems = {
      group: "Restaurant",
      icon: <Coffee className="h-4 w-4" />,
      items: [
        {
          title: "Menu",
          href: "/menu",
          icon: <ClipboardList className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier"],
        },
        {
          title: "Tables",
          href: "/tables",
          icon: <LayoutDashboard className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier"],
        },
        {
          title: "Orders",
          href: "/orders",
          icon: <ShoppingCart className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier"],
        },
      ],
    }

    const analyticsItems = {
      group: "Analytics",
      icon: <BarChart2 className="h-4 w-4" />,
      items: [
        {
          title: "Reports",
          href: "/reports",
          icon: <BarChart3 className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Sales Analytics",
          href: "/analytics/sales",
          icon: <PieChart className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Inventory Reports",
          href: "/analytics/inventory",
          icon: <BarChart2 className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
        {
          title: "Financial Summary",
          href: "/analytics/financial",
          icon: <DollarSign className="h-4 w-4" />,
          roles: ["admin", "manager"],
        },
      ],
    }

    const sellerItems = {
      group: "Seller Portal",
      icon: <Store className="h-4 w-4" />,
      items: [
        {
          title: "Dashboard",
          href: "/seller",
          icon: <Store className="h-4 w-4" />,
          roles: ["seller"],
        },
        {
          title: "New Purchase",
          href: "/sales",
          icon: <ShoppingCart className="h-4 w-4" />,
          roles: ["seller"],
        },
        {
          title: "Purchase History",
          href: "/seller/history",
          icon: <Calendar className="h-4 w-4" />,
          roles: ["seller"],
        },
        {
          title: "Invoices",
          href: "/seller/invoices",
          icon: <CreditCard className="h-4 w-4" />,
          roles: ["seller"],
        },
        {
          title: "Messages",
          href: "/seller/messages",
          icon: <MessageSquare className="h-4 w-4" />,
          roles: ["seller"],
          badge: "3",
        },
        {
          title: "Profile",
          href: "/seller/profile",
          icon: <UserCircle className="h-4 w-4" />,
          roles: ["seller"],
        },
        {
          title: "Reports",
          href: "/seller/reports",
          icon: <BarChart3 className="h-4 w-4" />,
          roles: ["seller"],
        },
      ],
    }

    const adminItems = {
      group: "Administration",
      icon: <UserCog className="h-4 w-4" />,
      items: [
        {
          title: "User Management",
          href: "/admin/users",
          icon: <UserCog className="h-4 w-4" />,
          roles: ["admin", "super_admin"],
        },
        {
          title: "Organization Settings",
          href: "/admin/settings",
          icon: <Settings className="h-4 w-4" />,
          roles: ["admin", "super_admin"],
        },
        {
          title: "Messages",
          href: "/admin/messages",
          icon: <MessageSquare className="h-4 w-4" />,
          roles: ["admin", "super_admin"],
          badge: "2",
        },
      ],
    }

    const otherItems = {
      group: "Other",
      icon: <Settings className="h-4 w-4" />,
      items: [
        {
          title: "Settings",
          href: "/settings",
          icon: <Settings className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier", "seller"],
        },
        {
          title: "Notifications",
          href: "/notifications",
          icon: <Bell className="h-4 w-4" />,
          roles: ["admin", "manager", "cashier", "seller"],
          badge: "5",
        },
      ],
    }

    // Combine all items and filter based on user role
    let allItems = [...commonItems]

    if (userRole === "super_admin") {
      // Super admin gets all access
      allItems = [...allItems, inventoryItems, salesItems, restaurantItems, analyticsItems, adminItems, otherItems]
    } else if (userRole === "admin") {
      allItems = [...allItems, inventoryItems, salesItems, restaurantItems, analyticsItems, adminItems, otherItems]
    } else if (userRole === "manager") {
      allItems = [...allItems, inventoryItems, salesItems, restaurantItems, analyticsItems, otherItems]
    } else if (userRole === "cashier") {
      allItems = [...allItems, salesItems, restaurantItems, otherItems]
    } else if (userRole === "seller") {
      allItems = [...allItems, sellerItems, otherItems]
    } else if (userRole === "loading") {
      // Show loading state for navigation while user profile loads
      console.log("User role still loading, showing basic navigation")
      allItems = [...allItems, sellerItems, otherItems]
    } else {
      // Fallback for any unrecognized role - show basic seller access
      console.warn("Unrecognized user role:", userRole, "- defaulting to seller access")
      allItems = [...allItems, sellerItems, otherItems]
    }

    // Filter items based on user role and permissions
    return allItems
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          // Check if user has the required role
          if (item.roles && item.roles.includes(userRole)) {
            return true
          }
          // For super_admin, also check if they have admin permissions
          if (userRole === 'super_admin' && item.roles && item.roles.includes('admin')) {
            return true
          }
          return false
        }),
      }))
      .filter((group) => group.items.length > 0)
  }

  const navigationItems = getNavigationItems()

  const renderNavItems = () => {
    // For desktop collapsed or mobile in icons-only mode
    if ((isCollapsed && !isMobile) || (isMobile && mobileIconsOnly)) {
      return (
        <TooltipProvider>
          <div className="space-y-2">
            {navigationItems.map((group) => (
              <div key={group.group} className="flex flex-col items-center py-2">
                {group.items.map((item) => (
                  <Tooltip key={item.href} delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link href={item.href} onClick={closeSidebar} className="relative my-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className={cn(pathname === item.href && "bg-muted", "h-9 w-9")}
                        >
                          {item.icon}
                          {(item as any).badge && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                              {(item as any).badge}
                            </span>
                          )}
                        </Button>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            ))}
          </div>
        </TooltipProvider>
      )
    }

    // For expanded mode (both desktop and mobile)
    return (
      <div className="space-y-2">
        {navigationItems.map((group) => (
          <div key={group.group} className="pb-2">
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 text-xs font-medium text-muted-foreground"
              onClick={() => toggleGroup(group.group)}
            >
              <div className="flex items-center gap-2">
                {group.icon}
                <span>{group.group}</span>
              </div>
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", expandedGroups[group.group] ? "rotate-180" : "")}
              />
            </Button>

            {expandedGroups[group.group] && (
              <div className="mt-1 space-y-1 px-2">
                {group.items.map((item) => (
                  <Link key={item.href} href={item.href} onClick={closeSidebar}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-2 font-normal",
                        pathname === item.href && "bg-muted font-medium",
                      )}
                      size="sm"
                    >
                      {item.icon}
                      <span>{item.title}</span>
                      {(item as any).badge && (
                        <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                          {(item as any).badge}
                        </span>
                      )}
                    </Button>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderFooter = () => {
    // For desktop collapsed or mobile in icons-only mode
    if ((isCollapsed && !isMobile) || (isMobile && mobileIconsOnly)) {
      return (
        <div className="flex flex-col items-center gap-2">
          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/help">
                  <Button variant="ghost" size="icon">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Help & Support</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Link href="/auth">
                  <Button variant="ghost" size="icon" className="text-red-500">
                    <LogOut className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">Logout</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )
    }

    // For expanded mode (both desktop and mobile)
    return (
      <div className="space-y-2">
        <Link href="/help" className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted">
          <HelpCircle className="mr-2 h-4 w-4" />
          Help & Support
        </Link>
        <Button
          className="flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-muted text-red-500 hover:text-red-500"
          onClick={signOut}
          variant="ghost"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    )
  }

  const SidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b">
        {/* Show logo and title only when not in icons-only mode */}
        {!isCollapsed && !mobileIconsOnly && (
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            <span className="font-semibold">InventoryPOS</span>
          </div>
        )}

        {/* For desktop: collapse/expand toggle */}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", isCollapsed ? "mx-auto" : "")}
            onClick={() => toggleCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        )}

        {/* For mobile: toggle between icons-only and full view (no close button, moved outside) */}
        {isMobile && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto text-muted-foreground"
            onClick={() => setMobileIconsOnly(!mobileIconsOnly)}
          >
            {mobileIconsOnly ? <AlignJustify className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
          </Button>
        )}

        {/* For mobile in collapsed mode, just show the mobile toggle */}
        {isMobile && isCollapsed && (
          <Button variant="ghost" size="icon" className="mx-auto" onClick={() => toggleCollapsed(!isCollapsed)}>
            <Monitor className="h-4 w-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className={cn("p-2", (isCollapsed && !isMobile) || (isMobile && mobileIconsOnly) ? "px-1" : "")}>
          {renderNavItems()}
        </div>
      </ScrollArea>

      {/* Resize handle for desktop */}
      {!isMobile && (
        <div
          className="absolute inset-y-0 right-0 w-1 cursor-ew-resize hover:bg-primary/10 transition-colors"
          onMouseDown={(e) => {
            e.preventDefault()

            const startX = e.clientX
            const startWidth = open ? 256 : 80

            const onMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = startWidth + moveEvent.clientX - startX

              if (newWidth < 120) {
                setOpen?.(false)
              } else {
                setOpen?.(true)
              }
            }

            const onMouseUp = () => {
              document.removeEventListener("mousemove", onMouseMove)
              document.removeEventListener("mouseup", onMouseUp)
            }

            document.addEventListener("mousemove", onMouseMove)
            document.addEventListener("mouseup", onMouseUp)
          }}
        />
      )}

      <div
        className={cn(
          "mt-auto p-4 border-t",
          (isCollapsed && !isMobile) || (isMobile && mobileIconsOnly) ? "flex justify-center" : "",
        )}
      >
        {renderFooter()}
      </div>
    </div>
  )

  // For mobile, we'll use a Sheet component to show the sidebar with the close button outside
  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className={cn(
            "p-0 transition-all duration-300 ease-in-out [&>button]:hidden",
            mobileIconsOnly ? "w-14" : "w-[240px] sm:w-[280px]",
          )}
        >
          {/* External close button positioned outside the sidebar */}
          <div className="absolute right-0 top-4 translate-x-12 z-20">
            <SheetClose asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-background shadow-md border">
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>

          {SidebarContent}
        </SheetContent>
      </Sheet>
    )
  }

  // For desktop, we'll show a standard sidebar
  return (
    <div
      className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ease-in-out z-40",
        isCollapsed ? "md:w-16" : "md:w-64",
      )}
    >
      <div className="flex-1 flex flex-col min-h-0 border-r bg-background">{SidebarContent}</div>
    </div>
  )
}
