-- =====================================================
-- Add level_order column to class_levels table
-- Fixes: column class_levels.level_order does not exist
-- =====================================================

-- Check if column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'class_levels'
    AND column_name = 'level_order'
  ) THEN
    ALTER TABLE class_levels ADD COLUMN level_order INTEGER NOT NULL DEFAULT 1;

    -- Add unique constraint on level_order
    ALTER TABLE class_levels ADD CONSTRAINT class_levels_level_order_key UNIQUE (level_order);
  END IF;
END $$;

-- Update existing records to have proper level_order
UPDATE class_levels
SET level_order = CASE code
  WHEN 'X' THEN 1
  WHEN 'XI' THEN 2
  WHEN 'XII' THEN 3
  WHEN 'VII' THEN 1
  WHEN 'VIII' THEN 2
  WHEN 'IX' THEN 3
  WHEN 'X' THEN 4
  WHEN 'XI' THEN 5
  WHEN 'XII' THEN 6
  ELSE 1
END
WHERE level_order = 1; -- Only update if still default

-- Verify the column was added
SELECT
  id,
  name,
  code,
  level_order,
  is_active
FROM class_levels
ORDER BY level_order;
