-- =====================================================
-- COMPLETE RLS RESET - Nuclear Option
-- =====================================================

-- This migration completely resets all RLS policies to eliminate infinite recursion
-- Use this if the previous fixes didn't work

-- =====================================================
-- STEP 1: Disable RLS on ALL tables temporarily
-- =====================================================

ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE stores DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_invitations DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 2: Drop ALL existing policies
-- =====================================================

-- Organizations
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_all" ON organizations;

-- Stores
DROP POLICY IF EXISTS "Users can view stores in their organization" ON stores;
DROP POLICY IF EXISTS "Store owners and admins can manage their stores" ON stores;
DROP POLICY IF EXISTS "stores_select" ON stores;
DROP POLICY IF EXISTS "stores_all" ON stores;

-- Users (drop all variations)
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_org" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_admin_manage" ON users;

-- Store invitations
DROP POLICY IF EXISTS "Users can view invitations for their stores" ON store_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations for their stores" ON store_invitations;
DROP POLICY IF EXISTS "store_invitations_select" ON store_invitations;
DROP POLICY IF EXISTS "store_invitations_all" ON store_invitations;

-- Categories
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can create categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories" ON categories;
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_all" ON categories;

-- Products
DROP POLICY IF EXISTS "Users can view products in their organization" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_all" ON products;

-- Orders
DROP POLICY IF EXISTS "Users can view orders in their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Users can delete orders" ON orders;
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_all" ON orders;

-- Audit logs
DROP POLICY IF EXISTS "Users can view audit logs for their organization" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert" ON audit_logs;

-- =====================================================
-- STEP 3: Create SIMPLE, NON-RECURSIVE policies
-- =====================================================

-- Organizations: Allow all authenticated users to read, only super admins to modify
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "organizations_all" ON organizations
    FOR ALL USING (
    (get_user_role_safe(auth.uid()) = 'super_admin' AND get_user_status_safe(auth.uid()) = 'active')
    );

-- Stores: Users can view stores they're associated with
CREATE POLICY "stores_select" ON stores
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            owner_id = auth.uid() OR
            organization_id = get_user_org_safe(auth.uid())
        )
    );

CREATE POLICY "stores_all" ON stores
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            owner_id = auth.uid() OR
            (get_user_role_safe(auth.uid()) IN ('admin','super_admin') AND get_user_org_safe(auth.uid()) = stores.organization_id AND get_user_status_safe(auth.uid()) = 'active')
        )
    );

-- Users: Most restrictive - users can only see themselves and their org members
-- Simplified to avoid infinite recursion
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

-- Create a security definer function to check organization membership
CREATE OR REPLACE FUNCTION check_user_org_access(check_user_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    current_user_org UUID;
    check_user_org UUID;
BEGIN
    -- Get current user's organization
    SELECT organization_id INTO current_user_org
    FROM users
    WHERE id = auth.uid();

    -- Get check user's organization
    SELECT organization_id INTO check_user_org
    FROM users
    WHERE id = check_user_id;

    -- Return true if they are in the same organization
    RETURN current_user_org IS NOT NULL
           AND check_user_org IS NOT NULL
           AND current_user_org = check_user_org;
END;
$$;

CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
        id = auth.uid() OR
    (get_user_org_safe(auth.uid()) = users.organization_id)
    );

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
    (get_user_role_safe(auth.uid()) IN ('admin','super_admin') AND get_user_org_safe(auth.uid()) = users.organization_id AND get_user_status_safe(auth.uid()) = 'active')
    );

-- Store invitations: Simple policy based on store ownership
CREATE POLICY "store_invitations_select" ON store_invitations
    FOR SELECT USING (
        store_id IN (
            SELECT id FROM stores WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

CREATE POLICY "store_invitations_all" ON store_invitations
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores WHERE owner_id = auth.uid()
        ) OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
        )
    );

-- Categories: Organization-based access
CREATE POLICY "categories_select" ON categories
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "categories_all" ON categories
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid()) AND
    get_user_status_safe(auth.uid()) = 'active'
    );

-- Products: Organization-based access
CREATE POLICY "products_select" ON products
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "products_all" ON products
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid()) AND
    get_user_status_safe(auth.uid()) = 'active'
    );

-- Orders: Organization-based access
CREATE POLICY "orders_select" ON orders
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "orders_all" ON orders
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid()) AND
    get_user_status_safe(auth.uid()) = 'active'
    );

-- Audit logs: Organization-based access
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "audit_logs_insert" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- STEP 4: Re-enable RLS on ALL tables
-- =====================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE store_analytics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: Test the policies
-- =====================================================

-- This should work without infinite recursion:
-- SELECT * FROM users WHERE id = auth.uid() LIMIT 1;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_org_access(UUID) TO authenticated;

-- =====================================================
-- COMPLETE
-- =====================================================