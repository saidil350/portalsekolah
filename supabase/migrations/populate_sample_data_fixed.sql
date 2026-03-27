-- =====================================================
-- SAMPLE DATA: INDONESIAN SCHOOL CLASS ROSTER SYSTEM
-- =====================================================
-- Simplified version with proper PostgreSQL syntax
-- =====================================================

-- Insert Class Levels
DO $$
BEGIN
  INSERT INTO class_levels (name, code, level_order, is_active) VALUES
    ('Kelas X', 'X', 1, true),
    ('Kelas XI', 'XI', 2, true),
    ('Kelas XII', 'XII', 3, true)
  ON CONFLICT (code) DO NOTHING;

  -- Insert Departments
  INSERT INTO departments (name, code, description, is_active) VALUES
    ('Matematika & Ilmu Alam', 'MIPA', 'Jurusan Sains', true),
    ('Ilmu Pengetahuan Sosial', 'IPS', 'Jurusan Sosial', true),
    ('Bahasa & Budaya', 'BHS', 'Jurusan Bahasa', true)
  ON CONFLICT (code) DO NOTHING;

  -- Get or create academic year
  INSERT INTO academic_years (name, start_date, end_date, is_active)
  VALUES ('2024/2025', '2024-07-15', '2025-06-30', true)
  ON CONFLICT DO NOTHING;
END $$;

-- Insert Rooms
DO $$
BEGIN
  INSERT INTO rooms (name, code, room_type, capacity, floor, building, is_active) VALUES
    ('Ruang Kelas X-A', 'RK-X-A', 'CLASSROOM', 35, 1, 'Gedung A', true),
    ('Ruang Kelas X-B', 'RK-X-B', 'CLASSROOM', 35, 1, 'Gedung A', true),
    ('Ruang Kelas XI-A', 'RK-XI-A', 'CLASSROOM', 35, 2, 'Gedung A', true),
    ('Ruang Kelas XII-A', 'RK-XII-A', 'CLASSROOM', 35, 3, 'Gedung A', true),
    ('Lab Fisika', 'LAB-FIS', 'LABORATORY', 40, 1, 'Gedung B', true),
    ('Lab Kimia', 'LAB-KIM', 'LABORATORY', 40, 1, 'Gedung B', true),
    ('Lab Biologi', 'LAB-BIO', 'LABORATORY', 40, 2, 'Gedung B', true),
    ('Lab Komputer', 'LAB-KOM', 'LABORATORY', 40, 2, 'Gedung B', true),
    ('Lapangan Olahraga', 'LAPANGAN', 'SPORTS_FIELD', 500, 1, 'Gedung D', true)
  ON CONFLICT (code) DO NOTHING;
END $$;

-- Insert 15 Classes
DO $$
DECLARE
  level_x_id UUID;
  level_xi_id UUID;
  level_xii_id UUID;
  mipa_id UUID;
  ips_id UUID;
  bhs_id UUID;
  ay_id UUID;
  room_id UUID;
  class_id UUID;
