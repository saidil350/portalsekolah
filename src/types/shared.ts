// Shared type definitions used across multiple modules
// This file eliminates duplicate interface definitions and provides a single source of truth

export interface ClassLevel {
  id: string;
  name: string;
  code: string;
  level_order: number;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  head_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  capacity?: number;
  building?: string;
  floor?: number;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  description?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
}

export interface Semester {
  id: string;
  academic_year_id: string;
  name: string;
  semester_number: 1 | 2;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: 'ADMIN_IT' | 'GURU' | 'KEPALA_SEKOLAH' | 'SISWA';
  nip?: string;
  nisn?: string;
  phone?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
}
