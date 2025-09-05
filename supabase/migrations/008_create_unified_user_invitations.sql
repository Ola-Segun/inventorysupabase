-- =====================================================
-- UNIFIED USER INVITATIONS SYSTEM
-- Migration to create consolidated user_invitations table
-- =====================================================

-- Create invitation status enum
DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create unified user_invitations table
CREATE TABLE IF NOT EXISTS user_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role user_role DEFAULT 'seller',
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    invited_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitation_token VARCHAR(255) UNIQUE NOT NULL,
    status invitation_status DEFAULT 'pending',
    message TEXT,
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    accepted_at TIMESTAMPTZ,
    accepted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    cancelled_at TIMESTAMPTZ,
    cancelled_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_store_id ON user_invitations(store_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_organization_id ON user_invitations(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies (temporary - will be updated after helper functions are available)
-- For now, allow authenticated users to access invitations
-- TODO: Update these policies once get_user_org_safe and get_user_role_safe functions are available

DROP POLICY IF EXISTS "Authenticated users can access invitations" ON user_invitations;
CREATE POLICY "Authenticated users can access invitations" ON user_invitations
    FOR ALL USING (auth.uid() IS NOT NULL);

-- Function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
    UPDATE user_invitations
    SET status = 'expired', updated_at = NOW()
    WHERE status = 'pending'
      AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
DROP TRIGGER IF EXISTS update_user_invitations_updated_at ON user_invitations;
CREATE TRIGGER update_user_invitations_updated_at
    BEFORE UPDATE ON user_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE user_invitations IS 'Unified table for all user invitations in the system';
COMMENT ON COLUMN user_invitations.invitation_token IS 'Secure token used in invitation URLs';
COMMENT ON COLUMN user_invitations.status IS 'Current status of the invitation';
COMMENT ON COLUMN user_invitations.message IS 'Optional message from the inviter';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================