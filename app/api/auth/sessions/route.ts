import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Helper function to get current user
async function getCurrentUser(supabase: any) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  return user
}

// Helper function to check admin permissions
async function checkAdminPermissions(supabase: any, userId: string) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !userProfile) return false
  return ['super_admin', 'admin'].includes(userProfile.role)
}

// GET /api/auth/sessions - Get user's active sessions
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = await checkAdminPermissions(supabase, currentUser.id)

    let query

    // Use secure function to get sessions
    const { data: sessions, error } = await supabase
      .rpc('get_active_sessions_secure', { user_uuid: currentUser.id })

    if (error) {
      console.error('Error fetching sessions:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    return NextResponse.json({ sessions: sessions || [] })
  } catch (error) {
    console.error('GET sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/auth/sessions - Create a new session (for current user)
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate session token
    const sessionToken = crypto.randomBytes(64).toString('hex')

    // Get device info from request
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // Parse user agent for device info
    const deviceInfo = {
      userAgent: userAgent,
      platform: userAgent.includes('Windows') ? 'Windows' :
                userAgent.includes('Mac') ? 'MacOS' :
                userAgent.includes('Linux') ? 'Linux' :
                userAgent.includes('Android') ? 'Android' :
                userAgent.includes('iPhone') ? 'iOS' : 'Unknown',
      browser: userAgent.includes('Chrome') ? 'Chrome' :
               userAgent.includes('Firefox') ? 'Firefox' :
               userAgent.includes('Safari') ? 'Safari' :
               userAgent.includes('Edge') ? 'Edge' : 'Unknown'
    }

    // Create session using RPC function
    const { data: sessionData, error: sessionError } = await supabase
      .rpc('create_user_session', {
        p_user_id: currentUser.id,
        p_session_token: sessionToken,
        p_device_info: deviceInfo,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
        p_expires_in_hours: 24
      })

    if (sessionError) {
      console.error('Error creating session:', sessionError)
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
    }

    // Log the login attempt
    await supabase.rpc('log_login_attempt', {
      p_user_id: currentUser.id,
      p_success: true,
      p_ip_address: ipAddress,
      p_user_agent: userAgent
    })

    return NextResponse.json({
      message: 'Session created successfully',
      sessionToken: sessionToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    })
  } catch (error) {
    console.error('POST sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/auth/sessions/[sessionId] - Terminate a specific session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const currentUser = await getCurrentUser(supabase)

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 })
    }

    const isAdmin = await checkAdminPermissions(supabase, currentUser.id)

    let deleteQuery

    if (isAdmin) {
      // Admins can delete any session
      deleteQuery = supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
    } else {
      // Regular users can only delete their own sessions
      deleteQuery = supabase
        .from('user_sessions')
        .delete()
        .eq('id', sessionId)
        .eq('user_id', currentUser.id)
    }

    const { error: deleteError } = await deleteQuery

    if (deleteError) {
      console.error('Error deleting session:', deleteError)
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 })
    }

    // Log the action
    await supabase
      .from('audit_logs')
      .insert({
        user_id: currentUser.id,
        action: 'session_terminated',
        table_name: 'user_sessions',
        record_id: sessionId,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown'
      })

    return NextResponse.json({ message: 'Session terminated successfully' })
  } catch (error) {
    console.error('DELETE sessions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}