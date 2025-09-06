-- Migration: add invited_user_id to user_invitations (safe, idempotent)

ALTER TABLE IF EXISTS user_invitations
  ADD COLUMN IF NOT EXISTS invited_user_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_user_id ON user_invitations(invited_user_id);

COMMENT ON COLUMN user_invitations.invited_user_id IS 'Reference to the created auth user once invitation is accepted';

-- End migration
