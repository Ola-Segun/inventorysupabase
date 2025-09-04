export type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'

export type Permission =
  // User Management
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.invite'

  // Inventory Management
  | 'inventory.view'
  | 'inventory.create'
  | 'inventory.update'
  | 'inventory.delete'
  | 'products.manage'
  | 'categories.manage'
  | 'suppliers.manage'

  // Sales & Orders
  | 'sales.view'
  | 'sales.create'
  | 'sales.update'
  | 'sales.void'
  | 'customers.view'
  | 'customers.manage'
  | 'invoices.view'
  | 'invoices.create'
  | 'discounts.manage'

  // Analytics & Reports
  | 'reports.view'
  | 'reports.export'
  | 'analytics.view'

  // System Administration
  | 'admin.settings'
  | 'admin.system'
  | 'admin.users'
  | 'admin.audit'

  // Restaurant Features
  | 'restaurant.menu'
  | 'restaurant.tables'
  | 'restaurant.orders'

  // Seller Portal
  | 'seller.dashboard'
  | 'seller.purchases'
  | 'seller.invoices'
  | 'seller.reports'

// Permission matrix for each role
const PERMISSION_MATRIX: Record<UserRole, Permission[]> = {
  super_admin: [
    // All permissions
    'users.view', 'users.create', 'users.update', 'users.delete', 'users.invite',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'products.manage', 'categories.manage', 'suppliers.manage',
    'sales.view', 'sales.create', 'sales.update', 'sales.void',
    'customers.view', 'customers.manage',
    'invoices.view', 'invoices.create',
    'discounts.manage',
    'reports.view', 'reports.export', 'analytics.view',
    'admin.settings', 'admin.system', 'admin.users', 'admin.audit',
    'restaurant.menu', 'restaurant.tables', 'restaurant.orders',
    'seller.dashboard', 'seller.purchases', 'seller.invoices', 'seller.reports'
  ],

  admin: [
    // Most permissions except super admin features
    'users.view', 'users.create', 'users.update', 'users.delete', 'users.invite',
    'inventory.view', 'inventory.create', 'inventory.update', 'inventory.delete',
    'products.manage', 'categories.manage', 'suppliers.manage',
    'sales.view', 'sales.create', 'sales.update', 'sales.void',
    'customers.view', 'customers.manage',
    'invoices.view', 'invoices.create',
    'discounts.manage',
    'reports.view', 'reports.export', 'analytics.view',
    'admin.settings',
    'restaurant.menu', 'restaurant.tables', 'restaurant.orders'
  ],

  manager: [
    // Management level permissions
    'users.view',
    'inventory.view', 'inventory.create', 'inventory.update',
    'products.manage', 'categories.manage', 'suppliers.manage',
    'sales.view', 'sales.create', 'sales.update', 'sales.void',
    'customers.view', 'customers.manage',
    'invoices.view', 'invoices.create',
    'discounts.manage',
    'reports.view', 'reports.export', 'analytics.view',
    'restaurant.menu', 'restaurant.tables', 'restaurant.orders'
  ],

  cashier: [
    // Front-line sales permissions
    'inventory.view',
    'sales.view', 'sales.create',
    'customers.view',
    'invoices.view',
    'restaurant.menu', 'restaurant.tables', 'restaurant.orders'
  ],

  seller: [
    // Seller portal permissions
    'seller.dashboard', 'seller.purchases', 'seller.invoices', 'seller.reports',
    'inventory.view',
    'sales.view', 'sales.create',
    'customers.view'
  ]
}

// Role hierarchy for permission inheritance
const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  super_admin: ['super_admin', 'admin', 'manager', 'cashier', 'seller'],
  admin: ['admin', 'manager', 'cashier', 'seller'],
  manager: ['manager', 'cashier'],
  cashier: ['cashier'],
  seller: ['seller']
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRole: UserRole | null | undefined, permission: Permission): boolean {
  if (!userRole) return false

  // Get all roles in the hierarchy
  const rolesInHierarchy = ROLE_HIERARCHY[userRole] || []

  // Check if any role in the hierarchy has the permission
  return rolesInHierarchy.some(role => {
    const rolePermissions = PERMISSION_MATRIX[role] || []
    return rolePermissions.includes(permission)
  })
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(userRole: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!userRole) return false
  return permissions.some(permission => hasPermission(userRole, permission))
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(userRole: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!userRole) return false
  return permissions.every(permission => hasPermission(userRole, permission))
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return PERMISSION_MATRIX[role] || []
}

