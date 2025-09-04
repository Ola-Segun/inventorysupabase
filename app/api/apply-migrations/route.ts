import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and has admin permissions
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    // Allow unauthenticated access during development/setup
    const isDevelopment = process.env.NODE_ENV === 'development'
    const hasValidAuth = !authError && user

    if (!isDevelopment && (!hasValidAuth)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role (skip in development if no users exist)
    if (hasValidAuth) {
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || !userProfile || !['admin', 'super_admin'].includes(userProfile.role)) {
        if (!isDevelopment) {
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }
      }
    }

    const results: any[] = []
    let hasErrors = false

    // Step 1: Create custom ENUM types
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          DO $$ BEGIN
              CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended', 'pending');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE product_status AS ENUM ('active', 'inactive', 'discontinued', 'draft');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'cashier', 'seller');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE store_type AS ENUM ('retail_store', 'warehouse', 'distribution_center', 'pop_up_store');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE store_status AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;

          DO $$ BEGIN
              CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
          EXCEPTION
              WHEN duplicate_object THEN null;
          END $$;
        `
      })
      results.push({ step: 'Create ENUM types', status: 'success', message: 'All ENUM types created or verified' })
    } catch (error: any) {
      results.push({ step: 'Create ENUM types', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 2: Add missing columns
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.users
          ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
          ADD COLUMN IF NOT EXISTS two_factor_backup_codes TEXT[],
          ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS password_reset_token TEXT,
          ADD COLUMN IF NOT EXISTS password_reset_expires TIMESTAMPTZ,
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

          ALTER TABLE public.stores
          ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        `
      })
      results.push({ step: 'Add missing columns', status: 'success', message: 'Missing columns added successfully' })
    } catch (error: any) {
      results.push({ step: 'Add missing columns', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 3: Create missing tables
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.permissions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              name VARCHAR(100) NOT NULL UNIQUE,
              description TEXT,
              resource VARCHAR(100) NOT NULL,
              action VARCHAR(50) NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(resource, action)
          );

          CREATE TABLE IF NOT EXISTS public.role_permissions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              role VARCHAR(50) NOT NULL,
              permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              UNIQUE(role, permission_id)
          );

          CREATE TABLE IF NOT EXISTS public.user_sessions (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
              session_token TEXT NOT NULL UNIQUE,
              device_info JSONB,
              ip_address INET,
              user_agent TEXT,
              expires_at TIMESTAMPTZ NOT NULL,
              created_at TIMESTAMPTZ DEFAULT NOW(),
              last_activity TIMESTAMPTZ DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS public.user_login_attempts (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID REFERENCES users(id) ON DELETE SET NULL,
              email TEXT,
              ip_address INET,
              user_agent TEXT,
              success BOOLEAN DEFAULT false,
              failure_reason TEXT,
              attempted_at TIMESTAMPTZ DEFAULT NOW()
          );
        `
      })
      results.push({ step: 'Create missing tables', status: 'success', message: 'All missing tables created' })
    } catch (error: any) {
      results.push({ step: 'Create missing tables', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 4: Enable RLS
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
          ALTER TABLE public.user_login_attempts ENABLE ROW LEVEL SECURITY;
        `
      })
      results.push({ step: 'Enable RLS', status: 'success', message: 'RLS enabled on all tables' })
    } catch (error: any) {
      results.push({ step: 'Enable RLS', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 5: Create RLS policies
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          DROP POLICY IF EXISTS "permissions_read_policy" ON permissions;
          CREATE POLICY "permissions_read_policy" ON permissions FOR SELECT USING (true);

          DROP POLICY IF EXISTS "role_permissions_read_policy" ON role_permissions;
          CREATE POLICY "role_permissions_read_policy" ON role_permissions FOR SELECT USING (true);

          DROP POLICY IF EXISTS "user_sessions_owner_policy" ON user_sessions;
          CREATE POLICY "user_sessions_owner_policy" ON user_sessions FOR ALL USING (user_id = auth.uid());

          DROP POLICY IF EXISTS "admin_sessions_policy" ON user_sessions;
          CREATE POLICY "admin_sessions_policy" ON user_sessions FOR SELECT USING ((auth.jwt() ->> 'role') IN ('admin', 'super_admin'));

          DROP POLICY IF EXISTS "login_attempts_owner_policy" ON user_login_attempts;
          CREATE POLICY "login_attempts_owner_policy" ON user_login_attempts FOR SELECT USING (user_id = auth.uid());

          DROP POLICY IF EXISTS "admin_login_attempts_policy" ON user_login_attempts;
          CREATE POLICY "admin_login_attempts_policy" ON user_login_attempts FOR SELECT USING ((auth.jwt() ->> 'role') IN ('admin', 'super_admin'));
        `
      })
      results.push({ step: 'Create RLS policies', status: 'success', message: 'RLS policies created successfully' })
    } catch (error: any) {
      results.push({ step: 'Create RLS policies', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 6: Insert default permissions
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO permissions (name, description, resource, action) VALUES
          ('users.create', 'Create new users', 'users', 'create'),
          ('users.read', 'View user information', 'users', 'read'),
          ('users.update', 'Update user information', 'users', 'update'),
          ('users.delete', 'Delete users', 'users', 'delete'),
          ('users.invite', 'Send user invitations', 'users', 'invite'),
          ('products.create', 'Create new products', 'products', 'create'),
          ('products.read', 'View products', 'products', 'read'),
          ('products.update', 'Update product information', 'products', 'update'),
          ('products.delete', 'Delete products', 'products', 'delete'),
          ('orders.create', 'Create new orders', 'orders', 'create'),
          ('orders.read', 'View orders', 'orders', 'read'),
          ('orders.update', 'Update order information', 'orders', 'update'),
          ('orders.delete', 'Delete orders', 'orders', 'delete'),
          ('inventory.read', 'View inventory', 'inventory', 'read'),
          ('inventory.update', 'Update inventory levels', 'inventory', 'update'),
          ('reports.read', 'View reports', 'reports', 'read'),
          ('settings.read', 'View settings', 'settings', 'read'),
          ('settings.update', 'Update settings', 'settings', 'update'),
          ('stores.read', 'View store information', 'stores', 'read'),
          ('audit.read', 'View audit logs', 'audit', 'read')
          ON CONFLICT (resource, action) DO NOTHING;
        `
      })
      results.push({ step: 'Insert default permissions', status: 'success', message: 'Default permissions inserted' })
    } catch (error: any) {
      results.push({ step: 'Insert default permissions', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 7: Assign permissions to roles
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO role_permissions (role, permission_id)
          SELECT 'super_admin', p.id FROM permissions p
          ON CONFLICT (role, permission_id) DO NOTHING;

          INSERT INTO role_permissions (role, permission_id)
          SELECT 'admin', p.id FROM permissions p
          WHERE p.name NOT IN ('users.invite', 'stores.update', 'audit.read')
          ON CONFLICT (role, permission_id) DO NOTHING;

          INSERT INTO role_permissions (role, permission_id)
          SELECT 'manager', p.id FROM permissions p
          WHERE p.resource IN ('products', 'orders', 'inventory', 'reports')
             OR p.name IN ('users.read', 'settings.read')
          ON CONFLICT (role, permission_id) DO NOTHING;

          INSERT INTO role_permissions (role, permission_id)
          SELECT 'cashier', p.id FROM permissions p
          WHERE p.resource IN ('orders', 'products', 'inventory')
            AND p.action IN ('create', 'read', 'update')
          ON CONFLICT (role, permission_id) DO NOTHING;

          INSERT INTO role_permissions (role, permission_id)
          SELECT 'seller', p.id FROM permissions p
          WHERE p.resource = 'orders' AND p.action IN ('create', 'read')
             OR p.resource = 'products' AND p.action = 'read'
          ON CONFLICT (role, permission_id) DO NOTHING;
        `
      })
      results.push({ step: 'Assign permissions to roles', status: 'success', message: 'Permissions assigned to roles' })
    } catch (error: any) {
      results.push({ step: 'Assign permissions to roles', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 8: Create helper functions
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          DROP FUNCTION IF EXISTS get_user_permissions(UUID);
          CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
          RETURNS TABLE(permission_name VARCHAR, resource VARCHAR, action VARCHAR, description TEXT) AS $$
          DECLARE
              user_role user_role;
          BEGIN
              SELECT role INTO user_role FROM users WHERE id = user_uuid;
              IF user_role IS NULL THEN RETURN; END IF;
              RETURN QUERY
              SELECT p.name, p.resource, p.action, p.description
              FROM role_permissions rp
              JOIN permissions p ON rp.permission_id = p.id
              WHERE rp.role = user_role::VARCHAR;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, required_permission VARCHAR)
          RETURNS BOOLEAN AS $$
          DECLARE
              user_role user_role;
              has_perm BOOLEAN := false;
          BEGIN
              SELECT role INTO user_role FROM users WHERE id = user_uuid;
              IF user_role IS NULL THEN RETURN false; END IF;
              SELECT EXISTS(
                  SELECT 1 FROM role_permissions rp
                  JOIN permissions p ON rp.permission_id = p.id
                  WHERE rp.role = user_role::VARCHAR AND p.name = required_permission
              ) INTO has_perm;
              RETURN has_perm;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          CREATE OR REPLACE FUNCTION create_user_session(
              p_user_id UUID, p_session_token TEXT, p_device_info JSONB DEFAULT NULL,
              p_ip_address INET DEFAULT NULL, p_user_agent TEXT DEFAULT NULL,
              p_expires_in_hours INTEGER DEFAULT 24
          )
          RETURNS UUID AS $$
          DECLARE session_id UUID;
          BEGIN
              INSERT INTO user_sessions (user_id, session_token, device_info, ip_address, user_agent, expires_at)
              VALUES (p_user_id, p_session_token, p_device_info, p_ip_address, p_user_agent, NOW() + INTERVAL '1 hour' * p_expires_in_hours)
              RETURNING id INTO session_id;
              RETURN session_id;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
      results.push({ step: 'Create helper functions', status: 'success', message: 'Helper functions created successfully' })
    } catch (error: any) {
      results.push({ step: 'Create helper functions', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 9: Fix admin permissions and RLS policies
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          -- Update RLS policies to properly handle store owners
          DROP POLICY IF EXISTS "users_select_policy" ON users;
          CREATE POLICY "users_select_policy" ON users
              FOR SELECT USING (
                  id = auth.uid() OR
                  store_id IN (
                      SELECT store_id FROM users WHERE id = auth.uid()
                  ) OR
                  store_id IN (
                      SELECT id FROM stores WHERE owner_id = auth.uid()
                  ) OR
                  (auth.jwt() ->> 'role')::text = 'super_admin' OR
                  COALESCE((auth.jwt() ->> 'role')::text, '') = 'admin' OR
                  EXISTS (
                      SELECT 1 FROM users u
                      WHERE u.id = auth.uid()
                      AND u.role IN ('admin', 'super_admin')
                  )
              );

          DROP POLICY IF EXISTS "users_insert_policy" ON users;
          CREATE POLICY "users_insert_policy" ON users
              FOR INSERT WITH CHECK (
                  store_id IN (
                      SELECT id FROM stores WHERE owner_id = auth.uid()
                  ) OR
                  store_id IN (
                      SELECT store_id FROM users
                      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
                  ) OR
                  EXISTS (
                      SELECT 1 FROM users u
                      WHERE u.id = auth.uid()
                      AND u.role = 'super_admin'
                  ) OR
                  auth.role() = 'service_role'
              );

          DROP POLICY IF EXISTS "users_update_policy" ON users;
          CREATE POLICY "users_update_policy" ON users
              FOR UPDATE USING (
                  id = auth.uid() OR
                  store_id IN (
                      SELECT id FROM stores WHERE owner_id = auth.uid()
                  ) OR
                  store_id IN (
                      SELECT store_id FROM users
                      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
                  ) OR
                  EXISTS (
                      SELECT 1 FROM users u
                      WHERE u.id = auth.uid()
                      AND u.role = 'super_admin'
                  )
              );

          DROP POLICY IF EXISTS "users_delete_policy" ON users;
          CREATE POLICY "users_delete_policy" ON users
              FOR DELETE USING (
                  store_id IN (
                      SELECT id FROM stores WHERE owner_id = auth.uid()
                  ) AND id != auth.uid() OR
                  store_id IN (
                      SELECT store_id FROM users
                      WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
                  ) AND id != auth.uid() OR
                  EXISTS (
                      SELECT 1 FROM users u
                      WHERE u.id = auth.uid()
                      AND u.role = 'super_admin'
                  ) AND id != auth.uid()
              );

          -- Create function to check admin permissions
          CREATE OR REPLACE FUNCTION is_user_admin(user_uuid UUID)
          RETURNS BOOLEAN AS $$
          DECLARE
              user_role user_role;
              is_owner BOOLEAN := false;
          BEGIN
              SELECT role INTO user_role FROM users WHERE id = user_uuid;
              IF user_role IN ('admin', 'super_admin') THEN
                  RETURN true;
              END IF;
              SELECT EXISTS(
                  SELECT 1 FROM stores WHERE owner_id = user_uuid
              ) INTO is_owner;
              RETURN is_owner;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          -- Update permission checking function
          CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, required_permission VARCHAR)
          RETURNS BOOLEAN AS $$
          DECLARE
              user_role user_role;
              has_perm BOOLEAN := false;
          BEGIN
              SELECT role INTO user_role FROM users WHERE id = user_uuid;
              IF user_role IS NULL THEN
                  RETURN false;
              END IF;
              IF user_role = 'super_admin' THEN
                  RETURN true;
              END IF;
              IF user_role = 'admin' OR EXISTS(
                  SELECT 1 FROM stores WHERE owner_id = user_uuid
              ) THEN
                  IF required_permission LIKE 'users.%' OR
                     required_permission LIKE 'products.%' OR
                     required_permission LIKE 'orders.%' OR
                     required_permission LIKE 'inventory.%' OR
                     required_permission LIKE 'reports.%' OR
                     required_permission LIKE 'settings.%' THEN
                      RETURN true;
                  END IF;
              END IF;
              SELECT EXISTS(
                  SELECT 1 FROM role_permissions rp
                  JOIN permissions p ON rp.permission_id = p.id
                  WHERE rp.role = user_role::VARCHAR AND p.name = required_permission
              ) INTO has_perm;
              RETURN has_perm;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;
        `
      })
      results.push({ step: 'Fix admin permissions', status: 'success', message: 'Admin permissions and RLS policies fixed' })
    } catch (error: any) {
      results.push({ step: 'Fix admin permissions', status: 'error', message: error.message })
      hasErrors = true
    }

    // Step 10: Create default organization
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          INSERT INTO organizations (name, slug)
          SELECT 'Default Organization', 'default-org'
          WHERE NOT EXISTS (SELECT 1 FROM organizations LIMIT 1);

          UPDATE stores
          SET organization_id = (SELECT id FROM organizations LIMIT 1)
          WHERE organization_id IS NULL;

          UPDATE users
          SET store_id = (
              SELECT id FROM stores
              WHERE owner_id = users.id OR organization_id = users.organization_id
              LIMIT 1
          )
          WHERE store_id IS NULL;

          UPDATE users
          SET organization_id = (
              SELECT s.organization_id
              FROM stores s
              WHERE s.id = users.store_id
          )
          WHERE organization_id IS NULL
            AND store_id IS NOT NULL;
        `
      })
      results.push({ step: 'Create default data', status: 'success', message: 'Default organization and relationships created' })
    } catch (error: any) {
      results.push({ step: 'Create default data', status: 'error', message: error.message })
      hasErrors = true
    }

    return NextResponse.json({
      success: !hasErrors,
      message: hasErrors ? 'Some migrations failed' : 'All migrations completed successfully',
      results,
      summary: {
        total: results.length,
        successful: results.filter(r => r.status === 'success').length,
        failed: results.filter(r => r.status === 'error').length
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      error: 'Migration failed',
      details: error.message
    }, { status: 500 })
  }
}