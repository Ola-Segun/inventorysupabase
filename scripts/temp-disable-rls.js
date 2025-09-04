#!/usr/bin/env node

/**
 * TEMPORARY RLS DISABLE SCRIPT
 * This script temporarily disables RLS to test authentication
 */

console.log('🚨 TEMPORARY RLS DISABLE');
console.log('=========================\n');

console.log('⚠️  WARNING: This will temporarily disable Row Level Security!');
console.log('   Use ONLY for testing authentication. Re-enable RLS after testing!\n');

console.log('📋 Run this SQL in your Supabase SQL Editor:\n');

console.log('```sql');
console.log('-- TEMPORARILY DISABLE RLS FOR TESTING');
console.log('ALTER TABLE users DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE stores DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE store_invitations DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE categories DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE products DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE customers DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE orders DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;');
console.log('ALTER TABLE store_analytics DISABLE ROW LEVEL SECURITY;');
console.log('```\n');

console.log('✅ After running this:');
console.log('   • Authentication should work immediately');
console.log('   • Login will redirect to dashboard');
console.log('   • All database queries will succeed\n');

console.log('🔄 AFTER TESTING - Re-enable RLS with proper policies:');
console.log('   Run the nuclear reset from: scripts/apply-nuclear-fix.js\n');

console.log('⚠️  SECURITY NOTE:');
console.log('   With RLS disabled, all data is publicly accessible!');
console.log('   Only use this for testing, then immediately re-enable RLS!\n');

console.log('🎯 This should fix your "Logging in..." hang immediately!');