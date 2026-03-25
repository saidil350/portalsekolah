-- =====================================================
-- ACADEMIC DATA MANAGEMENT TABLES
-- Migration script for Data Akademik features
-- =====================================================

-- =====================================================
-- ACADEMIC YEARS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., "2023/2024", "2024/2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_academic_years_is_active ON academic_years(is_active);
CREATE INDEX IF NOT EXISTS idx_academic_years_dates ON academic_years(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_academic_years_created_by ON academic_years(created_by);

-- =====================================================
-- CLASS LEVELS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., "Kelas 10", "Kelas 11", "Kelas 12"
    code TEXT NOT NULL UNIQUE, -- e.g., "X", "XI", "XII"
    level_order INTEGER NOT NULL UNIQUE, -- For sorting: 10, 11, 12
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for sorting
CREATE INDEX IF NOT EXISTS idx_class_levels_order ON class_levels(level_order);
CREATE INDEX IF NOT EXISTS idx_class_levels_is_active ON class_levels(is_active);

-- =====================================================
-- DEPARTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- e.g., "MIPA", "IPS", "Bahasa"
    code TEXT NOT NULL UNIQUE, -- e.g., "IPA", "IPS", "BHS"
    description TEXT,
    head_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Department head
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for queries
CREATE INDEX IF NOT EXISTS idx_departments_is_active ON departments(is_active);
CREATE INDEX IF NOT EXISTS idx_departments_head ON departments(head_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_academic_years_updated_at ON academic_years;
DROP TRIGGER IF EXISTS update_class_levels_updated_at ON class_levels;
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;

-- Create triggers
CREATE TRIGGER update_academic_years_updated_at
    BEFORE UPDATE ON academic_years
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_levels_updated_at
    BEFORE UPDATE ON class_levels
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow full access to authenticated users on academic_years" ON academic_years;
DROP POLICY IF EXISTS "Allow full access to authenticated users on class_levels" ON class_levels;
DROP POLICY IF EXISTS "Allow full access to authenticated users on departments" ON departments;

-- Create policies for academic_years
CREATE POLICY "Allow full access to authenticated users on academic_years"
    ON academic_years FOR ALL
    USING (auth.role() = 'authenticated');

-- Create policies for class_levels
CREATE POLICY "Allow full access to authenticated users on class_levels"
    ON class_levels FOR ALL
    USING (auth.role() = 'authenticated');

-- Create policies for departments
CREATE POLICY "Allow full access to authenticated users on departments"
    ON departments FOR ALL
    USING (auth.role() = 'authenticated');

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample academic years
INSERT INTO academic_years (name, start_date, end_date, is_active, description) VALUES
('2023/2024', '2023-07-01'::DATE, '2024-06-30'::DATE, false, 'Tahun Akademik 2023/2024'),
('2024/2025', '2024-07-01'::DATE, '2025-06-30'::DATE, true, 'Tahun Akademik 2024/2025')
ON CONFLICT (name) DO NOTHING;

-- Insert sample class levels
INSERT INTO class_levels (name, code, level_order, description, is_active) VALUES
('Kelas 10', 'X', 10, 'Tingkat Kelas 10', true),
('Kelas 11', 'XI', 11, 'Tingkat Kelas 11', true),
('Kelas 12', 'XII', 12, 'Tingkat Kelas 12', true)
ON CONFLICT (name) DO NOTHING;

-- Insert sample departments
INSERT INTO departments (name, code, description, is_active) VALUES
('MIPA - Matematika dan Ilmu Pengetahuan Alam', 'MIPA', 'Jurusan Matematika dan Ilmu Pengetahuan Alam', true),
('IPS - Ilmu Pengetahuan Sosial', 'IPS', 'Jurusan Ilmu Pengetahuan Sosial', true),
('Bahasa', 'BHS', 'Jurusan Bahasa dan Sastra', true)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
SELECT
    'academic_years' as table_name,
    COUNT(*) as row_count
FROM academic_years
UNION ALL
SELECT
    'class_levels' as table_name,
    COUNT(*) as row_count
FROM class_levels
UNION ALL
SELECT
    'departments' as table_name,
    COUNT(*) as row_count
FROM departments;
