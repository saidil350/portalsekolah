-- =====================================================
-- FIX ALL RECURSIVE RLS POLICIES ACROSS ALL TABLES
-- =====================================================
-- Problem: Infinite recursion in RLS policies for classes, roster, and other tables
-- Root Cause: Policies on these tables use "(SELECT organization_id FROM profiles WHERE id = auth.uid())"
--   which triggers profiles RLS policy, creating circular dependencies
-- Solution: Use helper functions (get_auth_organization_id, get_auth_role) with SECURITY DEFINER
--   that bypass RLS when checking current user's org/role

-- Enable necessary extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ENSURE HELPER FUNCTIONS EXIST AND WORK CORRECTLY
-- =====================================================

-- Drop if exists to recreate with proper settings
DROP FUNCTION IF EXISTS get_auth_organization_id() CASCADE;
DROP FUNCTION IF EXISTS get_auth_role() CASCADE;
DROP FUNCTION IF EXISTS is_admin_it() CASCADE;
DROP FUNCTION IF EXISTS check_organization_access(UUID) CASCADE;

-- Helper: Get current user's organization_id (bypasses RLS)
CREATE OR REPLACE FUNCTION get_auth_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

-- Helper: Get current user's role (bypasses RLS)
CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper: Check if current user is ADMIN_IT (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin_it()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((SELECT role FROM profiles WHERE id = auth.uid()) = 'ADMIN_IT', false);
$$;

-- Helper: Check if table record belongs to current user's organization
CREATE OR REPLACE FUNCTION check_organization_access(table_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT table_organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid());
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_auth_organization_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_role TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin_it TO authenticated;
GRANT EXECUTE ON FUNCTION check_organization_access TO authenticated;

-- =====================================================
-- 2. PROFILES TABLE - Use non-recursive policies
-- =====================================================

-- Drop all existing policies on profiles
DROP POLICY IF EXISTS "Admin IT can view all users in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin IT can insert users in their organization" ON profiles;
DROP POLICY IF EXISTS "Admin IT can update users in their organization" ON profiles;
DROP POLICY IF EXISTS "Admin IT can delete users in their organization" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new non-recursive policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (organization_id = get_auth_organization_id());

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
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Admin IT can update users in their organization"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Admin IT can delete users in their organization"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
    AND id != auth.uid()
  );

CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. ORGANIZATIONS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Admin IT can view their organization" ON organizations;
DROP POLICY IF EXISTS "Service role can manage organizations" ON organizations;

CREATE POLICY "Admin IT can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    is_admin_it()
    AND id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage organizations"
  ON organizations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 4. CLASSES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view classes in their organization" ON classes;
DROP POLICY IF EXISTS "Admin IT can manage classes in their organization" ON classes;
DROP POLICY IF EXISTS "Service role can manage classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view their assigned classes" ON classes;

CREATE POLICY "Users can view classes in their organization"
  ON classes FOR SELECT
  TO authenticated
  USING (organization_id = get_auth_organization_id());

CREATE POLICY "Admin IT can manage classes in their organization"
  ON classes FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage classes"
  ON classes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 5. CLASS_SCHEDULES TABLE (Roster)
-- =====================================================

DROP POLICY IF EXISTS "Users can view schedules in their organization" ON class_schedules;
DROP POLICY IF EXISTS "Teachers can view their own schedules" ON class_schedules;
DROP POLICY IF EXISTS "Students can view their class schedules" ON class_schedules;
DROP POLICY IF EXISTS "Admin IT can manage schedules in their organization" ON class_schedules;
DROP POLICY IF EXISTS "Service role can manage schedules" ON class_schedules;

CREATE POLICY "Users can view schedules in their organization"
  ON class_schedules FOR SELECT
  TO authenticated
  USING (organization_id = get_auth_organization_id());

CREATE POLICY "Teachers can view their own schedules"
  ON class_schedules FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'TEACHER'
    AND teacher_id = auth.uid()
  );

CREATE POLICY "Students can view their class schedules"
  ON class_schedules FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'STUDENT'
    AND class_id IN (
      SELECT class_id FROM class_enrollments
      WHERE student_id = auth.uid()
    )
  );

CREATE POLICY "Admin IT can manage schedules in their organization"
  ON class_schedules FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage schedules"
  ON class_schedules FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 6. CLASS_ENROLLMENTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view enrollments in their organization" ON class_enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON class_enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments in their classes" ON class_enrollments;
DROP POLICY IF EXISTS "Admin IT can manage enrollments in their organization" ON class_enrollments;
DROP POLICY IF EXISTS "Service role can manage enrollments" ON class_enrollments;

CREATE POLICY "Users can view enrollments in their organization"
  ON class_enrollments FOR SELECT
  TO authenticated
  USING (
    organization_id = get_auth_organization_id()
  );

CREATE POLICY "Students can view their own enrollments"
  ON class_enrollments FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'STUDENT'
    AND student_id = auth.uid()
  );

CREATE POLICY "Teachers can view enrollments in their classes"
  ON class_enrollments FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'TEACHER'
    AND class_id IN (
      SELECT id FROM classes
      WHERE organization_id = get_auth_organization_id()
      AND homeroom_teacher_id = auth.uid()
    )
  );

