-- =====================================================
-- FIX: Registration Organization & Profile RLS
-- =====================================================
-- Memperbaiki RLS policy agar:
-- 1. User bisa insert organization saat registrasi
-- 2. User bisa insert profile dengan organization_id
-- 3. User bisa insert organization_settings saat registrasi
-- 4. Duplikat NIP/NISN dicek per-organization (bukan global)

-- =====================================================
-- 1. FIX ORGANIZATIONS INSERT POLICY
-- =====================================================
-- Sebelumnya hanya service_role yang bisa insert organizations
-- Sekarang user authenticated juga bisa insert jika created_by = auth.uid()

CREATE POLICY "Users can create organization during registration"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
  );

-- User juga perlu bisa SELECT organization yang baru dibuat (untuk mendapatkan id)
-- Policy SELECT yang sudah ada hanya untuk Admin IT yang sudah punya organization_id di profiles
-- Tambah policy agar creator bisa lihat organization yang baru dibuatnya
CREATE POLICY "Creator can view their organization"
  ON organizations FOR SELECT
  TO authenticated
  USING (
    created_by = auth.uid()
  );

-- User juga perlu bisa DELETE organization jika terjadi rollback saat registrasi
CREATE POLICY "Creator can delete their organization during registration"
  ON organizations FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid()
  );

-- =====================================================
-- 2. FIX PROFILES INSERT POLICY
-- =====================================================
-- Policy lama: hanya cek id = auth.uid() tanpa organization_id
-- Policy baru: cek id = auth.uid() DAN organization_id valid

-- Drop policy lama
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Buat policy baru: user bisa insert profile sendiri dengan organization_id yang valid
CREATE POLICY "Users can insert their own profile with organization"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND organization_id IS NOT NULL
    AND (
      -- Organization harus ada dan dibuat oleh user ini ATAU organization aktif
      organization_id IN (
        SELECT id FROM organizations
        WHERE created_by = auth.uid()
           OR is_active = true
      )
    )
  );

-- Policy untuk Admin IT insert user lain tetap dipertahankan (dari migration 014)
-- Tapi perlu update agar include organization_id check
DROP POLICY IF EXISTS "Admin IT can insert new users" ON profiles;

CREATE POLICY "Admin IT can insert new users in their organization"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles AS admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.role = 'ADMIN_IT'
      AND admin_profile.organization_id = organization_id
    )
  );

-- =====================================================
-- 3. FIX ORGANIZATION_SETTINGS INSERT POLICY
-- =====================================================
-- User perlu bisa insert organization_settings saat registrasi

CREATE POLICY "Users can create settings for their organization"
  ON organization_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id IN (
      SELECT id FROM organizations
      WHERE created_by = auth.uid()
    )
  );

-- =====================================================
-- 4. ADD UNIQUE CONSTRAINT PER ORGANIZATION FOR NIP/NISN
-- =====================================================
-- Sebelumnya NIP/NISN unique secara global
-- Sekarang unique per-organization saja

-- Drop global unique constraint jika ada
DO $$
BEGIN
  -- Drop existing unique index on nip if exists (global)
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_nip_key') THEN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_nip_key;
  END IF;

  -- Drop existing unique index on nisn if exists (global)
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'profiles_nisn_key') THEN
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_nisn_key;
  END IF;
END $$;

-- Buat unique constraint per-organization (jika belum ada dari migration 012)
-- Cek dulu apakah constraint sudah ada
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_organization_id_nip_key'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_organization_id_nip_key
    UNIQUE (organization_id, nip);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_organization_id_nisn_key'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT profiles_organization_id_nisn_key
    UNIQUE (organization_id, nisn);
  END IF;
END $$;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration 015 completed successfully!';
  RAISE NOTICE '✅ Organizations: Users can now insert during registration';
  RAISE NOTICE '✅ Profiles: Insert requires valid organization_id';
  RAISE NOTICE '✅ Organization Settings: Users can create during registration';
  RAISE NOTICE '✅ NIP/NISN: Unique constraint is now per-organization';
END $$;
