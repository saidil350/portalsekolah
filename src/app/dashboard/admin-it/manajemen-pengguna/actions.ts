'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
import { revalidatePath } from 'next/cache'
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
 * Fetch users with filters and pagination
 */
export async function fetchUsers(
  filters: UserFilters & { page?: number; limit?: number }
): Promise<UsersResponse> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })

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
      users: (data as User[]) || [],
      total: count || 0
    }
  } catch (error: any) {
    console.error('Error fetching users:', error)
    throw new Error(error.message || 'Gagal memuat data pengguna')
  }
}

/**
 * Create new user
 */
export async function createUser(formData: UserFormData): Promise<CreateUserResponse> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient() // Admin client untuk operasi auth

    // Validation based on role
    if (formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH') {
      if (!formData.nip || formData.nip.trim() === '') {
        throw new Error('NIP wajib diisi untuk Guru dan Kepala Sekolah')
      }
    }

    if (formData.role === 'SISWA') {
      if (!formData.nisn || formData.nisn.trim() === '') {
        throw new Error('NISN wajib diisi untuk Siswa')
      }
    }

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', formData.email)
      .single()

    if (existingUser) {
      throw new Error('Email sudah terdaftar')
    }

    // Check if NIP already exists (for GURU/STAF)
    if (formData.nip && formData.nip.trim() !== '') {
      const { data: existingNIP } = await supabase
        .from('profiles')
        .select('id')
        .eq('nip', formData.nip.trim())
        .single()

      if (existingNIP) {
        throw new Error('NIP sudah terdaftar')
      }
    }

    // Check if NISN already exists (for SISWA)
    if (formData.nisn && formData.nisn.trim() !== '') {
      const { data: existingNISN } = await supabase
        .from('profiles')
        .select('id')
        .eq('nisn', formData.nisn.trim())
        .single()

      if (existingNISN) {
        throw new Error('NISN sudah terdaftar')
      }
    }

    // Create auth user menggunakan ADMIN client
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

    // Create profile
    const profileData: any = {
      id: authData.user.id,
      email: formData.email,
      full_name: formData.full_name,
      role: formData.role,
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
      } as User
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
 */
export async function updateUser(
  id: string,
  formData: Partial<UserFormData>
): Promise<UpdateUserResponse> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient() // Admin client untuk operasi auth

    // Get current user for security checks
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

    // Prevent changing own role to non-admin
    if (user.id === id && formData.role && formData.role !== 'ADMIN_IT') {
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (currentUserProfile?.role === 'ADMIN_IT') {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'ADMIN_IT')

        if (countError) throw countError

        if (count === null || count <= 1) {
          return {
            success: false,
            error: 'Tidak dapat mengubah peran admin terakhir. Sistem harus memiliki minimal satu admin.'
          }
        }
      }
    }

    // Validation based on role
    if (formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH') {
      if (!formData.nip || formData.nip.trim() === '') {
        throw new Error('NIP wajib diisi untuk Guru dan Kepala Sekolah')
      }
    }

    if (formData.role === 'SISWA') {
      if (!formData.nisn || formData.nisn.trim() === '') {
        throw new Error('NISN wajib diisi untuk Siswa')
      }
    }

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

    // Check if NIP already exists (excluding current user)
    if (formData.nip && formData.nip.trim() !== '') {
      const { data: existingNIP } = await supabase
        .from('profiles')
        .select('id')
        .eq('nip', formData.nip.trim())
        .neq('id', id)
        .single()

      if (existingNIP) {
        throw new Error('NIP sudah terdaftar')
      }
    }

    // Check if NISN already exists (excluding current user)
    if (formData.nisn && formData.nisn.trim() !== '') {
      const { data: existingNISN } = await supabase
        .from('profiles')
        .select('id')
        .eq('nisn', formData.nisn.trim())
        .neq('id', id)
        .single()

      if (existingNISN) {
        throw new Error('NISN sudah terdaftar')
      }
    }

    // Prepare update data
    const updateData: any = {}

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

    // Update profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
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
      user: profile as User
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
 */
export async function deleteUser(id: string): Promise<DeleteUserResponse> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient() // Admin client untuk operasi auth

    // CRITICAL: Get current user to prevent self-deletion
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return {
        success: false,
        error: 'Sesi tidak valid. Silakan login kembali.'
      }
    }


    // Check if this is the last admin
    const { data: targetUser } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', id)
      .single()

    if (targetUser?.role === 'ADMIN_IT') {
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'ADMIN_IT')

      if (countError) throw countError

      if (count === null || count <= 1) {
        return {
          success: false,
          error: 'Tidak dapat menghapus admin terakhir. Sistem harus memiliki minimal satu admin.'
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
 * This syncs data from profiles table to auth.users
 */
export async function syncWithSupabase(): Promise<SyncResponse> {
  try {
    const supabase = await createClient()
    const adminSupabase = await createAdminClient() // Admin client untuk operasi auth

    // Get all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')

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
    throw new Error(error.message || 'Gagal sinkronisasi dengan Supabase')
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
