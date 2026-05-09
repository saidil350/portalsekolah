'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import type {
  Class,
  ClassFormData,
  ClassFilters,
  ClassResponse,
  Enrollment,
  EnrollmentFormData,
  EnrollmentResponse,
  ClassSchedule,
  ClassScheduleFormData,
  ClassScheduleFilters,
  ClassScheduleResponse,
  ClassRosterView,
  ViewClassRosterComplete,
  DayOfWeek,
} from '@/types/class-roster'
import type { CreateResponse, UpdateResponse } from '@/types'
import type { User } from '@/types/user'
import { detectScheduleColumnMode, getScheduleColumns, getScheduleSelect } from '@/utils/supabase/schedule-columns'
import { detectProfilesHasIsActive } from '@/utils/supabase/profile-columns'

async function ensureTenantRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  id: string | null | undefined,
  organizationId: string
) {
  if (!id) return true

  const { data, error } = await supabase
    .from(table as any)
    .select('id')
    .eq('id', id)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (error) throw error

  return !!data
}

async function ensureTeacherRecord(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string | null | undefined,
  organizationId: string
) {
  if (!teacherId) return true

  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', teacherId)
    .eq('organization_id', organizationId)
    .eq('role', 'GURU')
    .maybeSingle()

  if (error) throw error

  return !!data
}

async function getHomeroomConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string | null | undefined,
  academicYearId: string | null | undefined,
  organizationId: string,
  excludeClassId?: string
) {
  if (!teacherId || !academicYearId) return null

  let query = supabase
    .from('classes')
    .select('id, name, code')
    .eq('organization_id', organizationId)
    .eq('academic_year_id', academicYearId)
    .eq('wali_kelas_id', teacherId)
    .eq('is_active', true)

  if (excludeClassId) {
    query = query.neq('id', excludeClassId)
  }

  const { data, error } = await query.limit(1).maybeSingle()

  if (error) throw error

  return data as { id: string; name?: string | null; code?: string | null } | null
}

async function ensureSubjectTeacherAuthority(
  supabase: Awaited<ReturnType<typeof createClient>>,
  subjectId: string | null | undefined,
  teacherId: string | null | undefined,
  organizationId: string
) {
  if (!subjectId || !teacherId) return false

  const { data, error } = await supabase
    .from('subject_teachers')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('subject_id', subjectId)
    .eq('teacher_id', teacherId)
    .maybeSingle()

  if (error) throw error

  return !!data
}

async function getScheduleAuthorityConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    organizationId: string
    dayOfWeek: number
    startTime: string
    endTime: string
    startColumn: string
    endColumn: string
    classId?: string | null
    teacherId?: string | null
    roomId?: string | null
    excludeScheduleId?: string
  }
) {
  let query = supabase
    .from('class_schedules')
    .select('id, class_id, teacher_id, room_id')
    .eq('organization_id', params.organizationId)
    .eq('day_of_week', params.dayOfWeek)
    .eq('is_active', true)
    .lt(params.startColumn, params.endTime)
    .gt(params.endColumn, params.startTime)

  if (params.excludeScheduleId) {
    query = query.neq('id', params.excludeScheduleId)
  }

  const { data, error } = await query

  if (error) throw error

  const schedules = data || []

  if (params.classId && schedules.some((schedule: any) => schedule.class_id === params.classId)) {
    return 'Jadwal bentrok dengan jadwal lain di kelas yang sama'
  }

  if (params.teacherId && schedules.some((schedule: any) => schedule.teacher_id === params.teacherId)) {
    return 'Guru sudah memiliki jadwal lain pada jam tersebut'
  }

  if (params.roomId && schedules.some((schedule: any) => schedule.room_id === params.roomId)) {
    return 'Ruangan sudah digunakan pada jam tersebut'
  }

  return null
}

// =====================================================
// CLASSES ACTIONS
// =====================================================

/**
 * Fetch classes with filters and pagination
 */
export async function fetchClasses(
  filters: ClassFilters = {}
): Promise<ClassResponse> {
  // Authorization check - only ADMIN_IT can fetch classes
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      data: [],
      total: 0,
    }
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('classes')
      .select(`
        *,
        class_level:class_levels(*),
        department:departments(*),
        academic_year:academic_years(*),
        semester:semesters(*),
        home_room:rooms(*),
        wali_kelas:profiles!classes_wali_kelas_id_fkey(id, full_name, email, role, nip)
      `, { count: 'exact' })
      .eq('organization_id', auth.user.organization_id)

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    // Apply academic year filter (primary filter)
    if (filters.academic_year_id) {
      query = query.eq('academic_year_id', filters.academic_year_id)
    }

    // Apply semester filter
    if (filters.semester_id) {
      query = query.eq('semester_id', filters.semester_id)
    }

    // Apply class level filter
    if (filters.class_level_id) {
      query = query.eq('class_level_id', filters.class_level_id)
    }

    // Apply department filter
    if (filters.department_id) {
      query = query.eq('department_id', filters.department_id)
    }

    // Apply active filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    // Calculate occupancy rate for each class
    const classesWithOccupancy = (data as unknown as Class[]).map((cls) => ({
      ...cls,
      occupancy_rate: cls.capacity > 0 ? Math.round((cls.current_enrollment / cls.capacity) * 100) : 0,
    }))

    return {
      success: true,
      data: classesWithOccupancy,
      total: count || 0,
    }
  } catch (error: any) {
    console.error('Error fetching classes:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data kelas',
    }
  }
}

