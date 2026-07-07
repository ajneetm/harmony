-- Drop old hardcoded-email admin policies and replace with role-based ones

-- ── conversations ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "admin_read_all" ON harmony.conversations;
CREATE POLICY "admin_read_all" ON harmony.conversations FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── workshops ────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "workshops_admin_all" ON harmony.workshops;
CREATE POLICY "workshops_admin_all" ON harmony.workshops FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── workshop_enrollments ─────────────────────────────────────────────────────
DROP POLICY IF EXISTS "enrollments_admin_read" ON harmony.workshop_enrollments;
CREATE POLICY "enrollments_admin_read" ON harmony.workshop_enrollments FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── certificates ─────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "certificates_admin_all" ON harmony.certificates;
CREATE POLICY "certificates_admin_all" ON harmony.certificates FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── consultations ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "consultations_admin_all" ON harmony.consultations;
CREATE POLICY "consultations_admin_all" ON harmony.consultations FOR ALL
  USING (
    (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── profiles (admin can read all) ────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_admin_read" ON harmony.profiles;
CREATE POLICY "profiles_admin_read" ON harmony.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR (auth.jwt() ->> 'email') = 'a.hajali@ajnee.com'
    OR EXISTS (SELECT 1 FROM harmony.profiles WHERE id = auth.uid() AND role = 'admin')
  );
