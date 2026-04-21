-- ─── Workshops ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workshops (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title_ar    TEXT NOT NULL,
  title_en    TEXT NOT NULL,
  desc_ar     TEXT,
  desc_en     TEXT,
  duration_ar TEXT,
  duration_en TEXT,
  category_ar TEXT,
  category_en TEXT,
  image_url   TEXT,
  is_active   BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workshops_public_read"  ON workshops FOR SELECT USING (true);
CREATE POLICY "workshops_admin_all"    ON workshops FOR ALL USING ((auth.jwt() ->> 'email') = 'a.hajali@ajnee.com');

-- ─── Workshop Enrollments ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS workshop_enrollments (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  workshop_id UUID REFERENCES workshops(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workshop_id)
);

ALTER TABLE workshop_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "enrollments_own"        ON workshop_enrollments FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "enrollments_admin_read" ON workshop_enrollments FOR SELECT USING ((auth.jwt() ->> 'email') = 'a.hajali@ajnee.com');

-- ─── Certificates ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS certificates (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title_ar     TEXT NOT NULL,
  title_en     TEXT NOT NULL,
  issued_by    TEXT NOT NULL,
  issued_at    TIMESTAMPTZ DEFAULT NOW(),
  description  TEXT
);

ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "certificates_own"       ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "certificates_admin_all" ON certificates FOR ALL USING ((auth.jwt() ->> 'email') = 'a.hajali@ajnee.com');

-- ─── Consultations ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consultations (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','replied','closed')),
  admin_reply TEXT,
  replied_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "consultations_own"       ON consultations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "consultations_admin_all" ON consultations FOR ALL USING ((auth.jwt() ->> 'email') = 'a.hajali@ajnee.com');
