-- =====================================================
-- FIX RLS POLICIES - SIMPLER VERSION
-- =====================================================

-- Step 1: Enable RLS on profiles (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 2: Drop existing policies on profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Step 3: Create simple policies for profiles
-- Allow users to see their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Allow authenticated users to see basic info (needed for lookups)
CREATE POLICY "Authenticated users can view basic profile info"
    ON profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- FIX CLASSES TABLE RLS - SIMPLER VERSION
-- =====================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Admin IT full access to classes" ON classes;
DROP POLICY IF EXISTS "Teachers and Headmasters can view classes" ON classes;
DROP POLICY IF EXISTS "Students can view their own classes" ON classes;

-- Create SECURITY DEFINER function to check role
CREATE OR REPLACE FUNCTION check_user_role(user_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute on function
GRANT EXECUTE ON FUNCTION check_user_role TO authenticated;

-- Simple Admin IT policy using the function
CREATE POLICY "Admin IT full access to classes"
    ON classes FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- Teachers and Headmasters can view active classes
CREATE POLICY "Teachers and Headmasters can view classes"
    ON classes FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND check_user_role('GURU')
        OR check_user_role('KEPALA_SEKOLAH')
    );

-- Students can view their enrolled classes
CREATE POLICY "Students can view their own classes"
    ON classes FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND check_user_role('SISWA')
        AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.class_id = classes.id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'ACTIVE'
        )
    );

-- =====================================================
-- FIX ENROLLMENTS TABLE RLS
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments for their classes" ON enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;
DROP POLICY IF EXISTS "Allow enrollment for authenticated users" ON enrollments;

CREATE POLICY "Admin IT full access to enrollments"
    ON enrollments FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Teachers can view enrollments for their classes"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        check_user_role('GURU')
        AND EXISTS (
            SELECT 1 FROM class_schedules
            WHERE class_schedules.class_id = enrollments.class_id
            AND class_schedules.teacher_id = auth.uid()
        )
    );

CREATE POLICY "Students can view their own enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        check_user_role('SISWA')
        AND student_id = auth.uid()
    );

-- =====================================================
-- FIX CLASS SCHEDULES TABLE RLS
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access to class_schedules" ON class_schedules;
DROP POLICY IF EXISTS "Teachers can view their own schedules" ON class_schedules;
DROP POLICY IF EXISTS "Students can view their class schedules" ON class_schedules;

CREATE POLICY "Admin IT full access to class_schedules"
    ON class_schedules FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Teachers can view their own schedules"
    ON class_schedules FOR SELECT
    TO authenticated
    USING (
        check_user_role('GURU')
        AND teacher_id = auth.uid()
    );

CREATE POLICY "Students can view their class schedules"
    ON class_schedules FOR SELECT
    TO authenticated
    USING (
        check_user_role('SISWA')
        AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.class_id = class_schedules.class_id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'ACTIVE'
        )
    );

-- =====================================================
-- FIX DROPDOWN TABLES RLS
-- =====================================================

-- Enable RLS if not already enabled
ALTER TABLE class_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Class levels
DROP POLICY IF EXISTS "Authenticated users can view class_levels" ON class_levels;
DROP POLICY IF EXISTS "Admin IT can manage class_levels" ON class_levels;

CREATE POLICY "Authenticated users can view class_levels"
    ON class_levels FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage class_levels"
    ON class_levels FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- Departments
DROP POLICY IF EXISTS "Authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Admin IT can manage departments" ON departments;

CREATE POLICY "Authenticated users can view departments"
    ON departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage departments"
    ON departments FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- Academic years
DROP POLICY IF EXISTS "Authenticated users can view academic_years" ON academic_years;
DROP POLICY IF EXISTS "Admin IT can manage academic_years" ON academic_years;

CREATE POLICY "Authenticated users can view academic_years"
    ON academic_years FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage academic_years"
    ON academic_years FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- Rooms
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON rooms;
DROP POLICY IF EXISTS "Admin IT can manage rooms" ON rooms;

CREATE POLICY "Authenticated users can view rooms"
    ON rooms FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage rooms"
    ON rooms FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- Subjects
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON subjects;
DROP POLICY IF EXISTS "Admin IT can manage subjects" ON subjects;

CREATE POLICY "Authenticated users can view subjects"
    ON subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage subjects"
    ON subjects FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- =====================================================
-- PARENT STUDENT RELATIONSHIPS
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access to parent_student_relationships" ON parent_student_relationships;
DROP POLICY IF EXISTS "Parents can view their relationships" ON parent_student_relationships;

CREATE POLICY "Admin IT full access to parent_student_relationships"
    ON parent_student_relationships FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Parents can view their relationships"
    ON parent_student_relationships FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid());

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES UPDATED SUCCESSFULLY';
    RAISE NOTICE 'Function check_user_role created';
    RAISE NOTICE 'All tables now use simplified RLS policies';
    RAISE NOTICE '========================================';
END $$;