/**
 * Create new class
 */
export async function createClass(formData: ClassFormData): Promise<CreateResponse<Class>> {
  // Authorization check - only ADMIN_IT can create classes
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  console.log('=== CREATE CLASS START ===')
  console.log('Form data received:', JSON.stringify(formData, null, 2))

  try {
    const supabase = await createClient()

    // Validation
    if (!formData.name.trim()) {
      console.log('Validation failed: Name is empty')
      return { success: false, error: 'Nama kelas wajib diisi' }
    }

    if (!formData.code.trim()) {
      console.log('Validation failed: Code is empty')
      return { success: false, error: 'Kode kelas wajib diisi' }
    }

    // Validasi WAJIB untuk struktur baru
    if (!formData.academic_year_id) {
      console.log('Validation failed: academic_year_id is required')
      return { success: false, error: 'Tahun ajaran wajib dipilih' }
    }

    if (!formData.class_level_id) {
      console.log('Validation failed: class_level_id is required')
      return { success: false, error: 'Tingkat kelas wajib dipilih' }
    }

    if (formData.capacity < 1 || formData.capacity > 40) {
      console.log('Validation failed: Invalid capacity')
      return { success: false, error: 'Kapasitas harus antara 1-40' }
    }

    console.log('Validation passed')

    // Check if code already exists
    console.log('Checking if code exists:', formData.code.trim())
    const { data: existingCode, error: checkError } = await supabase
      .from('classes')
      .select('id')
      .eq('organization_id', auth.user.organization_id)
      .eq('code', formData.code.trim())
      .maybeSingle()

    console.log('Existing code check result:', { existingCode, checkError })

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('Error checking existing code:', checkError)
      return { success: false, error: 'Gagal mengecek kode kelas: ' + checkError.message }
    }

    if (existingCode) {
      console.log('Code already exists')
      return { success: false, error: 'Kode kelas sudah terdaftar' }
    }

    const tenantChecks = [
      ['academic_years', formData.academic_year_id, 'Tahun ajaran tidak valid untuk sekolah ini'],
      ['class_levels', formData.class_level_id, 'Tingkat kelas tidak valid untuk sekolah ini'],
      ['semesters', formData.semester_id, 'Semester tidak valid untuk sekolah ini'],
      ['departments', formData.department_id, 'Jurusan tidak valid untuk sekolah ini'],
      ['rooms', formData.home_room_id, 'Ruangan tidak valid untuk sekolah ini'],
      ['profiles', formData.wali_kelas_id, 'Wali kelas tidak valid untuk sekolah ini'],
    ] as const

    for (const [table, recordId, message] of tenantChecks) {
      if (!(await ensureTenantRecord(supabase, table, recordId, auth.user.organization_id))) {
        return { success: false, error: message }
      }
    }

    if (formData.wali_kelas_id) {
      if (!(await ensureTeacherRecord(supabase, formData.wali_kelas_id, auth.user.organization_id))) {
        return { success: false, error: 'Wali kelas harus akun guru aktif di sekolah ini' }
      }

      const conflict = await getHomeroomConflict(
        supabase,
        formData.wali_kelas_id,
        formData.academic_year_id,
        auth.user.organization_id
      )

      if (conflict) {
        return {
          success: false,
          error: `Guru tersebut sudah menjadi wali kelas ${conflict.name || conflict.code || 'lain'} pada tahun ajaran ini`,
        }
      }
    }

    console.log('Preparing to insert class')
    const insertData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      academic_year_id: formData.academic_year_id, // WAJIB
      class_level_id: formData.class_level_id, // WAJIB
      semester_id: formData.semester_id || null, // Opsional
      department_id: formData.department_id || null, // Opsional
      home_room_id: formData.home_room_id || null,
      capacity: formData.capacity,
      wali_kelas_id: formData.wali_kelas_id || null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      description: formData.description || null,
      current_enrollment: 0,
      organization_id: auth.user.organization_id,
    }
    console.log('Insert data:', JSON.stringify(insertData, null, 2))

    const { data, error } = await supabase
      .from('classes')
      .insert(insertData)
      .select()
      .single()

    console.log('Insert result:', { data, error })

    if (error) {
      console.error('Database error during insert:', error)
      throw error
    }

    console.log('Insert successful, class created:', data)
    console.log('Revalidating paths...')

    revalidatePath('/dashboard/admin-it/data-management')
    revalidatePath('/dashboard/admin-it/kelas-dan-roster')

    console.log('=== CREATE CLASS SUCCESS ===')

    return {
      success: true,
      data: data as unknown as Class,
    }
  } catch (error: any) {
    console.error('=== CREATE CLASS ERROR ===')
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    })
    return {
      success: false,
      error: error.message || 'Gagal menambahkan kelas',
    }
  }
}

