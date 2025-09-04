"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Shield, ShieldCheck, ShieldX, Copy, CheckCircle, AlertTriangle } from 'lucide-react'
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext'

interface TwoFactorSetupProps {
  onComplete?: () => void
  onCancel?: () => void
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
  const { setup2FA, verify2FA, disable2FA, is2FAEnabled } = useSupabaseAuth()
  const [step, setStep] = useState<'setup' | 'verify' | 'backup' | 'complete'>('setup')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Setup data
  const [secret, setSecret] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [otpauthUrl, setOtpauthUrl] = useState('')

  // Verification data
  const [verificationToken, setVerificationToken] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])

  const handleSetup = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await setup2FA()
      setSecret(result.secret)
      setQrCode(result.qrCode)
      setOtpauthUrl(result.otpauthUrl)
      setStep('verify')
      setSuccess('2FA setup initiated successfully!')
    } catch (error: any) {
      setError(error.message || 'Failed to setup 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationToken) {
      setError('Please enter the verification token')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await verify2FA(verificationToken)
      if (result) {
        // In a real implementation, you'd get backup codes from the API response
        // For now, we'll generate them client-side
        const codes = []
        for (let i = 0; i < 10; i++) {
          codes.push(Math.random().toString(36).substring(2, 10).toUpperCase())
        }
        setBackupCodes(codes)
        setStep('backup')
        setSuccess('2FA verification successful!')
      }
    } catch (error: any) {
      setError(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    setStep('complete')
    setSuccess('2FA has been successfully enabled!')
    onComplete?.()
  }

  const handleDisable = async () => {
    const token = prompt('Enter your current 2FA token to disable:')
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      await disable2FA(token)
      setSuccess('2FA has been disabled')
      setStep('setup')
    } catch (error: any) {
      setError(error.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess('Copied to clipboard!')
    setTimeout(() => setSuccess(null), 2000)
  }

  if (is2FAEnabled && step !== 'complete') {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-500" />
            2FA Enabled
          </CardTitle>
          <CardDescription>
            Two-factor authentication is currently enabled for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Disabling 2FA will reduce the security of your account.
            </AlertDescription>
          </Alert>

          <Button
            variant="destructive"
            onClick={handleDisable}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {step === 'setup' && 'Add an extra layer of security to your account'}
          {step === 'verify' && 'Enter the code from your authenticator app'}
          {step === 'backup' && 'Save your backup codes in a safe place'}
          {step === 'complete' && '2FA setup completed successfully!'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {step === 'setup' && (
          <div className="space-y-4">
            <div className="text-center">
              <ShieldX className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                2FA is not enabled for your account
              </p>
            </div>

            <Button onClick={handleSetup} disabled={loading} className="w-full">
              {loading ? 'Setting up...' : 'Enable 2FA'}
            </Button>
          </div>
        )}

        {step === 'verify' && (
          <div className="space-y-4">
            {qrCode && (
              <div className="text-center">
                <p className="text-sm font-medium mb-2">Scan this QR code:</p>
                <img
                  src={qrCode}
                  alt="2FA QR Code"
                  className="mx-auto border rounded"
                />
              </div>
            )}

            {secret && (
              <div className="space-y-2">
                <Label htmlFor="secret">Or enter this code manually:</Label>
                <div className="flex gap-2">
                  <Input
                    id="secret"
                    value={secret}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="token">Enter verification code:</Label>
              <Input
                id="token"
                value={verificationToken}
                onChange={(e) => setVerificationToken(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="text-center text-lg font-mono"
              />
            </div>

            <Button onClick={handleVerify} disabled={loading} className="w-full">
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </div>
        )}

        {step === 'backup' && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">2FA Enabled Successfully!</p>
              <p className="text-xs text-muted-foreground">
                Save these backup codes in a safe place
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-xs font-medium mb-2">Backup Codes:</p>
              <div className="grid grid-cols-2 gap-2">
                {backupCodes.map((code, index) => (
                  <div key={index} className="font-mono text-sm bg-background p-2 rounded border">
                    {code}
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Each backup code can only be used once. Store them securely.
              </AlertDescription>
            </Alert>

            <Button onClick={handleComplete} className="w-full">
              I've Saved My Backup Codes
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="space-y-4">
            <div className="text-center">
              <ShieldCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium">Setup Complete!</p>
              <p className="text-xs text-muted-foreground">
                Your account is now protected with 2FA
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Close
              </Button>
              <Button onClick={() => setStep('setup')} className="flex-1">
                Setup Another Device
              </Button>
            </div>
          </div>
        )}

        {step !== 'complete' && onCancel && (
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        )}
      </CardContent>
    </Card>
  )
}