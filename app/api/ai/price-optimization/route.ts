import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import OpenAI from 'openai'
import type { Database } from '@/lib/supabase/database.types'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface PriceRecommendation {
  productId: string
  productName: string
  currentPrice: number
  recommendedPrice: number
  priceChange: number
  confidence: number
  reasoning: string
  expectedImpact: {
    revenueIncrease: number
    unitsSoldChange: number
  }
  competitors?: {
    averagePrice: number
    lowestPrice: number
    highestPrice: number
  }
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

    // Check if user has access to price optimization
    const hasAIAccess = userProfile.organization.subscription_tier === 'pro' ||
                       userProfile.organization.subscription_tier === 'enterprise'

    if (!hasAIAccess) {
      return NextResponse.json({ error: 'Price optimization not available in your plan' }, { status: 403 })
    }

    // Get products with sales data for price optimization
    const productsData = await getProductsWithSalesData(supabase, userProfile.organization.id)

    // Generate price recommendations
    const recommendations = await generatePriceRecommendations(productsData, userProfile.organization.subscription_tier)

    return NextResponse.json({
      recommendations,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Price optimization API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate price optimization recommendations' },
      { status: 500 }
    )
  }
}

async function getProductsWithSalesData(supabase: any, organizationId: string) {
  try {
    // Get products with their sales history
    const { data: products } = await supabase
      .from('products')
      .select(`
        id,
        name,
        selling_price,
        cost_price,
        stock_quantity,
        category_id,
        categories(name)
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .limit(50)

    if (!products || products.length === 0) {
      return []
    }

    // Get sales data for the last 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

    const productIds = products.map((p: any) => p.id)
    const { data: orderItems } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        unit_price,
        total_price,
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
      .gte('orders.created_at', ninetyDaysAgo.toISOString())

    // Group sales data by product
    const salesByProduct: { [key: string]: any[] } = {}
    orderItems?.forEach((item: any) => {
      if (!salesByProduct[item.product_id]) {
        salesByProduct[item.product_id] = []
      }
      salesByProduct[item.product_id].push(item)
    })

    return products.map((product: any) => ({
      ...product,
      salesHistory: salesByProduct[product.id] || [],
      totalSold: (salesByProduct[product.id] || []).reduce((sum: number, item: any) => sum + item.quantity, 0),
      averageSalePrice: calculateAveragePrice(salesByProduct[product.id] || []),
      salesVelocity: calculateSalesVelocity(salesByProduct[product.id] || [])
    }))

  } catch (error) {
    console.error('Error getting products with sales data:', error)
    return []
  }
}

function calculateAveragePrice(salesHistory: any[]): number {
  if (salesHistory.length === 0) return 0
  const totalRevenue = salesHistory.reduce((sum: number, item: any) => sum + item.total_price, 0)
  const totalQuantity = salesHistory.reduce((sum: number, item: any) => sum + item.quantity, 0)
  return totalRevenue / totalQuantity
}

function calculateSalesVelocity(salesHistory: any[]): number {
  if (salesHistory.length === 0) return 0

  const sortedSales = salesHistory.sort((a: any, b: any) =>
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const firstSale = new Date(sortedSales[0].created_at)
  const lastSale = new Date(sortedSales[sortedSales.length - 1].created_at)
  const daysDiff = Math.max(1, (lastSale.getTime() - firstSale.getTime()) / (1000 * 60 * 60 * 24))

  return salesHistory.reduce((sum: number, item: any) => sum + item.quantity, 0) / daysDiff
}

async function generatePriceRecommendations(
  productsData: any[],
  subscriptionTier: string
): Promise<PriceRecommendation[]> {
  const recommendations: PriceRecommendation[] = []

  for (const product of productsData) {
    try {
      // Skip products with insufficient sales data
      if (product.salesHistory.length < 5) {
        continue
      }

      // Calculate basic metrics
      const currentPrice = product.selling_price
      const costPrice = product.cost_price
      const margin = ((currentPrice - costPrice) / currentPrice) * 100
      const salesVelocity = product.salesVelocity

      // Generate recommendation using AI
      let recommendation

      if (subscriptionTier === 'enterprise') {
        recommendation = await getEnterprisePriceRecommendation(product)
      } else {
        recommendation = await getProPriceRecommendation(product)
      }

      if (recommendation) {
        recommendations.push({
          productId: product.id,
          productName: product.name,
          currentPrice,
          recommendedPrice: recommendation.price,
          priceChange: ((recommendation.price - currentPrice) / currentPrice) * 100,
          confidence: recommendation.confidence,
          reasoning: recommendation.reasoning,
          expectedImpact: recommendation.expectedImpact,
          competitors: subscriptionTier === 'enterprise' ? recommendation.competitors : undefined
        })
      }

    } catch (error) {
      console.error(`Error generating recommendation for product ${product.id}:`, error)
    }
  }

  // Sort by potential revenue impact
  return recommendations.sort((a, b) =>
    Math.abs(b.expectedImpact.revenueIncrease) - Math.abs(a.expectedImpact.revenueIncrease)
  )
}

async function getProPriceRecommendation(product: any) {
  try {
    const prompt = `Analyze this product's pricing and sales data to recommend optimal price:

Product: ${product.name}
Current Price: $${product.selling_price}
Cost Price: $${product.cost_price}
Total Units Sold (90 days): ${product.totalSold}
Sales Velocity (units/day): ${product.salesVelocity.toFixed(2)}
Average Sale Price: $${product.averageSalePrice.toFixed(2)}

Consider:
1. Profit margin optimization
2. Sales velocity impact
3. Market positioning
4. Price elasticity

Provide a JSON response with:
{
  "price": <recommended_price>,
  "confidence": <confidence_percentage>,
  "reasoning": "<brief_explanation>",
  "expectedImpact": {
    "revenueIncrease": <expected_monthly_revenue_change>,
    "unitsSoldChange": <expected_units_change>
  }
}

Be conservative but profitable. Consider a 10-20% price range for recommendations.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a pricing optimization expert. Provide data-driven price recommendations.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 300,
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      return JSON.parse(response)
    }
  } catch (error) {
    console.error('Pro price recommendation error:', error)
  }

  // Fallback calculation
  const currentPrice = product.selling_price
  const costPrice = product.cost_price
  const margin = ((currentPrice - costPrice) / currentPrice) * 100

  // Simple optimization: adjust price based on sales velocity
  let recommendedPrice = currentPrice
  let reasoning = "Maintaining current price due to insufficient data"

  if (product.salesVelocity > 2) {
    // High sales velocity - can increase price
    recommendedPrice = currentPrice * 1.1
    reasoning = "High sales velocity suggests price increase opportunity"
  } else if (product.salesVelocity < 0.5) {
    // Low sales velocity - consider price reduction
    recommendedPrice = currentPrice * 0.95
    reasoning = "Low sales velocity suggests price reduction may help"
  }

  // Ensure minimum margin
  const minPrice = costPrice * 1.2 // 20% minimum margin
  recommendedPrice = Math.max(recommendedPrice, minPrice)

  return {
    price: Math.round(recommendedPrice * 100) / 100,
    confidence: 65,
    reasoning,
    expectedImpact: {
      revenueIncrease: Math.round((recommendedPrice - currentPrice) * product.salesVelocity * 30),
      unitsSoldChange: 0
    }
  }
}

