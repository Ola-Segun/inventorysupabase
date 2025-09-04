"use client"

import React, { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  X,
  Loader2,
  TrendingUp,
  Package,
  AlertTriangle
} from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  suggestions?: string[]
  data?: any
}

interface AIChatbotProps {
  isOpen: boolean
  onToggle: () => void
  className?: string
}

export default function AIChatbot({ isOpen, onToggle, className }: AIChatbotProps) {
  const { userProfile, organization, hasFeature } = useSupabaseAuth()
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `Hello! I'm your AI business assistant. I can help you with inventory insights, sales analysis, and business recommendations. What would you like to know?`,
      role: 'assistant',
      timestamp: new Date(),
      suggestions: [
        "Show me low stock items",
        "Analyze sales trends",
        "Recommend reorder quantities",
        "Generate inventory report"
      ]
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Check if user has access to AI chatbot
  const hasAIChatbot = hasFeature('aiChatbot') || 
    (organization?.subscription_tier === 'pro' && hasFeature('aiFeatures')) ||
    organization?.subscription_tier === 'enterprise'

  const sendMessage = async (messageContent: string) => {
    if (!messageContent.trim() || isLoading || !hasAIChatbot) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Call AI API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          organizationId: organization?.id,
          context: 'inventory_management'
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get AI response')
      }

      const data = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.message,
        role: 'assistant',
        timestamp: new Date(),
        suggestions: data.suggestions,
        data: data.data
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50"
        size="icon"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    )
  }

  if (!hasAIChatbot) {
    return (
      <Card className={`fixed bottom-4 right-4 w-80 shadow-lg z-50 ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center">
            <Bot className="h-4 w-4 mr-2" />
            AI Assistant
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">AI Assistant Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upgrade to Pro or Enterprise to access the AI chatbot feature.
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
    <Card className={`fixed bottom-4 right-4 w-80 shadow-lg z-50 ${isMinimized ? 'h-14' : 'h-96'} transition-all duration-200 ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <Bot className="h-4 w-4 mr-2" />
          AI Assistant
          {organization?.subscription_tier === 'enterprise' && (
            <Badge variant="secondary" className="ml-2 text-xs">Enterprise</Badge>
          )}
        </CardTitle>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <CardContent className="flex flex-col h-80">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`mx-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                      <div
                        className={`rounded-lg px-3 py-2 text-sm ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {message.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                      
                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6 mr-1"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}

                      {/* Data visualization for specific responses */}
                      {message.data && (
                        <div className="mt-2 p-2 bg-background rounded border">
                          {message.data.type === 'low_stock' && (
                            <div className="space-y-1">
                              <div className="flex items-center text-xs font-medium text-orange-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Low Stock Alert
                              </div>
                              {message.data.items?.map((item: any, idx: number) => (
                                <div key={idx} className="text-xs flex justify-between">
                                  <span>{item.name}</span>
                                  <span className="text-orange-600">{item.stock} left</span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {message.data.type === 'sales_trend' && (
                            <div className="space-y-1">
                              <div className="flex items-center text-xs font-medium text-green-600">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                Sales Trend
                              </div>
                              <div className="text-xs">
                                <div>This week: ${message.data.thisWeek}</div>
                                <div>Last week: ${message.data.lastWeek}</div>
                                <div className={`${message.data.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  Change: {message.data.change > 0 ? '+' : ''}{message.data.change}%
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="mx-2">
                      <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <form onSubmit={handleSubmit} className="flex space-x-2 mt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about your inventory..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      )}
    </Card>
  )
}