/**
 * Update existing class
 */
export async function updateClass(id: string, formData: Partial<ClassFormData>): Promise<UpdateResponse<Class>> {
  // Authorization check - only ADMIN_IT can update classes
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    const { data: existingClass, error: existingClassError } = await supabase
      .from('classes')
      .select('id, academic_year_id, wali_kelas_id')
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .maybeSingle()

    if (existingClassError) throw existingClassError

    if (!existingClass) {
      return { success: false, error: 'Kelas tidak ditemukan di sekolah ini' }
    }

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('classes')
        .select('id')
        .eq('organization_id', auth.user.organization_id)
        .eq('code', formData.code.trim())
        .neq('id', id)
        .maybeSingle()

      if (existingCode) {
        return { success: false, error: 'Kode kelas sudah terdaftar' }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.class_level_id !== undefined) updateData.class_level_id = formData.class_level_id || null
    if (formData.department_id !== undefined) updateData.department_id = formData.department_id || null
    if (formData.academic_year_id !== undefined) updateData.academic_year_id = formData.academic_year_id || null
    if (formData.home_room_id !== undefined) updateData.home_room_id = formData.home_room_id || null
    if (formData.capacity !== undefined) updateData.capacity = formData.capacity
    if (formData.wali_kelas_id !== undefined) updateData.wali_kelas_id = formData.wali_kelas_id || null
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.description !== undefined) updateData.description = formData.description || null

    const updateTenantChecks = [
      ['academic_years', formData.academic_year_id, 'Tahun ajaran tidak valid untuk sekolah ini'],
      ['class_levels', formData.class_level_id, 'Tingkat kelas tidak valid untuk sekolah ini'],
      ['semesters', formData.semester_id, 'Semester tidak valid untuk sekolah ini'],
      ['departments', formData.department_id, 'Jurusan tidak valid untuk sekolah ini'],
      ['rooms', formData.home_room_id, 'Ruangan tidak valid untuk sekolah ini'],
      ['profiles', formData.wali_kelas_id, 'Wali kelas tidak valid untuk sekolah ini'],
    ] as const

    for (const [table, recordId, message] of updateTenantChecks) {
      if (!(await ensureTenantRecord(supabase, table, recordId, auth.user.organization_id))) {
        return { success: false, error: message }
      }
    }

    const nextAcademicYearId =
      formData.academic_year_id !== undefined
        ? formData.academic_year_id || null
        : existingClass.academic_year_id
    const nextHomeroomTeacherId =
      formData.wali_kelas_id !== undefined
        ? formData.wali_kelas_id || null
        : existingClass.wali_kelas_id

    if (nextHomeroomTeacherId) {
      if (!(await ensureTeacherRecord(supabase, nextHomeroomTeacherId, auth.user.organization_id))) {
        return { success: false, error: 'Wali kelas harus akun guru aktif di sekolah ini' }
      }

      const conflict = await getHomeroomConflict(
        supabase,
        nextHomeroomTeacherId,
        nextAcademicYearId,
        auth.user.organization_id,
        id
      )

      if (conflict) {
        return {
          success: false,
          error: `Guru tersebut sudah menjadi wali kelas ${conflict.name || conflict.code || 'lain'} pada tahun ajaran ini`,
        }
      }
    }

    const { data, error } = await supabase
      .from('classes')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')
    revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${id}`)

    return {
      success: true,
      data: data as Class,
    }
  } catch (error: any) {
    console.error('Error updating class:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate kelas',
    }
  }
}

/**
 * Delete class
 */
export async function deleteClass(id: string): Promise<{ success: boolean; error?: string }> {
  // Authorization check - only ADMIN_IT can delete classes
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting class:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus kelas',
    }
  }
}

// =====================================================
// ENROLLMENTS ACTIONS
// =====================================================

/**
 * Fetch enrollments for a class
 */
export async function fetchEnrollments(classId: string): Promise<EnrollmentResponse> {
  // Authorization check - only ADMIN_IT can fetch enrollments
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      data: [],
      total: 0,
    }
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        *,
        student:profiles!enrollments_student_id_fkey(*)
      `)
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', classId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: true })

    if (error) throw error

    return {
      success: true,
      data: data as unknown as Enrollment[],
      total: data?.length || 0,
    }
  } catch (error: any) {
    console.error('Error fetching enrollments:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data enrollment',
    }
  }
}

/**
 * Fetch available students for enrollment
 */
