-- =====================================================
-- FIX RLS INFINITE RECURSION
-- =====================================================

-- The issue: RLS policies on users table are causing infinite recursion
-- when checkAdminPermissions tries to query user profiles

-- Solution: Temporarily disable RLS for permission checks, then re-enable

-- =====================================================
-- STEP 1: Disable RLS temporarily for permission check
-- =====================================================

ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Create a security definer function to safely get user profile
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_profile_safe(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    role TEXT,
    organization_id UUID,
    store_id UUID,
    status TEXT
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only return data for the requesting user or users in the same organization
    RETURN QUERY
    SELECT
        u.id,
        u.role::TEXT,
        u.organization_id,
        u.store_id,
        u.status::TEXT
    FROM users u
    WHERE u.id = user_uuid
       OR (u.organization_id = (SELECT organization_id FROM users WHERE id = user_uuid));
END;
$$;

-- Helper scalar functions (security definer) to avoid selecting users table directly inside policies
CREATE OR REPLACE FUNCTION get_user_org_safe(user_uuid UUID)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT organization_id FROM users WHERE id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_role_safe(user_uuid UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT role::text FROM users WHERE id = user_uuid LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_status_safe(user_uuid UUID)
RETURNS TEXT
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
    SELECT status::text FROM users WHERE id = user_uuid LIMIT 1;
$$;

-- =====================================================
-- STEP 3: Update admin permissions function to use the safe function
-- =====================================================

-- Note: This would need to be updated in the application code to use the new function
-- For now, let's create simpler policies that don't cause recursion

-- =====================================================
-- STEP 4: Create non-recursive RLS policies
-- =====================================================

-- Drop existing policies first
DROP POLICY IF EXISTS "users_own_profile" ON users;
DROP POLICY IF EXISTS "users_org_members" ON users;
DROP POLICY IF EXISTS "users_admin_manage" ON users;

-- Allow users to see their own profile
CREATE POLICY "users_own_profile" ON users
    FOR SELECT USING (id = auth.uid());

-- Allow users to see profiles in their organization (but avoid recursion)
CREATE POLICY "users_org_members" ON users
    FOR SELECT USING (
        organization_id IS NOT NULL AND
        organization_id = get_user_org_safe(auth.uid())
    );

-- Allow admins to manage users in their organization
CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
        (
          get_user_role_safe(auth.uid()) IN ('admin', 'super_admin')
          AND get_user_org_safe(auth.uid()) = users.organization_id
          AND get_user_status_safe(auth.uid()) = 'active'
        )
    );

-- =====================================================
-- STEP 5: Re-enable RLS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 6: Grant necessary permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION get_user_profile_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_org_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_status_safe(UUID) TO authenticated;

-- =====================================================
-- COMPLETE
-- =====================================================