import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { shouldLockAccount, getLockoutTimeRemaining } from '@/lib/auth/passwordPolicy'
import { csrfProtection } from '@/lib/auth/csrf'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function HEAD(request: NextRequest) {
  // Simple ping endpoint to keep session alive
  return NextResponse.json({ status: 'ok' }, { status: 200 })
}

export async function POST(request: NextRequest) {
  try {
    // Debug: log incoming cookie header and CSRF header to trace session persistence
    try {
      console.log('Login API: incoming Cookie header:', request.headers.get('cookie'))
      console.log('Login API: incoming x-csrf-token header:', request.headers.get('x-csrf-token'))
    } catch (logErr) {
      console.warn('Login API: failed to read headers for debug logging', logErr)
    }

    // Temporarily disable CSRF validation for debugging
    // const csrfCheck = csrfProtection.middleware(request)
    // if (csrfCheck) {
    //   return csrfCheck
    // }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Check if account is locked
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, status, login_attempts, locked_until')
      .eq('email', email)
      .single()

    if (userProfile) {
      // Check account status
      if (userProfile.status === 'suspended') {
        return NextResponse.json(
          { error: 'Account is suspended. Please contact support.' },
          { status: 403 }
        )
      }

      // Check if account is locked
      if (userProfile.locked_until) {
        const lockoutUntil = new Date(userProfile.locked_until)
        const now = new Date()

        if (now < lockoutUntil) {
          const { minutes, seconds } = getLockoutTimeRemaining(lockoutUntil)
          return NextResponse.json(
            {
              error: 'Account is temporarily locked due to too many failed login attempts.',
              lockoutUntil: lockoutUntil.toISOString(),
              timeRemaining: `${minutes}m ${seconds}s`
            },
            { status: 429 }
          )
        } else {
          // Lockout period has expired, reset attempts
          await supabase
            .from('users')
            .update({
              login_attempts: 0,
              locked_until: null
            })
            .eq('id', userProfile.id)
        }
      }
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // Handle failed login attempt
      if (userProfile) {
        const newAttempts = (userProfile.login_attempts || 0) + 1
        const lockoutCheck = shouldLockAccount(newAttempts, new Date())

        await supabase
          .from('users')
          .update({
            login_attempts: newAttempts,
            locked_until: lockoutCheck.shouldLock ? lockoutCheck.lockoutUntil?.toISOString() : null,
            last_login_at: new Date().toISOString()
          })
          .eq('id', userProfile.id)

        // Log failed login attempt
        await supabase.rpc('log_audit_event', {
          p_action: 'login_failed',
          p_table_name: 'users',
          p_record_id: userProfile.id,
          p_old_values: null,
          p_new_values: { attempts: newAttempts }
        })

        if (lockoutCheck.shouldLock) {
          return NextResponse.json(
            {
              error: 'Account locked due to too many failed attempts.',
              lockoutUntil: lockoutCheck.lockoutUntil?.toISOString(),
              attemptsRemaining: 0
            },
            { status: 429 }
          )
        }
      }

      // Handle specific error cases
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        return NextResponse.json(
          {
            error: 'Email not confirmed',
            message: 'Please check your email and click the confirmation link before logging in.',
            code: 'email_not_confirmed'
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: 'Invalid email or password',
          attemptsRemaining: userProfile ? Math.max(0, 5 - (userProfile.login_attempts || 0) - 1) : null
        },
        { status: 401 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      )
    }

    // Get user profile with store information
    let profile = null

    // Try to get existing profile first
    const { data: existingProfile, error: profileFetchError } = await supabase
      .from('users')
      .select(`
        *,
        store:stores(*)
      `)
      .eq('id', data.user.id)
      .single()

    if (profileFetchError) {
      console.log('Profile fetch error:', profileFetchError)

      // If user doesn't exist in users table, create a basic profile
      if (profileFetchError.code === 'PGRST116' || profileFetchError.message?.includes('No rows found')) {
        console.log('User not found in users table, creating basic profile')

        const { data: newProfile, error: createError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            role: 'seller',
            status: 'active',
            organization_id: null,
            store_id: null,
            is_store_owner: false,
            permissions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select(`
            *,
            store:stores(*)
          `)
          .single()

        if (createError) {
          console.error('Failed to create user profile:', createError)
          // Return a basic profile without store info if creation fails
          profile = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            role: 'seller',
            status: 'active',
            organization_id: null,
            store_id: null,
            is_store_owner: false,
            permissions: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            store: null
          }
          console.log('Using fallback profile due to creation error')
        } else {
          profile = newProfile
          console.log('Successfully created user profile:', profile.id)
        }
      } else {
        console.error('Unexpected profile fetch error:', profileFetchError)
        // Return a basic profile as fallback
        profile = {
          id: data.user.id,
          email: data.user.email || '',
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
          role: 'seller',
          status: 'active',
          organization_id: null,
          store_id: null,
          is_store_owner: false,
          permissions: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          store: null
        }
        console.log('Using fallback profile due to fetch error')
      }
    } else {
      profile = existingProfile
      console.log('Successfully fetched existing profile:', profile.id)
    }

    // Check if user's profile is active
    if (profile.status !== 'active') {
      return NextResponse.json(
        { error: 'Account is not active. Please contact support.' },
        { status: 403 }
      )
    }

    // Reset login attempts on successful login
    await supabase
      .from('users')
      .update({
        login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString()
      })
      .eq('id', data.user.id)

    // Create response with session data
    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role,
        store_id: profile.store_id,
        is_store_owner: profile.is_store_owner,
        status: profile.status
      },
      store: profile.store,
      session: data.session
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })

    // Let Supabase handle session cookies automatically
    if (data.session) {
      console.log('🔑 Login API: Session created successfully, Supabase will handle cookies')

      // Set the standard Supabase session cookies
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })

      // Set a session indicator cookie for client-side detection.
      // Store the Supabase session in the serialized format expected by
      // the auth storage adapter (an array: [access_token, refresh_token, provider_token, provider_refresh_token, user.factors])
      const serializedSession = JSON.stringify([
        data.session.access_token,
        data.session.refresh_token,
        data.session.provider_token ?? null,
        data.session.provider_refresh_token ?? null,
        (data.session.user && (data.session.user as any).factors) ?? null
      ])

      response.cookies.set('sb-auth-token', serializedSession, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      // Also set a simple auth-state cookie used by middleware and client-side checks
      // This is a non-httpOnly flag so client-side code can read it.
      response.cookies.set('sb-auth-state', 'authenticated', {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      // Also set project-scoped Supabase auth token cookie (matches supabase-js default storageKey)
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
        let projectRef = null
        try {
          const u = new URL(supabaseUrl)
          projectRef = u.hostname.split('.')[0]
        } catch (e) {
          // fallback to env var if URL parsing fails
          projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || null
        }

        if (projectRef) {
          const projectCookieName = `sb-${projectRef}-auth-token`
          // Use the same serialized session format for the project-scoped cookie
          response.cookies.set(projectCookieName, serializedSession, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
          })
          console.log('Login API: set project-scoped auth cookie:', projectCookieName)
        } else {
          console.log('Login API: could not derive projectRef for project-scoped cookie')
        }
      } catch (cookieErr) {
        console.warn('Login API: failed to set project-scoped auth cookie', cookieErr)
      }

      // Debug: log cookies we just set (values visible on server)
      try {
        console.log('Login API: set sb-access-token (httpOnly):', !!data.session.access_token)
        console.log('Login API: set sb-refresh-token (httpOnly):', !!data.session.refresh_token)
        console.log('Login API: set sb-auth-token (client-visible):', data.session.access_token?.slice(0, 8) + '...')
        console.log('Login API: set sb-auth-state:', 'authenticated')
      } catch (logErr) {
        console.warn('Login API: failed to log cookie values', logErr)
      }

      console.log('🔑 Login API: Supabase-compatible cookies set successfully')
    } else {
      console.log('🔑 Login API: No session data available')
    }

    return response
  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}