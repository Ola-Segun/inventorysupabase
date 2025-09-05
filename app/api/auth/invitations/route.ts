import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomBytes } from 'crypto'
import { emailService } from '@/lib/email-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/auth/invitations - Create a new invitation
export async function POST(request: NextRequest) {
  try {
    const { email, role, storeId, organizationId } = await request.json()

    if (!email || !role || !storeId) {
      return NextResponse.json(
        { error: 'Email, role, and storeId are required' },
        { status: 400 }
      )
    }

    // Get current user
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user has permission to invite
    const { data: inviterProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id, organization_id')
      .eq('id', user.id)
      .single()

    if (profileError || !inviterProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Check permissions
    const canInvite = (
      inviterProfile.role === 'super_admin' ||
      inviterProfile.role === 'admin' ||
      (inviterProfile.role === 'manager' && inviterProfile.store_id === storeId)
    )

    if (!canInvite) {
      return NextResponse.json(
        { error: 'Insufficient permissions to send invitations' },
        { status: 403 }
      )
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

    // Check if invitation already exists and is still valid
    const { data: existingInvitation } = await supabase
      .from('user_invitations')
      .select('id, expires_at')
      .eq('email', email)
      .eq('store_id', storeId)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An active invitation already exists for this email' },
        { status: 409 }
      )
    }

    // Generate invitation token
    const invitationToken = randomBytes(32).toString('hex')

    // Get user's organization
    const { data: userOrg } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .insert({
        store_id: storeId,
        organization_id: userOrg?.organization_id,
        email,
        role,
        invited_by: user.id,
        invitation_token: invitationToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
        status: 'pending'
      })
      .select(`
        *,
        store:stores(name),
        invited_by_user:users!user_invitations_invited_by_fkey(name)
      `)
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
    const { data: inviterData } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single()

    const inviterName = inviterData?.name || user.email || 'Administrator'

    // Send invitation email
    const emailResult = await emailService.sendInvitationEmail({
      to: email,
      recipientName: email, // Use email as fallback since name might not be available
      inviterName: inviterName,
      invitationUrl,
      role,
      message: undefined, // Store invitations don't have custom messages
      expiresIn: '7 days'
    })

    const emailSent = Boolean(emailResult?.success)
    const emailMethod = emailResult?.method || null
    const emailError = emailResult?.error || null

    if (!emailSent) {
      console.error('Failed to send invitation email:', emailError)
      // Continue to return the invitation but surface that the email wasn't sent
    }

    return NextResponse.json({
      message: emailSent ? 'Invitation sent successfully' : 'Invitation created but failed to send email',
      email_sent: emailSent,
      email_method: emailMethod,
      ...(emailSent ? {} : { email_error: emailError }),
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        store: invitation.store,
        invited_by: invitation.invited_by_user,
        expires_at: invitation.expires_at,
        token: invitationToken // In production, don't return the token
      }
    })

  } catch (error) {
    console.error('Invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET /api/auth/invitations - Get invitations for current user's store
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Get user's store
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('store_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    let query = supabase
      .from('user_invitations')
      .select(`
        *,
        store:stores(name),
        invited_by_user:users!user_invitations_invited_by_fkey(name, email)
      `)
      .order('created_at', { ascending: false })

    // Filter by store if not super admin
    if (userProfile.role !== 'super_admin') {
      query = query.eq('store_id', userProfile.store_id)
    }

    const { data: invitations, error: invitationsError } = await query

    if (invitationsError) {
      console.error('Invitations fetch error:', invitationsError)
      return NextResponse.json(
        { error: 'Failed to fetch invitations' },
        { status: 500 }
      )
    }

    return NextResponse.json({ invitations })

  } catch (error) {
    console.error('Invitations API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}