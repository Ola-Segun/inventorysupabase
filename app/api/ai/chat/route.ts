import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import type { Database } from '@/lib/supabase/database.types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies })
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's organization and check AI access
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check if user has access to AI features
    const hasAIAccess = userProfile.organization.subscription_tier === 'pro' || 
                       userProfile.organization.subscription_tier === 'enterprise'

    if (!hasAIAccess) {
      return NextResponse.json({ error: 'AI features not available in your plan' }, { status: 403 })
    }

    const { message, context } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get business context data
    const businessContext = await getBusinessContext(supabase, userProfile.organization.id)

    // Create system prompt with business context
    const systemPrompt = createSystemPrompt(userProfile.organization, businessContext)

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: userProfile.organization.subscription_tier === 'enterprise' ? 'gpt-4' : 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    })

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I could not generate a response.'

    // Generate suggestions based on the response
    const suggestions = generateSuggestions(message, businessContext)

    // Generate data visualization if applicable
    const data = await generateDataVisualization(message, supabase, userProfile.organization.id)

    return NextResponse.json({
      message: aiResponse,
      suggestions,
      data,
      usage: completion.usage
    })

  } catch (error) {
    console.error('AI Chat API error:', error)
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    )
  }
}

async function getBusinessContext(supabase: any, organizationId: string) {
  try {
    // Get key business metrics
    const [
      { data: products },
      { data: orders },
      { data: customers },
      { data: lowStockItems }
    ] = await Promise.all([
      supabase
        .from('products')
        .select('id, name, stock_quantity, selling_price, status')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .limit(100),
      
      supabase
        .from('orders')
        .select('id, total_amount, status, created_at')
        .eq('organization_id', organizationId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100),
      
      supabase
        .from('customers')
        .select('id, name, total_spent')
        .eq('organization_id', organizationId)
        .limit(50),
      
      supabase
        .from('products')
        .select('id, name, stock_quantity, min_stock_level')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .lt('stock_quantity', 10)
        .limit(20)
    ])

    return {
      totalProducts: products?.length || 0,
      totalOrders: orders?.length || 0,
      totalCustomers: customers?.length || 0,
      lowStockCount: lowStockItems?.length || 0,
      recentOrders: orders?.slice(0, 5) || [],
      lowStockItems: lowStockItems || [],
      topProducts: products?.sort((a, b) => (b.selling_price * b.stock_quantity) - (a.selling_price * a.stock_quantity)).slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error getting business context:', error)
    return {
      totalProducts: 0,
      totalOrders: 0,
      totalCustomers: 0,
      lowStockCount: 0,
      recentOrders: [],
      lowStockItems: [],
      topProducts: []
    }
  }
}

function createSystemPrompt(organization: any, businessContext: any) {
  return `You are an AI business assistant for ${organization.name}, an inventory management system user. 

Current business context:
- Total products: ${businessContext.totalProducts}
- Total orders (last 30 days): ${businessContext.totalOrders}
- Total customers: ${businessContext.totalCustomers}
- Low stock items: ${businessContext.lowStockCount}
- Subscription tier: ${organization.subscription_tier}

You help with:
1. Inventory analysis and recommendations
2. Sales insights and trends
3. Business optimization suggestions
4. Stock management advice
5. Customer analysis

Be concise, helpful, and business-focused. Provide actionable insights based on the data available. If asked about specific data you don't have access to, suggest how they can find it in their dashboard.

For low stock alerts, be specific about which items need attention.
For sales analysis, focus on trends and opportunities.
For recommendations, be practical and implementable.`
}

function generateSuggestions(message: string, businessContext: any): string[] {
  const messageLower = message.toLowerCase()
  
  if (messageLower.includes('stock') || messageLower.includes('inventory')) {
    return [
      "Show reorder recommendations",
      "Analyze stock turnover",
      "Check supplier performance",
      "Review category performance"
    ]
  }
  
  if (messageLower.includes('sales') || messageLower.includes('revenue')) {
    return [
      "Compare monthly sales",
      "Show top customers",
      "Analyze profit margins",
      "Review seasonal trends"
    ]
  }
  
  if (messageLower.includes('customer') || messageLower.includes('client')) {
    return [
      "Show customer segments",
      "Analyze purchase patterns",
      "Review loyalty metrics",
      "Identify growth opportunities"
    ]
  }
  
  return [
    "Show business overview",
    "Analyze inventory health",
    "Review recent performance",
    "Get optimization tips"
  ]
}

async function generateDataVisualization(message: string, supabase: any, organizationId: string) {
  const messageLower = message.toLowerCase()
  
  try {
    if (messageLower.includes('low stock') || messageLower.includes('stock alert')) {
      const { data: lowStockItems } = await supabase
        .from('products')
        .select('name, stock_quantity')
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .lt('stock_quantity', 10)
        .limit(5)
      
      return {
        type: 'low_stock',
        items: lowStockItems?.map((item: any) => ({
          name: item.name,
          stock: item.stock_quantity
        })) || []
      }
    }
    
    if (messageLower.includes('sales trend') || messageLower.includes('sales performance')) {
      const thisWeekStart = new Date()
      thisWeekStart.setDate(thisWeekStart.getDate() - 7)
      
      const lastWeekStart = new Date()
      lastWeekStart.setDate(lastWeekStart.getDate() - 14)
      
      const [{ data: thisWeekOrders }, { data: lastWeekOrders }] = await Promise.all([
        supabase
          .from('orders')
          .select('total_amount')
          .eq('organization_id', organizationId)
          .eq('status', 'completed')
          .gte('created_at', thisWeekStart.toISOString()),
        
        supabase
          .from('orders')
          .select('total_amount')
          .eq('organization_id', organizationId)
          .eq('status', 'completed')
          .gte('created_at', lastWeekStart.toISOString())
          .lt('created_at', thisWeekStart.toISOString())
      ])
      
      const thisWeekTotal = thisWeekOrders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0) || 0
      const lastWeekTotal = lastWeekOrders?.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0) || 0
      
      const change = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal * 100) : 0
      
      return {
        type: 'sales_trend',
        thisWeek: thisWeekTotal.toFixed(2),
        lastWeek: lastWeekTotal.toFixed(2),
        change: change.toFixed(1)
      }
    }
  } catch (error) {
    console.error('Error generating data visualization:', error)
  }
  
  return null
}