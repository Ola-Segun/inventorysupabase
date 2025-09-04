# Supabase Email Configuration Guide

## Issue: No Confirmation Emails Received

If you're not receiving email confirmations after signup, it's likely because Supabase email/SMTP settings are not configured.

## Solution: Configure Supabase Email Settings

### Step 1: Access Supabase Dashboard
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `vhhmxrqyzzptjjcqixxi`

### Step 2: Enable Email Confirmations
1. Go to **Authentication** → **Settings**
2. Scroll down to **Email Confirmations**
3. Make sure **Enable email confirmations** is **ON**
4. Set **Site URL** to: `http://localhost:3001` (for development)
5. Set **Redirect URLs** to: `http://localhost:3001/auth/confirm-email`

### Step 3: Configure SMTP Settings
1. Go to **Authentication** → **Email Templates**
2. Scroll down to **SMTP Settings**
3. Choose one of these options:

#### Option A: Use Supabase's Built-in Email (Recommended for Development)
- **Sender**: Your project will use Supabase's email service
- This should work out of the box for basic testing

#### Option B: Configure Custom SMTP (For Production)
If you want to use a custom email service:

**Gmail SMTP:**
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-gmail@gmail.com
SMTP Password: your-app-password (not regular password)
SMTP Sender: your-gmail@gmail.com
```

**SendGrid:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: your-sendgrid-api-key
SMTP Sender: your-verified-sender@yourdomain.com
```

**Mailgun:**
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: your-mailgun-smtp-username
SMTP Password: your-mailgun-smtp-password
SMTP Sender: your-verified-sender@yourdomain.com
```

### Step 4: Test Email Configuration
1. After configuring SMTP, go to **Authentication** → **Users**
2. Click **Add User**
3. Enter an email and password
4. Check if the user receives a confirmation email

### Step 5: Alternative Testing (Development Only)
If emails still don't work, you can use the manual confirmation:

1. After signup, go to the signup success page
2. Click **"Manually Confirm Email (Dev Only)"**
3. This will confirm the email without needing the actual email

## Troubleshooting

### Check Email Logs
1. Go to **Authentication** → **Logs**
2. Look for email-related logs
3. Check for SMTP connection errors

### Common Issues
1. **Port 25 blocked**: Use port 587 instead
2. **Gmail App Password**: Use App Password, not regular password
3. **SPF/DKIM**: For custom domains, configure SPF/DKIM records
4. **Rate Limits**: Check your email provider's sending limits

### Development vs Production
- **Development**: Use Supabase's built-in email or Gmail
- **Production**: Use professional SMTP service (SendGrid, Mailgun, etc.)

## Testing the Fix

1. Try signing up with a new email
2. Check your email inbox and spam folder
3. If no email received, use the manual confirmation button
4. Try logging in after confirmation

## Environment Variables

Make sure your `.env` file has:
```
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Need Help?

If you're still having issues:
1. Check the browser console for errors
2. Check Supabase logs for SMTP errors
3. Try using a different email provider
4. Contact Supabase support for SMTP configuration help