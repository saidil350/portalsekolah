// =====================================================
// DATA MANAGEMENT TYPES
// =====================================================

// =====================================================
// ROOM TYPES
// =====================================================

export type RoomType = 'CLASSROOM' | 'LAB' | 'OFFICE' | 'AUDITORIUM' | 'OTHER';

export interface Room {
  id: string;
  name: string;
  code: string;
  room_type: RoomType;
  capacity: number;
  floor: number;
  building?: string | null;
  facilities?: string[] | null;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface Subject {
  id: string;
  name: string;
  code: string;
  subject_type: SubjectType;
  credit_hours: number;
  department_id?: string | null;
  academic_year_id?: string | null;
  description?: string | null;
  prerequisites?: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
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
export { getAcademicStatusConfig as getStatusConfig, type AcademicStatusConfig as StatusConfig } from '@/types/academic';
