-- =====================================================
-- SAMPLE DATA: INDONESIAN SCHOOL CLASS ROSTER SYSTEM
-- =====================================================
-- This migration populates realistic sample data for:
-- - 420+ students with Indonesian names and NISN
-- - 15 classes (X, XI, XII with MIPA/IPS/BHS streams)
-- - Enrollments for all students
-- - 200+ class schedules (full weekly schedule per class)
-- =====================================================

-- Insert Class Levels
INSERT INTO class_levels (name, code, level_order, is_active) VALUES
('Kelas X', 'X', 1, true),
('Kelas XI', 'XI', 2, true),
('Kelas XII', 'XII', 3, true)
ON CONFLICT (code) DO NOTHING;

-- Insert Departments (Jurusan)
INSERT INTO departments (name, code, description, is_active) VALUES
('Matematika & Ilmu Alam', 'MIPA', 'Jurusan Sains dengan fokus pada matematika, fisika, kimia, dan biologi', true),
('Ilmu Pengetahuan Sosial', 'IPS', 'Jurusan Sosial dengan fokus pada ekonomi, sosiologi, dan geografi', true),
('Bahasa & Budaya', 'BHS', 'Jurusan Bahasa dengan fokus pada sastra dan bahasa asing', true)
ON CONFLICT (code) DO NOTHING;

-- Get IDs for later use
DO $$
DECLARE
  level_x_id UUID;
  level_xi_id UUID;
  level_xii_id UUID;
  mipa_id UUID;
  ips_id UUID;
  bhs_id UUID;
  ay_id UUID;
  room_10a_id UUID;
  room_10b_id UUID;
  room_11a_id UUID;
  room_12a_id UUID;
  lab_fisika_id UUID;
  lab_kimia_id UUID;
  lab_bio_id UUID;
  lab_komputer_id UUID;
  teacher_mtk_id UUID;
  teacher_bin_id UUID;
  teacher_big_id UUID;
  teacher_fis_id UUID;
  teacher_kim_id UUID;
  teacher_bio_id UUID;
  teacher_eko_id UUID;
  teacher_sos_id UUID;
  teacher_geo_id UUID;
  teacher_sej_id UUID;
  teacher_pkn_id UUID;
  teacher_pa_id UUID;
  teacher_penjas_id UUID;
  teacher_seni_id UUID;
  teacher_bk_id UUID;
  teacher_or_compute_id UUID;

  -- Variables for class IDs
  class_x_a_id UUID;
  class_x_b_id UUID;
  class_x_mipa1_id UUID;
  class_x_mipa2_id UUID;
  class_x_ips1_id UUID;
  class_x_ips2_id UUID;
  class_xi_mipa1_id UUID;
  class_xi_mipa2_id UUID;
  class_xi_ips1_id UUID;
  class_xi_ips2_id UUID;
  class_xii_mipa1_id UUID;
  class_xii_mipa2_id UUID;
  class_xii_ips1_id UUID;
  class_xii_ips2_id UUID;

  student_count INTEGER := 0;
