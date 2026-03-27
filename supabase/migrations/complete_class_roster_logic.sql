-- =====================================================
-- COMPLETE CLASS ROSTER SYSTEM LOGIC
-- Triggers, Views, Functions, and Procedures
-- =====================================================

-- =====================================================
-- 1. HELPER FUNCTIONS
-- =====================================================

-- Function to calculate occupancy rate
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

-- Function to get occupancy badge label
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

-- Function to format Indonesian time range
CREATE OR REPLACE FUNCTION format_time_range_indo(
  p_start_time TIME,
  p_end_time TIME
) RETURNS TEXT AS $$
BEGIN
  RETURN TO_CHAR(p_start_time, 'HH24:MI') || ' - ' || TO_CHAR(p_end_time, 'HH24:MI');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to get day name in Indonesian
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

-- Function to check schedule conflict
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
      -- Overlap condition: (StartA < EndB) and (EndA > StartB)
      (start_time < p_end_time AND end_time > p_start_time)
    );

  RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to check teacher availability
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

  RETURN conflict_count = 0; -- Returns TRUE if available (no conflicts)
END;
$$ LANGUAGE plpgsql;

-- Function to check room availability
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

  RETURN conflict_count = 0; -- Returns TRUE if available (no conflicts)
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. DATABASE TRIGGERS
-- =====================================================

-- Trigger: Auto-update class enrollment count
CREATE OR REPLACE FUNCTION update_class_enrollment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment enrollment count when student is enrolled
    IF NEW.status = 'ACTIVE' THEN
      UPDATE classes
      SET current_enrollment = current_enrollment + 1
      WHERE id = NEW.class_id;
    END IF;
    RETURN NEW;

  ELSIF TG_OP = 'UPDATE' THEN
    -- Handle status changes
    IF OLD.status != NEW.status THEN
      IF NEW.status = 'ACTIVE' AND OLD.status != 'ACTIVE' THEN
        -- Student became active
        UPDATE classes
        SET current_enrollment = current_enrollment + 1
        WHERE id = NEW.class_id;
      ELSIF NEW.status != 'ACTIVE' AND OLD.status = 'ACTIVE' THEN
        -- Student became inactive
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
    -- Decrement enrollment count when enrollment is deleted
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

CREATE TRIGGER trigger_update_class_enrollment
  AFTER INSERT OR UPDATE OR DELETE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_class_enrollment_count();

-- Trigger: Validate schedule before insert/update
CREATE OR REPLACE FUNCTION validate_schedule_conflict()
RETURNS TRIGGER AS $$
DECLARE
  has_conflict BOOLEAN;
BEGIN
  -- Check for class schedule conflicts
  has_conflict := check_schedule_conflict(
    NEW.class_id,
    NEW.day_of_week,
    NEW.start_time,
    NEW.end_time,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.id ELSE NULL END
  );

  IF has_conflict THEN
    RAISE EXCEPTION 'Jadwal bentrok dengan jadwal yang sudah ada untuk kelas ini pada hari dan jam tersebut';
  END IF;

  -- Additional validation: End time must be after start time
  IF NEW.end_time <= NEW.start_time THEN
    RAISE EXCEPTION 'Waktu selesai harus lebih besar dari waktu mulai';
  END IF;

  -- Validate day_of_week is between 1-7
  IF NEW.day_of_week < 1 OR NEW.day_of_week > 7 THEN
    RAISE EXCEPTION 'Hari harus antara 1 (Senin) sampai 7 (Minggu)';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validate_schedule_conflict
  BEFORE INSERT OR UPDATE ON class_schedules
  FOR EACH ROW
  EXECUTE FUNCTION validate_schedule_conflict();

-- Trigger: Update class updated_at timestamp
CREATE OR REPLACE FUNCTION update_class_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_class_timestamp
  BEFORE UPDATE ON classes
  FOR EACH ROW
  EXECUTE FUNCTION update_class_timestamp();

