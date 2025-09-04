import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import type { Database } from '@/lib/supabase/database.types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ForecastData {
  productId: string
  productName: string
  currentStock: number
  predictedDemand: number
  confidence: number
  trend: 'up' | 'down' | 'stable'
  recommendedAction: string
  seasonalFactor: number
  historicalAverage: number
  daysUntilStockout: number | null
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

    // Check if user has access to AI demand forecasting
    const hasAIAccess = userProfile.organization.subscription_tier === 'pro' || 
                       userProfile.organization.subscription_tier === 'enterprise'

    if (!hasAIAccess) {
      return NextResponse.json({ error: 'AI demand forecasting not available in your plan' }, { status: 403 })
    }

    const { timeframe, category } = await request.json()

    // Get historical data for forecasting
    const historicalData = await getHistoricalData(supabase, userProfile.organization.id, timeframe, category)
    
    // Generate forecasts using AI
    const forecasts = await generateDemandForecasts(historicalData, timeframe, userProfile.organization.subscription_tier)

    return NextResponse.json({
      forecasts,
      timeframe,
      category,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Demand forecast API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate demand forecast' },
      { status: 500 }
    )
  }
}

async function getHistoricalData(supabase: any, organizationId: string, timeframe: string, category?: string) {
  const days = timeframe === '7d' ? 30 : timeframe === '30d' ? 90 : 180 // Look back further for better predictions
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Get products with their sales history
    let productsQuery = supabase
      .from('products')
      .select(`
        id,
        name,
        stock_quantity,
        min_stock_level,
        category_id,
        categories(name)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')

    if (category && category !== 'all') {
      productsQuery = productsQuery.eq('categories.name', category)
    }

    const { data: products } = await productsQuery.limit(50)

    if (!products || products.length === 0) {
      return []
    }

    // Get order history for these products
    const productIds = products.map(p => p.id)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        created_at,
        orders!inner(
          organization_id,
          status,
          created_at
        )
      `)
      .eq('orders.organization_id', organizationId)
      .eq('orders.status', 'completed')
      .in('product_id', productIds)
      .gte('orders.created_at', startDate.toISOString())

    // Get stock movements
    const { data: stockMovements } = await supabase
      .from('stock_movements')
      .select('product_id, quantity, type, created_at')
      .eq('organization_id', organizationId)
      .in('product_id', productIds)
      .gte('created_at', startDate.toISOString())

    return products.map(product => ({
      ...product,
      orderHistory: orderItems?.filter(item => item.product_id === product.id) || [],
      stockMovements: stockMovements?.filter(movement => movement.product_id === product.id) || []
    }))

  } catch (error) {
    console.error('Error getting historical data:', error)
    return []
  }
}

