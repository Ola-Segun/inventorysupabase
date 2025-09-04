import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Test 1: Check if we can connect to the database
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (connectionError) {
      return NextResponse.json({
        error: 'Database connection failed',
        details: connectionError.message,
        code: connectionError.code
      }, { status: 500 })
    }

    // Test 2: Check if users table exists and has data
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, name, role, store_id, organization_id')
      .limit(5)

    if (usersError) {
      return NextResponse.json({
        error: 'Users table query failed',
        details: usersError.message,
        code: usersError.code
      }, { status: 500 })
    }

    // Test 3: Check if stores table exists
    const { data: stores, error: storesError } = await supabase
      .from('stores')
      .select('id, name, owner_id')
      .limit(5)

    if (storesError) {
      return NextResponse.json({
        error: 'Stores table query failed',
        details: storesError.message,
        code: storesError.code
      }, { status: 500 })
    }

    // Test 4: Check if organizations table exists
    const { data: organizations, error: orgsError } = await supabase
      .from('organizations')
      .select('id, name')
      .limit(5)

    if (orgsError) {
      return NextResponse.json({
        error: 'Organizations table query failed',
        details: orgsError.message,
        code: orgsError.code
      }, { status: 500 })
    }

    // Test 5: Check current user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    return NextResponse.json({
      success: true,
      database: {
        connection: 'OK',
        usersTable: users ? 'OK' : 'No data',
        storesTable: stores ? 'OK' : 'No data',
        organizationsTable: organizations ? 'OK' : 'No data'
      },
      auth: {
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role
        } : null,
        error: authError?.message
      },
      data: {
        users: users?.length || 0,
        stores: stores?.length || 0,
        organizations: organizations?.length || 0,
        sampleUsers: users,
        sampleStores: stores,
        sampleOrganizations: organizations
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Unexpected error',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}