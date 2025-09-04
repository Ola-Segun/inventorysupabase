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

// Helper function to generate CSV content
function generateCSV(users: any[]): string {
  const headers = [
    'ID',
    'Name',
    'Email',
    'Phone',
    'Role',
    'Status',
    'Last Login',
    'Created At',
    'Store Name',
    'Two Factor Enabled'
  ]

  const rows = users.map(user => [
    user.id,
    `"${user.name}"`,
    user.email,
    user.phone || '',
    user.role,
    user.status,
    user.last_login_at || '',
    user.created_at,
    user.store?.name || '',
    user.two_factor_enabled ? 'Yes' : 'No'
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.join(','))
    .join('\n')

  return csvContent
}

// Helper function to generate simple HTML for PDF
function generateHTML(users: any[]): string {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>User Export</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header-info { margin-bottom: 20px; color: #666; }
            .export-date { font-size: 12px; color: #999; }
        </style>
    </head>
    <body>
        <div class="header-info">
            <h1>User Management Export</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <p>Total Users: ${users.length}</p>
        </div>

        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Created At</th>
                    <th>Store</th>
                    <th>2FA</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>${user.phone || ''}</td>
                        <td>${user.role}</td>
                        <td>${user.status}</td>
                        <td>${user.last_login_at ? new Date(user.last_login_at).toLocaleString() : ''}</td>
                        <td>${new Date(user.created_at).toLocaleString()}</td>
                        <td>${user.store?.name || ''}</td>
                        <td>${user.two_factor_enabled ? 'Yes' : 'No'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="export-date">
            <p>This report was generated automatically by the Inventory POS system.</p>
        </div>
    </body>
    </html>
  `

  return html
}

// GET /api/admin/users/export - Export users data
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
    const format = searchParams.get('format') || 'csv' // csv or pdf
    const status = searchParams.get('status') // active, inactive, suspended
    const role = searchParams.get('role') // admin, manager, cashier, seller
    const storeId = searchParams.get('storeId')

    // Build query
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        role,
        status,
        last_login_at,
        created_at,
        two_factor_enabled,
        store:stores(id, name, store_type)
      `)

    // Apply filters based on user permissions
    if (userProfile.role === 'super_admin') {
      // Super admin can see all users
    } else if (userProfile.store_id) {
      // Regular admin can only see users in their store
      query = query.eq('store_id', userProfile.store_id)
    } else {
      return NextResponse.json({ error: 'Unable to determine user scope' }, { status: 500 })
    }

    // Apply additional filters
    if (status && status !== 'all') {
      query = query.eq('status', status)
    }
    if (role && role !== 'all') {
      query = query.eq('role', role)
    }
    if (storeId && storeId !== 'all') {
      query = query.eq('store_id', storeId)
    }

    // Order by creation date
    query = query.order('created_at', { ascending: false })

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users for export:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'No users found matching the criteria' }, { status: 404 })
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-')
    const filename = `users_export_${timestamp}`

    if (format === 'csv') {
      // Generate CSV
      const csvContent = generateCSV(users)

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return HTML that can be converted to PDF by the client
      // In a production app, you'd use a library like puppeteer or a service
      const htmlContent = generateHTML(users)

      return new NextResponse(htmlContent, {
        headers: {
          'Content-Type': 'text/html',
          'Content-Disposition': `attachment; filename="${filename}.html"`
        }
      })
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or pdf' }, { status: 400 })
    }

  } catch (error) {
    console.error('GET users export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}