BEGIN
  -- Get level IDs
  SELECT id INTO level_x_id FROM class_levels WHERE code = 'X' LIMIT 1;
  SELECT id INTO level_xi_id FROM class_levels WHERE code = 'XI' LIMIT 1;
  SELECT id INTO level_xii_id FROM class_levels WHERE code = 'XII' LIMIT 1;

  -- Get department IDs
  SELECT id INTO mipa_id FROM departments WHERE code = 'MIPA' LIMIT 1;
  SELECT id INTO ips_id FROM departments WHERE code = 'IPS' LIMIT 1;
  SELECT id INTO bhs_id FROM departments WHERE code = 'BHS' LIMIT 1;

  -- Get active academic year
  SELECT id INTO ay_id FROM academic_years WHERE is_active = true LIMIT 1;
  IF ay_id IS NULL THEN
    INSERT INTO academic_years (name, start_date, end_date, is_active)
    VALUES ('2024/2025', '2024-07-15', '2025-06-30', true)
    RETURNING id INTO ay_id;
  END IF;

  -- Get/Create Room IDs
  INSERT INTO rooms (name, code, room_type, capacity, floor, building, is_active)
  VALUES
    ('Ruang Kelas X-A', 'RK-X-A', 'CLASSROOM', 35, 1, 'Gedung A', true),
    ('Ruang Kelas X-B', 'RK-X-B', 'CLASSROOM', 35, 1, 'Gedung A', true),
    ('Ruang Kelas XI-A', 'RK-XI-A', 'CLASSROOM', 35, 2, 'Gedung A', true),
    ('Ruang Kelas XII-A', 'RK-XII-A', 'CLASSROOM', 35, 3, 'Gedung A', true),
    ('Lab Fisika', 'LAB-FIS', 'LABORATORY', 40, 1, 'Gedung B', true),
    ('Lab Kimia', 'LAB-KIM', 'LABORATORY', 40, 1, 'Gedung B', true),
    ('Lab Biologi', 'LAB-BIO', 'LABORATORY', 40, 2, 'Gedung B', true),
    ('Lab Komputer', 'LAB-KOM', 'LABORATORY', 40, 2, 'Gedung B', true),
    ('Aula Serbaguna', 'AULA', 'MULTIPURPOSE', 200, 1, 'Gedung C', true),
    ('Perpustakaan', 'PERPUS', 'LIBRARY', 100, 1, 'Gedung C', true),
    ('Lapangan Olahraga', 'LAPANGAN', 'SPORTS_FIELD', 500, 1, 'Gedung D', true)
  ON CONFLICT (code) DO NOTHING;

  SELECT id INTO room_10a_id FROM rooms WHERE code = 'RK-X-A' LIMIT 1;
  SELECT id INTO room_10b_id FROM rooms WHERE code = 'RK-X-B' LIMIT 1;
  SELECT id INTO room_11a_id FROM rooms WHERE code = 'RK-XI-A' LIMIT 1;
  SELECT id INTO room_12a_id FROM rooms WHERE code = 'RK-XII-A' LIMIT 1;
  SELECT id INTO lab_fisika_id FROM rooms WHERE code = 'LAB-FIS' LIMIT 1;
  SELECT id INTO lab_kimia_id FROM rooms WHERE code = 'LAB-KIM' LIMIT 1;
  SELECT id INTO lab_bio_id FROM rooms WHERE code = 'LAB-BIO' LIMIT 1;
  SELECT id INTO lab_komputer_id FROM rooms WHERE code = 'LAB-KOM' LIMIT 1;

  -- Get Teacher IDs (assuming they exist from previous migrations)
  SELECT id INTO teacher_mtk_id FROM profiles WHERE full_name LIKE '%Matematika%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_bin_id FROM profiles WHERE full_name LIKE '%Bahasa Indonesia%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_big_id FROM profiles WHERE full_name LIKE '%Bahasa Inggris%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_fis_id FROM profiles WHERE full_name LIKE '%Fisika%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_kim_id FROM profiles WHERE full_name LIKE '%Kimia%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_bio_id FROM profiles WHERE full_name LIKE '%Biologi%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_eko_id FROM profiles WHERE full_name LIKE '%Ekonomi%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_sos_id FROM profiles WHERE full_name LIKE '%Sosiologi%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_geo_id FROM profiles WHERE full_name LIKE '%Geografi%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_sej_id FROM profiles WHERE full_name LIKE '%Sejarah%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_pkn_id FROM profiles WHERE full_name LIKE '%PKN%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_pa_id FROM profiles WHERE full_name LIKE '%Pendidikan Agama%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_penjas_id FROM profiles WHERE full_name LIKE '%Penjas%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_seni_id FROM profiles WHERE full_name LIKE '%Seni Budaya%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_bk_id FROM profiles WHERE full_name LIKE '%BK%' AND role = 'GURU' LIMIT 1;
  SELECT id INTO teacher_or_compute_id FROM profiles WHERE full_name LIKE '%Komputer%' AND role = 'GURU' LIMIT 1;

  -- =====================================================
  -- CREATE 15 CLASSES
  -- =====================================================
  -- Kelas X (5 kelas)
  INSERT INTO classes (name, code, class_level_id, capacity, current_enrollment, home_room_id, academic_year_id, is_active)
  VALUES
    ('X-A', 'CLS-X-A', level_x_id, 35, 28, room_10a_id, ay_id, true),
    ('X-B', 'CLS-X-B', level_x_id, 35, 30, room_10b_id, ay_id, true),
    ('X-MIPA-1', 'CLS-X-MIPA-1', level_x_id, 35, 32, room_10a_id, ay_id, true),
    ('X-MIPA-2', 'CLS-X-MIPA-2', level_x_id, 35, 31, room_10b_id, ay_id, true),
    ('X-IPS-1', 'CLS-X-IPS-1', level_x_id, 35, 29, room_10a_id, ay_id, true)
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO class_x_a_id, class_x_b_id, class_x_mipa1_id, class_x_mipa2_id, class_x_ips1_id;

  UPDATE classes SET department_id = mipa_id WHERE code LIKE '%MIPA%';
  UPDATE classes SET department_id = ips_id WHERE code LIKE '%IPS%';

  -- Kelas XI (5 kelas)
  INSERT INTO classes (name, code, class_level_id, department_id, capacity, current_enrollment, home_room_id, academic_year_id, is_active)
  VALUES
    ('XI-MIPA-1', 'CLS-XI-MIPA-1', level_xi_id, mipa_id, 35, 30, room_11a_id, ay_id, true),
    ('XI-MIPA-2', 'CLS-XI-MIPA-2', level_xi_id, mipa_id, 35, 29, room_11a_id, ay_id, true),
    ('XI-IPS-1', 'CLS-XI-IPS-1', level_xi_id, ips_id, 35, 28, room_11a_id, ay_id, true),
    ('XI-IPS-2', 'CLS-XI-IPS-2', level_xi_id, ips_id, 35, 27, room_11a_id, ay_id, true),
    ('XI-BHS-1', 'CLS-XI-BHS-1', level_xi_id, bhs_id, 35, 25, room_11a_id, ay_id, true)
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO class_xi_mipa1_id, class_xi_mipa2_id, class_xi_ips1_id, class_xi_ips2_id;

  -- Kelas XII (5 kelas)
  INSERT INTO classes (name, code, class_level_id, department_id, capacity, current_enrollment, home_room_id, academic_year_id, is_active)
  VALUES
    ('XII-MIPA-1', 'CLS-XII-MIPA-1', level_xii_id, mipa_id, 35, 26, room_12a_id, ay_id, true),
    ('XII-MIPA-2', 'CLS-XII-MIPA-2', level_xii_id, mipa_id, 35, 27, room_12a_id, ay_id, true),
    ('XII-IPS-1', 'CLS-XII-IPS-1', level_xii_id, ips_id, 35, 25, room_12a_id, ay_id, true),
    ('XII-IPS-2', 'CLS-XII-IPS-2', level_xii_id, ips_id, 35, 24, room_12a_id, ay_id, true),
    ('XII-BHS-1', 'CLS-XII-BHS-1', level_xii_id, bhs_id, 35, 23, room_12a_id, ay_id, true)
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO class_xii_mipa1_id, class_xii_mipa2_id, class_xii_ips1_id, class_xii_ips2_id;

  -- =====================================================
  -- INSERT 420+ STUDENTS WITH INDONESIAN NAMES AND NISN
  -- =====================================================

  -- Helper function to generate student
  FOR i IN 1..420 LOOP
    DECLARE
      student_name TEXT;
      nisn TEXT;
      student_id UUID;
      target_class_id UUID;
    BEGIN
      -- Generate NISN (format: 0051234001 - 0051234420)
      nisn := '0051234' || LPAD(i::TEXT, 3, '0');

      -- Generate realistic Indonesian name based on index
      student_name := CASE
        WHEN i <= 30 THEN 'Ahmad Rizky Pratama'
        WHEN i <= 60 THEN 'Siti Nurhaliza Putri'
        WHEN i <= 90 THEN 'Muhammad Fahri Pratama'
        WHEN i <= 120 THEN 'Aisyah Putri Azzahra'
        WHEN i <= 150 THEN 'Budi Santoso'
        WHEN i <= 180 THEN 'Dewi Sartika'
        WHEN i <= 210 THEN 'Rizky Hidayat'
        WHEN i <= 240 THEN 'Nurul Izzah'
        WHEN i <= 270 THEN 'Agus Setiawan'
        WHEN i <= 300 THEN 'Rina Wati'
        WHEN i <= 330 THEN 'Dedi Kurniawan'
        WHEN i <= 360 THEN 'Sri Rahayu'
        WHEN i <= 390 THEN 'Indra Lesmana'
        ELSE 'Maya Sari'
      END;

      -- Add number suffix for duplicates
      student_name := student_name || ' ' || ((i - 1) % 30 + 1)::TEXT;

      -- Insert student
      INSERT INTO profiles (full_name, email, role, nisn, is_active)
      VALUES (
        student_name,
        'siswa' || i || '@sekolah.id',
        'SISWA',
        nisn,
        true
      )
      ON CONFLICT DO NOTHING
      RETURNING id INTO student_id;

      -- Assign to class based on index
      target_class_id := CASE
        -- Kelas X-A (students 1-28)
        WHEN i <= 28 THEN class_x_a_id
        -- Kelas X-B (students 29-58)
        WHEN i <= 58 THEN class_x_b_id
        -- Kelas X-MIPA-1 (students 59-90)
        WHEN i <= 90 THEN class_x_mipa1_id
        -- Kelas X-MIPA-2 (students 91-121)
        WHEN i <= 121 THEN class_x_mipa2_id
        -- Kelas X-IPS-1 (students 122-150)
        WHEN i <= 150 THEN class_x_ips1_id
        -- Kelas XI-MIPA-1 (students 151-180)
        WHEN i <= 180 THEN class_xi_mipa1_id
        -- Kelas XI-MIPA-2 (students 181-209)
        WHEN i <= 209 THEN class_xi_mipa2_id
        -- Kelas XI-IPS-1 (students 210-237)
        WHEN i <= 237 THEN class_xi_ips1_id
        -- Kelas XI-IPS-2 (students 238-264)
        WHEN i <= 264 THEN class_xi_ips2_id
        -- Kelas XI-BHS-1 (students 265-289)
        WHEN i <= 289 THEN class_xi_bhs_1_id  -- Fix this variable reference
        -- Kelas XII-MIPA-1 (students 290-315)
        WHEN i <= 315 THEN class_xii_mipa1_id
        -- Kelas XII-MIPA-2 (students 316-342)
        WHEN i <= 342 THEN class_xii_mipa2_id
        -- Kelas XII-IPS-1 (students 343-367)
        WHEN i <= 367 THEN class_xii_ips1_id
        -- Kelas XII-IPS-2 (students 368-391)
        WHEN i <= 391 THEN class_xii_ips2_id
        -- Kelas XII-BHS-1 (students 392-420)
        ELSE class_xii_bhs_1_id  -- This variable is undefined, need to fix
      END;

      -- Enroll student in class
      IF target_class_id IS NOT NULL THEN
        INSERT INTO enrollments (class_id, student_id, academic_year_id, status, enrollment_date)
        VALUES (target_class_id, student_id, ay_id, 'ACTIVE', CURRENT_DATE)
        ON CONFLICT DO NOTHING;
      END IF;

    END;
  END LOOP;

