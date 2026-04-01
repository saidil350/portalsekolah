'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import { validateNIP, validateNISN } from '@/lib/validations/user-validation'
import type {
  User,
  UserFormData,
  UsersResponse,
  CreateUserResponse,
  UpdateUserResponse,
  DeleteUserResponse,
  SyncResponse,
  UserFilters
} from '@/types/user'

/**
 * Helper: Ambil organization_id dari Admin IT yang sedang login
 * @returns organization_id string
 * @throws Error jika tidak ada organization
 */
async function getAdminOrganizationId(): Promise<string> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    throw new Error(auth.error)
  }

  const organizationId = auth.user.organization_id
  if (!organizationId) {
    throw new Error('Admin IT tidak terhubung ke organisasi manapun. Silakan hubungi administrator.')
  }

  return organizationId
}

/**
 * Fetch users with filters and pagination
 * Hanya menampilkan user dari organization yang sama dengan Admin IT
 */
export async function fetchUsers(
  filters: UserFilters & { page?: number; limit?: number }
): Promise<UsersResponse> {
  // Authorization check - only ADMIN_IT can fetch users
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    throw new Error(auth.error)
  }

  const organizationId = auth.user.organization_id
  if (!organizationId) {
    throw new Error('Admin IT tidak terhubung ke organisasi manapun.')
  }

  try {
    const supabase = await createClient()

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .eq('organization_id', organizationId) // ✅ Filter by organization

    // Apply search filter
    if (filters.search && filters.search.trim() !== '') {
      query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
    }

    // Apply role filter
    if (filters.role && filters.role.trim() !== '') {
      query = query.eq('role', filters.role)
    }

    // Apply status filter
    if (filters.status && filters.status.trim() !== '') {
      query = query.eq('status', filters.status)
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
      users: (data as unknown as User[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    throw new Error(error.message || 'Gagal memuat data pengguna')
  }
}

/**
 * Create new user
 * User baru akan otomatis masuk ke organization yang sama dengan Admin IT
 */
export async function createUser(formData: UserFormData): Promise<CreateUserResponse> {
  // Authorization check - only ADMIN_IT can create users
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  const organizationId = auth.user.organization_id
  if (!organizationId) {
    return {
      success: false,
      error: 'Admin IT tidak terhubung ke organisasi manapun.'
    }
  }

  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient() // Admin client untuk operasi auth

    // ============================================
    // VALIDASI ROLE-SPECIFIC DENGAN FORMAT CHECK
    // ============================================
    if (formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH') {
      if (!formData.nip || formData.nip.trim() === '') {
        throw new Error('NIP wajib diisi untuk Guru dan Kepala Sekolah')
      }
      // Validasi format NIP (18 digit)
      const nipValidation = validateNIP(formData.nip)
      if (!nipValidation.valid) {
        throw new Error(nipValidation.message)
      }
    }

    if (formData.role === 'SISWA') {
      if (!formData.nisn || formData.nisn.trim() === '') {
        throw new Error('NISN wajib diisi untuk Siswa')
      }
      // Validasi format NISN (10 digit)
      const nisnValidation = validateNISN(formData.nisn)
      if (!nisnValidation.valid) {
        throw new Error(nisnValidation.message)
      }
    }

    // ============================================
    // CEK DUPLIKAT (PER-ORGANIZATION)
    // ============================================

    // Check if email already exists (global, email harus unik di seluruh sistem)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (existingUser) {
      throw new Error('Email sudah terdaftar')
    }

    // Check if NIP already exists (PER-ORGANIZATION)
    if (formData.nip && formData.nip.trim() !== '') {
      const { data: existingNIP } = await supabase
        .from('profiles')
        .select('id')
        .eq('nip', formData.nip.trim())
        .eq('organization_id', organizationId) // ✅ Per-organization
        .single()

      if (existingNIP) {
        throw new Error('NIP sudah terdaftar di organisasi ini')
      }
    }

    // Check if NISN already exists (PER-ORGANIZATION)
    if (formData.nisn && formData.nisn.trim() !== '') {
      const { data: existingNISN } = await supabase
        .from('profiles')
        .select('id')
        .eq('nisn', formData.nisn.trim())
        .eq('organization_id', organizationId) // ✅ Per-organization
        .single()

      if (existingNISN) {
        throw new Error('NISN sudah terdaftar di organisasi ini')
      }
    }

    // ============================================
    // CREATE AUTH USER
    // ============================================
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email: formData.email,
      password: formData.password || 'Password123!',
      email_confirm: true,
      user_metadata: {
        full_name: formData.full_name,
        role: formData.role
      }
    })

    if (authError) throw authError

    // ============================================
    // CREATE PROFILE DENGAN ORGANIZATION_ID
    // ============================================
    const profileData: Record<string, unknown> = {
      id: authData.user.id,
      email: formData.email,
      full_name: formData.full_name,
      role: formData.role,
      organization_id: organizationId, // ✅ Organization yang sama dengan Admin IT
      status: formData.status || 'ACTIVE'
    }

    // Only add NIP for non-student roles
    if (formData.role !== 'SISWA' && formData.nip) {
      profileData.nip = formData.nip.trim()
    }

    // Only add NISN for students
    if (formData.role === 'SISWA' && formData.nisn) {
      profileData.nisn = formData.nisn.trim()
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, { onConflict: 'id' })

    if (profileError) {
      // Rollback auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(authData.user.id)
      throw profileError
    }

    revalidatePath('/dashboard/admin-it/manajemen-pengguna')

    return {
      success: true,
      user: {
        id: authData.user.id,
        ...profileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as unknown as User
    }
  } catch (error: any) {
    console.error('Error creating user:', error)
    return {
      success: false,
      error: error.message || 'Gagal menambahkan pengguna'
    }
  }
}

