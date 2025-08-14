"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Bell,
  Search,
  Menu,
  LogOut,
  Settings,
  User,
  HelpCircle,
  ShoppingCart,
  Package,
  FileText,
  Users,
  Tag,
  Truck,
  X,
  Home,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { useMobile } from "@/hooks/use-mobile"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "./ui/use-toast"

import { useAuth } from "@/hooks/useAuth"


interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

// Export as both named and default export
export function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isMobile = useMobile()
  const router = useRouter()
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const {toast} = useToast()

  const userRole = user?.role || "guest"
  const userName = user?.name || "Guest"
  const userEmail = user?.email || ""

  const handleLogout = async () => {

    try {
      await logout()
      router.push("/auth")

    } catch (err) {
      console.error('Logout error:', err)
    }
    
    // // Clear auth data
    // document.cookie = "auth=; path=/; max-age=0"
    // localStorage.removeItem("userRole")
    // localStorage.removeItem("userEmail")

    // // Navigate to login page
  }

  const handleProfileClick = () => {
    router.push("/settings")
  }

  const handleNotificationsClick = () => {
    router.push("/notifications")
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)

    if (query.length > 1) {
      setIsSearching(true)

      // Mock search results based on user role
      setTimeout(() => {
        let results: any[] = []

        // Common search results for all roles
        const commonResults = [
          { type: "settings", id: "settings", name: "Settings", url: "/settings" },
          { type: "help", id: "help", name: "Help & Support", url: "/help" },
        ]

        // Role-specific search results
        if (userRole === "admin" || userRole === "manager") {
          results = [
            { type: "product", id: "1", name: "Organic Apples", url: "/products?id=1" },
            { type: "product", id: "2", name: "Whole Wheat Bread", url: "/products?id=2" },
            { type: "customer", id: "CUST-001", name: "John Smith", url: "/customers?id=CUST-001" },
            { type: "order", id: "ORD-1234", name: "Order #1234", url: "/sales/orders/1234" },
            { type: "invoice", id: "INV-5678", name: "Invoice #5678", url: "/sales/invoices/5678" },
            { type: "report", id: "sales", name: "Sales Report", url: "/reports/sales" },
            { type: "supplier", id: "SUP-001", name: "Fresh Farms Inc.", url: "/suppliers?id=SUP-001" },
            ...commonResults,
          ]
        } else if (userRole === "cashier") {
          results = [
            { type: "product", id: "1", name: "Organic Apples", url: "/products?id=1" },
            { type: "product", id: "2", name: "Whole Wheat Bread", url: "/products?id=2" },
            { type: "customer", id: "CUST-001", name: "John Smith", url: "/customers?id=CUST-001" },
            { type: "order", id: "ORD-1234", name: "Order #1234", url: "/sales/orders/1234" },
            ...commonResults,
          ]
        } else if (userRole === "seller") {
          results = [
            { type: "invoice", id: "INV-5678", name: "Invoice #5678", url: "/seller/invoices/5678" },
            { type: "order", id: "ORD-1234", name: "Purchase Order #1234", url: "/seller/history?id=1234" },
            ...commonResults,
          ]
        }

        // Filter results based on search query
        setSearchResults(
          results.filter(
            (item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.id.toLowerCase().includes(query.toLowerCase()) ||
              item.type.toLowerCase().includes(query.toLowerCase()),
          ),
        )
        setIsSearching(false)
      }, 300)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const getSearchResultIcon = (type: string) => {
    switch (type) {
      case "product":
        return <Tag className="h-4 w-4" />
      case "customer":
        return <Users className="h-4 w-4" />
      case "order":
        return <ShoppingCart className="h-4 w-4" />
      case "invoice":
        return <FileText className="h-4 w-4" />
      case "report":
        return <FileText className="h-4 w-4" />
      case "supplier":
        return <Truck className="h-4 w-4" />
      case "settings":
        return <Settings className="h-4 w-4" />
      case "help":
        return <HelpCircle className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-2 border-b bg-background px-3 sm:px-4 md:px-6">
      <div className="md:hidden">
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-5 w-5" />
          <span className="text-lg font-bold hidden sm:inline-block">InventoryPOS</span>
        </Link>
      </div>
    
      <div className="flex flex-1 items-center justify-center max-w-xl mx-auto relative">
        {!isMobile && (
        <div className="relative w-full max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products, customers, orders..."
            className="w-full bg-background pl-8 pr-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-2.5 top-2.5">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-[300px] overflow-auto">
              <div className="p-2">
                {searchResults.map((result, index) => (
                  <Link
                    key={index}
                    href={result.url}
                    className="flex items-center gap-2 p-2 hover:bg-muted rounded-md"
                    onClick={() => setSearchResults([])}
                  >
                    <div className="flex-shrink-0">{getSearchResultIcon(result.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{result.name}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.type.charAt(0).toUpperCase() + result.type.slice(1)} • {result.id}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-8"
                  onClick={() => router.push(`/search?q=${searchQuery}`)}
                >
                  <Search className="mr-2 h-3.5 w-3.5" />
                  Search for "{searchQuery}"
                </Button>
              </div>
            </div>
          )}
        </div>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-4">
        {isMobile && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full p-0">
              <div className="p-4 pt-12">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="w-full bg-background pl-8"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    autoFocus
                  />
                </div>

                {searchResults.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {searchResults.map((result, index) => (
                      <SheetClose asChild key={index}>
                        <Link href={result.url} className="flex items-center gap-2 p-2 hover:bg-muted rounded-md">
                          <div className="flex-shrink-0">{getSearchResultIcon(result.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{result.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {result.type.charAt(0).toUpperCase() + result.type.slice(1)} • {result.id}
                            </div>
                          </div>
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        )}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/welcome')}
                className="text-muted-foreground"
              >
                <Home className="h-4 w-4 mr-2" />
                Welcome Page
              </Button>
            </TooltipTrigger>
            <TooltipContent>Return to Welcome Page</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <KeyboardShortcuts />
            </TooltipTrigger>
            <TooltipContent>Keyboard shortcuts</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <ModeToggle />
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="relative" onClick={handleNotificationsClick}>
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder  .svg?height=32&width=32" alt="User" />
                <AvatarFallback>
                  {userName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                <p className="text-xs leading-none text-muted-foreground mt-1 capitalize">{userRole}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/help")}>
              <HelpCircle className="mr-2 h-4 w-4" />
              Help & Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

// Also export as default
export default Header
