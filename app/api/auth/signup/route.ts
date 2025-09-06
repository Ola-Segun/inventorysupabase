import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      name,
      storeName,
      storeType = 'retail_store',
      businessName,
      organizationName,
      organizationSlug,
      industry,
      country = 'US',
      role = 'super_admin'
    } = await request.json()

    // Validate required fields
    if (!email || !password || !name || !storeName) {
      return NextResponse.json(
        { error: 'Email, password, name, and store name are required' },
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

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      )
    }

    // Start transaction-like operation
    try {
      // First sign up the user with Supabase Auth
      const redirectUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/confirm-email`
      console.log('Signup attempt for email:', email)
      console.log('Redirect URL:', redirectUrl)

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: role
          },
          emailRedirectTo: redirectUrl
        }
      })

      if (authError) {
        console.error('Auth signup error:', authError)
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }

      console.log('Auth signup successful:', {
        user: authData.user?.email,
        userConfirmed: authData.user?.email_confirmed_at ? true : false,
        session: authData.session ? 'created' : 'none'
      })

      if (!authData.user) {
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      // Get default organization or create one if none exists
      let { data: orgData, error: orgQueryError } = await supabase
        .from('organizations')
        .select('id')
        .limit(1)
        .single()

      if (orgQueryError && orgQueryError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Organization query error:', orgQueryError)
        // Clean up the user if organization query fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: 'Failed to query organizations' },
          { status: 500 }
        )
      }

      if (!orgData) {
        // Create organization with provided details
        const { data: newOrg, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name: organizationName || businessName || 'Default Organization',
            slug: organizationSlug || 'default-org',
            subscription_tier: 'free',
            subscription_status: 'trialing'
          })
          .select('id')
          .single()

        if (orgError) {
          console.error('Organization creation error:', orgError)
          // Clean up the user if organization creation fails
          await supabase.auth.admin.deleteUser(authData.user.id)
          return NextResponse.json(
            { error: 'Failed to create organization' },
            { status: 500 }
          )
        }
        orgData = newOrg
      }

      // Create user profile first (required for store foreign key)
      console.log('Creating user profile with data:', {
        id: authData.user.id,
        organization_id: orgData.id,
        email: authData.user.email,
        name: name,
        role: role,
        is_store_owner: true
      })

      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          organization_id: orgData.id,
          email: authData.user.email!,
          name: name,
          role: role,
          is_store_owner: true
        })
        .select()

      console.log('User profile creation result:', {
        data: profileData,
        error: profileError
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Clean up the user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: `Failed to create user profile: ${profileError.message}`, details: profileError },
          { status: 500 }
        )
      }

      console.log('User profile created successfully:', profileData)

      // First, let's verify the user exists in public.users before creating the store
      console.log('Verifying user exists in public.users before store creation...')
      const { data: verifyUser, error: verifyError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('id', authData.user.id)
        .single()

      console.log('User verification result:', { data: verifyUser, error: verifyError })

      if (verifyError || !verifyUser) {
        console.error('User not found in public.users table:', verifyError)
        await supabase.auth.admin.deleteUser(authData.user.id)
        return NextResponse.json(
          { error: 'User profile not found after creation' },
          { status: 500 }
        )
      }

      console.log('User verified in public.users, proceeding with store creation...')

      // Try to create the store directly - if it fails due to foreign key, the constraint is still wrong
      console.log('Attempting store creation...')

      // Now create the store with the user's ID as owner (user exists in users table now)
      let { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name: storeName,
          store_type: storeType,
          status: 'pending_approval',
          owner_id: authData.user.id,
          organization_id: orgData.id,
          email: email,
          business_name: businessName || storeName,
          country: country,
          description: `Store for ${businessName || storeName}`,
          subscription_plan: 'free',
          subscription_status: 'trialing'
        })
        .select()
        .single()

      // If store creation fails due to foreign key constraint, try creating without owner_id first
      if (storeError && storeError.code === '23503' && storeError.message.includes('violates foreign key constraint')) {
        console.log('Foreign key constraint error detected, trying alternative approach...')

        // Create store without owner_id first
        const { data: tempStoreData, error: tempStoreError } = await supabase
          .from('stores')
          .insert({
            name: storeName,
            store_type: storeType,
            status: 'pending_approval',
            organization_id: orgData.id,
            email: email,
            business_name: businessName || storeName,
            country: country,
            description: `Store for ${businessName || storeName}`,
            subscription_plan: 'free',
            subscription_status: 'trialing'
          })
          .select()
          .single()

        if (tempStoreError) {
          console.error('Alternative store creation also failed:', tempStoreError)
          // Clean up on error
          await supabase.auth.admin.deleteUser(authData.user.id)
          await supabase.from('users').delete().eq('id', authData.user.id)
          return NextResponse.json(
            { error: `Failed to create store: ${tempStoreError.message}`, details: tempStoreError },
            { status: 500 }
          )
        }

        // Now update the user profile with store_id
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ store_id: tempStoreData.id })
          .eq('id', authData.user.id)

        if (updateUserError) {
          console.error('User profile update error:', updateUserError)
          // This is not critical, continue
        }

        storeData = tempStoreData
        console.log('Store created successfully using alternative approach!')
      } else if (storeError) {
        console.error('Store creation error:', storeError)
        console.error('Store creation details:', {
          storeName,
          storeType,
          owner_id: authData.user.id,
          organization_id: orgData.id,
          email
        })
        // Clean up on error
        await supabase.auth.admin.deleteUser(authData.user.id)
        await supabase.from('users').delete().eq('id', authData.user.id)
        return NextResponse.json(
          { error: `Failed to create store: ${storeError.message}`, details: storeError },
          { status: 500 }
        )
      } else {
        console.log('Store created successfully on first attempt!')
      }

      // Update user profile with store_id
      const { error: updateProfileError } = await supabase
        .from('users')
        .update({ store_id: storeData.id })
        .eq('id', authData.user.id)

      if (updateProfileError) {
        console.error('Profile update error:', updateProfileError)
        // Don't fail the entire process for this, just log it
      }

      // Return success response
      const response = NextResponse.json({
        message: 'Account created successfully. Please check your email to confirm your account.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name,
          role: role,
          store_id: storeData.id,
          is_store_owner: true
        },
        store: storeData,
        requiresEmailConfirmation: !authData.session
      })

      // Set session cookies if user is confirmed (shouldn't happen with email confirmation enabled)
      if (authData.session) {
        response.cookies.set('sb-access-token', authData.session.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })

        response.cookies.set('sb-refresh-token', authData.session.refresh_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30 // 30 days
        })
      }

      return response
    } catch (error) {
      console.error('Signup transaction error:', error)
      return NextResponse.json(
        { error: 'Failed to complete signup process' },
        { status: 500 }
      )
    }
  } catch (error) {
   console.error('Signup API error:', error)
   return NextResponse.json(
     { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
     { status: 500 }
   )
 }
}