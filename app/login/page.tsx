"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"

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
  const { login, user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [showCredentials, setShowCredentials] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) {
      router.push("/welcome")
    }
  }, [user, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await login(email, password)
      toast({
        title: "Login Successful",
        description: "You are successfully logged in.",
        variant: "default",
      })
      router.push("/welcome")
    } catch (err) {
      setError("Invalid credentials. Please try again.")
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      })
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
        await login(account.email, account.password)
        toast({
          title: "Login Successful",
          description: `Logged in as ${role}.`,
          variant: "default",
        })
        router.push("/welcome")
      }
    } catch (err) {
      setError("Quick access login failed.")
      toast({
        title: "Login Failed",
        description: "Quick access login failed.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
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
                  <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm">{error}</div>
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
                    <Button variant="link" className="px-0 text-xs" type="button">
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
