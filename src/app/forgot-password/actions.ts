'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function resetPassword(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const fullName = formData.get('fullName') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!identifier || !fullName || !password || !confirmPassword) {
    return { error: 'Semua field harus diisi.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' }
  }

  if (password.length < 6) {
    return { error: 'Password harus minimal 6 karakter.' }
  }

  const supabase = await createClient()

  // 1. Cari user berdasarkan identifier (Email/NIP/NISN)
  let userProfile = null
  
  if (identifier.includes('@')) {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('email', identifier)
      .single()
    userProfile = data
  } else {
    const { data } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .or(`nip.eq.${identifier},nisn.eq.${identifier}`)
      .single()
    userProfile = data
  }

  if (!userProfile) {
    return { error: 'Akun tidak ditemukan. Pastikan Email/NIP/NISN benar.' }
  }

  // 2. Verifikasi Nama Lengkap (case-insensitive)
  if (userProfile.full_name.toLowerCase() !== fullName.toLowerCase()) {
    return { error: 'Verifikasi gagal. Nama lengkap tidak sesuai.' }
  }

  // 3. Reset Password menggunakan Admin API
  const adminClient = await createAdminClient()
  const { error: resetError } = await adminClient.auth.admin.updateUserById(
    userProfile.id,
    { password: password }
  )

  if (resetError) {
    console.error('Reset password error:', resetError)
    return { error: 'Gagal mereset password. Silakan hubungi admin.' }
  }

  return { success: true, message: 'Password berhasil diperbarui. Silakan login kembali.' }
}
