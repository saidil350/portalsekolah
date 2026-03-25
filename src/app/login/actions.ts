'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string

  if (!identifier || !password) {
    return { error: 'Email/NIP/NISN dan password harus diisi.' }
  }

  const supabase = await createClient()

  let emailToLogin = identifier

  // Jika identifier tidak mengandung '@', kita asumsikan ini NIP atau NISN
  // Supabase Auth secara bawaan (default) hanya mendukung login dengan Email atau Phone.
  // Oleh karena itu, kita harus mencari Email yang terkait dengan NIP/NISN ini di tabel database.
  if (!identifier.includes('@')) {
    // ASUMSI: Anda memiliki tabel 'profiles' (atau sejenisnya) dengan kolom:
    // 'nip', 'nisn', dan 'email'
    // Jika struktur database Anda berbeda, query ini harus disesuaikan.
    const { data: userProfile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .or(`nip.eq.${identifier},nisn.eq.${identifier}`)
      .single()

    if (profileError || !userProfile) {
      return { error: 'Akun dengan NIP atau NISN tersebut tidak ditemukan.' }
    }

    emailToLogin = userProfile.email
  }

  // Melakukan login menggunakan Email dan Password
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: emailToLogin,
    password,
  })

  if (error) {
    return { error: 'Login gagal. Periksa kembali kredensial Anda.' }
  }

  // Update last_login setelah login berhasil dan fetch user role
  let userRole = 'ADMIN_IT' // Default fallback

  if (authData.user) {
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (updateError) {
      console.error('Gagal mengupdate last_login:', updateError)
    }

    // Get user role untuk redirect ke dashboard yang sesuai
    if (profile?.role) {
      userRole = profile.role
    }
  }

  // Mapping role ke dashboard path
  const roleDashboardMap: Record<string, string> = {
    'ADMIN_IT': '/dashboard/admin-it',
    'GURU': '/dashboard/teaching-dashboard',
    'KEPALA_SEKOLAH': '/dashboard/headmaster-dashboard',
    'SISWA': '/dashboard/student-dashboard'
  }

  // Redirect ke dashboard sesuai role
  const dashboardPath = roleDashboardMap[userRole] || '/dashboard/admin-it'
  redirect(dashboardPath)
}

export async function logout() {
  const supabase = await createClient()

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error)
    // Continue with redirect even if signOut fails
  }

  // Redirect to login page
  redirect('/login')
}
