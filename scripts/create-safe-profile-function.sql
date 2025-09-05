-- Create a security definer function to safely get user profiles without RLS recursion
CREATE OR REPLACE FUNCTION get_user_profile_safe(user_uuid UUID)
RETURNS TABLE (
    id UUID,
    role TEXT,
    organization_id UUID,
    store_id UUID,
    status TEXT,
    is_store_owner BOOLEAN
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
    -- Return user profile data without triggering RLS recursion
    RETURN QUERY
    SELECT
        u.id,
        u.role::TEXT,
        u.organization_id,
        u.store_id,
        u.status::TEXT,
        u.is_store_owner
    FROM users u
    WHERE u.id = user_uuid;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_profile_safe(UUID) TO authenticated;