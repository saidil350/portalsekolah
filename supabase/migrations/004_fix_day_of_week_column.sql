-- =====================================================
-- FIX: Rename Indonesian columns to English in class_schedules
-- This ensures consistency with the codebase
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'Starting migration: Fixing class_schedules column names...';

    -- 1. Rename 'hari' to 'day_of_week'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'class_schedules' AND column_name = 'hari'
    ) THEN
        ALTER TABLE class_schedules RENAME COLUMN hari TO day_of_week;
        RAISE NOTICE '✓ Renamed "hari" to "day_of_week"';
    ELSE
        RAISE NOTICE '⊘ Column "hari" does not exist (may already be renamed)';
    END IF;

    -- 2. Rename 'jam_mulai' to 'start_time'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'class_schedules' AND column_name = 'jam_mulai'
    ) THEN
        ALTER TABLE class_schedules RENAME COLUMN jam_mulai TO start_time;
        RAISE NOTICE '✓ Renamed "jam_mulai" to "start_time"';
    ELSE
        RAISE NOTICE '⊘ Column "jam_mulai" does not exist (may already be renamed)';
    END IF;

    -- 3. Rename 'jam_selesai' to 'end_time'
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'class_schedules' AND column_name = 'jam_selesai'
    ) THEN
        ALTER TABLE class_schedules RENAME COLUMN jam_selesai TO end_time;
        RAISE NOTICE '✓ Renamed "jam_selesai" to "end_time"';
    ELSE
        RAISE NOTICE '⊘ Column "jam_selesai" does not exist (may already be renamed)';
    END IF;

    RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Verify the changes
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'class_schedules'
AND column_name IN ('hari', 'day_of_week', 'jam_mulai', 'start_time', 'jam_selesai', 'end_time')
ORDER BY column_name;