/**
 * Update existing user
 * Hanya bisa update user di organization yang sama
 */
export async function updateUser(
  id: string,
  formData: Partial<UserFormData>
): Promise<UpdateUserResponse> {
  // Authorization check - only ADMIN_IT can update users
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  const organizationId = auth.user.organization_id
  if (!organizationId) {
    return { success: false, error: 'Admin IT tidak terhubung ke organisasi manapun.' }
  }

  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // ============================================
    // VALIDASI: Target user harus di organization yang sama
    // ============================================
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('id, role, organization_id')
      .eq('id', id)
      .eq('organization_id', organizationId) // ✅ Harus di org yang sama
      .single()

    if (!targetUser) {
      return {
        success: false,
        error: 'Pengguna tidak ditemukan di organisasi Anda.'
      }
    }

    // Get current user for additional security checks
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Sesi tidak valid. Silakan login kembali.'
      }
    }

    // Prevent disabling own account
    if (user.id === id && formData.status === 'INACTIVE') {
      return {
        success: false,
        error: 'Anda tidak dapat menonaktifkan akun sendiri'
      }
    }

    // Prevent changing own role to non-admin (last admin check PER-ORGANIZATION)
    if (user.id === id && formData.role && formData.role !== 'ADMIN_IT') {
      if (targetUser.role === 'ADMIN_IT') {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'ADMIN_IT')
          .eq('organization_id', organizationId) // ✅ Per-organization

        if (countError) throw countError

        if (count === null || count <= 1) {
          return {
            success: false,
            error: 'Tidak dapat mengubah peran admin terakhir. Organisasi harus memiliki minimal satu admin.'
          }
        }
      }
    }

    // ============================================
    // VALIDASI FORMAT NIP/NISN
    // ============================================
    if (formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH') {
      if (!formData.nip || formData.nip.trim() === '') {
        throw new Error('NIP wajib diisi untuk Guru dan Kepala Sekolah')
      }
      const nipValidation = validateNIP(formData.nip)
      if (!nipValidation.valid) {
        throw new Error(nipValidation.message)
      }
    }

    if (formData.role === 'SISWA') {
      if (!formData.nisn || formData.nisn.trim() === '') {
        throw new Error('NISN wajib diisi untuk Siswa')
      }
      const nisnValidation = validateNISN(formData.nisn)
      if (!nisnValidation.valid) {
        throw new Error(nisnValidation.message)
      }
    }

    // ============================================
    // CEK DUPLIKAT (PER-ORGANIZATION)
    // ============================================

    // Check if email already exists (excluding current user)
    if (formData.email) {
      const { data: existingEmail } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', formData.email)
        .neq('id', id)
        .single()

      if (existingEmail) {
        throw new Error('Email sudah terdaftar')
      }
    }

    // Check if NIP already exists (PER-ORGANIZATION, excluding current user)
    if (formData.nip && formData.nip.trim() !== '') {
      const { data: existingNIP } = await supabase
        .from('profiles')
        .select('id')
        .eq('nip', formData.nip.trim())
        .eq('organization_id', organizationId) // ✅ Per-organization
        .neq('id', id)
        .single()

      if (existingNIP) {
        throw new Error('NIP sudah terdaftar di organisasi ini')
      }
    }

    // Check if NISN already exists (PER-ORGANIZATION, excluding current user)
    if (formData.nisn && formData.nisn.trim() !== '') {
      const { data: existingNISN } = await supabase
        .from('profiles')
        .select('id')
        .eq('nisn', formData.nisn.trim())
        .eq('organization_id', organizationId) // ✅ Per-organization
        .neq('id', id)
        .single()

      if (existingNISN) {
        throw new Error('NISN sudah terdaftar di organisasi ini')
      }
    }

    // ============================================
    // PREPARE UPDATE DATA
    // ============================================
    const updateData: Record<string, unknown> = {}

    if (formData.email) updateData.email = formData.email
    if (formData.full_name) updateData.full_name = formData.full_name
    if (formData.role) updateData.role = formData.role
    if (formData.status) updateData.status = formData.status

    // Handle NIP/NISN based on role
    if (formData.role === 'SISWA') {
      updateData.nip = null
      updateData.nisn = formData.nisn || null
    } else {
      updateData.nip = formData.nip || null
      updateData.nisn = null
    }

    // ============================================
    // UPDATE PROFILE (dengan filter organization)
    // ============================================
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .eq('organization_id', organizationId) // ✅ Filter by organization
      .select()
      .single()

    if (profileError) throw profileError

    // Update auth user metadata jika email atau name berubah
    if (formData.email || formData.full_name) {
      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, {
        email: formData.email,
        user_metadata: {
          full_name: formData.full_name || profile.full_name,
          role: formData.role || profile.role
        }
      })

      if (authError) throw authError
    }

    revalidatePath('/dashboard/admin-it/manajemen-pengguna')

    return {
      success: true,
      user: profile as unknown as User
    }
  } catch (error: any) {
    console.error('Error updating user:', error)
    return {
      success: false,
      error: error.message || 'Gagal mengupdate pengguna'
    }
  }
}

