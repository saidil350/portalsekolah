-- =====================================================
-- CLASS ROSTER SYSTEM
-- Migration script for Class Schedule & Roster Management
-- Indonesian School System
-- =====================================================

-- =====================================================
-- CLASS LEVELS TABLE (if not exists)
-- =====================================================
CREATE TABLE IF NOT EXISTS class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    level_order INTEGER NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert class levels
INSERT INTO class_levels (name, code, level_order, description) VALUES
('Kelas X', 'X', 1, 'Kelas 10 - Tahun Pertama'),
('Kelas XI', 'XI', 2, 'Kelas 11 - Tahun Kedua'),
('Kelas XII', 'XII', 3, 'Kelas 12 - Tahun Ketiga')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- CLASSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    class_level_id UUID REFERENCES class_levels(id) ON DELETE SET NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    home_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    capacity INTEGER DEFAULT 30 CHECK (capacity > 0),
    current_enrollment INTEGER DEFAULT 0 CHECK (current_enrollment >= 0),
    wali_kelas_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for classes
CREATE INDEX IF NOT EXISTS idx_classes_code ON classes(code);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(class_level_id);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_wali_kelas ON classes(wali_kelas_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_classes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_classes_updated_at_trigger ON classes;
CREATE TRIGGER update_classes_updated_at_trigger
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_classes_updated_at();

-- =====================================================
-- ENROLLMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WITHDRAWN', 'GRADUATED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(class_id, student_id, academic_year_id)
);

-- Indexes for enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_academic_year ON enrollments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_enrollments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_enrollments_updated_at_trigger ON enrollments;
CREATE TRIGGER update_enrollments_updated_at_trigger
    BEFORE UPDATE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_enrollments_updated_at();

-- =====================================================
-- CLASS SCHEDULES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week IN (1,2,3,4,5,6,7)),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    semester INTEGER CHECK (semester IN (1,2)),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Prevent overlapping schedules for same class
    EXCLUDE USING GIST (
        class_id WITH =,
        day_of_week WITH =,
        tsrange(start_time, end_time) WITH &&
    )
);

-- Indexes for class_schedules
CREATE INDEX IF NOT EXISTS idx_class_schedules_class ON class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_teacher ON class_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_subject ON class_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_room ON class_schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_day_time ON class_schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_class_schedules_academic_year_semester ON class_schedules(academic_year_id, semester);
CREATE INDEX IF NOT EXISTS idx_class_schedules_active ON class_schedules(is_active);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_class_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_class_schedules_updated_at_trigger ON class_schedules;
CREATE TRIGGER update_class_schedules_updated_at_trigger
    BEFORE UPDATE ON class_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_class_schedules_updated_at();

-- =====================================================
-- PARENT STUDENT RELATIONSHIPS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL CHECK (relationship_type IN ('FATHER', 'MOTHER', 'GUARDIAN')),
    is_primary_contact BOOLEAN DEFAULT false,
    is_emergency_contact BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- Indexes for parent_student_relationships
CREATE INDEX IF NOT EXISTS idx_parent_student_parent ON parent_student_relationships(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student ON parent_student_relationships(student_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_parent_student_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_parent_student_updated_at_trigger ON parent_student_relationships;
CREATE TRIGGER update_parent_student_updated_at_trigger
    BEFORE UPDATE ON parent_student_relationships
    FOR EACH ROW
    EXECUTE FUNCTION update_parent_student_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS for all tables
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE parent_student_relationships ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES FOR CLASSES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to classes" ON classes;
DROP POLICY IF EXISTS "Teachers and Headmasters can view classes" ON classes;
DROP POLICY IF EXISTS "Students can view their own classes" ON classes;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to classes"
    ON classes FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers and Headmasters can view active classes
CREATE POLICY "Teachers and Headmasters can view classes"
    ON classes FOR SELECT
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
-- RLS POLICIES FOR ENROLLMENTS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to enrollments" ON enrollments;
DROP POLICY IF EXISTS "Teachers can view enrollments for their classes" ON enrollments;
DROP POLICY IF EXISTS "Students can view their own enrollments" ON enrollments;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to enrollments"
    ON enrollments FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers can view enrollments for classes they teach
CREATE POLICY "Teachers can view enrollments for their classes"
    ON enrollments FOR SELECT
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
    USING (
        student_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'SISWA'
        )
    );

-- =====================================================
-- RLS POLICIES FOR CLASS SCHEDULES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to class_schedules" ON class_schedules;
DROP POLICY IF EXISTS "Teachers can view their own schedules" ON class_schedules;
DROP POLICY IF EXISTS "Students can view their class schedules" ON class_schedules;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to class_schedules"
    ON class_schedules FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Teachers can view their own schedules
CREATE POLICY "Teachers can view their own schedules"
    ON class_schedules FOR SELECT
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
    USING (
        EXISTS (
            SELECT 1 FROM enrollments
            WHERE enrollments.class_id = class_schedules.class_id
            AND enrollments.student_id = auth.uid()
            AND enrollments.status = 'ACTIVE'
        )
    );

-- =====================================================
-- RLS POLICIES FOR PARENT STUDENT RELATIONSHIPS
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admin IT full access to parent_student_relationships" ON parent_student_relationships;
DROP POLICY IF EXISTS "Parents can view their relationships" ON parent_student_relationships;

-- Admin IT can do everything
CREATE POLICY "Admin IT full access to parent_student_relationships"
    ON parent_student_relationships FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'ADMIN_IT'
        )
    );

