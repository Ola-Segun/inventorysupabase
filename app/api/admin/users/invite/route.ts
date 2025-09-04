import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { emailService } from '@/lib/email-service'
import { checkAdminPermissions, createAdminSupabaseClient } from '@/lib/admin-permissions'
import crypto from 'crypto'

type UserRole = 'super_admin' | 'admin' | 'manager' | 'cashier' | 'seller'

// POST /api/admin/users/invite - Send user invitation
export async function POST(request: NextRequest) {
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

    const { email, role, name, message } = await request.json()

    // Validate required fields
    if (!email || !role || !name) {
      return NextResponse.json(
        { error: 'Email, role, and name are required' },
        { status: 400 }
      )
    }

    // Validate role
    const validRoles: UserRole[] = ['admin', 'manager', 'cashier', 'seller']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    // Get current user's store
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('store_id, organization_id, role')
      .eq('id', currentUser.id)
      .single()

    if (profileError || !userProfile?.store_id) {
      return NextResponse.json({ error: 'Failed to get store information' }, { status: 500 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .eq('status', 'pending')
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'Invitation already sent to this email' },
        { status: 409 }
      )
    }

    // Generate invitation token
    const invitationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    // Create invitation record
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        email: email,
        role: role,
        name: name,
        invited_by: currentUser.id,
        invitation_token: invitationToken,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        message: message || null
      })
      .select()
      .single()

    if (invitationError) {
      console.error('Invitation creation error:', invitationError)
      return NextResponse.json(
        { error: 'Failed to create invitation' },
        { status: 500 }
      )
    }

    // Send invitation email
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/accept-invitation?token=${invitationToken}`

    // Get inviter's name
    const { data: inviterProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', currentUser.id)
      .single()

    const inviterName = inviterProfile?.name || currentUser.email || 'Administrator'

    // Send invitation email
    const emailResult = await emailService.sendInvitationEmail({
      to: email,
      recipientName: name,
      inviterName: inviterName,
      invitationUrl,
      role,
      message,
      expiresIn: '7 days'
    })

    if (!emailResult.success) {
      console.error('Failed to send invitation email:', emailResult.error)
      // Don't fail the invitation creation if email fails
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: userProfile.organization_id,
        store_id: userProfile.store_id,
        user_id: currentUser.id,
        action: 'user_invited',
        table_name: 'user_invitations',
        record_id: invitation.id,
        new_values: { email, role, name },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'Invitation sent successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        name: invitation.name,
        expires_at: invitation.expires_at
      }
    })
  } catch (error) {
    console.error('POST invite error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}