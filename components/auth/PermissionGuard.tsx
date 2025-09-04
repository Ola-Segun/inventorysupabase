"use client"

import { ReactNode, useEffect, useState } from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ShieldX, Loader2 } from 'lucide-react'

interface PermissionGuardProps {
  children: ReactNode
  permission?: string
  resource?: string
  action?: string
  permissions?: string[]
  requireAll?: boolean // If true, user must have ALL permissions, otherwise ANY
  fallback?: ReactNode
  showError?: boolean
}

/**
 * PermissionGuard component that conditionally renders children based on user permissions
 *
 * Usage examples:
 *
 * // Single permission
 * <PermissionGuard permission="users.create">
 *   <CreateUserButton />
 * </PermissionGuard>
 *
 * // Resource + action
 * <PermissionGuard resource="products" action="update">
 *   <EditProductForm />
 * </PermissionGuard>
 *
 * // Multiple permissions (require any)
 * <PermissionGuard permissions={['users.create', 'users.update']}>
 *   <UserManagementPanel />
 * </PermissionGuard>
 *
 * // Multiple permissions (require all)
 * <PermissionGuard permissions={['users.create', 'users.delete']} requireAll={true}>
 *   <AdminPanel />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  resource,
  action,
  permissions,
  requireAll = false,
  fallback,
  showError = true
}: PermissionGuardProps) {
  const { can, canAccess, hasAnyPermission, hasAllPermissions, loading } = usePermissions()
  const [hasAccess, setHasAccess] = useState(false)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    checkPermission()
  }, [permission, resource, action, permissions])

  const checkPermission = async () => {
    try {
      let access = false

      if (permission) {
        // Single permission check
        access = await can(permission)
      } else if (resource && action) {
        // Resource + action check
        access = await canAccess(resource, action)
      } else if (permissions && permissions.length > 0) {
        // Multiple permissions check
        if (requireAll) {
          access = await hasAllPermissions(permissions)
        } else {
          access = await hasAnyPermission(permissions)
        }
      }

      setHasAccess(access)
    } catch (error) {
      console.error('Permission check failed:', error)
      setHasAccess(false)
    } finally {
      setChecked(true)
    }
  }

  if (loading || !checked) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span className="text-sm text-muted-foreground">Checking permissions...</span>
      </div>
    )
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return (
        <Alert variant="destructive">
          <ShieldX className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access this feature.
            {permission && ` Required permission: ${permission}`}
            {resource && action && ` Required: ${resource}.${action}`}
            {permissions && ` Required permissions: ${permissions.join(', ')}`}
          </AlertDescription>
        </Alert>
      )
    }

    return null
  }

  return <>{children}</>
}

// Convenience components for common permission patterns
export function AdminOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard
      permissions={['users.read', 'products.read', 'orders.read']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export function ManagerOnly({ children, fallback }: { children: ReactNode, fallback?: ReactNode }) {
  return (
    <PermissionGuard
      permissions={['products.update', 'orders.update', 'inventory.update']}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export function UserManagementGuard({ children, action = 'read', fallback }: {
  children: ReactNode,
  action?: 'create' | 'read' | 'update' | 'delete' | 'invite',
  fallback?: ReactNode
}) {
  return (
    <PermissionGuard
      permission={`users.${action}`}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export function ProductManagementGuard({ children, action = 'read', fallback }: {
  children: ReactNode,
  action?: 'create' | 'read' | 'update' | 'delete',
  fallback?: ReactNode
}) {
  return (
    <PermissionGuard
      permission={`products.${action}`}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export function OrderManagementGuard({ children, action = 'read', fallback }: {
  children: ReactNode,
  action?: 'create' | 'read' | 'update' | 'delete' | 'void',
  fallback?: ReactNode
}) {
  return (
    <PermissionGuard
      permission={`orders.${action}`}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}

export function ReportAccessGuard({ children, canExport = false, fallback }: {
  children: ReactNode,
  canExport?: boolean,
  fallback?: ReactNode
}) {
  const permissions = canExport
    ? ['reports.read', 'reports.export']
    : ['reports.read']

  return (
    <PermissionGuard
      permissions={permissions}
      requireAll={false}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  )
}