-- Migration script to add missing columns to profiles table
-- Run this in your Supabase SQL Editor

-- Add phone column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone text;
    END IF;
END $$;

-- Add address column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN address text;
    END IF;
END $$;

-- Verify columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN ('phone', 'address')
ORDER BY column_name;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Columns added successfully! You can now use phone and address fields in profile settings.';
END $$;
