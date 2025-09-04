"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Info, AlertCircle } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

const EXAMPLE_ACCOUNTS = [
  { email: "admin@example.com", password: "password", role: "admin" },
  { email: "manager@example.com", password: "password", role: "manager" },
  { email: "cashier@example.com", password: "password", role: "cashier" },
  { email: "seller@example.com", password: "password", role: "seller" },
]

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
  const [showCredentials, setShowCredentials] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("")
  const { toast } = useToast()

  // Redirect logic is now handled by SupabaseAuthContext
  // This prevents conflicts between multiple redirect mechanisms

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await signIn(email, password)

      toast({
        title: "Login Successful",
        description: "You are successfully logged in.",
        variant: "default",
      })

      // Redirect will be handled automatically by the useEffect when user state updates
    } catch (err: any) {

      // Check if it's an email confirmation error
      if (err.message?.includes('Email not confirmed')) {
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
      setLoading(false)
    }
  }

  const handleQuickAccess = async (role: string) => {
    setLoading(true)
    setError("")
    try {
      const account = EXAMPLE_ACCOUNTS.find((acc) => acc.role === role)
      if (account) {
        await signIn(account.email, account.password)

        toast({
          title: "Login Successful",
          description: `Logged in as ${role}.`,
          variant: "default",
        })

        // Redirect will be handled automatically by the useEffect when user state updates
      }
    } catch (err: any) {
      setError(err.message || "Quick access login failed.")
      toast({
        title: "Login Failed",
        description: err.message || "Quick access login failed.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError("")

    try {
      await resetPassword(resetEmail)

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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="quick">Quick Access</TabsTrigger>
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

                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center justify-center"
                    onClick={() => setShowCredentials(!showCredentials)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {showCredentials ? "Hide Example Credentials" : "Show Example Credentials"}
                  </Button>

                  {showCredentials && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-100 rounded-md text-sm">
                      <p className="font-medium mb-1">Example Accounts:</p>
                      <ul className="space-y-1">
                        {EXAMPLE_ACCOUNTS.map((account) => (
                          <li key={account.email}>
                            <strong>{account.role}:</strong> {account.email} / {account.password}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </form>
            </TabsContent>
            <TabsContent value="quick" className="space-y-4 mt-4">
              <div className="grid gap-4">
                <Button onClick={() => handleQuickAccess("admin")} className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Admin Dashboard"}
                </Button>
                <Button onClick={() => handleQuickAccess("manager")} className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Manager Dashboard"}
                </Button>
                <Button onClick={() => handleQuickAccess("cashier")} className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Cashier Interface"}
                </Button>
                <Button onClick={() => handleQuickAccess("seller")} className="w-full" disabled={loading}>
                  {loading ? "Please wait..." : "Seller Dashboard"}
                </Button>
              </div>
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
