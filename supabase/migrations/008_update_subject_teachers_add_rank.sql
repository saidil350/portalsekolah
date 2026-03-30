-- =====================================================
-- UPDATE SUBJECT_TEACHERS TABLE - ADD TEACHER_RANK
-- =====================================================
-- Mengganti sistem is_primary dengan teacher_rank_id yang lebih fleksibel

DO $$
BEGIN
  -- Check if teacher_rank_id column exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'subject_teachers'
    AND column_name = 'teacher_rank_id'
  ) THEN
    -- Add teacher_rank_id column
    ALTER TABLE subject_teachers ADD COLUMN teacher_rank_id UUID REFERENCES teacher_ranks(id) ON DELETE SET NULL;

    RAISE NOTICE 'Column teacher_rank_id added to subject_teachers';
  ELSE
    RAISE NOTICE 'Column teacher_rank_id already exists in subject_teachers';
  END IF;

  -- Migrate existing is_primary=true data to Guru Utama rank
  -- This is a one-time migration
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'subject_teachers'
    AND column_name = 'is_primary'
  ) THEN
    -- Update records with is_primary=true to use Guru Utama rank
    UPDATE subject_teachers st
    SET teacher_rank_id = (
      SELECT id FROM teacher_ranks WHERE code = 'UTAMA' LIMIT 1
    )
    WHERE st.is_primary = true AND st.teacher_rank_id IS NULL;

    RAISE NOTICE 'Migrated is_primary data to teacher_rank_id';
  END IF;
END $$;

-- Drop is_primary column if it exists and migration is complete
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'subject_teachers'
    AND column_name = 'is_primary'
  ) THEN
    -- Optionally keep the column for backwards compatibility, or drop it:
    -- ALTER TABLE subject_teachers DROP COLUMN is_primary;

    RAISE NOTICE 'Column is_primary still exists (can be dropped later)';
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subject_teachers_rank ON subject_teachers(teacher_rank_id);

-- Update unique constraint to include teacher_rank_id (optional, removes duplicate rank assignments)
-- ALTER TABLE subject_teachers DROP CONSTRAINT IF EXISTS subject_teachers_subject_id_teacher_id_key;
-- ALTER TABLE subject_teachers ADD CONSTRAINT subject_teachers_subject_teacher_rank_key UNIQUE (subject_id, teacher_id, teacher_rank_id);

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'SUBJECT_TEACHERS UPDATED';
  RAISE NOTICE 'Added: teacher_rank_id column';
  RAISE NOTICE 'Reference: teacher_ranks (id)';
  RAISE NOTICE 'Index created for performance';
  RAISE NOTICE '========================================';
END $$;
