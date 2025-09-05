-- =====================================================
-- FIX RLS INFINITE RECURSION - Final Solution
-- =====================================================

-- This migration fixes the infinite recursion issues in RLS policies
-- by creating simple, non-recursive policies that don't reference each other

-- =====================================================
-- STEP 1: Disable RLS temporarily
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

-- Drop all policies to start fresh
DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
                      pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- =====================================================
-- STEP 3: Create SIMPLE, NON-RECURSIVE policies
-- =====================================================

-- Organizations: Allow service role full access (for API operations)
CREATE POLICY "organizations_service_role" ON organizations
    FOR ALL USING (auth.role() = 'service_role');

-- Organizations: Simple policy - users can only see their own organization
CREATE POLICY "organizations_simple" ON organizations
    FOR ALL USING (
    id = get_user_org_safe(auth.uid())
    );

-- Stores: Allow service role full access (for API operations)
CREATE POLICY "stores_service_role" ON stores
    FOR ALL USING (auth.role() = 'service_role');

-- Stores: Users can see stores they're associated with
CREATE POLICY "stores_simple" ON stores
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid()) OR
        owner_id = auth.uid()
    );

-- Users: Allow service role full access (for API operations)
CREATE POLICY "users_service_role" ON users
    FOR ALL USING (auth.role() = 'service_role');

-- Users: Most restrictive - users can only see themselves and org members
CREATE POLICY "users_self" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_org_read" ON users
    FOR SELECT USING (
    organization_id = get_user_org_safe(auth.uid())
    );

CREATE POLICY "users_self_update" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
    (get_user_role_safe(auth.uid()) IN ('admin','super_admin')
     AND get_user_org_safe(auth.uid()) = users.organization_id
     AND get_user_status_safe(auth.uid()) = 'active')
    );

-- Store invitations: Simple ownership-based access
CREATE POLICY "store_invitations_simple" ON store_invitations
    FOR ALL USING (
    store_id IN (SELECT id FROM stores WHERE owner_id = auth.uid()) OR
    (get_user_role_safe(auth.uid()) IN ('admin','super_admin'))
    );

-- Categories: Organization-based access
CREATE POLICY "categories_simple" ON categories
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Products: Organization-based access
CREATE POLICY "products_simple" ON products
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Suppliers: Organization-based access
CREATE POLICY "suppliers_simple" ON suppliers
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Customers: Organization-based access
CREATE POLICY "customers_simple" ON customers
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Orders: Organization-based access
CREATE POLICY "orders_simple" ON orders
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Order items: Inherit from orders
CREATE POLICY "order_items_simple" ON order_items
    FOR ALL USING (
        order_id IN (
            SELECT id FROM orders
            WHERE organization_id = get_user_org_safe(auth.uid())
        )
    );

-- Stock movements: Organization-based access
CREATE POLICY "stock_movements_simple" ON stock_movements
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Audit logs: Organization-based access
CREATE POLICY "audit_logs_simple" ON audit_logs
    FOR ALL USING (
    organization_id = get_user_org_safe(auth.uid())
    );

-- Audit logs insert: Allow system to insert
CREATE POLICY "audit_logs_insert" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- Store analytics: Store-based access
CREATE POLICY "store_analytics_simple" ON store_analytics
    FOR ALL USING (
        store_id IN (
            SELECT id FROM stores
            WHERE organization_id = get_user_org_safe(auth.uid()) OR
            owner_id = auth.uid()
        )
    );

-- =====================================================
-- STEP 4: Re-enable RLS
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
-- STEP 5: Create helper functions to avoid recursion
-- =====================================================

-- Note: Using centralized helper functions defined in earlier migration
-- get_user_org_safe, get_user_role_safe, get_user_status_safe

-- =====================================================
-- STEP 6: Test the policies
-- =====================================================

-- This should work without infinite recursion:
-- SELECT * FROM users WHERE id = auth.uid() LIMIT 1;
-- SELECT * FROM organizations LIMIT 1;
-- SELECT * FROM stores LIMIT 1;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

COMMENT ON DATABASE CURRENT_DATABASE IS 'RLS policies fixed - infinite recursion resolved';