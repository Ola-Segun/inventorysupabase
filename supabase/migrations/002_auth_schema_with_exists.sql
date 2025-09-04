-- =====================================================
-- INVENTORY MANAGEMENT SYSTEM - AUTH & AUTHORIZATION
-- Migration with IF NOT EXISTS for existing databases
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUM TYPES (with IF NOT EXISTS)
-- =====================================================

-- User roles enum
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'cashier', 'seller');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- User status enum
DO $$ BEGIN
    CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Product status enum
DO $$ BEGIN
    CREATE TYPE product_status AS ENUM ('active', 'inactive', 'discontinued');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Order status enum
DO $$ BEGIN
    CREATE TYPE order_status AS ENUM ('pending', 'processing', 'completed', 'cancelled', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Payment status enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Stock movement type enum
DO $$ BEGIN
    CREATE TYPE stock_movement_type AS ENUM ('in', 'out', 'adjustment', 'transfer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Store type enum
DO $$ BEGIN
    CREATE TYPE store_type AS ENUM ('retail_store', 'warehouse', 'distribution_center', 'pop_up_store');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Store status enum
DO $$ BEGIN
    CREATE TYPE store_status AS ENUM ('active', 'inactive', 'pending_approval', 'suspended');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription tier enum
DO $$ BEGIN
    CREATE TYPE subscription_tier AS ENUM ('free', 'pro', 'enterprise');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Subscription status enum
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'trialing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- TABLES (with IF NOT EXISTS)
-- =====================================================

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_tier subscription_tier DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'trialing',
    trial_ends_at TIMESTAMPTZ,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stores table
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    store_type store_type DEFAULT 'retail_store',
    status store_status DEFAULT 'active',
    owner_id UUID,
    business_name VARCHAR(255),
    business_registration_number VARCHAR(100),
    tax_number VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    timezone VARCHAR(50) DEFAULT 'UTC',
    currency VARCHAR(10) DEFAULT 'USD',
    logo_url TEXT,
    website_url TEXT,
    description TEXT,
    settings JSONB DEFAULT '{}',
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status subscription_status DEFAULT 'trialing',
    trial_ends_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'seller',
    avatar_url TEXT,
    status user_status DEFAULT 'active',
    last_login_at TIMESTAMPTZ,
    is_store_owner BOOLEAN DEFAULT FALSE,
    permissions TEXT[] DEFAULT '{}',
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    two_factor_backup_codes TEXT[],
    password_changed_at TIMESTAMPTZ DEFAULT NOW(),
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store invitations table
CREATE TABLE IF NOT EXISTS store_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'seller',
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(store_id, slug)
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(100),
    cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    min_stock_level INTEGER,
    max_stock_level INTEGER,
    unit VARCHAR(50),
    weight DECIMAL(10,2),
    dimensions JSONB,
    images TEXT[],
    tags TEXT[],
    status product_status DEFAULT 'active',
    is_trackable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(store_id, sku)
);

-- Suppliers table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    payment_terms TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address JSONB,
    loyalty_points INTEGER DEFAULT 0,
    total_spent DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    status order_status DEFAULT 'pending',
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    payment_method VARCHAR(50),
    payment_status payment_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements table
CREATE TABLE IF NOT EXISTS stock_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type stock_movement_type NOT NULL,
    quantity INTEGER NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store analytics table
CREATE TABLE IF NOT EXISTS store_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_sales DECIMAL(10,2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_customers INTEGER DEFAULT 0,
    total_products INTEGER DEFAULT 0,
    low_stock_items INTEGER DEFAULT 0,
    out_of_stock_items INTEGER DEFAULT 0,
    top_selling_products JSONB,
    revenue_by_category JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(store_id, date)
);

-- =====================================================
-- INDEXES (with IF NOT EXISTS)
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_store_id ON users(store_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Stores indexes
CREATE INDEX IF NOT EXISTS idx_stores_organization_id ON stores(organization_id);
CREATE INDEX IF NOT EXISTS idx_stores_owner_id ON stores(owner_id);
CREATE INDEX IF NOT EXISTS idx_stores_status ON stores(status);

-- Products indexes
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON products(organization_id);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- Orders indexes
CREATE INDEX IF NOT EXISTS idx_orders_organization_id ON orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_organization_id ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_store_id ON audit_logs(store_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get user permissions
CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
RETURNS TABLE(permission TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT unnest(permissions) as permission
    FROM users
    WHERE id = user_uuid AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid UUID, required_permission TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_permissions TEXT[];
    user_role user_role;
    user_status user_status;
BEGIN
    -- Get user data
    SELECT permissions, role, status INTO user_permissions, user_role, user_status
    FROM users
    WHERE id = user_uuid;

    -- Check if user exists and is active
    IF user_status != 'active' THEN
        RETURN FALSE;
    END IF;

    -- Super admin has all permissions
    IF user_role = 'super_admin' THEN
        RETURN TRUE;
    END IF;

    -- Check if user has the specific permission
    IF required_permission = ANY(user_permissions) THEN
        RETURN TRUE;
    END IF;

    -- Check role-based permissions
    CASE user_role
        WHEN 'admin' THEN
            RETURN required_permission IN (
                'users.read', 'users.create', 'users.update', 'users.delete', 'users.invite',
                'products.read', 'products.create', 'products.update', 'products.delete',
                'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.void',
                'categories.read', 'categories.create', 'categories.update', 'categories.delete',
                'customers.read', 'customers.create', 'customers.update', 'customers.delete',
                'suppliers.read', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
                'reports.read', 'reports.export', 'inventory.read', 'inventory.update',
                'settings.read', 'settings.update', 'stores.read', 'stores.update'
            );
        WHEN 'manager' THEN
            RETURN required_permission IN (
                'products.read', 'products.create', 'products.update',
                'orders.read', 'orders.create', 'orders.update', 'orders.void',
                'categories.read', 'categories.create', 'categories.update',
                'customers.read', 'customers.create', 'customers.update',
                'suppliers.read', 'suppliers.create', 'suppliers.update',
                'reports.read', 'reports.export', 'inventory.read', 'inventory.update'
            );
        WHEN 'cashier' THEN
            RETURN required_permission IN (
                'products.read', 'orders.read', 'orders.create', 'orders.update',
                'customers.read', 'customers.create', 'customers.update',
                'inventory.read'
            );
        WHEN 'seller' THEN
            RETURN required_permission IN (
                'products.read', 'orders.read', 'orders.create',
                'customers.read', 'customers.create'
            );
        ELSE
            RETURN FALSE;
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user permissions with secure access
CREATE OR REPLACE FUNCTION get_user_permissions_secure(user_uuid UUID)
RETURNS TABLE(permission TEXT) AS $$
BEGIN
    -- Only allow users to get their own permissions
    IF auth.uid() != user_uuid THEN
        RAISE EXCEPTION 'Access denied: Can only access own permissions';
    END IF;

    RETURN QUERY
    SELECT * FROM get_user_permissions(user_uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_action TEXT,
    p_table_name TEXT,
    p_record_id UUID DEFAULT NULL,
    p_old_values JSONB DEFAULT NULL,
    p_new_values JSONB DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    current_user_id UUID;
    current_org_id UUID;
    current_store_id UUID;
BEGIN
    -- Get current user info
    current_user_id := auth.uid();

    -- Get user's organization and store
    SELECT organization_id, store_id INTO current_org_id, current_store_id
    FROM users
    WHERE id = current_user_id;

    -- Insert audit log
    INSERT INTO audit_logs (
        organization_id,
        store_id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent
    ) VALUES (
        current_org_id,
        current_store_id,
        current_user_id,
        p_action,
        p_table_name,
        p_record_id,
        p_old_values,
        p_new_values,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_date TEXT;
    sequence_number INTEGER;
    order_number TEXT;
BEGIN
    order_date := TO_CHAR(NOW(), 'YYYYMMDD');
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM '[0-9]+$') AS INTEGER)), 0) + 1
    INTO sequence_number
    FROM orders
    WHERE order_number LIKE order_date || '-%';

    order_number := order_date || '-' || LPAD(sequence_number::TEXT, 4, '0');
    RETURN order_number;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS (with IF NOT EXISTS check)
-- =====================================================

-- Updated at triggers
DO $$ BEGIN
    CREATE TRIGGER update_organizations_updated_at
        BEFORE UPDATE ON organizations
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_stores_updated_at
        BEFORE UPDATE ON stores
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_categories_updated_at
        BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_products_updated_at
        BEFORE UPDATE ON products
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_suppliers_updated_at
        BEFORE UPDATE ON suppliers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_customers_updated_at
        BEFORE UPDATE ON customers
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_orders_updated_at
        BEFORE UPDATE ON orders
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables (skip if already enabled)
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

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view stores in their organization" ON stores;
DROP POLICY IF EXISTS "Store owners and admins can manage their stores" ON stores;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON users;
DROP POLICY IF EXISTS "Users can view invitations for their stores" ON store_invitations;
DROP POLICY IF EXISTS "Admins can manage invitations for their stores" ON store_invitations;
DROP POLICY IF EXISTS "Users can view categories in their organization" ON categories;
DROP POLICY IF EXISTS "Users can create categories" ON categories;
DROP POLICY IF EXISTS "Users can update categories" ON categories;
DROP POLICY IF EXISTS "Users can delete categories" ON categories;
DROP POLICY IF EXISTS "Users can view products in their organization" ON products;
DROP POLICY IF EXISTS "Users can create products" ON products;
DROP POLICY IF EXISTS "Users can update products" ON products;
DROP POLICY IF EXISTS "Users can delete products" ON products;
DROP POLICY IF EXISTS "Users can view orders in their organization" ON orders;
DROP POLICY IF EXISTS "Users can create orders" ON orders;
DROP POLICY IF EXISTS "Users can update orders" ON orders;
DROP POLICY IF EXISTS "Users can delete orders" ON orders;
DROP POLICY IF EXISTS "Users can view audit logs for their organization" ON audit_logs;
DROP POLICY IF EXISTS "System can insert audit logs" ON audit_logs;

-- Organizations policies
CREATE POLICY "Users can view their own organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Super admins can manage all organizations" ON organizations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Stores policies
CREATE POLICY "Users can view stores in their organization" ON stores
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Store owners and admins can manage their stores" ON stores
    FOR ALL USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid() AND
                  organization_id = stores.organization_id AND
                  role IN ('admin', 'super_admin')
        )
    );

