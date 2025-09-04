"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'
import { Loader2 } from 'lucide-react'

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  fallback?: React.ReactNode
  redirectTo?: string
}

export function AuthGuard({
  children,
  requiredRoles = [],
  fallback,
  redirectTo = '/login'
}: AuthGuardProps) {
  const { user, userProfile, isAuthenticated, isLoading } = useSupabaseAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`${redirectTo}?redirect=${window.location.pathname}`)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-2" size={32} />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>
    }
    return null
  }

  // Check role-based access
  if (requiredRoles.length > 0 && userProfile) {
    const hasRequiredRole = requiredRoles.includes(userProfile.role)
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// Higher-order component for protecting entire pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<AuthGuardProps, 'children'> = {}
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

// Hook for checking permissions
export function usePermissions() {
  const { userProfile, hasRole, hasFeature } = useSupabaseAuth()

  return {
    userProfile,
    hasRole,
    hasFeature,
    isAdmin: hasRole(['admin']),
    isManager: hasRole(['admin', 'manager']),
    isStaff: hasRole(['admin', 'manager', 'cashier', 'seller']),
    canManageUsers: hasRole(['admin']),
    canManageProducts: hasRole(['admin', 'manager']),
    canViewReports: hasRole(['admin', 'manager']),
    canManageOrders: hasRole(['admin', 'manager', 'cashier']),
  }
}