export async function fetchAvailableStudents(
  classId: string,
  search?: string
): Promise<{ success: boolean; data?: User[]; error?: string }> {
  // Authorization check - only ADMIN_IT can fetch available students
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()
    const hasIsActive = await detectProfilesHasIsActive(supabase)

    // Get currently enrolled students
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', classId)
      .eq('status', 'ACTIVE')

    if (enrollmentsError) throw enrollmentsError

    const enrolledStudentIds = new Set<string>(
      enrollmentsData?.map((e: any) => e.student_id).filter(Boolean) || []
    )

    let query = supabase
      .from('profiles')
      .select('id, full_name, email, nisn, role')
      .eq('organization_id', auth.user.organization_id)
      .eq('role', 'SISWA')
      .order('full_name')

    if (hasIsActive) {
      query = query.eq('is_active', true)
    }

    if (search && search.trim() !== '') {
      query = query.or(`full_name.ilike.%${search}%,nisn.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query.limit(50)
    if (error) throw error

    const available = (data as unknown as User[]).filter(
      (student) => !enrolledStudentIds.has(student.id)
    )

    return { success: true, data: available }
  } catch (error: any) {
    console.error('Error fetching available students:', error)
    return { success: false, error: error.message || 'Gagal memuat data siswa' }
  }
}

/**
 * Enroll student to class
 */
export async function enrollStudent(
  classId: string,
  studentId: string,
  academicYearId?: string
): Promise<CreateResponse<Enrollment>> {
  // Authorization check - only ADMIN_IT can enroll students
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    if (!(await ensureTenantRecord(supabase, 'classes', classId, auth.user.organization_id))) {
      return { success: false, error: 'Kelas tidak valid untuk sekolah ini' }
    }

    if (!(await ensureTenantRecord(supabase, 'profiles', studentId, auth.user.organization_id))) {
      return { success: false, error: 'Siswa tidak valid untuk sekolah ini' }
    }

    if (!(await ensureTenantRecord(supabase, 'academic_years', academicYearId, auth.user.organization_id))) {
      return { success: false, error: 'Tahun ajaran tidak valid untuk sekolah ini' }
    }

    // Check if student is already enrolled
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', classId)
      .eq('student_id', studentId)
      .eq('status', 'ACTIVE')
      .single()

    if (existing) {
      return { success: false, error: 'Siswa sudah terdaftar di kelas ini' }
    }

    // Check class capacity
    const { data: classData } = await supabase
      .from('classes')
      .select('capacity, current_enrollment')
      .eq('id', classId)
      .eq('organization_id', auth.user.organization_id)
      .single()

    if (classData && classData.current_enrollment >= classData.capacity) {
      return { success: false, error: 'Kelas sudah penuh' }
    }

    // Enroll student
    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        class_id: classId,
        student_id: studentId,
        academic_year_id: academicYearId || null,
        status: 'ACTIVE',
        organization_id: auth.user.organization_id,
      })
      .select()
      .single()

    if (error) throw error

    // Note: Trigger 'trigger_update_class_enrollment' automatically handles enrollment count
    // No need for manual RPC call

    revalidatePath('/dashboard/admin-it/kelas-dan-roster')
    revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${classId}`)

    return {
      success: true,
      data: data as Enrollment,
    }
  } catch (error: any) {
    console.error('Error enrolling student:', error)
    return {
      success: false,
      error: error.message || 'Gagal mendaftarkan siswa',
    }
  }
}

/**
 * Withdraw student from class
 */
