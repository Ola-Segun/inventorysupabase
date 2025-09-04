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

// PUT /api/admin/user-stores/[id] - Update user-store association
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(currentUser.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const associationId = params.id
    const { role, isPrimary } = await request.json()

    // Get the association to check permissions
    const { data: association, error: assocError } = await supabase
      .from('user_stores')
      .select('user_id, store_id, role, is_primary')
      .eq('id', associationId)
      .single()

    if (assocError || !association) {
      return NextResponse.json({ error: 'Association not found' }, { status: 404 })
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
        .eq('store_id', association.store_id)
        .single()

      if (accessError || !storeAccess) {
        // Check if user owns the store
        const { data: storeOwner, error: ownerError } = await supabase
          .from('stores')
          .select('owner_id')
          .eq('id', association.store_id)
          .single()

        if (ownerError || storeOwner?.owner_id !== currentUser.id) {
          return NextResponse.json(
            { error: 'You do not have permission to manage this store' },
            { status: 403 }
          )
        }
      }
    }

    // Validate role if provided
    if (role) {
      const validRoles: UserRole[] = ['admin', 'manager', 'cashier', 'seller']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    // If setting as primary, unset other primary associations for this user
    if (isPrimary) {
      await supabase
        .from('user_stores')
        .update({ is_primary: false })
        .eq('user_id', association.user_id)
    }

    // Update the association
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (isPrimary !== undefined) updateData.is_primary = isPrimary

    const { data: updatedAssociation, error: updateError } = await supabase
      .from('user_stores')
      .update(updateData)
      .eq('id', associationId)
      .select(`
        id,
        user_id,
        store_id,
        role,
        is_primary,
        updated_at,
        user:users(id, name, email),
        store:stores(id, name, store_type)
      `)
      .single()

    if (updateError) {
      console.error('Error updating user-store association:', updateError)
      return NextResponse.json({ error: 'Failed to update association' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'user_store_association_updated',
        resource_type: 'user_store',
        resource_id: associationId,
        details: updateData,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'User-store association updated successfully',
      association: updatedAssociation
    })
  } catch (error) {
    console.error('PUT user-store error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/user-stores/[id] - Delete user-store association
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(currentUser.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const associationId = params.id

    // Get the association to check permissions
    const { data: association, error: assocError } = await supabase
      .from('user_stores')
      .select('user_id, store_id, is_primary')
      .eq('id', associationId)
      .single()

    if (assocError || !association) {
      return NextResponse.json({ error: 'Association not found' }, { status: 404 })
    }

    // Prevent deleting primary associations if user has no other stores
    if (association.is_primary) {
      const { data: otherAssociations, error: countError } = await supabase
        .from('user_stores')
        .select('id')
        .eq('user_id', association.user_id)
        .neq('id', associationId)

      if (countError) {
        return NextResponse.json({ error: 'Failed to check associations' }, { status: 500 })
      }

      if (!otherAssociations || otherAssociations.length === 0) {
        return NextResponse.json(
          { error: 'Cannot remove the last store association for a user' },
          { status: 400 }
        )
      }
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
        .eq('store_id', association.store_id)
        .single()

      if (accessError || !storeAccess) {
        // Check if user owns the store
        const { data: storeOwner, error: ownerError } = await supabase
          .from('stores')
          .select('owner_id')
          .eq('id', association.store_id)
          .single()

        if (ownerError || storeOwner?.owner_id !== currentUser.id) {
          return NextResponse.json(
            { error: 'You do not have permission to manage this store' },
            { status: 403 }
          )
        }
      }
    }

    // Delete the association
    const { error: deleteError } = await supabase
      .from('user_stores')
      .delete()
      .eq('id', associationId)

    if (deleteError) {
      console.error('Error deleting user-store association:', deleteError)
      return NextResponse.json({ error: 'Failed to delete association' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'user_store_association_deleted',
        resource_type: 'user_store',
        resource_id: associationId,
        details: { userId: association.user_id, storeId: association.store_id },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({ message: 'User-store association deleted successfully' })
  } catch (error) {
    console.error('DELETE user-store error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}