-- =====================================================
-- CREATE SUBJECT_TEACHERS TABLE
-- =====================================================
-- This table creates a many-to-many relationship between subjects and teachers
-- One subject can have multiple teachers, and one teacher can teach multiple subjects

DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS subject_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Prevent duplicate assignments
    UNIQUE(subject_id, teacher_id)
  );

  -- Add comment
  COMMENT ON TABLE subject_teachers IS 'Many-to-many relationship between subjects and teachers. Tracks which teachers teach which subjects.';

  RAISE NOTICE 'Table subject_teachers created successfully';
END $$;

-- =====================================================
-- CREATE INDEXES FOR FASTER QUERIES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_subject_teachers_subject_id ON subject_teachers(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_teachers_teacher_id ON subject_teachers(teacher_id);
CREATE INDEX IF NOT EXISTS idx_subject_teachers_is_primary ON subject_teachers(is_primary);

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE subject_teachers ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Admin IT can do everything
CREATE POLICY "Admin IT full access on subject_teachers"
  ON subject_teachers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN_IT'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN_IT'
    )
  );

-- Teachers can view subject assignments
CREATE POLICY "Teachers can view subject_teachers"
  ON subject_teachers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'GURU'
    )
  );

-- Students can view which teachers teach their subjects
CREATE POLICY "Students can view subject_teachers"
  ON subject_teachers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'SISWA'
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUBJECT_TEACHERS TABLE CREATED';
  RAISE NOTICE 'Policies configured for:';
  RAISE NOTICE '- Admin IT: Full access';
  RAISE NOTICE '- Teachers: Read access';
  RAISE NOTICE '- Students: Read access';
  RAISE NOTICE '========================================';
END $$;
