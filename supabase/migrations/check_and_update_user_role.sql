-- =====================================================
-- CEK DAN UPDATE ROLE USER
-- Run this script in Supabase SQL Editor
-- =====================================================

-- Step 1: Cek struktur table profiles
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Step 2: Lihat semua user di profiles
SELECT
    id,
    email,
    full_name,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC
LIMIT 20;

-- Step 3: Cek auth.users (untuk melihat email dari user yang login)
SELECT
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 20;

-- =====================================================
-- UPDATE ROLE - PILIH SALAH SATU
-- =====================================================

-- Opsi A: Update user berdasarkan email (ganti dengan email Anda)
-- UPDATE profiles
-- SET role = 'ADMIN_IT'
-- WHERE email = 'your-email@example.com';

-- Opsi B: Update semua user jadi ADMIN_IT (untuk testing)
-- Uncomment dan run jika ingin semua user jadi ADMIN_IT
UPDATE profiles
SET role = 'ADMIN_IT'
WHERE role IS NULL OR role != 'ADMIN_IT';

-- Opsi C: Insert profile untuk user yang belum punya profile
-- Ini akan membuat profile untuk semua user di auth.users
INSERT INTO profiles (id, full_name, email, role)
SELECT
    id,
    COALESCE(raw_user_meta_data->>'full_name', 'User ' || LEFT(email, 10)),
    email,
    'ADMIN_IT'
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.users.id
);

-- Step 4: Verifikasi hasil update
SELECT '=== AFTER UPDATE ===' as info;
SELECT
    id,
    email,
    full_name,
    role
FROM profiles
ORDER BY created_at DESC;
