'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Room,
  RoomFormData,
  Subject,
  SubjectFormData,
  DataManagementFilters,
  DataManagementResponse,
  CreateResponse,
  UpdateResponse,
  DeleteResponse,
  AcademicYear,
  ClassLevel,
  ClassLevelFormData,
  Department,
  DepartmentFormData,
  Semester,
  SemesterFormData,
  SubjectTeacher,
  SubjectTeachersResponse,
  TeacherRank,
  TeacherRankCode
} from '@/types'

// =====================================================
// ROOMS ACTIONS
// =====================================================

/**
 * Fetch rooms with filters and pagination
 */
export async function fetchRooms(
  filters: DataManagementFilters & { page?: number; limit?: number }
): Promise<DataManagementResponse<Room>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('rooms')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply room type filter
    if (filters.room_type) {
      query = query.eq('room_type', filters.room_type)
    }

    // Apply active filter
    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as Room[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching rooms:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data ruangan'
    }
  }
}

/**
 * Create new room
 */
export async function createRoom(
  formData: RoomFormData
): Promise<CreateResponse<Room>> {
  try {
    const supabase = await createClient()

    // Validation
    if (!formData.name.trim()) {
      return { success: false, error: 'Nama ruangan wajib diisi' }
    }

    if (!formData.code.trim()) {
      return { success: false, error: 'Kode ruangan wajib diisi' }
    }

    if (formData.capacity < 1) {
      return { success: false, error: 'Kapasitas harus minimal 1' }
    }

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from('rooms')
      .select('id')
      .eq('code', formData.code.trim())
      .single()

    if (existingCode) {
      return { success: false, error: 'Kode ruangan sudah terdaftar' }
    }

    const { data, error } = await supabase
      .from('rooms')
      .insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        room_type: formData.room_type,
        capacity: formData.capacity,
        floor: formData.floor || 1,
        building: formData.building || null,
        facilities: formData.facilities || null,
        description: formData.description || null,
        is_active: formData.is_active
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Room
    }
  } catch (error: any) {
    console.error('Error creating room:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan ruangan'
    }
  }
}

/**
 * Update existing room
 */
export async function updateRoom(
  id: string,
  formData: Partial<RoomFormData>
): Promise<UpdateResponse<Room>> {
  try {
    const supabase = await createClient()

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('rooms')
        .select('id')
        .eq('code', formData.code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return { success: false, error: 'Kode ruangan sudah terdaftar' }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.room_type) updateData.room_type = formData.room_type
    if (formData.capacity !== undefined) updateData.capacity = formData.capacity
    if (formData.floor !== undefined) updateData.floor = formData.floor
    if (formData.building !== undefined) updateData.building = formData.building || null
    if (formData.facilities !== undefined) updateData.facilities = formData.facilities || null
    if (formData.description !== undefined) updateData.description = formData.description || null
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active

    const { data, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Room
    }
  } catch (error: any) {
    console.error('Error updating room:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate ruangan'
    }
  }
}

/**
 * Delete room
 */
export async function deleteRoom(id: string): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting room:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus ruangan'
    }
  }
}

// =====================================================
// SUBJECTS ACTIONS
// =====================================================

/**
 * Fetch subjects with filters and pagination
 */
export async function fetchSubjects(
  filters: DataManagementFilters & { page?: number; limit?: number }
): Promise<DataManagementResponse<Subject>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('subjects')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    // Apply subject type filter
    if (filters.subject_type) {
      query = query.eq('subject_type', filters.subject_type)
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
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as Subject[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching subjects:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data mata pelajaran'
    }
  }
}

/**
 * Create new subject
 */
export async function createSubject(
  formData: SubjectFormData
): Promise<CreateResponse<Subject>> {
  try {
    const supabase = await createClient()

    // Validation
    if (!formData.name.trim()) {
      return { success: false, error: 'Nama mata pelajaran wajib diisi' }
    }

    if (!formData.code.trim()) {
      return { success: false, error: 'Kode mata pelajaran wajib diisi' }
    }

    if (formData.credit_hours < 1 || formData.credit_hours > 6) {
      return { success: false, error: 'Beban SKS harus antara 1-6' }
    }

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from('subjects')
      .select('id')
      .eq('code', formData.code.trim())
      .single()

    if (existingCode) {
      return { success: false, error: 'Kode mata pelajaran sudah terdaftar' }
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        subject_type: formData.subject_type,
        credit_hours: formData.credit_hours,
        department_id: formData.department_id || null,
        academic_year_id: formData.academic_year_id || null,
        description: formData.description || null,
        prerequisites: formData.prerequisites || null,
        is_active: formData.is_active
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Subject
    }
  } catch (error: any) {
    console.error('Error creating subject:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan mata pelajaran'
    }
  }
}

