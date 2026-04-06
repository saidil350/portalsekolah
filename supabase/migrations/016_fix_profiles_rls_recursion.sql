-- =====================================================
-- FIX PROFILES RLS RECURSION (REFINED)
-- =====================================================
-- Migration ini memperbaiki error "infinite recursion detected in policy" pada tabel "profiles".
-- Penyebab: RLS Policy pada "profiles" memicu query ke "profiles" itu sendiri (recursive).
-- Solusi: Gunakan Helper Function dengan SECURITY DEFINER untuk membypass RLS saat pengecekan organisasi/role.

-- 1. Buat/Update Helper Functions dengan SECURITY DEFINER
-- Fungsi ini berjalan sebagai Superuser (bypass RLS) dan memiliki search_path yang aman.

CREATE OR REPLACE FUNCTION get_auth_organization_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM profiles 
  WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles 
  WHERE id = auth.uid();
$$;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION get_auth_organization_id TO authenticated;
GRANT EXECUTE ON FUNCTION get_auth_role TO authenticated;

-- 2. Bersihkan SEMUA policy lama pada tabel profiles
-- Kita hapus semua varian nama yang pernah dibuat di migrasi 013, 014, dan 015.

DO $$
BEGIN
  -- SELECT Policies
  DROP POLICY IF EXISTS "Admin IT can view all users in their organization" ON profiles;
  DROP POLICY IF EXISTS "Users can view profiles in their organization" ON profiles;
  
  -- INSERT Policies
  DROP POLICY IF EXISTS "Admin IT can insert users in their organization" ON profiles;
  DROP POLICY IF EXISTS "Admin IT can insert new users" ON profiles;
  DROP POLICY IF EXISTS "Admin IT can insert new users in their organization" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
  DROP POLICY IF EXISTS "Users can insert their own profile with organization" ON profiles;
  
  -- UPDATE Policies
  DROP POLICY IF EXISTS "Admin IT can update users in their organization" ON profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
  
  -- DELETE Policies
  DROP POLICY IF EXISTS "Admin IT can delete users in their organization" ON profiles;
  
  -- Misc
  DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;
END $$;

-- 3. Buat ulang policy profiles menggunakan helper functions (Tidak Rekursif)

-- Policy: Semua user yang login dapat melihat profile di organisasi mereka
CREATE POLICY "Users can view profiles in their organization"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    organization_id = get_auth_organization_id()
  );

-- Policy: User bisa update profile-nya sendiri
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Admin IT bisa insert user lain di organisasi yang sama
CREATE POLICY "Admin IT can insert users in their organization"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    get_auth_role() = 'ADMIN_IT'
    AND organization_id = get_auth_organization_id()
  );

-- Policy: Admin IT bisa update user lain di organisasi yang sama
CREATE POLICY "Admin IT can update users in their organization"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    get_auth_role() = 'ADMIN_IT'
    AND organization_id = get_auth_organization_id()
  )
  WITH CHECK (
    get_auth_role() = 'ADMIN_IT'
    AND organization_id = get_auth_organization_id()
  );

-- Policy: Admin IT bisa delete user lain (bukan diri sendiri)
CREATE POLICY "Admin IT can delete users in their organization"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    get_auth_role() = 'ADMIN_IT'
    AND organization_id = get_auth_organization_id()
    AND id != auth.uid()
  );

-- Policy: Akses penuh untuk service_role
CREATE POLICY "Service role can manage profiles"
  ON profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Update helper function umum untuk tabel lainnya (Optimasi)
-- Ini menggantikan versi PLPGSQL yang lama agar lebih kencang.

CREATE OR REPLACE FUNCTION check_organization_access(table_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT table_organization_id = get_auth_organization_id();
$$;

-- Log hasil migrasi
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RLS RECURSION FIX APPLIED SUCCESSFULLY';
    RAISE NOTICE 'Table: profiles';
    RAISE NOTICE 'Helpers: get_auth_organization_id, get_auth_role, check_organization_access';
    RAISE NOTICE '========================================';
END $$;

