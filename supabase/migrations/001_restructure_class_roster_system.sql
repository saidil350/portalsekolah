-- =====================================================
-- RESTRUCTURE CLASS ROSTER SYSTEM
-- Based on Indonesian School System Hierarchy
-- =====================================================

-- =====================================================
-- 1. TAHUN AJARAN (Academic Years)
-- Root of hierarchy - master data
-- =====================================================

-- Drop existing if recreating
DROP TABLE IF EXISTS academic_years CASCADE;
DROP TABLE IF EXISTS semesters CASCADE;

CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- "2024/2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false, -- Only one TA should be active
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT dates_order CHECK (end_date > start_date)
);

-- Table untuk semester (setiap TA punya 2 semester)
CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- "Ganjil", "Genap"
    semester_number INTEGER NOT NULL CHECK (semester_number IN (1, 2)),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT unique_semester_per_ta UNIQUE (academic_year_id, semester_number)
);

-- Trigger untuk updated_at academic_years
CREATE OR REPLACE FUNCTION update_academic_year_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_academic_year_timestamp
    BEFORE UPDATE ON academic_years
    FOR EACH ROW
    EXECUTE FUNCTION update_academic_year_timestamp();

-- =====================================================
-- 2. JURUSAN / PROGRAM STUDI (Departments)
-- Master data - jurusan ada di semua TA
-- =====================================================

DROP TABLE IF EXISTS departments CASCADE;

CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE, -- "RPL", "TKJ", "IPA", "IPS"
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample jurusan
INSERT INTO departments (name, code, description) VALUES
('Rekayasa Perangkat Lunak', 'RPL', 'Jurusan Rekayasa Perangkat Lunak'),
('Teknik Komputer dan Jaringan', 'TKJ', 'Jurusan Teknik Komputer dan Jaringan'),
('Ilmu Pengetahuan Alam', 'IPA', 'Jurusan IPA (MIPA)'),
('Ilmu Pengetahuan Sosial', 'IPS', 'Jurusan IPS'),
('Bahasa dan Sastra', 'BHS', 'Jurusan Bahasa dan Sastra')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 3. CLASS LEVELS (Tingkat Kelas)
-- Master data - X, XI, XII
-- =====================================================

DROP TABLE IF EXISTS class_levels CASCADE;

CREATE TABLE class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL UNIQUE, -- "Kelas X", "Kelas XI", "Kelas XII"
    code VARCHAR(20) NOT NULL UNIQUE, -- "X", "XI", "XII"
    level INTEGER NOT NULL UNIQUE, -- 10, 11, 12
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert class levels
INSERT INTO class_levels (name, code, level, description) VALUES
('Kelas X', 'X', 10, 'Kelas 10 - Tahun Pertama'),
('Kelas XI', 'XI', 11, 'Kelas 11 - Tahun Kedua'),
('Kelas XII', 'XII', 12, 'Kelas 12 - Tahun Ketiga')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 4. GURU (Teachers)
-- Master data - satu guru bisa mengajar banyak mapel & kelas
-- =====================================================

-- Table profiles sudah ada, kita hanya perlu pastikan role GURU ada
-- Tambah kolom bidang_studi di profiles
DO $$
BEGIN
    -- Add bidang_studi array column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'bidang_studi'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bidang_studi TEXT[];
    END IF;
END $$;

-- =====================================================
-- 5. MATA PELAJARAN (Subjects)
-- Master data - bisa lintas jurusan (jurusan_id nullable)
-- =====================================================

DROP TABLE IF EXISTS subjects CASCADE;

CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE, -- "MTK-101", "BIN-101"
    subject_type VARCHAR(20) NOT NULL CHECK (subject_type IN ('MANDATORY', 'OPTIONAL', 'EXTRACURRICULAR')),
    credit_hours INTEGER DEFAULT 2, -- SKS / jam per minggu
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL, -- NULL = lintas jurusan
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample subjects
INSERT INTO subjects (name, code, subject_type, credit_hours, department_id, description) VALUES
-- Mata pelajaran lintas jurusan (department_id = NULL)
('Matematika', 'MTK-101', 'MANDATORY', 4, NULL, 'Matematika Dasar'),
('Bahasa Indonesia', 'BIN-101', 'MANDATORY', 4, NULL, 'Bahasa Indonesia'),
('Bahasa Inggris', 'ING-101', 'MANDATORY', 4, NULL, 'Bahasa Inggris'),
('Pendidikan Agama', 'PAK-101', 'MANDATORY', 2, NULL, 'Pendidikan Agama'),
('Pendidikan Pancasila', 'PPKn-101', 'MANDATORY', 2, NULL, 'Pendidikan Pancasila'),
('Penjaskes', 'PJK-101', 'MANDATORY', 2, NULL, 'Pendidikan Jasmani'),

-- Mata pelajaran jurusan IPA (gunakan department_id IPA jika ada)
-- ('Fisika', 'FIS-101', 'MANDATORY', 3, NULL, 'Fisika'),
-- ('Kimia', 'KIM-101', 'MANDATORY', 3, NULL, 'Kimia'),
-- ('Biologi', 'BIO-101', 'MANDATORY', 3, NULL, 'Biologi'),

-- Mata pelajaran jurusan IPS
-- ('Ekonomi', 'EKO-101', 'MANDATORY', 3, NULL, 'Ekonomi'),
-- ('Sosiologi', 'SOS-101', 'MANDATORY', 3, NULL, 'Sosiologi'),
-- ('Sejarah', 'SEJ-101', 'MANDATORY', 2, NULL, 'Sejarah'),

-- Mata pelajaran jurusan RPL/TKJ (Produktif)
('Pemrograman Dasar', 'PROD-101', 'MANDATORY', 6, NULL, 'Pemrograman Dasar'),
('Dasar Desain Grafis', 'DDG-101', 'MANDATORY', 4, NULL, 'Dasar Desain Grafis'),
('Sistem Komputer', 'SK-101', 'MANDATORY', 4, NULL, 'Sistem Komputer')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 6. RUANGAN (Rooms)
-- Master data - ruangan bisa dipakai semua kelas/jurusan
-- =====================================================

DROP TABLE IF EXISTS rooms CASCADE;

CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE, -- "RK-10A", "LAB-1"
    room_type VARCHAR(20) NOT NULL CHECK (room_type IN ('CLASSROOM', 'LAB', 'WORKSHOP', 'OFFICE', 'OTHER')),
    capacity INTEGER DEFAULT 30,
    floor INTEGER DEFAULT 1,
    building VARCHAR(50), -- "Gedung A", "Gedung B"
    facilities TEXT[], -- ['Projector', 'AC', 'Computer', 'Whiteboard']
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert sample rooms
INSERT INTO rooms (name, code, room_type, capacity, floor, building, facilities) VALUES
('Ruang Kelas 10A', 'RK-10A', 'CLASSROOM', 36, 1, 'Gedung A', ARRAY['Whiteboard', 'AC', 'Projector']),
('Ruang Kelas 10B', 'RK-10B', 'CLASSROOM', 36, 1, 'Gedung A', ARRAY['Whiteboard', 'AC', 'Projector']),
('Ruang Kelas 11A', 'RK-11A', 'CLASSROOM', 36, 2, 'Gedung A', ARRAY['Whiteboard', 'AC', 'Projector']),
('Ruang Kelas 11B', 'RK-11B', 'CLASSROOM', 36, 2, 'Gedung A', ARRAY['Whiteboard', 'AC', 'Projector']),
('Ruang Kelas 12A', 'RK-12A', 'CLASSROOM', 36, 3, 'Gedung A', ARRAY['Whiteboard', 'AC', 'Projector']),
('Ruang Kelas 12B', 'RK-12B', 'CLASSROOM', 36, 3, 'Gedung A', ARRAY['Whiteboard', 'AC', 'Projector']),
('Lab Komputer 1', 'LAB-KOM-1', 'LAB', 40, 2, 'Gedung B', ARRAY['Computer', 'Projector', 'AC', 'Whiteboard']),
('Lab Bahasa', 'LAB-BHS', 'LAB', 40, 2, 'Gedung B', ARRAY['Audio System', 'Projector', 'AC'])
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- 7. KELAS / ROMBEL (Classes)
-- Transaction data - dibuat per TA, tidak carry over
-- Terikat ke: Tahun Ajaran + Jurusan + Tingkat
-- =====================================================

