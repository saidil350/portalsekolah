-- =====================================================
-- Update RLS Policies for Multi-Organization Support
-- =====================================================
-- This migration updates Row Level Security policies to ensure
-- data isolation between organizations (tenants)

-- =====================================================
-- 1. ORGANIZATIONS TABLE POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Admin IT can see their own organization
CREATE POLICY "Admin IT can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'ADMIN_IT'
      AND profiles.organization_id = organizations.id
    )
  );

-- Only service role can insert/update/delete organizations
CREATE POLICY "Service role can manage organizations"
  ON organizations FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 2. PROFILES TABLE POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

-- Admin IT can view all users in their organization
CREATE POLICY "Admin IT can view all users in their organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id IN (
      SELECT organization_id FROM profiles
      WHERE id = auth.uid()
    )
  );

-- Users can view profiles in their organization
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin IT can insert users in their organization
CREATE POLICY "Admin IT can insert users in their organization"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    role = 'ADMIN_IT'
    AND organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Admin IT can update users in their organization
CREATE POLICY "Admin IT can update users in their organization"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = profiles.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = profiles.organization_id
    )
  );

-- Admin IT can delete users in their organization (with restrictions)
CREATE POLICY "Admin IT can delete users in their organization"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = profiles.organization_id
    )
    AND id != auth.uid() -- Cannot delete self
  );

-- Service role full access
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 3. ACADEMIC YEARS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access to academic_years" ON academic_years;
DROP POLICY IF EXISTS "Teachers and Headmasters can view academic_years" ON academic_years;

CREATE POLICY "Organization members can view their academic_years"
  ON academic_years FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage academic_years in their organization"
  ON academic_years FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = academic_years.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = academic_years.organization_id
    )
  );

-- =====================================================
-- 4. CLASS LEVELS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view class_levels" ON class_levels;
DROP POLICY IF EXISTS "Admin IT can manage class_levels" ON class_levels;

CREATE POLICY "Organization members can view their class_levels"
  ON class_levels FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage class_levels in their organization"
  ON class_levels FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = class_levels.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = class_levels.organization_id
    )
  );

-- =====================================================
-- 5. DEPARTMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view departments" ON departments;
DROP POLICY IF EXISTS "Admin IT can manage departments" ON departments;

CREATE POLICY "Organization members can view their departments"
  ON departments FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage departments in their organization"
  ON departments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = departments.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = departments.organization_id
    )
  );

-- =====================================================
-- 6. CLASSES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view classes" ON classes;
DROP POLICY IF EXISTS "Admin IT can manage classes" ON classes;

CREATE POLICY "Organization members can view their classes"
  ON classes FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage classes in their organization"
  ON classes FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = classes.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = classes.organization_id
    )
  );

-- =====================================================
-- 7. ENROLLMENTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments for their classes" ON enrollments;
DROP POLICY IF EXISTS "Admin IT can manage enrollments" ON enrollments;

CREATE POLICY "Organization members can view enrollments in their organization"
  ON enrollments FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage enrollments in their organization"
  ON enrollments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = enrollments.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = enrollments.organization_id
    )
  );

-- =====================================================
-- 8. CLASS SCHEDULES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view class_schedules" ON class_schedules;
DROP POLICY IF EXISTS "Admin IT can manage class_schedules" ON class_schedules;

CREATE POLICY "Organization members can view their class_schedules"
  ON class_schedules FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage class_schedules in their organization"
  ON class_schedules FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = class_schedules.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = class_schedules.organization_id
    )
  );

-- =====================================================
-- 9. SUBJECTS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view subjects" ON subjects;
DROP POLICY IF EXISTS "Admin IT can manage subjects" ON subjects;

CREATE POLICY "Organization members can view their subjects"
  ON subjects FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage subjects in their organization"
  ON subjects FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = subjects.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = subjects.organization_id
    )
  );

-- =====================================================
-- 10. ROOMS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view rooms" ON rooms;
DROP POLICY IF EXISTS "Admin IT can manage rooms" ON rooms;

CREATE POLICY "Organization members can view their rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage rooms in their organization"
  ON rooms FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = rooms.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = rooms.organization_id
    )
  );

-- =====================================================
-- 11. SEMESTERS TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Organization members can view semesters" ON semesters;
DROP POLICY IF EXISTS "Admin IT can manage semesters" ON semesters;

CREATE POLICY "Organization members can view their semesters"
  ON semesters FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage semesters in their organization"
  ON semesters FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = semesters.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = semesters.organization_id
    )
  );

-- =====================================================
-- 12. TEACHER_RANKS TABLE POLICIES
-- =====================================================

CREATE POLICY "Organization members can view their teacher_ranks"
  ON teacher_ranks FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage teacher_ranks in their organization"
  ON teacher_ranks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = teacher_ranks.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = teacher_ranks.organization_id
    )
  );

-- =====================================================
-- 13. SUBJECT_TEACHERS TABLE POLICIES
-- =====================================================

CREATE POLICY "Organization members can view their subject_teachers"
  ON subject_teachers FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can manage subject_teachers in their organization"
  ON subject_teachers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = subject_teachers.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = subject_teachers.organization_id
    )
  );

-- =====================================================
-- 14. ORGANIZATION_SETTINGS TABLE POLICIES
-- =====================================================

ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can view their settings"
  ON organization_settings FOR SELECT
  TO authenticated
  USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admin IT can update their organization settings"
  ON organization_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = organization_settings.organization_id
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'ADMIN_IT'
      AND organization_id = organization_settings.organization_id
    )
  );

-- Service role full access
CREATE POLICY "Service role can manage organization_settings"
  ON organization_settings FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- 15. CREATE HELPER FUNCTION FOR ORGANIZATION ISOLATION
-- =====================================================

CREATE OR REPLACE FUNCTION check_organization_access(table_organization_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN table_organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant usage
GRANT EXECUTE ON FUNCTION check_organization_access TO authenticated;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION check_organization_access IS 'Helper function to check if user can access data from a specific organization';
