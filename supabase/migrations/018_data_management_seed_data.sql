-- 018_data_management_seed_data.sql
-- Membangun data dummy untuk Manajemen Data sesuai docs/dummy-data-data-management.md

DO $$
DECLARE
    v_ay_2425 UUID;
    v_ay_2526 UUID;
    v_ay_2324 UUID;
    v_sem_ganjil UUID;
    
    v_dept_ipa UUID;
    v_dept_ips UUID;
    v_dept_bhs UUID;
    
    v_lv_10 UUID;
    v_lv_11 UUID;
    v_lv_12 UUID;
    
    v_room_101 UUID;
    v_room_102 UUID;
    v_room_201 UUID;
    
    v_guru_id UUID;
BEGIN
    -- 1. TAHUN AJARAN (Academic Years)
    INSERT INTO public.academic_years (name, start_date, end_date, is_active, description)
    VALUES 
        ('2024/2025', '2024-07-15', '2025-06-20', true, 'Tahun Ajaran Aktif'),
        ('2025/2026', '2025-07-14', '2026-06-19', false, 'Tahun Ajaran Terencana'),
        ('2023/2024', '2023-07-12', '2024-06-21', false, 'Tahun Ajaran Selesai')
    ON CONFLICT (name) DO UPDATE SET is_active = EXCLUDED.is_active
    RETURNING id INTO v_ay_2425; -- Kita ambil yang 24/25 sebagai default untuk data transaksional
    
    SELECT id INTO v_ay_2526 FROM public.academic_years WHERE name = '2025/2026';
    SELECT id INTO v_ay_2324 FROM public.academic_years WHERE name = '2023/2024';

    -- 2. SEMESTER
    INSERT INTO public.semesters (academic_year_id, name, semester_number, start_date, end_date, is_active)
    VALUES 
        (v_ay_2425, 'Ganjil 2024/2025', 1, '2024-07-15', '2024-12-15', true),
        (v_ay_2425, 'Genap 2024/2025', 2, '2025-01-06', '2025-06-20', false)
    ON CONFLICT (academic_year_id, semester_number) DO NOTHING
    RETURNING id INTO v_sem_ganjil;

    -- 3. JURUSAN (Departments)
    INSERT INTO public.departments (name, code, description)
    VALUES 
        ('Ilmu Pengetahuan Alam', 'IPA', 'Peminatan Sains dan Matematika'),
        ('Ilmu Pengetahuan Sosial', 'IPS', 'Peminatan Sosial dan Ekonomi'),
        ('Ilmu Bahasa & Budaya', 'BAHASA', 'Peminatan Sastra dan Bahasa')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name;
    
    SELECT id INTO v_dept_ipa FROM public.departments WHERE code = 'IPA';
    SELECT id INTO v_dept_ips FROM public.departments WHERE code = 'IPS';
    SELECT id INTO v_dept_bhs FROM public.departments WHERE code = 'BAHASA';

    -- 4. TINGKAT KELAS (Class Levels)
    INSERT INTO public.class_levels (name, code, level, description)
    VALUES 
        ('Kelas 10', '10', 10, 'Siswa Baru (Fase E)'),
        ('Kelas 11', '11', 11, 'Tingkat Menengah (Fase F)'),
        ('Kelas 12', '12', 12, 'Tingkat Akhir (Fase F)')
    ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, level = EXCLUDED.level;
    
    SELECT id INTO v_lv_10 FROM public.class_levels WHERE code = '10';
    SELECT id INTO v_lv_11 FROM public.class_levels WHERE code = '11';
    SELECT id INTO v_lv_12 FROM public.class_levels WHERE code = '12';

    -- 5. RUANGAN (Rooms)
    INSERT INTO public.rooms (name, code, room_type, capacity, floor, building, facilities, is_active)
    VALUES 
        ('Ruang X IPA 1', 'R-101', 'CLASSROOM', 40, 1, 'Gedung A', ARRAY['AC', 'Proyektor', 'Whiteboard'], true),
        ('Ruang X IPA 2', 'R-102', 'CLASSROOM', 40, 1, 'Gedung A', ARRAY['AC', 'Proyektor', 'Whiteboard'], true),
        ('Ruang XI IPA 1', 'R-201', 'CLASSROOM', 40, 2, 'Gedung A', ARRAY['AC', 'Proyektor', 'Whiteboard'], true),
        ('Lab Komputer 1', 'L-KB1', 'LAB', 35, 1, 'Gedung C', ARRAY['AC', 'Komputer', 'Internet'], true),
        ('Lab Fisika', 'L-FSK', 'LAB', 30, 2, 'Gedung C', ARRAY['Peralatan Lab', 'Proyektor'], true),
        ('Perpustakaan', 'P-001', 'OTHER', 100, 1, 'Gedung B', ARRAY['Rak Buku', 'Meja Baca', 'AC'], true),
        ('Lapangan Basket', 'L-BSK', 'OTHER', 150, 0, 'Area Terbuka', ARRAY['Ring Basket', 'Tribun'], true)
    ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name, 
        room_type = EXCLUDED.room_type, 
        capacity = EXCLUDED.capacity;
        
    SELECT id INTO v_room_101 FROM public.rooms WHERE code = 'R-101';
    SELECT id INTO v_room_102 FROM public.rooms WHERE code = 'R-102';
    SELECT id INTO v_room_201 FROM public.rooms WHERE code = 'R-201';

    -- 6. MATA PELAJARAN (Subjects)
    INSERT INTO public.subjects (name, code, subject_type, credit_hours, is_active, academic_year_id)
    VALUES 
        ('Pendidikan Agama Islam', 'PAI-01', 'MANDATORY', 3, true, v_ay_2425),
        ('Pendidikan Pancasila & Kewarganegaraan', 'PKN-01', 'MANDATORY', 2, true, v_ay_2425),
        ('Bahasa Indonesia', 'BIN-01', 'MANDATORY', 4, true, v_ay_2425),
        ('Matematika Wajib', 'MWT-01', 'MANDATORY', 4, true, v_ay_2425)
    ON CONFLICT (code) DO NOTHING;
    
    -- Mapel dengan Department (Peminatan)
    INSERT INTO public.subjects (name, code, subject_type, credit_hours, department_id, is_active, academic_year_id)
    VALUES 
        ('Matematika Minat (IPA)', 'MMT-01', 'MANDATORY', 3, v_dept_ipa, true, v_ay_2425),
        ('Fisika', 'FIS-01', 'MANDATORY', 3, v_dept_ipa, true, v_ay_2425),
        ('Biologi', 'BIO-01', 'MANDATORY', 3, v_dept_ipa, true, v_ay_2425),
        ('Ekonomi', 'EKO-01', 'MANDATORY', 3, v_dept_ips, true, v_ay_2425),
        ('Pendidikan Jasmani & Rohani', 'PJK-01', 'MANDATORY', 2, NULL, true, v_ay_2425),
        ('Muatan Lokal (Bahasa Daerah)', 'MLK-01', 'MANDATORY', 2, NULL, true, v_ay_2425)
    ON CONFLICT (code) DO NOTHING;

    -- 7. PASTIKAN ADA GURU (Wali Kelas)
    SELECT id INTO v_guru_id FROM public.profiles WHERE role = 'GURU' LIMIT 1;
    
    IF v_guru_id IS NULL THEN
        -- Create a dummy teacher if none exists
        INSERT INTO auth.users (id, email) 
        VALUES (gen_random_uuid(), 'guru.dummy@example.com')
        ON CONFLICT DO NOTHING;
        
        -- Since we can't easily get the auth.uid from here without more complex logic/extensions,
        -- we'll just check if we can find any user or just skip wali_kelas for now.
        -- BUT for dummy data purposes, let's assume there is at least one admin or user we can use as a placeholder GURU
        SELECT id INTO v_guru_id FROM public.profiles LIMIT 1;
    END IF;

    -- 8. KELAS (Classes)
    INSERT INTO public.classes (name, code, academic_year_id, department_id, class_level_id, home_room_id, capacity, wali_kelas_id, is_active)
    VALUES 
        ('10 IPA 1', 'X-IPA-1', v_ay_2425, v_dept_ipa, v_lv_10, v_room_101, 36, v_guru_id, true),
        ('10 IPA 2', 'X-IPA-2', v_ay_2425, v_dept_ipa, v_lv_10, v_room_102, 36, v_guru_id, true),
        ('10 IPS 1', 'X-IPS-1', v_ay_2425, v_dept_ips, v_lv_10, NULL, 36, v_guru_id, true),
        ('11 IPA 1', 'XI-IPA-1', v_ay_2425, v_dept_ipa, v_lv_11, v_room_201, 35, v_guru_id, true),
        ('11 IPS 1', 'XI-IPS-1', v_ay_2425, v_dept_ips, v_lv_11, NULL, 35, v_guru_id, true),
        ('12 IPA 1', 'XII-IPA-1', v_ay_2425, v_dept_ipa, v_lv_12, NULL, 30, v_guru_id, true),
        ('12 Bahasa', 'XII-BHS-1', v_ay_2425, v_dept_bhs, v_lv_12, NULL, 30, v_guru_id, true)
    ON CONFLICT (academic_year_id, code) DO NOTHING;

END $$;
