# Database Functions & Procedures Usage Guide

## 📚 Panduan Penggunaan Fitur Database

Dokumentasi ini menjelaskan cara menggunakan functions, views, dan procedures yang telah dibuat di database.

---

## 1. HELPER FUNCTIONS

### 1.1 calculate_occupancy_rate()
Menghitung persentase occupancy kelas.

**SQL:**
```sql
SELECT
  name,
  capacity,
  current_enrollment,
  calculate_occupancy_rate(current_enrollment, capacity) as occupancy_rate
FROM classes;
```

**Server Action Example:**
```typescript
const { data, error } = await supabase
  .rpc('calculate_occupancy_rate', {
    p_current_enrollment: 28,
    p_capacity: 35
  });
```

### 1.2 get_occupancy_badge()
Mendapatkan label badge berdasarkan occupancy rate.

**Return Values:**
- `'FULL'` - Jika occupancy ≥ 90%
- `'AVAILABLE'` - Jika occupancy 50-89%
- `'LOW'` - Jika occupancy < 50%

**Usage:**
```sql
SELECT
  name,
  get_occupancy_badge(calculate_occupancy_rate(current_enrollment, capacity)) as badge
FROM classes;
```

### 1.3 check_teacher_availability()
Cek apakah guru available pada waktu tertentu.

**Parameters:**
- `p_teacher_id` (UUID)
- `p_day_of_week` (INTEGER: 1=Senin, 7=Minggu)
- `p_start_time` (TIME)
- `p_end_time` (TIME)
- `p_exclude_schedule_id` (UUID, optional) - Exclude specific schedule from conflict check

**Returns:** `BOOLEAN` (TRUE = available, FALSE = has conflict)

**Server Action:**
```typescript
export async function checkScheduleAvailability(
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  const supabase = await createClient();

  // Get all teachers with availability status
  const { data: teachers } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('role', 'GURU')
    .eq('is_active', true);

  // Check availability for each teacher
  const availability = await Promise.all(
    teachers.map(async (teacher) => {
      const { data } = await supabase.rpc('check_teacher_availability', {
        p_teacher_id: teacher.id,
        p_day_of_week: dayOfWeek,
        p_start_time: startTime,
        p_end_time: endTime
      });

      return {
        teacher_id: teacher.id,
        teacher_name: teacher.full_name,
        is_available: data
      };
    })
  );

  return { success: true, data: availability };
}
```

### 1.4 check_room_availability()
Cek ketersediaan ruangan pada waktu tertentu.

**Parameters:**
- `p_room_id` (UUID)
- `p_day_of_week` (INTEGER)
- `p_start_time` (TIME)
- `p_end_time` (TIME)
- `p_exclude_schedule_id` (UUID, optional)

**Returns:** `BOOLEAN`

### 1.5 get_available_teachers()
Dapatkan list guru yang available untuk suatu time slot.

**Parameters:**
- `p_day_of_week` (INTEGER)
- `p_start_time` (TIME)
- `p_end_time` (TIME)
- `p_exclude_schedule_id` (UUID, optional)
- `p_subject_id` (UUID, optional) - Filter guru yang pernah mengajar subject ini

**Returns: TABLE with columns:**
- `teacher_id` (UUID)
- `teacher_name` (TEXT)
- `teacher_email` (TEXT)
- `is_available` (BOOLEAN)
- `conflict_count` (INTEGER)

**Server Action:**
```typescript
export async function fetchAvailableTeachers(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  subjectId?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_available_teachers', {
    p_day_of_week: dayOfWeek,
    p_start_time: startTime,
    p_end_time: endTime,
    p_subject_id: subjectId || null
  });

  if (error) throw error;

  return {
    success: true,
    data: data || []
  };
}
```

### 1.6 get_available_rooms()
Dapatkan list ruangan yang available untuk suatu time slot.

**Parameters:**
- `p_day_of_week` (INTEGER)
- `p_start_time` (TIME)
- `p_end_time` (TIME)
- `p_exclude_schedule_id` (UUID, optional)
- `p_min_capacity` (INTEGER, optional) - Filter ruangan dengan kapasitas minimal

