#!/usr/bin/env node

/**
 * Nuclear RLS Policy Fix Script
 * This script completely resets all RLS policies to eliminate infinite recursion
 */

const fs = require('fs');
const path = require('path');

console.log('💥 NUCLEAR RLS POLICY RESET');
console.log('===========================\n');

console.log('⚠️  WARNING: This will completely reset all RLS policies!');
console.log('   Use this as a last resort if other fixes failed.\n');

console.log('📋 To apply the nuclear RLS reset:\n');

console.log('1. 📂 Go to your Supabase Dashboard:');
console.log('   🌐 https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n');

console.log('2. 📄 Copy and paste the following SQL:\n');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '004_complete_rls_reset.sql');

try {
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('```sql');
  console.log(migrationSQL);
  console.log('```\n');
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  console.log('📍 Make sure the migration file exists at: supabase/migrations/004_complete_rls_reset.sql\n');
}

console.log('3. ▶️  Click "Run" to execute the nuclear reset\n');

console.log('4. ✅ After successful execution, all RLS recursion issues will be resolved\n');

console.log('🔧 What this nuclear reset does:');
console.log('   • Completely disables RLS on all tables');
console.log('   • Drops ALL existing policies');
console.log('   • Creates simple, non-recursive policies');
console.log('   • Re-enables RLS with safe policies\n');

console.log('⚠️  Important Notes:');
console.log('   • This is a nuclear option - use only if other fixes failed');
console.log('   • All existing RLS policies will be replaced');
console.log('   • The new policies are simpler but still secure');
console.log('   • Test thoroughly after applying\n');

console.log('🚨 ALTERNATIVE: If you want to keep existing policies, try this temporary workaround:\n');

console.log('```sql');
console.log('-- Temporary workaround: Disable RLS completely for testing');
console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE stores DISABLE ROW LEVEL SECURITY;');
console.log('-- Add other tables as needed...');
console.log('```\n');

console.log('🎉 Once applied, your authentication system should work without errors!');