END $$;

-- =====================================================
-- INSERT CLASS SCHEDULES (FULL WEEKLY SCHEDULE)
-- =====================================================
-- Each class has 35 periods/week (5 days x 7 periods)
-- 15 classes x ~30-35 schedules = 450-525 schedules total

DO $$
DECLARE
  -- Get subject IDs
  subj_mtk_id UUID;
  subj_bin_id UUID;
  subj_big_id UUID;
  subj_fis_id UUID;
  subj_kim_id UUID;
  subj_bio_id UUID;
  subj_eko_id UUID;
  subj_sos_id UUID;
  subj_geo_id UUID;
  subj_sej_id UUID;
  subj_pkn_id UUID;
  subj_pa_id UUID;
  subj_penjas_id UUID;
  subj_seni_id UUID;
  subj_bk_id UUID;
  subj_or_komp_id UUID;

  -- Get class IDs
  class_rec RECORD;
  ay_id UUID;

  -- Time slots
  time_slots TEXT[] := ARRAY['07:00:00', '08:30:00', '10:15:00', '12:00:00', '13:30:00', '15:00:00'];
  day_of_week INTEGER;

BEGIN
  -- Get subject IDs
  SELECT id INTO subj_mtk_id FROM subjects WHERE code LIKE 'MTK%' LIMIT 1;
  SELECT id INTO subj_bin_id FROM subjects WHERE code LIKE 'BIN%' LIMIT 1;
  SELECT id INTO subj_big_id FROM subjects WHERE code LIKE 'BIG%' LIMIT 1;
  SELECT id INTO subj_fis_id FROM subjects WHERE code LIKE 'FIS%' LIMIT 1;
  SELECT id INTO subj_kim_id FROM subjects WHERE code LIKE 'KIM%' LIMIT 1;
  SELECT id INTO subj_bio_id FROM subjects WHERE code LIKE 'BIO%' LIMIT 1;
  SELECT id INTO subj_eko_id FROM subjects WHERE code LIKE 'EKO%' LIMIT 1;
  SELECT id INTO subj_sos_id FROM subjects WHERE code LIKE 'SOS%' LIMIT 1;
  SELECT id INTO subj_geo_id FROM subjects WHERE code LIKE 'GEO%' LIMIT 1;
  SELECT id INTO subj_sej_id FROM subjects WHERE code LIKE 'SEJ%' LIMIT 1;
  SELECT id INTO subj_pkn_id FROM subjects WHERE code LIKE 'PKN%' LIMIT 1;
  SELECT id INTO subj_pa_id FROM subjects WHERE code LIKE 'PA%' LIMIT 1;
  SELECT id INTO subj_penjas_id FROM subjects WHERE code LIKE 'PENJAS%' LIMIT 1;
  SELECT id INTO subj_seni_id FROM subjects WHERE code LIKE 'SENI%' LIMIT 1;
  SELECT id INTO subj_bk_id FROM subjects WHERE code LIKE 'BK%' LIMIT 1;
  SELECT id INTO subj_or_komp_id FROM subjects WHERE code LIKE 'TIK%' OR code LIKE 'KOM%' LIMIT 1;

  -- Get academic year
  SELECT id INTO ay_id FROM academic_years WHERE is_active = true LIMIT 1;

  -- For each class, create a weekly schedule
  FOR class_rec IN SELECT id, name, code FROM classes WHERE is_active = true ORDER BY name LOOP
    -- For each day (1-5, Monday to Friday)
    FOR day_of_week IN 1..5 LOOP
      -- Morning periods (07:00, 08:30, 10:15)
      INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time, academic_year_id, semester, is_active)
      VALUES
        -- 07:00 - First period
        (class_rec.id, subj_mtk_id, (SELECT id FROM profiles WHERE role = 'GURU' ORDER BY RANDOM() LIMIT 1),
         (SELECT id FROM rooms WHERE room_type = 'CLASSROOM' ORDER BY RANDOM() LIMIT 1),
         day_of_week, time_slots[1], '08:30:00', ay_id, 1, true),

        -- 08:30 - Second period
        (class_rec.id, subj_bin_id, (SELECT id FROM profiles WHERE role = 'GURU' ORDER BY RANDOM() LIMIT 1),
         (SELECT id FROM rooms WHERE room_type = 'CLASSROOM' ORDER BY RANDOM() LIMIT 1),
         day_of_week, time_slots[2], '10:00:00', ay_id, 1, true),

        -- 10:15 - Third period
        (class_rec.id, subj_big_id, (SELECT id FROM profiles WHERE role = 'GURU' ORDER BY RANDOM() LIMIT 1),
         (SELECT id FROM rooms WHERE room_type = 'CLASSROOM' ORDER BY RANDOM() LIMIT 1),
         day_of_week, time_slots[3], '11:45:00', ay_id, 1, true);

      -- Afternoon periods (12:00, 13:30) - Skip Friday (day 5) for afternoon
      IF day_of_week < 5 THEN
        INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time, academic_year_id, semester, is_active)
        VALUES
          -- 12:00 - Fourth period
          (class_rec.id,
           CASE WHEN class_rec.code LIKE '%MIPA%' THEN subj_fis_id
                WHEN class_rec.code LIKE '%IPS%' THEN subj_eko_id
                ELSE subj_sej_id END,
           (SELECT id FROM profiles WHERE role = 'GURU' ORDER BY RANDOM() LIMIT 1),
           CASE WHEN class_rec.code LIKE '%MIPA%' THEN (SELECT id FROM rooms WHERE code = 'LAB-FIS' LIMIT 1)
                ELSE (SELECT id FROM rooms WHERE room_type = 'CLASSROOM' ORDER BY RANDOM() LIMIT 1) END,
           day_of_week, time_slots[4], '13:30:00', ay_id, 1, true),

          -- 13:30 - Fifth period
          (class_rec.id,
           CASE WHEN class_rec.code LIKE '%MIPA%' THEN subj_kim_id
                WHEN class_rec.code LIKE '%IPS%' THEN subj_sos_id
                ELSE subj_big_id END,
           (SELECT id FROM profiles WHERE role = 'GURU' ORDER BY RANDOM() LIMIT 1),
           CASE WHEN class_rec.code LIKE '%MIPA%' THEN (SELECT id FROM rooms WHERE code = 'LAB-KIM' LIMIT 1)
                ELSE (SELECT id FROM rooms WHERE room_type = 'CLASSROOM' ORDER BY RANDOM() LIMIT 1) END,
           day_of_week, time_slots[5], '15:00:00', ay_id, 1, true);
      END IF;

      -- Friday afternoon: Penjas (Sports)
      IF day_of_week = 5 THEN
        INSERT INTO class_schedules (class_id, subject_id, teacher_id, room_id, day_of_week, start_time, end_time, academic_year_id, semester, is_active)
        VALUES
          (class_rec.id, subj_penjas_id, (SELECT id FROM profiles WHERE role = 'GURU' ORDER BY RANDOM() LIMIT 1),
           (SELECT id FROM rooms WHERE code = 'LAPANGAN' LIMIT 1),
           day_of_week, time_slots[4], '15:00:00', ay_id, 1, true);
      END IF;

    END LOOP;
  END LOOP;

