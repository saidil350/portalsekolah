-- =====================================================
-- SUBJECTS TABLE
-- Migration script for Data Management - Subjects
-- =====================================================

-- =====================================================
-- SUBJECTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    subject_type VARCHAR(50) NOT NULL CHECK (subject_type IN ('MANDATORY', 'ELECTIVE', 'EXTRACURRICULAR')),
    credit_hours INTEGER NOT NULL DEFAULT 2 CHECK (credit_hours > 0 AND credit_hours <= 6),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    description TEXT,
    prerequisites TEXT[], -- Array of subject IDs
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_type ON subjects(subject_type);
CREATE INDEX IF NOT EXISTS idx_subjects_department ON subjects(department_id);
CREATE INDEX IF NOT EXISTS idx_subjects_academic_year ON subjects(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active);
CREATE INDEX IF NOT EXISTS idx_subjects_created_at ON subjects(created_at);

-- =====================================================
-- TRIGGER FOR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_subjects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_subjects_updated_at_trigger ON subjects;

-- Create trigger
CREATE TRIGGER update_subjects_updated_at_trigger
    BEFORE UPDATE ON subjects
    FOR EACH ROW
    EXECUTE FUNCTION update_subjects_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admin IT full access to subjects" ON subjects;
DROP POLICY IF EXISTS "Teachers and Headmasters can view subjects" ON subjects;
DROP POLICY IF EXISTS "Students can view active subjects" ON subjects;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to subjects"
    ON subjects FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers and Headmasters can view active subjects
CREATE POLICY "Teachers and Headmasters can view subjects"
    ON subjects FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('GURU', 'KEPALA_SEKOLAH', 'ADMIN_IT')
        )
    );

-- Students can view active subjects
CREATE POLICY "Students can view active subjects"
    ON subjects FOR SELECT
    USING (
        is_active = true
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'SISWA'
        )
    );

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Get academic year ID for 2024/2025
DO $$
DECLARE
    v_academic_year_id UUID;
    v_mipa_dept_id UUID;
    v_ips_dept_id UUID;
BEGIN
    SELECT id INTO v_academic_year_id FROM academic_years WHERE name = '2024/2025' LIMIT 1;
    SELECT id INTO v_mipa_dept_id FROM departments WHERE code = 'MIPA' LIMIT 1;
    SELECT id INTO v_ips_dept_id FROM departments WHERE code = 'IPS' LIMIT 1;

    -- Insert sample subjects
    INSERT INTO subjects (name, code, subject_type, credit_hours, department_id, academic_year_id, description, is_active) VALUES
    ('Matematika Wajib', 'MTK-101', 'MANDATORY', 4, v_mipa_dept_id, v_academic_year_id, 'Matematika dasar untuk semua jurusan', true),
    ('Bahasa Indonesia', 'BIN-101', 'MANDATORY', 3, NULL, v_academic_year_id, 'Bahasa Indonesia wajib', true),
    ('Bahasa Inggris', 'ING-101', 'MANDATORY', 3, NULL, v_academic_year_id, 'Bahasa Inggris dasar', true),
    ('Pendidikan Agama', 'PAK-101', 'MANDATORY', 2, NULL, v_academic_year_id, 'Pendidikan agama dan budi pekerti', true),
    ('Pendidikan Pancasila', 'PPKn-101', 'MANDATORY', 2, NULL, v_academic_year_id, 'Pendidikan Pancasila dan kewarganegaraan', true),
    ('Fisika Dasar', 'FIS-101', 'MANDATORY', 3, v_mipa_dept_id, v_academic_year_id, 'Fisika dasar untuk jurusan MIPA', true),
    ('Kimia Dasar', 'KIM-101', 'MANDATORY', 3, v_mipa_dept_id, v_academic_year_id, 'Kimia dasar untuk jurusan MIPA', true),
    ('Biologi Dasar', 'BIO-101', 'MANDATORY', 3, v_mipa_dept_id, v_academic_year_id, 'Biologi dasar untuk jurusan MIPA', true),
    ('Ekonomi Dasar', 'EKO-101', 'MANDATORY', 3, v_ips_dept_id, v_academic_year_id, 'Ekonomi dasar untuk jurusan IPS', true),
    ('Sosiologi Dasar', 'SOS-101', 'MANDATORY', 3, v_ips_dept_id, v_academic_year_id, 'Sosiologi dasar untuk jurusan IPS', true),
    ('Sejarah Indonesia', 'SEJ-101', 'MANDATORY', 2, NULL, v_academic_year_id, 'Sejarah Indonesia', true),
    ('Seni Budaya', 'SEN-101', 'MANDATORY', 2, NULL, v_academic_year_id, 'Seni budaya dan musik', true),
    ('Penjasorkes', 'PJK-101', 'MANDATORY', 2, NULL, v_academic_year_id, 'Pendidikan jasmani dan kesehatan', true),
    ('Matematika Lanjut', 'MTK-201', 'ELECTIVE', 4, v_mipa_dept_id, v_academic_year_id, 'Matematika lanjut untuk peminatan', true),
    ('Kimia Organik', 'KIM-201', 'ELECTIVE', 3, v_mipa_dept_id, v_academic_year_id, 'Kimia organik lanjutan', true),
    ('Pramuka', 'PRM-101', 'EXTRACURRICULAR', 1, NULL, v_academic_year_id, 'Kegiatan pramuka', true),
    ('Basket', 'BSK-101', 'EXTRACURRICULAR', 1, NULL, v_academic_year_id, 'Ekstrakurikuler basket', true),
    ('Futsal', 'FTS-101', 'EXTRACURRICULAR', 1, NULL, v_academic_year_id, 'Ekstrakurikuler futsal', true),
    ('Paduan Suara', 'PSU-101', 'EXTRACURRICULAR', 1, NULL, v_academic_year_id, 'Ekstrakurikuler paduan suara', true)
    ON CONFLICT (code) DO NOTHING;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table was created
SELECT
    'subjects' as table_name,
    COUNT(*) as row_count
FROM subjects;
