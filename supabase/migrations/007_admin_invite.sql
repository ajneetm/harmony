-- Add doctor_email to harmony.profiles
ALTER TABLE harmony.profiles
  ADD COLUMN IF NOT EXISTS doctor_email TEXT;

-- Update admin_get_users to also return doctor_email
CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id              UUID,
  email           TEXT,
  name            TEXT,
  role            TEXT,
  doctor_email    TEXT,
  created_at      TIMESTAMPTZ,
  last_sign_in_at TIMESTAMPTZ
)
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
AS $$
  SELECT
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name'
    )                            AS name,
    COALESCE(p.role, 'user')    AS role,
    p.doctor_email               AS doctor_email,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  INNER JOIN harmony.profiles p ON p.id = u.id
  WHERE
    is_admin()
    OR (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
  ORDER BY u.created_at DESC;
$$;

-- Update update_user_role to use is_admin() and support doctor_email
CREATE OR REPLACE FUNCTION update_user_role(target_id UUID, new_role TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT (is_admin() OR (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO harmony.profiles (id, role)
  VALUES (target_id, new_role)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;

-- Update delete_user to use is_admin()
CREATE OR REPLACE FUNCTION delete_user(target_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT (is_admin() OR (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com') THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM auth.users WHERE id = target_id;
END;
$$;