-- Parents can view their relationships
CREATE POLICY "Parents can view their relationships"
    ON parent_student_relationships FOR SELECT
    USING (
        parent_id = auth.uid()
    );

-- =====================================================
-- SAMPLE DATA - REALISTIC INDONESIAN SCHOOL
-- =====================================================

DO $$
DECLARE
    -- Get IDs
    v_ay_id UUID;
    v_level_x_id UUID;
    v_level_xi_id UUID;
    v_level_xii_id UUID;
    v_mipa_id UUID;
    v_ips_id UUID;
    v_bhs_id UUID;

    -- Room IDs
    v_rk_10a_id UUID;
    v_rk_10b_id UUID;
    v_rk_10c_id UUID;
    v_rk_10d_id UUID;
    v_rk_10e_id UUID;
    v_rk_11a_id UUID;
    v_rk_11b_id UUID;
    v_rk_11c_id UUID;
    v_rk_11d_id UUID;
    v_rk_11e_id UUID;
    v_rk_12a_id UUID;
    v_rk_12b_id UUID;
    v_rk_12c_id UUID;
    v_rk_12d_id UUID;
    v_rk_12e_id UUID;

    -- Subject IDs
    v_mtk_id UUID;
    v_bin_id UUID;
    v_ing_id UUID;
    v_fis_id UUID;
    v_kim_id UUID;
    v_bio_id UUID;
    v_eko_id UUID;
    v_sos_id UUID;
    v_sej_id UUID;
    v_pkn_id UUID;
    v_pa_id UUID;
    v_pjk_id UUID;
    v_sen_id UUID;
    v_bk_id UUID;

    -- Teacher profiles (will be created)
    -- Class IDs (will be created)