BEGIN
  SELECT id INTO level_x_id FROM class_levels WHERE code = 'X';
  SELECT id INTO level_xi_id FROM class_levels WHERE code = 'XI';
  SELECT id INTO level_xii_id FROM class_levels WHERE code = 'XII';
  SELECT id INTO mipa_id FROM departments WHERE code = 'MIPA';
  SELECT id INTO ips_id FROM departments WHERE code = 'IPS';
  SELECT id INTO bhs_id FROM departments WHERE code = 'BHS';
  SELECT id INTO ay_id FROM academic_years WHERE is_active = true;
  SELECT id INTO room_id FROM rooms WHERE code = 'RK-X-A' LIMIT 1;

  -- Create 15 classes
  FOR i IN 1..15 LOOP
    DECLARE
      class_name TEXT;
      class_code TEXT;
      dept_id UUID;
      level_id UUID;
    BEGIN
      -- Generate class name and code
      IF i <= 5 THEN
        level_id := level_x_id;
        class_name := 'X-' || CASE i WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'MIPA-1' WHEN 4 THEN 'MIPA-2' ELSE 'IPS-1' END;
        class_code := 'CLS-X-' || CASE i WHEN 1 THEN 'A' WHEN 2 THEN 'B' WHEN 3 THEN 'MIPA-1' WHEN 4 THEN 'MIPA-2' ELSE 'IPS-1' END;
        dept_id := CASE WHEN i IN (3, 4) THEN mipa_id WHEN i = 5 THEN ips_id ELSE NULL END;
      ELSIF i <= 10 THEN
        level_id := level_xi_id;
        class_name := 'XI-' || CASE i WHEN 6 THEN 'MIPA-1' WHEN 7 THEN 'MIPA-2' WHEN 8 THEN 'IPS-1' WHEN 9 THEN 'IPS-2' ELSE 'BHS-1' END;
        class_code := 'CLS-XI-' || CASE i WHEN 6 THEN 'MIPA-1' WHEN 7 THEN 'MIPA-2' WHEN 8 THEN 'IPS-1' WHEN 9 THEN 'IPS-2' ELSE 'BHS-1' END;
        dept_id := CASE WHEN i IN (6, 7) THEN mipa_id WHEN i IN (8, 9) THEN ips_id ELSE bhs_id END;
      ELSE
        level_id := level_xii_id;
        class_name := 'XII-' || CASE i WHEN 11 THEN 'MIPA-1' WHEN 12 THEN 'MIPA-2' WHEN 13 THEN 'IPS-1' WHEN 14 THEN 'IPS-2' ELSE 'BHS-1' END;
        class_code := 'CLS-XII-' || CASE i WHEN 11 THEN 'MIPA-1' WHEN 12 THEN 'MIPA-2' WHEN 13 THEN 'IPS-1' WHEN 14 THEN 'IPS-2' ELSE 'BHS-1' END;
        dept_id := CASE WHEN i IN (11, 12) THEN mipa_id WHEN i IN (13, 14) THEN ips_id ELSE bhs_id END;
      END IF;

      -- Insert class
      INSERT INTO classes (name, code, class_level_id, department_id, capacity, current_enrollment, home_room_id, academic_year_id, is_active)
      VALUES (class_name, class_code, level_id, dept_id, 35, 28 + (i % 5), room_id, ay_id, true)
      ON CONFLICT (code) DO NOTHING;
    END;
  END LOOP;
END $$;

-- Insert sample students (30 students per class = 450 students)
DO $$
DECLARE
  student_names TEXT[] := ARRAY[
    'Ahmad Rizky Pratama', 'Siti Nurhaliza Putri', 'Muhammad Fahri Pratama', 'Aisyah Putri Azzahra',
    'Budi Santoso', 'Dewi Sartika', 'Rizky Hidayat', 'Nurul Izzah', 'Agus Setiawan', 'Rina Wati',
    'Dedi Kurniawan', 'Sri Rahayu', 'Indra Lesmana', 'Maya Sari', 'Doni Prasetyo', 'Lestari Ayu',
    'Fajar Nugraha', 'Putri Ayu', 'Rendi Saputra', 'Kartika Sari', 'Bayu Pratama', 'Wulan Sari',
    'Eko Prasetyo', 'Dian Pelangi', 'Feri Irawan', 'Siska Amelia', 'Hendra Gunawan', 'Melati Putri',
    'Irfan Mahmud', 'Ratna Sari'
  ];

  class_rec RECORD;
  ay_id UUID;
  teacher_id UUID;