async function generateDemandForecasts(
  historicalData: any[], 
  timeframe: string, 
  subscriptionTier: string
): Promise<ForecastData[]> {
  const forecasts: ForecastData[] = []

  for (const product of historicalData) {
    try {
      // Calculate historical metrics
      const salesData = product.orderHistory || []
      const totalSales = salesData.reduce((sum: number, item: any) => sum + item.quantity, 0)
      const salesDays = salesData.length > 0 ? 
        Math.max(1, Math.ceil((new Date().getTime() - new Date(salesData[0]?.created_at || new Date()).getTime()) / (1000 * 60 * 60 * 24))) : 
        30

      const dailyAverage = totalSales / salesDays
      const historicalAverage = Math.round(dailyAverage * (timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90))

      // Simple trend analysis
      const recentSales = salesData.filter((item: any) => {
        const itemDate = new Date(item.created_at)
        const weekAgo = new Date()
        weekAgo.setDate(weekAgo.getDate() - 7)
        return itemDate >= weekAgo
      })

      const recentAverage = recentSales.length > 0 ? 
        recentSales.reduce((sum: number, item: any) => sum + item.quantity, 0) / 7 : 0

      // Determine trend
      let trend: 'up' | 'down' | 'stable' = 'stable'
      if (recentAverage > dailyAverage * 1.2) trend = 'up'
      else if (recentAverage < dailyAverage * 0.8) trend = 'down'

      // Seasonal factor (simplified - in production, this would use more sophisticated analysis)
      const currentMonth = new Date().getMonth()
      const seasonalFactor = getSeasonalFactor(currentMonth, product.categories?.name)

      // Predict demand with AI enhancement for Enterprise
      let predictedDemand = historicalAverage
      let confidence = 60

      if (subscriptionTier === 'enterprise') {
        // Use AI for more sophisticated prediction
        const aiPrediction = await getAIPrediction(product, salesData, timeframe)
        predictedDemand = aiPrediction.demand
        confidence = aiPrediction.confidence
      } else {
        // Simple statistical prediction for Pro
        predictedDemand = Math.round(historicalAverage * seasonalFactor * (trend === 'up' ? 1.2 : trend === 'down' ? 0.8 : 1))
        confidence = salesData.length > 10 ? 75 : 50
      }

      // Calculate days until stockout
      const daysUntilStockout = predictedDemand > 0 ? 
        Math.floor(product.stock_quantity / (predictedDemand / (timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90))) : 
        null

      // Generate recommendation
      let recommendedAction = 'Monitor stock levels'
      if (daysUntilStockout && daysUntilStockout < 7) {
        recommendedAction = 'Urgent reorder needed'
      } else if (daysUntilStockout && daysUntilStockout < 14) {
        recommendedAction = 'Plan reorder soon'
      } else if (product.stock_quantity > predictedDemand * 2) {
        recommendedAction = 'Consider reducing orders'
      }

      forecasts.push({
        productId: product.id,
        productName: product.name,
        currentStock: product.stock_quantity,
        predictedDemand,
        confidence,
        trend,
        recommendedAction,
        seasonalFactor,
        historicalAverage,
        daysUntilStockout
      })

    } catch (error) {
      console.error(`Error generating forecast for product ${product.id}:`, error)
    }
  }

  // Sort by urgency (lowest days until stockout first)
  return forecasts.sort((a, b) => {
    if (a.daysUntilStockout === null && b.daysUntilStockout === null) return 0
    if (a.daysUntilStockout === null) return 1
    if (b.daysUntilStockout === null) return -1
    return a.daysUntilStockout - b.daysUntilStockout
  })
}

function getSeasonalFactor(month: number, category?: string): number {
  // Simplified seasonal factors - in production, this would be more sophisticated
  const seasonalFactors: { [key: string]: number[] } = {
    'electronics': [0.9, 0.9, 1.0, 1.0, 1.0, 1.0, 0.9, 0.9, 1.0, 1.1, 1.3, 1.4], // Higher in Nov-Dec
    'clothing': [0.8, 0.9, 1.1, 1.2, 1.2, 1.0, 0.9, 0.9, 1.0, 1.1, 1.2, 1.1], // Spring/Fall peaks
    'groceries': [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.1, 1.2], // Slight holiday increase
    'home-garden': [0.8, 0.8, 1.1, 1.3, 1.4, 1.2, 1.0, 0.9, 0.9, 1.0, 0.8, 0.7], // Spring/Summer peak
  }

  const factors = seasonalFactors[category?.toLowerCase() || 'default'] || 
    [1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0]

  return factors[month] || 1.0
}

async function getAIPrediction(product: any, salesData: any[], timeframe: string) {
  try {
    const prompt = `Analyze this product's sales data and predict future demand:

Product: ${product.name}
Current Stock: ${product.stock_quantity}
Historical Sales: ${JSON.stringify(salesData.slice(-10))}
Forecast Period: ${timeframe}

Consider:
1. Sales trends and patterns
2. Seasonal variations
3. Stock levels
4. Market conditions

Provide a JSON response with:
{
  "demand": <predicted_quantity>,
  "confidence": <confidence_percentage>,
  "reasoning": "<brief_explanation>"
}

Be conservative but accurate in your predictions.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an expert demand forecasting analyst. Provide accurate, data-driven predictions.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      const prediction = JSON.parse(response)
      return {
        demand: Math.max(0, Math.round(prediction.demand)),
        confidence: Math.min(95, Math.max(50, prediction.confidence))
      }
    }
  } catch (error) {
    console.error('AI prediction error:', error)
  }

  // Fallback to simple calculation
  const totalSales = salesData.reduce((sum: number, item: any) => sum + item.quantity, 0)
  const days = Math.max(1, salesData.length)
  const dailyAverage = totalSales / days
  const forecastDays = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90
  
  return {
    demand: Math.round(dailyAverage * forecastDays),
    confidence: 65
  }
}