#!/usr/bin/env node

/**
 * Complete Setup and Testing Script for User Invitations
 * This script helps configure and test the entire invitation system
 */

const fs = require('fs')
const path = require('path')
const { createClient } = require('@supabase/supabase-js')

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSupabaseConnection() {
  console.log('🔍 Checking Supabase connection...\n')

  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error

    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message)
    return false
  }
}

async function checkDatabaseTables() {
  console.log('🔍 Checking database tables...\n')

  const tables = ['users', 'user_invitations', 'organizations', 'stores']

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('id').limit(1)
      if (error) {
        console.log(`❌ Table '${table}' check failed:`, error.message)
      } else {
        console.log(`✅ Table '${table}' exists`)
      }
    } catch (error) {
      console.log(`❌ Table '${table}' error:`, error.message)
    }
  }
}

async function checkInvitationSystem() {
  console.log('🔍 Checking invitation system...\n')

  try {
    // Check for existing invitations
    const { data: invitations, error } = await supabase
      .from('user_invitations')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)

    if (error) {
      console.log('❌ Failed to query invitations:', error.message)
      return false
    }

    console.log(`📊 Found ${invitations.length} recent invitations`)

    if (invitations.length > 0) {
      console.log('\nRecent invitations:')
      invitations.forEach((inv, index) => {
        const expiresAt = new Date(inv.expires_at)
        const now = new Date()
        const isExpired = expiresAt < now

        console.log(`${index + 1}. ${inv.email} (${inv.status}) - Expires: ${expiresAt.toISOString()} ${isExpired ? '(EXPIRED)' : ''}`)
      })
    }

    return true
  } catch (error) {
    console.log('❌ Invitation system check failed:', error.message)
    return false
  }
}

function printSetupInstructions() {
  console.log('\n' + '='.repeat(80))
  console.log('🚀 SUPABASE EMAIL CONFIGURATION REQUIRED')
  console.log('='.repeat(80) + '\n')

  console.log('📋 STEP-BY-STEP SETUP:\n')

  console.log('1. 🌐 Go to Supabase Dashboard:')
  console.log('   https://supabase.com/dashboard\n')

  console.log('2. 📂 Select your project:')
  console.log('   xkezigcidguxaolebnjw\n')

  console.log('3. ⚙️  Configure Authentication Settings:\n')

  console.log('   a) Go to: Authentication → Settings\n')

  console.log('   b) Email Confirmations:')
  console.log('      • Enable email confirmations: ✅ ON')
  console.log('      • Site URL: http://localhost:3000')
  console.log('      • Redirect URLs: http://localhost:3000/auth/confirm-email\n')

  console.log('   c) SMTP Settings (Choose one option):\n')

  console.log('      📧 Option A: Supabase Built-in (Recommended for testing)')
  console.log('         • Just enable it - no additional config needed')
  console.log('         • Works for basic testing\n')

  console.log('      📧 Option B: Gmail SMTP')
  console.log('         • SMTP Host: smtp.gmail.com')
  console.log('         • SMTP Port: 587')
  console.log('         • SMTP User: your-gmail@gmail.com')
  console.log('         • SMTP Password: your-app-password')
  console.log('         • SMTP Sender: your-gmail@gmail.com\n')

  console.log('4. ✅ After configuration, run this script again to test\n')

  console.log('='.repeat(80))
}

async function testEmailService() {
  console.log('📧 Testing email service...\n')

  try {
    // Test Supabase email service
    const testEmail = 'test@example.com'

    console.log(`Sending test email to: ${testEmail}`)

    const { error } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'http://localhost:3000/auth/reset-password'
    })

    if (error) {
      console.log('❌ Supabase email test failed:', error.message)
      console.log('💡 This indicates SMTP is not configured in Supabase')
      return false
    } else {
      console.log('✅ Supabase email service is working')
      console.log('📬 Check your inbox for the test email')
      return true
    }
  } catch (error) {
    console.log('❌ Email service test error:', error.message)
    return false
  }
}

async function runCompleteTest() {
  console.log('🧪 RUNNING COMPLETE SYSTEM TEST\n')
  console.log('='.repeat(50) + '\n')

  // Step 1: Check Supabase connection
  const connectionOk = await checkSupabaseConnection()
  if (!connectionOk) {
    console.log('❌ Cannot proceed without Supabase connection')
    return
  }

  // Step 2: Check database tables
  await checkDatabaseTables()

  // Step 3: Check invitation system
  const invitationOk = await checkInvitationSystem()

  // Step 4: Test email service
  const emailOk = await testEmailService()

  // Step 5: Summary
  console.log('\n' + '='.repeat(50))
  console.log('📊 TEST RESULTS SUMMARY')
  console.log('='.repeat(50))

  console.log(`🔗 Supabase Connection: ${connectionOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`🗄️  Database Tables: ✅ CHECKED`)
  console.log(`📧 Invitation System: ${invitationOk ? '✅ PASS' : '❌ FAIL'}`)
  console.log(`📧 Email Service: ${emailOk ? '✅ PASS' : '❌ FAIL'}`)

  if (emailOk && invitationOk) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL!')
    console.log('✅ You can now send user invitations')
  } else {
    console.log('\n⚠️  SOME ISSUES DETECTED:')
    if (!emailOk) {
      console.log('   - Email service needs Supabase SMTP configuration')
    }
    if (!invitationOk) {
      console.log('   - Invitation system has database issues')
    }
  }

  console.log('\n' + '='.repeat(50))
}

async function main() {
  console.log('🚀 InventoryPro - Complete Setup & Test Script')
  console.log('===============================================\n')

  const args = process.argv.slice(2)

  if (args.includes('--setup')) {
    printSetupInstructions()
  } else if (args.includes('--test')) {
    await runCompleteTest()
  } else if (args.includes('--email-test')) {
    await testEmailService()
  } else {
    console.log('Usage:')
    console.log('  node scripts/setup-and-test.js --setup     # Show setup instructions')
    console.log('  node scripts/setup-and-test.js --test      # Run complete test')
    console.log('  node scripts/setup-and-test.js --email-test # Test email only')
    console.log('\nExample:')
    console.log('  node scripts/setup-and-test.js --setup')
  }
}

main().catch(console.error)