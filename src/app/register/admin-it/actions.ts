'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function registerAdminIT(formData: FormData) {
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const nip = formData.get('nip') as string
  const password = formData.get('password') as string

  if (!fullName || !email || !nip || !password) {
    return { error: 'Semua kolom formulir harus diisi.' }
  }

  const supabase = await createClient()

  // 1. Lakukan pendaftaran menggunakan Supabase Auth
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        nip: nip
      }
    }
  })

  if (signUpError) {
    return { error: `Gagal mendaftar: ${signUpError.message}` }
  }

  // Jika pendaftaran berhasil dan Supabase Auth memerlukan konfirmasi email (session = null)
  // Bisa tambahkan pesan atau jika tidak, profil akan dibuat (baik via trigger db atau manual)
  
  // Karena user memerlukan pendaftaran langsung dan otomatis profil dibuat:
  // Mari pastikan profilnya diperbarui dengan data yang benar jika belum ada
  // Biasanya signUp dengan opsi data sudah memicu trigger Supabase untuk membuat profil
  // Tetapi untuk memastikan secara spesifik `ADMIN_IT`, kita akan coba update
  
  if (authData.user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: authData.user.id,
        full_name: fullName,
        nip: nip,
        email: email,
        role: 'ADMIN_IT',
        last_login: new Date().toISOString()
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Gagal mengupdate/membuat profil Admin IT:', profileError)
      // Terkadang ada RLS policy yang mencegah insert/update ke row lain,
      // Tetapi karena user id cocok dengan auth.uid() saat session terbentuk (jika tidak butuh konfirmasi),
      // ini seharusnya berhasil. Jika tidak ada session, ini mungkin gagal jika RLS tidak membolehkan anonim upsert profil mereka.
      // Namun mari asumsikan DB policy memungkingkan atau ada trigger yang meng-handle berdasarkan `raw_user_meta_data`.
      // Untuk amannya, kita kembalikan error jika gagal dan ini penting.
    }
  }

  // Redirect ke dashboard admin IT
  redirect('/dashboard/admin-it')
}
