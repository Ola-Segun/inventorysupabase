import { useState, useEffect } from 'react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'

export function usePermissions() {
  const { hasPermission, getUserPermissions, checkPermission } = useSupabaseAuth()
  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      const userPermissions = await getUserPermissions()
      setPermissions(userPermissions)
    } catch (error) {
      console.error('Failed to load permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const can = async (permission: string): Promise<boolean> => {
    return await hasPermission(permission)
  }

  const canAccess = async (resource: string, action: string): Promise<boolean> => {
    return await checkPermission(resource, action)
  }

  const hasAnyPermission = async (permissionList: string[]): Promise<boolean> => {
    for (const permission of permissionList) {
      if (await hasPermission(permission)) {
        return true
      }
    }
    return false
  }

  const hasAllPermissions = async (permissionList: string[]): Promise<boolean> => {
    for (const permission of permissionList) {
      if (!(await hasPermission(permission))) {
        return false
      }
    }
    return true
  }

  return {
    permissions,
    loading,
    can,
    canAccess,
    hasAnyPermission,
    hasAllPermissions,
    refreshPermissions: loadPermissions
  }
}

// Specific permission hooks for common use cases
export function useUserPermissions() {
  const { can, canAccess } = usePermissions()

  return {
    canCreateUsers: () => can('users.create'),
    canReadUsers: () => can('users.read'),
    canUpdateUsers: () => can('users.update'),
    canDeleteUsers: () => can('users.delete'),
    canInviteUsers: () => can('users.invite'),
    canManageUsers: () => canAccess('users', 'update')
  }
}

export function useProductPermissions() {
  const { can, canAccess } = usePermissions()

  return {
    canCreateProducts: () => can('products.create'),
    canReadProducts: () => can('products.read'),
    canUpdateProducts: () => can('products.update'),
    canDeleteProducts: () => can('products.delete'),
    canManageProducts: () => canAccess('products', 'update')
  }
}

export function useOrderPermissions() {
  const { can, canAccess } = usePermissions()

  return {
    canCreateOrders: () => can('orders.create'),
    canReadOrders: () => can('orders.read'),
    canUpdateOrders: () => can('orders.update'),
    canDeleteOrders: () => can('orders.delete'),
    canVoidOrders: () => can('orders.void'),
    canManageOrders: () => canAccess('orders', 'update')
  }
}

export function useReportPermissions() {
  const { can, canAccess } = usePermissions()

  return {
    canReadReports: () => can('reports.read'),
    canExportReports: () => can('reports.export'),
    canAccessReports: () => canAccess('reports', 'read')
  }
}

export function useAdminPermissions() {
  const { can, canAccess } = usePermissions()

  return {
    canManageUsers: () => canAccess('users', 'update'),
    canManageProducts: () => canAccess('products', 'update'),
    canManageOrders: () => canAccess('orders', 'update'),
    canViewAuditLogs: () => can('audit.read'),
    canManageSettings: () => canAccess('settings', 'update'),
    canManageStore: () => canAccess('stores', 'update')
  }
}