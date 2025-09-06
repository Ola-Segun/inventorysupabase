import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { checkAdminPermissions, createAdminSupabaseClient } from '@/lib/admin-permissions'

type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'

// PUT /api/admin/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminSupabaseClient()
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(supabase, currentUser.id)
    if (!hasPermission) {
      console.error('Permission denied for user:', currentUser.id)
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: userId } = await params
    const { name, email, role, phone, status } = await request.json()

    // Get current user's permissions
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id, organization_id')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    // Get target user info
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('store_id, organization_id, role')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if user can modify this target user
    if (currentUserProfile.role === 'admin' && targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot modify other admin users' },
        { status: 403 }
      )
    }

    if (currentUserProfile.role === 'admin' && role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot promote users to admin' },
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

    // Validate role if provided
    if (role) {
      const validRoles: UserRole[] = ['admin', 'manager', 'cashier', 'seller']
      if (!validRoles.includes(role)) {
        return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
      }
    }

    // Validate status if provided
    if (status && !['active', 'inactive', 'suspended'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Update user profile
    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (role !== undefined) updateData.role = role
    if (phone !== undefined) updateData.phone = phone
    if (status !== undefined) updateData.status = status

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select(`
        id,
        name,
        email,
        role,
        status,
        phone,
        avatar_url,
        last_login_at,
        updated_at
      `)
      .single()

    if (updateError) {
      console.error('User update error:', updateError)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Update auth metadata if email or name changed
    if (email || name) {
      const authUpdateData: any = {}
      if (email) authUpdateData.email = email
      if (name) authUpdateData.user_metadata = { name, role: role || targetUser.role }

      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, authUpdateData)
      if (authUpdateError) {
        console.error('Auth update error:', authUpdateError)
        // Don't fail the request if auth update fails, but log it
      }
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: currentUserProfile.organization_id,
        user_id: currentUser.id,
        action: 'user_updated',
        table_name: 'users',
        record_id: userId,
        old_values: targetUser,
        new_values: updateData,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'User updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status,
        phone: updatedUser.phone,
        avatar_url: updatedUser.avatar_url,
        last_login_at: updatedUser.last_login_at,
        updated_at: updatedUser.updated_at
      }
    })
  } catch (error) {
    console.error('PUT user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createAdminSupabaseClient()
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(supabase, currentUser.id)
    if (!hasPermission) {
      console.error('Permission denied for user:', currentUser.id)
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id: userId } = await params

    // Get current user's permissions
    const { data: currentUserProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id, organization_id')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    // Get target user info
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('store_id, organization_id, role')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (currentUserProfile.role === 'admin' && targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot delete other admin users' },
        { status: 403 }
      )
    }

    // Ensure user can only delete users in their store (unless super_admin)
    if (currentUserProfile.role !== 'super_admin' && targetUser.store_id !== currentUserProfile.store_id) {
      return NextResponse.json(
        { error: 'Cannot delete users from other stores' },
        { status: 403 }
      )
    }

    // Delete user profile first
    const { error: deleteError } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (deleteError) {
      console.error('User profile delete error:', deleteError)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    // Delete auth user
    const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('Auth user delete error:', authDeleteError)
      // Don't fail the request if auth delete fails, but log it
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: currentUserProfile.organization_id,
        store_id: currentUserProfile.store_id,
        user_id: currentUser.id,
        action: 'user_deleted',
        table_name: 'users',
        record_id: userId,
        old_values: targetUser,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('DELETE user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}