**Returns: TABLE**
- `room_id`, `room_name`, `room_code`
- `room_type`, `capacity`
- `is_available`, `conflict_count`

**Server Action:**
```typescript
export async function fetchAvailableRooms(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  minCapacity?: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_available_rooms', {
    p_day_of_week: dayOfWeek,
    p_start_time: startTime,
    p_end_time: endTime,
    p_min_capacity: minCapacity || null
  });

  if (error) throw error;

  return {
    success: true,
    data: data || []
  };
}
```

---

## 2. STORED PROCEDURES

### 2.1 bulk_enroll_students()
Mendaftarkan banyak siswa ke sebuah kelas sekaligus.

**Parameters:**
- `p_class_id` (UUID)
- `p_student_ids` (UUID[]) - Array of student IDs
- `p_academic_year_id` (UUID)
- `p_enrollment_date` (DATE, optional) - Default: CURRENT_DATE

**Server Action:**
```typescript
export async function bulkEnrollStudents(
  classId: string,
  studentIds: string[],
  academicYearId: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('bulk_enroll_students', {
    p_class_id: classId,
    p_student_ids: studentIds,
    p_academic_year_id: academicYearId
  });

  if (error) throw error;

  revalidatePath('/dashboard/admin-it/kelas-dan-roster');

  return { success: true, data };
}
```

**Usage di Modal:**
```typescript
const handleEnrollSelected = async () => {
  const selectedStudentIds = Array.from(selectedStudents);

  await bulkEnrollStudents(
    classId,
    selectedStudentIds,
    academicYearId
  );

  // Refresh data
  await fetchAvailableStudents();
};
```

### 2.2 withdraw_student()
Mengeluarkan siswa dari kelas.

**Parameters:**
- `p_enrollment_id` (UUID)
- `p_withdrawal_date` (DATE, optional)
- `p_notes` (TEXT, optional)

**Server Action:**
```typescript
export async function withdrawStudent(
  enrollmentId: string,
  notes?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('withdraw_student', {
    p_enrollment_id: enrollmentId,
    p_notes: notes || null
  });

  if (error) throw error;

  revalidatePath('/dashboard/admin-it/kelas-dan-roster');

  return { success: true };
}
```

### 2.3 copy_schedules_to_semester()
Menyalin jadwal dari satu semester ke semester lain.

**Parameters:**
- `p_source_academic_year_id` (UUID)
- `p_source_semester` (INTEGER)
- `p_target_academic_year_id` (UUID)
- `p_target_semester` (INTEGER)
- `p_copy_teacher_assignments` (BOOLEAN, optional) - Default: true

**Server Action:**
```typescript
export async function copySchedulesToNewSemester(
  sourceAyId: string,
  sourceSemester: number,
  targetAyId: string,
  targetSemester: number
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('copy_schedules_to_semester', {
    p_source_academic_year_id: sourceAyId,
    p_source_semester: sourceSemester,
    p_target_academic_year_id: targetAyId,
    p_target_semester: targetSemester,
    p_copy_teacher_assignments: true
  });

  if (error) throw error;

  return { success: true, data };
}
```

---

## 3. VIEWS

### 3.1 view_class_roster_stats
View untuk statistik roster kelas lengkap.

**Query:**
```sql
SELECT * FROM view_class_roster_stats
WHERE is_active = true
ORDER BY class_level_order, department_name, class_name;
```

**Server Action:**
```typescript
export async function fetchClassesWithStats() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('view_class_roster_stats')
    .select('*')
    .eq('is_active', true)
    .order('class_level_name')
    .order('class_name');

  if (error) throw error;

  return { success: true, data: data || [] };
}
```

### 3.2 view_class_schedule_details
View untuk detail jadwal lengkap dengan nama guru, ruang, dll.

**Query:**
```sql
SELECT * FROM view_class_schedule_details
WHERE class_id = 'some-uuid'
  AND is_active = true
ORDER BY day_of_week, start_time;
```

### 3.3 view_student_enrollments
View untuk enrollment siswa dengan detail kelas.

**Query:**
```sql
SELECT * FROM view_student_enrollments
WHERE student_id = 'some-uuid'
  AND status = 'ACTIVE'
ORDER BY academic_year_name DESC, class_name;
```

