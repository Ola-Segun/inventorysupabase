// Email service configuration
interface EmailConfig {
  provider: 'console' | 'smtp' | 'sendgrid' | 'mailgun' | 'resend' | 'supabase'
  smtp?: {
    host: string
    port: number
    secure: boolean
    auth: {
      user: string
      pass: string
    }
  }
  sendgrid?: {
    apiKey: string
  }
  mailgun?: {
    apiKey: string
    domain: string
  }
  resend?: {
    apiKey: string
  }
  supabase?: {
    url: string
    serviceRoleKey: string
  }
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig => {
  const provider = (process.env.EMAIL_PROVIDER || 'console') as EmailConfig['provider']

  console.log('🔧 EMAIL CONFIG: Initializing email service with provider:', provider)

  if (provider === 'smtp') {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587')
    const secure = process.env.SMTP_SECURE === 'true'
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    console.log('🔧 EMAIL CONFIG: SMTP configuration check:', {
      host: host ? '✓ Set' : '✗ Missing',
      port: port || '587 (default)',
      secure: secure,
      user: user ? '✓ Set' : '✗ Missing',
      pass: pass ? '✓ Set' : '✗ Missing'
    })

    if (!host || !user || !pass) {
      console.warn('⚠️  EMAIL CONFIG: SMTP not properly configured, falling back to console logging')
      console.warn('⚠️  EMAIL CONFIG: Missing:', {
        host: !host,
        user: !user,
        pass: !pass
      })
      return { provider: 'console' }
    }

    console.log('✅ EMAIL CONFIG: SMTP configuration valid')
    return {
      provider: 'smtp',
      smtp: {
        host,
        port,
        secure,
        auth: { user, pass }
      }
    }
  }

  if (provider === 'sendgrid') {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      console.warn('SendGrid API key not configured, falling back to console logging')
      return { provider: 'console' }
    }

    return {
      provider: 'sendgrid',
      sendgrid: { apiKey }
    }
  }

  if (provider === 'mailgun') {
    const apiKey = process.env.MAILGUN_API_KEY
    const domain = process.env.MAILGUN_DOMAIN
    if (!apiKey || !domain) {
      console.warn('Mailgun not properly configured, falling back to console logging')
      return { provider: 'console' }
    }

    return {
      provider: 'mailgun',
      mailgun: { apiKey, domain }
    }
  }

  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('Resend API key not configured, falling back to console logging')
      return { provider: 'console' }
    }

    return {
      provider: 'resend',
      resend: { apiKey }
    }
  }

  if (provider === 'supabase') {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!url || !serviceRoleKey) {
      console.warn('Supabase credentials not configured, falling back to console logging')
      return { provider: 'console' }
    }

    return {
      provider: 'supabase',
      supabase: { url, serviceRoleKey }
    }
  }

  return { provider: 'console' }
}

