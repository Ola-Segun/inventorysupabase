import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import type { Database } from '@/lib/supabase/database.types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface PredictiveInsight {
  id: string
  type: 'revenue' | 'inventory' | 'customer' | 'trend'
  title: string
  description: string
  confidence: number
  impact: 'high' | 'medium' | 'low'
  prediction: {
    value: number
    unit: string
    timeframe: string
  }
  recommendations: string[]
  data?: any
}

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

    // Check if user has access to predictive analytics (Enterprise only)
    if (userProfile.organization.subscription_tier !== 'enterprise') {
      return NextResponse.json({ error: 'Predictive analytics requires Enterprise plan' }, { status: 403 })
    }

    const { timeframe } = await request.json()

    // Get comprehensive business data for analysis
    const businessData = await getBusinessDataForAnalysis(supabase, userProfile.organization.id, timeframe)

    // Generate predictive insights using AI
    const insights = await generatePredictiveInsights(businessData, timeframe)

    return NextResponse.json({
      insights,
      timeframe,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Predictive analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate predictive insights' },
      { status: 500 }
    )
  }
}

async function getBusinessDataForAnalysis(supabase: any, organizationId: string, timeframe: string) {
  const days = timeframe === '30d' ? 90 : timeframe === '90d' ? 180 : 365
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Get revenue data
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total_amount, created_at, status')
      .eq('organization_id', organizationId)
      .eq('status', 'completed')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    // Get inventory data
    const { data: inventoryData } = await supabase
      .from('products')
      .select(`
        id,
        name,
        stock_quantity,
        min_stock_level,
        selling_price,
        categories(name)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    // Get customer data
    const { data: customerData } = await supabase
      .from('customers')
      .select(`
        id,
        name,
        total_spent,
        created_at,
        orders(count)
      `)
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(100)

    // Get stock movement data
    const { data: stockMovements } = await supabase
      .from('stock_movements')
      .select('product_id, quantity, type, created_at')
      .eq('organization_id', organizationId)
      .gte('created_at', startDate.toISOString())

    return {
      revenue: revenueData || [],
      inventory: inventoryData || [],
      customers: customerData || [],
      stockMovements: stockMovements || [],
      analysisPeriod: days
    }

  } catch (error) {
    console.error('Error getting business data for analysis:', error)
    return {
      revenue: [],
      inventory: [],
      customers: [],
      stockMovements: [],
      analysisPeriod: days
    }
  }
}

async function generatePredictiveInsights(
  businessData: any,
  timeframe: string
): Promise<PredictiveInsight[]> {
  const insights: PredictiveInsight[] = []

  try {
    // Revenue Prediction
    const revenueInsight = await generateRevenueInsight(businessData, timeframe)
    if (revenueInsight) insights.push(revenueInsight)

    // Inventory Prediction
    const inventoryInsight = await generateInventoryInsight(businessData, timeframe)
    if (inventoryInsight) insights.push(inventoryInsight)

    // Customer Prediction
    const customerInsight = await generateCustomerInsight(businessData, timeframe)
    if (customerInsight) insights.push(customerInsight)

    // Trend Analysis
    const trendInsight = await generateTrendInsight(businessData, timeframe)
    if (trendInsight) insights.push(trendInsight)

  } catch (error) {
    console.error('Error generating predictive insights:', error)
  }

  return insights
}

async function generateRevenueInsight(businessData: any, timeframe: string): Promise<PredictiveInsight | null> {
  try {
    const revenue = businessData.revenue
    if (revenue.length < 10) return null

    // Calculate current metrics
    const totalRevenue = revenue.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0)
    const avgOrderValue = totalRevenue / revenue.length
    const daysInPeriod = businessData.analysisPeriod
    const dailyRevenue = totalRevenue / daysInPeriod

    // Calculate trend
    const midPoint = Math.floor(revenue.length / 2)
    const firstHalf = revenue.slice(0, midPoint)
    const secondHalf = revenue.slice(midPoint)

    const firstHalfRevenue = firstHalf.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0)
    const secondHalfRevenue = secondHalf.reduce((sum: number, order: any) => sum + parseFloat(order.total_amount), 0)

    const trend = secondHalfRevenue > firstHalfRevenue ? 'up' : 'down'
    const changePercent = ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100

    // Predict future revenue
    const predictionDays = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 180
    const predictedRevenue = dailyRevenue * predictionDays * (1 + changePercent / 100)

    const prompt = `Analyze revenue data and predict future performance:

Current Data:
- Total Revenue (last ${businessData.analysisPeriod} days): $${totalRevenue.toFixed(2)}
- Average Order Value: $${avgOrderValue.toFixed(2)}
- Daily Revenue: $${dailyRevenue.toFixed(2)}
- Trend: ${trend === 'up' ? 'Increasing' : 'Decreasing'} (${changePercent.toFixed(1)}%)

Predict revenue for the next ${predictionDays} days and provide confidence level and recommendations.

Response format:
{
  "prediction": <predicted_revenue>,
  "confidence": <confidence_percentage>,
  "reasoning": "<explanation>",
  "recommendations": ["rec1", "rec2", "rec3"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a revenue forecasting expert. Analyze trends and predict future revenue with actionable insights.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 400,
      temperature: 0.2,
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      const analysis = JSON.parse(response)

      return {
        id: 'revenue-prediction',
        type: 'revenue',
        title: 'Revenue Forecast',
        description: `Predicted revenue for the next ${predictionDays} days based on current trends`,
        confidence: analysis.confidence,
        impact: analysis.confidence > 80 ? 'high' : 'medium',
        prediction: {
          value: analysis.prediction,
          unit: 'currency',
          timeframe: `Next ${predictionDays} days`
        },
        recommendations: analysis.recommendations,
        data: {
          trend,
          change: changePercent.toFixed(1)
        }
      }
    }
  } catch (error) {
    console.error('Revenue insight generation error:', error)
  }

  return null
}

async function generateInventoryInsight(businessData: any, timeframe: string): Promise<PredictiveInsight | null> {
  try {
    const inventory = businessData.inventory
    const stockMovements = businessData.stockMovements

    if (inventory.length === 0) return null

    // Calculate inventory metrics
    const lowStockItems = inventory.filter((item: any) => item.stock_quantity <= item.min_stock_level)
    const totalValue = inventory.reduce((sum: number, item: any) => sum + (item.stock_quantity * item.selling_price), 0)

    // Calculate stock turnover
    const outboundMovements = stockMovements.filter((m: any) => m.type === 'outbound')
    const totalOutbound = outboundMovements.reduce((sum: number, m: any) => sum + m.quantity, 0)
    const avgInventory = inventory.reduce((sum: number, item: any) => sum + item.stock_quantity, 0) / inventory.length
    const turnoverRatio = avgInventory > 0 ? totalOutbound / avgInventory : 0

    const predictionDays = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 180
    const predictedStockouts = Math.round(lowStockItems.length * 1.2) // Conservative estimate

    return {
      id: 'inventory-prediction',
      type: 'inventory',
      title: 'Inventory Optimization',
      description: `Predicted inventory needs and potential stockout risks`,
      confidence: 75,
      impact: lowStockItems.length > 5 ? 'high' : 'medium',
      prediction: {
        value: predictedStockouts,
        unit: 'count',
        timeframe: `Next ${predictionDays} days`
      },
      recommendations: [
        'Review reorder points for low-stock items',
        'Consider bulk purchasing for high-turnover products',
        'Implement automated reorder alerts',
        'Analyze supplier lead times for critical items'
      ],
      data: {
        lowStock: lowStockItems.length,
        totalValue: totalValue.toFixed(2),
        turnoverRatio: turnoverRatio.toFixed(2)
      }
    }
  } catch (error) {
    console.error('Inventory insight generation error:', error)
    return null
  }
}

async function generateCustomerInsight(businessData: any, timeframe: string): Promise<PredictiveInsight | null> {
  try {
    const customers = businessData.customers
    if (customers.length < 5) return null

    // Calculate customer metrics
    const avgLifetimeValue = customers.reduce((sum: number, c: any) => sum + c.total_spent, 0) / customers.length
    const highValueCustomers = customers.filter((c: any) => c.total_spent > avgLifetimeValue * 1.5)
    const newCustomersLast30Days = customers.filter((c: any) => {
      const createdDate = new Date(c.created_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return createdDate >= thirtyDaysAgo
    }).length

    const predictionDays = timeframe === '30d' ? 30 : timeframe === '90d' ? 90 : 180
    const predictedNewCustomers = Math.round(newCustomersLast30Days * (predictionDays / 30))

    return {
      id: 'customer-prediction',
      type: 'customer',
      title: 'Customer Growth Forecast',
      description: `Predicted customer acquisition and retention trends`,
      confidence: 70,
      impact: 'medium',
      prediction: {
        value: predictedNewCustomers,
        unit: 'count',
        timeframe: `Next ${predictionDays} days`
      },
      recommendations: [
        'Focus marketing efforts on high-value customer segments',
        'Implement customer loyalty programs',
        'Personalize communication based on purchase history',
        'Monitor customer churn patterns'
      ],
      data: {
        segment: highValueCustomers.length > customers.length * 0.2 ? 'High-Value' : 'General',
        avgLifetimeValue: avgLifetimeValue.toFixed(2)
      }
    }
  } catch (error) {
    console.error('Customer insight generation error:', error)
    return null
  }
}

async function generateTrendInsight(businessData: any, timeframe: string): Promise<PredictiveInsight | null> {
  try {
    const revenue = businessData.revenue
    if (revenue.length < 20) return null

    // Analyze seasonal patterns and trends
    const monthlyRevenue: { [key: string]: number } = {}

    revenue.forEach((order: any) => {
      const date = new Date(order.created_at)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + parseFloat(order.total_amount)
    })

    const months = Object.keys(monthlyRevenue).sort()
    const values = months.map(month => monthlyRevenue[month])

    // Simple trend analysis
    const recentMonths = values.slice(-3)
    const earlierMonths = values.slice(-6, -3)

    const recentAvg = recentMonths.reduce((a, b) => a + b, 0) / recentMonths.length
    const earlierAvg = earlierMonths.reduce((a, b) => a + b, 0) / earlierMonths.length

    const trend = recentAvg > earlierAvg * 1.1 ? 'Strong Growth' :
                 recentAvg > earlierAvg * 1.05 ? 'Moderate Growth' :
                 recentAvg < earlierAvg * 0.95 ? 'Declining' : 'Stable'

    return {
      id: 'trend-analysis',
      type: 'trend',
      title: 'Business Trend Analysis',
      description: `Overall business performance trends and patterns`,
      confidence: 80,
      impact: trend.includes('Declining') ? 'high' : 'medium',
      prediction: {
        value: ((recentAvg - earlierAvg) / earlierAvg * 100),
        unit: 'percentage',
        timeframe: 'Recent trend'
      },
      recommendations: [
        'Monitor key performance indicators weekly',
        'Identify factors contributing to growth trends',
        'Prepare contingency plans for potential downturns',
        'Scale successful strategies during growth periods'
      ],
      data: {
        trend: trend.toLowerCase().includes('growth') ? 'up' : 'down',
        change: ((recentAvg - earlierAvg) / earlierAvg * 100).toFixed(1)
      }
    }
  } catch (error) {
    console.error('Trend insight generation error:', error)
    return null
  }
}