// User Role Types
export type UserRole = 'ADMIN_IT' | 'KEPALA_SEKOLAH' | 'GURU' | 'SISWA';

// User Status Types
export type UserStatus = 'ACTIVE' | 'INACTIVE';

// Main User Interface (Profile)
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  nip?: string | null;
  nisn?: string | null;
  status: UserStatus;
  last_login?: string | null;
  created_at: string;
  updated_at: string;
}

// User Form Data (for create/update)
export interface UserFormData {
  email: string;
  full_name: string;
  password?: string;
  role: UserRole;
  nip?: string;
  nisn?: string;
  status: UserStatus;
}

// Role Display Configuration
export interface RoleConfig {
  value: UserRole;
  label: string;
  color: string;
  bgColor: string;
}

// Status Display Configuration
export interface StatusConfig {
  value: UserStatus;
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
}

// Filter Options
export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
}

// Pagination Options
export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

// API Response Types
export interface UsersResponse {
  users: User[];
  total: number;
}

export interface CreateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  error?: string;
}

export interface SyncResponse {
  success: boolean;
  synced: number;
  errors: number;
  total: number;
}

// Utility function to get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// Utility function to get avatar color based on role
export function getRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    'ADMIN_IT': 'bg-blue-100/50 text-blue-700',
    'KEPALA_SEKOLAH': 'bg-teal-100/50 text-teal-700',
    'GURU': 'bg-purple-100/50 text-purple-700',
    'SISWA': 'bg-orange-100/50 text-orange-700',
  };
  return colors[role];
}

// Role configurations for display
export const ROLE_CONFIGS: RoleConfig[] = [
  { value: 'ADMIN_IT', label: 'Admin IT', color: 'text-blue-700', bgColor: 'bg-blue-100/50' },
  { value: 'KEPALA_SEKOLAH', label: 'Kepala Sekolah', color: 'text-teal-700', bgColor: 'bg-teal-100/50' },
  { value: 'GURU', label: 'Guru', color: 'text-purple-700', bgColor: 'bg-purple-100/50' },
  { value: 'SISWA', label: 'Siswa', color: 'text-orange-700', bgColor: 'bg-orange-100/50' },
];

// Status configurations for display
export const STATUS_CONFIGS: StatusConfig[] = [
  {
    value: 'ACTIVE',
    label: 'Aktif',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100/50',
    dotColor: 'bg-emerald-500'
  },
  {
    value: 'INACTIVE',
    label: 'Nonaktif',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    dotColor: 'bg-slate-400'
  },
];
