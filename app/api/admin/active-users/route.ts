import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/active-users - Get active users statistics
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('X-User-ID')
    const userRole = request.headers.get('X-User-Role')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!['super_admin', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get current user's organization for filtering
    let organizationFilter = ''
    if (userRole === 'admin') {
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

      if (userProfile?.organization_id) {
        organizationFilter = `organization_id.eq.${userProfile.organization_id}`
      }
    }

    // Get active users count
    let activeUsersQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')

    if (organizationFilter) {
      activeUsersQuery = activeUsersQuery.eq('organization_id', organizationFilter.split('.')[1])
    }

    const { count: activeUsers, error: activeError } = await activeUsersQuery

    if (activeError) {
      console.error('Active users count error:', activeError)
      return NextResponse.json(
        { error: 'Failed to fetch active users count' },
        { status: 500 }
      )
    }

    // Get total users count
    let totalUsersQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    if (organizationFilter) {
      totalUsersQuery = totalUsersQuery.eq('organization_id', organizationFilter.split('.')[1])
    }

    const { count: totalUsers, error: totalError } = await totalUsersQuery

    if (totalError) {
      console.error('Total users count error:', totalError)
      return NextResponse.json(
        { error: 'Failed to fetch total users count' },
        { status: 500 }
      )
    }

    // Get users by role
    let roleStatsQuery = supabase
      .from('users')
      .select('role')
      .eq('status', 'active')

    if (organizationFilter) {
      roleStatsQuery = roleStatsQuery.eq('organization_id', organizationFilter.split('.')[1])
    }

    const { data: roleData, error: roleError } = await roleStatsQuery

    if (roleError) {
      console.error('Role stats error:', roleError)
      return NextResponse.json(
        { error: 'Failed to fetch role statistics' },
        { status: 500 }
      )
    }

    // Calculate role distribution
    const roleStats = (roleData || []).reduce((acc: Record<string, number>, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {})

    // Get recent logins (last 24 hours)
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    let recentLoginsQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('last_login_at', yesterday.toISOString())

    if (organizationFilter) {
      recentLoginsQuery = recentLoginsQuery.eq('organization_id', organizationFilter.split('.')[1])
    }

    const { count: recentLogins, error: recentError } = await recentLoginsQuery

    if (recentError) {
      console.error('Recent logins error:', recentError)
    }

    return NextResponse.json({
      activeUsers: activeUsers || 0,
      totalUsers: totalUsers || 0,
      recentLogins: recentLogins || 0,
      roleDistribution: roleStats,
      inactiveUsers: (totalUsers || 0) - (activeUsers || 0)
    })

  } catch (error) {
    console.error('Admin active users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}