'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'

const SETTINGS_PATH = '/dashboard/teaching-dashboard/pengaturan'

export async function getTeacherProfile() {
  const auth = await authorizeAction(['GURU'])
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
    console.error('Error fetching teacher profile:', error)
    return null
  }

  return profile
}

export async function updateTeacherProfile(formData: FormData) {
  const auth = await authorizeAction(['GURU'])
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
  const notificationPreferences = {
    email: formData.get('emailNotifications') === 'on',
    schedule_reminders: formData.get('scheduleReminders') === 'on',
    assignment_submissions: formData.get('assignmentSubmissions') === 'on',
    attendance_alerts: formData.get('attendanceAlerts') === 'on',
    system_updates: formData.get('systemUpdates') === 'on',
  }

  if (!fullName) {
    return { success: false, error: 'Nama lengkap wajib diisi' }
  }

  try {
    const updateData = {
      full_name: fullName,
      phone,
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
      console.error('Error updating teacher profile:', error)
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
    console.error('Error updating teacher profile:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan' }
  }
}

export async function changeTeacherPassword(formData: FormData) {
  const auth = await authorizeAction(['GURU'])
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

export async function updateNotificationPreferences(
  email: boolean,
  schedule_reminders: boolean,
  assignment_submissions: boolean,
  attendance_alerts: boolean,
  system_updates: boolean
) {
  const auth = await authorizeAction(['GURU'])
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
        notification_preferences: {
          email,
          schedule_reminders,
          assignment_submissions,
          attendance_alerts,
          system_updates,
        },
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
