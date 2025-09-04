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
  BarChart3,
  RefreshCw,
  Brain,
  Calendar,
  DollarSign,
  Package,
  Users,
  AlertTriangle,
  Target
} from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

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

interface PredictiveAnalyticsProps {
  className?: string
}

export default function PredictiveAnalytics({ className }: PredictiveAnalyticsProps) {
  const { organization, hasFeature } = useSupabaseAuth()
  const [insights, setInsights] = useState<PredictiveInsight[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeframe, setTimeframe] = useState<'30d' | '90d' | '6m'>('90d')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Check if user has access to predictive analytics
  const hasPredictiveAnalytics = hasFeature('predictiveAnalytics') ||
    organization?.subscription_tier === 'enterprise'

  const generateInsights = async () => {
    if (!hasPredictiveAnalytics) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/predictive-analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe,
          organizationId: organization?.id
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate predictive insights')
      }

      const data = await response.json()
      setInsights(data.insights)
      setLastUpdated(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to generate predictive analytics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (hasPredictiveAnalytics) {
      generateInsights()
    }
  }, [timeframe, hasPredictiveAnalytics])

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      default:
        return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue':
        return <DollarSign className="h-4 w-4" />
      case 'inventory':
        return <Package className="h-4 w-4" />
      case 'customer':
        return <Users className="h-4 w-4" />
      case 'trend':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    }
    if (unit === 'percentage') {
      return `${value.toFixed(1)}%`
    }
    return value.toLocaleString()
  }

  if (!hasPredictiveAnalytics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Predictive Analytics
          </CardTitle>
          <CardDescription>
            AI-powered business predictions and insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Brain className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Predictive Analytics Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Enterprise to access AI-powered predictive analytics.
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
              Predictive Analytics
              <Badge variant="secondary" className="ml-2">Enterprise AI</Badge>
            </CardTitle>
            <CardDescription>
              AI-powered predictions for business planning and decision making
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={generateInsights}
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
            <label className="text-sm font-medium mb-2 block">Prediction Timeframe</label>
            <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">Next 30 days</SelectItem>
                <SelectItem value="90d">Next 90 days</SelectItem>
                <SelectItem value="6m">Next 6 months</SelectItem>
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
              Analyzing historical data and generating predictions...
            </p>
          </div>
        )}

        {/* Insights */}
        {!loading && insights.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Predictive Insights ({insights.length})</h3>

            {insights.map((insight) => (
              <Card key={insight.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {getTypeIcon(insight.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>

                      {/* Prediction */}
                      <div className="flex items-center gap-4 mb-3">
                        <div>
                          <div className="text-sm font-medium">Prediction</div>
                          <div className="text-lg font-bold text-primary">
                            {formatValue(insight.prediction.value, insight.prediction.unit)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {insight.prediction.timeframe}
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium">Confidence</div>
                          <div className="text-lg font-bold">
                            {insight.confidence}%
                          </div>
                          <Progress value={insight.confidence} className="h-2 w-16 mt-1" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Badge className={getImpactColor(insight.impact)}>
                    {insight.impact.toUpperCase()} IMPACT
                  </Badge>
                </div>

                {/* Recommendations */}
                <div className="mb-4">
                  <div className="text-sm font-medium mb-2">Recommendations:</div>
                  <ul className="space-y-1">
                    {insight.recommendations.map((rec, index) => (
                      <li key={index} className="text-sm flex items-start gap-2">
                        <Target className="h-3 w-3 mt-0.5 text-primary flex-shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Data Visualization */}
                {insight.data && (
                  <div className="border-t pt-4">
                    <div className="text-sm font-medium mb-2">Supporting Data:</div>
                    {insight.type === 'revenue' && insight.data.trend && (
                      <div className="flex items-center gap-2 text-sm">
                        {insight.data.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span>
                          Revenue trend: {insight.data.trend === 'up' ? 'Increasing' : 'Decreasing'}
                          ({insight.data.change}%)
                        </span>
                      </div>
                    )}

                    {insight.type === 'inventory' && insight.data.lowStock && (
                      <div className="text-sm">
                        <span className="font-medium">{insight.data.lowStock}</span> products at risk of stockout
                      </div>
                    )}

                    {insight.type === 'customer' && insight.data.segment && (
                      <div className="text-sm">
                        Primary customer segment: <span className="font-medium">{insight.data.segment}</span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && insights.length === 0 && !error && (
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">No Predictive Insights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We need more historical data to generate accurate predictions.
            </p>
            <Button variant="outline" onClick={generateInsights}>
              Try Again
            </Button>
          </div>
        )}

        {/* AI Model Info */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center mb-2">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            <span className="text-sm font-medium">Enterprise AI Model</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Using advanced machine learning algorithms including time series analysis,
            regression modeling, and pattern recognition for accurate business predictions.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}