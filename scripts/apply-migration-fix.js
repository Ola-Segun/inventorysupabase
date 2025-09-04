#!/usr/bin/env node

/**
 * Apply RLS Policy Fix Migration Script
 * This script fixes the infinite recursion issue in RLS policies
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Supabase RLS Policy Fix');
console.log('==========================\n');

console.log('📋 This fixes the "infinite recursion detected in policy" error\n');

console.log('1. 📂 Go to your Supabase Dashboard:');
console.log('   🌐 https://supabase.com/dashboard/project/YOUR_PROJECT/sql\n');

console.log('2. 📄 Copy and paste the following SQL:\n');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_fix_rls_policies.sql');

try {
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
  console.log('```sql');
  console.log(migrationSQL);
  console.log('```\n');
} catch (error) {
  console.error('❌ Error reading migration file:', error.message);
  console.log('📍 Make sure the migration file exists at: supabase/migrations/003_fix_rls_policies.sql\n');
}

console.log('3. ▶️  Click "Run" to execute the fix\n');

console.log('4. ✅ After successful execution, the infinite recursion error will be resolved\n');

console.log('🔧 What this fix does:');
console.log('   • Temporarily disables RLS on users table');
console.log('   • Drops problematic recursive policies');
console.log('   • Creates new policies that avoid circular references');
console.log('   • Re-enables RLS with fixed policies\n');

console.log('⚠️  Important Notes:');
console.log('   • This fix is safe and preserves all your data');
console.log('   • The policies now work without causing infinite recursion');
console.log('   • Authentication should work properly after this fix\n');

console.log('🎉 Once applied, your authentication system will work without errors!');