export async function withdrawStudent(enrollmentId: string): Promise<{ success: boolean; error?: string }> {
  // Authorization check - only ADMIN_IT can withdraw students
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Get enrollment details first for revalidation
    const { data: enrollment } = await supabase
      .from('enrollments')
      .select('class_id')
      .eq('id', enrollmentId)
      .eq('organization_id', auth.user.organization_id)
      .single()

    // Always delete the enrollment (instead of updating status)
    // This allows students to be re-enrolled without UNIQUE constraint issues
    const { error } = await supabase
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)
      .eq('organization_id', auth.user.organization_id)

    if (error) throw error

    // Note: Trigger 'trigger_update_class_enrollment' automatically handles enrollment count
    // No need for manual RPC call

    revalidatePath('/dashboard/admin-it/kelas-dan-roster')
    revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${enrollment?.class_id}`)

    return { success: true }
  } catch (error: any) {
    console.error('Error withdrawing student:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengeluarkan siswa',
    }
  }
}

/**
 * Bulk enroll students to class
 */
export async function bulkEnrollStudents(
  classId: string,
  studentIds: string[],
  academicYearId?: string
): Promise<{ success: boolean; enrolled: number; failed: number; error?: string }> {
  // Authorization check - only ADMIN_IT can bulk enroll students
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      enrolled: 0,
      failed: studentIds.length,
      error: auth.error
    }
  }

  try {
    let enrolled = 0
    let failed = 0

    for (const studentId of studentIds) {
      const result = await enrollStudent(classId, studentId, academicYearId)
      if (result.success) {
        enrolled++
      } else {
        failed++
      }
    }

    return {
      success: true,
      enrolled,
      failed,
    }
  } catch (error: any) {
    return {
      success: false,
      enrolled: 0,
      failed: studentIds.length,
      error: error.message || 'Gagal mendaftarkan siswa',
    }
  }
}

// =====================================================
// CLASS SCHEDULES ACTIONS
// =====================================================

/**
 * Fetch class schedules
 */
export async function fetchClassSchedules(
  filters: ClassScheduleFilters = {}
): Promise<ClassScheduleResponse> {
  // Authorization check - only ADMIN_IT can fetch class schedules
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      data: [],
    }
  }

  try {
    const supabase = await createClient()
    const scheduleMode = await detectScheduleColumnMode(supabase)
    const scheduleColumns = getScheduleColumns(scheduleMode)

    let query = supabase
      .from('class_schedules')
      .select(getScheduleSelect(scheduleMode, `
        class:classes(*),
        subject:subjects(*),
        teacher:profiles!class_schedules_teacher_id_fkey(*),
        room:rooms(*),
        academic_year:academic_years(*)
      `))
      .eq('organization_id', auth.user.organization_id)

    // Apply filters
    if (filters.class_id) {
      query = query.eq('class_id', filters.class_id)
    }
    if (filters.teacher_id) {
      query = query.eq('teacher_id', filters.teacher_id)
    }
    if (filters.subject_id) {
      query = query.eq('subject_id', filters.subject_id)
    }
    if (filters.room_id) {
      query = query.eq('room_id', filters.room_id)
    }
    if (filters.day_of_week) {
      query = query.eq('day_of_week', filters.day_of_week)
    }
    if (filters.academic_year_id) {
      query = query.eq('academic_year_id', filters.academic_year_id)
    }
    if (filters.semester) {
      query = query.eq('semester', filters.semester)
    }
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const { data, error } = await query.order('day_of_week').order(scheduleColumns.start)

    if (error) throw error

    // Add computed fields
    const schedulesWithExtras = (data as unknown as ClassSchedule[]).map((schedule) => ({
      ...schedule,
      day_name: getDayName(schedule.day_of_week),
      time_range: formatTimeRange(schedule.start_time, schedule.end_time),
    }))

    return {
      success: true,
      data: schedulesWithExtras,
    }
  } catch (error: any) {
    console.error('Error fetching class schedules:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat jadwal kelas',
    }
  }
}

/**
 * Create class schedule
 */
export async function createClassSchedule(formData: ClassScheduleFormData): Promise<CreateResponse<ClassSchedule>> {
  // Authorization check - only ADMIN_IT can create class schedules
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()
    const scheduleMode = await detectScheduleColumnMode(supabase)
    const scheduleColumns = getScheduleColumns(scheduleMode)

    // Validation
    if (!formData.class_id) {
      return { success: false, error: 'Kelas wajib dipilih' }
    }
    if (!formData.subject_id) {
      return { success: false, error: 'Mata pelajaran wajib dipilih' }
    }
    if (!formData.teacher_id) {
      return { success: false, error: 'Guru wajib dipilih' }
    }
    if (!formData.start_time || !formData.end_time) {
      return { success: false, error: 'Waktu mulai dan selesai wajib diisi' }
    }

    const scheduleTenantChecks = [
      ['classes', formData.class_id, 'Kelas tidak valid untuk sekolah ini'],
      ['subjects', formData.subject_id, 'Mata pelajaran tidak valid untuk sekolah ini'],
      ['profiles', formData.teacher_id, 'Guru tidak valid untuk sekolah ini'],
      ['rooms', formData.room_id, 'Ruangan tidak valid untuk sekolah ini'],
      ['academic_years', formData.academic_year_id, 'Tahun ajaran tidak valid untuk sekolah ini'],
    ] as const

    for (const [table, recordId, message] of scheduleTenantChecks) {
      if (!(await ensureTenantRecord(supabase, table, recordId, auth.user.organization_id))) {
        return { success: false, error: message }
      }
    }

    if (!(await ensureTeacherRecord(supabase, formData.teacher_id, auth.user.organization_id))) {
      return { success: false, error: 'Guru harus akun guru aktif di sekolah ini' }
    }

    if (!(await ensureSubjectTeacherAuthority(supabase, formData.subject_id, formData.teacher_id, auth.user.organization_id))) {
      return {
        success: false,
        error: 'Guru belum memiliki otoritas untuk mata pelajaran ini. Atur guru pengampu di Kelola Data Sekolah terlebih dahulu.',
      }
    }

    const scheduleConflict = await getScheduleAuthorityConflict(supabase, {
      organizationId: auth.user.organization_id,
      dayOfWeek: formData.day_of_week,
      startTime: formData.start_time,
      endTime: formData.end_time,
      startColumn: scheduleColumns.start,
      endColumn: scheduleColumns.end,
      classId: formData.class_id,
      teacherId: formData.teacher_id,
      roomId: formData.room_id || null,
    })

    if (scheduleConflict) {
      return { success: false, error: scheduleConflict }
    }

    const insertData: any = {
      class_id: formData.class_id,
      subject_id: formData.subject_id,
      teacher_id: formData.teacher_id,
      room_id: formData.room_id || null,
      day_of_week: formData.day_of_week,
      academic_year_id: formData.academic_year_id || null,
      semester: formData.semester || null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
      notes: formData.notes || null,
      organization_id: auth.user.organization_id,
    }

    insertData[scheduleColumns.start] = formData.start_time
    insertData[scheduleColumns.end] = formData.end_time

    const { data, error } = await supabase
      .from('class_schedules')
      .insert(insertData)
      .select(getScheduleSelect(scheduleMode, ''))
      .single()

    if (error) {
      // Check for overlap constraint violation
      if (error.message.includes('overlap')) {
        return { success: false, error: 'Jadwal bentrok dengan jadwal lain di kelas yang sama' }
      }
      throw error
    }

    revalidatePath('/dashboard/admin-it/kelas-dan-roster')
    revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${formData.class_id}`)

    return {
      success: true,
      data: data as unknown as ClassSchedule,
    }
  } catch (error: any) {
    console.error('Error creating class schedule:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan jadwal',
    }
  }
}

