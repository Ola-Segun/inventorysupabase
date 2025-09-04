import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { shouldLockAccount, getLockoutTimeRemaining } from '@/lib/auth/passwordPolicy'

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
    const { data: profile, error: profileFetchError } = await supabase
      .from('users')
      .select(`
        *,
        store:stores(*)
      `)
      .eq('id', data.user.id)
      .single()

    if (profileFetchError) {
      console.error('Profile fetch error:', profileFetchError)
      return NextResponse.json(
        { error: 'Failed to load user profile' },
        { status: 500 }
      )
    }

    // Create response with session data
    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        name: profile.name,
        role: profile.role,
        store_id: profile.store_id,
        is_store_owner: profile.is_store_owner
      },
      store: profile.store,
      session: {
        access_token: data.session?.access_token,
        refresh_token: data.session?.refresh_token,
        expires_at: data.session?.expires_at
      }
    })

    // Set HTTP-only cookies for session management
    if (data.session) {
      response.cookies.set('sb-access-token', data.session.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      response.cookies.set('sb-refresh-token', data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      })
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