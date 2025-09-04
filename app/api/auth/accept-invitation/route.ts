import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST /api/auth/accept-invitation - Accept user invitation and create account
export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Invitation token and password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token' },
        { status: 400 }
      )
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)

    if (now > expiresAt) {
      // Mark invitation as expired
      await supabase
        .from('user_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Account already exists for this email' },
        { status: 409 }
      )
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: invitation.email,
      password: password,
      email_confirm: true, // Auto-confirm email for invited users
      user_metadata: {
        name: invitation.name,
        role: invitation.role
      }
    })

    if (authError || !authData.user) {
      console.error('Auth user creation error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      )
    }

    // Create user profile
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        store_id: invitation.store_id,
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        status: 'active',
        is_store_owner: false
      })
      .select()
      .single()

    if (userError) {
      console.error('User profile creation error:', userError)
      // Clean up the auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      )
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: authData.user.id
      })
      .eq('id', invitation.id)

    if (updateError) {
      console.error('Invitation update error:', updateError)
      // Don't fail the request if this update fails
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: authData.user.id,
        action: 'invitation_accepted',
        resource_type: 'invitation',
        resource_id: invitation.id,
        details: { email: invitation.email, role: invitation.role },
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({
      message: 'Account created successfully',
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        store_id: userData.store_id
      }
    })
  } catch (error) {
    console.error('POST accept-invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/auth/accept-invitation?token=xxx - Validate invitation token
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
        { status: 400 }
      )
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .select('id, email, name, role, expires_at, status, message')
      .eq('invitation_token', token)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }

    // Check status
    if (invitation.status !== 'pending') {
      return NextResponse.json(
        { error: `Invitation is ${invitation.status}` },
        { status: 400 }
      )
    }

    // Check if invitation has expired
    const now = new Date()
    const expiresAt = new Date(invitation.expires_at)

    if (now > expiresAt) {
      // Mark invitation as expired
      await supabase
        .from('user_invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id)

      return NextResponse.json(
        { error: 'Invitation has expired' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      valid: true,
      invitation: {
        email: invitation.email,
        name: invitation.name,
        role: invitation.role,
        message: invitation.message,
        expires_at: invitation.expires_at
      }
    })
  } catch (error) {
    console.error('GET accept-invitation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}