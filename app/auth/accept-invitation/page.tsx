"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Mail, Building } from 'lucide-react'

interface InvitationData {
  id: string
  email: string
  role: string
  store: {
    id: string
    name: string
    business_name?: string
  }
  invited_by: {
    name: string
    email: string
  }
  expires_at: string
  user_exists: boolean
}

export default function AcceptInvitationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const [invitation, setInvitation] = useState<InvitationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    name: ''
  })

  useEffect(() => {
    console.log('🔗 ACCEPT INVITATION PAGE: useEffect triggered')
    console.log('🔗 ACCEPT INVITATION PAGE: Token from URL:', token)

    if (!token) {
      console.log('🔗 ACCEPT INVITATION PAGE: No token found, setting error')
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    validateInvitation()
  }, [token])

  const validateInvitation = async () => {
    try {
      console.log('🔗 ACCEPT INVITATION PAGE: Starting invitation validation')
      console.log('🔗 ACCEPT INVITATION PAGE: Fetching:', `/api/auth/invitations/${token}`)

      const response = await fetch(`/api/auth/invitations/${token}`)
      console.log('🔗 ACCEPT INVITATION PAGE: Response status:', response.status)

      const data = await response.json()
      console.log('🔗 ACCEPT INVITATION PAGE: Response data:', data)

      if (!response.ok) {
        console.log('🔗 ACCEPT INVITATION PAGE: Response not OK, throwing error')
        throw new Error(data.error || 'Invalid invitation')
      }

      console.log('🔗 ACCEPT INVITATION PAGE: Setting invitation data')
      setInvitation(data.invitation)
    } catch (error: any) {
      console.log('🔗 ACCEPT INVITATION PAGE: Error occurred:', error.message)
      setError(error.message)
    } finally {
      console.log('🔗 ACCEPT INVITATION PAGE: Setting loading to false')
      setLoading(false)
    }
  }

  const handleAcceptInvitation = async (e: React.FormEvent) => {
    e.preventDefault()
    setAccepting(true)
    setError('')

    try {
      // Validate form for new users
      if (!invitation?.user_exists) {
        if (!formData.name) {
          throw new Error('Name is required')
        }
      }

      console.log('🔄 ACCEPT INVITATION: Making POST request to accept invitation')
      console.log('🔄 ACCEPT INVITATION: Token:', token?.substring(0, 10) + '...')
      console.log('🔄 ACCEPT INVITATION: Request body:', { name: formData.name })

      const response = await fetch(`/api/auth/invitations/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      })

      console.log('🔄 ACCEPT INVITATION: Response status:', response.status)
      console.log('🔄 ACCEPT INVITATION: Response data:', await response.clone().json())

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to accept invitation')
      }

      setSuccess(true)

      // Redirect after success
      setTimeout(() => {
        // Since we auto-confirm emails via admin API, always redirect to login
        router.push('/login?message=invitation_accepted')
      }, 2000)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setAccepting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Validating invitation...</p>
        </div>
      </div>
    )
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-700">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/login">
              <Button variant="outline">Go to Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-green-700">Invitation Accepted!</CardTitle>
            <CardDescription>
              Welcome to {invitation?.store.name}! You will be redirected shortly.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join {invitation?.store.name}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {invitation && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Building className="h-5 w-5 text-blue-500 mr-2" />
                <span className="font-medium">{invitation.store.name}</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Role: <span className="capitalize font-medium">{invitation.role}</span>
              </p>
              <p className="text-sm text-gray-600">
                Invited by: {invitation.invited_by.name}
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleAcceptInvitation} className="space-y-4">
            {!invitation?.user_exists && (
              <>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <Alert>
                  <AlertDescription>
                    Your initial login credentials have been sent to your email. You can change your password after logging in.
                  </AlertDescription>
                </Alert>
              </>
            )}

            {invitation?.user_exists && (
              <Alert>
                <AlertDescription>
                  An account with this email already exists. Accepting this invitation will add you to the store.
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={accepting}
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Accepting...
                </>
              ) : (
                'Accept Invitation'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}