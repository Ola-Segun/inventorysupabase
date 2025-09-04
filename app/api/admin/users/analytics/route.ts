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

// GET /api/admin/users/analytics - Get user activity analytics and reports
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
    const reportType = searchParams.get('type') || 'overview' // overview, login_patterns, activity_summary
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const userId = searchParams.get('userId')

    // Set default date range (last 30 days)
    const end = endDate ? new Date(endDate) : new Date()
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    let analytics = {}

    switch (reportType) {
      case 'overview':
        analytics = await getOverviewAnalytics(supabase, userProfile, start, end)
        break
      case 'login_patterns':
        analytics = await getLoginPatternsAnalytics(supabase, userProfile, start, end, userId)
        break
      case 'activity_summary':
        analytics = await getActivitySummaryAnalytics(supabase, userProfile, start, end)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    return NextResponse.json({
      reportType,
      dateRange: { start: start.toISOString(), end: end.toISOString() },
      ...analytics
    })

  } catch (error) {
    console.error('GET users analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get overview analytics
async function getOverviewAnalytics(supabase: any, userProfile: any, start: Date, end: Date) {
  // Build base query for users
  let usersQuery = supabase
    .from('users')
    .select('id, name, email, role, status, created_at, last_login_at')

  if (userProfile.role !== 'super_admin' && userProfile.store_id) {
    usersQuery = usersQuery.eq('store_id', userProfile.store_id)
  }

  const { data: users, error: usersError } = await usersQuery

  if (usersError) {
    console.error('Error fetching users for analytics:', usersError)
    throw usersError
  }

  // Get login attempts in date range
  let loginAttemptsQuery = supabase
    .from('user_login_attempts')
    .select('user_id, success, attempted_at')
    .gte('attempted_at', start.toISOString())
    .lte('attempted_at', end.toISOString())

  if (userProfile.role !== 'super_admin' && userProfile.store_id) {
    // Join with users to filter by store
    loginAttemptsQuery = loginAttemptsQuery
      .select('user_id, success, attempted_at, users!user_login_attempts_user_id_fkey(store_id)')
      .eq('users.store_id', userProfile.store_id)
  }

  const { data: loginAttempts, error: loginError } = await loginAttemptsQuery

  if (loginError) {
    console.error('Error fetching login attempts:', loginError)
  }

  // Get audit logs in date range
  let auditLogsQuery = supabase
    .from('audit_logs')
    .select('user_id, action, created_at')
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())

  if (userProfile.role !== 'super_admin' && userProfile.store_id) {
    auditLogsQuery = auditLogsQuery.eq('store_id', userProfile.store_id)
  }

  const { data: auditLogs, error: auditError } = await auditLogsQuery

  if (auditError) {
    console.error('Error fetching audit logs:', auditError)
  }

  // Calculate metrics
  const totalUsers = users?.length || 0
  const activeUsers = users?.filter((u: any) => u.status === 'active').length || 0
  const inactiveUsers = users?.filter((u: any) => u.status === 'inactive').length || 0
  const suspendedUsers = users?.filter((u: any) => u.status === 'suspended').length || 0

  const successfulLogins = loginAttempts?.filter((la: any) => la.success).length || 0
  const failedLogins = loginAttempts?.filter((la: any) => !la.success).length || 0

  const totalActivities = auditLogs?.length || 0

  // Group activities by user
  const userActivityMap = new Map()
  auditLogs?.forEach((log: any) => {
    const userId = log.user_id
    if (!userActivityMap.has(userId)) {
      userActivityMap.set(userId, 0)
    }
    userActivityMap.set(userId, userActivityMap.get(userId) + 1)
  })

  // Get most active users
  const mostActiveUsers = Array.from(userActivityMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([userId, count]) => {
      const user = users?.find((u: any) => u.id === userId)
      return {
        userId,
        name: user?.name || user?.email || 'Unknown',
        activityCount: count
      }
    })

  // Group logins by day
  const loginTrends: { [key: string]: { successful: number, failed: number } } = {}
  loginAttempts?.forEach((attempt: any) => {
    const date = new Date(attempt.attempted_at).toISOString().split('T')[0]
    if (!loginTrends[date]) {
      loginTrends[date] = { successful: 0, failed: 0 }
    }
    if (attempt.success) {
      loginTrends[date].successful++
    } else {
      loginTrends[date].failed++
    }
  })

  return {
    userStats: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      suspended: suspendedUsers
    },
    loginStats: {
      successful: successfulLogins,
      failed: failedLogins,
      total: (loginAttempts?.length || 0)
    },
    activityStats: {
      total: totalActivities,
      mostActiveUsers
    },
    trends: {
      loginTrends
    }
  }
}

