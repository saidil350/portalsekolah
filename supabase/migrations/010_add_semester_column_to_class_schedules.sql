-- =====================================================
-- Add semester column to class_schedules if it doesn't exist
-- =====================================================

DO $$
BEGIN
  -- Check if semester column exists, if not add it
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'class_schedules'
    AND column_name = 'semester'
  ) THEN
    ALTER TABLE class_schedules
    ADD COLUMN semester INTEGER CHECK (semester IN (1,2));

    RAISE NOTICE '✓ Added semester column to class_schedules';
  ELSE
    RAISE NOTICE '⊘ semester column already exists in class_schedules';
  END IF;
END $$;
