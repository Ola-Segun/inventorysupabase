import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * Comprehensive admin permission checking that handles both role-based and store ownership permissions
 */
export async function checkAdminPermissions(supabase: any, userId: string): Promise<boolean> {
  try {
    // First, try to get user profile with store ownership info
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id, is_store_owner')
      .eq('id', userId)
      .single()

    if (profileError || !userProfile) {
      console.error('Failed to get user profile for permission check:', profileError)
      return false
    }

    // Check 1: Super admin has all permissions
    if (userProfile.role === 'super_admin') {
      return true
    }

    // Check 2: Admin role has admin permissions
    if (userProfile.role === 'admin') {
      return true
    }

    // Check 3: Store owners have admin permissions for their store
    if (userProfile.is_store_owner && userProfile.store_id) {
      return true
    }

    // Check 4: Use database function as fallback (in case RLS policies need it)
    try {
      const { data: isAdmin, error: funcError } = await supabase.rpc('is_user_admin', {
        user_uuid: userId
      })

      if (!funcError && isAdmin) {
        return true
      }
    } catch (funcError) {
      console.warn('Database function check failed, continuing with basic checks:', funcError)
    }

    return false
  } catch (error) {
    console.error('Admin permission check error:', error)
    return false
  }
}

/**
 * Get user scope for filtering data (store-based multi-tenancy)
 */
export async function getUserScope(supabase: any, userId: string) {
  try {
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('role, store_id, organization_id, is_store_owner')
      .eq('id', userId)
      .single()

    if (error || !userProfile) {
      throw new Error('Failed to get user profile')
    }

    return {
      role: userProfile.role,
      storeId: userProfile.store_id,
      organizationId: userProfile.organization_id,
      isStoreOwner: userProfile.is_store_owner,
      isSuperAdmin: userProfile.role === 'super_admin',
      // For filtering queries
      scopeFilter: userProfile.role === 'super_admin'
        ? {} // No filter for super admin
        : userProfile.store_id
          ? { store_id: userProfile.store_id }
          : {} // Fallback if no store_id
    }
  } catch (error) {
    console.error('Failed to get user scope:', error)
    throw error
  }
}

/**
 * Check if user can perform a specific action on a resource
 */
export async function checkPermission(
  supabase: any,
  userId: string,
  resource: string,
  action: string
): Promise<boolean> {
  try {
    // First check if user has admin permissions (which grant all permissions)
    const hasAdmin = await checkAdminPermissions(supabase, userId)
    if (hasAdmin) {
      return true
    }

    // Check specific permission using database function
    const { data: hasPermission, error } = await supabase.rpc('user_has_permission', {
      user_uuid: userId,
      required_permission: `${resource}.${action}`
    })

    if (error) {
      console.error('Permission check error:', error)
      return false
    }

    return hasPermission || false
  } catch (error) {
    console.error('Permission check failed:', error)
    return false
  }
}

/**
 * Create a Supabase client for API routes with proper configuration
 */
export function createAdminSupabaseClient() {
  return createRouteHandlerClient({ cookies })
}

/**
 * Middleware function to check admin permissions and return user scope
 */
export async function requireAdminPermissions(supabase: any, userId: string) {
  const hasPermission = await checkAdminPermissions(supabase, userId)
  if (!hasPermission) {
    throw new Error('Insufficient permissions')
  }

  return await getUserScope(supabase, userId)
}