import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    try {
      console.log('Session API: incoming Cookie header:', request.headers.get('cookie'))
    } catch (hdrErr) {
      console.warn('Session API: failed to read Cookie header for debug', hdrErr)
    }

  // Use the request's cookie store (await) and pass a function returning it to the helper
  // This prevents the helper from calling cookies() synchronously which triggers Next.js runtime warnings.
  const cookieStore = await request.cookies

  // Debug: check for project-scoped supabase cookie name
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
      const cookieHeader = request.headers.get('cookie') || ''
      const projectCookiePresent = cookieHeader.includes(projectCookieName + '=')
      console.log('Session API: project-scoped cookie present?', projectCookiePresent, projectCookieName)
    }
  } catch (e) {
    console.warn('Session API: failed to check project-scoped cookie', e)
  }

  // Pass a function that returns the awaited cookie store; cast to any to satisfy the helper's expected shape.
  const supabase = createRouteHandlerClient({ cookies: () => (cookieStore as any) })

    const { data, error } = await supabase.auth.getSession()

    try {
      console.log('Session API: supabase.auth.getSession result:', !!data?.session, data?.session?.user?.id)
    } catch (logErr) {
      console.warn('Session API: failed to log session result', logErr)
    }

    if (error) {
      console.error('Session API error:', error)
      return NextResponse.json({ error: 'Failed to get session' }, { status: 500 })
    }

    return NextResponse.json({ session: data.session || null })
  } catch (err) {
    console.error('Session API unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
