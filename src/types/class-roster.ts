// =====================================================
// CLASS ROSTER TYPES - UPDATED STRUCTURE
// Based on new database hierarchy: TA → Semester → Jurusan → Kelas
// =====================================================

// =====================================================
// IMPORTS - Internal use
// =====================================================

import type {
  ClassLevel,
  Department,
  AcademicYear,
  Semester
} from './shared';

import type {
  Room,
  Subject
} from './data-management';

import type {
  User
} from './user';

// =====================================================
// RE-EXPORTS - For external consumers
// =====================================================

export type {
  AcademicYear,
  ClassLevel,
  Department,
  Semester,
  Profile as User,
  AcademicYearFormData,
  ClassLevelFormData,
  DepartmentFormData
} from './shared';

export type {
  Room,
  RoomFormData,
  Subject,
  SubjectFormData
} from './data-management';

// =====================================================
// CLASS (ROMBEL) TYPES
// =====================================================

export interface Class {
  id: string;
  name: string; // "X RPL 1", "XI IPA 2"
  code: string; // "X-RPL-1", "XI-IPA-2"

  // Foreign Keys - WAJIB
  academic_year_id: string; // Terikat ke TA tertentu
  class_level_id: string; // Tingkat (X/XI/XII)

  // Foreign Keys - Opsional
  semester_id?: string | null; // Kalau kelas per semester
  department_id?: string | null; // Jurusan (NULL = non-jurusan)
  wali_kelas_id?: string | null; // Guru wali kelas
  home_room_id?: string | null; // Ruang base

  // Kapasitas & Enrollment
  capacity: number; // Max 36-40 murid
  current_enrollment: number; // Auto-update via trigger

  // Computed fields
  total_hours_per_week?: number; // Total jam mengajar per minggu
  occupancy_rate?: number; // Persentase isi kelas

  // Status
  is_active: boolean;
  description?: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string | null;

  // Joined fields (from relations)
  class_level?: ClassLevel | null;
  department?: Department | null;
  academic_year?: AcademicYear | null;
  semester?: Semester | null;
  home_room?: Room | null;
  wali_kelas?: User | null;

  // Computed fields
  occupancy_badge?: 'FULL' | 'AVAILABLE' | 'LOW';
}

export interface ClassFormData {
  name: string;
  code: string;
  academic_year_id: string; // WAJIB
  class_level_id: string; // WAJIB
  semester_id?: string;
  department_id?: string;
  wali_kelas_id?: string;
  home_room_id?: string;
  capacity: number;
  is_active: boolean;
  description?: string;
}

export interface ClassFilters {
  search?: string;
  academic_year_id?: string;
  semester_id?: string;
  class_level_id?: string;
  department_id?: string;
  is_active?: boolean;
  page?: number;
  limit?: number;
}

export interface ClassResponse {
  success: boolean;
  data?: Class[];
  total?: number;
  error?: string;
}

// =====================================================
// ENROLLMENT TYPES
// =====================================================

export type EnrollmentStatus = 'ACTIVE' | 'PINDAH' | 'LULUS' | 'DROPOUT' | 'NONAKTIF';

export interface Enrollment {
  id: string;
  student_id: string; // FK ke profiles (role = SISWA)
  class_id: string; // FK ke classes
  academic_year_id: string; // FK ke academic_years
  status: EnrollmentStatus;
  enrollment_date: string;
  dropout_date?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;

  // Joined fields
  student?: User | null;
  class?: Class | null;
  academic_year?: AcademicYear | null;
}

export interface EnrollmentFormData {
  student_id: string;
  class_id: string;
  academic_year_id: string;
  status?: EnrollmentStatus;
  enrollment_date?: string;
  notes?: string;
}

export interface EnrollmentResponse {
  success: boolean;
  data?: Enrollment[];
  total?: number;
  error?: string;
}

// =====================================================
// CLASS SCHEDULE (JADWAL MENGAJAR) TYPES
// =====================================================

export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Senin, 7=Minggu

export interface ClassSchedule {
  id: string;

  // Foreign Keys - All WAJIB except room_id
  class_id: string;
  subject_id: string;
  teacher_id: string; // FK ke profiles (role = GURU)
  room_id?: string | null;

  // Semester & TA
  semester_id?: string | null;
  academic_year_id: string;

  // Waktu
  day_of_week: DayOfWeek; // 1-7
  start_time: string; // HH:mm format
  end_time: string; // HH:mm format

  // Status
  is_active: boolean;
  notes?: string | null;

  // Metadata
  created_at: string;
  updated_at: string;
  created_by?: string | null;

  // Joined fields
  class?: Class | null;
  subject?: Subject | null;
  teacher?: User | null;
  room?: Room | null;
  semester?: Semester | null;
  academic_year?: AcademicYear | null;

  // Computed fields
  day_name?: string; // 'Senin', 'Selasa', etc.
  time_range?: string; // '07:00 - 08:30'
}

export interface ClassScheduleFormData {
  class_id: string;
  subject_id: string;
  teacher_id: string;
  room_id?: string;
  semester?: string;
  semester_id?: string;
  academic_year_id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active?: boolean;
  notes?: string;
}

export interface ClassScheduleFilters {
  class_id?: string;
  teacher_id?: string;
  subject_id?: string;
  room_id?: string;
  day_of_week?: DayOfWeek;
  academic_year_id?: string;
  semester?: string;
  is_active?: boolean;
}

export interface ClassScheduleResponse {
  success: boolean;
  data?: ClassSchedule[];
  total?: number;
  error?: string;
}