/**
 * Update class schedule
 */
export async function updateClassSchedule(
  id: string,
  formData: Partial<ClassScheduleFormData>
): Promise<UpdateResponse<ClassSchedule>> {
  // Authorization check - only ADMIN_IT can update class schedules
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()
    const scheduleMode = await detectScheduleColumnMode(supabase)
    const scheduleColumns = getScheduleColumns(scheduleMode)

    const { data: existingScheduleData, error: existingScheduleError } = await supabase
      .from('class_schedules')
      .select(getScheduleSelect(scheduleMode, ''))
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .maybeSingle()

    if (existingScheduleError) throw existingScheduleError

    if (!existingScheduleData) {
      return { success: false, error: 'Jadwal tidak ditemukan di sekolah ini' }
    }

    const existingSchedule = existingScheduleData as unknown as ClassSchedule

    const updateData: any = {}
    if (formData.class_id) updateData.class_id = formData.class_id
    if (formData.subject_id) updateData.subject_id = formData.subject_id
    if (formData.teacher_id) updateData.teacher_id = formData.teacher_id
    if (formData.room_id !== undefined) updateData.room_id = formData.room_id || null
    if (formData.day_of_week) updateData.day_of_week = formData.day_of_week
    if (formData.start_time) updateData[scheduleColumns.start] = formData.start_time
    if (formData.end_time) updateData[scheduleColumns.end] = formData.end_time
    if (formData.academic_year_id !== undefined) updateData.academic_year_id = formData.academic_year_id || null
    if (formData.semester !== undefined) updateData.semester = formData.semester || null
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.notes !== undefined) updateData.notes = formData.notes || null

    const updateScheduleTenantChecks = [
      ['classes', formData.class_id, 'Kelas tidak valid untuk sekolah ini'],
      ['subjects', formData.subject_id, 'Mata pelajaran tidak valid untuk sekolah ini'],
      ['profiles', formData.teacher_id, 'Guru tidak valid untuk sekolah ini'],
      ['rooms', formData.room_id, 'Ruangan tidak valid untuk sekolah ini'],
      ['academic_years', formData.academic_year_id, 'Tahun ajaran tidak valid untuk sekolah ini'],
    ] as const

    for (const [table, recordId, message] of updateScheduleTenantChecks) {
      if (!(await ensureTenantRecord(supabase, table, recordId, auth.user.organization_id))) {
        return { success: false, error: message }
      }
    }

    const nextSubjectId = formData.subject_id || existingSchedule.subject_id
    const nextTeacherId = formData.teacher_id || existingSchedule.teacher_id
    const nextClassId = formData.class_id || existingSchedule.class_id
    const nextRoomId = formData.room_id !== undefined ? formData.room_id || null : existingSchedule.room_id
    const nextDayOfWeek = formData.day_of_week || existingSchedule.day_of_week
    const nextStartTime = formData.start_time || existingSchedule.start_time
    const nextEndTime = formData.end_time || existingSchedule.end_time

    if (!(await ensureTeacherRecord(supabase, nextTeacherId, auth.user.organization_id))) {
      return { success: false, error: 'Guru harus akun guru aktif di sekolah ini' }
    }

    if (!(await ensureSubjectTeacherAuthority(supabase, nextSubjectId, nextTeacherId, auth.user.organization_id))) {
      return {
        success: false,
        error: 'Guru belum memiliki otoritas untuk mata pelajaran ini. Atur guru pengampu di Kelola Data Sekolah terlebih dahulu.',
      }
    }

    const scheduleConflict = await getScheduleAuthorityConflict(supabase, {
      organizationId: auth.user.organization_id,
      dayOfWeek: nextDayOfWeek,
      startTime: nextStartTime,
      endTime: nextEndTime,
      startColumn: scheduleColumns.start,
      endColumn: scheduleColumns.end,
      classId: nextClassId,
      teacherId: nextTeacherId,
      roomId: nextRoomId,
      excludeScheduleId: id,
    })

    if (scheduleConflict) {
      return { success: false, error: scheduleConflict }
    }

    const { data, error } = await supabase
      .from('class_schedules')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .select(getScheduleSelect(scheduleMode, ''))
      .single()

    if (error) {
      if (error.message.includes('overlap')) {
        return { success: false, error: 'Jadwal bentrok dengan jadwal lain di kelas yang sama' }
      }
      throw error
    }

    revalidatePath('/dashboard/admin-it/kelas-dan-roster')
    revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${formData.class_id || existingSchedule.class_id}`)

    return {
      success: true,
      data: data as unknown as ClassSchedule,
    }
  } catch (error: any) {
    console.error('Error updating class schedule:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate jadwal',
    }
  }
}

/**
 * Delete class schedule
 */
export async function deleteClassSchedule(
  id: string
): Promise<{ success: boolean; error?: string; class_id?: string }> {
  // Authorization check - only ADMIN_IT can delete class schedules
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Get schedule details first
    const { data: schedule } = await supabase
      .from('class_schedules')
      .select('class_id')
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .single()

    const { error } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/kelas-dan-roster')
    if (schedule?.class_id) {
      revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${schedule.class_id}`)
    }

    return { success: true, class_id: schedule?.class_id }
  } catch (error: any) {
    console.error('Error deleting class schedule:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus jadwal',
    }
  }
}