### 3.4 view_teacher_workload
View untuk workload guru (jumlah kelas, jam mengajar).

**Query:**
```sql
SELECT * FROM view_teacher_workload
ORDER BY estimated_hours_per_week DESC;
```

**Server Action:**
```typescript
export async function fetchTeacherWorkload() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('view_teacher_workload')
    .select('*')
    .order('total_schedules', { ascending: false });

  if (error) throw error;

  return { success: true, data: data || [] };
}
```

### 3.5 view_room_utilization
View untuk utilisation ruangan.

**Query:**
```sql
SELECT * FROM view_room_utilization
WHERE is_active = true
ORDER BY total_schedules DESC;
```

---

## 4. DATA INTEGRITY CHECKS

### 4.1 check_data_integrity()
Fungsi untuk mengecek integritas data.

**Returns: TABLE**
- `check_type` (TEXT) - Tipe check
- `issue_count` (BIGINT) - Jumlah masalah ditemukan
- `description` (TEXT) - Deskripsi masalah

**Server Action (Admin Only):**
```typescript
export async function checkDataIntegrity() {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('check_data_integrity');

  if (error) throw error;

  return {
    success: true,
    issues: data || [],
    hasIssues: (data || []).some((check: any) => check.issue_count > 0)
  };
}
```

---

## 5. COMPLETE EXAMPLES

### Example 1: Add Student Modal dengan Real-time Availability Check

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'

export async function fetchScheduleModalData() {
  const supabase = await createClient();

  const [subjectsResult, teachersResult, roomsResult] = await Promise.all([
    supabase.from('subjects').select('id, name, code').eq('is_active', true),
    supabase.from('profiles').select('id, full_name').eq('role', 'GURU').eq('is_active', true),
    supabase.from('rooms').select('id, name, code, capacity').eq('is_active', true)
  ]);

  return {
    success: true,
    subjects: subjectsResult.data || [],
    teachers: teachersResult.data || [],
    rooms: roomsResult.data || []
  };
}

export async function checkAvailabilityForTimeSlot(
  dayOfWeek: number,
  startTime: string,
  endTime: string
) {
  const supabase = await createClient();

  const [teachersResult, roomsResult] = await Promise.all([
    supabase.rpc('get_available_teachers', {
      p_day_of_week: dayOfWeek,
      p_start_time: startTime,
      p_end_time: endTime
    }),
    supabase.rpc('get_available_rooms', {
      p_day_of_week: dayOfWeek,
      p_start_time: startTime,
      p_end_time: endTime
    })
  ]);

  return {
    success: true,
    available_teachers: teachersResult.data || [],
    available_rooms: roomsResult.data || []
  };
}
```

### Example 2: Create Schedule dengan Validation

```typescript
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createClassSchedule(formData: ClassScheduleFormData) {
  const supabase = await createClient();

  try {
    // 1. Check class conflict
    const { data: classConflict } = await supabase.rpc('check_schedule_conflict', {
      p_class_id: formData.class_id,
      p_day_of_week: formData.day_of_week,
      p_start_time: formData.start_time,
      p_end_time: formData.end_time
    });

    if (classConflict) {
      return {
        success: false,
        error: 'Jadwal bentrok dengan jadwal yang sudah ada untuk kelas ini'
      };
    }

    // 2. Check teacher availability
    const { data: teacherAvailable } = await supabase.rpc('check_teacher_availability', {
      p_teacher_id: formData.teacher_id,
      p_day_of_week: formData.day_of_week,
      p_start_time: formData.start_time,
      p_end_time: formData.end_time
    });

    if (!teacherAvailable) {
      return {
        success: false,
        error: 'Guru tidak tersedia pada waktu tersebut'
      };
    }

    // 3. Check room availability
    if (formData.room_id) {
      const { data: roomAvailable } = await supabase.rpc('check_room_availability', {
        p_room_id: formData.room_id,
        p_day_of_week: formData.day_of_week,
        p_start_time: formData.start_time,
        p_end_time: formData.end_time
      });

      if (!roomAvailable) {
        return {
          success: false,
          error: 'Ruangan tidak tersedia pada waktu tersebut'
        };
      }
    }

    // 4. Insert schedule
    const { data, error } = await supabase
      .from('class_schedules')
      .insert({
        class_id: formData.class_id,
        subject_id: formData.subject_id,
        teacher_id: formData.teacher_id,
        room_id: formData.room_id,
        day_of_week: formData.day_of_week,
        start_time: formData.start_time,
        end_time: formData.end_time,
        academic_year_id: formData.academic_year_id,
        semester: formData.semester,
        is_active: true
      })
      .select()
      .single();

    if (error) throw error;

    revalidatePath('/dashboard/admin-it/kelas-dan-roster');

    return { success: true, data };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Gagal membuat jadwal'
    };
  }
}
```

### Example 3: Bulk Enroll dengan Progress Tracking

```typescript
'use client'

