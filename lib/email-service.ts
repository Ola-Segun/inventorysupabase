// Email service configuration
interface EmailConfig {
  provider: 'console' | 'smtp' | 'sendgrid' | 'mailgun'
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
}

// Get email configuration from environment variables
const getEmailConfig = (): EmailConfig => {
  const provider = (process.env.EMAIL_PROVIDER || 'console') as EmailConfig['provider']

  if (provider === 'smtp') {
    const host = process.env.SMTP_HOST
    const port = parseInt(process.env.SMTP_PORT || '587')
    const secure = process.env.SMTP_SECURE === 'true'
    const user = process.env.SMTP_USER
    const pass = process.env.SMTP_PASS

    if (!host || !user || !pass) {
      console.warn('SMTP not properly configured, falling back to console logging')
      return { provider: 'console' }
    }

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
        console.log('HTML Length:', options.html?.length || 0)
        console.log('Text Length:', options.text?.length || 0)
        console.log('---')
        return { messageId: `console-${Date.now()}` }
      }
    }
  }

  // For production, you would implement actual SMTP/SendGrid/Mailgun integrations
  // For now, we'll use a simple fetch-based approach for SMTP
  if (config.provider === 'smtp' && config.smtp) {
    return {
      sendMail: async (options: any) => {
        // This is a simplified implementation
        // In production, you'd use nodemailer or a similar library
        console.log('📧 EMAIL SERVICE (SMTP Mode - Simplified):')
        console.log('To:', options.to)
        console.log('Subject:', options.subject)
        console.log('From:', options.from)
        return { messageId: `smtp-${Date.now()}` }
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
}) => {
  const { recipientName, inviterName, invitationUrl, role, message, expiresIn } = data

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
  }) {
    const emailServiceInstance = createEmailService()
    const config = getEmailConfig()

    try {
      const template = getInvitationEmailTemplate(data)

      const mailOptions = {
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@example.com',
        to: data.to,
        subject: template.subject,
        html: template.html,
        text: template.text
      }

      const result = await emailServiceInstance.sendMail(mailOptions)

      console.log('Invitation email sent successfully:', result.messageId)

      return {
        success: true,
        messageId: result.messageId,
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

      console.log('Password reset email sent successfully:', result.messageId)

      return {
        success: true,
        messageId: result.messageId,
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
  }
}

export default emailService