/**
 * Check if a role can manage another role
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  if (managerRole === 'super_admin') return true
  if (managerRole === 'admin' && targetRole !== 'super_admin' && targetRole !== 'admin') return true
  return false
}

/**
 * Get roles that a user can assign
 */
export function getAssignableRoles(userRole: UserRole): UserRole[] {
  switch (userRole) {
    case 'super_admin':
      return ['super_admin', 'admin', 'manager', 'cashier', 'seller']
    case 'admin':
      return ['manager', 'cashier', 'seller']
    default:
      return []
  }
}

/**
 * Permission groups for UI organization
 */
export const PERMISSION_GROUPS = {
  userManagement: {
    label: 'User Management',
    permissions: [
      { key: 'users.view' as Permission, label: 'View Users' },
      { key: 'users.create' as Permission, label: 'Create Users' },
      { key: 'users.update' as Permission, label: 'Update Users' },
      { key: 'users.delete' as Permission, label: 'Delete Users' },
      { key: 'users.invite' as Permission, label: 'Invite Users' }
    ]
  },

  inventory: {
    label: 'Inventory Management',
    permissions: [
      { key: 'inventory.view' as Permission, label: 'View Inventory' },
      { key: 'inventory.create' as Permission, label: 'Create Inventory Items' },
      { key: 'inventory.update' as Permission, label: 'Update Inventory' },
      { key: 'inventory.delete' as Permission, label: 'Delete Inventory Items' },
      { key: 'products.manage' as Permission, label: 'Manage Products' },
      { key: 'categories.manage' as Permission, label: 'Manage Categories' },
      { key: 'suppliers.manage' as Permission, label: 'Manage Suppliers' }
    ]
  },

  sales: {
    label: 'Sales & Orders',
    permissions: [
      { key: 'sales.view' as Permission, label: 'View Sales' },
      { key: 'sales.create' as Permission, label: 'Create Sales' },
      { key: 'sales.update' as Permission, label: 'Update Sales' },
      { key: 'sales.void' as Permission, label: 'Void Sales' },
      { key: 'customers.view' as Permission, label: 'View Customers' },
      { key: 'customers.manage' as Permission, label: 'Manage Customers' },
      { key: 'invoices.view' as Permission, label: 'View Invoices' },
      { key: 'invoices.create' as Permission, label: 'Create Invoices' },
      { key: 'discounts.manage' as Permission, label: 'Manage Discounts' }
    ]
  },

  analytics: {
    label: 'Analytics & Reports',
    permissions: [
      { key: 'reports.view' as Permission, label: 'View Reports' },
      { key: 'reports.export' as Permission, label: 'Export Reports' },
      { key: 'analytics.view' as Permission, label: 'View Analytics' }
    ]
  },

  administration: {
    label: 'System Administration',
    permissions: [
      { key: 'admin.settings' as Permission, label: 'System Settings' },
      { key: 'admin.system' as Permission, label: 'System Administration' },
      { key: 'admin.users' as Permission, label: 'User Administration' },
      { key: 'admin.audit' as Permission, label: 'Audit Logs' }
    ]
  },

  restaurant: {
    label: 'Restaurant Features',
    permissions: [
      { key: 'restaurant.menu' as Permission, label: 'Manage Menu' },
      { key: 'restaurant.tables' as Permission, label: 'Manage Tables' },
      { key: 'restaurant.orders' as Permission, label: 'Manage Orders' }
    ]
  },

  seller: {
    label: 'Seller Portal',
    permissions: [
      { key: 'seller.dashboard' as Permission, label: 'Seller Dashboard' },
      { key: 'seller.purchases' as Permission, label: 'Purchase Management' },
      { key: 'seller.invoices' as Permission, label: 'Invoice Management' },
      { key: 'seller.reports' as Permission, label: 'Seller Reports' }
    ]
  }
} as const