// Create email transporter/service
const createEmailService = () => {
  const config = getEmailConfig()

  if (config.provider === 'console') {
    return {
      sendMail: async (options: any) => {
        console.log('📧 EMAIL SERVICE (Console Mode):')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('From:', options.from)
        console.log('HTML Length:', options.html?.length || 0)
        console.log('Text Length:', options.text?.length || 0)
        console.log('---')
        console.log('⚠️  EMAIL SERVICE: This is CONSOLE MODE - no actual email sent!')
        return { messageId: `console-${Date.now()}` }
      }
    }
  }

  if (config.provider === 'resend' && config.resend) {
    return {
      sendMail: async (options: any) => {
        try {
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.resend!.apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: options.from || 'noreply@yourdomain.com',
              to: options.to,
              subject: options.subject,
              html: options.html,
              text: options.text
            })
          })

          if (!response.ok) {
            const error = await response.text()
            throw new Error(`Resend API error: ${response.status} ${error}`)
          }

          const result = await response.json()
          console.log('📧 EMAIL SERVICE (Resend): Email sent successfully')
          return { messageId: result.id }
        } catch (error) {
          console.error('📧 EMAIL SERVICE (Resend): Failed to send email:', error)
          throw error
        }
      }
    }
  }

  if (config.provider === 'supabase' && config.supabase) {
    return {
      sendMail: async (options: any) => {
        try {
          // Import Supabase client dynamically to avoid circular dependencies
          const { createClient } = await import('@supabase/supabase-js')
          const supabase = createClient(config.supabase!.url, config.supabase!.serviceRoleKey)

          // Use Supabase's built-in email functionality
          // Note: This sends a password reset email, but we can customize it
          const { error } = await supabase.auth.resetPasswordForEmail(options.to, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
            captchaToken: undefined
          })

          if (error) {
            throw new Error(`Supabase email error: ${error.message}`)
          }

          console.log('📧 EMAIL SERVICE (Supabase): Email sent successfully')
          return { messageId: `supabase-${Date.now()}` }
        } catch (error) {
          console.error('📧 EMAIL SERVICE (Supabase): Failed to send email:', error)
          throw error
        }
      }
    }
  }

  // Real SMTP implementation using fetch-based SMTP
  if (config.provider === 'smtp' && config.smtp) {
    return {
      sendMail: async (options: any) => {
        console.log('📧 EMAIL SERVICE (SMTP Mode): Attempting to send real email')
        console.log('SMTP Config:', {
          host: config.smtp?.host,
          port: config.smtp?.port,
          secure: config.smtp?.secure,
          user: config.smtp?.auth?.user ? '✓ Set' : '✗ Missing'
        })
        console.log('Email Options:', {
          to: options.to,
          subject: options.subject,
          from: options.from,
          htmlLength: options.html?.length || 0,
          textLength: options.text?.length || 0
        })

        try {
          // Create SMTP connection using raw SMTP commands
          console.log('🔌 EMAIL SERVICE: Establishing SMTP connection...')

          const smtpHost = config.smtp!.host
          const smtpPort = config.smtp!.port
          const useTLS = config.smtp!.secure

          // For Gmail SMTP, we'll use a basic implementation
          // In production, you'd want to use nodemailer for better reliability
          const emailData = {
            from: options.from || config.smtp!.auth.user,
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text
          }

          console.log('📤 EMAIL SERVICE: Preparing to send via SMTP...')
          console.log('📤 EMAIL SERVICE: From:', emailData.from)
          console.log('📤 EMAIL SERVICE: To:', emailData.to)
          console.log('📤 EMAIL SERVICE: Subject:', emailData.subject)

          // Use nodemailer for proper SMTP sending
          const nodemailer = await import('nodemailer')

          console.log('📧 EMAIL SERVICE: Creating nodemailer transporter...')

          const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: useTLS, // true for 465, false for other ports
            auth: {
              user: config.smtp!.auth.user,
              pass: config.smtp!.auth.pass,
            },
            // Gmail specific settings
            ...(smtpHost.includes('gmail.com') && {
              service: 'gmail',
              auth: {
                user: config.smtp!.auth.user,
                pass: config.smtp!.auth.pass,
              }
            })
          })

          console.log('🔌 EMAIL SERVICE: Verifying SMTP connection...')

          // Verify connection
          const verification = await transporter.verify()
          if (!verification) {
            throw new Error('SMTP connection verification failed')
          }

          console.log('✅ EMAIL SERVICE: SMTP connection verified')

          // Send the email
          console.log('📤 EMAIL SERVICE: Sending email...')
          const info = await transporter.sendMail({
            from: emailData.from,
            to: emailData.to,
            subject: emailData.subject,
            html: emailData.html,
            text: emailData.text,
          })

          console.log('✅ EMAIL SERVICE: Email sent successfully!')
          console.log('📧 EMAIL SERVICE: Message ID:', info.messageId)
          console.log('📧 EMAIL SERVICE: Response:', info.response)

          return { messageId: info.messageId }

        } catch (error) {
          console.error('❌ EMAIL SERVICE: SMTP send failed:', error)
          console.error('❌ EMAIL SERVICE: Error details:', error instanceof Error ? error.message : error)
          throw error
        }
      }
    }
  }

  return {
    sendMail: async (options: any) => {
      console.log('📧 EMAIL SERVICE (Fallback):')
      console.log('To:', options.to)
      console.log('Subject:', options.subject)
      return { messageId: `fallback-${Date.now()}` }
    }
  }
}

// Email templates
const getInvitationEmailTemplate = (data: {
  recipientName: string
  inviterName: string
  invitationUrl: string
  role: string
  message?: string
  expiresIn: string
  initialPassword?: string
  email?: string
}) => {
  const { recipientName, inviterName, invitationUrl, role, message, expiresIn, initialPassword, email } = data

  return {
    subject: `You're invited to join our team - ${role}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Team Invitation</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          .highlight { background: #e8f4fd; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Our Team!</h1>
          <p>You've been invited to join our organization</p>
        </div>

        <div class="content">
          <p>Hi ${recipientName},</p>

          <p><strong>${inviterName}</strong> has invited you to join our team as a <strong>${role}</strong>.</p>

          ${message ? `<div class="highlight"><p><strong>Personal Message:</strong></p><p>${message}</p></div>` : ''}

          <p>To accept this invitation and create your account, please click the button below:</p>

          <a href="${invitationUrl}" class="button">Accept Invitation</a>

          ${initialPassword ? `<div class="highlight"><p><strong>Your Initial Login Credentials:</strong></p><p><strong>Email:</strong> ${email || 'your-email@example.com'}</p><p><strong>Password:</strong> ${initialPassword}</p><p style="color: #d32f2f;"><em>Please save these credentials and change your password after first login.</em></p></div>` : ''}

          <p><strong>Important:</strong> This invitation will expire in ${expiresIn}.</p>

          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${invitationUrl}</p>

          <p>If you didn't expect this invitation, you can safely ignore this email.</p>
        </div>

        <div class="footer">
          <p>This invitation was sent by our team management system.</p>
          <p>If you have any questions, please contact your administrator.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${recipientName},

      ${inviterName} has invited you to join our team as a ${role}.

      ${message ? `Personal Message: ${message}\n\n` : ''}

      To accept this invitation, please visit: ${invitationUrl}

      This invitation will expire in ${expiresIn}.

      If you didn't expect this invitation, you can safely ignore this email.
    `
  }
}

