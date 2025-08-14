"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Info, Loader } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
// import { useAuth } from "@/hooks/useAuth"
import { useAuth } from "@/contexts/AuthContext"

const EXAMPLE_ACCOUNTS = [
  { email: "admin@example.com", password: "password", role: "admin", label: "Admin Dashboard" },
  { email: "manager@example.com", password: "password", role: "manager", label: "Manager Dashboard" },
  { email: "cashier@example.com", password: "password", role: "cashier", label: "Cashier Interface" },
  { email: "seller@example.com", password: "password", role: "seller", label: "Seller Dashboard" },
]

interface FormData {
  name: string
  email: string
  password: string
  password_confirmation?: string
}

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [showCredentials, setShowCredentials] = useState(false)
  const router = useRouter()
  const { login, register,  user } = useAuth()
  const { toast } = useToast()

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })

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

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {    
    e.preventDefault()
    setLoading(true)
    setError("")

    if (isLogin) {
      try {
        await login(formData.email, formData.password)
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
        console.log("Login error:");
      } finally {
        setLoading(false)
      }
      // handleLogin(event) 
    } else {
      try {
        if (formData.password !== formData.password_confirmation) {
          setError("Passwords do not match.")
          return
        }
        await register(
          formData.name!,
          formData.email,
          formData.password,
          formData.password_confirmation!
        )
        toast({
          title: "Registration Successful",
          description: "You are successfully registered.",
          variant: "default",
        })
        router.push("/welcome")
      } catch (error) {
        console.log("Registration error:", error);
        setError("Registration failed. Please try again.")
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "An unexpected error occurred.",
          variant: "destructive",
        })
        return
      } finally {
        setLoading(false)
      } 
    }

    // try {
    //   if (isLogin) {
    //     console.log("Login attempt:", formData.email)
    //     setTimeout(() => {
    //       setLoading(false)
    //     }, 1000)
    //   } else {
    //     if (formData.password !== formData.password_confirmation) {
    //       setError("Passwords do not match.")
    //       return
    //     }
    //     console.log("Registration attempt:", formData)
    //     setTimeout(() => {
    //       setLoading(false)
    //       setIsLogin(true)
    //     }, 1000)
    //   }
    // } catch (err) {
    //   setError("An error occurred. Please try again.")
    // } finally {
    //   setLoading(false)
    // }
  }

  const handleToggleMode = () => {
    setIsTransitioning(true)
    setError("")
    setShowCredentials(false)

    const newRotation = isLogin ? -90 : 0
    setRotation(newRotation)

    // After animation completes, toggle the mode
    setTimeout(() => {
      setIsLogin(!isLogin)
      setIsTransitioning(false)
    }, 600)
  }

  return (
    <div className="grid grid-cols-2 min-h-screen items-center justify-items-center w-full bg-gray-100 dark:bg-gray-900" style={{ gridTemplateColumns: "1fr 2fr" }}>
      
      <div className="h-full w-full grid grid-rows-2 items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 justify-between" style={{ gridTemplateRows: "1fr 15fr", justifyContent: "center" }}>
          <div className="text-3xl font-bold text-center mb-4 self-start h-fit" style={{ justifySelf: "flex-start" }}>
            <div className="cube-container">
              <div className="cube" style={{ transform: `rotateX(${rotation}deg)` }}>
                <div className="cube-face cube-front">Signin</div>
                <div className="cube-face cube-back">3</div>
                <div className="cube-face cube-top">SignUp</div>
                <div className="cube-face cube-bottom">4</div>
                <div className="cube-face cube-left"></div>
                <div className="cube-face cube-right"></div>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
              <div className="flex justify-center mb-2">
                <Package className="h-48 w-48 text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-center mb-4">Welcome to Inventory POS System</h1>
              <p className="text-center text-gray-600 dark:text-gray-400">
                {isLogin ? "Please log in to continue." : "Create an account to get started."}
              </p>
          </div>
      </div>

      <div className="flex items-center justify-center h-full w-full border-l border-gray-300 dark:border-gray-700 bg">        
        <div className="w-full flex items-center justify-center p-8">
          <Card className="w-full max-w-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
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
                  <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
                    <div
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        maxHeight: error ? '100px' : '0px',
                        opacity: error ? 1 : 0
                      }}
                    >
                      {error && (
                        <div className="p-3 bg-red-100 border border-red-200 text-red-600 rounded-md text-sm mb-4">{error}</div>
                      )}
                    </div>
                    
                    <div 
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        maxHeight: !isLogin ? '100px' : '0px',
                        opacity: !isLogin ? 1 : 0,
                        marginBottom: !isLogin ? '16px' : '0px'
                      }}
                    >
                      {!isLogin && (
                        <div className="space-y-2">
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            type="text"
                            placeholder="Your Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            autoComplete="name"
                            required={!isLogin}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        autoComplete="email"
                        required={true}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                          {!isLogin ? null : (
                            <Button variant="link" className="px-0 text-xs" type="button">
                              Forgot password?
                            </Button>
                          )}
                      </div>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Your Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        autoComplete="current-password"
                        required={true}
                      />
                    </div>

                    <div 
                      className="transition-all duration-300 ease-in-out overflow-hidden"
                      style={{
                        maxHeight: !isLogin ? '100px' : '0px',
                        opacity: !isLogin ? 1 : 0,
                        marginBottom: !isLogin ? '16px' : '0px'
                      }}
                    >
                      {!isLogin && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="confirm_password">Confirm Password</Label>
                          </div>
                          <Input
                            id="confirm_password"
                            type="password"
                            placeholder="Confirm Your Password"
                            value={formData.password_confirmation}
                            onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                            autoComplete="current-password"
                            required={!isLogin}
                          />
                        </div>
                      )}
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
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || isTransitioning}
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin mr-2" />
                          Please wait...
                        </>
                      ) : !isLogin ? (
                        "Register"
                      ) : (
                        "Login"
                      )}
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

                      <div 
                        className="transition-all duration-300 ease-in-out overflow-hidden"
                        style={{
                          maxHeight: showCredentials ? '200px' : '0px',
                          opacity: showCredentials ? 1 : 0
                        }}
                      >
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
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="quick" className="space-y-4 mt-4">
                  <div className="grid gap-4">
                    {EXAMPLE_ACCOUNTS.map((account) => (
                      <Button
                        key={account.role}
                        onClick={() => handleQuickAccess(account.role)}
                        className="w-full"
                        disabled={loading}
                      >
                        {loading ? "Please wait..." : account.label}
                      </Button>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="text-sm text-center text-muted-foreground">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <Button 
                  variant="link" 
                  className="px-1 text-sm" 
                  onClick={handleToggleMode}
                  disabled={isTransitioning}
                >
                  {!isLogin ? "Login" : "Signup"}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      <style jsx>{`
        .cube-container {
          perspective: 1000px;
          display: inline-block;
        }

        .cube {
          position: relative;
          width: 120px;
          height: 40px;
          transform-style: preserve-3d;
          transition: transform 0.6s ease-in-out;
        }


        .cube-face {
          position: absolute;
          width: 120px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.875rem;
          font-weight: bold;
          color: #1f2937;
          background: #fff;
          border: 1px solid #e1e5ecff;
        }

        .cube-front {
          transform: rotateX(0deg) translateZ(20px);
          border-radius: 8px;
        }

        .cube-back {
          transform: rotateX(180deg) translateZ(20px);
          border-radius: 8px;
        }

        .cube-top {
          transform: rotateX(90deg) translateZ(20px);
          background: #fff;
          border-radius: 8px;
        }

        .cube-bottom {
          transform: rotateX(-90deg) translateZ(20px);
          background: linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%);
        }

        .cube-left {
          transform: rotateY(-90deg) translateZ(60px);
          width: 40px;
          background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
        }

        .cube-right {
          transform: rotateY(90deg) translateZ(60px);
          width: 40px;
          background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%);
        }


        /* Dark mode styles */
        .dark .cube-face {
          color: #f9fafb;
          background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
          border-color: #6b7280;
        }

        .dark .cube-top,
        .dark .cube-bottom {
          background: linear-gradient(135deg, #4b5563 0%, #6b7280 100%);
        }

        .dark .cube-left,
        .dark .cube-right {
          background: linear-gradient(135deg, #6b7280 0%, #9ca3af 100%);
        }
      `}</style>
    </div>
  )
}
