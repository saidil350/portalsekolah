# Panduan Data Dummy Dashboard Admin IT

Dokumen ini berisi panduan dan *script* SQL untuk membangun data dummy agar halaman `/dashboard/admin-it` dapat berfungsi penuh. 

Saat ini, beberapa bagian pada halaman tersebut masih berupa format *template* statis, sementara "Total Siswa" dan "Total Guru" sudah berjalan dinamis berdasarkan tabel `profiles`.

## 1. Status Data Saat Ini
*   **Total Siswa** & **Total Guru**: :white_check_mark: Berfungsi (mengambil dari tabel `profiles` via `/api/admin/stats`).
*   **Kelas Aktif**: :warning: API sudah mengambil dari tabel `classes` namun butuh data di tabel `classes` dan `academic_years`.
*   **Status Siswa (Widget)**: :warning: API sudah mengambil dari view `/api/admin/student-stats`, namun butuh data di tabel `enrollments`.
*   **Tagihan Belum Dibayar (Card Tunggakan)**: :x: *Hardcoded* (`156` di User Interface).
*   **Tren Kehadiran (Chart)**: :x: *Hardcoded* penuh menggunakan SVG.
*   **Tabel Tunggakan Biaya**: :x: *Hardcoded* penuh di UI HTML (Ahmad, Siti, Budi).

Berikut cara mengisi sisa datanya.

---

## 2. Mengaktifkan Kelas Aktif & Status Siswa 

Agar "Kelas Aktif" dan "Status Siswa" muncul dinamis, kita harus memasukkan data Tahun Ajaran (`academic_years`), Kelas (`classes`), dan pendaftaran siswa (`enrollments`).

Jalankan perintah SQL berikut melalui *SQL Editor* di Supabase:

```sql
-- 1. Pastikan Ada Tahun Ajaran Aktif
INSERT INTO public.academic_years (name, start_date, end_date, is_active)
VALUES ('2025/2026', '2025-07-01', '2026-06-30', true)
ON CONFLICT DO NOTHING;

-- Opsional: ambil UUID tahun ajaran untuk mempermudah (Pastikan menggantinya dengan UUID aktual jika perlu)
WITH active_ay AS (
  SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1
)
-- 2. Tambahkan Data Dummy untuk Kelas (Agar Total Kelas = 3)
INSERT INTO public.classes (name, academic_year_id, is_active, capacity)
SELECT 'X-A', id, true, 30 FROM active_ay UNION ALL
SELECT 'XI-A', id, true, 30 FROM active_ay UNION ALL
SELECT 'XII-A', id, true, 30 FROM active_ay;

-- 3. Tambahkan Data Dummy untuk Enrollments (Status Siswa)
-- Pastikan tabel profiles sudah memiliki siswa (role = 'SISWA') untuk di-assign. 
-- *Script ini mencontohkan status, bisa diedit UUID profile siswa.*
INSERT INTO public.enrollments (student_id, academic_year_id, class_id, status)
SELECT 
  p.id as student_id,
  ay.id as academic_year_id,
  -- ambil sembarang kelas (misal pakai id secara acak / limit 1)
  (SELECT id FROM public.classes WHERE is_active=true LIMIT 1) as class_id,
  -- Dummy status (dibagi rata untuk test widget)
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
LIMIT 50; -- Sesuaikan jumlah data siswanya
```

---

## 3. Data Dummy Keuangan / Tagihan Siswa (Tunggakan)

Karena UI saat ini masih *hardcoded*, anda butuh struktur tabel baru. Berikut usulan skema tabel tagihan (`student_invoices`) beserta contoh isinya:

### Skema Tabel (Usulan)
```sql
CREATE TABLE public.student_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT REFERENCES public.profiles(id) ON DELETE CASCADE,
  academic_year_id UUID NOT REFERENCES public.academic_years(id),
  title TEXT NOT NULL, -- cth: SPP Februari 2026
  amount NUMERIC(15,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING', -- CHECK (status IN ('PENDING', 'PAID', 'ARREARS'))
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Script Pengisian Data Dummy Tagihan
```sql
-- Tambahkan data tagihan dummy (Menjadikan hardcoded table jadi dinamis nanti)
INSERT INTO public.student_invoices (student_id, academic_year_id, title, amount, status, due_date)
SELECT 
  p.id as student_id,
  (SELECT id FROM public.academic_years WHERE is_active = true LIMIT 1) as academic_year_id,
  'SPP Februari 2026', 
  450000, 
  'ARREARS', 
  '2026-02-10'
FROM public.profiles p 
WHERE p.role = 'SISWA' LIMIT 5; -- Sesuaikan nama siswa
```

> **Catatan Implementasi:** Anda perlu membuat API Route baru `/api/admin/financial-stats` untuk memunculkan datanya ke halaman `page.tsx` lalu mengganti `<tr>` _hardcoded_ menjadi `.map()`.

---

## 4. Data Dummy Kehadiran (Attendance)

Chart grafik kehadiran saat ini menggunakan vektor `SVG` bawaan desain. Agar bisa dinamis, dibutuhkan struktur tabel *attendance* atau API route spesifik.

### Skema Tabel (Usulan)
```sql
CREATE TABLE public.attendances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_id UUID REFERENCES public.classes(id),
  date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- 'PRESENT', 'ABSENT', 'LATE', 'EXCUSED'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

> **Catatan Implementasi di UI (Frontend):** 
> Alih-alih menggunakan SVG _hardcoded_ `<img>`, saran terbaik adalah menggunakan *library* grafik seperti `recharts` atau `chart.js` di `src/components/ui`. 
> Data JSON yang diharapkan diambil dari API kira-kira akan berbentuk seperti ini:

```json
{
  "success": true,
  "data": {
    "trend": [
      { "month": "Jan", "percentage": 88 },
      { "month": "Feb", "percentage": 90 },
      { "month": "Mar", "percentage": 92 },
      { "month": "Apr", "percentage": 95 },
      { "month": "Mei", "percentage": 91 },
      { "month": "Jun", "percentage": 93 }
    ],
    "overall": 92,
    "lastSemesterComparison": "+2.4%"
  }
}
```

---

## Rangkuman Langkah Selanjutnya
1. Buka dashboard **Supabase**.
2. Masuk ke **SQL Editor**.
3. Jalankan query pada poin `2` agar Total Kelas dan Status Siswa berjalan normal.
4. (Opsional untuk tahapan berikut) Jalankan rancangan tabel di poin `3` dan `4`, lalu buat `Route Handler` Next.js (`src/app/api/admin/...`) baru dan ubah di dalam `src/app/dashboard/admin-it/page.tsx` melalui fetching via API tersebut.
