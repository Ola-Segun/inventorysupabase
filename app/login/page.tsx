"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"
import { getCSRFToken } from "@/lib/auth/csrf"

// Example accounts removed for security - use environment variables or database for demo accounts

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const { signIn, resetPassword, user, isAuthenticated, isLoading } = useSupabaseAuth()
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [resetError, setResetError] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("")
  const { toast } = useToast()

  // Redirect logic moved to client-layout.tsx to prevent race conditions
  // This page no longer handles redirects directly

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    console.log("🔑 LoginPage: Starting login process for email:", email)

    try {
      console.log("🔑 LoginPage: Getting CSRF token...")

      // Get CSRF token with error handling
      let csrfToken = null
      try {
        csrfToken = await getCSRFToken()
        console.log("🔑 LoginPage: CSRF token obtained")
      } catch (csrfError) {
        console.warn("🔑 LoginPage: Failed to get CSRF token, proceeding without:", csrfError)
        // Continue without CSRF token for now to test login
      }

  console.log("🔑 LoginPage: Calling auth context signIn...")

  // Use the Supabase auth context signIn helper which calls the server
  // login API and ensures the Supabase client session is set.
  await signIn(email, password)

  console.log("🔑 LoginPage: signIn completed successfully")

      // Get the redirect URL from the query parameters
      const params = new URLSearchParams(window.location.search);
      const from = params.get('from');

      console.log("🔑 LoginPage: Extracted redirect params:", { from })

      // Clear any error params from the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);

      // Show success message
      toast({
        title: "Login Successful",
        description: "You are successfully logged in.",
        variant: "default",
      })

      console.log("🔑 LoginPage: Login successful, navigating to dashboard via router")

      // Navigate client-side to preserve auth state and avoid reload races
      setTimeout(() => {
        router.replace('/dashboard')
      }, 300)
    } catch (err: any) {
      console.log("🔑 LoginPage: Login failed with error:", err.message)
      // Check if it's an email confirmation error
      if (err.message?.includes('Email not confirmed') || err.message?.includes('email_not_confirmed')) {
        setEmailNotConfirmed(true)
        setUnconfirmedEmail(email)
        setError("Email not confirmed. Please check your email and click the confirmation link, or resend the confirmation email.")
        toast({
          title: "Email Confirmation Required",
          description: "Please check your email and click the confirmation link.",
          variant: "destructive",
        })
      } else {
        setError(err.message || "Invalid credentials. Please try again.")
        toast({
          title: "Login Failed",
          description: err.message || "Invalid credentials. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      console.log("🔑 LoginPage: Setting loading to false")
      setLoading(false)
    }
  }

  // Quick access functionality removed for security reasons

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError("")

    try {
      // Get CSRF token
      const csrfToken = await getCSRFToken()

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-csrf-token': csrfToken,
        },
        body: JSON.stringify({ email: resetEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions.",
        variant: "default",
      })
      setShowForgotPassword(false)
      setResetEmail("")
    } catch (err: any) {
      setResetError(err.message || "Failed to send reset email")
      toast({
        title: "Error",
        description: err.message || "Failed to send reset email",
        variant: "destructive",
      })
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Inventory POS System</CardTitle>
          <CardDescription>Enter your credentials or use quick access</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-1">
              <TabsTrigger value="login">Login</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4 mt-4">
                {error && (
                  <Alert className="mb-4" variant={emailNotConfirmed ? "default" : "destructive"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                      {emailNotConfirmed && (
                        <div className="mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/auth/confirm-email', {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ email: unconfirmedEmail }),
                                })

                                if (response.ok) {
                                  toast({
                                    title: "Confirmation Email Sent",
                                    description: "Please check your email for the confirmation link.",
                                    variant: "default",
                                  })
                                } else {
                                  throw new Error('Failed to resend confirmation email')
                                }
                              } catch (err: any) {
                                toast({
                                  title: "Error",
                                  description: "Failed to resend confirmation email",
                                  variant: "destructive",
                                })
                              }
                            }}
                            className="ml-2"
                          >
                            Resend Confirmation
                          </Button>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button
                      variant="link"
                      className="px-0 text-xs"
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me for 30 days
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>

              </form>
            </TabsContent>
          </Tabs>

          {/* Forgot Password Form */}
          {showForgotPassword && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
              <h3 className="text-lg font-medium mb-2">Reset Password</h3>
              {resetError && (
                <Alert className="mb-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{resetError}</AlertDescription>
                </Alert>
              )}
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input
                    id="resetEmail"
                    type="email"
                    placeholder="Enter your email address"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={resetLoading} className="flex-1">
                    {resetLoading ? "Sending..." : "Send Reset Email"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForgotPassword(false)
                      setResetEmail("")
                      setResetError("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="px-1 text-sm">
              Sign up
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
