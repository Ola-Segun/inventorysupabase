"use client"

import React, { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { useSupabaseAuth } from "@/contexts/SupabaseAuthContext"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useSupabaseAuth()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // Get tokens from URL
  const accessToken = searchParams?.get('access_token')
  const refreshToken = searchParams?.get('refresh_token')
  const type = searchParams?.get('type')

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      console.log('🔍 Confirm Email Page: Starting confirmation process')

      // Check for error parameters first
      const errorParam = searchParams?.get('error')
      const errorDescription = searchParams?.get('error_description')

      if (errorParam) {
        console.log('❌ Confirm Email Page: Error from URL:', errorDescription)
        setError(errorDescription || "Email confirmation failed")
        setLoading(false)
        return
      }

      // If we have tokens, try to confirm manually
      if (accessToken && refreshToken) {
        console.log('🔄 Confirm Email Page: Found tokens, attempting manual confirmation')
        try {
          // Call our API to confirm the email
          const response = await fetch('/api/auth/confirm-email', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user?.email || searchParams?.get('email') || ''
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Confirmation failed')
          }

          console.log('✅ Confirm Email Page: Manual confirmation successful')
          setSuccess(true)
          setLoading(false)

          // Redirect to setup page after successful confirmation
          setTimeout(() => {
            router.push('/setup')
          }, 3000)
          return
        } catch (err: any) {
          console.error('❌ Confirm Email Page: Manual confirmation failed:', err)
          setError(err.message || 'Email confirmation failed')
          setLoading(false)
          return
        }
      }

      // If we have a user, email is confirmed
      if (user) {
        console.log('✅ Confirm Email Page: User already authenticated')
        setSuccess(true)
        setLoading(false)

        // Redirect to setup page after successful confirmation
        setTimeout(() => {
          router.push('/setup')
        }, 3000)
        return
      }

      // If no user and no tokens, wait a bit for auth state to update
      console.log('⏳ Confirm Email Page: Waiting for auth state update')
      setTimeout(() => {
        if (!user) {
          console.log('❌ Confirm Email Page: No user found after waiting')
          setError("Email confirmation may have failed. Please try logging in.")
        } else {
          console.log('✅ Confirm Email Page: User found after waiting')
          setSuccess(true)
        }
        setLoading(false)
      }, 3000)
    }

    handleEmailConfirmation()
  }, [searchParams, user, router, accessToken, refreshToken])

  const handleResendConfirmation = async () => {
    try {
      console.log('🔄 Confirm Email Page: Resending confirmation email')
      const response = await fetch('/api/auth/confirm-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user?.email || searchParams?.get('email') || ''
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend confirmation email')
      }

      console.log('✅ Confirm Email Page: Confirmation email resent')
      alert("Confirmation email has been resent. Please check your inbox.")
    } catch (err: any) {
      console.error('❌ Confirm Email Page: Failed to resend:', err)
      alert(`Failed to resend confirmation email: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Confirming Your Email</CardTitle>
            <CardDescription>
              Please wait while we confirm your email address...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">Email Confirmed!</CardTitle>
            <CardDescription>
              Your email has been successfully confirmed. You will be redirected to complete your setup.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-sm text-muted-foreground">
              Redirecting in 3 seconds...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertCircle className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">Confirmation Failed</CardTitle>
          <CardDescription>
            There was an issue confirming your email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">This could happen if:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>The confirmation link has expired</li>
                <li>The link was already used</li>
                <li>There was an issue with the confirmation process</li>
              </ul>
            </div>

            <div className="flex flex-col space-y-2">
              <Button onClick={handleResendConfirmation} className="w-full">
                Resend Confirmation Email
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/login')}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}