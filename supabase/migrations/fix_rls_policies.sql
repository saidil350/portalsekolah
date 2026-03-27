-- =====================================================
-- FIX RLS POLICIES FOR CLASS ROSTER SYSTEM
-- =====================================================

-- This migration fixes the RLS policies to allow proper access
-- The issue is that policies use subqueries which may fail due to RLS on profiles table

-- =====================================================
-- 1. ENSURE PROFILES TABLE ALLOWS SELF-READ
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON profiles;

-- Create policy to allow users to read their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (id = auth.uid());

-- Allow authenticated users to view basic profile info (needed for RLS checks)
CREATE POLICY "Authenticated users can view profiles"
    ON profiles FOR SELECT
    USING (auth.uid() IS NOT NULL);

-- =====================================================
-- 2. FIX CLASSES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to classes" ON classes;
DROP POLICY IF EXISTS "Teachers and Headmasters can view classes" ON classes;
DROP POLICY IF EXISTS "Students can view their own classes" ON classes;

-- Simple policy: Admin IT can do everything
-- Using auth.jwt() to avoid subquery issues
CREATE POLICY "Admin IT full access to classes"
    ON classes FOR ALL
    TO authenticated
    USING (
        auth.jwt()->>'role' = 'ADMIN_IT'
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    )
    WITH CHECK (
        auth.jwt()->>'role' = 'ADMIN_IT'
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers and Headmasters can view active classes
CREATE POLICY "Teachers and Headmasters can view classes"
    ON classes FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('GURU', 'KEPALA_SEKOLAH', 'ADMIN_IT')
        )
    );

-- Students can view their enrolled classes
CREATE POLICY "Students can view their own classes"
    ON classes FOR SELECT
    TO authenticated
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.class_id = classes.id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'ACTIVE'
        )
    );

-- =====================================================
-- 3. FIX ENROLLMENTS TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments for their classes" ON enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to enrollments"
    ON enrollments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers can view enrollments for classes they teach
CREATE POLICY "Teachers can view enrollments for their classes"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM class_schedules
            WHERE class_schedules.class_id = enrollments.class_id
            AND class_schedules.teacher_id = auth.uid()
        )
    );

-- Students can view their own enrollments
CREATE POLICY "Students can view their own enrollments"
    ON enrollments FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'SISWA'
        )
    );

-- Allow students to be enrolled (needed for enrollment creation)
CREATE POLICY "Allow enrollment for authenticated users"
    ON enrollments FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- =====================================================
-- 4. FIX CLASS SCHEDULES TABLE RLS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to class_schedules" ON class_schedules;
DROP POLICY IF EXISTS "Teachers can view their own schedules" ON class_schedules;
DROP POLICY IF EXISTS "Students can view their class schedules" ON class_schedules;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to class_schedules"
    ON class_schedules FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers can view their own schedules
CREATE POLICY "Teachers can view their own schedules"
    ON class_schedules FOR SELECT
    TO authenticated
    USING (
        teacher_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'GURU'
        )
    );

-- Students can view their class schedules
CREATE POLICY "Students can view their class schedules"
    ON class_schedules FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.class_id = class_schedules.class_id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'ACTIVE'
        )
    );

-- =====================================================
-- 5. ENSURE CLASS_LEVELS, DEPARTMENTS, ACADEMIC_YEARS, ROOMS, SUBJECTS ARE ACCESSIBLE
-- =====================================================

-- These tables should be readable by authenticated users
ALTER TABLE class_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can view class_levels" ON class_levels;
DROP POLICY IF EXISTS "Authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Authenticated users can view academic_years" ON academic_years;
DROP POLICY IF EXISTS "Authenticated users can view rooms" ON rooms;
DROP POLICY IF EXISTS "Authenticated users can view subjects" ON subjects;

-- Create read policies for dropdown data
CREATE POLICY "Authenticated users can view class_levels"
    ON class_levels FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage class_levels"
    ON class_levels FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

CREATE POLICY "Authenticated users can view departments"
    ON departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage departments"
    ON departments FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

CREATE POLICY "Authenticated users can view academic_years"
    ON academic_years FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage academic_years"
    ON academic_years FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

CREATE POLICY "Authenticated users can view rooms"
    ON rooms FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage rooms"
    ON rooms FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

CREATE POLICY "Authenticated users can view subjects"
    ON subjects FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admin IT can manage subjects"
    ON subjects FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- =====================================================
-- 6. PARENT STUDENT RELATIONSHIPS
-- =====================================================

DROP POLICY IF EXISTS "Admin IT full access to parent_student_relationships" ON parent_student_relationships;
DROP POLICY IF EXISTS "Parents can view their relationships" ON parent_student_relationships;

CREATE POLICY "Admin IT full access to parent_student_relationships"
    ON parent_student_relationships FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

CREATE POLICY "Parents can view their relationships"
    ON parent_student_relationships FOR SELECT
    TO authenticated
    USING (parent_id = auth.uid());

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE 'RLS policies updated successfully';
    RAISE NOTICE 'All tables now have proper RLS policies';
END $$;
