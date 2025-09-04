import { NextRequest, NextResponse } from 'next/server'
import { checkAdminPermissions, createAdminSupabaseClient } from '@/lib/admin-permissions'

type ActivityLog = {
  id: string
  userId: string
  userName: string
  action: string
  timestamp: Date
  details: string
  table_name?: string
  record_id?: string
  ip_address?: string
  user_agent?: string
}

// GET /api/admin/activity-logs - Get activity logs for the current store/admin
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient()
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()

    if (authError || !currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const hasPermission = await checkAdminPermissions(supabase, currentUser.id)
    if (!hasPermission) {
      console.error('Permission denied for user:', currentUser.id)
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

    if (!userProfile) {
      console.error('No user profile found for user:', currentUser.id)
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const tableName = searchParams.get('tableName')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build query based on permissions
    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        created_at,
        store_id,
        organization_id,
        users!audit_logs_user_id_fkey (
          id,
          name,
          email
        )
      `)

    // Apply filters based on user permissions
    if (userProfile.role === 'super_admin') {
      // Super admin can see all logs
    } else if (userProfile.store_id) {
      // Regular admin can only see logs from their store
      query = query.eq('store_id', userProfile.store_id)
    } else {
      return NextResponse.json({ error: 'Unable to determine user scope' }, { status: 500 })
    }

    // Apply additional filters
    if (userId) {
      query = query.eq('user_id', userId)
    }
    if (action) {
      query = query.eq('action', action)
    }
    if (tableName) {
      query = query.eq('table_name', tableName)
    }
    if (startDate) {
      query = query.gte('created_at', startDate)
    }
    if (endDate) {
      query = query.lte('created_at', endDate)
    }

    // Apply pagination and ordering
    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const { data: auditLogs, error } = await query

    if (error) {
      console.error('Error fetching audit logs:', error)
      return NextResponse.json({ error: 'Failed to fetch activity logs' }, { status: 500 })
    }

    // Transform audit logs to match frontend interface
    const transformedLogs: ActivityLog[] = (auditLogs || []).map((log: any) => {
      const user = log.users
      const details = generateActivityDetails(log)

      return {
        id: log.id,
        userId: log.user_id,
        userName: user?.name || user?.email || 'Unknown User',
        action: formatAction(log.action),
        timestamp: new Date(log.created_at),
        details: details,
        table_name: log.table_name,
        record_id: log.record_id,
        ip_address: log.ip_address,
        user_agent: log.user_agent
      }
    })

    // Get total count for pagination
    let countQuery = supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })

    if (userProfile.role !== 'super_admin' && userProfile.store_id) {
      countQuery = countQuery.eq('store_id', userProfile.store_id)
    }

    if (userId) countQuery = countQuery.eq('user_id', userId)
    if (action) countQuery = countQuery.eq('action', action)
    if (tableName) countQuery = countQuery.eq('table_name', tableName)
    if (startDate) countQuery = countQuery.gte('created_at', startDate)
    if (endDate) countQuery = countQuery.lte('created_at', endDate)

    const { count } = await countQuery

    return NextResponse.json({
      logs: transformedLogs,
      total: count || 0,
      limit,
      offset
    })
  } catch (error) {
    console.error('GET activity logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to generate human-readable activity details
function generateActivityDetails(log: any): string {
  const { action, table_name, record_id, old_values, new_values } = log

  switch (action) {
    case 'user_created':
      return `Created new user account`

    case 'user_updated':
      if (new_values?.name || new_values?.email) {
        const changes = []
        if (new_values.name) changes.push('name')
        if (new_values.email) changes.push('email')
        if (new_values.role) changes.push('role')
        if (new_values.status) changes.push('status')
        return `Updated user ${changes.join(', ')}`
      }
      return `Updated user information`

    case 'user_deleted':
      return `Deleted user account`

    case 'user_invited':
      return `Sent user invitation`

    case '2fa_enabled':
      return `Enabled two-factor authentication`

    case '2fa_disabled':
      return `Disabled two-factor authentication`

    case 'session_terminated':
      return `Terminated user session`

    case 'login_success':
      return `Successful login`

    case 'login_failed':
      return `Failed login attempt`

    default:
      if (table_name && record_id) {
        return `${action.replace('_', ' ')} on ${table_name} (ID: ${record_id})`
      }
      return action.replace('_', ' ')
  }
}

// Helper function to format action names for display
function formatAction(action: string): string {
  const actionMap: { [key: string]: string } = {
    'user_created': 'User Created',
    'user_updated': 'User Updated',
    'user_deleted': 'User Deleted',
    'user_invited': 'User Invited',
    '2fa_enabled': '2FA Enabled',
    '2fa_disabled': '2FA Disabled',
    'session_terminated': 'Session Terminated',
    'login_success': 'Login',
    'login_failed': 'Failed Login',
    'product_created': 'Product Created',
    'product_updated': 'Product Updated',
    'product_deleted': 'Product Deleted',
    'order_created': 'Order Created',
    'order_updated': 'Order Updated',
    'order_deleted': 'Order Deleted',
    'store_created': 'Store Created',
    'store_updated': 'Store Updated'
  }

  return actionMap[action] || action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}