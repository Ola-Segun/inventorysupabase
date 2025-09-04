import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/permissions - Get permissions and role mappings
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID')
    const userRole = request.headers.get('X-User-Role')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['super_admin', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Define all available permissions
    const allPermissions = {
      users: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'users.invite'
      ],
      products: [
        'products.read',
        'products.create',
        'products.update',
        'products.delete'
      ],
      orders: [
        'orders.read',
        'orders.create',
        'orders.update',
        'orders.delete',
        'orders.void'
      ],
      categories: [
        'categories.read',
        'categories.create',
        'categories.update',
        'categories.delete'
      ],
      customers: [
        'customers.read',
        'customers.create',
        'customers.update',
        'customers.delete'
      ],
      suppliers: [
        'suppliers.read',
        'suppliers.create',
        'suppliers.update',
        'suppliers.delete'
      ],
      reports: [
        'reports.read',
        'reports.export'
      ],
      inventory: [
        'inventory.read',
        'inventory.update'
      ],
      settings: [
        'settings.read',
        'settings.update'
      ],
      stores: [
        'stores.read',
        'stores.update'
      ],
      audit: [
        'audit.read'
      ]
    }

    // Define role-based permissions
    const rolePermissions = {
      super_admin: [
        'users.*',
        'products.*',
        'orders.*',
        'categories.*',
        'customers.*',
        'suppliers.*',
        'reports.*',
        'inventory.*',
        'settings.*',
        'stores.*',
        'audit.*'
      ],
      admin: [
        'users.read',
        'users.create',
        'users.update',
        'users.delete',
        'users.invite',
        'products.read',
        'products.create',
        'products.update',
        'products.delete',
        'orders.read',
        'orders.create',
        'orders.update',
        'orders.delete',
        'orders.void',
        'categories.read',
        'categories.create',
        'categories.update',
        'categories.delete',
        'customers.read',
        'customers.create',
        'customers.update',
        'customers.delete',
        'suppliers.read',
        'suppliers.create',
        'suppliers.update',
        'suppliers.delete',
        'reports.read',
        'reports.export',
        'inventory.read',
        'inventory.update',
        'settings.read',
        'settings.update',
        'stores.read',
        'stores.update'
      ],
      manager: [
        'products.read',
        'products.create',
        'products.update',
        'orders.read',
        'orders.create',
        'orders.update',
        'orders.void',
        'categories.read',
        'categories.create',
        'categories.update',
        'customers.read',
        'customers.create',
        'customers.update',
        'suppliers.read',
        'suppliers.create',
        'suppliers.update',
        'reports.read',
        'reports.export',
        'inventory.read',
        'inventory.update'
      ],
      cashier: [
        'products.read',
        'orders.read',
        'orders.create',
        'orders.update',
        'customers.read',
        'customers.create',
        'customers.update',
        'inventory.read'
      ],
      seller: [
        'products.read',
        'orders.read',
        'orders.create',
        'customers.read',
        'customers.create'
      ]
    }

    // Flatten all permissions into a single array
    const flattenedPermissions = Object.values(allPermissions).flat()

    return NextResponse.json({
      permissions: flattenedPermissions,
      permissionGroups: allPermissions,
      rolePermissions: rolePermissions,
      currentUserRole: userRole
    })

  } catch (error) {
    console.error('Admin permissions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/permissions - Update user permissions (admin only)
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID')
    const userRole = request.headers.get('X-User-Role')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['super_admin', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    const { targetUserId, permissions } = await request.json()

    if (!targetUserId || !Array.isArray(permissions)) {
      return NextResponse.json(
        { error: 'Target user ID and permissions array are required' },
        { status: 400 }
      )
    }

    // Get current user's organization for permission checking
    let organizationFilter = ''
    if (userRole === 'admin') {
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

      if (userProfile?.organization_id) {
        organizationFilter = userProfile.organization_id
      }
    }

    // Get target user to verify they can be managed
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, organization_id, role')
      .eq('id', targetUserId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'Target user not found' },
        { status: 404 }
      )
    }

    // Check if admin can manage this user
    if (userRole === 'admin' && targetUser.organization_id !== organizationFilter) {
      return NextResponse.json(
        { error: 'Cannot manage users from different organization' },
        { status: 403 }
      )
    }

    // Prevent admins from modifying super admins
    if (userRole === 'admin' && targetUser.role === 'super_admin') {
      return NextResponse.json(
        { error: 'Cannot modify super admin permissions' },
        { status: 403 }
      )
    }

    // Update user permissions
    const { error: updateError } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', targetUserId)

    if (updateError) {
      console.error('Permission update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update permissions' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.rpc('log_audit_event', {
      p_action: 'permissions_updated',
      p_table_name: 'users',
      p_record_id: targetUserId,
      p_old_values: null,
      p_new_values: { permissions }
    })

    return NextResponse.json({
      message: 'Permissions updated successfully',
      userId: targetUserId,
      permissions
    })

  } catch (error) {
    console.error('Admin update permissions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}