'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import type {
  AcademicYear,
  AcademicYearFormData,
  ClassLevel,
  ClassLevelFormData,
  Department,
  DepartmentFormData,
  AcademicFilters,
  AcademicResponse,
  CreateResponse,
  UpdateResponse,
  DeleteResponse
} from '@/types/academic'

// =====================================================
// ACADEMIC YEARS ACTIONS
// =====================================================

/**
 * Fetch academic years with filters and pagination
 */
export async function fetchAcademicYears(
  filters: AcademicFilters & { page?: number; limit?: number }
): Promise<AcademicResponse<AcademicYear>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('academic_years')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
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
      data: (data as unknown as AcademicYear[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching academic years:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data tahun akademik'
    }
  }
}

/**
 * Create new academic year
 */
export async function createAcademicYear(
  formData: AcademicYearFormData
): Promise<CreateResponse<AcademicYear>> {
  // Authorization check - only ADMIN_IT can create academic years
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Validation: end date must be after start date
    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      return {
        success: false,
        error: 'Tanggal selesai harus setelah tanggal mulai'
      }
    }

    // Check if name already exists in the same organization
    const { data: existingYear } = await supabase
      .from('academic_years')
      .select('id')
      .eq('name', formData.name.trim())
      .eq('organization_id', auth.user.organization_id)
      .single()

    if (existingYear) {
      return {
        success: false,
        error: 'Nama tahun akademik sudah terdaftar'
      }
    }

    // If this is active, deactivate all other years in the same organization
    if (formData.is_active) {
      await supabase
        .from('academic_years')
        .update({ is_active: false })
        .eq('is_active', true)
        .eq('organization_id', auth.user.organization_id)
    }

    const { data, error } = await supabase
      .from('academic_years')
      .insert({
        name: formData.name.trim(),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_active: formData.is_active,
        description: formData.description || null,
        organization_id: auth.user.organization_id // Add organization_id
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as AcademicYear
    }
  } catch (error: any) {
    console.error('Error creating academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan tahun akademik'
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
  // Authorization check - only ADMIN_IT can update academic years
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Validation: end date must be after start date
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        return {
          success: false,
          error: 'Tanggal selesai harus setelah tanggal mulai'
        }
      }
    }

    // Check if name already exists (excluding current record)
    if (formData.name) {
      const { data: existingYear } = await supabase
        .from('academic_years')
        .select('id')
        .eq('name', formData.name.trim())
        .neq('id', id)
        .single()

      if (existingYear) {
        return {
          success: false,
          error: 'Nama tahun akademik sudah terdaftar'
        }
      }
    }

    // If this is active, deactivate all other years
    if (formData.is_active) {
      await supabase
        .from('academic_years')
        .update({ is_active: false })
        .eq('is_active', true)
        .neq('id', id)
    }

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

    revalidatePath('/dashboard/admin-it/data-akademik')
    revalidatePath('/dashboard/admin-it/data-management')

    return {
      success: true,
      data: data as AcademicYear
    }
  } catch (error: any) {
    console.error('Error updating academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate tahun akademik'
    }
  }
}

/**
 * Delete academic year
 */