// =====================================================
// CLASS ROSTER VIEW (Combined)
// =====================================================

/**
 * Fetch complete class roster view
 */
export async function fetchClassRosterView(classId: string): Promise<{
  success: boolean;
  data?: ClassRosterView;
  error?: string;
}> {
  // Authorization check - only ADMIN_IT can fetch class roster view
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()
    const scheduleMode = await detectScheduleColumnMode(supabase)
    const scheduleColumns = getScheduleColumns(scheduleMode)

    // Fetch class info
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select(`
        *,
        class_level:class_levels(*),
        department:departments(*),
        academic_year:academic_years(*),
        home_room:rooms(*),
        wali_kelas:profiles!classes_wali_kelas_id_fkey(*)
      `)
      .eq('id', classId)
      .eq('organization_id', auth.user.organization_id)
      .single()

    if (classError) throw classError

    // Fetch enrolled students
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('id, student_id, status, student:profiles!enrollments_student_id_fkey(*)')
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', classId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: true })

    if (enrollmentsError) throw enrollmentsError

    const students = enrollmentsData?.map((e: any) => ({
      ...e.student,
      id: e.student?.id || e.student_id,
      full_name: e.student?.full_name || null,
      enrollment_id: e.id,
      enrollment_status: e.status,
    })) || []

    // Fetch schedules
    const { data: schedulesData, error: schedulesError } = await supabase
      .from('class_schedules')
      .select(getScheduleSelect(scheduleMode, `
        subject:subjects(*),
        teacher:profiles!class_schedules_teacher_id_fkey(*),
        room:rooms(*)
      `))
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', classId)
      .eq('is_active', true)
      .order('day_of_week')
      .order(scheduleColumns.start)

    if (schedulesError) throw schedulesError

    // Get unique teachers
    const uniqueTeachers = Array.from(
      new Map(schedulesData?.map((s: any) => [s.teacher.id, s.teacher] as [string, any]).filter(Boolean) || [])
    ).map(([_, teacher]) => teacher)

    // Get unique subjects
    const uniqueSubjects = Array.from(
      new Map(schedulesData?.map((s: any) => [s.subject.id, s.subject] as [string, any]).filter(Boolean) || [])
    ).map(([_, subject]) => subject)

    // Calculate statistics
    const totalHoursPerWeek = schedulesData?.reduce((sum: number, s: any) => {
      const start = new Date(`2000-01-01T${s.start_time}`)
      const end = new Date(`2000-01-01T${s.end_time}`)
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    }, 0) || 0

    const statistics = {
      total_students: students.length,
      total_teachers: uniqueTeachers.length,
      total_subjects: uniqueSubjects.length,
      total_hours_per_week: Math.round(totalHoursPerWeek),
      occupancy_rate: classData ? (classData.current_enrollment / classData.capacity) * 100 : 0,
    }

    return {
      success: true,
      data: {
        class_info: classData as unknown as Class,
        students: students as unknown as User[],
        schedules: schedulesData as unknown as ClassSchedule[],
        teachers: uniqueTeachers as unknown as User[],
        subjects: uniqueSubjects,
        statistics,
      },
    }
  } catch (error: any) {
    console.error('Error fetching class roster view:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data roster kelas',
    }
  }
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

/**
 * Check schedule availability for teacher and room
 */
