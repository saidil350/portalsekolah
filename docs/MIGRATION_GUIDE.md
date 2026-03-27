# 🔄 Migration Guide - Restructure Class Roster System

## 📋 Overview

Migration ini me-restart ulang struktur database sistem roster kelas sesuai dengan hierarki sekolah Indonesia:
- **Hierarki**: Tahun Ajaran → Semester → Jurusan → Kelas → Murid & Jadwal
- **Kunci**: Kelas dibuat per TA, tidak carry over
- **Enrollment**: Terpisah per TA untuk tracking riwayat

---

## ⚠️ PERINGATAN PENTING

**Migration ini akan DROP dan RECREATE tabel berikut:**
- `academic_years`
- `semesters`
- `departments`
- `class_levels`
- `subjects`
- `rooms`
- `classes`
- `enrollments`
- `class_schedules`

**Data yang akan HILANG:**
- Semua data kelas yang ada
- Semua data jadwal
- Semua data enrollment

**Data yang AMAN:**
- `profiles` (user accounts) - tidak di-drop
- Data auth.users

---

## 📝 Langkah-Langkah Migration

### Opsi A: Fresh Start (Rekomendasi untuk Development)

Jika ini environment development dan data tidak penting:

1. **Backup Data (Opsional)**
   ```bash
   # Dump database
   pg_dump -h db.zgsnzjifacwlxqkyxhjm.supabase.co -U postgres -d postgres > backup.sql
   ```

2. **Apply Migration via Supabase Dashboard**
   - Buka: https://supabase.com/dashboard/project/zgsnzjifacwlxqkyxhjm
   - Klik **SQL Editor** → **New Query**
   - Copy isi file: `supabase/migrations/001_restructure_class_roster_system.sql`
   - Run ▶️

3. **Apply RLS Policies**
   - New Query lagi
   - Copy isi file: `supabase/migrations/002_fix_rls_new_structure.sql`
   - Run ▶️

4. **Update User Role**
   ```sql
   -- Pastikan user Anda jadi ADMIN_IT
   UPDATE profiles
   SET role = 'ADMIN_IT'
   WHERE email = 'your-email@example.com';

   -- Atau update semua
   UPDATE profiles
   SET role = 'ADMIN_IT'
   WHERE role IS NULL OR role != 'ADMIN_IT';
   ```

5. **Verification**
   ```sql
   -- Cek tabel sudah tercreate
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('academic_years', 'semesters', 'departments', 'classes', 'enrollments', 'class_schedules')
   ORDER BY table_name;

   -- Cek sample data
   SELECT * FROM view_class_roster_complete LIMIT 10;
   ```

### Opsi B: Manual Data Preservation (Jika data penting)

Jika ada data penting yang harus di-preserve:

1. **Export Data Lama**
   ```sql
   -- Export ke CSV dari Supabase Table Editor
   -- Export: classes, enrollments, class_schedules
   ```

2. **Apply Migration** (sama seperti Opsi A)

3. **Import & Transform Data**
   - Mapping kolom manual dari struktur lama ke baru
   - Contoh: `class_level_id` harus ada sebelum insert `classes`

---

## 🧪 Testing Setelah Migration

### 1. Test Create Kelas

Via browser:
```
http://localhost:3000/dashboard/admin-it/kelas-dan-roster/create
```

Isi form:
- Nama Kelas: `X RPL 1`
- Kode: `X-RPL-1` (auto-generate)
- Tingkat: Kelas X
- Jurusan: Rekayasa Perangkat Lunak
- Tahun Ajaran: 2024/2025
- Kapasitas: 36

Harus berhasil tanpa RLS error!

### 2. Test View Data

```sql
-- Via SQL Editor
SELECT * FROM view_class_roster_complete;
SELECT * FROM view_teaching_schedule_complete;
SELECT * FROM view_student_enrollment_history;
```

### 3. Test Functions

```sql
-- Test conflict detection
SELECT check_teacher_schedule_conflict(
    'teacher-uuid',
    1, -- Senin
    '07:00'::TIME,
    '09:00'::TIME
);

SELECT check_room_schedule_conflict(
    'room-uuid',
    1,
    '07:00'::TIME,
    '09:00'::TIME
);

SELECT check_wali_kelas_assignment(
    'teacher-uuid',
    'academic-year-uuid'
);
```

