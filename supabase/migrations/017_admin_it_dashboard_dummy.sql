-- 017_admin_it_dashboard_dummy.sql
-- Membangun data dummy untuk dashboard Admin IT

-- 1. Pastikan Ada Tahun Ajaran Aktif
INSERT INTO public.academic_years (name, start_date, end_date, is_active)
VALUES ('2025/2026', '2025-07-01', '2026-06-30', true)
ON CONFLICT (name) DO UPDATE SET is_active = true;

-- 2. Tambahkan Data Dummy untuk Kelas (Agar Total Kelas = 3 jika belum ada)
DO $$
DECLARE
    active_ay_id UUID;
BEGIN
    SELECT id INTO active_ay_id FROM public.academic_years WHERE is_active = true LIMIT 1;
    
    IF active_ay_id IS NOT NULL THEN
        INSERT INTO public.classes (name, academic_year_id, is_active, capacity)
        SELECT 'X-A', active_ay_id, true, 30
        WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'X-A' AND academic_year_id = active_ay_id);
        
        INSERT INTO public.classes (name, academic_year_id, is_active, capacity)
        SELECT 'XI-A', active_ay_id, true, 30
        WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'XI-A' AND academic_year_id = active_ay_id);
        
        INSERT INTO public.classes (name, academic_year_id, is_active, capacity)
        SELECT 'XII-A', active_ay_id, true, 30
        WHERE NOT EXISTS (SELECT 1 FROM public.classes WHERE name = 'XII-A' AND academic_year_id = active_ay_id);
    END IF;
END $$;

-- 3. Tambahkan Data Dummy untuk Enrollments (Status Siswa)
-- Mengisi enrollments untuk siswa yang belum terdaftar di tahun ajaran aktif
INSERT INTO public.enrollments (student_id, academic_year_id, class_id, status)
SELECT 
  p.id as student_id,
  ay.id as academic_year_id,
  (SELECT id FROM public.classes WHERE academic_year_id = ay.id LIMIT 1) as class_id,
  CASE 
    WHEN row_number() OVER() % 5 = 0 THEN 'ACTIVE'
    WHEN row_number() OVER() % 5 = 1 THEN 'LULUS'
    WHEN row_number() OVER() % 5 = 2 THEN 'PINDAH'
    WHEN row_number() OVER() % 5 = 3 THEN 'DROPOUT'
    ELSE 'NONAKTIF'
  END as status
FROM public.profiles p
CROSS JOIN (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1) ay
WHERE p.role = 'SISWA' AND p.is_active = true
AND NOT EXISTS (
    SELECT 1 FROM public.enrollments e 
    WHERE e.student_id = p.id AND e.academic_year_id = ay.id
)
LIMIT 50;

-- 4. Tabel Tagihan (student_invoices)
CREATE TABLE IF NOT EXISTS public.student_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  academic_year_id UUID REFERENCES public.academic_years(id),
  title TEXT NOT NULL, 
  amount NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, PAID, ARREARS
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS untuk student_invoices
ALTER TABLE public.student_invoices ENABLE ROW LEVEL SECURITY;

-- Polisi RLS (Sederhana untuk Admin)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can do everything on invoices') THEN
        CREATE POLICY "Admin can do everything on invoices" ON public.student_invoices
        FOR ALL TO authenticated
        USING (auth.jwt() ->> 'role' = 'ADMIN_IT')
        WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN_IT');
    END IF;
END $$;

-- 5. Tabel Kehadiran (attendances)
CREATE TABLE IF NOT EXISTS public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, EXCUSED
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS untuk attendances
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admin can do everything on attendances') THEN
        CREATE POLICY "Admin can do everything on attendances" ON public.attendances
        FOR ALL TO authenticated
        USING (auth.jwt() ->> 'role' = 'ADMIN_IT')
        WITH CHECK (auth.jwt() ->> 'role' = 'ADMIN_IT');
    END IF;
END $$;

-- 6. Isi Data Dummy Tagihan
INSERT INTO public.student_invoices (student_id, academic_year_id, title, amount, status, due_date)
SELECT 
  p.id as student_id,
  ay.id as academic_year_id,
  'SPP Februari 2026', 
  450000, 
  CASE WHEN row_number() OVER() % 3 = 0 THEN 'ARREARS' ELSE 'PENDING' END, 
  '2026-02-10'
FROM public.profiles p 
CROSS JOIN (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1) ay
WHERE p.role = 'SISWA' 
AND NOT EXISTS (SELECT 1 FROM public.student_invoices si WHERE si.student_id = p.id AND si.title = 'SPP Februari 2026')
LIMIT 10;

-- 7. Isi Data Dummy Kehadiran (6 bulan terakhir)
INSERT INTO public.attendances (student_id, class_id, date, status)
SELECT 
  e.student_id,
  e.class_id,
  d::date,
  CASE 
    WHEN (random() * 100)::int < 90 THEN 'PRESENT'
    WHEN (random() * 100)::int < 95 THEN 'LATE'
    ELSE 'ABSENT'
  END
FROM public.enrollments e
CROSS JOIN generate_series('2026-01-01'::date, '2026-04-06'::date, '1 day'::interval) d
WHERE d::date NOT IN (SELECT date FROM public.attendances WHERE student_id = e.student_id)
AND extract(dow from d) NOT IN (0, 6) -- Hindari akhir pekan
LIMIT 500;
