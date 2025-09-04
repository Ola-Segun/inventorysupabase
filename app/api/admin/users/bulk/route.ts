import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/client'

type BulkOperation = 'deactivate' | 'activate' | 'delete' | 'update_role' | 'update_status'

// Helper function to check if user has admin permissions
async function checkAdminPermissions(supabase: any, userId: string) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !userProfile) return false

  // Allow super_admin or admin roles
  return ['super_admin', 'admin'].includes(userProfile.role)
}

// POST /api/admin/users/bulk - Perform bulk operations on users
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(supabase, currentUser.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { operation, userIds, data } = await request.json()

    // Validate required fields
    if (!operation || !userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        { error: 'Operation and userIds array are required' },
        { status: 400 }
      )
    }

    // Validate operation type
    const validOperations: BulkOperation[] = ['deactivate', 'activate', 'delete', 'update_role', 'update_status']
    if (!validOperations.includes(operation)) {
      return NextResponse.json({ error: 'Invalid operation' }, { status: 400 })
    }

    // Get current user's permissions
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id, organization_id')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    // Get target users to validate permissions
    const { data: targetUsers, error: targetError } = await supabase
      .from('users')
      .select('id, store_id, organization_id, role, status')
      .in('id', userIds)

    if (targetError) {
      console.error('Error fetching target users:', targetError)
      return NextResponse.json({ error: 'Failed to fetch target users' }, { status: 500 })
    }

    if (!targetUsers || targetUsers.length === 0) {
      return NextResponse.json({ error: 'No valid users found' }, { status: 404 })
    }

    // Validate that current user can modify all target users
    for (const targetUser of targetUsers) {
      // Prevent modifying other admin users (unless super_admin)
      if (currentUserProfile.role === 'admin' && targetUser.role === 'admin') {
        return NextResponse.json(
          { error: 'Cannot modify other admin users' },
          { status: 403 }
        )
      }

      // Ensure user can only modify users in their store (unless super_admin)
      if (currentUserProfile.role !== 'super_admin' && targetUser.store_id !== currentUserProfile.store_id) {
        return NextResponse.json(
          { error: 'Cannot modify users from other stores' },
          { status: 403 }
        )
      }

      // Prevent self-modification for certain operations
      if (targetUser.id === currentUser.id && ['delete', 'deactivate'].includes(operation)) {
        return NextResponse.json(
          { error: 'Cannot perform this operation on yourself' },
          { status: 403 }
        )
      }
    }

    let successCount = 0
    let failureCount = 0
    const results = []

    // Perform the bulk operation
    switch (operation) {
      case 'deactivate':
        const deactivateResult = await bulkDeactivateUsers(supabase, targetUsers, currentUserProfile)
        successCount = deactivateResult.successCount
        failureCount = deactivateResult.failureCount
        results.push(...deactivateResult.results)
        break

      case 'activate':
        const activateResult = await bulkActivateUsers(supabase, targetUsers, currentUserProfile)
        successCount = activateResult.successCount
        failureCount = activateResult.failureCount
        results.push(...activateResult.results)
        break

      case 'delete':
        const deleteResult = await bulkDeleteUsers(supabase, targetUsers, currentUserProfile)
        successCount = deleteResult.successCount
        failureCount = deleteResult.failureCount
        results.push(...deleteResult.results)
        break

      case 'update_role':
        if (!data?.role) {
          return NextResponse.json({ error: 'Role is required for update_role operation' }, { status: 400 })
        }
        const roleResult = await bulkUpdateUserRole(supabase, targetUsers, data.role, currentUserProfile)
        successCount = roleResult.successCount
        failureCount = roleResult.failureCount
        results.push(...roleResult.results)
        break

      case 'update_status':
        if (!data?.status) {
          return NextResponse.json({ error: 'Status is required for update_status operation' }, { status: 400 })
        }
        const statusResult = await bulkUpdateUserStatus(supabase, targetUsers, data.status, currentUserProfile)
        successCount = statusResult.successCount
        failureCount = statusResult.failureCount
        results.push(...statusResult.results)
        break
    }

    // Log the bulk operation
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: `bulk_${operation}`,
        table_name: 'users',
        record_id: userIds.join(','),
        new_values: {
          operation,
          user_count: userIds.length,
          success_count: successCount,
          failure_count: failureCount,
          data
        },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: `Bulk ${operation} completed`,
      successCount,
      failureCount,
      totalCount: userIds.length,
      results
    })

  } catch (error) {
    console.error('POST bulk users error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper functions for bulk operations

async function bulkDeactivateUsers(supabase: any, users: any[], currentUserProfile: any) {
  let successCount = 0
  let failureCount = 0
  const results = []

  for (const user of users) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'inactive' })
        .eq('id', user.id)

      if (error) throw error

      successCount++
      results.push({ userId: user.id, status: 'success', message: 'User deactivated' })
    } catch (error: any) {
      console.error(`Failed to deactivate user ${user.id}:`, error)
      failureCount++
      results.push({ userId: user.id, status: 'error', message: error.message })
    }
  }

  return { successCount, failureCount, results }
}

