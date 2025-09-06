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

    // Check if there's an active invitation that would prevent sending a new one
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id, status, expires_at')
      .eq('email', email)
      .in('status', ['pending', 'accepted'])
      .single()

    if (existingInvitation) {
      if (existingInvitation.status === 'accepted') {
        return NextResponse.json(
          { error: 'User has already accepted an invitation' },
          { status: 409 }
        )
      } else if (existingInvitation.status === 'pending') {
        // Check if the pending invitation has expired
        const expiresAt = new Date(existingInvitation.expires_at)
        const now = new Date()

        if (expiresAt > now) {
          return NextResponse.json(
            { error: 'An active invitation already exists for this email' },
            { status: 409 }
          )
        } else {
          // Expired pending invitation - we can resend
          console.log('Found expired pending invitation, allowing resend')
        }
      }
    }

    // Auto-expire old pending invitations for this email
    await supabase.rpc('expire_old_invitations')

    // Check for expired or cancelled invitations that we can clean up
    const { data: expiredInvitations } = await supabase
      .from('user_invitations')
      .select('id')
      .eq('email', email)
      .in('status', ['expired', 'cancelled'])

    // Clean up old expired/cancelled invitations (older than 30 days)
    if (expiredInvitations && expiredInvitations.length > 0) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      await supabase
        .from('user_invitations')
        .delete()
        .eq('email', email)
        .in('status', ['expired', 'cancelled'])
        .lt('created_at', thirtyDaysAgo.toISOString())

      console.log(`Cleaned up ${expiredInvitations.length} old invitations for ${email}`)
    }

    // Generate invitation token and initial password
    const invitationToken = crypto.randomBytes(32).toString('hex')
    const initialPassword = crypto.randomBytes(8).toString('hex') // Generate secure 16-character password
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days expiry

    console.log('🔑 INVITATION CREATION: Generated credentials')
    console.log('🔑 INVITATION CREATION: Token preview:', invitationToken.substring(0, 10) + '...')
    console.log('🔑 INVITATION CREATION: Initial password length:', initialPassword.length)
    console.log('🔑 INVITATION CREATION: Expires at:', expiresAt.toISOString())

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
        message: message || null,
        store_id: userProfile.store_id,
        organization_id: userProfile.organization_id,
        initial_password: initialPassword // Store the initial password
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

    console.log('📧 INVITATION API: Preparing to send invitation email')
    console.log('📧 INVITATION API: Email details:', {
      to: email,
      recipientName: name,
      inviterName: inviterName,
      role: role,
      message: message ? '✓ Included' : '✗ None',
      invitationUrl: invitationUrl.substring(0, 50) + '...'
    })

    // Send invitation email
    const emailResult = await emailService.sendInvitationEmail({
      to: email,
      recipientName: name,
      inviterName: inviterName,
      invitationUrl,
      role,
      message,
      expiresIn: '7 days',
      initialPassword,
      email
    })

    console.log('📧 INVITATION API: Email service response:', {
      success: emailResult.success,
      method: emailResult.method,
      error: emailResult.error,
      messageId: emailResult.messageId
    })

    const emailSent = Boolean(emailResult?.success)
    const emailMethod = emailResult?.method || null
    const emailError = emailResult?.error || null

    if (!emailSent) {
      console.error('❌ INVITATION API: Failed to send invitation email:', {
        email: email,
        error: emailError,
        method: emailMethod,
        provider: process.env.EMAIL_PROVIDER
      })
      // Continue to return the invitation but surface that the email wasn't sent
    } else {
      console.log('✅ INVITATION API: Email sent successfully:', {
        email: email,
        method: emailMethod,
        invitationId: invitation.id
      })
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
      message: emailSent ? 'Invitation sent successfully' : 'Invitation created but failed to send email',
      email_sent: emailSent,
      email_method: emailMethod,
      ...(emailSent ? {} : { email_error: emailError }),
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