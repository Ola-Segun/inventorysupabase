-- =====================================================
-- SUPER ADMIN ORGANIZATION RESTRICTIONS
-- =====================================================

-- This migration updates RLS policies to restrict super admins
-- to their own organization only, preventing cross-organization access

-- =====================================================
-- STEP 1: Update Organizations Policies (Fixed - No Recursion)
-- =====================================================

-- Drop existing organization policies
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_all" ON organizations;
DROP POLICY IF EXISTS "organizations_super_admin_select" ON organizations;
DROP POLICY IF EXISTS "organizations_super_admin_all" ON organizations;
DROP POLICY IF EXISTS "organizations_users_select" ON organizations;

-- Users can view their own organization
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (
    id = get_user_org_safe(auth.uid())
    );

-- Super admins can modify their own organization
CREATE POLICY "organizations_super_admin_all" ON organizations
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'super_admin' AND
    id = get_user_org_safe(auth.uid())
    );

-- Regular admins can modify their organization
CREATE POLICY "organizations_admin_all" ON organizations
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'admin' AND
    id = get_user_org_safe(auth.uid())
    );

-- =====================================================
-- STEP 2: Update Users Policies (Fixed - No Recursion)
-- =====================================================

-- Drop existing user policies
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_org" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_admin_manage" ON users;
DROP POLICY IF EXISTS "users_super_admin_select_org" ON users;
DROP POLICY IF EXISTS "users_super_admin_manage" ON users;

-- Users can view their own profile
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

-- Allow users to view other users in their organization (but not super admins)
CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid()) AND
        role != 'super_admin'
    );

-- Allow admins to manage users in their organization
CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'admin' AND
    organization_id = get_user_org_safe(auth.uid()) AND
        role != 'super_admin'
    );

-- Allow super admins to manage users in their organization (but not other super admins)
CREATE POLICY "users_super_admin_manage" ON users
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'super_admin' AND
    organization_id = get_user_org_safe(auth.uid()) AND
    role != 'super_admin'
    );

-- =====================================================
-- STEP 3: Update Store Policies
-- =====================================================

-- Drop existing store policies
DROP POLICY IF EXISTS "stores_select" ON stores;
DROP POLICY IF EXISTS "stores_all" ON stores;
DROP POLICY IF EXISTS "stores_super_admin_all" ON stores;
DROP POLICY IF EXISTS "stores_admin_all" ON stores;
DROP POLICY IF EXISTS "stores_owner_all" ON stores;

-- Users can view stores in their organization
CREATE POLICY "stores_select" ON stores
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Super admins can manage stores in their organization
CREATE POLICY "stores_super_admin_all" ON stores
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'super_admin' AND
    get_user_status_safe(auth.uid()) = 'active' AND
    get_user_org_safe(auth.uid()) = stores.organization_id
    );

-- Regular admins can manage stores in their organization
CREATE POLICY "stores_admin_all" ON stores
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'admin' AND
    get_user_status_safe(auth.uid()) = 'active' AND
    get_user_org_safe(auth.uid()) = stores.organization_id
    );

-- Store owners can manage their own stores
CREATE POLICY "stores_owner_all" ON stores
    FOR ALL USING (
        owner_id = auth.uid()
    );

-- =====================================================
-- STEP 4: Update Other Tables for Consistency
-- =====================================================

-- Categories: Ensure organization boundary
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_all" ON categories;

CREATE POLICY "categories_select" ON categories
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "categories_all" ON categories
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Products: Ensure organization boundary
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_all" ON products;

CREATE POLICY "products_select" ON products
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "products_all" ON products
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Orders: Ensure organization boundary
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_all" ON orders;

CREATE POLICY "orders_select" ON orders
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "orders_all" ON orders
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- =====================================================
-- STEP 5: Create Helper Functions
-- =====================================================

-- Function to check if user is super admin of the same organization
CREATE OR REPLACE FUNCTION is_super_admin_same_org(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND
              role = 'super_admin' AND
              status = 'active' AND
              organization_id = target_org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can access organization data
CREATE OR REPLACE FUNCTION can_access_org_data(target_org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid() AND
              status = 'active' AND
              organization_id = target_org_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMPLETE
-- =====================================================