async function bulkActivateUsers(supabase: any, users: any[], currentUserProfile: any) {
  let successCount = 0
  let failureCount = 0
  const results = []

  for (const user of users) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: 'active' })
        .eq('id', user.id)

      if (error) throw error

      successCount++
      results.push({ userId: user.id, status: 'success', message: 'User activated' })
    } catch (error: any) {
      console.error(`Failed to activate user ${user.id}:`, error)
      failureCount++
      results.push({ userId: user.id, status: 'error', message: error.message })
    }
  }

  return { successCount, failureCount, results }
}

async function bulkDeleteUsers(supabase: any, users: any[], currentUserProfile: any) {
  let successCount = 0
  let failureCount = 0
  const results = []

  for (const user of users) {
    try {
      // Delete from users table first
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', user.id)

      if (userError) throw userError

      // Delete from auth.users
      const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
      if (authError) {
        console.error(`Failed to delete auth user ${user.id}:`, authError)
        // Don't fail the operation if auth delete fails
      }

      successCount++
      results.push({ userId: user.id, status: 'success', message: 'User deleted' })
    } catch (error: any) {
      console.error(`Failed to delete user ${user.id}:`, error)
      failureCount++
      results.push({ userId: user.id, status: 'error', message: error.message })
    }
  }

  return { successCount, failureCount, results }
}

async function bulkUpdateUserRole(supabase: any, users: any[], newRole: string, currentUserProfile: any) {
  let successCount = 0
  let failureCount = 0
  const results = []

  // Validate role
  const validRoles = ['admin', 'manager', 'cashier', 'seller']
  if (!validRoles.includes(newRole)) {
    return { successCount: 0, failureCount: users.length, results: users.map(u => ({ userId: u.id, status: 'error', message: 'Invalid role' })) }
  }

  // Prevent promoting to admin unless super_admin
  if (newRole === 'admin' && currentUserProfile.role === 'admin') {
    return { successCount: 0, failureCount: users.length, results: users.map(u => ({ userId: u.id, status: 'error', message: 'Cannot promote users to admin' })) }
  }

  for (const user of users) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id)

      if (error) throw error

      successCount++
      results.push({ userId: user.id, status: 'success', message: `Role updated to ${newRole}` })
    } catch (error: any) {
      console.error(`Failed to update role for user ${user.id}:`, error)
      failureCount++
      results.push({ userId: user.id, status: 'error', message: error.message })
    }
  }

  return { successCount, failureCount, results }
}

async function bulkUpdateUserStatus(supabase: any, users: any[], newStatus: string, currentUserProfile: any) {
  let successCount = 0
  let failureCount = 0
  const results = []

  // Validate status
  const validStatuses = ['active', 'inactive', 'suspended']
  if (!validStatuses.includes(newStatus)) {
    return { successCount: 0, failureCount: users.length, results: users.map(u => ({ userId: u.id, status: 'error', message: 'Invalid status' })) }
  }

  for (const user of users) {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', user.id)

      if (error) throw error

      successCount++
      results.push({ userId: user.id, status: 'success', message: `Status updated to ${newStatus}` })
    } catch (error: any) {
      console.error(`Failed to update status for user ${user.id}:`, error)
      failureCount++
      results.push({ userId: user.id, status: 'error', message: error.message })
    }
  }

  return { successCount, failureCount, results }
}