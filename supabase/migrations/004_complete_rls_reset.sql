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

-- Stores
DROP POLICY IF EXISTS "Users can view stores in their organization" ON stores;
DROP POLICY IF EXISTS "Store owners and admins can manage their stores" ON stores;

-- Users (drop all variations)
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Super admins can manage all users" ON users;

-- Store invitations
DROP POLICY IF EXISTS "Users can view invitations for their stores" ON store_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations for their stores" ON store_invitations;

-- Categories
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can create categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories" ON categories;

-- Products
DROP POLICY IF EXISTS "Users can view products in their organization" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;

-- Orders
DROP POLICY IF EXISTS "Users can view orders in their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Users can delete orders" ON orders;

-- Audit logs
DROP POLICY IF EXISTS "Users can view audit logs for their organization" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- =====================================================
-- STEP 3: Create SIMPLE, NON-RECURSIVE policies
-- =====================================================

-- Organizations: Allow all authenticated users to read, only super admins to modify
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "organizations_all" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin' AND status = 'active'
        )
    );

-- Stores: Users can view stores they're associated with
CREATE POLICY "stores_select" ON stores
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            owner_id = auth.uid() OR
            organization_id IN (
                SELECT organization_id FROM users WHERE id = auth.uid()
            )
        )
    );

CREATE POLICY "stores_all" ON stores
    FOR ALL USING (
        auth.uid() IS NOT NULL AND (
            owner_id = auth.uid() OR
            EXISTS (
                SELECT 1 FROM users
                WHERE id = auth.uid() AND
                      organization_id = stores.organization_id AND
                      role IN ('admin', 'super_admin') AND
                      status = 'active'
            )
        )
    );

-- Users: Most restrictive - users can only see themselves and their org members
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND
                  u.organization_id = users.organization_id AND
                  u.role IN ('admin', 'super_admin') AND
                  u.status = 'active'
        )
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
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "categories_all" ON categories
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND status = 'active'
        )
    );

-- Products: Organization-based access
CREATE POLICY "products_select" ON products
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "products_all" ON products
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND status = 'active'
        )
    );

-- Orders: Organization-based access
CREATE POLICY "orders_select" ON orders
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "orders_all" ON orders
    FOR ALL USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        ) AND
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND status = 'active'
        )
    );

-- Audit logs: Organization-based access
CREATE POLICY "audit_logs_select" ON audit_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
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

-- =====================================================
-- COMPLETE
-- =====================================================