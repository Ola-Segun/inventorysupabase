#!/usr/bin/env node

/**
 * Apply Unified User Invitations Migration Script
 * This script helps apply the unified user invitations migration to Supabase
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Unified User Invitations Migration Helper');
console.log('==========================================\n');

console.log('📋 To apply the unified user invitations migration:\n');

console.log('1. 📂 Go to your Supabase Dashboard:');
console.log('   🌐 https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n');

console.log('2. 📄 Copy and paste the following SQL:\n');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '008_create_unified_user_invitations.sql');

try {
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('```sql');
  console.log(migrationSQL);
  console.log('```\n');
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  console.log('📍 Make sure the migration file exists at: supabase/migrations/008_create_unified_user_invitations.sql\n');
}

console.log('3. ▶️  Click "Run" to execute the migration\n');

console.log('4. ✅ After successful execution, the unified invitation system will be ready!\n');

console.log('🔧 What this migration includes:');
console.log('   • Unified user_invitations table');
console.log('   • Invitation status tracking (pending, accepted, expired, cancelled)');
console.log('   • Organization and store-level invitations');
console.log('   • Secure invitation tokens');
console.log('   • Audit trail for invitation actions');
console.log('   • Row Level Security policies\n');

console.log('⚠️  Important Notes:');
console.log('   • This migration creates a new unified table for all invitations');
console.log('   • The old store_invitations table can be removed after testing');
console.log('   • Make sure to backup your database before applying');
console.log('   • The app will work with fallback logic until migration is applied\n');

console.log('🎉 Once applied, your unified invitation system will be fully functional!');