export async function checkScheduleAvailability(
  dayOfWeek: number,
  startTime: string,
  endTime: string,
  excludeScheduleId?: string
): Promise<{
  success: boolean;
  available_teachers: Array<{ id: string; full_name: string; reason?: string }>
  available_rooms: Array<{ id: string; name: string; reason?: string }>
  error?: string
}> {
  // Authorization check - only ADMIN_IT can check schedule availability
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      available_teachers: [],
      available_rooms: [],
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()
    const scheduleMode = await detectScheduleColumnMode(supabase)
    const scheduleColumns = getScheduleColumns(scheduleMode)

    // Get all teachers
    const { data: teachers } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', auth.user.organization_id)
      .eq('role', 'GURU')

    // Get all rooms
    const { data: rooms } = await supabase
      .from('rooms')
      .select('id, name')
      .eq('organization_id', auth.user.organization_id)
      .eq('is_active', true)

    // Get existing schedules for this day/time (check for overlapping time ranges)
    let schedulesQuery = supabase
      .from('class_schedules')
      .select('teacher_id, room_id')
      .eq('organization_id', auth.user.organization_id)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true)
      .lt(scheduleColumns.start, endTime)
      .gt(scheduleColumns.end, startTime)

    if (excludeScheduleId) {
      schedulesQuery = schedulesQuery.neq('id', excludeScheduleId)
    }

    const { data: existingSchedules } = await schedulesQuery

    // Build sets of unavailable teachers and rooms
    const unavailableTeacherIds = new Set(
      existingSchedules?.map((s) => s.teacher_id).filter(Boolean) || []
    )
    const unavailableRoomIds = new Set(existingSchedules?.map((s) => s.room_id).filter(Boolean) || [])

    // Mark teachers and rooms as available/unavailable
    const availableTeachers = (teachers || []).map((teacher: any) => ({
      id: teacher.id,
      full_name: teacher.full_name,
      available: !unavailableTeacherIds.has(teacher.id),
      reason: unavailableTeacherIds.has(teacher.id) ? 'Sedang mengajar di jam ini' : undefined,
    }))

    const availableRooms = (rooms || []).map((room: any) => ({
      id: room.id,
      name: room.name,
      available: !unavailableRoomIds.has(room.id),
      reason: unavailableRoomIds.has(room.id) ? 'Ruang digunakan di jam ini' : undefined,
    }))

    return {
      success: true,
      available_teachers: availableTeachers,
      available_rooms: availableRooms,
    }
  } catch (error: any) {
    console.error('Error checking schedule availability:', error)
    return {
      success: false,
      available_teachers: [],
      available_rooms: [],
      error: error.message || 'Gagal mengecek ketersediaan jadwal',
    }
  }
}

// =====================================================
// DROPDOWN DATA ACTIONS
// =====================================================

/**
 * Fetch dropdown data for create/edit class form
 */
export async function fetchClassDropdownData() {
  // Authorization check - only ADMIN_IT can fetch class dropdown data
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      classLevels: [],
      departments: [],
      rooms: [],
      teachers: [],
      academicYears: []
    }
  }

  try {
    const supabase = await createClient()

    // Fetch class levels
    const { data: levelsData, error: levelsError } = await supabase
      .from('class_levels')
      .select('id, name, code')
      .eq('organization_id', auth.user.organization_id)
      .eq('is_active', true)
      .order('level_order')

    if (levelsError) throw levelsError

    // Fetch departments
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('organization_id', auth.user.organization_id)
      .eq('is_active', true)
      .order('name')

    if (deptError) throw deptError

    // Fetch rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, code')
      .eq('organization_id', auth.user.organization_id)
      .eq('is_active', true)
      .order('name')

    if (roomsError) throw roomsError

    // Fetch teachers (guru)
    const { data: teachersData, error: teachersError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', auth.user.organization_id)
      .eq('role', 'GURU')
      .order('full_name')

    if (teachersError) throw teachersError

    // Fetch academic years
    const { data: yearsData, error: yearsError } = await supabase
      .from('academic_years')
      .select('id, name, is_active')
      .eq('organization_id', auth.user.organization_id)
      .order('start_date', { ascending: false })

    if (yearsError) throw yearsError

    return {
      success: true,
      classLevels: levelsData || [],
      departments: deptData || [],
      rooms: roomsData || [],
      teachers: teachersData || [],
      academicYears: yearsData || []
    }
  } catch (error: any) {
    console.error('Error fetching dropdown data:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data dropdown',
      classLevels: [],
      departments: [],
      rooms: [],
      teachers: [],
      academicYears: []
    }
  }
}

// Helper functions
function getDayName(dayOfWeek: number): string {
  const days = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
  return days[dayOfWeek] || ''
}

function formatTimeRange(startTime: string, endTime: string): string {
  return `${startTime} - ${endTime}`
}

// =====================================================
// DROPDOWN FILTER DATA
// =====================================================

/**
 * Fetch dropdown data for filters (class levels and departments)
 * This is a server action that can be called from client components
 */
export async function fetchFilterDropdownData() {
  // Authorization check - only ADMIN_IT can fetch filter dropdown data
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      classLevels: [],
      departments: []
    }
  }

  try {
    const supabase = await createClient()

    // Fetch class levels
    const { data: levelsData, error: levelsError } = await supabase
      .from('class_levels')
      .select('id, name, code')
      .eq('organization_id', auth.user.organization_id)
      .eq('is_active', true)
      .order('level_order')

    if (levelsError) throw levelsError

    // Fetch departments
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id, name, code')
      .eq('organization_id', auth.user.organization_id)
      .eq('is_active', true)
      .order('name')

    if (deptError) throw deptError

    return {
      success: true,
      classLevels: levelsData || [],
      departments: deptData || []
    }
  } catch (error: any) {
    console.error('Error fetching filter dropdown data:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data filter',
      classLevels: [],
      departments: []
    }
  }
}
