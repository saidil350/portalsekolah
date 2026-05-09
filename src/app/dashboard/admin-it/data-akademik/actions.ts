'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import type {
  AcademicYear,
  ClassLevel,
  Department,
  AcademicYearFormData,
  ClassLevelFormData,
  DepartmentFormData,
  DataManagementResponse,
  CreateResponse,
  UpdateResponse,
  DeleteResponse
} from '@/types'

// =====================================================
// ACADEMIC YEARS ACTIONS
// =====================================================

/**
 * Fetch academic years with filters and pagination
 */
export async function fetchAcademicYears(
  filters: { page?: number; limit?: number } = {}
): Promise<DataManagementResponse<AcademicYear>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('academic_years')
      .select('*', { count: 'exact' })
      .eq('organization_id', auth.user.organization_id)

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('start_date', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as unknown as AcademicYear[]) || [],
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

/**
 * Create new academic year
 */
export async function createAcademicYear(
  formData: AcademicYearFormData
): Promise<CreateResponse<AcademicYear>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Validation
    if (!formData.name.trim()) {
      return { success: false, error: 'Nama tahun ajaran wajib diisi' }
    }

    if (!formData.start_date) {
      return { success: false, error: 'Tanggal mulai wajib diisi' }
    }

    if (!formData.end_date) {
      return { success: false, error: 'Tanggal selesai wajib diisi' }
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      return { success: false, error: 'Tanggal selesai harus setelah tanggal mulai' }
    }

    const { data: existingYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('organization_id', auth.user.organization_id)
      .eq('name', formData.name.trim())
      .maybeSingle()

    if (existingYear) {
      return { success: false, error: 'Nama tahun ajaran sudah terdaftar' }
    }

    if (formData.is_active) {
      const { error: deactivateError } = await supabase
        .from('academic_years')
        .update({ is_active: false })
        .eq('organization_id', auth.user.organization_id)
        .eq('is_active', true)

      if (deactivateError) throw deactivateError
    }

    const { data, error } = await supabase
      .from('academic_years')
      .insert({
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        description: formData.description || null,
        organization_id: auth.user.organization_id
      })
      .select()
      .single()

    if (error) throw error

    if (formData.is_active) {
      const { error: semesterDeactivateError } = await supabase
        .from('semesters')
        .update({ is_active: false })
        .eq('organization_id', auth.user.organization_id)
        .neq('academic_year_id', data.id)
        .eq('is_active', true)

      if (semesterDeactivateError) throw semesterDeactivateError
    }

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as unknown as AcademicYear
    }
  } catch (error: any) {
    console.error('Error creating academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan tahun ajaran'
    }
  }
}

/**
 * Update existing academic year
 */
export async function updateAcademicYear(
  id: string,
  formData: Partial<AcademicYearFormData>
): Promise<UpdateResponse<AcademicYear>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.start_date) updateData.start_date = formData.start_date
    if (formData.end_date) updateData.end_date = formData.end_date
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.description !== undefined) updateData.description = formData.description || null

    const { data: currentYear, error: currentYearError } = await supabase
      .from('academic_years')
      .select('id, start_date, end_date')
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .maybeSingle()

    if (currentYearError) throw currentYearError

    if (!currentYear) {
      return { success: false, error: 'Tahun ajaran tidak ditemukan di sekolah ini' }
    }

    const nextStartDate = formData.start_date || currentYear.start_date
    const nextEndDate = formData.end_date || currentYear.end_date

    if (new Date(nextEndDate) <= new Date(nextStartDate)) {
      return { success: false, error: 'Tanggal selesai harus setelah tanggal mulai' }
    }

    if (formData.name) {
      const { data: existingYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('organization_id', auth.user.organization_id)
        .eq('name', formData.name.trim())
        .neq('id', id)
        .maybeSingle()

      if (existingYear) {
        return { success: false, error: 'Nama tahun ajaran sudah terdaftar' }
      }
    }

    if (formData.is_active) {
      const { error: deactivateError } = await supabase
        .from('academic_years')
        .update({ is_active: false })
        .eq('organization_id', auth.user.organization_id)
        .eq('is_active', true)
        .neq('id', id)

      if (deactivateError) throw deactivateError
    }

    const { data, error } = await supabase
      .from('academic_years')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)
      .select()
      .single()

    if (error) throw error

    if (formData.is_active) {
      const { error: semesterDeactivateError } = await supabase
        .from('semesters')
        .update({ is_active: false })
        .eq('organization_id', auth.user.organization_id)
        .neq('academic_year_id', id)
        .eq('is_active', true)

      if (semesterDeactivateError) throw semesterDeactivateError
    }

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as unknown as AcademicYear
    }
  } catch (error: any) {
    console.error('Error updating academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate tahun ajaran'
    }
  }
}

