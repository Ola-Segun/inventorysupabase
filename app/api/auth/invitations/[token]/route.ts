import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/auth/invitations/[token] - Validate invitation token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .select(`
        *,
        store:stores(*),
        invited_by_user:users!user_invitations_invited_by_fkey(name, email)
      `)
      .eq('invitation_token', token)
      .gt('expires_at', new Date().toISOString())
      .eq('status', 'pending')
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
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { password, name } = await request.json()

    console.log('🔑 INVITATION ACCEPTANCE: POST request received for token:', token?.substring(0, 10) + '...')
    console.log('🔑 INVITATION ACCEPTANCE: Request body:', { hasPassword: !!password, hasName: !!name })
    console.log('🔑 INVITATION ACCEPTANCE: Full request details:', {
      token: token?.substring(0, 10) + '...',
      password: password ? '[REDACTED]' : null,
      name: name || 'not provided'
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('user_invitations')
      .select(`
        *,
        store:stores(*),
        organization:organizations(*)
      `)
      .eq('invitation_token', token)
      .gt('expires_at', new Date().toISOString())
      .eq('status', 'pending')
      .single()

    if (invitationError || !invitation) {
      console.log('❌ INVITATION ACCEPTANCE: Invitation lookup failed:', {
        error: invitationError?.message,
        hasInvitation: !!invitation,
        token: token?.substring(0, 10) + '...'
      })
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 404 }
      )
    }

    console.log('✅ INVITATION ACCEPTANCE: Invitation found:', {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      hasInitialPassword: !!invitation.initial_password,
      initialPasswordLength: invitation.initial_password?.length || 0,
      status: invitation.status,
      expiresAt: invitation.expires_at
    })

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
      // User doesn't exist, create new account using initial password from invitation
      const initialPassword = invitation.initial_password

      console.log('🔑 INVITATION ACCEPTANCE: Creating new user account')
      console.log('🔑 INVITATION ACCEPTANCE: Initial password found:', !!initialPassword)
      console.log('🔑 INVITATION ACCEPTANCE: Password length:', initialPassword?.length)
      console.log('🔑 INVITATION ACCEPTANCE: Password preview:', initialPassword ? initialPassword.substring(0, 3) + '...' : 'null')

      if (!initialPassword) {
        console.error('❌ INVITATION ACCEPTANCE: Initial password not found in invitation')
        return NextResponse.json(
          { error: 'Initial password not found in invitation' },
          { status: 500 }
        )
      }

      // Use the name from the request or invitation
      const userName = name || invitation.name || invitation.email.split('@')[0]

      // Create user account with initial password
      console.log('🔑 INVITATION ACCEPTANCE: Creating Supabase auth user')
      console.log('🔑 INVITATION ACCEPTANCE: Email:', invitation.email)
      console.log('🔑 INVITATION ACCEPTANCE: Password length:', initialPassword.length)

      console.log('🔑 INVITATION ACCEPTANCE: Creating Supabase auth user')
      console.log('🔑 INVITATION ACCEPTANCE: Email:', invitation.email)
      console.log('🔑 INVITATION ACCEPTANCE: Password length:', initialPassword.length)
      console.log('🔑 INVITATION ACCEPTANCE: User name:', userName)

      console.log('🔑 INVITATION ACCEPTANCE: About to create user with admin API')
      console.log('🔑 INVITATION ACCEPTANCE: User email:', invitation.email)
      console.log('🔑 INVITATION ACCEPTANCE: Password length:', initialPassword.length)
      console.log('🔑 INVITATION ACCEPTANCE: Password preview:', initialPassword.substring(0, 3) + '...')
      console.log('🔑 INVITATION ACCEPTANCE: User metadata:', { name: userName, role: invitation.role })

      // Use admin API to create user directly (bypasses email confirmation)
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: invitation.email,
        password: initialPassword,
        email_confirm: true, // Auto-confirm email since we're providing credentials
        user_metadata: {
          name: userName,
          role: invitation.role
        }
      })

      console.log('🔑 INVITATION ACCEPTANCE: Admin createUser result:', {
        hasData: !!authData,
        hasUser: !!authData?.user,
        userId: authData?.user?.id,
        email: authData?.user?.email,
        emailConfirmed: authData?.user?.email_confirmed_at ? true : false,
        authError: authError ? {
          message: authError.message,
          status: authError.status
        } : null
      })

      if (authError) {
        console.error('❌ INVITATION ACCEPTANCE: Admin createUser failed:', {
          message: authError.message,
          status: authError.status,
          email: invitation.email
        })
      } else {
        console.log('✅ INVITATION ACCEPTANCE: User created successfully:', {
          userId: authData?.user?.id,
          email: invitation.email,
          emailConfirmed: authData?.user?.email_confirmed_at ? true : false
        })
      }

      if (authError) {
        console.error('❌ INVITATION ACCEPTANCE: Admin createUser error:', {
          message: authError.message,
          status: authError.status,
          email: invitation.email
        })
        return NextResponse.json(
          { error: `Failed to create user account: ${authError.message}` },
          { status: 500 }
        )
      }

      if (!authData.user) {
        console.error('❌ INVITATION ACCEPTANCE: No user returned from admin createUser')
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      userId = authData.user.id
      console.log('✅ INVITATION ACCEPTANCE: Supabase auth user created successfully:', {
        userId: userId,
        email: invitation.email,
        emailConfirmed: authData.user.email_confirmed_at ? true : false,
        createdAt: authData.user.created_at
      })

      // Create user profile
      console.log('🔑 INVITATION ACCEPTANCE: Creating user profile in database')
      console.log('🔑 INVITATION ACCEPTANCE: Profile data:', {
        userId: userId,
        organizationId: invitation.organization_id,
        storeId: invitation.store_id,
        email: invitation.email,
        name: userName,
        role: invitation.role
      })

      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: userId,
          organization_id: invitation.organization_id,
          store_id: invitation.store_id,
          email: invitation.email,
          name: userName,
          role: invitation.role,
          is_store_owner: false
        })

      if (profileError) {
        console.error('❌ INVITATION ACCEPTANCE: Profile creation error:', {
          error: profileError.message,
          code: profileError.code,
          details: profileError.details
        })
        // Clean up the auth user if profile creation fails
        console.log('🧹 INVITATION ACCEPTANCE: Cleaning up auth user due to profile creation failure')
        await supabase.auth.admin.deleteUser(userId)
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        )
      }

      console.log('✅ INVITATION ACCEPTANCE: User profile created successfully')
    }

    // Mark invitation as accepted
    const { error: acceptError } = await supabase
      .from('user_invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString(),
        accepted_by: userId
      })
      .eq('id', invitation.id)

    if (acceptError) {
      console.error('Invitation accept error:', acceptError)
      // Don't fail the whole process for this
    }

    // Log the invitation acceptance
    await supabase
      .from('audit_logs')
      .insert({
        organization_id: invitation.organization_id,
        store_id: invitation.store_id,
        user_id: userId,
        action: 'invitation_accepted',
        table_name: 'user_invitations',
        record_id: invitation.id,
        new_values: { status: 'accepted', accepted_at: new Date().toISOString() }
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
      requires_email_confirmation: false // Email is auto-confirmed via admin API
    })

  } catch (error) {
    console.error('Accept invitation API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}