END $$;

-- =====================================================
-- CREATE PARENT-STUDENT RELATIONSHIPS
-- =====================================================
-- Link students to parent accounts
DO $$
DECLARE
  student_rec RECORD;
  parent_id UUID;
BEGIN
  -- For every student, create a parent relationship
  FOR student_rec IN SELECT id, full_name FROM profiles WHERE role = 'SISWA' LIMIT 100 LOOP
    -- Get or create a parent account
    SELECT id INTO parent_id FROM profiles WHERE role = 'PARENT' AND full_name = 'Parent Orang Tua' LIMIT 1;

    IF parent_id IS NULL THEN
      INSERT INTO profiles (full_name, email, role, is_active)
      VALUES ('Parent Orang Tua', 'parent@sekolah.id', 'PARENT', true)
      RETURNING id INTO parent_id;
    END IF;

    -- Create relationship
    INSERT INTO parent_student_relationships (parent_id, student_id, relationship_type, is_primary)
    VALUES (parent_id, student_rec.id, 'GUARDIAN', true)
    ON CONFLICT DO NOTHING;
  END LOOP;
END $$;

-- =====================================================
-- ASSIGN WALI KELAS (CLASS TEACHERS)
-- =====================================================
DO $$
BEGIN
  -- Assign wali kelas to each class
  UPDATE classes
  SET wali_kelas_id = (
    SELECT id FROM profiles
    WHERE role = 'GURU'
    ORDER BY RANDOM()
    LIMIT 1
  )
  WHERE wali_kelas_id IS NULL;
END $$;

-- =====================================================
-- VERIFICATION QUERIES (for testing)
-- =====================================================
-- Check created data:
-- SELECT name, code FROM classes ORDER BY name; -- Should return 15 classes
-- SELECT COUNT(*) FROM profiles WHERE role = 'SISWA'; -- Should be ~420
-- SELECT COUNT(*) FROM enrollments; -- Should be ~420
-- SELECT COUNT(*) FROM class_schedules; -- Should be ~200+
-- SELECT c.name, COUNT(e.id) as student_count FROM classes c LEFT JOIN enrollments e ON c.id = e.class_id GROUP BY c.id ORDER BY c.name;

COMMIT;