CREATE POLICY "Admin IT can manage enrollments in their organization"
  ON class_enrollments FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage enrollments"
  ON class_enrollments FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 7. SUBJECTS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view subjects in their organization" ON subjects;
DROP POLICY IF EXISTS "Admin IT can manage subjects in their organization" ON subjects;
DROP POLICY IF EXISTS "Service role can manage subjects" ON subjects;

CREATE POLICY "Users can view subjects in their organization"
  ON subjects FOR SELECT
  TO authenticated
  USING (organization_id = get_auth_organization_id());

CREATE POLICY "Admin IT can manage subjects in their organization"
  ON subjects FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage subjects"
  ON subjects FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 8. SUBJECT_TEACHERS TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view subject teachers in their organization" ON subject_teachers;
DROP POLICY IF EXISTS "Teachers can view their own subject assignments" ON subject_teachers;
DROP POLICY IF EXISTS "Admin IT can manage subject teachers in their organization" ON subject_teachers;
DROP POLICY IF EXISTS "Service role can manage subject teachers" ON subject_teachers;

CREATE POLICY "Users can view subject teachers in their organization"
  ON subject_teachers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM subjects
      WHERE subjects.id = subject_teachers.subject_id
      AND subjects.organization_id = get_auth_organization_id()
    )
  );

CREATE POLICY "Teachers can view their own subject assignments"
  ON subject_teachers FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'TEACHER'
    AND teacher_id = auth.uid()
  );

CREATE POLICY "Admin IT can manage subject teachers in their organization"
  ON subject_teachers FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND EXISTS (
      SELECT 1 FROM subjects
      WHERE subjects.id = subject_teachers.subject_id
      AND subjects.organization_id = get_auth_organization_id()
    )
  )
  WITH CHECK (
    is_admin_it()
    AND EXISTS (
      SELECT 1 FROM subjects
      WHERE subjects.id = subject_teachers.subject_id
      AND subjects.organization_id = get_auth_organization_id()
    )
  );

CREATE POLICY "Service role can manage subject teachers"
  ON subject_teachers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 9. ATTENDANCE TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view attendance in their organization" ON attendance;
DROP POLICY IF EXISTS "Students can view their own attendance" ON attendance;
DROP POLICY IF EXISTS "Teachers can manage attendance for their classes" ON attendance;
DROP POLICY IF EXISTS "Admin IT can manage attendance in their organization" ON attendance;
DROP POLICY IF EXISTS "Service role can manage attendance" ON attendance;

CREATE POLICY "Users can view attendance in their organization"
  ON attendance FOR SELECT
  TO authenticated
  USING (organization_id = get_auth_organization_id());

CREATE POLICY "Students can view their own attendance"
  ON attendance FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'STUDENT'
    AND student_id = auth.uid()
  );

CREATE POLICY "Teachers can manage attendance for their classes"
  ON attendance FOR ALL
  TO authenticated
  USING (
    get_auth_role() = 'TEACHER'
    AND organization_id = get_auth_organization_id()
    AND class_id IN (
      SELECT id FROM classes
      WHERE organization_id = get_auth_organization_id()
      AND homeroom_teacher_id = auth.uid()
    )
  )
  WITH CHECK (
    get_auth_role() = 'TEACHER'
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Admin IT can manage attendance in their organization"
  ON attendance FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage attendance"
  ON attendance FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 10. GRADES TABLE
-- =====================================================

DROP POLICY IF EXISTS "Users can view grades in their organization" ON grades;
DROP POLICY IF EXISTS "Students can view their own grades" ON grades;
DROP POLICY IF EXISTS "Teachers can manage grades for their classes" ON grades;
DROP POLICY IF EXISTS "Admin IT can manage grades in their organization" ON grades;
DROP POLICY IF EXISTS "Service role can manage grades" ON grades;

CREATE POLICY "Users can view grades in their organization"
  ON grades FOR SELECT
  TO authenticated
  USING (organization_id = get_auth_organization_id());

CREATE POLICY "Students can view their own grades"
  ON grades FOR SELECT
  TO authenticated
  USING (
    get_auth_role() = 'STUDENT'
    AND student_id = auth.uid()
  );

CREATE POLICY "Teachers can manage grades for their classes"
  ON grades FOR ALL
  TO authenticated
  USING (
    get_auth_role() = 'TEACHER'
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    get_auth_role() = 'TEACHER'
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Admin IT can manage grades in their organization"
  ON grades FOR ALL
  TO authenticated
  USING (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    is_admin_it()
    AND organization_id = get_auth_organization_id()
  );

CREATE POLICY "Service role can manage grades"
  ON grades FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- LOG AND VERIFY
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'RLS RECURSION FIX COMPLETED';
  RAISE NOTICE 'All policies now use helper functions:';
  RAISE NOTICE '  - get_auth_organization_id()';
  RAISE NOTICE '  - get_auth_role()';
  RAISE NOTICE '  - is_admin_it()';
  RAISE NOTICE '  - check_organization_access()';
  RAISE NOTICE '========================================';
END $$;
