-- =====================================================
-- RECOVERY SCRIPT: Mengembalikan Kelas yang Hilang
-- =====================================================
-- Run this script to recover classes that were set to is_active = false
-- =====================================================

-- 1. Cek kelas yang is_active = false atau null
SELECT
  id,
  name,
  code,
  is_active,
  wali_kelas_id,
  home_room_id,
  created_at
FROM classes
WHERE is_active = false OR is_active IS NULL
ORDER BY created_at DESC;

-- 2. Recovery: Set semua kelas ke is_active = true
UPDATE classes
SET is_active = true
WHERE is_active = false OR is_active IS NULL;

-- 3. Verifikasi hasil recovery
SELECT
  id,
  name,
  code,
  is_active,
  wali_kelas_id,
  home_room_id
FROM classes
ORDER BY created_at DESC;

-- =====================================================
-- Jika hanya ingin mengembalikan kelas tertentu:
-- GANTI [CLASS_ID] dengan ID kelas yang ingin dikembalikan
-- =====================================================

-- UPDATE classes
-- SET is_active = true
-- WHERE id = '[CLASS_ID]';

-- Contoh:
-- UPDATE classes
-- SET is_active = true
-- WHERE id = 'de37f550-8404-47bc-91c7-c9a7b47f7f20';
