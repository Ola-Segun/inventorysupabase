import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Helper function to check if user has admin permissions
async function checkAdminPermissions(supabase: any, userId: string) {
  const { data: userProfile, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !userProfile) return false

  // Allow super_admin or admin roles
  return ['super_admin', 'admin'].includes(userProfile.role)
}

// GET /api/admin/login-attempts - Get login attempts with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(supabase, currentUser.id)
    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get user profile to determine scope
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('role, store_id, organization_id')
      .eq('id', currentUser.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const success = searchParams.get('success') // 'true', 'false', or null
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const suspiciousOnly = searchParams.get('suspiciousOnly') === 'true'

    // Build query
    let query = supabase
      .from('user_login_attempts')
      .select(`
        id,
        user_id,
        email,
        ip_address,
        user_agent,
        success,
        failure_reason,
        attempted_at,
        users!user_login_attempts_user_id_fkey(
          id,
          name,
          email,
          role,
          status,
          store_id
        )
      `)
      .order('attempted_at', { ascending: false })

    // Apply filters
    if (userId) {
      query = query.eq('user_id', userId)
    }

    if (email) {
      query = query.ilike('email', `%${email}%`)
    }

    if (success === 'true') {
      query = query.eq('success', true)
    } else if (success === 'false') {
      query = query.eq('success', false)
    }

    if (startDate) {
      query = query.gte('attempted_at', startDate)
    }

    if (endDate) {
      query = query.lte('attempted_at', endDate)
    }

    // Filter by store if not super_admin
    if (userProfile.role !== 'super_admin' && userProfile.store_id) {
      // For store filtering, we'll need to do a separate query to get user IDs in the store
      const { data: storeUsers } = await supabase
        .from('users')
        .select('id')
        .eq('store_id', userProfile.store_id)

      if (storeUsers && storeUsers.length > 0) {
        const userIds = storeUsers.map(u => u.id)
        query = query.in('user_id', userIds)
      } else {
        // No users in store, return empty result
        return NextResponse.json({
          loginAttempts: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          suspiciousAnalysis: null
        })
      }
    }

    // Apply pagination
    const offset = (page - 1) * limit
    query = query.range(offset, offset + limit - 1)

    const { data: loginAttempts, error } = await query

    if (error) {
      console.error('Error fetching login attempts:', error)
      return NextResponse.json({ error: 'Failed to fetch login attempts' }, { status: 500 })
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('user_login_attempts')
      .select('id', { count: 'exact', head: true })

    // Apply same filters to count query
    if (userId) countQuery = countQuery.eq('user_id', userId)
    if (email) countQuery = countQuery.ilike('email', `%${email}%`)
    if (success === 'true') countQuery = countQuery.eq('success', true)
    else if (success === 'false') countQuery = countQuery.eq('success', false)
    if (startDate) countQuery = countQuery.gte('attempted_at', startDate)
    if (endDate) countQuery = countQuery.lte('attempted_at', endDate)

    if (userProfile.role !== 'super_admin' && userProfile.store_id) {
      // For store filtering in count, get user IDs first
      const { data: storeUsers } = await supabase
        .from('users')
        .select('id')
        .eq('store_id', userProfile.store_id)

      if (storeUsers && storeUsers.length > 0) {
        const userIds = storeUsers.map(u => u.id)
        countQuery = countQuery.in('user_id', userIds)
      } else {
        return NextResponse.json({
          loginAttempts: [],
          pagination: { page, limit, total: 0, totalPages: 0 },
          suspiciousAnalysis: null
        })
      }
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Error getting login attempts count:', countError)
    }

    // Analyze suspicious activity if requested
    let suspiciousAnalysis = null
    if (suspiciousOnly || searchParams.get('includeAnalysis') === 'true') {
      suspiciousAnalysis = await analyzeSuspiciousActivity(supabase, userProfile, startDate, endDate)
    }

    return NextResponse.json({
      loginAttempts: loginAttempts || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      suspiciousAnalysis
    })

  } catch (error) {
    console.error('GET login attempts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to analyze suspicious login activity
async function analyzeSuspiciousActivity(supabase: any, userProfile: any, startDate?: string | null, endDate?: string | null) {
  // Get recent login attempts
  let query = supabase
    .from('user_login_attempts')
    .select('user_id, email, ip_address, success, attempted_at')
    .order('attempted_at', { ascending: false })
    .limit(1000)

  if (startDate) query = query.gte('attempted_at', startDate)
  if (endDate) query = query.lte('attempted_at', endDate)

  if (userProfile.role !== 'super_admin' && userProfile.store_id) {
    query = query
      .select('user_id, email, ip_address, success, attempted_at, users!user_login_attempts_user_id_fkey(store_id)')
      .eq('users.store_id', userProfile.store_id)
  }

  const { data: attempts, error } = await query

  if (error || !attempts) {
    console.error('Error analyzing suspicious activity:', error)
    return null
  }

  // Analyze patterns
  const ipStats: { [key: string]: { success: number, failed: number, lastAttempt: string } } = {}
  const userStats: { [key: string]: { success: number, failed: number, lastAttempt: string } } = {}

  attempts.forEach((attempt: any) => {
    const ip = attempt.ip_address
    const userId = attempt.user_id || attempt.email

    // IP analysis
    if (!ipStats[ip]) {
      ipStats[ip] = { success: 0, failed: 0, lastAttempt: attempt.attempted_at }
    }

    if (attempt.success) {
      ipStats[ip].success++
    } else {
      ipStats[ip].failed++
    }

    // User analysis
    if (!userStats[userId]) {
      userStats[userId] = { success: 0, failed: 0, lastAttempt: attempt.attempted_at }
    }

    if (attempt.success) {
      userStats[userId].success++
    } else {
      userStats[userId].failed++
    }
  })

  // Identify suspicious IPs (high failure rate)
  const suspiciousIPs = Object.entries(ipStats)
    .filter(([, stats]) => stats.failed > 5 && stats.failed > stats.success * 2)
    .map(([ip, stats]) => ({
      ip,
      failedAttempts: stats.failed,
      successAttempts: stats.success,
      lastAttempt: stats.lastAttempt,
      riskLevel: stats.failed > 10 ? 'high' : 'medium'
    }))

  // Identify suspicious users (high failure rate)
  const suspiciousUsers = Object.entries(userStats)
    .filter(([, stats]) => stats.failed > 3 && stats.failed > stats.success)
    .map(([userId, stats]) => ({
      userId,
      failedAttempts: stats.failed,
      successAttempts: stats.success,
      lastAttempt: stats.lastAttempt,
      riskLevel: stats.failed > 5 ? 'high' : 'medium'
    }))

  return {
    suspiciousIPs,
    suspiciousUsers,
    totalAnalyzed: attempts.length,
    analysisPeriod: {
      start: startDate || 'last 1000 attempts',
      end: endDate || 'now'
    }
  }
}