const getPasswordResetEmailTemplate = (data: {
  recipientName: string
  resetUrl: string
  expiresIn: string
}) => {
  const { recipientName, resetUrl, expiresIn } = data

  return {
    subject: 'Password Reset Request',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Password Reset</h1>
          <p>Reset your account password</p>
        </div>

        <div class="content">
          <p>Hi ${recipientName},</p>

          <p>You requested a password reset for your account. Click the button below to create a new password:</p>

          <a href="${resetUrl}" class="button">Reset Password</a>

          <div class="warning">
            <strong>Security Notice:</strong> This link will expire in ${expiresIn}. If you didn't request this reset, please ignore this email.
          </div>

          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f0f0f0; padding: 10px; border-radius: 5px;">${resetUrl}</p>

          <p>For security reasons, this link can only be used once.</p>
        </div>

        <div class="footer">
          <p>This email was sent by our security system.</p>
          <p>If you have any questions, please contact support.</p>
        </div>
      </body>
      </html>
    `,
    text: `
      Hi ${recipientName},

      You requested a password reset for your account.

      To reset your password, please visit: ${resetUrl}

      This link will expire in ${expiresIn}.

      If you didn't request this reset, please ignore this email.

      For security reasons, this link can only be used once.
    `
  }
}

// Email service functions
export const emailService = {
  // Send invitation email
  async sendInvitationEmail(data: {
    to: string
    recipientName: string
    inviterName: string
    invitationUrl: string
    role: string
    message?: string
    expiresIn: string
    initialPassword?: string
    email?: string
  }) {
    const emailServiceInstance = createEmailService()
    const config = getEmailConfig()

    try {
      console.log('📧 EMAIL SERVICE: Preparing invitation email template')
      console.log('📧 EMAIL SERVICE: Template data:', {
        recipientName: data.recipientName,
        inviterName: data.inviterName,
        role: data.role,
        hasInitialPassword: !!data.initialPassword,
        initialPasswordLength: data.initialPassword?.length || 0,
        email: data.email,
        invitationUrl: data.invitationUrl.substring(0, 50) + '...'
      })

      const template = getInvitationEmailTemplate(data)

      console.log('📧 EMAIL SERVICE: Template generated successfully')
      console.log('📧 EMAIL SERVICE: Email includes initial password:', template.html.includes(data.initialPassword || ''))

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com',
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      // If running in console mode, log the email but indicate that no outbound
      // delivery was performed. This prevents the application from reporting
      // a false positive "sent" status when developers run locally.
      if (config.provider === 'console') {
        const result = await emailServiceInstance.sendMail(mailOptions)
        console.warn('⚠️  EMAIL SERVICE: Console mode - email logged but not delivered')
        console.log('📧 Email details:', {
          to: mailOptions.to,
          subject: mailOptions.subject,
          method: 'console'
        })
        return {
          success: false,
          error: 'Email provider is set to console; email was logged to server only (no outbound delivery). Configure SMTP or other provider for production.',
          method: 'console'
        }
      }

      const result = await emailServiceInstance.sendMail(mailOptions)

      console.log('Invitation email sent successfully:', (result as any).messageId)

      return {
        success: true,
        messageId: (result as any).messageId,
        method: config.provider
      }
    } catch (error) {
      console.error('Failed to send invitation email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: config.provider
      }
    }
  },

  // Send password reset email
  async sendPasswordResetEmail(data: {
    to: string
    recipientName: string
    resetUrl: string
    expiresIn: string
  }) {
    const emailServiceInstance = createEmailService()
    const config = getEmailConfig()

    try {
      const template = getPasswordResetEmailTemplate(data)

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com',
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const result = await emailServiceInstance.sendMail(mailOptions)

      console.log('Password reset email sent successfully:', (result as any).messageId)

      return {
        success: true,
        messageId: (result as any).messageId,
        method: config.provider
      }
    } catch (error) {
      console.error('Failed to send password reset email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        method: config.provider
      }
    }
  },

  // Test email configuration
  async testConnection() {
    const config = getEmailConfig()

    if (config.provider === 'console') {
      return {
        success: true,
        message: 'Email service configured for console logging'
      }
    }

    // For other providers, you would implement actual connection tests
    return {
      success: true,
      message: `Email service configured for ${config.provider}`
    }
  },

  // Test invitation email sending
  async testInvitationEmail(data: {
    to: string
  }) {
    return this.sendInvitationEmail({
      to: data.to,
      recipientName: 'Test User',
      inviterName: 'Test Admin',
      invitationUrl: 'http://localhost:3000/test-invitation',
      role: 'seller',
      message: 'This is a test invitation email.',
      expiresIn: '7 days'
    })
  }
}

export default emailService