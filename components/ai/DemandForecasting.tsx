"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Package, 
  AlertTriangle,
  RefreshCw,
  Brain,
  BarChart3
} from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

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

interface DemandForecastingProps {
  className?: string
}

export default function DemandForecasting({ className }: DemandForecastingProps) {
  const { organization, hasFeature } = useSupabaseAuth()
  const [forecasts, setForecasts] = useState<ForecastData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d')
  const [category, setCategory] = useState<string>('all')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Check if user has access to AI demand forecasting
  const hasAIDemandForecasting = hasFeature('aiDemandForecasting') || 
    organization?.subscription_tier === 'pro' ||
    organization?.subscription_tier === 'enterprise'

  const generateForecast = async () => {
    if (!hasAIDemandForecasting) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/demand-forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe,
          category: category === 'all' ? null : category,
          organizationId: organization?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate forecast')
      }

      const data = await response.json()
      setForecasts(data.forecasts)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to generate demand forecast')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasAIDemandForecasting) {
      generateForecast()
    }
  }, [timeframe, category, hasAIDemandForecasting])

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <BarChart3 className="h-4 w-4 text-blue-500" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getActionBadgeVariant = (action: string) => {
    if (action.toLowerCase().includes('reorder')) return 'destructive'
    if (action.toLowerCase().includes('reduce')) return 'secondary'
    return 'default'
  }

  if (!hasAIDemandForecasting) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Demand Forecasting
          </CardTitle>
          <CardDescription>
            Predict future demand for your products using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">AI Demand Forecasting Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro or Enterprise to access AI-powered demand forecasting.
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
              <Brain className="h-5 w-5 mr-2" />
              AI Demand Forecasting
              {organization?.subscription_tier === 'enterprise' && (
                <Badge variant="secondary" className="ml-2">Enterprise AI</Badge>
              )}
            </CardTitle>
            <CardDescription>
              AI-powered predictions for inventory planning
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateForecast}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Forecast Period</label>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Next 7 days</SelectItem>
                <SelectItem value="30d">Next 30 days</SelectItem>
                <SelectItem value="90d">Next 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="electronics">Electronics</SelectItem>
                <SelectItem value="clothing">Clothing</SelectItem>
                <SelectItem value="home-garden">Home & Garden</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Last Updated */}
        {lastUpdated && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-2" />
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
              Analyzing historical data and generating forecasts...
            </p>
          </div>
        )}

        {/* Forecasts */}
        {!loading && forecasts.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Demand Forecasts ({forecasts.length} products)</h3>
            
            {forecasts.map((forecast) => (
              <Card key={forecast.productId} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{forecast.productName}</h4>
                      {getTrendIcon(forecast.trend)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Current stock: {forecast.currentStock} units
                    </div>
                  </div>
                  <Badge variant={getActionBadgeVariant(forecast.recommendedAction)}>
                    {forecast.recommendedAction}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium">Predicted Demand</div>
                    <div className="text-lg font-bold text-primary">
                      {forecast.predictedDemand}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      vs {forecast.historicalAverage} avg
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Confidence</div>
                    <div className={`text-lg font-bold ${getConfidenceColor(forecast.confidence)}`}>
                      {forecast.confidence}%
                    </div>
                    <Progress value={forecast.confidence} className="h-2 mt-1" />
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Seasonal Factor</div>
                    <div className="text-lg font-bold">
                      {forecast.seasonalFactor > 1 ? '+' : ''}{((forecast.seasonalFactor - 1) * 100).toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {forecast.seasonalFactor > 1 ? 'Peak season' : 'Off season'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium">Stock Alert</div>
                    <div className="text-lg font-bold">
                      {forecast.daysUntilStockout ? `${forecast.daysUntilStockout}d` : '∞'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {forecast.daysUntilStockout ? 'until stockout' : 'sufficient stock'}
                    </div>
                  </div>
                </div>

                {/* Action Recommendations */}
                {forecast.daysUntilStockout && forecast.daysUntilStockout < 14 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Action needed:</strong> {forecast.recommendedAction}
                      {forecast.daysUntilStockout < 7 && (
                        <span className="text-red-600 font-medium"> - Urgent!</span>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && forecasts.length === 0 && !error && (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Forecast Data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We need more historical data to generate accurate forecasts.
            </p>
            <Button variant="outline" onClick={generateForecast}>
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
              Using advanced machine learning algorithms with seasonal analysis, 
              trend detection, and external factor consideration for maximum accuracy.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}