BEGIN
  SELECT id INTO ay_id FROM academic_years WHERE is_active = true LIMIT 1;

  -- For each class, insert 30 students
  FOR class_rec IN SELECT id, name FROM classes ORDER BY name LOOP
    FOR i IN 1..30 LOOP
      DECLARE
        student_name TEXT;
        nisn TEXT;
        student_id UUID;
      BEGIN
        student_name := student_names[i] || ' - ' || class_rec.name;
        nisn := '005' || LPAD(ROUND((RANDOM() * 999999))::TEXT, 6, '0');

        -- Insert student
        INSERT INTO profiles (full_name, email, role, nisn, is_active)
        VALUES (
          student_name,
          'siswa' || ROUND(RANDOM() * 9999) || '@sekolah.id',
          'SISWA',
          nisn,
          true
        )
        ON CONFLICT DO NOTHING
        RETURNING id INTO student_id;

        -- Enroll in class
        INSERT INTO enrollments (class_id, student_id, academic_year_id, status, enrollment_date)
        VALUES (class_rec.id, student_id, ay_id, 'ACTIVE', CURRENT_DATE)
        ON CONFLICT DO NOTHING;
      END;
    END LOOP;
  END LOOP;
END $$;

-- Insert sample schedules
DO $$
DECLARE
  class_rec RECORD;
  day_of_week INTEGER;
  period_num INTEGER;
  ay_id UUID;
  subject_id UUID;
  teacher_id UUID;
  room_id UUID;
BEGIN
  SELECT id INTO ay_id FROM academic_years WHERE is_active = true LIMIT 1;

  -- For each class
  FOR class_rec IN SELECT id, name, code FROM classes WHERE is_active = true ORDER BY name LOOP
    -- For each day (1-5, Monday to Friday)
    FOR day_of_week IN 1..5 LOOP
      -- For each period (5 periods per day)
      FOR period_num IN 1..5 LOOP
        -- Get random subject, teacher, room
        SELECT id INTO subject_id FROM subjects WHERE is_active = true ORDER BY RANDOM() LIMIT 1;
        SELECT id INTO teacher_id FROM profiles WHERE role = 'GURU' AND is_active = true ORDER BY RANDOM() LIMIT 1;
        SELECT id INTO room_id FROM rooms WHERE is_active = true ORDER BY RANDOM() LIMIT 1;

        -- Calculate time
        DECLARE
          start_time TEXT;
          end_time TEXT;
        BEGIN
          CASE period_num
            WHEN 1 THEN start_time := '07:00:00';
            WHEN 2 THEN start_time := '08:30:00';
            WHEN 3 THEN start_time := '10:15:00';
            WHEN 4 THEN start_time := '12:00:00';
            ELSE start_time := '13:30:00';
          END CASE;

          CASE period_num
            WHEN 1 THEN end_time := '08:30:00';
            WHEN 2 THEN end_time := '10:00:00';
            WHEN 3 THEN end_time := '11:45:00';
            WHEN 4 THEN end_time := '13:30:00';
            ELSE end_time := '15:00:00';
          END CASE;
        END;

        -- Insert schedule
        IF subject_id IS NOT NULL AND teacher_id IS NOT NULL AND room_id IS NOT NULL THEN
          INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time, academic_year_id, semester, is_active)
          VALUES (class_rec.id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time, ay_id, 1, true)
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;
END $$;

-- Assign wali kelas to classes
DO $$
BEGIN
  UPDATE classes
  SET wali_kelas_id = (
    SELECT id FROM profiles WHERE role = 'GURU' AND is_active = true ORDER BY RANDOM() LIMIT 1
  )
  WHERE wali_kelas_id IS NULL;
END $$;

-- Verification queries (uncomment to test):
-- SELECT 'Classes: ' || COUNT(*) FROM classes;
-- SELECT 'Students: ' || COUNT(*) FROM profiles WHERE role = 'SISWA';
-- SELECT 'Enrollments: ' || COUNT(*) FROM enrollments;
-- SELECT 'Schedules: ' || COUNT(*) FROM class_schedules;
-- SELECT c.name || ': ' || COUNT(e.id) || ' students' FROM classes c LEFT JOIN enrollments e ON c.id = e.class_id GROUP BY c.id ORDER BY c.name;