DROP TABLE IF EXISTS classes CASCADE;

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL, -- "X RPL 1", "XI IPA 2"
    code VARCHAR(20) NOT NULL, -- "X-RPL-1", "XI-IPA-2"

    -- FK ke master data
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL, -- Nullable karena ada kelas full TA
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL, -- NULL = kelas non-jurusan
    class_level_id UUID NOT NULL REFERENCES class_levels(id) ON DELETE RESTRICT,

    -- Wali kelas
    wali_kelas_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Ruang base (opsional)
    home_room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,

    -- Kapasitas & enrollment
    capacity INTEGER NOT NULL DEFAULT 36 CHECK (capacity > 0 AND capacity <= 40),
    current_enrollment INTEGER NOT NULL DEFAULT 0 CHECK (current_enrollment >= 0),

    -- Status
    is_active BOOLEAN DEFAULT true,
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT unique_class_per_ta UNIQUE (academic_year_id, code),
    CONSTRAINT wali_kelas_must_be_teacher CHECK (
        wali_kelas_id IS NULL OR
        EXISTS (SELECT 1 FROM profiles WHERE id = wali_kelas_id AND role = 'GURU')
    )
);

-- Indexes
CREATE INDEX idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX idx_classes_department ON classes(department_id);
CREATE INDEX idx_classes_class_level ON classes(class_level_id);
CREATE INDEX idx_classes_wali_kelas ON classes(wali_kelas_id);
CREATE INDEX idx_classes_active ON classes(is_active) WHERE is_active = true;

-- Trigger untuk updated_at
CREATE TRIGGER trigger_update_classes_timestamp
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_classes_updated_at();

-- =====================================================
-- 8. MURID (Students)
-- Master data - murid adalah entity terpisah dari kelas
-- Profile dengan role SISWA
-- =====================================================

-- Tambah kolom angkatan ke profiles jika belum ada
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'angkatan'
    ) THEN
        ALTER TABLE profiles ADD COLUMN angkatan INTEGER;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'nisn'
    ) THEN
        ALTER TABLE profiles ADD COLUMN nisn VARCHAR(20);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'profiles' AND column_name = 'nis'
    ) THEN
        ALTER TABLE profiles ADD COLUMN nis VARCHAR(20);
    END IF;
END $$;

-- =====================================================
-- 9. ENROLLMENT (Murid ke Kelas)
-- Transaction data - mencatat riwayat enrollment per TA
-- =====================================================

DROP TABLE IF EXISTS enrollments CASCADE;

CREATE TABLE enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- FK
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,

    -- Status enrollment
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PINDAH', 'LULUS', 'DROPOUT', 'NONAKTIF')),

    -- Tanggal penting
    enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    dropout_date DATE,

    -- Alasan pindah/keluar
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints - satu murid hanya punya satu enrollment aktif per TA di satu kelas
    CONSTRAINT unique_active_enrollment UNIQUE (student_id, academic_year_id)
    WHERE (status = 'ACTIVE')
);

-- Indexes
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_enrollments_academic_year ON enrollments(academic_year_id);
CREATE INDEX idx_enrollments_status ON enrollments(status) WHERE status = 'ACTIVE';
CREATE INDEX idx_enrollments_unique_active ON enrollments(student_id, academic_year_id)
    WHERE (status = 'ACTIVE');

