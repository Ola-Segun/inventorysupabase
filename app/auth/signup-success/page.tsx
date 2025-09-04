"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Package, CheckCircle, Mail, ArrowLeft } from "lucide-react"

export default function SignupSuccessPage() {
  const router = useRouter()
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const userEmail = searchParams.get('email') || 'your email'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Account Created!</CardTitle>
          <CardDescription>
            Your account has been created successfully.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              <strong>Check your email!</strong> We've sent a confirmation link to <strong>{userEmail}</strong>.
              Please click the link to activate your account before logging in.
            </AlertDescription>
          </Alert>

          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>What happens next?</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the confirmation link</li>
              <li>Complete your store setup</li>
              <li>Start using InventoryPro!</li>
            </ol>
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <Button onClick={() => router.push('/login')} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/test-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail })
                  })
                  const data = await response.json()
                  alert(data.message || data.error)
                } catch (error) {
                  alert('Failed to send test email')
                }
              }}
              className="w-full"
            >
              Test Email Sending
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  const response = await fetch('/api/auth/confirm-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: userEmail })
                  })
                  const data = await response.json()
                  if (response.ok) {
                    alert('Email confirmed successfully! You can now login.')
                    router.push('/login')
                  } else {
                    alert(data.error || 'Failed to confirm email')
                  }
                } catch (error) {
                  alert('Failed to confirm email')
                }
              }}
              className="w-full"
            >
              Manually Confirm Email (Dev Only)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}