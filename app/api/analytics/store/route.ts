import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's store_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('store_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.store_id) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let query = supabase
      .from('store_analytics')
      .select('*')
      .eq('store_id', userProfile.store_id)

    if (date) {
      query = query.eq('date', date)
    } else if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate)
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      query = query.gte('date', thirtyDaysAgo.toISOString().split('T')[0])
    }

    const { data: analytics, error } = await query
      .order('date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('sb-access-token')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's store_id
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('store_id')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.store_id) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Calculate store analytics for today
    const today = new Date().toISOString().split('T')[0]

    // Get sales data
    const { data: salesData, error: salesError } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('store_id', userProfile.store_id)
      .eq('payment_status', 'paid')
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 })
    }

    // Get order count
    const { count: orderCount, error: orderError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', userProfile.store_id)
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`)

    if (orderError) {
      return NextResponse.json({ error: orderError.message }, { status: 500 })
    }

    // Get customer count
    const { count: customerCount, error: customerError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', userProfile.store_id)

    if (customerError) {
      return NextResponse.json({ error: customerError.message }, { status: 500 })
    }

    // Get product count
    const { count: productCount, error: productError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('store_id', userProfile.store_id)

    if (productError) {
      return NextResponse.json({ error: productError.message }, { status: 500 })
    }

    // Calculate totals
    const totalSales = salesData?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0

    // Insert or update analytics
    const { data: analytics, error: insertError } = await supabase
      .from('store_analytics')
      .upsert({
        store_id: userProfile.store_id,
        date: today,
        total_sales: totalSales,
        total_orders: orderCount || 0,
        total_customers: customerCount || 0,
        total_products: productCount || 0,
        low_stock_items: 0, // TODO: Calculate low stock items
        out_of_stock_items: 0, // TODO: Calculate out of stock items
        top_selling_products: [], // TODO: Calculate top selling products
        revenue_by_category: {} // TODO: Calculate revenue by category
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(analytics, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}