-- =====================================================
-- 10. JADWAL MENGAJAR (Class Schedules / Teaching Assignments)
-- Many-to-Many antara Guru, Kelas, Mapel via Jadwal
-- =====================================================

DROP TABLE IF EXISTS class_schedules CASCADE;

CREATE TABLE class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- FK
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,

    -- Waktu
    semester_id UUID REFERENCES semesters(id) ON DELETE SET NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,

    hari INTEGER NOT NULL CHECK (hari BETWEEN 1 AND 7), -- 1=Senin, 7=Minggu
    jam_mulai TIME NOT NULL,
    jam_selesai TIME NOT NULL,

    -- Status
    is_active BOOLEAN DEFAULT true,
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Constraints
    CONSTRAINT jam_valid CHECK (jam_selesai > jam_mulai),
    CONSTRAINT teacher_must_be_guru CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = teacher_id AND role = 'GURU')
    ),

    -- Prevent overlapping schedules for same class
    EXCLUDE USING GIST (
        class_id WITH =,
        hari WITH =,
        tsrange(jam_mulai, jam_selesai) WITH &&
    )
);

-- Indexes
CREATE INDEX idx_class_schedules_class ON class_schedules(class_id);
CREATE INDEX idx_class_schedules_teacher ON class_schedules(teacher_id);
CREATE INDEX idx_class_schedules_subject ON class_schedules(subject_id);
CREATE INDEX idx_class_schedules_room ON class_schedules(room_id);
CREATE INDEX idx_class_schedules_hari_waktu ON class_schedules(hari, jam_mulai, jam_selesai);
CREATE INDEX idx_class_schedules_academic_year ON class_schedules(academic_year_id);
CREATE INDEX idx_class_schedules_active ON class_schedules(is_active) WHERE is_active = true;

-- Trigger untuk updated_at
CREATE TRIGGER trigger_update_class_schedules_timestamp
    BEFORE UPDATE ON class_schedules
    FOR EACH ROW
    EXECUTE FUNCTION update_class_schedules_updated_at();

-- =====================================================
-- 11. FUNCTIONS & TRIGGERS
-- =====================================================

-- Trigger: Auto-update class enrollment count
CREATE OR REPLACE FUNCTION update_class_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'ACTIVE' THEN
            UPDATE classes
            SET current_enrollment = current_enrollment + 1
            WHERE id = NEW.class_id;
        END IF;
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle status changes
        IF OLD.status != NEW.status THEN
            -- Murid menjadi aktif
            IF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' THEN
                UPDATE classes
                SET current_enrollment = current_enrollment + 1
                WHERE id = NEW.class_id;
            -- Murid menjadi non-aktif/pindah/lulus/dropout
            ELSIF NEW.status != 'ACTIVE' AND OLD.status = 'ACTIVE' THEN
                UPDATE classes
                SET current_enrollment = GREATEST(current_enrollment - 1, 0)
                WHERE id = NEW.class_id;
            END IF;
        END IF;

        -- Handle class changes
        IF OLD.class_id != NEW.class_id THEN
            -- Decrement old class
            IF OLD.status = 'ACTIVE' THEN
                UPDATE classes
                SET current_enrollment = GREATEST(current_enrollment - 1, 0)
                WHERE id = OLD.class_id;
            END IF;

            -- Increment new class
            IF NEW.status = 'ACTIVE' THEN
                UPDATE classes
                SET current_enrollment = current_enrollment + 1
                WHERE id = NEW.class_id;
            END IF;
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.status = 'ACTIVE' THEN
            UPDATE classes
            SET current_enrollment = GREATEST(current_enrollment - 1, 0)
            WHERE id = OLD.class_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_class_enrollment ON enrollments;
CREATE TRIGGER trigger_update_class_enrollment
    AFTER INSERT OR UPDATE OR DELETE ON enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_class_enrollment_count();

-- =====================================================
-- 12. VIEWS FOR EASY DATA ACCESS
-- =====================================================

