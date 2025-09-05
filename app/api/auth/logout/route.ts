import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    // Get the session from cookies
    const cookieStore = await request.cookies
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    // Sign out from Supabase if we have a valid session
    if (accessToken) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Supabase sign out error:', error)
        // Continue with cookie cleanup even if Supabase sign out fails
      }
    }

    // Create response
    const response = NextResponse.json({
      message: 'Logged out successfully'
    })

    // Clear authentication cookies
    response.cookies.set('sb-access-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    response.cookies.set('sb-refresh-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    // Clear client-visible auth cookies too
    response.cookies.set('sb-auth-token', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    response.cookies.set('sb-auth-state', '', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0
    })

    // Also clear project-scoped Supabase auth cookie if it exists
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      let projectRef = null
      try {
        const u = new URL(supabaseUrl)
        projectRef = u.hostname.split('.')[0]
      } catch (e) {
        projectRef = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_REF || null
      }

      if (projectRef) {
        const projectCookieName = `sb-${projectRef}-auth-token`
        response.cookies.set(projectCookieName, '', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 0
        })
        console.log('Logout API: cleared project-scoped cookie:', projectCookieName)
      }
    } catch (e) {
      console.warn('Logout API: failed to clear project-scoped cookie', e)
    }

    return response
  } catch (error) {
    console.error('Logout API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}