'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'

const SETTINGS_PATH = '/dashboard/headmaster-dashboard/pengaturan'

export async function getHeadmasterProfile() {
  const auth = await authorizeAction(['KEPALA_SEKOLAH'])
  if (!auth.success) {
    return null
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error || !profile) {
    console.error('Error fetching headmaster profile:', error)
    return null
  }

  return profile
}

export async function updateHeadmasterProfile(formData: FormData) {
  const auth = await authorizeAction(['KEPALA_SEKOLAH'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const fullName = (formData.get('fullName') as string | null)?.trim()
  const phone = (formData.get('phone') as string | null)?.trim() || null
  const nip = (formData.get('nip') as string | null)?.trim() || null
  const notificationPreferences = {
    email: formData.get('emailNotifications') === 'on',
    reports: formData.get('reportNotifications') === 'on',
  }

  if (!fullName) {
    return { success: false, error: 'Nama lengkap wajib diisi' }
  }

  try {
    const updateData = {
      full_name: fullName,
      phone,
      nip,
      notification_preferences: notificationPreferences,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating headmaster profile:', error)
      return {
        success: false,
        error: `Gagal mengupdate profile: ${error.message || 'Unknown database error'}`,
      }
    }

    const { error: authError } = await supabase.auth.updateUser({
      ...(phone ? { phone } : {}),
      data: {
        full_name: fullName,
        phone,
      },
    })

    if (authError) {
      console.warn('Profile updated but failed to sync Auth metadata:', authError.message)
    }

    revalidatePath(SETTINGS_PATH)
    return { success: true, message: 'Profile berhasil diupdate', data }
  } catch (error: any) {
    console.error('Error updating headmaster profile:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan' }
  }
}

export async function uploadSignature(formData: FormData) {
  const auth = await authorizeAction(['KEPALA_SEKOLAH'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const signatureFile = formData.get('signature') as File

  if (!signatureFile) {
    return { success: false, error: 'Pilih file signature terlebih dahulu' }
  }

  return { success: true, message: 'Fitur upload signature akan diimplementasikan dengan Supabase Storage' }
}

export async function changeHeadmasterPassword(formData: FormData) {
  const auth = await authorizeAction(['KEPALA_SEKOLAH'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, error: 'Semua field wajib diisi' }
  }

  if (newPassword.length < 6) {
    return { success: false, error: 'Password minimal 6 karakter' }
  }

  if (newPassword !== confirmPassword) {
    return { success: false, error: 'Password baru tidak cocok' }
  }

  try {
    const { data: { user: currentUser }, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword,
    })

    if (signInError || !currentUser) {
      return { success: false, error: 'Password saat ini salah' }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Error changing password:', error)
      return { success: false, error: 'Gagal mengubah password' }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error changing password:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan' }
  }
}

export async function updateNotificationPreferences(email: boolean, reports: boolean) {
  const auth = await authorizeAction(['KEPALA_SEKOLAH'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        notification_preferences: { email, reports },
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating preferences:', error)
      return {
        success: false,
        error: `Gagal mengupdate preferensi notifikasi: ${error.message || 'Unknown database error'}`,
      }
    }

    revalidatePath(SETTINGS_PATH)
    return { success: true }
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan' }
  }
}
