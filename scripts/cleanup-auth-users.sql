-- =====================================================
-- CLEANUP SCRIPT - Hapus users yang tidak memiliki profile
-- =====================================================
-- Jalankan ini di Supabase SQL Editor untuk membersihkan data yang tidak konsisten

-- 1. Lihat users yang tidak memiliki profile
SELECT
  au.id,
  au.email,
  au.created_at,
  NOT EXISTS(SELECT 1 FROM profiles WHERE profiles.id = au.id) as missing_profile
FROM auth.users au
WHERE NOT EXISTS(SELECT 1 FROM profiles WHERE profiles.id = au.id)
ORDER BY au.created_at DESC;

-- 2. Jika ada users yang perlu dihapus, jalankan ini (ganti UUID dengan user ID yang ingin dihapus)
-- HATI-HATI: Ini akan menghapus user secara permanen!

-- DELETE FROM auth.users WHERE id = 'UUID-USER-YANG-INGIN-DIHAPUS';

-- Contoh untuk menghapus semua users yang tidak memiliki profile dan dibuat dalam 1 jam terakhir:
-- DELETE FROM auth.users
-- WHERE id IN (
--   SELECT au.id
--   FROM auth.users au
--   WHERE NOT EXISTS(SELECT 1 FROM profiles WHERE profiles.id = au.id)
--   AND au.created_at > NOW() - INTERVAL '1 hour'
-- );

-- 3. Atau, untuk setiap email spesifik yang gagal:
-- DELETE FROM auth.users WHERE email = 'email@contoh.com';