/**
 * Update existing subject
 */
export async function updateSubject(
  id: string,
  formData: Partial<SubjectFormData>
): Promise<UpdateResponse<Subject>> {
  try {
    const supabase = await createClient()

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('subjects')
        .select('id')
        .eq('code', formData.code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return { success: false, error: 'Kode mata pelajaran sudah terdaftar' }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.subject_type) updateData.subject_type = formData.subject_type
    if (formData.credit_hours !== undefined) updateData.credit_hours = formData.credit_hours
    if (formData.department_id !== undefined) updateData.department_id = formData.department_id || null
    if (formData.academic_year_id !== undefined) updateData.academic_year_id = formData.academic_year_id || null
    if (formData.description !== undefined) updateData.description = formData.description || null
    if (formData.prerequisites !== undefined) updateData.prerequisites = formData.prerequisites || null
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active

    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Subject
    }
  } catch (error: any) {
    console.error('Error updating subject:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate mata pelajaran'
    }
  }
}

/**
 * Delete subject
 */
export async function deleteSubject(id: string): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting subject:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus mata pelajaran'
    }
  }
}

// =====================================================
// DROPDOWN DATA ACTIONS
// =====================================================

interface DepartmentDropdownData {
  id: string
  name: string
}

interface DropdownDataResponse {
  success: boolean
  departments?: DepartmentDropdownData[]
  academicYears?: AcademicYear[]
  error?: string
}

/**
 * Fetch dropdown data for subject modal (departments and academic years)
 */
export async function fetchSubjectDropdownData(): Promise<DropdownDataResponse> {
  try {
    const supabase = await createClient()

    // Fetch departments
    const { data: deptData, error: deptError } = await supabase
      .from('departments')
      .select('id, name')
      .eq('is_active', true)
      .order('name')

    if (deptError) throw deptError

    // Fetch academic years
    const { data: yearData, error: yearError } = await supabase
      .from('academic_years')
      .select('id, name')
      .order('name', { ascending: false })

    if (yearError) throw yearError

    return {
      success: true,
      departments: (deptData as Department[]) || [],
      academicYears: (yearData as AcademicYear[]) || []
    }
  } catch (error: any) {
    console.error('Error fetching dropdown data:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data dropdown'
    }
  }
}

// =====================================================
// MASTER DATA ACTIONS - Academic Years, Semesters, Class Levels, Departments
// =====================================================

export interface AcademicYearFormData {
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  description?: string
}

// =====================================================
// ACADEMIC YEARS ACTIONS
// =====================================================

export async function fetchAcademicYears(
  filters: DataManagementFilters & { page?: number; limit?: number }
): Promise<DataManagementResponse<AcademicYear>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('academic_years')
      .select('*', { count: 'exact' })

    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('start_date', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as AcademicYear[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching academic years:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data tahun ajaran'
    }
  }
}

export async function createAcademicYear(formData: AcademicYearFormData): Promise<CreateResponse<AcademicYear>> {
  try {
    const supabase = await createClient()

    if (!formData.name.trim()) {
      return { success: false, error: 'Nama tahun ajaran wajib diisi' }
    }

    if (!formData.start_date || !formData.end_date) {
      return { success: false, error: 'Tanggal mulai dan selesai wajib diisi' }
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      return { success: false, error: 'Tanggal selesai harus setelah tanggal mulai' }
    }

    // Validate format
    if (!/^\d{4}\/\d{4}$/.test(formData.name.trim())) {
      return { success: false, error: 'Format nama harus YYYY/YYYY (contoh: 2024/2025)' }
    }

    const { data, error } = await supabase
      .from('academic_years')
      .insert({
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        description: formData.description || null
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as AcademicYear
    }
  } catch (error: any) {
    console.error('Error creating academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan tahun ajaran'
    }
  }
}

export async function updateAcademicYear(id: string, formData: Partial<AcademicYearFormData>): Promise<UpdateResponse<AcademicYear>> {
  try {
    const supabase = await createClient()

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.start_date) updateData.start_date = formData.start_date
    if (formData.end_date) updateData.end_date = formData.end_date
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.description !== undefined) updateData.description = formData.description || null

    const { data, error } = await supabase
      .from('academic_years')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as AcademicYear
    }
  } catch (error: any) {
    console.error('Error updating academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate tahun ajaran'
    }
  }
}

export async function deleteAcademicYear(id: string): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus tahun ajaran'
    }
  }
}

// =====================================================
// SEMESTERS ACTIONS
// =====================================================