BEGIN
    -- Get reference IDs
    SELECT id INTO v_ay_id FROM academic_years WHERE name = '2024/2025' LIMIT 1;
    SELECT id INTO v_level_x_id FROM class_levels WHERE code = 'X' LIMIT 1;
    SELECT id INTO v_level_xi_id FROM class_levels WHERE code = 'XI' LIMIT 1;
    SELECT id INTO v_level_xii_id FROM class_levels WHERE code = 'XII' LIMIT 1;

    SELECT id INTO v_mipa_id FROM departments WHERE code = 'MIPA' LIMIT 1;
    SELECT id INTO v_ips_id FROM departments WHERE code = 'IPS' LIMIT 1;
    SELECT id INTO v_bhs_id FROM departments WHERE code = 'BHS' LIMIT 1;

    -- Get room IDs
    SELECT id INTO v_rk_10a_id FROM rooms WHERE code = 'RK-10A' LIMIT 1;
    SELECT id INTO v_rk_10b_id FROM rooms WHERE code = 'RK-10B' LIMIT 1;

    -- Create additional rooms if needed
    INSERT INTO rooms (name, code, room_type, capacity, floor, building, is_active) VALUES
    ('Ruang Kelas 10C', 'RK-10C', 'CLASSROOM', 30, 1, 'Gedung A', true),
    ('Ruang Kelas 10D', 'RK-10D', 'CLASSROOM', 30, 1, 'Gedung A', true),
    ('Ruang Kelas 10E', 'RK-10E', 'CLASSROOM', 30, 1, 'Gedung A', true),
    ('Ruang Kelas 11A', 'RK-11A', 'CLASSROOM', 30, 2, 'Gedung A', true),
    ('Ruang Kelas 11B', 'RK-11B', 'CLASSROOM', 30, 2, 'Gedung A', true),
    ('Ruang Kelas 11C', 'RK-11C', 'CLASSROOM', 30, 2, 'Gedung A', true),
    ('Ruang Kelas 11D', 'RK-11D', 'CLASSROOM', 30, 2, 'Gedung A', true),
    ('Ruang Kelas 11E', 'RK-11E', 'CLASSROOM', 30, 2, 'Gedung A', true),
    ('Ruang Kelas 12A', 'RK-12A', 'CLASSROOM', 30, 3, 'Gedung A', true),
    ('Ruang Kelas 12B', 'RK-12B', 'CLASSROOM', 30, 3, 'Gedung A', true),
    ('Ruang Kelas 12C', 'RK-12C', 'CLASSROOM', 30, 3, 'Gedung A', true),
    ('Ruang Kelas 12D', 'RK-12D', 'CLASSROOM', 30, 3, 'Gedung A', true),
    ('Ruang Kelas 12E', 'RK-12E', 'CLASSROOM', 30, 3, 'Gedung A', true)
    ON CONFLICT (code) DO NOTHING;

    -- Get room IDs after insert
    SELECT id INTO v_rk_10c_id FROM rooms WHERE code = 'RK-10C' LIMIT 1;
    SELECT id INTO v_rk_10d_id FROM rooms WHERE code = 'RK-10D' LIMIT 1;
    SELECT id INTO v_rk_10e_id FROM rooms WHERE code = 'RK-10E' LIMIT 1;
    SELECT id INTO v_rk_11a_id FROM rooms WHERE code = 'RK-11A' LIMIT 1;
    SELECT id INTO v_rk_11b_id FROM rooms WHERE code = 'RK-11B' LIMIT 1;
    SELECT id INTO v_rk_11c_id FROM rooms WHERE code = 'RK-11C' LIMIT 1;
    SELECT id INTO v_rk_11d_id FROM rooms WHERE code = 'RK-11D' LIMIT 1;
    SELECT id INTO v_rk_11e_id FROM rooms WHERE code = 'RK-11E' LIMIT 1;
    SELECT id INTO v_rk_12a_id FROM rooms WHERE code = 'RK-12A' LIMIT 1;
    SELECT id INTO v_rk_12b_id FROM rooms WHERE code = 'RK-12B' LIMIT 1;
    SELECT id INTO v_rk_12c_id FROM rooms WHERE code = 'RK-12C' LIMIT 1;
    SELECT id INTO v_rk_12d_id FROM rooms WHERE code = 'RK-12D' LIMIT 1;
    SELECT id INTO v_rk_12e_id FROM rooms WHERE code = 'RK-12E' LIMIT 1;

    -- Get subject IDs
    SELECT id INTO v_mtk_id FROM subjects WHERE code = 'MTK-101' LIMIT 1;
    SELECT id INTO v_bin_id FROM subjects WHERE code = 'BIN-101' LIMIT 1;
    SELECT id INTO v_ing_id FROM subjects WHERE code = 'ING-101' LIMIT 1;
    SELECT id INTO v_fis_id FROM subjects WHERE code = 'FIS-101' LIMIT 1;
    SELECT id INTO v_kim_id FROM subjects WHERE code = 'KIM-101' LIMIT 1;
    SELECT id INTO v_bio_id FROM subjects WHERE code = 'BIO-101' LIMIT 1;
    SELECT id INTO v_eko_id FROM subjects WHERE code = 'EKO-101' LIMIT 1;
    SELECT id INTO v_sos_id FROM subjects WHERE code = 'SOS-101' LIMIT 1;
    SELECT id INTO v_sej_id FROM subjects WHERE code = 'SEJ-101' LIMIT 1;
    SELECT id INTO v_pkn_id FROM subjects WHERE code = 'PPKn-101' LIMIT 1;
    SELECT id INTO v_pa_id FROM subjects WHERE code = 'PAK-101' LIMIT 1;
    SELECT id INTO v_pjk_id FROM subjects WHERE code = 'PJK-101' LIMIT 1;
    SELECT id INTO v_sen_id FROM subjects WHERE code = 'SEN-101' LIMIT 1;

    -- Create BK subject if not exists
    INSERT INTO subjects (name, code, subject_type, credit_hours, description, is_active) VALUES
    ('Bimbingan Konseling', 'BK-101', 'MANDATORY', 1, 'Bimbingan konseling', true)
    ON CONFLICT (code) DO NOTHING;

    SELECT id INTO v_bk_id FROM subjects WHERE code = 'BK-101' LIMIT 1;

    -- =====================================================
    -- CREATE TEACHER PROFILES (25 teachers)
    -- =====================================================
    INSERT INTO profiles (email, full_name, role, nip, status, created_at) VALUES
    ('budi.santoso@sekolah.id', 'Budi Santoso, S.Pd', 'GURU', '198001012005011001', 'ACTIVE', NOW()),
    ('siti.nurhaliza@sekolah.id', 'Siti Nurhaliza, S.Pd', 'GURU', '198205122008012005', 'ACTIVE', NOW()),
    ('ahmad.rizky@sekolah.id', 'Ahmad Rizky Pratama, M.Si', 'GURU', '197803202002031002', 'ACTIVE', NOW()),
    ('dewi.kartini@sekolah.id', 'Dewi Kartini, S.Si', 'GURU', '198307152009022004', 'ACTIVE', NOW()),
    ('farhan.maulana@sekolah.id', 'Farhan Maulana, S.Pd', 'GURU', '198509102010011005', 'ACTIVE', NOW()),
    ('gita.puspita@sekolah.id', 'Gita Puspita, M.Si', 'GURU', '198012122007011003', 'ACTIVE', NOW()),
    ('hendra.wijaya@sekolah.id', 'Hendra Wijaya, S.Pd', 'GURU', '198402182009011006', 'ACTIVE', NOW()),
    ('intan.permata@sekolah.id', 'Intan Permata, S.Hum', 'GURU', '198604252010012007', 'ACTIVE', NOW()),
    ('joko.prasetyo@sekolah.id', 'Joko Prasetyo, M.Pd', 'GURU', '197905202006011001', 'ACTIVE', NOW()),
    ('kartika.sari@sekolah.id', 'Kartika Sari, S.Pd', 'GURU', '198808122011012008', 'ACTIVE', NOW()),
    ('lukman.hakim@sekolah.id', 'Lukman Hakim, S.Ag', 'GURU', '198310152008011009', 'ACTIVE', NOW()),
    ('maya.anggraini@sekolah.id', 'Maya Anggraini, S.Pd', 'GURU', '199001202019022010', 'ACTIVE', NOW()),
    ('nova.iriante@sekolah.id', 'Nova Iriante, M.Pd', 'GURU', '198703182012022011', 'ACTIVE', NOW()),
    ('oskar.saputra@sekolah.id', 'Oskar Saputra, S.Sos', 'GURU', '198906232014031012', 'ACTIVE', NOW()),
    ('putri.ayu@sekolah.id', 'Putri Ayu, S.Pd', 'GURU', '199008282015012013', 'ACTIVE', NOW()),
    ('qonita Rahmawati@sekolah.id', 'Qonita Rahmawati, M.Si', 'GURU', '198110192006011002', 'ACTIVE', NOW()),
    ('rudi.hartono@sekolah.id', 'Rudi Hartono, S.Pd', 'GURU', '199205102016011014', 'ACTIVE', NOW()),
    ('sri.rejeki@sekolah.id', 'Sri Rejeki, S.Pd', 'GURU', '199201152020122015', 'ACTIVE', NOW()),
    ('tito.karnadi@sekolah.id', 'Tito Karnadi, M.Sn', 'GURU', '198804182011011008', 'ACTIVE', NOW()),
    ('uni.wulandari@sekolah.id', 'Uni Wulandari, S.Psi', 'GURU', '199303222019032016', 'ACTIVE', NOW()),
    ('vina.melati@sekolah.id', 'Vina Melati, S.Pd', 'GURU', '199407122020012017', 'ACTIVE', NOW()),
    ('wahyu.saputra@sekolah.id', 'Wahyu Saputra, M.Pd', 'GURU', '198909182015011009', 'ACTIVE', NOW()),
    ('xena.pratiwi@sekolah.id', 'Xena Pratiwi, S.Si', 'GURU', '199511122021022018', 'ACTIVE', NOW()),
    ('yusuf.mansur@sekolah.id', 'Yusuf Mansur, S.Pd', 'GURU', '199102142022011019', 'ACTIVE', NOW()),
    ('zahra.kamilah@sekolah.id', 'Zahra Kamilah, S.Pd', 'GURU', '199605182023012020', 'ACTIVE', NOW())
    ON CONFLICT (email) DO NOTHING;

    RAISE NOTICE 'Sample teachers created';

