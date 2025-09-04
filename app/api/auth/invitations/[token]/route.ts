import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/auth/invitations/[token] - Validate invitation token
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('store_invitations')
      .select(`
        *,
        store:stores(*),
        invited_by_user:users!store_invitations_invited_by_fkey(name, email)
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single()

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        store: invitation.store,
        invited_by: invitation.invited_by_user,
        expires_at: invitation.expires_at,
        user_exists: !!existingUser
      }
    })

  } catch (error) {
    console.error('Validate invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/auth/invitations/[token] - Accept invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const { password, name } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('store_invitations')
      .select(`
        *,
        store:stores(*),
        organization:organizations(*)
      `)
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .is('accepted_at', null)
      .single()

    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', invitation.email)
      .single()

    let userId: string

    if (existingUser) {
      // User exists, just add them to the store
      userId = existingUser.id

      // Update user profile with store and role
      const { error: updateError } = await supabase
        .from('users')
        .update({
          store_id: invitation.store_id,
          role: invitation.role,
          status: 'active'
        })
        .eq('id', userId)

      if (updateError) {
        console.error('User update error:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user profile' },
          { status: 500 }
        )
      }
    } else {
      // User doesn't exist, create new account
      if (!password || !name) {
        return NextResponse.json(
          { error: 'Password and name are required for new accounts' },
          { status: 400 }
        )
      }

      // Validate password
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        )
      }

      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password,
        options: {
          data: {
            name: name,
            role: invitation.role
          }
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      userId = authData.user.id

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          organization_id: invitation.store.organization_id,
          store_id: invitation.store_id,
          email: invitation.email,
          name: name,
          role: invitation.role,
          is_store_owner: false
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Clean up the auth user if profile creation fails
        await supabase.auth.admin.deleteUser(userId)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('store_invitations')
      .update({
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id)

    if (acceptError) {
      console.error('Invitation accept error:', acceptError)
      // Don't fail the whole process for this
    }

    // Log the invitation acceptance
    await supabase.rpc('log_audit_event', {
      p_action: 'invitation_accepted',
      p_table_name: 'store_invitations',
      p_record_id: invitation.id,
      p_old_values: null,
      p_new_values: { accepted_at: new Date().toISOString() }
    })

    return NextResponse.json({
      message: 'Invitation accepted successfully',
      user: {
        id: userId,
        email: invitation.email,
        name: existingUser ? null : name,
        role: invitation.role,
        store_id: invitation.store_id
      },
      requires_email_confirmation: !existingUser // Only for new users
    })

  } catch (error) {
    console.error('Accept invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}