// =====================================================
// CLASS ROSTER VIEW (Combined)
// =====================================================

export interface ClassRosterView {
  class_info: Class;
  students: User[];
  schedules: ClassSchedule[];
  teachers: User[];
  subjects: Subject[];
  statistics: {
    total_students: number;
    total_teachers: number;
    total_subjects: number;
    total_hours_per_week: number;
    occupancy_rate: number;
  };
}

// =====================================================
// VIEW TYPES (hasil dari database views)
// =====================================================

export interface ViewClassRosterComplete {
  id: string;
  name: string;
  code: string;
  capacity: number;
  current_enrollment: number;
  occupancy_rate: number;
  class_level_name: string;
  class_level_code: string;
  tingkat: number;
  department_name?: string | null;
  department_code?: string | null;
  academic_year_name: string;
  academic_year_start: string;
  academic_year_end: string;
  semester_name?: string | null;
  semester_number?: number | null;
  wali_kelas_name?: string | null;
  wali_kelas_email?: string | null;
  wali_kelas_nip?: string | null;
  home_room_name?: string | null;
  home_room_code?: string | null;
  is_active: boolean;
  description?: string | null;
  created_at: string;
}

export interface ViewTeachingScheduleComplete {
  id: string;
  hari: number;
  jam_mulai: string;
  jam_selesai: string;
  class_id: string;
  class_name: string;
  class_code: string;
  tingkat: number;
  department_name?: string | null;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  teacher_email: string;
  room_id?: string | null;
  room_name?: string | null;
  room_code?: string | null;
  academic_year: string;
  semester?: string | null;
  is_active: boolean;
  notes?: string | null;
}

export interface ViewStudentEnrollmentHistory {
  enrollment_id: string;
  status: EnrollmentStatus;
  enrollment_date: string;
  dropout_date?: string | null;
  notes?: string | null;
  student_id: string;
  student_name: string;
  student_email?: string | null;
  nis?: string | null;
  nisn?: string | null;
  angkatan?: number | null;
  class_id: string;
  class_name: string;
  class_code: string;
  tingkat: number;
  department_name?: string | null;
  academic_year_name: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

// =====================================================
// SCHEDULE UTILS & CONSTANTS
// =====================================================

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Senin', labelEn: 'Monday' },
  { value: 2, label: 'Selasa', labelEn: 'Tuesday' },
  { value: 3, label: 'Rabu', labelEn: 'Wednesday' },
  { value: 4, label: 'Kamis', labelEn: 'Thursday' },
  { value: 5, label: 'Jumat', labelEn: 'Friday' },
  { value: 6, label: 'Sabtu', labelEn: 'Saturday' },
  { value: 7, label: 'Minggu', labelEn: 'Sunday' },
] as const;

export const TIME_SLOTS = [
  '07:00',
  '08:30',
  '10:15',
  '12:00',
  '13:30',
  '15:00',
] as const;

export const ROOM_TYPES = [
  { value: 'CLASSROOM', label: 'Ruang Kelas' },
  { value: 'LAB', label: 'Laboratorium' },
  { value: 'WORKSHOP', label: 'Bengkel' },
  { value: 'OFFICE', label: 'Kantor' },
  { value: 'OTHER', label: 'Lainnya' },
] as const;

export const SUBJECT_TYPES = [
  { value: 'MANDATORY', label: 'Wajib' },
  { value: 'OPTIONAL', label: 'Pilihan' },
  { value: 'EXTRACURRICULAR', label: 'Ekstrakurikuler' },
] as const;

export const ENROLLMENT_STATUS_OPTS = [
  { value: 'ACTIVE', label: 'Aktif', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  { value: 'PINDAH', label: 'Pindah', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  { value: 'LULUS', label: 'Lulus', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  { value: 'DROPOUT', label: 'Dropout', color: 'text-red-700', bgColor: 'bg-red-50' },
  { value: 'NONAKTIF', label: 'Non-Aktif', color: 'text-slate-700', bgColor: 'bg-slate-50' },
] as const;

// =====================================================
// OCCUPANCY BADGE CONFIGS
// =====================================================

export interface OccupancyBadgeConfig {
  value: 'FULL' | 'AVAILABLE' | 'LOW';
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  condition: (rate: number) => boolean;
}

export const OCCUPANCY_BADGE_CONFIGS: OccupancyBadgeConfig[] = [
  {
    value: 'FULL',
    label: 'Hampir Penuh',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    icon: '🔴',
    condition: (rate) => rate >= 90,
  },
  {
    value: 'AVAILABLE',
    label: 'Tersedia',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    icon: '🟡',
    condition: (rate) => rate >= 50 && rate < 90,
  },
  {
    value: 'LOW',
    label: 'Kurang Siswa',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    icon: '🟢',
    condition: (rate) => rate < 50,
  },
];

// Helper functions
export function getOccupancyBadge(enrollment: number, capacity: number): OccupancyBadgeConfig {
  const rate = (enrollment / capacity) * 100;
  return OCCUPANCY_BADGE_CONFIGS.find((config) => config.condition(rate)) || OCCUPANCY_BADGE_CONFIGS[2];
}

export function getDayName(dayOfWeek: number): string {
  const day = DAYS_OF_WEEK.find((d) => d.value === dayOfWeek);
  return day?.label || '';
}

export function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`;
}

export function calculateOccupancyRate(enrollment: number, capacity: number): number {
  return capacity > 0 ? Math.round((enrollment / capacity) * 100) : 0;
}

// =====================================================
// IMPORTS FROM OTHER TYPE FILES
// =====================================================
