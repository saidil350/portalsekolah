-- =====================================================
-- ALLOW USERS TO INSERT THEIR OWN PROFILE (SIMPLE VERSION)
-- =====================================================
-- This migration adds a policy to allow authenticated users
-- to insert their own profile during registration
-- This version does NOT use organization_id column

-- Drop existing Admin IT insert policy if exists
DROP POLICY IF EXISTS "Admin IT can insert users in their organization" ON profiles;

-- Add policy allowing users to insert their own profile (for registration)
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Add policy allowing Admin IT to insert other users
CREATE POLICY "Admin IT can insert new users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
    )
  );

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Users can now insert their own profile during registration';
  RAISE NOTICE 'Admin IT can still insert new users';
END $$;
