-- =====================================================
-- FIX RLS POLICIES FOR NEW STRUCTURE
-- =====================================================

-- Create SECURITY DEFINER function to check user role
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

GRANT EXECUTE ON FUNCTION check_user_role TO authenticated;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PROFILES TABLE POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Authenticated users can view basic profile info"
    ON profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage profiles"
    ON profiles FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- =====================================================
-- ACADEMIC YEARS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on academic_years" ON academic_years;
DROP POLICY IF EXISTS "Authenticated read access on academic_years" ON academic_years;

CREATE POLICY "Admin IT full access on academic_years"
    ON academic_years FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Authenticated read access on academic_years"
    ON academic_years FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- SEMESTERS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on semesters" ON semesters;
DROP POLICY IF EXISTS "Authenticated read access on semesters" ON semesters;

CREATE POLICY "Admin IT full access on semesters"
    ON semesters FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Authenticated read access on semesters"
    ON semesters FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- DEPARTMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on departments" ON departments;
DROP POLICY IF EXISTS "Authenticated read access on departments" ON departments;

CREATE POLICY "Admin IT full access on departments"
    ON departments FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Authenticated read access on departments"
    ON departments FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- CLASS LEVELS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on class_levels" ON class_levels;
DROP POLICY IF EXISTS "Authenticated read access on class_levels" ON class_levels;

CREATE POLICY "Admin IT full access on class_levels"
    ON class_levels FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Authenticated read access on class_levels"
    ON class_levels FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- SUBJECTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on subjects" ON subjects;
DROP POLICY IF EXISTS "Authenticated read access on subjects" ON subjects;

CREATE POLICY "Admin IT full access on subjects"
    ON subjects FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Authenticated read access on subjects"
    ON subjects FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- ROOMS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated read access on rooms" ON rooms;

CREATE POLICY "Admin IT full access on rooms"
    ON rooms FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Authenticated read access on rooms"
    ON rooms FOR SELECT
    TO authenticated
    USING (true);

-- =====================================================
-- CLASSES POLICIES (IMPORTANT - ADMIN IT CAN INSERT)
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on classes" ON classes;
DROP POLICY IF EXISTS "Teachers can view classes" ON classes;
DROP POLICY IF EXISTS "Students can view own classes" ON classes;

-- Admin IT can do EVERYTHING on classes
CREATE POLICY "Admin IT full access on classes"
    ON classes FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

-- Teachers can view active classes
CREATE POLICY "Teachers can view classes"
    ON classes FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND check_user_role('GURU')
    );

-- Students can view their enrolled classes
CREATE POLICY "Students can view own classes"
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
-- ENROLLMENTS POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments" ON enrollments;
DROP POLICY IF EXISTS "Students can view own enrollments" ON enrollments;

CREATE POLICY "Admin IT full access on enrollments"
    ON enrollments FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Teachers can view enrollments"
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

CREATE POLICY "Students can view own enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        check_user_role('SISWA')
        AND student_id = auth.uid()
    );

-- =====================================================
-- CLASS SCHEDULES POLICIES
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access on class_schedules" ON class_schedules;
DROP POLICY IF EXISTS "Teachers can view own schedules" ON class_schedules;
DROP POLICY IF EXISTS "Students can view class schedules" ON class_schedules;

CREATE POLICY "Admin IT full access on class_schedules"
    ON class_schedules FOR ALL
    TO authenticated
    USING (check_user_role('ADMIN_IT'))
    WITH CHECK (check_user_role('ADMIN_IT'));

CREATE POLICY "Teachers can view own schedules"
    ON class_schedules FOR SELECT
    TO authenticated
    USING (
        check_user_role('GURU')
        AND teacher_id = auth.uid()
    );

CREATE POLICY "Students can view class schedules"
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
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS POLICIES UPDATED';
    RAISE NOTICE 'Admin IT: Full access to all tables';
    RAISE NOTICE 'Teachers: Read access to active data';
    RAISE NOTICE 'Students: Read access to own data';
    RAISE NOTICE '========================================';
END $$;
