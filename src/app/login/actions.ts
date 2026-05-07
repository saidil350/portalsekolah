'use server'

import { createClient } from '@/utils/supabase/server'
import { createAdminClient } from '@/utils/supabase/server-admin'
import { redirect } from 'next/navigation'

const VALID_ROLES = ['ADMIN_IT', 'GURU', 'KEPALA_SEKOLAH', 'SISWA'] as const

function normalizeIdentifier(value: string) {
  return value.trim()
}

function normalizeOrganizationCode(value: string) {
  return value.trim().toUpperCase()
}

async function findProfileByIdentifier(
  adminClient: Awaited<ReturnType<typeof createAdminClient>>,
  organizationId: string,
  identifier: string
) {
  const normalizedIdentifier = normalizeIdentifier(identifier)

  if (normalizedIdentifier.includes('@')) {
    return adminClient
      .from('profiles')
      .select('id, email, role, organization_id, is_active, status')
      .eq('organization_id', organizationId)
      .ilike('email', normalizedIdentifier)
      .maybeSingle()
  }

  const { data: profileByNip, error: nipError } = await adminClient
    .from('profiles')
    .select('id, email, role, organization_id, is_active, status')
    .eq('organization_id', organizationId)
    .eq('nip', normalizedIdentifier)
    .maybeSingle()

  if (nipError || profileByNip) {
    return { data: profileByNip, error: nipError }
  }

  return adminClient
    .from('profiles')
    .select('id, email, role, organization_id, is_active, status')
    .eq('organization_id', organizationId)
    .eq('nisn', normalizedIdentifier)
    .maybeSingle()
}

export async function login(formData: FormData) {
  const organizationCode = normalizeOrganizationCode(formData.get('organizationCode') as string)
  const identifier = formData.get('identifier') as string
  const password = formData.get('password') as string

  if (!organizationCode || !identifier || !password) {
    return { error: 'Kode sekolah, Email/NIP/NISN, dan password harus diisi.' }
  }

  const supabase = await createClient()
  const adminClient = await createAdminClient()

  const { data: organization, error: organizationError } = await adminClient
    .from('organizations')
    .select('id, code, is_active')
    .eq('code', organizationCode)
    .maybeSingle()

  if (organizationError || !organization) {
    return { error: 'Kode sekolah tidak ditemukan atau belum terdaftar.' }
  }

  if (!organization.is_active) {
    return { error: 'Sekolah ini sedang tidak aktif. Hubungi administrator PortalSekolah.' }
  }

  const { data: profile, error: profileError } = await findProfileByIdentifier(
    adminClient,
    organization.id,
    identifier
  )

  if (profileError || !profile?.email) {
    return { error: 'Akun tidak ditemukan pada kode sekolah tersebut.' }
  }

  if (profile.organization_id !== organization.id) {
    return { error: 'Akun tidak sesuai dengan kode sekolah.' }
  }

  if (profile.is_active === false || profile.status === 'INACTIVE') {
    return { error: 'Akun Anda sedang tidak aktif. Hubungi Admin IT sekolah.' }
  }

  if (!VALID_ROLES.includes(profile.role as typeof VALID_ROLES[number])) {
    return { error: 'Role akun tidak valid. Hubungi Admin IT sekolah.' }
  }

  // Melakukan login menggunakan Email dan Password
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email: profile.email,
    password,
  })

  if (error) {
    return { error: 'Login gagal. Periksa kembali kredensial Anda.' }
  }

  // Update last_login setelah login berhasil dan fetch user role
  let userRole = profile.role
  let userId = authData.user?.id

  if (userId && userId !== profile.id) {
    await supabase.auth.signOut()
    return { error: 'Session akun tidak sesuai dengan kode sekolah.' }
  }

  if (userId) {
    // Update last_login terpisah (tidak pakai .single() agar tidak error jika 0 rows)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
      .eq('organization_id', organization.id)

    if (updateError) {
      console.error('[LOGIN] Gagal mengupdate last_login:', updateError)
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

  // IMPORTANT: Kita return success dengan redirect URL
  // dan gunakan router.push di client side untuk memastikan session tersimpan
  return { success: true, redirect: dashboardPath }
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
