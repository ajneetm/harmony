-- Update RPCs to allow any user with role='admin' in harmony.profiles
-- (keeps original email as fallback for safety)

CREATE OR REPLACE FUNCTION admin_get_users()
RETURNS TABLE (
  id              UUID,
  email           TEXT,
  name            TEXT,
  role            TEXT,
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
    u.raw_user_meta_data->>'full_name' AS name,
    COALESCE(p.role, 'user')           AS role,
    u.created_at,
    u.last_sign_in_at
  FROM auth.users u
  LEFT JOIN harmony.profiles p ON p.id = u.id
  WHERE
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (
      SELECT 1 FROM harmony.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  ORDER BY u.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION update_user_role(target_id UUID, new_role TEXT)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  INSERT INTO harmony.profiles (id, role)
  VALUES (target_id, new_role)
  ON CONFLICT (id) DO UPDATE SET role = EXCLUDED.role;
END;
$$;

CREATE OR REPLACE FUNCTION delete_user(target_id UUID)
RETURNS VOID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  DELETE FROM auth.users WHERE id = target_id;
END;
$$;