/**
 * Delete academic year
 */
export async function deleteAcademicYear(id: string): Promise<DeleteResponse> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', id)
      .eq('organization_id', auth.user.organization_id)

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
// CLASS LEVELS ACTIONS
// =====================================================

/**
 * Fetch class levels with filters and pagination
 */
export async function fetchClassLevels(
  filters: { page?: number; limit?: number } = {}
): Promise<DataManagementResponse<ClassLevel>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('class_levels')
      .select('*', { count: 'exact' })

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('level_order', { ascending: true })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as unknown as ClassLevel[]) || [],
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

/**
 * Create new class level
 */
export async function createClassLevel(
  formData: ClassLevelFormData
): Promise<CreateResponse<ClassLevel>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Validation
    if (!formData.name.trim()) {
      return { success: false, error: 'Nama tingkat kelas wajib diisi' }
    }

    if (!formData.code.trim()) {
      return { success: false, error: 'Kode tingkat kelas wajib diisi' }
    }

    if (formData.level_order < 1) {
      return { success: false, error: 'Urutan level harus minimal 1' }
    }

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from('class_levels')
      .select('id')
      .eq('code', formData.code.trim())
      .single()

    if (existingCode) {
      return { success: false, error: 'Kode tingkat kelas sudah terdaftar' }
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
      data: data as unknown as ClassLevel
    }
  } catch (error: any) {
    console.error('Error creating class level:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan tingkat kelas'
    }
  }
}

/**
 * Update existing class level
 */
export async function updateClassLevel(
  id: string,
  formData: Partial<ClassLevelFormData>
): Promise<UpdateResponse<ClassLevel>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('class_levels')
        .select('id')
        .eq('code', formData.code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return { success: false, error: 'Kode tingkat kelas sudah terdaftar' }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.level_order !== undefined) updateData.level_order = formData.level_order
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
      data: data as unknown as ClassLevel
    }
  } catch (error: any) {
    console.error('Error updating class level:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate tingkat kelas'
    }
  }
}

/**
 * Delete class level
 */
export async function deleteClassLevel(id: string): Promise<DeleteResponse> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

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

/**
 * Fetch departments with filters and pagination
 */
export async function fetchDepartments(
  filters: { page?: number; limit?: number } = {}
): Promise<DataManagementResponse<Department>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('departments')
      .select('*', { count: 'exact' })

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 50
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order('name', { ascending: true })
      .range(from, to)

    if (error) throw error

    return {
      success: true,
      data: (data as unknown as Department[]) || [],
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

/**
 * Create new department
 */
export async function createDepartment(
  formData: DepartmentFormData
): Promise<CreateResponse<Department>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Validation
    if (!formData.name.trim()) {
      return { success: false, error: 'Nama jurusan wajib diisi' }
    }

    if (!formData.code.trim()) {
      return { success: false, error: 'Kode jurusan wajib diisi' }
    }

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from('departments')
      .select('id')
      .eq('code', formData.code.trim())
      .single()

    if (existingCode) {
      return { success: false, error: 'Kode jurusan sudah terdaftar' }
    }

    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        description: formData.description || null,
        head_id: formData.head_id || null,
        is_active: formData.is_active
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as unknown as Department
    }
  } catch (error: any) {
    console.error('Error creating department:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan jurusan'
    }
  }
}

/**
 * Update existing department
 */
export async function updateDepartment(
  id: string,
  formData: Partial<DepartmentFormData>
): Promise<UpdateResponse<Department>> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('departments')
        .select('id')
        .eq('code', formData.code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return { success: false, error: 'Kode jurusan sudah terdaftar' }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.description !== undefined) updateData.description = formData.description || null
    if (formData.head_id !== undefined) updateData.head_id = formData.head_id || null
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
      data: data as unknown as Department
    }
  } catch (error: any) {
    console.error('Error updating department:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate jurusan'
    }
  }
}

/**
 * Delete department
 */
export async function deleteDepartment(id: string): Promise<DeleteResponse> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

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
