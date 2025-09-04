"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  RefreshCw,
  Brain,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

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

interface PriceOptimizationProps {
  className?: string
}

export default function PriceOptimization({ className }: PriceOptimizationProps) {
  const { organization, hasFeature } = useSupabaseAuth()
  const [recommendations, setRecommendations] = useState<PriceRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Check if user has access to price optimization
  const hasPriceOptimization = hasFeature('priceOptimization') ||
    organization?.subscription_tier === 'pro' ||
    organization?.subscription_tier === 'enterprise'

  const generateRecommendations = async () => {
    if (!hasPriceOptimization) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/price-optimization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organizationId: organization?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate price recommendations')
      }

      const data = await response.json()
      setRecommendations(data.recommendations)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to generate price optimization recommendations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPriceOptimization) {
      generateRecommendations()
    }
  }, [hasPriceOptimization])

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600'
    if (change < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (!hasPriceOptimization) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            AI Price Optimization
          </CardTitle>
          <CardDescription>
            Optimize your pricing strategy with AI-powered recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Price Optimization Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro or Enterprise to access AI-powered price optimization.
            </p>
            <Button size="sm" onClick={() => window.location.href = '/billing'}>
              Upgrade Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              AI Price Optimization
              {organization?.subscription_tier === 'enterprise' && (
                <Badge variant="secondary" className="ml-2">Enterprise AI</Badge>
              )}
            </CardTitle>
            <CardDescription>
              AI-powered pricing recommendations to maximize revenue
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateRecommendations}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Brain className="h-4 w-4 mr-2" />
            Last updated: {lastUpdated.toLocaleString()}
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">
              Analyzing pricing data and generating recommendations...
            </p>
          </div>
        )}

        {/* Recommendations */}
        {!loading && recommendations.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Price Optimization Recommendations ({recommendations.length})</h3>

            {recommendations.map((rec) => (
              <Card key={rec.productId} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-medium mb-1">{rec.productName}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Current: {formatCurrency(rec.currentPrice)}</span>
                      <span>Recommended: {formatCurrency(rec.recommendedPrice)}</span>
                      <span className={`flex items-center ${getPriceChangeColor(rec.priceChange)}`}>
                        {rec.priceChange > 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        {rec.priceChange > 0 ? '+' : ''}{rec.priceChange.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Badge variant={rec.confidence >= 80 ? 'default' : rec.confidence >= 60 ? 'secondary' : 'destructive'}>
                    {rec.confidence}% confidence
                  </Badge>
                </div>

                {/* Expected Impact */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      Expected Revenue Impact
                    </div>
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      +{formatCurrency(rec.expectedImpact.revenueIncrease)}
                    </div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 dark:text-blue-300">
                      Units Sold Change
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {rec.expectedImpact.unitsSoldChange > 0 ? '+' : ''}{rec.expectedImpact.unitsSoldChange}
                    </div>
                  </div>
                </div>

                {/* Reasoning */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">AI Analysis:</div>
                  <p className="text-sm text-muted-foreground">{rec.reasoning}</p>
                </div>

                {/* Competitor Data (Enterprise only) */}
                {organization?.subscription_tier === 'enterprise' && rec.competitors && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Market Comparison:</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Market Average</div>
                        <div className="font-medium">{formatCurrency(rec.competitors.averagePrice)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Lowest Price</div>
                        <div className="font-medium">{formatCurrency(rec.competitors.lowestPrice)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Highest Price</div>
                        <div className="font-medium">{formatCurrency(rec.competitors.highestPrice)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply Price
                  </Button>
                  <Button size="sm" variant="ghost">
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && recommendations.length === 0 && !error && (
          <div className="text-center py-8">
            <DollarSign className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Price Recommendations</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We need more sales data to generate accurate price optimization recommendations.
            </p>
            <Button variant="outline" onClick={generateRecommendations}>
              Try Again
            </Button>
          </div>
        )}

        {/* AI Model Info for Enterprise */}
        {organization?.subscription_tier === 'enterprise' && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center mb-2">
              <Brain className="h-4 w-4 mr-2 text-primary" />
              <span className="text-sm font-medium">Enterprise AI Model</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Using advanced machine learning algorithms with competitor analysis,
              elasticity modeling, and market trend prediction for optimal pricing strategy.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}