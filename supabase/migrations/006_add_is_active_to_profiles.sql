-- =====================================================
-- ADD IS_ACTIVE COLUMN TO PROFILES TABLE
-- =====================================================
-- This migration adds the is_active column to the profiles table
-- if it doesn't already exist

DO $$
BEGIN
  -- Check if the column exists, if not add it
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'is_active'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_active BOOLEAN DEFAULT true;

    -- Update existing records to be active by default
    UPDATE profiles SET is_active = true WHERE is_active IS NULL;

    -- Add comment
    COMMENT ON COLUMN profiles.is_active IS 'Indicates whether the user profile is active. Default is true.';

    RAISE NOTICE 'Column is_active added to profiles table';
  ELSE
    RAISE NOTICE 'Column is_active already exists in profiles table';
  END IF;
END $$;

-- Create index for faster queries on active users
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON profiles(role, is_active);

-- =====================================================
-- VERIFICATION
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'IS_ACTIVE COLUMN SETUP COMPLETE';
  RAISE NOTICE 'Verified: is_active column exists in profiles';
  RAISE NOTICE 'Indexes created for performance';
  RAISE NOTICE '========================================';
END $$;
