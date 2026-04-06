-- =====================================================
-- Fix RLS recursion on profiles table
-- =====================================================
-- Problem: policies on profiles referenced profiles again, causing
-- "infinite recursion detected in policy for relation \"profiles\"".
-- Solution: use SECURITY DEFINER helper functions to read the current
-- user's org/role without invoking profiles RLS, then rewrite policies.

-- 1. Helper functions (bypass RLS via SECURITY DEFINER)
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin_it()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT COALESCE((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN_IT', false);
$$;

GRANT EXECUTE ON FUNCTION current_org_id TO authenticated;
GRANT EXECUTE ON FUNCTION current_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_it TO authenticated;

-- 2. Drop recursive/incorrect policies
DROP POLICY IF EXISTS "Admin IT can view all users in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin IT can insert users in their organization" ON profiles;
DROP POLICY IF EXISTS "Admin IT can update users in their organization" ON profiles;
DROP POLICY IF EXISTS "Admin IT can delete users in their organization" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- 3. Recreate safe policies (non-recursive)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (organization_id = current_org_id());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admin IT can insert users in their organization"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin_it()
    AND organization_id = current_org_id()
  );

CREATE POLICY "Admin IT can update users in their organization"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = current_org_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = current_org_id()
  );

CREATE POLICY "Admin IT can delete users in their organization"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = current_org_id()
    AND id != auth.uid()
  );

CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON FUNCTION current_org_id IS 'Return organization_id for current user without triggering RLS recursion';
COMMENT ON FUNCTION current_user_role IS 'Return role for current user without triggering RLS recursion';
COMMENT ON FUNCTION is_admin_it IS 'Check if current user role is ADMIN_IT without triggering RLS recursion';
