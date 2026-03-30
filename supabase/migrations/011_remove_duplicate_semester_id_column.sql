-- =====================================================
-- Remove duplicate semester_id column from class_schedules
-- The table now uses 'semester' (INTEGER 1 or 2) instead of 'semester_id' (UUID FK)
-- =====================================================

DO $$
BEGIN
  -- Check if semester_id column exists
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'class_schedules'
    AND column_name = 'semester_id'
  ) THEN
    -- Drop the semester_id column (we're using 'semester' integer column instead)
    ALTER TABLE class_schedules
    DROP COLUMN IF EXISTS semester_id;

    RAISE NOTICE '✓ Dropped semester_id column from class_schedules';
  ELSE
    RAISE NOTICE '⊘ semester_id column does not exist (already removed)';
  END IF;
END $$;
