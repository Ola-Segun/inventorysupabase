#!/usr/bin/env node

/**
 * Check and Clean User Invitations Script
 * This script helps diagnose and fix invitation-related issues
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables from .env file
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkAndCleanInvitations() {
  try {
    console.log('🔍 Checking existing user invitations...\n')

    // Check current invitations
    const { data: existingInvitations, error: checkError } = await supabase
      .from('user_invitations')
      .select('*')
      .order('created_at', { ascending: false })

    if (checkError) {
      console.error('❌ Error checking existing invitations:', checkError)
      return
    }

    console.log(`📊 Found ${existingInvitations.length} existing invitations:\n`)

    existingInvitations.forEach((invitation, index) => {
      const expiresAt = new Date(invitation.expires_at)
      const now = new Date()
      const isExpired = expiresAt < now

      console.log(`${index + 1}. Email: ${invitation.email}`)
      console.log(`   Status: ${invitation.status}`)
      console.log(`   Expires: ${expiresAt.toISOString()}`)
      console.log(`   Expired: ${isExpired ? 'YES' : 'NO'}`)
      console.log(`   Created: ${invitation.created_at}`)
      console.log('   ---')
    })

    // Clean up expired invitations
    const now = new Date()
    const { data: expiredInvitations, error: cleanupError } = await supabase
      .from('user_invitations')
      .delete()
      .lt('expires_at', now.toISOString())
      .neq('status', 'accepted')

    if (cleanupError) {
      console.error('❌ Error cleaning up expired invitations:', cleanupError)
    } else {
      console.log(`\n✅ Cleaned up ${expiredInvitations?.length || 0} expired invitations`)
    }

    // Check for problematic pending invitations
    const { data: pendingInvitations, error: pendingError } = await supabase
      .from('user_invitations')
      .select('*')
      .eq('status', 'pending')
      .gt('expires_at', now.toISOString())

    if (pendingError) {
      console.error('❌ Error checking pending invitations:', pendingError)
    } else {
      console.log(`\n📋 Found ${pendingInvitations.length} active pending invitations`)

      if (pendingInvitations.length > 0) {
        console.log('\nActive pending invitations:')
        pendingInvitations.forEach((inv, index) => {
          console.log(`  ${index + 1}. ${inv.email} (expires: ${inv.expires_at})`)
        })

        console.log('\n⚠️  These pending invitations will block new invitations to the same emails.')
        console.log('💡 Consider manually updating their status or deleting them if they are no longer needed.')
      }
    }

    console.log('\n✅ Invitation check completed!')
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

async function testEmailService() {
  try {
    console.log('📧 Testing email service...\n')

    const { emailService } = require('../lib/email-service')

    const result = await emailService.testInvitationEmail({
      to: 'test@example.com'
    })

    console.log('Email test result:', result)

    if (result.success) {
      console.log('✅ Email service is working!')
    } else {
      console.log('❌ Email service failed:', result.error)
    }
  } catch (error) {
    console.error('❌ Email test error:', error)
  }
}

// Run both functions
async function main() {
  await checkAndCleanInvitations()
  console.log('\n' + '='.repeat(50) + '\n')
  await testEmailService()
}

main()