-- Users policies
CREATE POLICY "Users can view users in their organization" ON users
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage users in their organization" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND
                  u.organization_id = users.organization_id AND
                  u.role IN ('admin', 'super_admin')
        )
    );

-- Store invitations policies
CREATE POLICY "Users can view invitations for their stores" ON store_invitations
    FOR SELECT USING (
        store_id IN (
            SELECT store_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage invitations for their stores" ON store_invitations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND
                  u.store_id = store_invitations.store_id AND
                  u.role IN ('admin', 'super_admin')
        )
    );

-- Categories policies
CREATE POLICY "Users can view categories in their organization" ON categories
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create categories" ON categories
    FOR INSERT WITH CHECK (
        user_has_permission(auth.uid(), 'categories.create') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update categories" ON categories
    FOR UPDATE USING (
        user_has_permission(auth.uid(), 'categories.update') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete categories" ON categories
    FOR DELETE USING (
        user_has_permission(auth.uid(), 'categories.delete') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Products policies
CREATE POLICY "Users can view products in their organization" ON products
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create products" ON products
    FOR INSERT WITH CHECK (
        user_has_permission(auth.uid(), 'products.create') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update products" ON products
    FOR UPDATE USING (
        user_has_permission(auth.uid(), 'products.update') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete products" ON products
    FOR DELETE USING (
        user_has_permission(auth.uid(), 'products.delete') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Orders policies
CREATE POLICY "Users can view orders in their organization" ON orders
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (
        user_has_permission(auth.uid(), 'orders.create') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update orders" ON orders
    FOR UPDATE USING (
        user_has_permission(auth.uid(), 'orders.update') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete orders" ON orders
    FOR DELETE USING (
        user_has_permission(auth.uid(), 'orders.delete') AND
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view audit logs for their organization" ON audit_logs
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- VIEWS (with OR REPLACE)
-- =====================================================

-- Create a view for user permissions with role-based defaults
CREATE OR REPLACE VIEW user_permissions_view AS
SELECT
    u.id as user_id,
    u.role,
    u.permissions as custom_permissions,
    CASE
        WHEN u.role = 'super_admin' THEN ARRAY[
            'users.*', 'products.*', 'orders.*', 'categories.*', 'customers.*',
            'suppliers.*', 'reports.*', 'inventory.*', 'settings.*', 'stores.*'
        ]
        WHEN u.role = 'admin' THEN ARRAY[
            'users.read', 'users.create', 'users.update', 'users.delete', 'users.invite',
            'products.read', 'products.create', 'products.update', 'products.delete',
            'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.void',
            'categories.read', 'categories.create', 'categories.update', 'categories.delete',
            'customers.read', 'customers.create', 'customers.update', 'customers.delete',
            'suppliers.read', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
            'reports.read', 'reports.export', 'inventory.read', 'inventory.update',
            'settings.read', 'settings.update', 'stores.read', 'stores.update'
        ]
        WHEN u.role = 'manager' THEN ARRAY[
            'products.read', 'products.create', 'products.update',
            'orders.read', 'orders.create', 'orders.update', 'orders.void',
            'categories.read', 'categories.create', 'categories.update',
            'customers.read', 'customers.create', 'customers.update',
            'suppliers.read', 'suppliers.create', 'suppliers.update',
            'reports.read', 'reports.export', 'inventory.read', 'inventory.update'
        ]
        WHEN u.role = 'cashier' THEN ARRAY[
            'products.read', 'orders.read', 'orders.create', 'orders.update',
            'customers.read', 'customers.create', 'customers.update',
            'inventory.read'
        ]
        WHEN u.role = 'seller' THEN ARRAY[
            'products.read', 'orders.read', 'orders.create',
            'customers.read', 'customers.create'
        ]
        ELSE ARRAY[]::TEXT[]
    END as role_permissions,
    array_cat(
        CASE
            WHEN u.role = 'super_admin' THEN ARRAY[
                'users.*', 'products.*', 'orders.*', 'categories.*', 'customers.*',
                'suppliers.*', 'reports.*', 'inventory.*', 'settings.*', 'stores.*'
            ]
            WHEN u.role = 'admin' THEN ARRAY[
                'users.read', 'users.create', 'users.update', 'users.delete', 'users.invite',
                'products.read', 'products.create', 'products.update', 'products.delete',
                'orders.read', 'orders.create', 'orders.update', 'orders.delete', 'orders.void',
                'categories.read', 'categories.create', 'categories.update', 'categories.delete',
                'customers.read', 'customers.create', 'customers.update', 'customers.delete',
                'suppliers.read', 'suppliers.create', 'suppliers.update', 'suppliers.delete',
                'reports.read', 'reports.export', 'inventory.read', 'inventory.update',
                'settings.read', 'settings.update', 'stores.read', 'stores.update'
            ]
            WHEN u.role = 'manager' THEN ARRAY[
                'products.read', 'products.create', 'products.update',
                'orders.read', 'orders.create', 'orders.update', 'orders.void',
                'categories.read', 'categories.create', 'categories.update',
                'customers.read', 'customers.create', 'customers.update',
                'suppliers.read', 'suppliers.create', 'suppliers.update',
                'reports.read', 'reports.export', 'inventory.read', 'inventory.update'
            ]
            WHEN u.role = 'cashier' THEN ARRAY[
                'products.read', 'orders.read', 'orders.create', 'orders.update',
                'customers.read', 'customers.create', 'customers.update',
                'inventory.read'
            ]
            WHEN u.role = 'seller' THEN ARRAY[
                'products.read', 'orders.read', 'orders.create',
                'customers.read', 'customers.create'
            ]
            ELSE ARRAY[]::TEXT[]
        END,
        COALESCE(u.permissions, ARRAY[]::TEXT[])
    ) as all_permissions
FROM users u;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Organizations represent the top-level entities in the system';
COMMENT ON TABLE stores IS 'Stores belong to organizations and contain inventory and users';
COMMENT ON TABLE users IS 'Users belong to organizations and stores with specific roles and permissions';
COMMENT ON TABLE audit_logs IS 'Audit trail for all system actions and changes';
COMMENT ON FUNCTION user_has_permission(UUID, TEXT) IS 'Checks if a user has a specific permission based on role and custom permissions';
COMMENT ON FUNCTION get_user_permissions(UUID) IS 'Returns all permissions for a user';
COMMENT ON FUNCTION log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB) IS 'Logs an audit event for tracking system changes';