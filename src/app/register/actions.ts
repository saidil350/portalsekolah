'use server'

import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { generateOrgCode } from '@/lib/validations/user-validation'

export async function registerAdmin(formData: FormData) {
  const organizationName = formData.get('organizationName') as string
  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  // ============================================
  // 1. VALIDASI INPUT
  // ============================================
  if (!organizationName || !fullName || !email || !password || !confirmPassword) {
    return { error: 'Semua field wajib diisi.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Konfirmasi password tidak cocok.' }
  }

  if (password.length < 6) {
    return { error: 'Password minimal 6 karakter.' }
  }

  if (organizationName.trim().length < 3) {
    return { error: 'Nama sekolah minimal 3 karakter.' }
  }

  const supabase = await createClient()
  // Gunakan admin client (service_role) untuk bypass RLS
  // Diperlukan karena user baru belum punya role di profiles,
  // sehingga RLS policy memblokir insert/update profile & organization
  const adminClient = await createAdminClient()

  // ============================================
  // 2. CEK EMAIL DUPLIKAT (menggunakan admin client agar bisa cek semua profiles)
  // ============================================
  const { data: existingUser, error: checkError } = await adminClient
    .from('profiles')
    .select('id, email')
    .eq('email', email)
    .maybeSingle()

  if (checkError) {
    console.error('[REGISTER] Error checking existing user:', checkError)
    return { error: 'Terjadi kesalahan saat memeriksa email.' }
  }

  if (existingUser) {
    return { error: 'Email sudah terdaftar. Gunakan email lain atau login.' }
  }

  // ============================================
  // 3. GENERATE KODE ORGANISASI UNIK
  // ============================================
  let orgCode = generateOrgCode(organizationName)

  // Pastikan kode unik, retry jika perlu (max 5x)
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: existingOrg } = await adminClient
      .from('organizations')
      .select('id')
      .eq('code', orgCode)
      .maybeSingle()

    if (!existingOrg) break // Kode unik, lanjut

    // Jika duplikat, generate ulang
    orgCode = generateOrgCode(organizationName)

    if (attempt === 4) {
      return { error: 'Gagal membuat kode organisasi unik. Silakan coba lagi.' }
    }
  }

  // ============================================
  // 4. REGISTER USER KE SUPABASE AUTH
  // ============================================
  // Gunakan admin client untuk signUp agar bisa auto-confirm user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email agar langsung bisa login
    user_metadata: {
      full_name: fullName,
      organization_name: organizationName,
    }
  })

  if (authError) {
    console.error('[REGISTER] Auth signup error:', authError)
    return { error: authError.message || 'Gagal mendaftarkan akun.' }
  }

  if (!authData.user) {
    return { error: 'Gagal membuat user. Silakan coba lagi.' }
  }

  const userId = authData.user.id
  console.log('[REGISTER] User created in auth:', { userId, email })

  // ============================================
  // 5. BUAT RECORD ORGANIZATION (menggunakan admin client - bypass RLS)
  // ============================================
  const { data: org, error: orgError } = await adminClient
    .from('organizations')
    .insert({
      name: organizationName.trim(),
      code: orgCode,
      plan: 'FREE',
      max_users: 50,
      is_active: true,
      created_by: userId,
    })
    .select('id')
    .single()

  if (orgError || !org) {
    console.error('[REGISTER] Organization creation error:', orgError)
    // Rollback: hapus auth user
    await adminClient.auth.admin.deleteUser(userId)
    return { error: `Gagal membuat organisasi: ${orgError?.message || 'Unknown error'}` }
  }

  const organizationId = org.id
  console.log('[REGISTER] Organization created:', { organizationId, orgCode })

  // ============================================
  // 6. BUAT/UPDATE PROFILE DENGAN ORGANIZATION_ID (menggunakan admin client - bypass RLS)
  // ============================================
  // Tunggu sebentar agar trigger database selesai (jika ada trigger on auth.users insert)
  await new Promise(resolve => setTimeout(resolve, 500))

  const { data: existingProfile } = await adminClient
    .from('profiles')
    .select('id, email, role')
    .eq('id', userId)
    .maybeSingle()

  console.log('[REGISTER] Existing profile check:', {
    exists: !!existingProfile,
    currentRole: existingProfile?.role,
    userId
  })

  if (existingProfile) {
    // Profile sudah ada (dibuat oleh database trigger), update role ke ADMIN_IT
    const { data: updatedProfile, error: updateError } = await adminClient
      .from('profiles')
      .update({
        email: email,
        full_name: fullName,
        role: 'ADMIN_IT',
        organization_id: organizationId,
        is_active: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('id, role, organization_id')
      .single()

    if (updateError) {
      console.error('[REGISTER] Profile update error:', updateError)
      // Rollback: hapus organization dan auth user
      await adminClient.from('organizations').delete().eq('id', organizationId)
      await adminClient.auth.admin.deleteUser(userId)
      return { error: `Gagal mengupdate profil: ${updateError.message}` }
    }

    console.log('[REGISTER] Profile updated successfully:', updatedProfile)
  } else {
    // Profile belum ada, insert baru
    const { data: newProfile, error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: userId,
        email: email,
        full_name: fullName,
        role: 'ADMIN_IT',
        organization_id: organizationId,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select('id, role, organization_id')
      .single()

    if (profileError) {
      console.error('[REGISTER] Profile insert error:', profileError)
      // Rollback: hapus organization dan auth user
      await adminClient.from('organizations').delete().eq('id', organizationId)
      await adminClient.auth.admin.deleteUser(userId)
      return { error: `Gagal menyimpan profil: ${profileError.message}` }
    }

    console.log('[REGISTER] Profile inserted successfully:', newProfile)
  }

  // ============================================
  // 7. VERIFIKASI PROFILE TERSIMPAN DENGAN BENAR
  // ============================================
  const { data: verifyProfile } = await adminClient
    .from('profiles')
    .select('id, email, role, organization_id')
    .eq('id', userId)
    .single()

  console.log('[REGISTER] Profile verification:', verifyProfile)

  if (verifyProfile?.role !== 'ADMIN_IT') {
    console.error('[REGISTER] CRITICAL: Profile role mismatch after save!', {
      expected: 'ADMIN_IT',
      actual: verifyProfile?.role
    })
    // Force update sekali lagi
    await adminClient
      .from('profiles')
      .update({ role: 'ADMIN_IT', organization_id: organizationId })
      .eq('id', userId)
  }

  // ============================================
  // 8. BUAT ORGANIZATION SETTINGS DEFAULT
  // ============================================
  const { error: settingsError } = await adminClient
    .from('organization_settings')
    .insert({
      organization_id: organizationId,
      enable_teaching_dashboard: true,
      enable_student_dashboard: true,
      enable_headmaster_dashboard: true,
      primary_color: '#3B82F6',
      secondary_color: '#10B981',
      notification_enabled: true,
    })

  if (settingsError) {
    // Non-critical error, log saja
    console.error('[REGISTER] Organization settings creation error:', settingsError)
  }

  // ============================================
  // 9. SELESAI
  // ============================================
  revalidatePath('/login')

  console.log('[REGISTER] Registration completed successfully:', {
    userId,
    email,
    organizationId,
    orgCode,
    role: 'ADMIN_IT'
  })

  return {
    success: true,
    message: `Akun Admin IT untuk "${organizationName}" (Kode: ${orgCode}) berhasil dibuat! Silakan login untuk mulai mengelola ekosistem sekolah Anda.`
  }
}
