-- =====================================================
-- FIX RLS POLICIES - Remove Infinite Recursion
-- =====================================================

-- This script fixes the infinite recursion issues in RLS policies
-- Run this in Supabase SQL Editor

-- =====================================================
-- STEP 1: Drop ALL existing policies to start fresh
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

-- =====================================================
-- STEP 2: Create NEW policies without recursion
-- =====================================================

-- Organizations
CREATE POLICY "organizations_select" ON organizations
    FOR SELECT USING (
        id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "organizations_super_admin_all" ON organizations
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' AND
        id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "organizations_admin_all" ON organizations
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND
        id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Users
CREATE POLICY "users_select_own" ON users
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "users_update_own" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "users_select_org" ON users
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        role != 'super_admin'
    );

CREATE POLICY "users_admin_manage" ON users
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        role != 'super_admin'
    );

CREATE POLICY "users_super_admin_manage" ON users
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' AND
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid()) AND
        role != 'super_admin'
    );

-- Stores
CREATE POLICY "stores_select" ON stores
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "stores_super_admin_all" ON stores
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'super_admin' AND
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "stores_admin_all" ON stores
    FOR ALL USING (
        (SELECT role FROM users WHERE id = auth.uid()) = 'admin' AND
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "stores_owner_all" ON stores
    FOR ALL USING (
        owner_id = auth.uid()
    );

-- Categories
CREATE POLICY "categories_select" ON categories
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "categories_all" ON categories
    FOR ALL USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Products
CREATE POLICY "products_select" ON products
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "products_all" ON products
    FOR ALL USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- Orders
CREATE POLICY "orders_select" ON orders
    FOR SELECT USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

CREATE POLICY "orders_all" ON orders
    FOR ALL USING (
        organization_id = (SELECT organization_id FROM users WHERE id = auth.uid())
    );

-- =====================================================
-- COMPLETE
-- =====================================================