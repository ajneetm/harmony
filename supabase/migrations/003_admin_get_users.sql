-- Admin-only function to list all auth users
CREATE OR REPLACE FUNCTION get_all_users()
RETURNS TABLE (
  id              UUID,
  email           TEXT,
  name            TEXT,
  created_at      TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT
    id,
    email,
    raw_user_meta_data->>'full_name' AS name,
    created_at,
    last_sign_in_at
  FROM auth.users
  WHERE (SELECT (auth.jwt() ->> 'email')) = 'a.hajali@ajnee.com'
  ORDER BY created_at DESC;
$$;
