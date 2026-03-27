-- =====================================================
-- CLASS ROSTER SYSTEM - FINAL VERSION
-- Clean migration without is_active dependency on profiles
-- =====================================================

-- =====================================================
-- STEP 0: Create Required Tables (if not exist)
-- =====================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    CREATE TABLE profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        role VARCHAR(50) NOT NULL,
        nisn VARCHAR(20),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'rooms') THEN
    CREATE TABLE rooms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        room_type VARCHAR(50) NOT NULL,
        capacity INTEGER DEFAULT 30,
        floor INTEGER DEFAULT 1,
        building VARCHAR(100),
        facilities TEXT[],
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subjects') THEN
    CREATE TABLE subjects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        subject_type VARCHAR(50) DEFAULT 'MANDATORY',
        credit_hours INTEGER DEFAULT 2,
        department_id UUID,
        academic_year_id UUID,
        description TEXT,
        prerequisites TEXT[],
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'academic_years') THEN
    CREATE TABLE academic_years (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        is_active BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END $$;

-- =====================================================
-- STEP 1: Create Class Roster Tables
-- =====================================================

CREATE TABLE IF NOT EXISTS class_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    level_order INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS class_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week IN (1,2,3,4,5,6,7)),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL CHECK (end_time > start_time),
    academic_year_id UUID REFERENCES academic_years(id) ON DELETE SET NULL,
    semester INTEGER CHECK (semester IN (1,2)),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS parent_student_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) CHECK (relationship_type IN ('FATHER', 'MOTHER', 'GUARDIAN')),
    is_primary BOOLEAN DEFAULT false,
    is_emergency_contact BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(parent_id, student_id)
);