// Helper function to get login patterns analytics
async function getLoginPatternsAnalytics(supabase: any, userProfile: any, start: Date, end: Date, userId?: string | null) {
  let query = supabase
    .from('user_login_attempts')
    .select(`
      user_id,
      email,
      success,
      failure_reason,
      ip_address,
      user_agent,
      attempted_at,
      users!user_login_attempts_user_id_fkey(name, email, role)
    `)
    .gte('attempted_at', start.toISOString())
    .lte('attempted_at', end.toISOString())
    .order('attempted_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  } else if (userProfile.role !== 'super_admin' && userProfile.store_id) {
    // Filter by store if not super admin
    query = query
      .select(`
        user_id,
        email,
        success,
        failure_reason,
        ip_address,
        user_agent,
        attempted_at,
        users!user_login_attempts_user_id_fkey(name, email, role, store_id)
      `)
      .eq('users.store_id', userProfile.store_id)
  }

  const { data: loginAttempts, error } = await query

  if (error) {
    console.error('Error fetching login patterns:', error)
    throw error
  }

  // Analyze patterns
  const patterns = {
    byHour: Array(24).fill(0),
    byDay: Array(7).fill(0),
    byDevice: {} as { [key: string]: number },
    byBrowser: {} as { [key: string]: number },
    failedReasons: {} as { [key: string]: number },
    suspiciousIPs: [] as string[]
  }

  loginAttempts?.forEach((attempt: any) => {
    const date = new Date(attempt.attempted_at)

    // By hour
    patterns.byHour[date.getHours()]++

    // By day (0 = Sunday, 6 = Saturday)
    patterns.byDay[date.getDay()]++

    // By device type
    const userAgent = attempt.user_agent || ''
    let deviceType = 'Unknown'
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      deviceType = 'Mobile'
    } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      deviceType = 'Tablet'
    } else {
      deviceType = 'Desktop'
    }
    patterns.byDevice[deviceType] = (patterns.byDevice[deviceType] || 0) + 1

    // By browser
    let browser = 'Unknown'
    if (userAgent.includes('Chrome')) browser = 'Chrome'
    else if (userAgent.includes('Firefox')) browser = 'Firefox'
    else if (userAgent.includes('Safari')) browser = 'Safari'
    else if (userAgent.includes('Edge')) browser = 'Edge'
    patterns.byBrowser[browser] = (patterns.byBrowser[browser] || 0) + 1

    // Failed reasons
    if (!attempt.success && attempt.failure_reason) {
      patterns.failedReasons[attempt.failure_reason] = (patterns.failedReasons[attempt.failure_reason] || 0) + 1
    }
  })

  // Detect suspicious IPs (multiple failed attempts from same IP)
  const ipAttempts = {} as { [key: string]: { success: number, failed: number } }
  loginAttempts?.forEach((attempt: any) => {
    const ip = attempt.ip_address
    if (!ipAttempts[ip]) {
      ipAttempts[ip] = { success: 0, failed: 0 }
    }
    if (attempt.success) {
      ipAttempts[ip].success++
    } else {
      ipAttempts[ip].failed++
    }
  })

  patterns.suspiciousIPs = Object.entries(ipAttempts)
    .filter(([, counts]) => counts.failed > counts.success * 2 && counts.failed > 5)
    .map(([ip]) => ip)

  return {
    loginAttempts: loginAttempts || [],
    patterns,
    summary: {
      totalAttempts: loginAttempts?.length || 0,
      successfulAttempts: loginAttempts?.filter((a: any) => a.success).length || 0,
      failedAttempts: loginAttempts?.filter((a: any) => !a.success).length || 0
    }
  }
}

// Helper function to get activity summary analytics
async function getActivitySummaryAnalytics(supabase: any, userProfile: any, start: Date, end: Date) {
  let query = supabase
    .from('audit_logs')
    .select(`
      id,
      user_id,
      action,
      table_name,
      record_id,
      created_at,
      users!audit_logs_user_id_fkey(name, email, role)
    `)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .order('created_at', { ascending: false })

  if (userProfile.role !== 'super_admin' && userProfile.store_id) {
    query = query.eq('store_id', userProfile.store_id)
  }

  const { data: activities, error } = await query

  if (error) {
    console.error('Error fetching activity summary:', error)
    throw error
  }

  // Group activities by type
  const activityTypes = {} as { [key: string]: number }
  const tableActivity = {} as { [key: string]: number }
  const userActivity = {} as { [key: string]: { name: string, count: number } }

  activities?.forEach((activity: any) => {
    // Count by action type
    activityTypes[activity.action] = (activityTypes[activity.action] || 0) + 1

    // Count by table
    if (activity.table_name) {
      tableActivity[activity.table_name] = (tableActivity[activity.table_name] || 0) + 1
    }

    // Count by user
    const userId = activity.user_id
    const userName = activity.users?.name || activity.users?.email || 'Unknown'
    if (!userActivity[userId]) {
      userActivity[userId] = { name: userName, count: 0 }
    }
    userActivity[userId].count++
  })

  // Group activities by hour/day
  const activityTrends = {
    byHour: Array(24).fill(0),
    byDay: Array(7).fill(0)
  }

  activities?.forEach((activity: any) => {
    const date = new Date(activity.created_at)
    activityTrends.byHour[date.getHours()]++
    activityTrends.byDay[date.getDay()]++
  })

  return {
    activities: activities || [],
    summary: {
      totalActivities: activities?.length || 0,
      uniqueUsers: Object.keys(userActivity).length,
      activityTypes,
      tableActivity,
      userActivity: Object.values(userActivity).sort((a, b) => b.count - a.count)
    },
    trends: activityTrends
  }
}