export async function deleteAcademicYear(id: string): Promise<DeleteResponse> {
  // Authorization check - only ADMIN_IT can delete academic years
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Check if year is active
    const { data: year } = await supabase
      .from('academic_years')
      .select('is_active')
      .eq('id', id)
      .single()

    if (year?.is_active) {
      return {
        success: false,
        error: 'Tidak dapat menghapus tahun akademik yang aktif'
      }
    }

    const { error } = await supabase
      .from('academic_years')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
    revalidatePath('/dashboard/admin-it/data-management')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting academic year:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus tahun akademik'
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
  filters: AcademicFilters & { page?: number; limit?: number }
): Promise<AcademicResponse<ClassLevel>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('class_levels')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
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
  // Authorization check - only ADMIN_IT can create class levels
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Check if name already exists in the same organization
    const { data: existingName } = await supabase
      .from('class_levels')
      .select('id')
      .eq('name', formData.name.trim())
      .eq('organization_id', auth.user.organization_id)
      .single()

    if (existingName) {
      return {
        success: false,
        error: 'Nama tingkat kelas sudah terdaftar'
      }
    }

    // Check if code already exists in the same organization
    const { data: existingCode } = await supabase
      .from('class_levels')
      .select('id')
      .eq('code', formData.code.trim())
      .eq('organization_id', auth.user.organization_id)
      .single()

    if (existingCode) {
      return {
        success: false,
        error: 'Kode tingkat kelas sudah terdaftar'
      }
    }

    const { data, error } = await supabase
      .from('class_levels')
      .insert({
        name: formData.name.trim(),
        code: formData.code.trim(),
        level_order: formData.level_order,
        description: formData.description || null,
        is_active: formData.is_active,
        organization_id: auth.user.organization_id // Add organization_id
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
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

/**
 * Update existing class level
 */
export async function updateClassLevel(
  id: string,
  formData: Partial<ClassLevelFormData>
): Promise<UpdateResponse<ClassLevel>> {
  // Authorization check - only ADMIN_IT can update class levels
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Check if name already exists (excluding current record)
    if (formData.name) {
      const { data: existingName } = await supabase
        .from('class_levels')
        .select('id')
        .eq('name', formData.name.trim())
        .neq('id', id)
        .single()

      if (existingName) {
        return {
          success: false,
          error: 'Nama tingkat kelas sudah terdaftar'
        }
      }
    }

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('class_levels')
        .select('id')
        .eq('code', formData.code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return {
          success: false,
          error: 'Kode tingkat kelas sudah terdaftar'
        }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.level_order !== undefined) updateData.level_order = formData.level_order
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.description !== undefined) updateData.description = formData.description || null

    const { data, error } = await supabase
      .from('class_levels')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
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

/**
 * Delete class level
 */
export async function deleteClassLevel(id: string): Promise<DeleteResponse> {
  // Authorization check - only ADMIN_IT can delete class levels
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('class_levels')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
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
  filters: AcademicFilters & { page?: number; limit?: number }
): Promise<AcademicResponse<Department>> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('departments')
      .select('*', { count: 'exact' })

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`)
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
  // Authorization check - only ADMIN_IT can create departments
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Check if name already exists
    const { data: existingName } = await supabase
      .from('departments')
      .select('id')
      .eq('name', formData.name.trim())
      .single()

    if (existingName) {
      return {
        success: false,
        error: 'Nama jurusan sudah terdaftar'
      }
    }

    // Check if code already exists
    const { data: existingCode } = await supabase
      .from('departments')
      .select('id')
      .eq('code', formData.code.trim())
      .single()

    if (existingCode) {
      return {
        success: false,
        error: 'Kode jurusan sudah terdaftar'
      }
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

    revalidatePath('/dashboard/admin-it/data-akademik')
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

/**
 * Update existing department
 */
export async function updateDepartment(
  id: string,
  formData: Partial<DepartmentFormData>
): Promise<UpdateResponse<Department>> {
  // Authorization check - only ADMIN_IT can update departments
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    // Check if name already exists (excluding current record)
    if (formData.name) {
      const { data: existingName } = await supabase
        .from('departments')
        .select('id')
        .eq('name', formData.name.trim())
        .neq('id', id)
        .single()

      if (existingName) {
        return {
          success: false,
          error: 'Nama jurusan sudah terdaftar'
        }
      }
    }

    // Check if code already exists (excluding current record)
    if (formData.code) {
      const { data: existingCode } = await supabase
        .from('departments')
        .select('id')
        .eq('code', formData.code.trim())
        .neq('id', id)
        .single()

      if (existingCode) {
        return {
          success: false,
          error: 'Kode jurusan sudah terdaftar'
        }
      }
    }

    const updateData: any = {}
    if (formData.name) updateData.name = formData.name.trim()
    if (formData.code) updateData.code = formData.code.trim()
    if (formData.is_active !== undefined) updateData.is_active = formData.is_active
    if (formData.description !== undefined) updateData.description = formData.description || null
    if (formData.head_id !== undefined) updateData.head_id = formData.head_id || null

    const { data, error } = await supabase
      .from('departments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
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

/**
 * Delete department
 */
export async function deleteDepartment(id: string): Promise<DeleteResponse> {
  // Authorization check - only ADMIN_IT can delete departments
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/data-akademik')
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