-- Trigger: Update enrollment updated_at timestamp
CREATE OR REPLACE FUNCTION update_enrollment_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_enrollment_timestamp
  BEFORE UPDATE ON enrollments
  FOR EACH ROW
  EXECUTE FUNCTION update_enrollment_timestamp();

-- Trigger: Update schedule updated_at timestamp
CREATE OR REPLACE FUNCTION update_schedule_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_schedule_timestamp
  BEFORE UPDATE ON class_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_timestamp();

-- =====================================================
-- 3. VIEWS FOR EASY DATA ACCESS
-- =====================================================

-- View: Class roster with enrollment statistics
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
  c.is_active,
  c.created_at
FROM classes c
LEFT JOIN class_levels cl ON c.class_level_id = cl.id
LEFT JOIN departments d ON c.department_id = d.id
LEFT JOIN academic_years ay ON c.academic_year_id = ay.id
LEFT JOIN rooms r ON c.home_room_id = r.id
LEFT JOIN profiles p ON c.wali_kelas_id = p.id
ORDER BY cl.level_order, d.name, c.name;

-- View: Class schedule with full details
CREATE OR REPLACE VIEW view_class_schedule_details AS
SELECT
  cs.id,
  cs.class_id,
  c.name as class_name,
  c.code as class_code,
  cs.subject_id,
  s.name as subject_name,
  s.code as subject_code,
  cs.teacher_id,
  p.full_name as teacher_name,
  cs.room_id,
  r.name as room_name,
  r.code as room_code,
  cs.day_of_week,
  get_day_name_indo(cs.day_of_week) as day_name,
  cs.start_time,
  cs.end_time,
  format_time_range_indo(cs.start_time, cs.end_time) as time_range,
  cs.academic_year_id,
  ay.name as academic_year_name,
  cs.semester,
  cs.is_active,
  cs.notes,
  cs.created_at
FROM class_schedules cs
JOIN classes c ON cs.class_id = c.id
JOIN subjects s ON cs.subject_id = s.id
JOIN profiles p ON cs.teacher_id = p.id
LEFT JOIN rooms r ON cs.room_id = r.id
LEFT JOIN academic_years ay ON cs.academic_year_id = ay.id
ORDER BY
  cs.day_of_week,
  cs.start_time,
  c.name;

-- View: Student enrollment details
CREATE OR REPLACE VIEW view_student_enrollments AS
SELECT
  e.id as enrollment_id,
  e.class_id,
  c.name as class_name,
  c.code as class_code,
  e.student_id,
  p.full_name as student_name,
  p.email as student_email,
  p.nisn,
  e.academic_year_id,
  ay.name as academic_year_name,
  e.enrollment_date,
  e.status,
  e.notes,
  cl.name as class_level,
  d.name as department
FROM enrollments e
JOIN classes c ON e.class_id = c.id
JOIN profiles p ON e.student_id = p.id
LEFT JOIN academic_years ay ON e.academic_year_id = ay.id
LEFT JOIN class_levels cl ON c.class_level_id = cl.id
LEFT JOIN departments d ON c.department_id = d.id
ORDER BY
  ay.name DESC,
  cl.level_order,
  c.name,
  p.full_name;

-- View: Teacher workload summary
CREATE OR REPLACE VIEW view_teacher_workload AS
SELECT
  p.id as teacher_id,
  p.full_name as teacher_name,
  p.email,
  COUNT(DISTINCT cs.class_id) as total_classes,
  COUNT(cs.id) as total_schedules,
  COUNT(DISTINCT cs.subject_id) as total_subjects,
  -- Calculate hours per week (assuming each schedule is ~1.5 hours on average)
  ROUND(COUNT(cs.id) * 1.5) as estimated_hours_per_week
FROM profiles p
JOIN class_schedules cs ON cs.teacher_id = p.id
JOIN classes c ON cs.class_id = c.id
WHERE p.role = 'GURU'
  AND p.is_active = true
  AND cs.is_active = true
  AND c.is_active = true
GROUP BY p.id, p.full_name, p.email
ORDER BY total_schedules DESC;