-- =====================================================
-- STEP 2: Create Indexes
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_classes_code ON classes(code);
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(class_level_id);
CREATE INDEX IF NOT EXISTS idx_classes_department ON classes(department_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_classes_wali_kelas ON classes(wali_kelas_id);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_enrollments_class ON enrollments(class_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_academic_year ON enrollments(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status) WHERE status = 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_class_schedules_class ON class_schedules(class_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_teacher ON class_schedules(teacher_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_subject ON class_schedules(subject_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_room ON class_schedules(room_id);
CREATE INDEX IF NOT EXISTS idx_class_schedules_day_time ON class_schedules(day_of_week, start_time);
CREATE INDEX IF NOT EXISTS idx_class_schedules_active ON class_schedules(is_active) WHERE is_active = true;

-- =====================================================
-- STEP 3: Create Functions
-- =====================================================

CREATE OR REPLACE FUNCTION calculate_occupancy_rate(
  p_current_enrollment INTEGER,
  p_capacity INTEGER
) RETURNS INTEGER AS $$
BEGIN
  IF p_capacity IS NULL OR p_capacity = 0 THEN
    RETURN 0;
  END IF;
  RETURN ROUND((p_current_enrollment::FLOAT / p_capacity::FLOAT) * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_occupancy_badge(
  p_occupancy_rate INTEGER
) RETURNS TEXT AS $$
BEGIN
  IF p_occupancy_rate >= 90 THEN
    RETURN 'FULL';
  ELSIF p_occupancy_rate >= 50 THEN
    RETURN 'AVAILABLE';
  ELSE
    RETURN 'LOW';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION get_day_name_indo(
  p_day_of_week INTEGER
) RETURNS TEXT AS $$
BEGIN
  CASE p_day_of_week
    WHEN 1 THEN RETURN 'Senin';
    WHEN 2 THEN RETURN 'Selasa';
    WHEN 3 THEN RETURN 'Rabu';
    WHEN 4 THEN RETURN 'Kamis';
    WHEN 5 THEN RETURN 'Jumat';
    WHEN 6 THEN RETURN 'Sabtu';
    WHEN 7 THEN RETURN 'Minggu';
    ELSE RETURN 'Unknown';
  END CASE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION check_schedule_conflict(
  p_class_id UUID,
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_schedule_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM class_schedules
  WHERE class_id = p_class_id
    AND day_of_week = p_day_of_week
    AND is_active = true
    AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_teacher_availability(
  p_teacher_id UUID,
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_schedule_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM class_schedules
  WHERE teacher_id = p_teacher_id
    AND day_of_week = p_day_of_week
    AND is_active = true
    AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_room_availability(
  p_room_id UUID,
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_schedule_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM class_schedules
  WHERE room_id = p_room_id
    AND day_of_week = p_day_of_week
    AND is_active = true
    AND (p_exclude_schedule_id IS NULL OR id != p_exclude_schedule_id)
    AND (
      (start_time < p_end_time AND end_time > p_start_time)
    );

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_available_teachers(
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_schedule_id UUID DEFAULT NULL,
  p_subject_id UUID DEFAULT NULL
) RETURNS TABLE (
  teacher_id UUID,
  teacher_name TEXT,
  teacher_email TEXT,
  is_available BOOLEAN,
  conflict_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id as teacher_id,
    p.full_name as teacher_name,
    p.email as teacher_email,
    check_teacher_availability(p.id, p_day_of_week, p_start_time, p_end_time, p_exclude_schedule_id) as is_available,
    (
      SELECT COUNT(*)
      FROM class_schedules cs
      WHERE cs.teacher_id = p.id
        AND cs.day_of_week = p_day_of_week
        AND cs.is_active = true
        AND (p_exclude_schedule_id IS NULL OR cs.id != p_exclude_schedule_id)
        AND (cs.start_time < p_end_time AND cs.end_time > p_start_time)
    ) as conflict_count
  FROM profiles p
  WHERE p.role = 'GURU'
  ORDER BY
    (CASE WHEN check_teacher_availability(p.id, p_day_of_week, p_start_time, p_end_time, p_exclude_schedule_id) THEN 0 ELSE 1 END),
    p.full_name;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_available_rooms(
  p_day_of_week INTEGER,
  p_start_time TIME,
  p_end_time TIME,
  p_exclude_schedule_id UUID DEFAULT NULL,
  p_min_capacity INTEGER DEFAULT NULL
) RETURNS TABLE (
  room_id UUID,
  room_name TEXT,
  room_code TEXT,
  room_type TEXT,
  capacity INTEGER,
  is_available BOOLEAN,
  conflict_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    r.id as room_id,
    r.name as room_name,
    r.code as room_code,
    r.room_type,
    r.capacity,
    check_room_availability(r.id, p_day_of_week, p_start_time, p_end_time, p_exclude_schedule_id) as is_available,
    (
      SELECT COUNT(*)
      FROM class_schedules cs
      WHERE cs.room_id = r.id
        AND cs.day_of_week = p_day_of_week
        AND cs.is_active = true
        AND (p_exclude_schedule_id IS NULL OR cs.id != p_exclude_schedule_id)
        AND (cs.start_time < p_end_time AND cs.end_time > p_start_time)
    ) as conflict_count
  FROM rooms r
  WHERE r.is_active = true
    AND (p_min_capacity IS NULL OR r.capacity >= p_min_capacity)
  ORDER BY
    (CASE WHEN check_room_availability(r.id, p_day_of_week, p_start_time, p_end_time, p_exclude_schedule_id) THEN 0 ELSE 1 END),
    r.name;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 4: Create Triggers
-- =====================================================

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
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' THEN
        UPDATE classes
        SET current_enrollment = current_enrollment + 1
        WHERE id = NEW.class_id;
      ELSIF NEW.status != 'ACTIVE' AND OLD.status = 'ACTIVE' THEN
        UPDATE classes
        SET current_enrollment = GREATEST(current_enrollment - 1, 0)
        WHERE id = NEW.class_id;
      END IF;
    END IF;
    IF OLD.class_id != NEW.class_id THEN
      IF OLD.status = 'ACTIVE' THEN
        UPDATE classes
        SET current_enrollment = GREATEST(current_enrollment - 1, 0)
        WHERE id = OLD.class_id;
      END IF;
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

CREATE OR REPLACE FUNCTION validate_schedule_conflict()
RETURNS TRIGGER AS $$
DECLARE
  has_conflict BOOLEAN;
BEGIN
  has_conflict := check_schedule_conflict(
    NEW.class_id,
    NEW.day_of_week,
    NEW.start_time,
    NEW.end_time,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
  );

  IF has_conflict THEN
    RAISE EXCEPTION 'Jadwal bentrok untuk kelas ini pada hari dan jam tersebut';
  END IF;

  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Waktu selesai harus lebih besar dari waktu mulai';
  END IF;

  IF NEW.day_of_week < 1 OR NEW.day_of_week > 7 THEN
    RAISE EXCEPTION 'Hari harus antara 1 (Senin) sampai 7 (Minggu)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validate_schedule_conflict ON class_schedules;
CREATE TRIGGER trigger_validate_schedule_conflict
  BEFORE INSERT OR UPDATE ON class_schedules
  FOR EACH ROW
  EXECUTE FUNCTION validate_schedule_conflict();

CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_class_timestamp ON classes;
CREATE TRIGGER trigger_update_class_timestamp
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_enrollment_timestamp ON enrollments;
CREATE TRIGGER trigger_update_enrollment_timestamp
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

DROP TRIGGER IF EXISTS trigger_update_schedule_timestamp ON class_schedules;
CREATE TRIGGER trigger_update_schedule_timestamp
  BEFORE UPDATE ON class_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- =====================================================
-- STEP 5: Create Views
-- =====================================================

CREATE OR REPLACE VIEW view_class_roster_stats AS
SELECT
  c.id,
  c.name,
  c.code,
  c.capacity,
  c.current_enrollment,
  calculate_occupancy_rate(c.current_enrollment, c.capacity) as occupancy_rate,
  get_occupancy_badge(calculate_occupancy_rate(c.current_enrollment, c.capacity)) as occupancy_badge,
  cl.name as class_level_name,
  cl.code as class_level_code,
  d.name as department_name,
  d.code as department_code,
  ay.name as academic_year_name,
  r.name as home_room_name,
  r.code as home_room_code,
  p.full_name as wali_kelas_name,
  c.is_active
FROM classes c
LEFT JOIN class_levels cl ON c.class_level_id = cl.id
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
LEFT JOIN rooms r ON c.home_room_id = r.id
LEFT JOIN profiles p ON c.wali_kelas_id = p.id
ORDER BY cl.level_order, d.name, c.name;

CREATE OR REPLACE VIEW view_teacher_workload AS
SELECT
  p.id as teacher_id,
  p.full_name as teacher_name,
  p.email,
  COUNT(DISTINCT cs.class_id) as total_classes,
  COUNT(cs.id) as total_schedules,
  COUNT(DISTINCT cs.subject_id) as total_subjects,
  ROUND(COUNT(cs.id) * 1.5) as estimated_hours_per_week
FROM profiles p
JOIN class_schedules cs ON cs.teacher_id = p.id
JOIN classes c ON cs.class_id = c.id
WHERE p.role = 'GURU'
  AND cs.is_active = true
  AND c.is_active = true
GROUP BY p.id, p.full_name, p.email
ORDER BY total_schedules DESC;

-- =====================================================
-- STEP 6: Grant Permissions
-- =====================================================

GRANT EXECUTE ON FUNCTION calculate_occupancy_rate TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupancy_badge TO authenticated;
GRANT EXECUTE ON FUNCTION get_day_name_indo TO authenticated;
GRANT EXECUTE ON FUNCTION check_schedule_conflict TO authenticated;
GRANT EXECUTE ON FUNCTION check_teacher_availability TO authenticated;
GRANT EXECUTE ON FUNCTION check_room_availability TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_teachers TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_rooms TO authenticated;

GRANT SELECT ON view_class_roster_stats TO authenticated;
GRANT SELECT ON view_teacher_workload TO authenticated;

GRANT SELECT, INSERT ON classes TO authenticated;
GRANT SELECT, INSERT ON enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE ON class_schedules TO authenticated;

-- =====================================================
-- STEP 7: Verification
-- =====================================================

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  trigger_count INTEGER;
  view_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
    AND table_name IN ('classes', 'enrollments', 'class_schedules', 'parent_student_relationships');

  SELECT COUNT(*) INTO function_count
  FROM information_schema.routines
  WHERE routine_schema = 'public'
    AND routine_name IN ('calculate_occupancy_rate', 'get_occupancy_badge', 'check_schedule_conflict',
                         'check_teacher_availability', 'check_room_availability',
                         'get_available_teachers', 'get_available_rooms', 'get_day_name_indo');

  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
    AND trigger_name LIKE 'trigger_%';

  SELECT COUNT(*) INTO view_count
  FROM information_schema.views
  WHERE table_schema = 'public'
    AND table_name LIKE 'view_%';

  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: %', table_count;
  RAISE NOTICE 'Functions created: %', function_count;
  RAISE NOTICE 'Triggers created: %', trigger_count;
  RAISE NOTICE 'Views created: %', view_count;
END $$;