-- View: Class roster with complete info
CREATE OR REPLACE VIEW view_class_roster_complete AS
SELECT
    c.id,
    c.name,
    c.code,
    c.capacity,
    c.current_enrollment,
    ROUND((c.current_enrollment::FLOAT / c.capacity::FLOAT) * 100) as occupancy_rate,

    -- Master data relations
    cl.name as class_level_name,
    cl.code as class_level_code,
    cl.level as tingkat,

    d.name as department_name,
    d.code as department_code,

    ay.name as academic_year_name,
    ay.start_date as academic_year_start,
    ay.end_date as academic_year_end,

    s.name as semester_name,
    s.semester_number,

    -- Wali kelas
    wali.full_name as wali_kelas_name,
    wali.email as wali_kelas_email,
    wali.nip as wali_kelas_nip,

    -- Ruang
    r.name as home_room_name,
    r.code as home_room_code,

    -- Status
    c.is_active,
    c.description,
    c.created_at
FROM classes c
LEFT JOIN class_levels cl ON c.class_level_id = cl.id
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
LEFT JOIN semesters s ON c.semester_id = s.id
LEFT JOIN rooms r ON c.home_room_id = r.id
LEFT JOIN profiles wali ON c.wali_kelas_id = wali.id
ORDER BY
    ay.start_date DESC,
    cl.level,
    d.name,
    c.name;

-- View: Teaching schedule with conflict detection info
CREATE OR REPLACE VIEW view_teaching_schedule_complete AS
SELECT
    cs.id,
    cs.hari,
    cs.jam_mulai,
    cs.jam_selesai,

    -- Class info
    c.id as class_id,
    c.name as class_name,
    c.code as class_code,
    cl.level as tingkat,
    d.name as department_name,

    -- Subject
    s.id as subject_id,
    s.name as subject_name,
    s.code as subject_code,

    -- Teacher
    t.id as teacher_id,
    t.full_name as teacher_name,
    t.email as teacher_email,

    -- Room
    r.id as room_id,
    r.name as room_name,
    r.code as room_code,

    -- Academic info
    ay.name as academic_year,
    sem.name as semester,

    -- Status
    cs.is_active,
    cs.notes
FROM class_schedules cs
JOIN classes c ON cs.class_id = c.id
JOIN subjects s ON cs.subject_id = s.id
JOIN profiles t ON cs.teacher_id = t.id
LEFT JOIN rooms r ON cs.room_id = r.id
LEFT JOIN academic_years ay ON cs.academic_year_id = ay.id
LEFT JOIN semesters sem ON cs.semester_id = sem.id
LEFT JOIN class_levels cl ON c.class_level_id = cl.id
LEFT JOIN departments d ON c.department_id = d.id
ORDER BY
    cs.hari,
    cs.jam_mulai,
    c.name;

-- View: Student enrollment history
CREATE OR REPLACE VIEW view_student_enrollment_history AS
SELECT
    e.id as enrollment_id,
    e.status,
    e.enrollment_date,
    e.dropout_date,
    e.notes,

    -- Student info
    p.id as student_id,
    p.full_name as student_name,
    p.email as student_email,
    p.nis,
    p.nisn,
    p.angkatan,

    -- Class info
    c.id as class_id,
    c.name as class_name,
    c.code as class_code,
    cl.level as tingkat,
    d.name as department_name,

    -- Academic year
    ay.name as academic_year_name,
    ay.start_date,
    ay.end_date,

    e.created_at
FROM enrollments e
JOIN profiles p ON e.student_id = p.id
JOIN classes c ON e.class_id = c.id
LEFT JOIN class_levels cl ON c.class_level_id = cl.id
LEFT JOIN departments d ON c.department_id = d.id
JOIN academic_years ay ON e.academic_year_id = ay.id
ORDER BY
    ay.start_date DESC,
    p.full_name,
    e.enrollment_date;

-- =====================================================
-- 13. HELPER FUNCTIONS
-- =====================================================

