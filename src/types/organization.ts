/**
 * Organization types for multi-tenant architecture
 */

export type OrganizationPlan = 'FREE' | 'PRO' | 'ENTERPRISE'
export type SchoolLevel = 'TK' | 'SD' | 'SMP' | 'SMA' | 'SMK' | 'MA' | 'SLB' | 'OTHER'

export interface Organization {
  id: string
  name: string
  code: string // Unique org code for login
  domain?: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string

  // School-specific fields
  school_level?: SchoolLevel
  npsn?: string // Nomor Pokok Sekolah Nasional

  // Subscription/Plan info
  plan: OrganizationPlan
  max_users: number
  max_storage_mb: number

  // Status
  is_active: boolean
  settings: Record<string, any>

  // Metadata
  created_at: string
  updated_at: string
  created_by?: string
}

export interface OrganizationFormData {
  name: string
  code: string
  domain?: string
  logo_url?: string
  address?: string
  phone?: string
  email?: string
  school_level?: SchoolLevel
  npsn?: string
}

export interface OrganizationSettings {
  id: string
  organization_id: string

  // Feature flags
  enable_teaching_dashboard: boolean
  enable_student_dashboard: boolean
  enable_headmaster_dashboard: boolean

  // Customization
  primary_color: string
  secondary_color: string
  logo_url?: string

  // Academic settings
  current_academic_year_id?: string
  current_semester_id?: string

  // Notification settings
  notification_email?: string
  notification_enabled: boolean

  // Metadata
  created_at: string
  updated_at: string
}

export interface OrganizationStats {
  total_users: number
  total_students: number
  total_teachers: number
  total_classes: number
  storage_used_mb: number
  storage_percentage: number
}

export interface OrganizationResponse {
  success: boolean
  data?: Organization[]
  total?: number
  error?: string
}

export interface CreateOrganizationResponse {
  success: boolean
  data?: Organization
  error?: string
}

export interface UpdateOrganizationResponse {
  success: boolean
  data?: Organization
  error?: string
}

export interface DeleteOrganizationResponse {
  success: boolean
  error?: string
}
