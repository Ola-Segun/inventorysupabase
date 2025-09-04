import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'

// Helper function to get current user from session
async function getCurrentUser() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value

  if (!accessToken) {
    return null
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error || !user) return null
    return user
  } catch {
    return null
  }
}

// Helper function to check if user has admin permissions
async function checkAdminPermissions(userId: string) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role, is_store_owner')
    .eq('id', userId)
    .single()

  if (error || !userProfile) return false

  // Allow super_admin, admin, or store owners
  return ['super_admin', 'admin'].includes(userProfile.role) || userProfile.is_store_owner
}

// GET /api/admin/user-stores - List user-store associations
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(currentUser.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user profile to determine scope
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    let query = supabase
      .from('user_stores')
      .select(`
        id,
        user_id,
        store_id,
        role,
        is_primary,
        created_at,
        updated_at,
        user:users(id, name, email),
        store:stores(id, name, store_type)
      `)

    // Filter based on permissions
    if (userProfile.role === 'super_admin') {
      // Super admin can see all associations
    } else if (userProfile.role === 'admin') {
      // Admin can see associations for stores they have access to
      const { data: adminStores } = await supabase
        .from('user_stores')
        .select('store_id')
        .eq('user_id', currentUser.id)

      if (adminStores && adminStores.length > 0) {
        const storeIds = adminStores.map(us => us.store_id)
        query = query.in('store_id', storeIds)
      } else {
        query = query.eq('store_id', '00000000-0000-0000-0000-000000000000') // No results
      }
    } else {
      // Store owner can see associations for their stores
      const { data: ownedStores } = await supabase
        .from('stores')
        .select('id')
        .eq('owner_id', currentUser.id)

      if (ownedStores && ownedStores.length > 0) {
        const storeIds = ownedStores.map(s => s.id)
        query = query.in('store_id', storeIds)
      } else {
        query = query.eq('store_id', '00000000-0000-0000-0000-000000000000') // No results
      }
    }

    const { data: associations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user-store associations:', error)
      return NextResponse.json({ error: 'Failed to fetch associations' }, { status: 500 })
    }

    return NextResponse.json({ associations: associations || [] })
  } catch (error) {
    console.error('GET user-stores error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/user-stores - Create user-store association
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(currentUser.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { userId, storeId, role, isPrimary = false } = await request.json()

    // Validate required fields
    if (!userId || !storeId || !role) {
      return NextResponse.json(
        { error: 'User ID, store ID, and role are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'manager', 'cashier', 'seller']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Check if user exists
    const { data: userExists, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if store exists
    const { data: storeExists, error: storeError } = await supabase
      .from('stores')
      .select('id')
      .eq('id', storeId)
      .single()

    if (storeError || !storeExists) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Check permissions for this store
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    // Check if current user has access to this store
    if (userProfile.role !== 'super_admin') {
      const { data: storeAccess, error: accessError } = await supabase
        .from('user_stores')
        .select('id')
        .eq('user_id', currentUser.id)
        .eq('store_id', storeId)
        .single()

      if (accessError || !storeAccess) {
        // Check if user owns the store
        const { data: storeOwner, error: ownerError } = await supabase
          .from('stores')
          .select('owner_id')
          .eq('id', storeId)
          .single()

        if (ownerError || storeOwner?.owner_id !== currentUser.id) {
          return NextResponse.json(
            { error: 'You do not have permission to manage this store' },
            { status: 403 }
          )
        }
      }
    }

    // If setting as primary, unset other primary associations for this user
    if (isPrimary) {
      await supabase
        .from('user_stores')
        .update({ is_primary: false })
        .eq('user_id', userId)
    }

    // Create the association
    const { data: association, error: createError } = await supabase
      .from('user_stores')
      .insert({
        user_id: userId,
        store_id: storeId,
        role: role,
        is_primary: isPrimary
      })
      .select(`
        id,
        user_id,
        store_id,
        role,
        is_primary,
        created_at,
        user:users(id, name, email),
        store:stores(id, name, store_type)
      `)
      .single()

    if (createError) {
      console.error('Error creating user-store association:', createError)
      return NextResponse.json({ error: 'Failed to create association' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'user_store_association_created',
        resource_type: 'user_store',
        resource_id: association.id,
        details: { userId, storeId, role, isPrimary },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'User-store association created successfully',
      association
    })
  } catch (error) {
    console.error('POST user-stores error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}