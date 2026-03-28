// =====================================================
// ACADEMIC DATA TYPES
// =====================================================

// Re-export shared types to maintain backward compatibility
export type {
  ClassLevel,
  Department,
  Room,
  Subject,
  AcademicYear,
  Semester,
  Profile,
  AcademicYearFormData,
  ClassLevelFormData,
  DepartmentFormData
} from './shared';

// =====================================================
// FILTER & RESPONSE TYPES
// =====================================================

export interface AcademicFilters {
  search?: string;
  is_active?: boolean;
}

export interface AcademicResponse<T> {
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

export interface AcademicStatusConfig {
  value: boolean;
  label: string;
  color: string;
  bgColor: string;
  dotColor: string;
}

export const ACADEMIC_STATUS_CONFIGS: AcademicStatusConfig[] = [
  {
    value: true,
    label: 'Aktif',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100/50',
    dotColor: 'bg-emerald-500'
  },
  {
    value: false,
    label: 'Nonaktif',
    color: 'text-slate-600',
    bgColor: 'bg-slate-100',
    dotColor: 'bg-slate-400'
  }
];

// Helper function to get status config
export function getAcademicStatusConfig(isActive: boolean): AcademicStatusConfig {
  return ACADEMIC_STATUS_CONFIGS.find(config => config.value === isActive) || ACADEMIC_STATUS_CONFIGS[1];
}

// Helper function to format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Helper function to format date range for academic years
export function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const endFormatted = end.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return `${startFormatted} - ${endFormatted}`;
}
