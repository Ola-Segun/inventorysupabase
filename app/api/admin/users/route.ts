import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET /api/admin/users - Get all users for admin management
export async function GET(request: NextRequest) {
  try {
    // Get current user from headers (set by middleware)
    const userId = request.headers.get('X-User-ID')
    const userRole = request.headers.get('X-User-Role')

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has admin permissions
    if (!['super_admin', 'admin'].includes(userRole)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const status = searchParams.get('status') || ''

    const offset = (page - 1) * limit

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        email,
        name,
        role,
        status,
        avatar_url,
        last_login_at,
        is_store_owner,
        created_at,
        updated_at,
        store:stores(id, name),
        organization:organizations(id, name)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Apply filters
    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    if (status) {
      query = query.eq('status', status)
    }

    // For non-super admins, only show users from their organization
    if (userRole === 'admin') {
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

      if (userProfile?.organization_id) {
        query = query.eq('organization_id', userProfile.organization_id)
      }
    }

    const { data: users, error: usersError } = await query

    if (usersError) {
      console.error('Users fetch error:', usersError)
      return NextResponse.json(
        { error: 'Failed to fetch users' },
        { status: 500 }
      )
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('users')
      .select('id', { count: 'exact', head: true })

    if (search) {
      countQuery = countQuery.or(`email.ilike.%${search}%,name.ilike.%${search}%`)
    }

    if (role) {
      countQuery = countQuery.eq('role', role)
    }

    if (status) {
      countQuery = countQuery.eq('status', status)
    }

    if (userRole === 'admin') {
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

      if (userProfile?.organization_id) {
        countQuery = countQuery.eq('organization_id', userProfile.organization_id)
      }
    }

    const { count, error: countError } = await countQuery

    if (countError) {
      console.error('Count error:', countError)
    }

    return NextResponse.json({
      users: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Admin users API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/admin/users - Create a new user (admin only)
export async function POST(request: NextRequest) {
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

    const { email, name, role, storeId, organizationId } = await request.json()

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
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

    // Get current user's organization if not super admin
    let targetOrganizationId = organizationId
    if (userRole === 'admin' && !targetOrganizationId) {
      const { data: userProfile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', userId)
        .single()

      targetOrganizationId = userProfile?.organization_id
    }

    // Create user profile
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        name,
        role,
        store_id: storeId,
        organization_id: targetOrganizationId,
        status: 'active'
      })
      .select(`
        id,
        email,
        name,
        role,
        status,
        created_at,
        store:stores(id, name),
        organization:organizations(id, name)
      `)
      .single()

    if (userError) {
      console.error('User creation error:', userError)
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Log the action
    await supabase.rpc('log_audit_event', {
      p_action: 'user_created',
      p_table_name: 'users',
      p_record_id: newUser.id,
      p_old_values: null,
      p_new_values: { email, name, role }
    })

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    })

  } catch (error) {
    console.error('Admin create user API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}