-- Function: Cek konflik jadwal guru
CREATE OR REPLACE FUNCTION check_teacher_schedule_conflict(
    p_teacher_id UUID,
    p_hari INTEGER,
    p_jam_mulai TIME,
    p_jam_selesai TIME,
    p_exclude_schedule_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM class_schedules
    WHERE teacher_id = p_teacher_id
        AND hari = p_hari
        AND is_active = true
        AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
        AND (
            -- Overlap: (StartA < EndB) and (EndA > StartB)
            (jam_mulai < p_jam_selesai AND jam_selesai > p_jam_mulai)
        );

    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function: Cek konflik jadwal ruangan
CREATE OR REPLACE FUNCTION check_room_schedule_conflict(
    p_room_id UUID,
    p_hari INTEGER,
    p_jam_mulai TIME,
    p_jam_selesai TIME,
    p_exclude_schedule_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO conflict_count
    FROM class_schedules
    WHERE room_id = p_room_id
        AND hari = p_hari
        AND is_active = true
        AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
        AND (
            (jam_mulai < p_jam_selesai AND jam_selesai > p_jam_mulai)
        );

    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function: Cek apakah guru sudah jadi wali kelas di TA lain
CREATE OR REPLACE FUNCTION check_wali_kelas_assignment(
    p_teacher_id UUID,
    p_academic_year_id UUID,
    p_exclude_class_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
    assignment_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO assignment_count
    FROM classes
    WHERE wali_kelas_id = p_teacher_id
        AND academic_year_id = p_academic_year_id
        AND is_active = true
        AND (p_exclude_class_id IS NULL OR id != p_exclude_class_id);

    RETURN assignment_count > 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 14. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE semesters ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;

-- Create function to check user role (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION check_user_role(user_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = user_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION check_user_role TO authenticated;

-- Simple policies: Admin IT full access, others read-only for active data

DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOREACH table_name IN ARRAY ARRAY['academic_years', 'semesters', 'departments', 'class_levels', 'subjects', 'rooms', 'classes', 'enrollments', 'class_schedules']
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admin IT full access on %s" ON %I', table_name, table_name);
        EXECUTE format('CREATE POLICY "Admin IT full access on %s" ON %I FOR ALL TO authenticated USING (check_user_role(''ADMIN_IT'')) WITH CHECK (check_user_role(''ADMIN_IT''))', table_name, table_name);

        EXECUTE format('DROP POLICY IF EXISTS "Authenticated read access on %s" ON %I', table_name, table_name);
        EXECUTE format('CREATE POLICY "Authenticated read access on %s" ON %I FOR SELECT TO authenticated USING (true)', table_name, table_name);
    END LOOP;
END $$;

-- =====================================================
-- 15. SAMPLE DATA FOR TESTING
-- =====================================================

-- Insert academic year
INSERT INTO academic_years (name, start_date, end_date, is_active) VALUES
('2024/2025', '2024-07-15', '2025-06-30', true)
ON CONFLICT (name) DO NOTHING;

-- Get academic year ID
DO $$
DECLARE
    v_ay_id UUID;
    v_sem_id UUID;
BEGIN
    SELECT id INTO v_ay_id FROM academic_years WHERE name = '2024/2025' LIMIT 1;

    -- Insert semester ganjil
    INSERT INTO semesters (academic_year_id, name, semester_number, start_date, end_date, is_active)
    VALUES (v_ay_id, 'Ganjil', 1, '2024-07-15', '2025-01-15', true)
    ON CONFLICT (academic_year_id, semester_number) DO NOTHING;

    RAISE NOTICE 'Sample data created successfully. Check your tables!';
END $$;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'CLASS ROSTER SYSTEM RESTRUCTURED';
    RAISE NOTICE 'Hierarki: TA → Semester → Jurusan → Kelas';
    RAISE NOTICE 'Silakan cek view: view_class_roster_complete';
    RAISE NOTICE '========================================';
END $$;
