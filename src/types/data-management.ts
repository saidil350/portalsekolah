// =====================================================
// DATA MANAGEMENT TYPES
// =====================================================

// Import base types to extend
import type { Room as BaseRoom, Subject as BaseSubject } from './shared';

// =====================================================
// TEACHER RANK TYPES
// =====================================================

export type TeacherRankCode = 'MAGANG' | 'PERTAMA' | 'MUDA' | 'MADYA' | 'UTAMA' | 'AHLI' | 'HONORER';

export interface TeacherRank {
  id: string;
  code: TeacherRankCode;
  name: string;
  description?: string | null;
  level_order: number;
  badge_color: string;
  icon?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TeacherRankConfig {
  value: TeacherRankCode;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  description: string;
}

// Teacher rank configurations
export const TEACHER_RANK_CONFIGS: TeacherRankConfig[] = [
  {
    value: 'HONORER',
    label: 'Guru Honorer',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100',
    icon: '',
    description: 'Guru non-PNS / Guru Tetap Yayasan'
  },
  {
    value: 'MAGANG',
    label: 'Guru Magang',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    icon: '',
    description: 'Guru pemerantah'
  },
  {
    value: 'PERTAMA',
    label: 'Guru Pertama',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    icon: '',
    description: 'Guru Grade 1 (Gol. III/a)'
  },
  {
    value: 'MUDA',
    label: 'Guru Muda',
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    icon: '',
    description: 'Guru Grade 2 (Gol. III/b-d)'
  },
  {
    value: 'MADYA',
    label: 'Guru Madya',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100',
    icon: '',
    description: 'Guru Grade 3 (Gol. IV/a-c)'
  },
  {
    value: 'UTAMA',
    label: 'Guru Utama',
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    icon: '⭐',
    description: 'Guru Grade 4 (Gol. IV/d-e)'
  },
  {
    value: 'AHLI',
    label: 'Guru Ahli',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    icon: '',
    description: 'Guru Spesialis/Konsultan'
  }
];

export function getTeacherRankConfig(rankCode: TeacherRankCode | undefined | null): TeacherRankConfig | null {
  if (!rankCode) return null;
  return TEACHER_RANK_CONFIGS.find(config => config.value === rankCode) || null;
}

// =====================================================
// ROOM TYPES
// =====================================================

export type RoomType = 'CLASSROOM' | 'LAB' | 'OFFICE' | 'AUDITORIUM' | 'OTHER';

export interface Room extends BaseRoom {
  room_type: RoomType;
  floor: number;
  facilities?: string[] | null;
  created_by?: string | null;
}

export interface RoomFormData {
  name: string;
  code: string;
  room_type: RoomType;
  capacity: number;
  floor: number;
  building?: string;
  facilities?: string[];
  description?: string;
  is_active: boolean;
}

// =====================================================
// SUBJECT TYPES
// =====================================================

export type SubjectType = 'MANDATORY' | 'ELECTIVE' | 'EXTRACURRICULAR';

export interface SubjectTeacher {
  id: string;
  subject_id: string;
  teacher_id: string;
  teacher_rank_id?: string | null;
  is_primary?: boolean; // Backwards compatibility, will be deprecated
  created_at: string;
  // Populated fields
  teacher?: {
    id: string;
    full_name: string;
    email?: string;
    nip?: string;
  };
  teacher_rank?: TeacherRank;
}

export interface Subject extends BaseSubject {
  subject_type: SubjectType;
  credit_hours: number;
  department_id?: string | null;
  academic_year_id?: string | null;
  prerequisites?: string[] | null;
  created_by?: string | null;
  // Populated teachers for this subject
  teachers?: SubjectTeacher[];
}

export interface SubjectFormData {
  name: string;
  code: string;
  subject_type: SubjectType;
  credit_hours: number;
  department_id?: string;
  academic_year_id?: string;
  description?: string;
  prerequisites?: string[];
  is_active: boolean;
}

// =====================================================
// FILTER & RESPONSE TYPES
// =====================================================

export interface DataManagementFilters {
  search?: string;
  room_type?: RoomType;
  subject_type?: SubjectType;
  is_active?: boolean;
  department_id?: string;
}

export interface DataManagementResponse<T> {
  success: boolean;
  data?: T[];
  total?: number;
  error?: string;
}

export interface CreateResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UpdateResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

// =====================================================
// SUBJECT TEACHER TYPES
// =====================================================

export interface SubjectTeachersResponse {
  success: boolean;
  data?: SubjectTeacher[];
  error?: string;
}

export interface AssignTeacherRequest {
  subject_id: string;
  teacher_id: string;
  is_primary?: boolean;
}

export interface RemoveTeacherRequest {
  subject_id: string;
  teacher_id: string;
}

export interface SetPrimaryTeacherRequest {
  subject_id: string;
  teacher_id: string;
}

// =====================================================
// CONFIGURATION TYPES
// =====================================================

export interface RoomTypeConfig {
  value: RoomType;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export interface SubjectTypeConfig {
  value: SubjectType;
  label: string;
  color: string;
  bgColor: string;
}

// Room type configurations
export const ROOM_TYPE_CONFIGS: RoomTypeConfig[] = [
  {
    value: 'CLASSROOM',
    label: 'Ruang Kelas',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100/50',
    icon: '🏫'
  },
  {
    value: 'LAB',
    label: 'Laboratorium',
    color: 'text-purple-700',
    bgColor: 'bg-purple-100/50',
    icon: '🔬'
  },
  {
    value: 'OFFICE',
    label: 'Kantor',
    color: 'text-slate-700',
    bgColor: 'bg-slate-100/50',
    icon: '🏢'
  },
  {
    value: 'AUDITORIUM',
    label: 'Aula',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100/50',
    icon: '🎭'
  },
  {
    value: 'OTHER',
    label: 'Lainnya',
    color: 'text-orange-700',
    bgColor: 'bg-orange-100/50',
    icon: '📦'
  },
];

// Subject type configurations
export const SUBJECT_TYPE_CONFIGS: SubjectTypeConfig[] = [
  {
    value: 'MANDATORY',
    label: 'Wajib',
    color: 'text-red-700',
    bgColor: 'bg-red-100/50'
  },
  {
    value: 'ELECTIVE',
    label: 'Pilihan',
    color: 'text-blue-700',
    bgColor: 'bg-blue-100/50'
  },
  {
    value: 'EXTRACURRICULAR',
    label: 'Ekstrakurikuler',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100/50'
  },
];

// Helper function to get room type config
export function getRoomTypeConfig(roomType: RoomType): RoomTypeConfig {
  return ROOM_TYPE_CONFIGS.find(config => config.value === roomType) || ROOM_TYPE_CONFIGS[4];
}

// Helper function to get subject type config
export function getSubjectTypeConfig(subjectType: SubjectType): SubjectTypeConfig {
  return SUBJECT_TYPE_CONFIGS.find(config => config.value === subjectType) || SUBJECT_TYPE_CONFIGS[0];
}

// Re-use STATUS_CONFIGS from academic.ts
export { getAcademicStatusConfig as getStatusConfig } from '@/types/academic';
