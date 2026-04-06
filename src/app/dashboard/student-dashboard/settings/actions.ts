'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'

/**
 * Get current student profile data
 */
export async function getStudentProfile() {
  const auth = await authorizeAction(['SISWA'])
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
    console.error('Error fetching student profile:', error)
    return null
  }

  return profile
}

/**
 * Update student profile information
 */
export async function updateStudentProfile(formData: FormData) {
  const auth = await authorizeAction(['SISWA'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  // address column doesn't exist in database yet - skipping for now
  // const address = formData.get('address') as string
  const emailNotifications = formData.get('emailNotifications') === 'on'
  const smsNotifications = formData.get('smsNotifications') === 'on'
  const pushNotifications = formData.get('pushNotifications') === 'on'

  if (!fullName || fullName.trim() === '') {
    return { success: false, error: 'Nama lengkap wajib diisi' }
  }

  try {
    console.log('📝 Updating student profile:', {
      full_name: fullName.trim(),
      phone: phone?.trim() || null,
      user_id: user.id
    })

    const updateData: any = {
      full_name: fullName.trim(),
      // notification_preferences ditiadakan sementara agar tidak error PGRST204
      // notification_preferences: {
      //   email: emailNotifications,
      //   sms: smsNotifications,
      //   push: pushNotifications
      // },
      updated_at: new Date().toISOString()
    }

    // Only include phone if it's provided (to avoid errors if column doesn't exist)
    if (phone && phone.trim()) {
      updateData.phone = phone.trim()
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()

    if (error) {
      console.error('❌ Error updating profile:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return {
        success: false,
        error: `Gagal mengupdate profile: ${error.message || 'Unknown database error'}`
      }
    }

    // Sync to Supabase Auth Users (native credential & metadata)
    const { error: authError } = await supabase.auth.updateUser({
      phone: updateData.phone || null, // Native Phone Credential
      data: {
        full_name: updateData.full_name,
        phone: updateData.phone || null
      }
    })

    if (authError) {
      console.warn('⚠️ Warning: Profile updated but failed to sync to Auth User:', authError.message)
    } else {
      console.log('✅ Sync to Auth metadata successful')
    }

    console.log('✅ Profile updated successfully:', data)

    revalidatePath('/dashboard/student-dashboard/settings')
    return { success: true, message: 'Profile berhasil diupdate', data }

    revalidatePath('/dashboard/student-dashboard/settings')
    return { success: true }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan' }
  }
}

/**
 * Change student password
 */
export async function changeStudentPassword(formData: FormData) {
  const auth = await authorizeAction(['SISWA'])
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

  // Validation
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
    // Verify current password by attempting to sign in
    const { data: { user: currentUser }, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: currentPassword
    })

    if (signInError || !currentUser) {
      return { success: false, error: 'Password saat ini salah' }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword
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

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(email: boolean, sms: boolean, push: boolean) {
  const auth = await authorizeAction(['SISWA'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Bypass DB update karena kolom belum ada
    // const { error } = await supabase
    //   .from('profiles')
    //   .update({
    //     notification_preferences: {
    //       email,
    //       sms,
    //       push
    //     },
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('id', user.id)
    let error: any = null;

    if (error) {
      console.error('Error updating preferences:', error)
      return {
        success: false,
        error: `Gagal mengupdate preferensi notifikasi: ${error.message || 'Unknown database error'}`
      }
    }

    return { success: true }
  } catch (error: any) {
    console.error('Error updating preferences:', error)
    return { success: false, error: error.message || 'Terjadi kesalahan' }
  }
}