async function getEnterprisePriceRecommendation(product: any) {
  try {
    const prompt = `Advanced pricing optimization analysis:

Product: ${product.name}
Current Price: $${product.selling_price}
Cost Price: $${product.cost_price}
Total Units Sold (90 days): ${product.totalSold}
Sales Velocity: ${product.salesVelocity.toFixed(2)} units/day
Average Sale Price: $${product.averageSalePrice.toFixed(2)}
Category: ${product.categories?.name || 'General'}

Advanced Analysis Requirements:
1. Price elasticity modeling
2. Competitor price positioning
3. Seasonal demand patterns
4. Customer segment analysis
5. Market share optimization
6. Profit maximization vs volume optimization

Provide comprehensive JSON response with:
{
  "price": <optimal_price>,
  "confidence": <high_confidence_percentage>,
  "reasoning": "<detailed_explanation>",
  "expectedImpact": {
    "revenueIncrease": <monthly_revenue_change>,
    "unitsSoldChange": <units_change>
  },
  "competitors": {
    "averagePrice": <market_average>,
    "lowestPrice": <lowest_competitor>,
    "highestPrice": <highest_competitor>
  }
}

Use advanced pricing strategies and market analysis.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an advanced pricing strategist with market analysis expertise.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.2,
    })

    const response = completion.choices[0]?.message?.content
    if (response) {
      return JSON.parse(response)
    }
  } catch (error) {
    console.error('Enterprise price recommendation error:', error)
  }

  // Fallback to Pro recommendation for Enterprise
  return getProPriceRecommendation(product)
}