---

## 📊 Struktur Database Baru

### Hierarki Tabel

```
academic_years (1)
  └── semesters (2)
        └── departments (3)
              └── class_levels (4)
                    └── classes (5)
                          ├── enrollments (6) → profiles (murid)
                          └── class_schedules (7)
                                ├── subjects (8)
                                ├── profiles (guru)
                                └── rooms (9)
```

### Relasi Penting

1. **classes** terikat ke:
   - `academic_year_id` (WAJIB) - kelas ada di TA tertentu
   - `semester_id` (opsional) - kalau kelas per semester
   - `department_id` (opsional) - jurusan
   - `class_level_id` (WAJIB) - tingkat (X/XI/XII)

2. **enrollments** terikat ke:
   - `student_id` (WAJIB) - murid
   - `class_id` (WAJIB) - kelas
   - `academic_year_id` (WAJIB) - TA
   - **Constraint**: satu murid hanya satu enrollment aktif per TA

3. **class_schedules** (Many-to-Many):
   - `teacher_id` (WAJIB) - guru
   - `class_id` (WAJIB) - kelas
   - `subject_id` (WAJIB) - mapel
   - `room_id` (opsional) - ruangan
   - **Conflict detection** via EXCLUDE constraint

---

## 🔍 Troubleshooting

### Error: "column does not exist"

**Cause**: Migration belum di-apply dengan benar

**Solution**:
```sql
-- Cek struktur tabel
\d table_name

-- Atau via information_schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'classes';
```

### Error: "new row violates row-level security policy"

**Cause**: Role user bukan ADMIN_IT atau RLS policy belum di-apply

**Solution**:
```sql
-- 1. Cek role
SELECT id, email, role FROM profiles;

-- 2. Update role
UPDATE profiles SET role = 'ADMIN_IT' WHERE email = 'your-email@example.com';

-- 3. Re-apply RLS policies
-- Run file: 002_fix_rls_new_structure.sql
```

### Error: "duplicate key value violates unique constraint"

**Cause**: Coba insert data yang sudah ada (misal: code kelas duplikat)

**Solution**:
- Gunakan code yang unik per TA
- Contoh: `X-RPL-1` hanya boleh sekali per `academic_year_id`

---

## ✅ Checklist Selesai

- [ ] Migration 001 di-apply
- [ ] Migration 002 di-apply
- [ ] User role di-update ke ADMIN_IT
- [ ] Sample data ter-insert (TA, semester, jurusan, dll)
- [ ] Test create kelas berhasil
- [ ] View dapat di-query tanpa error
- [ ] Function conflict detection bekerja

---

## 📚 Reference

### Views untuk Query Data

```sql
-- Lihat semua kelas dengan info lengkap
SELECT * FROM view_class_roster_complete
WHERE is_active = true
ORDER BY academic_year_start DESC, tingkat, department_name;

-- Lihat jadwal mengajar lengkap
SELECT * FROM view_teaching_schedule_complete
WHERE is_active = true
ORDER BY hari, jam_mulai;

-- Lihat riwayat enrollment murid
SELECT * FROM view_student_enrollment_history
WHERE student_id = 'student-uuid'
ORDER BY academic_year_start DESC;
```

### Conflict Detection Functions

```sql
-- Cek apakah guru free di waktu tertentu
SELECT check_teacher_schedule_conflict(
    'teacher-uuid'::UUID,
    1, -- Senin
    '07:00'::TIME,
    '08:30'::TIME
);

-- Cek apakah ruangan free
SELECT check_room_schedule_conflict(
    'room-uuid'::UUID,
    1,
    '07:00'::TIME,
    '08:30'::TIME
);

-- Cek apakah guru bisa jadi wali kelas
SELECT check_wali_kelas_assignment(
    'teacher-uuid'::UUID,
    'academic-year-uuid'::UUID
);
```

---

## 🆘 Butuh Bantuan?

Jika ada masalah:
1. Cek error logs di Supabase Dashboard → Logs
2. Buka browser console (F12) untuk client-side error
3. Buka file `supabase/migrations/001_restructure_class_roster_system.sql` untuk referensi struktur tabel
