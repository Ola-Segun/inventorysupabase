import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/client'
import crypto from 'crypto'

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

// POST /api/admin/users/reset-password - Admin resets user password
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

    const { userId, newPassword, sendEmail = false } = await request.json()

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!newPassword) {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
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

    // Get target user info
    const { data: targetUser, error: targetError } = await supabase
      .from('users')
      .select('id, email, store_id, organization_id, role')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if admin can reset password for this user
    if (currentUserProfile.role === 'admin' && targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot reset password for other admin users' },
        { status: 403 }
      )
    }

    // Ensure user can only reset passwords for users in their store (unless super_admin)
    if (currentUserProfile.role !== 'super_admin' && targetUser.store_id !== currentUserProfile.store_id) {
      return NextResponse.json(
        { error: 'Cannot reset password for users from other stores' },
        { status: 403 }
      )
    }

    // Update password in Supabase Auth
    const { error: updateAuthError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword
    })

    if (updateAuthError) {
      console.error('Auth password update error:', updateAuthError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    // Update last password change timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({
        last_password_change: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('User profile update error:', updateError)
      // Don't fail the request if this update fails
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'password_reset_admin',
        table_name: 'users',
        record_id: userId,
        new_values: { password_reset: true },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    // TODO: Send email notification if requested
    if (sendEmail && targetUser.email) {
      // In a real implementation, you'd integrate with an email service
      console.log(`Password reset notification would be sent to: ${targetUser.email}`)
    }

    return NextResponse.json({
      message: 'Password reset successfully',
      userId: targetUser.id,
      email: targetUser.email
    })

  } catch (error) {
    console.error('POST reset password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}