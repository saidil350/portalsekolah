-- =====================================================
-- VERIFICATION SCRIPT - Cek Migration Berhasil
-- Run this in Supabase SQL Editor
-- =====================================================

SELECT '=== 1. CEK TABEL SUDAH TERCREATE ===' as step;

-- Cek semua tabel penting
SELECT
    table_name,
    CASE
        WHEN table_name IN ('academic_years', 'semesters', 'departments', 'class_levels', 'subjects', 'rooms', 'classes', 'enrollments', 'class_schedules')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'academic_years',
    'semesters',
    'departments',
    'class_levels',
    'subjects',
    'rooms',
    'classes',
    'enrollments',
    'class_schedules',
    'profiles'
)
ORDER BY table_name;

SELECT '' as separator;
SELECT '=== 2. CEK STRUKTUR TABEL CLASSES ===' as step;

-- Cek kolom penting di classes
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'classes'
AND column_name IN ('id', 'name', 'code', 'academic_year_id', 'semester_id', 'department_id', 'class_level_id', 'capacity', 'current_enrollment', 'wali_kelas_id', 'home_room_id', 'is_active')
ORDER BY ordinal_position;

SELECT '' as separator;
SELECT '=== 3. CEK STRUKTUR TABEL ENROLLMENTS ===' as step;

-- Cek kolom penting di enrollments
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'enrollments'
AND column_name IN ('id', 'student_id', 'class_id', 'academic_year_id', 'status', 'enrollment_date', 'dropout_date', 'notes')
ORDER BY ordinal_position;

SELECT '' as separator;
SELECT '=== 4. CEK STRUKTUR TABEL CLASS_SCHEDULES ===' as step;

-- Cek kolom penting di class_schedules
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'class_schedules'
AND column_name IN ('id', 'class_id', 'subject_id', 'teacher_id', 'room_id', 'semester_id', 'academic_year_id', 'hari', 'jam_mulai', 'jam_selesai', 'is_active')
ORDER BY ordinal_position;

SELECT '' as separator;
SELECT '=== 5. CEK VIEWS SUDAH TERCREATE ===' as step;

-- Cek views
SELECT
    table_name as view_name,
    CASE
        WHEN table_name IN ('view_class_roster_complete', 'view_teaching_schedule_complete', 'view_student_enrollment_history')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.views
WHERE table_schema = 'public'
AND table_name IN ('view_class_roster_complete', 'view_teaching_schedule_complete', 'view_student_enrollment_history');

SELECT '' as separator;
SELECT '=== 6. CEK FUNCTIONS SUDAH TERCREATE ===' as step;

-- Cek functions
SELECT
    routine_name,
    CASE
        WHEN routine_name IN ('check_user_role', 'check_teacher_schedule_conflict', 'check_room_schedule_conflict', 'check_wali_kelas_assignment', 'update_class_enrollment_count', 'update_academic_year_timestamp')
        THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_type = 'FUNCTION'
AND routine_name IN (
    'check_user_role',
    'check_teacher_schedule_conflict',
    'check_room_schedule_conflict',
    'check_wali_kelas_assignment',
    'update_class_enrollment_count',
    'update_academic_year_timestamp'
);

SELECT '' as separator;
SELECT '=== 7. CEK RLS POLICIES SUDAH TERCREATE ===' as step;

-- Cek RLS enabled
SELECT
    table_name,
    CASE
        WHEN is_rls_enabled THEN '✅ ENABLED'
        ELSE '❌ DISABLED'
    END as rls_status
FROM (
    SELECT
        schemaname || '.' || tablename as table_name,
        CASE WHEN rowsecurity THEN true ELSE false END as is_rls_enabled
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('classes', 'enrollments', 'class_schedules')
) t;

-- Cek policies
SELECT '' as separator;
SELECT 'RLS Policies on Classes:' as info;
SELECT
    policy_name,
    as permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'classes'
ORDER BY policy_name;

SELECT '' as separator;
SELECT 'RLS Policies on Enrollments:' as info;
SELECT
    policy_name,
    as permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'enrollments'
ORDER BY policy_name;

SELECT '' as separator;
SELECT 'RLS Policies on Class Schedules:' as info;
SELECT
    policy_name,
    as permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'class_schedules'
ORDER BY policy_name;

SELECT '' as separator;
SELECT '=== 8. CEK SAMPLE DATA ===' as step;

-- Cek academic years
SELECT 'Academic Years:' as info;
SELECT
    id,
    name,
    start_date,
    end_date,
    is_active
FROM academic_years
ORDER BY start_date DESC;

SELECT '' as separator;
SELECT 'Semesters:' as info;
SELECT
    s.id,
    ay.name as academic_year,
    s.name as semester,
    s.semester_number,
    s.is_active
FROM semesters s
JOIN academic_years ay ON s.academic_year_id = ay.id
ORDER BY ay.start_date DESC, s.semester_number;

SELECT '' as separator;
SELECT 'Departments:' as info;
SELECT id, name, code, is_active FROM departments ORDER BY name;

SELECT '' as separator;
SELECT 'Class Levels:' as info;
SELECT id, name, code, level, is_active FROM class_levels ORDER BY level;

SELECT '' as separator;
SELECT 'Subjects:' as info;
SELECT id, name, code, subject_type, credit_hours FROM subjects LIMIT 10;

SELECT '' as separator;
SELECT 'Rooms:' as info;
SELECT id, name, code, room_type, capacity FROM rooms ORDER BY code;

SELECT '' as separator;
SELECT '=== 9. CEK USER ROLE ===' as step;

-- Cek user profiles
SELECT
    id,
    email,
    full_name,
    role,
    CASE
        WHEN role = 'ADMIN_IT' THEN '✅ Can create classes'
        ELSE '❌ Not ADMIN_IT - cannot create classes'
    END as permission_status
FROM profiles
ORDER BY created_at DESC
LIMIT 10;

SELECT '' as separator;
SELECT '=== 10. TEST VIEW QUERY ===' as step;

-- Test view class_roster_complete
SELECT 'Testing view_class_roster_complete...' as info;
SELECT * FROM view_class_roster_complete LIMIT 5;

SELECT '' as separator;
SELECT '=== VERIFICATION COMPLETE ===' as step;
SELECT 'Silakan cek hasil di atas. Semua harus ✅' as info;
