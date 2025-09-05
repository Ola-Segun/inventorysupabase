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
import { useSupabaseAuth, SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext"

// Define page access map outside the component
const PAGE_ACCESS_MAP: Record<string, string[]> = {
  "/admin/sellers": ["admin", "super_admin"],
  "/admin/users": ["admin", "super_admin"],
  "/admin/settings": ["admin", "super_admin"],
  "/admin/messages": ["admin", "super_admin"],
  "/user-activity": ["admin", "super_admin"],

  // Manager routes
  "/products": ["admin", "super_admin", "manager"],
  "/categories": ["admin", "super_admin", "manager"],
  "/inventory": ["admin", "super_admin", "manager"],
  "/suppliers": ["admin", "super_admin", "manager"],
  "/stock-transfer": ["admin", "super_admin", "manager"],
  "/discounts": ["admin", "super_admin", "manager"],
  "/reports": ["admin", "super_admin", "manager"],
  "/image-gallery": ["admin", "super_admin", "manager"],

  // Analytics routes
  "/analytics/sales": ["admin", "super_admin", "manager"],
  "/analytics/inventory": ["admin", "super_admin", "manager"],
  "/analytics/financial": ["admin", "super_admin", "manager"],

  // Cashier routes
  "/customers": ["admin", "super_admin", "manager", "cashier"],
  "/tables": ["admin", "super_admin", "manager", "cashier"],
  "/menu": ["admin", "super_admin", "manager", "cashier"],
  "/orders": ["admin", "super_admin", "manager", "cashier"],
  "/invoices": ["admin", "super_admin", "manager", "cashier"],

  // Seller routes
  "/seller": ["seller"],
  "/seller/history": ["seller"],
  "/seller/invoices": ["seller"],
  "/seller/messages": ["seller"],
  "/seller/profile": ["seller"],
  "/seller/reports": ["seller"],

  // Common routes
  "/dashboard": ["admin", "super_admin", "manager", "cashier", "seller"],
  "/sales": ["admin", "super_admin", "manager", "cashier", 'seller'],
  "/settings": ["admin", "super_admin", "manager", "cashier", "seller"],
  "/notifications": ["admin", "super_admin", "manager", "cashier", "seller"],
  "/help": ["admin", "super_admin", "manager", "cashier", "seller"],
}

function AuthenticatedLayout({
  children,
  pathname,
  isPublicPage,
  authLoading,
  authTimeout,
  isAuthenticated,
  sidebarOpen,
  setSidebarOpen,
  sidebarCollapsed,
  setSidebarCollapsed,
  loading,
}: {
  children: React.ReactNode
  pathname: string | null
  isPublicPage: boolean
  authLoading: boolean
  authTimeout: boolean
  isAuthenticated: boolean
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  loading: boolean
}) {
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

function AuthWrapper({
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
  const [authTimeout, setAuthTimeout] = useState(false)
  const { user, userProfile, isLoading: authLoading, isAuthenticated } = useSupabaseAuth()

  // Get user role from multiple sources with fallbacks (consistent with sidebar and header)
  const userProfileRole = userProfile?.role
  const userRoleProp = user?.role
  const userMetadataRole = user?.user_metadata?.role
  const isStoreOwner = userProfile?.is_store_owner

  // Priority: userProfile.role > JWT token role > user metadata role > default
  const actualRole = userProfileRole || userRoleProp || userMetadataRole

  // Determine effective role
  let userRole = "guest"
  if (user) {
    if (actualRole) {
      userRole = actualRole
    } else if (isStoreOwner) {
      userRole = "admin"
    } else {
      // Check if user might be admin based on email pattern
      const adminEmails = ['admin', 'olaniyanpaul012@gmail.com']
      const superAdminEmails = ['superadmin', 'olaniyanpaul012@gmail.com']

      if (superAdminEmails.some(email => user.email?.includes(email))) {
        userRole = "super_admin"
      } else if (adminEmails.some(email => user.email?.includes(email))) {
        userRole = "admin"
      } else {
        userRole = "seller"
      }
    }
  }

  // Define what pages are public and don't require layout
  const publicPages = ['/', '/auth', '/welcome', '/signup', '/setup', '/login', '/auth/confirm-email']
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

  // Keep session alive with periodic ping (Supabase handles this automatically)
  useEffect(() => {
    // Only start pinging if authenticated and not on public pages
    if (!isAuthenticated || isPublicPage) return;

    const interval = setInterval(() => {
      // Safe ping to server to keep cookies/session refreshed. Use the session endpoint
      fetch('/api/auth/session', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {
        // Ignore ping errors - just keeping session alive
      });
    }, 5 * 60 * 1000); // every 5 minutes

    return () => clearInterval(interval);
  }, [isAuthenticated, isPublicPage]);

  // Handle authentication redirect - prevent race conditions
  useEffect(() => {
    console.log("🔄 ClientLayout: Auth redirect check:", {
      isAuthenticated,
      isPublicPage,
      authLoading,
      pathname,
      userId: user?.id,
      timestamp: new Date().toISOString()
    });

    // Detect Supabase auth cookies (these may be set by the server during login)
    const hasAuthCookies = typeof document !== 'undefined' && (
      document.cookie.includes('sb-auth-state=authenticated') ||
      document.cookie.includes('sb-access-token=') ||
      document.cookie.includes('sb-refresh-token=')
    );

    // Only redirect to login if there are no auth cookies (prevents race after login)
    if (!isAuthenticated && !isPublicPage && !authLoading && !hasAuthCookies && pathname !== '/login') {
      console.log("🔄 ClientLayout: Redirecting to login");
      const t = setTimeout(() => router.replace('/login'), 150)
      return () => clearTimeout(t)
    }

    // Redirect authenticated users away from public pages
    if (isAuthenticated && isPublicPage && !authLoading) {
      const redirectTo = '/dashboard'
      console.log("🔄 ClientLayout: Redirecting authenticated user from public page to:", redirectTo)

      // Small delay to ensure state is stable, then hard redirect
      setTimeout(() => {
        try {
          console.log("🔄 ClientLayout: Executing hard redirect to:", redirectTo)
          window.location.href = redirectTo
        } catch (error) {
          console.error("🔄 ClientLayout: Error during redirect:", error)
        }
      }, 100)
    } else {
      console.log("🔄 ClientLayout: No redirect needed - conditions not met")
    }
  }, [isAuthenticated, isPublicPage, authLoading, pathname, router, user])

  // Fallback: if auth loading takes too long, assume not authenticated
  useEffect(() => {
    if (authLoading && !isPublicPage) {
      const fallbackTimer = setTimeout(() => {
        console.warn('Auth loading timeout - assuming not authenticated')
        setAuthTimeout(true)
      }, 15000) // 15 second fallback

      return () => clearTimeout(fallbackTimer)
    }
  }, [authLoading, isPublicPage])

  // Prevent hydration errors by not rendering layout-specific content during SSR or loading
  if (!mounted) {
    return <>{children}</>;
  }

  // Show loading if auth is still loading and we're not on a public page
  // Add a timeout to prevent infinite loading
  if ((authLoading && !authTimeout) && !isPublicPage) {
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

  // If not authenticated and not on a public page, show nothing (redirect handled by useEffect)
  if (!isAuthenticated && !isPublicPage && !authLoading && pathname !== '/login') {
    return null
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

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SupabaseAuthProvider>
      <AuthWrapper>{children}</AuthWrapper>
    </SupabaseAuthProvider>
  )
}