-- View: Room utilization summary
CREATE OR REPLACE VIEW view_room_utilization AS
SELECT
  r.id as room_id,
  r.name,
  r.code,
  r.room_type,
  r.capacity,
  COUNT(DISTINCT cs.class_id) as total_classes_using,
  COUNT(cs.id) as total_schedules,
  -- Calculate utilization percentage
  CASE
    WHEN COUNT(cs.id) > 0 THEN 'High'
    WHEN COUNT(cs.id) = 0 THEN 'None'
    ELSE 'Low'
  END as utilization_level
FROM rooms r
LEFT JOIN class_schedules cs ON cs.room_id = r.id AND cs.is_active = true
WHERE r.is_active = true
GROUP BY r.id, r.name, r.code, r.room_type, r.capacity
ORDER BY total_schedules DESC;

-- =====================================================
-- 4. STORED PROCEDURES FOR COMPLEX OPERATIONS
-- =====================================================

-- Procedure: Enroll multiple students to a class
CREATE OR REPLACE PROCEDURE bulk_enroll_students(
  p_class_id UUID,
  p_student_ids UUID[],
  p_academic_year_id UUID,
  p_enrollment_date DATE DEFAULT CURRENT_DATE
) AS $$
DECLARE
  v_student_id UUID;
  v_enrolled_count INTEGER := 0;
  v_skipped_count INTEGER := 0;
  v_class_capacity INTEGER;
  v_current_enrollment INTEGER;
BEGIN
  -- Get class capacity and current enrollment
  SELECT capacity, current_enrollment
  INTO v_class_capacity, v_current_enrollment
  FROM classes
  WHERE id = p_class_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Kelas tidak ditemukan';
  END IF;

  -- Check capacity
  IF (v_current_enrollment + ARRAY_LENGTH(p_student_ids, 1)) > v_class_capacity THEN
    RAISE EXCEPTION 'Kapasitas kelas tidak mencukupi. Kapasitas: %, Terisi: %, Akan ditambah: %',
      v_class_capacity, v_current_enrollment, ARRAY_LENGTH(p_student_ids, 1);
  END IF;

  -- Enroll each student
  FOREACH v_student_id IN ARRAY p_student_ids LOOP
    BEGIN
      -- Check if student exists
      IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = v_student_id AND role = 'SISWA' AND is_active = true) THEN
        RAISE NOTICE 'Siswa % tidak ditemukan atau tidak aktif, dilewati', v_student_id;
        v_skipped_count := v_skipped_count + 1;
        CONTINUE;
      END IF;

      -- Check if already enrolled
      IF EXISTS (
        SELECT 1 FROM enrollments
        WHERE class_id = p_class_id
          AND student_id = v_student_id
          AND academic_year_id = p_academic_year_id
      ) THEN
        RAISE NOTICE 'Siswa % sudah terdaftar di kelas ini, dilewati', v_student_id;
        v_skipped_count := v_skipped_count + 1;
        CONTINUE;
      END IF;

      -- Insert enrollment
      INSERT INTO enrollments (
        class_id,
        student_id,
        academic_year_id,
        enrollment_date,
        status
      ) VALUES (
        p_class_id,
        v_student_id,
        p_academic_year_id,
        p_enrollment_date,
        'ACTIVE'
      );

      v_enrolled_count := v_enrolled_count + 1;

    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Gagal mendaftarkan siswa %: %', v_student_id, SQLERRM;
      v_skipped_count := v_skipped_count + 1;
    END;
  END LOOP;

  RAISE NOTICE 'Berhasil mendaftarkan % siswa, % dilewati', v_enrolled_count, v_skipped_count;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Withdraw student from class
CREATE OR REPLACE PROCEDURE withdraw_student(
  p_enrollment_id UUID,
  p_withdrawal_date DATE DEFAULT CURRENT_DATE,
  p_notes TEXT DEFAULT NULL
) AS $$
DECLARE
  v_class_id UUID;
  v_student_id UUID;
  v_old_status TEXT;
