'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Get system settings for school identity
 * Note: For now, return mock data. In production, this should be stored in a separate system_settings table
 */
export async function getSystemSettings() {
  // TODO: Fetch from a system_settings table in production
  // For now, return mock data
  return {
    school_name: 'SMA Negeri 1 Jakarta',
    school_address: 'Jl. Pendidikan No. 1, Jakarta Pusat',
    school_phone: '+62 21 1234 5678',
    school_email: 'info@sekolah.sch.id',
    maintenance_mode: false
  }
}

/**
 * Update school identity
 */
export async function updateSchoolIdentity(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  const schoolName = formData.get('schoolName') as string
  const schoolAddress = formData.get('schoolAddress') as string
  const schoolPhone = formData.get('schoolPhone') as string
  const schoolEmail = formData.get('schoolEmail') as string

  if (!schoolName || schoolName.trim() === '') {
    return { success: false, error: 'Nama sekolah wajib diisi' }
  }

  // TODO: Update system_settings table in production
  // For now, just log the update
  console.log('School identity update:', { schoolName, schoolAddress, schoolPhone, schoolEmail })

  revalidatePath('/dashboard/admin-it/pengaturan-sistem')
  return { success: true, message: 'Identitas sekolah berhasil diupdate' }
}

/**
 * Toggle maintenance mode
 */
export async function toggleMaintenanceMode(enabled: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // TODO: Update system_settings table in production
  console.log('Maintenance mode toggled:', enabled)

  revalidatePath('/dashboard/admin-it/pengaturan-sistem')
  return { success: true, message: enabled ? 'Maintenance mode diaktifkan' : 'Maintenance mode dinonaktifkan' }
}

/**
 * Create backup
 * TODO: Implement actual database backup functionality
 */
export async function createBackup() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // TODO: Implement actual backup using Supabase CLI or pg_dump
  // For now, return success with a mock backup ID
  const backupId = `backup_${Date.now()}`

  console.log('Backup created:', backupId)

  return {
    success: true,
    backupId,
    message: 'Backup berhasil dibuat'
  }
}

/**
 * Export audit logs
 * TODO: Implement actual audit log export
 */
export async function exportAuditLogs() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated' }
  }

  // TODO: Query audit logs table and export to CSV
  // For now, return mock data
  const mockLogs = [
    {
      id: 1,
      action: 'User Login',
      user: user?.email,
      timestamp: new Date().toISOString(),
      ip_address: '192.168.1.1'
    }
  ]

  return {
    success: true,
    logs: mockLogs,
    message: 'Audit log berhasil di-export'
  }
}

/**
 * Get current admin profile
 */
export async function getOwnProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  
  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

/**
 * Update current admin profile
 */
export async function updateOwnProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }
  
  const full_name = formData.get('fullName') as string
  const email = formData.get('email') as string
  const nip = formData.get('nip') as string
  const password = formData.get('password') as string

  if (!full_name || !email) return { success: false, error: 'Nama dan email wajib diisi' }

  // Update auth data if email or password changed
  const updateAuthData: any = {}
  if (email !== user.email) updateAuthData.email = email
  if (password && password.trim() !== '') updateAuthData.password = password
  
  if (Object.keys(updateAuthData).length > 0) {
    const { error: authError } = await supabase.auth.updateUser({
      ...updateAuthData,
      data: { full_name } // Update metadata too
    })
    
    // In some setups, email changes require confirmation. We assume we show success either way 
    // or you might want to handle email change notices if it restricts login.
    if (authError) return { success: false, error: authError.message }
  } else {
    // Just update metadata if auth data wasn't changed
    await supabase.auth.updateUser({ data: { full_name } })
  }

  // Update profile
  const { error: profileError } = await supabase.from('profiles').update({
    full_name,
    email,
    nip: nip || null
  }).eq('id', user.id)

  if (profileError) return { success: false, error: profileError.message }

  revalidatePath('/dashboard/admin-it/pengaturan-sistem')
  return { success: true, message: 'Profil akun berhasil diperbarui' }
}