export async function fetchSemesters(
  filters: DataManagementFilters & { academic_year_id?: string; page?: number; limit?: number }
): Promise<DataManagementResponse<Semester>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('semesters')
      .select(`
        *,
        academic_year:academic_years(id, name)
      `, { count: 'exact' })

    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%`)
    }

    if (filters.academic_year_id) {
      query = query.eq('academic_year_id', filters.academic_year_id)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('semester_number', { ascending: true })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as Semester[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching semesters:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data semester'
    }
  }
}

export async function createSemester(formData: SemesterFormData): Promise<CreateResponse<Semester>> {
  try {
    const supabase = await createClient()

    if (!formData.academic_year_id) {
      return { success: false, error: 'Tahun ajaran wajib dipilih' }
    }

    if (!formData.name.trim()) {
      return { success: false, error: 'Nama semester wajib diisi' }
    }

    if (!formData.start_date || !formData.end_date) {
      return { success: false, error: 'Tanggal mulai dan selesai wajib diisi' }
    }

    const { data, error } = await supabase
      .from('semesters')
      .insert({
        academic_year_id: formData.academic_year_id,
        name: formData.name.trim(),
        semester_number: formData.semester_number,
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Semester
    }
  } catch (error: any) {
    console.error('Error creating semester:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan semester'
    }
  }
}

export async function updateSemester(id: string, formData: Partial<SemesterFormData>): Promise<UpdateResponse<Semester>> {
  try {
    const supabase = await createClient()

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.semester_number) updateData.semester_number = formData.semester_number
    if (formData.start_date) updateData.start_date = formData.start_date
    if (formData.end_date) updateData.end_date = formData.end_date
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active

    const { data, error } = await supabase
      .from('semesters')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Semester
    }
  } catch (error: any) {
    console.error('Error updating semester:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate semester'
    }
  }
}

export async function deleteSemester(id: string): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('semesters')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting semester:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus semester'
    }
  }
}

// =====================================================
// CLASS LEVELS ACTIONS
// =====================================================

export async function fetchClassLevels(
  filters: DataManagementFilters & { page?: number; limit?: number }
): Promise<DataManagementResponse<ClassLevel>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('class_levels')
      .select('*', { count: 'exact' })

    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('level', { ascending: true })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as ClassLevel[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching class levels:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data tingkat kelas'
    }
  }
}

export async function createClassLevel(formData: ClassLevelFormData): Promise<CreateResponse<ClassLevel>> {
  try {
    const supabase = await createClient()

    if (!formData.name.trim()) {
      return { success: false, error: 'Nama tingkat kelas wajib diisi' }
    }

    if (!formData.code.trim()) {
      return { success: false, error: 'Kode tingkat kelas wajib diisi' }
    }

    if (formData.level_order < 10 || formData.level_order > 12) {
      return { success: false, error: 'Level harus antara 10-12' }
    }

    const { data, error } = await supabase
      .from('class_levels')
      .insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        level_order: formData.level_order,
        description: formData.description || null,
        is_active: formData.is_active
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as ClassLevel
    }
  } catch (error: any) {
    console.error('Error creating class level:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan tingkat kelas'
    }
  }
}

export async function updateClassLevel(id: string, formData: Partial<ClassLevelFormData>): Promise<UpdateResponse<ClassLevel>> {
  try {
    const supabase = await createClient()

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.level_order) updateData.level_order = formData.level_order
    if (formData.description !== undefined) updateData.description = formData.description || null
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active

    const { data, error } = await supabase
      .from('class_levels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as ClassLevel
    }
  } catch (error: any) {
    console.error('Error updating class level:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate tingkat kelas'
    }
  }
}

export async function deleteClassLevel(id: string): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('class_levels')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting class level:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus tingkat kelas'
    }
  }
}

// =====================================================
// DEPARTMENTS ACTIONS
// =====================================================

export async function fetchDepartments(
  filters: DataManagementFilters & { page?: number; limit?: number }
): Promise<DataManagementResponse<Department>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('departments')
      .select('*', { count: 'exact' })

    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
    }

    if (filters.is_active !== undefined) {
      query = query.eq('is_active', filters.is_active)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as Department[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching departments:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data jurusan'
    }
  }
}

export async function createDepartment(formData: DepartmentFormData): Promise<CreateResponse<Department>> {
  try {
    const supabase = await createClient()

    if (!formData.name.trim()) {
      return { success: false, error: 'Nama jurusan wajib diisi' }
    }

    if (!formData.code.trim()) {
      return { success: false, error: 'Kode jurusan wajib diisi' }
    }

    if (!/^[A-Z]+$/.test(formData.code.trim())) {
      return { success: false, error: 'Kode hanya boleh huruf kapital' }
    }

    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description || null,
        is_active: formData.is_active
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Department
    }
  } catch (error: any) {
    console.error('Error creating department:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan jurusan'
    }
  }
}

export async function updateDepartment(id: string, formData: Partial<DepartmentFormData>): Promise<UpdateResponse<Department>> {
  try {
    const supabase = await createClient()

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.description !== undefined) updateData.description = formData.description || null
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active

    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as Department
    }
  } catch (error: any) {
    console.error('Error updating department:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate jurusan'
    }
  }
}

export async function deleteDepartment(id: string): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting department:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus jurusan'
    }
  }
}

// =====================================================
// SUBJECT TEACHERS ACTIONS
// =====================================================

/**
 * Fetch all teachers assigned to a subject
 */
export async function fetchSubjectTeachers(subjectId: string): Promise<SubjectTeachersResponse> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subject_teachers')
      .select(`
        *,
        teacher:profiles!subject_teachers_teacher_id_fkey(
          id,
          full_name,
          email,
          nip
        ),
        teacher_rank:teacher_ranks(*)
      `)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Sort by teacher rank level (highest first)
    const sortedData = (data as SubjectTeacher[])
      .sort((a, b) => {
        const levelA = a.teacher_rank?.level_order || 0;
        const levelB = b.teacher_rank?.level_order || 0;
        return levelB - levelA; // Descending order (UTAMA first)
      });

    return {
      success: true,
      data: sortedData || []
    }
  } catch (error: any) {
    console.error('Error fetching subject teachers:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data guru pengajar'
    }
  }
}

/**
 * Fetch all teachers (for dropdown)
 */
export async function fetchTeachersForDropdown(): Promise<any> {
  try {
    const supabase = await createClient()

    // NOTE: is_active filter removed temporarily - add it back after running migration 006
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, nip')
      .eq('role', 'GURU')
      .order('full_name', { ascending: true })

    if (error) throw error

    return {
      success: true,
      teachers: data || []
    }
  } catch (error: any) {
    console.error('Error fetching teachers:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data guru'
    }
  }
}

/**
 * Fetch all teacher ranks
 */
export async function fetchTeacherRanks(): Promise<any> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('teacher_ranks')
      .select('*')
      .eq('is_active', true)
      .order('level_order', { ascending: true })

    if (error) throw error

    return {
      success: true,
      teacherRanks: data || []
    }
  } catch (error: any) {
    console.error('Error fetching teacher ranks:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data tingkat guru'
    }
  }
}

/**
 * Assign a teacher to a subject
 */
export async function assignTeacherToSubject(
  subjectId: string,
  teacherId: string,
  teacherRankId: string | null = null
): Promise<CreateResponse<SubjectTeacher>> {
  try {
    const supabase = await createClient()

    // Check if already assigned
    const { data: existing } = await supabase
      .from('subject_teachers')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('teacher_id', teacherId)
      .single()

    if (existing) {
      return {
        success: false,
        error: 'Guru sudah ditugaskan pada mata pelajaran ini'
      }
    }

    const { data, error } = await supabase
      .from('subject_teachers')
      .insert({
        subject_id: subjectId,
        teacher_id: teacherId,
        teacher_rank_id: teacherRankId
      })
      .select(`
        *,
        teacher:profiles!subject_teachers_teacher_id_fkey(
          id,
          full_name,
          email,
          nip
        ),
        teacher_rank:teacher_ranks(*)
      `)
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as SubjectTeacher
    }
  } catch (error: any) {
    console.error('Error assigning teacher to subject:', error)
    return {
      success: false,
      error: error.message || 'Gagal menugaskan guru ke mata pelajaran'
    }
  }
}

/**
 * Remove a teacher from a subject
 */
export async function removeTeacherFromSubject(
  subjectId: string,
  teacherId: string
): Promise<DeleteResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('subject_teachers')
      .delete()
      .eq('subject_id', subjectId)
      .eq('teacher_id', teacherId)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error removing teacher from subject:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus guru dari mata pelajaran'
    }
  }
}

/**
 * Update teacher rank for a subject teacher
 */
export async function updateTeacherRank(
  subjectId: string,
  teacherId: string,
  teacherRankId: string
): Promise<UpdateResponse<SubjectTeacher>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('subject_teachers')
      .update({ teacher_rank_id: teacherRankId })
      .eq('subject_id', subjectId)
      .eq('teacher_id', teacherId)
      .select(`
        *,
        teacher:profiles!subject_teachers_teacher_id_fkey(
          id,
          full_name,
          email,
          nip
        ),
        teacher_rank:teacher_ranks(*)
      `)
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as SubjectTeacher
    }
  } catch (error: any) {
    console.error('Error updating teacher rank:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate tingkat guru'
    }
  }
}
