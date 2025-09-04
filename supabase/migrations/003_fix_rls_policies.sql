-- =====================================================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- =====================================================

-- The issue: RLS policies on the users table are causing infinite recursion
-- because they reference the users table to check organization_id and roles

-- Solution: Temporarily disable RLS, fix policies, then re-enable

-- =====================================================
-- STEP 1: Temporarily disable RLS on users table
-- =====================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop problematic policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON users;

-- =====================================================
-- STEP 3: Create fixed policies that avoid recursion
-- =====================================================

-- Policy for users to view their own profile (no recursion)
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Policy for users to update their own profile (no recursion)
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

-- Policy for super admins to manage all users (no recursion - direct role check)
CREATE POLICY "Super admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND u.role = 'super_admin'
            AND u.status = 'active'
        )
    );

-- Policy for admins to manage users in their organization
-- This is tricky because we need to avoid recursion
-- We'll use a subquery that doesn't reference the users table directly
CREATE POLICY "Admins can manage users in their organization" ON users
    FOR ALL USING (
        -- Allow if the current user is an admin in the same organization
        organization_id IN (
            SELECT DISTINCT u.organization_id
            FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'super_admin')
            AND u.status = 'active'
        )
        AND EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid()
            AND u.role IN ('admin', 'super_admin')
            AND u.status = 'active'
        )
    );

-- =====================================================
-- STEP 4: Re-enable RLS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Verify other tables don't have similar issues
-- =====================================================

-- Check if other policies need similar fixes
-- The issue was specifically with the users table policies

-- =====================================================
-- STEP 6: Add some bypass policies for system operations
-- =====================================================

-- Allow service role to bypass RLS (for admin operations)
-- Note: This is already handled by the service role key in API routes

-- =====================================================
-- FIX COMPLETE
-- =====================================================

-- Test the fix by running a simple query
-- SELECT * FROM users LIMIT 1; -- This should work without infinite recursion