/**
 * Delete user
 * Hanya bisa hapus user di organization yang sama
 */
export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  // Authorization check - only ADMIN_IT can delete users
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  const organizationId = auth.user.organization_id
  if (!organizationId) {
    return { success: false, error: 'Admin IT tidak terhubung ke organisasi manapun.' }
  }

  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // CRITICAL: Get current user to prevent self-deletion
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Sesi tidak valid. Silakan login kembali.'
      }
    }

    // ============================================
    // VALIDASI: Target user harus di organization yang sama
    // ============================================
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role, organization_id')
      .eq('id', id)
      .eq('organization_id', organizationId) // ✅ Harus di org yang sama
      .single()

    if (!targetUser) {
      return {
        success: false,
        error: 'Pengguna tidak ditemukan di organisasi Anda.'
      }
    }

    // Check if this is the last admin (PER-ORGANIZATION)
    if (targetUser.role === 'ADMIN_IT') {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'ADMIN_IT')
        .eq('organization_id', organizationId) // ✅ Per-organization

      if (countError) throw countError

      if (count === null || count <= 1) {
        return {
          success: false,
          error: 'Tidak dapat menghapus admin terakhir. Organisasi harus memiliki minimal satu admin.'
        }
      }
    }

    // Invalidate all sessions for the user being deleted
    await adminSupabase.auth.admin.deleteUser(id)

    // Delete profile (will cascade to auth user due to ON DELETE CASCADE)
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)
      .eq('organization_id', organizationId) // ✅ Filter by organization

    if (profileError) throw profileError

    revalidatePath('/dashboard/admin-it/manajemen-pengguna')

    return { success: true }
  } catch (error: any) {
    console.error('Error deleting user:', error)
    return {
      success: false,
      error: error.message || 'Gagal menghapus pengguna'
    }
  }
}

/**
 * Sync profiles with Supabase Auth
 * Hanya sync user dari organization yang sama
 */
export async function syncWithSupabase(): Promise<SyncResponse> {
  // Authorization check - only ADMIN_IT can sync with Supabase
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return {
      success: false,
      error: auth.error
    }
  }

  const organizationId = auth.user.organization_id
  if (!organizationId) {
    return { success: false, error: 'Admin IT tidak terhubung ke organisasi manapun.' }
  }

  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient()

    // Get profiles dari organization yang sama saja
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', organizationId) // ✅ Filter by organization

    if (error) throw error

    if (!profiles || profiles.length === 0) {
      return {
        success: true,
        synced: 0,
        errors: 0,
        total: 0
      }
    }

    let synced = 0
    let errors = 0

    for (const profile of profiles) {
      try {
        // Update auth user metadata menggunakan ADMIN client
        const { error: updateError } = await adminSupabase.auth.admin.updateUserById(
          profile.id,
          {
            email: profile.email,
            user_metadata: {
              full_name: profile.full_name,
              role: profile.role
            }
          }
        )

        if (updateError) {
          console.error(`Error syncing user ${profile.id}:`, updateError)
          errors++
        } else {
          synced++
        }
      } catch (err) {
        console.error(`Error syncing user ${profile.id}:`, err)
        errors++
      }
    }

    revalidatePath('/dashboard/admin-it/manajemen-pengguna')

    return {
      success: true,
      synced,
      errors,
      total: profiles.length
    }
  } catch (error: any) {
    console.error('Error syncing with Supabase:', error)
    return {
      success: false,
      error: error.message || 'Gagal sinkronisasi dengan Supabase'
    }
  }
}

/**
 * Get current authenticated user ID
 * This is a server action that can be called from client components
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    return user?.id || null
  } catch {
    return null
  }
}
