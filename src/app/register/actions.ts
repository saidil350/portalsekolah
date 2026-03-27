'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function registerAdmin(formData: FormData) {
  const organizationName = formData.get('organizationName') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // Client-side validation passed to server, but validate again
  if (!organizationName || !fullName || !email || !password || !confirmPassword) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  const supabase = await createClient()

  // 1. Cek apakah email sudah terdaftar
  const { data: existingUser, error: checkError } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (checkError) {
    console.error('Error checking existing user:', checkError)
    return { error: 'Terjadi kesalahan saat memeriksa email.' }
  }

  if (existingUser) {
    return { error: 'Email sudah terdaftar. Gunakan email lain atau login.' }
  }

  // 2. Generate organization_id yang unik (gunakan slug dari nama sekolah + random string)
  const orgSlug = organizationName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const randomString = Math.random().toString(36).substring(2, 8)
  const organizationId = `${orgSlug}-${randomString}`

  // 3. Cek apakah organization_id sudah ada (untuk mencegah collision)
  const { data: existingOrg } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (existingOrg) {
    // Jika collision terjadi (sangat jarang), generate ulang dengan timestamp
    const timestamp = Date.now().toString(36)
    return {
      error: 'Terjadi kesalahan unik. Silakan coba lagi.'
    }
  }

  // 4. Register user ke Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        organization_name: organizationName,
      }
    }
  })

  if (authError) {
    console.error('Auth signup error:', authError)
    return { error: authError.message || 'Gagal mendaftarkan akun.' }
  }

  if (!authData.user) {
    return { error: 'Gagal membuat user. Silakan coba lagi.' }
  }

  // 5. Insert ke profiles table dengan organization data
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authData.user.id,
      email: email,
      full_name: fullName,
      role: 'ADMIN_IT',
      organization_id: organizationId,
      organization_name: organizationName,
      status: 'ACTIVE', // Auto-activate untuk Admin IT pertama
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

  if (profileError) {
    console.error('Profile insert error:', profileError)
    // Rollback auth user jika profile insert gagal
    await supabase.auth.admin.deleteUser(authData.user.id)
    return { error: 'Gagal menyimpan profil. Silakan coba lagi.' }
  }

  // 6. Revalidate dan redirect
  revalidatePath('/login')

  return {
    success: true,
    message: `Akun Admin IT untuk ${organizationName} berhasil dibuat. Organization ID: ${organizationId}`
  }
}