BEGIN
  -- Get enrollment info
  SELECT class_id, student_id, status
  INTO v_class_id, v_student_id, v_old_status
  FROM enrollments
  WHERE id = p_enrollment_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Enrollment tidak ditemukan';
  END IF;

  -- Update enrollment status
  UPDATE enrollments
  SET status = 'WITHDRAWN',
      notes = COALESCE(p_notes, notes),
      updated_at = NOW()
  WHERE id = p_enrollment_id;

  RAISE NOTICE 'Siswa % berhasil dikeluarkan dari kelas', v_student_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Copy schedules to new semester
CREATE OR REPLACE PROCEDURE copy_schedules_to_semester(
  p_source_academic_year_id UUID,
  p_source_semester INTEGER,
  p_target_academic_year_id UUID,
  p_target_semester INTEGER,
  p_copy_teacher_assignments BOOLEAN DEFAULT true
) AS $$
DECLARE
  v_copied_count INTEGER := 0;
BEGIN
  -- Insert new schedules based on existing ones
  INSERT INTO class_schedules (
    class_id,
    subject_id,
    teacher_id,
    room_id,
    day_of_week,
    start_time,
    end_time,
    academic_year_id,
    semester,
    is_active,
    notes,
    created_by
  )
  SELECT
    cs.class_id,
    cs.subject_id,
    CASE WHEN p_copy_teacher_assignments THEN cs.teacher_id ELSE NULL END,
    cs.room_id,
    cs.day_of_week,
    cs.start_time,
    cs.end_time,
    p_target_academic_year_id,
    p_target_semester,
    true,
    cs.notes,
    NULL
  FROM class_schedules cs
  WHERE cs.academic_year_id = p_source_academic_year_id
    AND cs.semester = p_source_semester
    AND cs.is_active = true
  ON CONFLICT DO NOTHING;

  GET DIAGNOSTICS v_copied_count = ROW_COUNT;

  RAISE NOTICE 'Berhasil menyalin % jadwal ke semester baru', v_copied_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Get available teachers for a time slot
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
    AND p.is_active = true
    AND (p_subject_id IS NULL OR EXISTS (
      SELECT 1 FROM class_schedules cs
      WHERE cs.teacher_id = p.id
        AND cs.subject_id = p_subject_id
      LIMIT 1
    ))
  ORDER BY
    (CASE WHEN check_teacher_availability(p.id, p_day_of_week, p_start_time, p_end_time, p_exclude_schedule_id) THEN 0 ELSE 1 END),
    p.full_name;
END;
$$ LANGUAGE plpgsql;