import { useState } from 'react'
import { bulkEnrollStudents } from './actions'

function AddStudentModal({ classId, academicYearId, onClose }) {
  const [selectedStudents, setSelectedStudents] = useState(new Set())
  const [enrolling, setEnrolling] = useState(false)
  const [progress, setProgress] = useState({ enrolled: 0, skipped: 0 })

  const handleEnrollSelected = async () => {
    setEnrolling(true)
    const studentIds = Array.from(selectedStudents)

    try {
      const result = await bulkEnrollStudents(
        classId,
        studentIds,
        academicYearId
      )

      // The procedure will handle capacity checks
      // and return notices for skipped students

      alert(`${studentIds.length} siswa berhasil diproses`)
      onClose()
    } catch (error) {
      alert(error.message)
    } finally {
      setEnrolling(false)
    }
  }

  return (
    // ... modal JSX
    <button onClick={handleEnrollSelected} disabled={enrolling}>
      {enrolling ? 'Memproses...' : 'Tambahkan Siswa'}
    </button>
  )
}
```

---

## 6. PERFORMANCE OPTIMIZATION

### Index Usage
Queries otomatis menggunakan indexes yang telah dibuat:

```sql
-- Index untuk lookup cepat
idx_enrollments_class_student          -- Untuk join enrollments <-> classes
idx_class_schedules_teacher_day        -- Untuk cek availability guru
idx_class_schedules_room_day           -- Untuk cek availability ruangan
idx_class_schedules_time_range         -- Untuk cek conflict jadwal
```

### View Caching
Views diset otomatis untuk performa:

```typescript
// Gunakan view untuk query kompleks yang sering diakses
const { data } = await supabase
  .from('view_class_roster_stats')
  .select('*')
  .eq('is_active', true)
```

---

## 7. ERROR HANDLING

Semua functions dan procedures sudah include error handling:

```typescript
try {
  const { data, error } = await supabase.rpc('function_name', params);

  if (error) {
    // Error dari PostgreSQL trigger
    console.error('Database error:', error.message);
    return { success: false, error: error.message };
  }

  return { success: true, data };
} catch (err) {
  // Error dari network atau other issues
  console.error('Unexpected error:', err);
  return { success: false, error: 'Terjadi kesalahan sistem' };
}
```

---

## 8. TESTING SQL FUNCTIONS

Anda bisa test functions langsung di Supabase SQL Editor:

```sql
-- Test availability check
SELECT * FROM get_available_teachers(1, '07:00:00'::TIME, '08:30:00'::TIME);

-- Test occupancy calculation
SELECT
  name,
  calculate_occupancy_rate(current_enrollment, capacity) as rate,
  get_occupancy_badge(calculate_occupancy_rate(current_enrollment, capacity)) as badge
FROM classes
LIMIT 5;

-- Test integrity check
SELECT * FROM check_data_integrity();
```

---

## 9. SECURITY NOTES

Semua functions dan procedures sudah:
- ✅ Menggunakan parameterized queries (keamanan dari SQL injection)
- ✅ Mengikuti RLS (Row Level Security) policies
- ✅ Hanya granted ke role `authenticated`
- ✅ Validasi input di level database

Trigger otomatis menolak operasi yang tidak valid:
- ❌ Jadwal bentrok → Trigger exception
- ❌ Enrollment melebihi capacity → Procedure exception
- ❌ End time sebelum start time → Trigger exception
