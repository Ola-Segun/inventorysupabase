-- =====================================================
-- COMBINED RLS FIX - Helper functions + Non-recursive policies
-- Usage: Paste this entire script into the Supabase SQL editor and run it as a single batch.
-- IMPORTANT: Back up your database / export the current RLS policy state before applying.
-- =====================================================

BEGIN;

-- =====================================================
-- 1) Create SECURITY DEFINER helper functions (safe lookups)
-- =====================================================

-- Temporarily disable RLS on users to allow function creation that queries users
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

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

-- Grant execute to the authenticated role so policies can call the helpers
GRANT EXECUTE ON FUNCTION get_user_profile_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_org_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role_safe(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_status_safe(UUID) TO authenticated;

-- =====================================================
-- 2) Drop problematic policies (start fresh)
-- =====================================================

-- Organizations
DROP POLICY IF EXISTS "organizations_select" ON organizations;
DROP POLICY IF EXISTS "organizations_all" ON organizations;
DROP POLICY IF EXISTS "organizations_super_admin_select" ON organizations;
DROP POLICY IF EXISTS "organizations_super_admin_all" ON organizations;
DROP POLICY IF EXISTS "organizations_users_select" ON organizations;
DROP POLICY IF EXISTS "organizations_admin_all" ON organizations;

-- Users
DROP POLICY IF EXISTS "users_select_own" ON users;
DROP POLICY IF EXISTS "users_select_org" ON users;
DROP POLICY IF EXISTS "users_update_own" ON users;
DROP POLICY IF EXISTS "users_admin_manage" ON users;
DROP POLICY IF EXISTS "users_super_admin_select_org" ON users;
DROP POLICY IF EXISTS "users_super_admin_manage" ON users;

-- Stores
DROP POLICY IF EXISTS "stores_select" ON stores;
DROP POLICY IF EXISTS "stores_all" ON stores;
DROP POLICY IF EXISTS "stores_super_admin_all" ON stores;
DROP POLICY IF EXISTS "stores_admin_all" ON stores;
DROP POLICY IF EXISTS "stores_owner_all" ON stores;

-- Categories
DROP POLICY IF EXISTS "categories_select" ON categories;
DROP POLICY IF EXISTS "categories_all" ON categories;

-- Products
DROP POLICY IF EXISTS "products_select" ON products;
DROP POLICY IF EXISTS "products_all" ON products;

-- Orders
DROP POLICY IF EXISTS "orders_select" ON orders;
DROP POLICY IF EXISTS "orders_all" ON orders;

-- Store invitations (if present)
DROP POLICY IF EXISTS "store_invitations_select" ON store_invitations;
DROP POLICY IF EXISTS "store_invitations_admin" ON store_invitations;

-- Audit / analytics policies (if present)
DROP POLICY IF EXISTS "audit_logs_select" ON audit_logs;
DROP POLICY IF EXISTS "store_analytics_select" ON store_analytics;

-- =====================================================
-- 3) Create non-recursive policies that call helper functions
-- =====================================================

-- Organizations
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (
    id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "organizations_super_admin_all" ON organizations
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'super_admin' AND
    id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "organizations_admin_all" ON organizations
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'admin' AND
    id = get_user_org_safe(auth.uid())
    );

-- Users
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid()) AND
        role != 'super_admin'
    );

CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'admin' AND
    organization_id = get_user_org_safe(auth.uid()) AND
        role != 'super_admin'
    );

CREATE POLICY "users_super_admin_manage" ON users
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'super_admin' AND
    organization_id = get_user_org_safe(auth.uid()) AND
    role != 'super_admin'
    );

-- Stores
CREATE POLICY "stores_select" ON stores
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "stores_super_admin_all" ON stores
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'super_admin' AND
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "stores_admin_all" ON stores
    FOR ALL USING (
    get_user_role_safe(auth.uid()) = 'admin' AND
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "stores_owner_all" ON stores
    FOR ALL USING (
        owner_id = auth.uid()
    );

-- Categories
CREATE POLICY "categories_select" ON categories
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "categories_all" ON categories
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Products
CREATE POLICY "products_select" ON products
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "products_all" ON products
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Orders
CREATE POLICY "orders_select" ON orders
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "orders_all" ON orders
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Store invitations
CREATE POLICY "store_invitations_select" ON store_invitations
    FOR SELECT USING (
    store_id = (SELECT store_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "store_invitations_admin" ON store_invitations
    FOR ALL USING (
    (get_user_role_safe(auth.uid()) IN ('admin','super_admin') AND get_user_org_safe(auth.uid()) IS NOT NULL)
    );

-- Audit logs
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Store analytics
CREATE POLICY "store_analytics_select" ON store_analytics
    FOR SELECT USING (
    store_id = (SELECT store_id FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- 4) Ensure RLS is enabled where policies should apply
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

COMMIT;

-- =====================================================
-- NOTE: After running this script, verify the following:
-- 1) Run a failing REST/admin request to confirm 500 -> 200.
-- 2) Check Postgres logs for "infinite recursion" errors.
-- 3) If you still see policy issues, restore backups and contact support.
-- =====================================================