END $$;

-- =====================================================
-- INSERT CLASSES (15 classes)
-- =====================================================
DO $$
DECLARE
    v_ay_id UUID;
    v_level_x_id UUID;
    v_level_xi_id UUID;
    v_level_xii_id UUID;
    v_mipa_id UUID;
    v_ips_id UUID;
    v_bhs_id UUID;
BEGIN
    SELECT id INTO v_ay_id FROM academic_years WHERE name = '2024/2025' LIMIT 1;
    SELECT id INTO v_level_x_id FROM class_levels WHERE code = 'X' LIMIT 1;
    SELECT id INTO v_level_xi_id FROM class_levels WHERE code = 'XI' LIMIT 1;
    SELECT id INTO v_level_xii_id FROM class_levels WHERE code = 'XII' LIMIT 1;
    SELECT id INTO v_mipa_id FROM departments WHERE code = 'MIPA' LIMIT 1;
    SELECT id INTO v_ips_id FROM departments WHERE code = 'IPS' LIMIT 1;
    SELECT id INTO v_bhs_id FROM departments WHERE code = 'BHS' LIMIT 1;

    -- Kelas X (5 kelas)
    INSERT INTO classes (name, code, class_level_id, department_id, academic_year_id, home_room_id, capacity, current_enrollment, is_active) VALUES
    ('X-A', 'CLS-X-A', v_level_x_id, NULL, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-10A'), 30, 0, true),
    ('X-B', 'CLS-X-B', v_level_x_id, NULL, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-10B'), 30, 0, true),
    ('X-MIPA-1', 'CLS-X-MIPA-1', v_level_x_id, v_mipa_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-10C'), 30, 0, true),
    ('X-MIPA-2', 'CLS-X-MIPA-2', v_level_x_id, v_mipa_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-10D'), 30, 0, true),
    ('X-IPS-1', 'CLS-X-IPS-1', v_level_x_id, v_ips_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-10E'), 30, 0, true);

    -- Kelas XI (5 kelas)
    INSERT INTO classes (name, code, class_level_id, department_id, academic_year_id, home_room_id, capacity, current_enrollment, is_active) VALUES
    ('XI-MIPA-1', 'CLS-XI-MIPA-1', v_level_xi_id, v_mipa_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-11A'), 30, 0, true),
    ('XI-MIPA-2', 'CLS-XI-MIPA-2', v_level_xi_id, v_mipa_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-11B'), 30, 0, true),
    ('XI-IPS-1', 'CLS-XI-IPS-1', v_level_xi_id, v_ips_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-11C'), 30, 0, true),
    ('XI-IPS-2', 'CLS-XI-IPS-2', v_level_xi_id, v_ips_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-11D'), 30, 0, true),
    ('XI-BHS-1', 'CLS-XI-BHS-1', v_level_xi_id, v_bhs_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-11E'), 30, 0, true);

    -- Kelas XII (5 kelas)
    INSERT INTO classes (name, code, class_level_id, department_id, academic_year_id, home_room_id, capacity, current_enrollment, is_active) VALUES
    ('XII-MIPA-1', 'CLS-XII-MIPA-1', v_level_xii_id, v_mipa_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-12A'), 30, 0, true),
    ('XII-MIPA-2', 'CLS-XII-MIPA-2', v_level_xii_id, v_mipa_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-12B'), 30, 0, true),
    ('XII-IPS-1', 'CLS-XII-IPS-1', v_level_xii_id, v_ips_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-12C'), 30, 0, true),
    ('XII-IPS-2', 'CLS-XII-IPS-2', v_level_xii_id, v_ips_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-12D'), 30, 0, true),
    ('XII-BHS-1', 'CLS-XII-BHS-1', v_level_xii_id, v_bhs_id, v_ay_id, (SELECT id FROM rooms WHERE code = 'RK-12E'), 30, 0, true);

    RAISE NOTICE '15 classes created';
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify tables were created
DO $$
BEGIN
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - class_levels: %', (SELECT COUNT(*) FROM class_levels);
    RAISE NOTICE '  - classes: %', (SELECT COUNT(*) FROM classes);
    RAISE NOTICE '  - enrollments: %', (SELECT COUNT(*) FROM enrollments);
    RAISE NOTICE '  - class_schedules: %', (SELECT COUNT(*) FROM class_schedules);
    RAISE NOTICE '  - parent_student_relationships: %', (SELECT COUNT(*) FROM parent_student_relationships);
END $$;
