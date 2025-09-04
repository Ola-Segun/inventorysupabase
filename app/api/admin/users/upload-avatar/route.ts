import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/client'

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

// POST /api/admin/users/upload-avatar - Upload user avatar
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

    const formData = await request.formData()
    const userId = formData.get('userId') as string
    const file = formData.get('avatar') as File

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!file) {
      return NextResponse.json({ error: 'Avatar file is required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 5MB' },
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
      .select('id, store_id, organization_id, role, avatar_url')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if admin can modify this user
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

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar_${userId}_${Date.now()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('user-avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true
      })

    if (uploadError) {
      console.error('Avatar upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload avatar' },
        { status: 500 }
      )
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user-avatars')
      .getPublicUrl(filePath)

    // Delete old avatar if it exists
    if (targetUser.avatar_url) {
      try {
        // Extract old file path from URL
        const oldUrl = new URL(targetUser.avatar_url)
        const oldPath = oldUrl.pathname.split('/').slice(-2).join('/') // Get last two path segments

        if (oldPath.startsWith('avatars/')) {
          await supabase.storage
            .from('user-avatars')
            .remove([oldPath])
        }
      } catch (error) {
        console.error('Error deleting old avatar:', error)
        // Don't fail the request if old avatar deletion fails
      }
    }

    // Update user profile with new avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('User profile update error:', updateError)
      // Try to clean up uploaded file
      await supabase.storage
        .from('user-avatars')
        .remove([filePath])
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'avatar_uploaded',
        table_name: 'users',
        record_id: userId,
        new_values: { avatar_url: publicUrl },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'Avatar uploaded successfully',
      avatarUrl: publicUrl,
      userId: targetUser.id
    })

  } catch (error) {
    console.error('POST upload avatar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/users/upload-avatar - Delete user avatar
export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
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
      .select('id, store_id, organization_id, role, avatar_url')
      .eq('id', userId)
      .single()

    if (targetError || !targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check permissions
    if (currentUserProfile.role === 'admin' && targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Cannot modify other admin users' },
        { status: 403 }
      )
    }

    if (currentUserProfile.role !== 'super_admin' && targetUser.store_id !== currentUserProfile.store_id) {
      return NextResponse.json(
        { error: 'Cannot modify users from other stores' },
        { status: 403 }
      )
    }

    // Delete avatar file if it exists
    if (targetUser.avatar_url) {
      try {
        const oldUrl = new URL(targetUser.avatar_url)
        const oldPath = oldUrl.pathname.split('/').slice(-2).join('/')

        if (oldPath.startsWith('avatars/')) {
          await supabase.storage
            .from('user-avatars')
            .remove([oldPath])
        }
      } catch (error) {
        console.error('Error deleting avatar file:', error)
      }
    }

    // Update user profile to remove avatar URL
    const { error: updateError } = await supabase
      .from('users')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('User profile update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update user profile' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'avatar_deleted',
        table_name: 'users',
        record_id: userId,
        old_values: { avatar_url: targetUser.avatar_url },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'Avatar deleted successfully',
      userId: targetUser.id
    })

  } catch (error) {
    console.error('DELETE avatar error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}