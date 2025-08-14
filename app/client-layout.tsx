"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Toaster } from "@/components/ui/toaster"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { ImageGalleryProvider } from "@/contexts/image-gallery-context"
import { useAuth } from "@/contexts/AuthContext"

// Define page access map outside the component
const PAGE_ACCESS_MAP: Record<string, string[]> = {
  "/admin/sellers": ["admin"],
  "/admin/users": ["admin"],
  "/admin/settings": ["admin"],
  "/admin/messages": ["admin"],
  "/user-activity": ["admin"],
  
  // Manager routes
  "/products": ["admin", "manager"],
  "/categories": ["admin", "manager"],
  "/inventory": ["admin", "manager"],
  "/suppliers": ["admin", "manager"],
  "/stock-transfer": ["admin", "manager"],
  "/discounts": ["admin", "manager"],
  "/reports": ["admin", "manager"],
  "/image-gallery": ["admin", "manager"],
  
  // Analytics routes
  "/analytics/sales": ["admin", "manager"],
  "/analytics/inventory": ["admin", "manager"],
  "/analytics/financial": ["admin", "manager"],
  
  // Cashier routes
  "/customers": ["admin", "manager", "cashier"],
  "/tables": ["admin", "manager", "cashier"],
  "/menu": ["admin", "manager", "cashier"],
  "/orders": ["admin", "manager", "cashier"],
  "/invoices": ["admin", "manager", "cashier"],
  
  // Seller routes
  "/seller": ["seller"],
  "/seller/history": ["seller"],
  "/seller/invoices": ["seller"],
  "/seller/messages": ["seller"],
  "/seller/profile": ["seller"],
  "/seller/reports": ["seller"],
  
  // Common routes
  "/dashboard": ["admin", "manager", "cashier", "seller"],
  "/sales": ["admin", "manager", "cashier", 'seller'],
  "/settings": ["admin", "manager", "cashier", "seller"],
  "/notifications": ["admin", "manager", "cashier", "seller"],
  "/help": ["admin", "manager", "cashier", "seller"],
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { user, isLoading: authLoading, isAuthenticated } = useAuth()
  const userRole = user?.role

  // Define what pages are public and don't require layout
  const publicPages = ['/', '/auth', '/welcome']
  const isPublicPage = pathname ? publicPages.includes(pathname) : false



  // Using useEffect to handle client-side only code
  useEffect(() => {
    setMounted(true)

    // Simulate page loading
    const timer = setTimeout(() => {
      setLoading(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Close sidebar on route change on mobile
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Keep session alive with periodic ping
  useEffect(() => {
    // Only start pinging if authenticated and not on public pages
    if (!isAuthenticated || isPublicPage) return;

    console.log('🔄 Starting session keep-alive ping...');
    const interval = setInterval(() => {
      fetch('http://localhost:8000/api/ping', {
        method: 'GET',
        credentials: 'include',
      }).then(() => {
        console.log('✅ Session ping successful');
      }).catch((error) => {
        console.error('❌ Session ping failed:', error);
      });
    }, 5 * 60 * 1000); // every 5 minutes

    return () => {
      console.log('🛑 Stopping session keep-alive ping');
      clearInterval(interval);
    };
  }, [isAuthenticated, isPublicPage]);

  // Prevent hydration errors by not rendering layout-specific content during SSR or loading
  if (!mounted) {
    return <>{children}</>;
  }

  // Show loading if auth is still loading and we're not on a public page
  if (authLoading && !isPublicPage) {
    return (
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-2 text-sm text-muted-foreground">Checking authentication...</p>
          </div>
        </div>
      </ThemeProvider>
    )
  }

  // Apply theme provider to all pages
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <ImageGalleryProvider>
        {isPublicPage ? (
          // For public pages without layout (landing, login, welcome)
          <>
            {children}
            <Toaster />
          </>
        ) : (
          // For authenticated pages with layout
          <div className="flex h-screen overflow-hidden">
            <Sidebar
              open={sidebarOpen}
              setOpen={setSidebarOpen}
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
            />
            <div
              className={cn(
                "flex flex-col flex-1 w-full transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "md:ml-16" : "md:ml-16"
              )}
            >
              <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
              <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 md:p-6">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  children
                )}
              </main>
            </div>
            <Toaster />
          </div> 
        )}
      </ImageGalleryProvider>
    </ThemeProvider>
  )
}