-- Function: Get available rooms for a time slot
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
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_enrollments_class_student ON enrollments(class_id, student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student_academic_year ON enrollments(student_id, academic_year_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON enrollments(status) WHERE status = 'ACTIVE';
CREATE INDEX IF NOT EXISTS idx_class_schedules_class_day ON class_schedules(class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_class_schedules_teacher_day ON class_schedules(teacher_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_class_schedules_room_day ON class_schedules(room_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_class_schedules_time_range ON class_schedules(day_of_week, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_class_schedules_active ON class_schedules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_classes_level_department ON classes(class_level_id, department_id);
CREATE INDEX IF NOT EXISTS idx_classes_academic_year ON classes(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_active ON profiles(role, is_active) WHERE is_active = true;

-- =====================================================
-- 6. GRANT PERMISSIONS (if needed)
-- =====================================================

-- Grant usage on functions
GRANT EXECUTE ON FUNCTION calculate_occupancy_rate TO authenticated;
GRANT EXECUTE ON FUNCTION get_occupancy_badge TO authenticated;
GRANT EXECUTE ON FUNCTION format_time_range_indo TO authenticated;
GRANT EXECUTE ON FUNCTION get_day_name_indo TO authenticated;
GRANT EXECUTE ON FUNCTION check_schedule_conflict TO authenticated;
GRANT EXECUTE ON FUNCTION check_teacher_availability TO authenticated;
GRANT EXECUTE ON FUNCTION check_room_availability TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_teachers TO authenticated;
GRANT EXECUTE ON FUNCTION get_available_rooms TO authenticated;

-- Grant select on views
GRANT SELECT ON view_class_roster_stats TO authenticated;
GRANT SELECT ON view_class_schedule_details TO authenticated;
GRANT SELECT ON view_student_enrollments TO authenticated;
GRANT SELECT ON view_teacher_workload TO authenticated;
GRANT SELECT ON view_room_utilization TO authenticated;

-- Grant execute on procedures
GRANT EXECUTE ON PROCEDURE bulk_enroll_students TO authenticated;
GRANT EXECUTE ON PROCEDURE withdraw_student TO authenticated;
GRANT EXECUTE ON PROCEDURE copy_schedules_to_semester TO authenticated;

-- =====================================================
-- 7. DATA INTEGRITY CHECKS (Optional, for monitoring)
-- =====================================================

-- Function to check for data inconsistencies
CREATE OR REPLACE FUNCTION check_data_integrity()
RETURNS TABLE (
  check_type TEXT,
  issue_count BIGINT,
  description TEXT
) AS $$
BEGIN
  -- Check 1: Classes with negative enrollment
  RETURN QUERY
  SELECT
    'negative_enrollment'::TEXT as check_type,
    COUNT(*)::BIGINT as issue_count,
    'Kelas dengan jumlah siswa negatif'::TEXT as description
  FROM classes
  WHERE current_enrollment < 0;

  -- Check 2: Classes with enrollment exceeding capacity
  RETURN QUERY
  SELECT
    'over_capacity'::TEXT as check_type,
    COUNT(*)::BIGINT as issue_count,
    'Kelas dengan jumlah siswa melebihi kapasitas'::TEXT as description
  FROM classes
  WHERE current_enrollment > capacity;

  -- Check 3: Schedules with end time before start time
  RETURN QUERY
  SELECT
    'invalid_time_range'::TEXT as check_type,
    COUNT(*)::BIGINT as issue_count,
    'Jadwal dengan waktu selesai sebelum waktu mulai'::TEXT as description
  FROM class_schedules
  WHERE end_time <= start_time;

  -- Check 4: Active enrollments for inactive classes
  RETURN QUERY
  SELECT
    'enrollment_in_inactive_class'::TEXT as check_type,
    COUNT(*)::BIGINT as issue_count,
    'Enrollment aktif pada kelas tidak aktif'::TEXT as description
  FROM enrollments e
  JOIN classes c ON e.class_id = c.id
  WHERE e.status = 'ACTIVE' AND c.is_active = false;

  -- Check 5: Orphaned enrollments (student deleted)
  RETURN QUERY
  SELECT
    'orphaned_enrollments'::TEXT as check_type,
    COUNT(*)::BIGINT as issue_count,
    'Enrollment tanpa siswa yang valid'::TEXT as description
  FROM enrollments e
  LEFT JOIN profiles p ON e.student_id = p.id
  WHERE e.student_id IS NOT NULL AND p.id IS NULL;

END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. EXAMPLE USAGE QUERIES
-- =====================================================

-- To check data integrity:
-- SELECT * FROM check_data_integrity();

-- To get available teachers for a time slot:
-- SELECT * FROM get_available_teachers(1, '07:00:00'::TIME, '08:30:00'::TIME);

-- To get available rooms for a time slot:
-- SELECT * FROM get_available_rooms(1, '07:00:00'::TIME, '08:30:00'::TIME);

-- To bulk enroll students:
-- CALL bulk_enroll_students('class-uuid', ARRAY['student1-uuid', 'student2-uuid'], 'ay-uuid');

-- To copy schedules to new semester:
-- CALL copy_schedules_to_semester('ay-2024-2025', 1, 'ay-2024-2025', 2, true);

-- To get class roster stats:
-- SELECT * FROM view_class_roster_stats WHERE is_active = true ORDER BY class_level_name, class_name;

-- To get teacher workload:
-- SELECT * FROM view_teacher_workload ORDER BY estimated_hours_per_week DESC;

-- To get room utilization:
-- SELECT * FROM view_room_utilization ORDER BY total_schedules DESC;

COMMIT;
