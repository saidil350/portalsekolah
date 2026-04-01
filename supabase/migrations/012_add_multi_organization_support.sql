-- =====================================================
-- Multi-Organization Support Migration
-- =====================================================
-- This migration adds support for multiple organizations/tenants
-- Each organization has its own isolated ecosystem of users and data

-- =====================================================
-- 1. CREATE ORGANIZATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL, -- Unique org code for login
  domain VARCHAR(255), -- Optional custom domain
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),

  -- School-specific fields
  school_level VARCHAR(50), -- 'SMA', 'SMK', 'MA', etc.
  npsn VARCHAR(50), -- Nomor Pokok Sekolah Nasional

  -- Subscription/Plan info
  plan VARCHAR(50) DEFAULT 'FREE', -- 'FREE', 'PRO', 'ENTERPRISE'
  max_users INTEGER DEFAULT 50,
  max_storage_mb INTEGER DEFAULT 1024, -- 1GB

  -- Status
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Creator (Admin IT who registered this org)
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Create index on organization code for fast lookups during login
CREATE INDEX idx_organizations_code ON organizations(code);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);

-- =====================================================
-- 2. ADD ORGANIZATION_ID TO PROFILES TABLE
-- =====================================================

-- Add organization_id column to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create index for fast filtering
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
CREATE INDEX idx_profiles_organization_role ON profiles(organization_id, role);

-- =====================================================
-- 3. UPDATE EXISTING DATA - CREATE DEFAULT ORGANIZATION
-- =====================================================

-- Create a default organization for existing data
INSERT INTO organizations (id, name, code, school_level, plan, is_active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Default Organization',
  'DEFAULT',
  'SMA',
  'ENTERPRISE',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Update all existing profiles to belong to default organization
UPDATE profiles
SET organization_id = '00000000-0000-0000-0000-000000000001'
WHERE organization_id IS NULL;

-- Make organization_id NOT NULL after setting defaults
ALTER TABLE profiles
ALTER COLUMN organization_id SET NOT NULL;

-- =====================================================
-- 4. ADD ORGANIZATION_ID TO OTHER TABLES
-- =====================================================

-- Academic data tables
ALTER TABLE academic_years ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE class_levels ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE departments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE semesters ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Class and enrollment tables
ALTER TABLE classes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE enrollments ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE class_schedules ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Teacher ranks
ALTER TABLE teacher_ranks ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE subject_teachers ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create indexes for all organization_id columns
CREATE INDEX idx_academic_years_org ON academic_years(organization_id);
CREATE INDEX idx_class_levels_org ON class_levels(organization_id);
CREATE INDEX idx_departments_org ON departments(organization_id);
CREATE INDEX idx_semesters_org ON semesters(organization_id);
CREATE INDEX idx_subjects_org ON subjects(organization_id);
CREATE INDEX idx_rooms_org ON rooms(organization_id);
CREATE INDEX idx_classes_org ON classes(organization_id);
CREATE INDEX idx_enrollments_org ON enrollments(organization_id);
CREATE INDEX idx_class_schedules_org ON class_schedules(organization_id);
CREATE INDEX idx_teacher_ranks_org ON teacher_ranks(organization_id);
CREATE INDEX idx_subject_teachers_org ON subject_teachers(organization_id);

-- =====================================================
-- 5. UPDATE EXISTING DATA WITH DEFAULT ORGANIZATION
-- =====================================================

-- Update all existing data to belong to default organization
UPDATE academic_years SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE class_levels SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE departments SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE semesters SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE subjects SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE rooms SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE classes SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE enrollments SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE class_schedules SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE teacher_ranks SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;
UPDATE subject_teachers SET organization_id = '00000000-0000-0000-0000-000000000001' WHERE organization_id IS NULL;

-- Make organization_id NOT NULL
ALTER TABLE academic_years ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE class_levels ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE departments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE semesters ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE subjects ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE rooms ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE classes ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE enrollments ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE class_schedules ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE teacher_ranks ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE subject_teachers ALTER COLUMN organization_id SET NOT NULL;

-- =====================================================
-- 6. CREATE ORGANIZATION SETTINGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  -- Feature flags
  enable_teaching_dashboard BOOLEAN DEFAULT true,
  enable_student_dashboard BOOLEAN DEFAULT true,
  enable_headmaster_dashboard BOOLEAN DEFAULT true,

  -- Customization
  primary_color VARCHAR(7) DEFAULT '#3B82F6',
  secondary_color VARCHAR(7) DEFAULT '#10B981',
  logo_url TEXT,

  -- Academic settings
  current_academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
  current_semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,

  -- Notification settings
  notification_email VARCHAR(255),
  notification_enabled BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(organization_id)
);

CREATE INDEX idx_organization_settings_org ON organization_settings(organization_id);

-- Insert default settings for default organization
INSERT INTO organization_settings (organization_id)
VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (organization_id) DO NOTHING;

-- =====================================================
-- 7. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for organizations and organization_settings
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_settings_updated_at
  BEFORE UPDATE ON organization_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. GRANT PERMISSIONS
-- =====================================================

-- Grant access to authenticated users
GRANT SELECT ON organizations TO authenticated;
GRANT SELECT ON organization_settings TO authenticated;

-- Grant all permissions to service role (for admin operations)
GRANT ALL ON organizations TO service_role;
GRANT ALL ON organization_settings TO service_role;

-- =====================================================
-- 9. CREATE HELPER FUNCTION TO GET USER'S ORGANIZATION
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_organization()
RETURNS UUID AS $$
DECLARE
  user_org_id UUID;
BEGIN
  SELECT organization_id INTO user_org_id
  FROM profiles
  WHERE id = auth.uid();

  RETURN user_org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE organizations IS 'Organizations/tenants for multi-tenant architecture. Each organization has isolated data.';
COMMENT ON COLUMN organizations.code IS 'Unique organization code used for login and identification';
COMMENT ON COLUMN organizations.plan IS 'Subscription plan: FREE, PRO, or ENTERPRISE';
COMMENT ON TABLE organization_settings IS 'Settings and customization for each organization';
COMMENT ON COLUMN profiles.organization_id IS 'Organization that this user belongs to. Isolates data per tenant.';
