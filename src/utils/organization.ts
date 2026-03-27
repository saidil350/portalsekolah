/**
 * Organization Helper Functions
 * Untuk sistem multi-tenant/multi-ekosistem
 */

import { createClient } from './supabase/server'

/**
 * Get organization_id dari user yang sedang login
 * @returns organization_id atau null jika tidak ada
 */
export async function getCurrentOrganizationId(): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .single()

  return profile?.organization_id || null
}

/**
 * Get organization_name dari user yang sedang login
 * @returns organization_name atau null jika tidak ada
 */
export async function getCurrentOrganizationName(): Promise<string | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_name')
    .eq('id', user.id)
    .single()

  return profile?.organization_name || null
}

/**
 * Cek apakah user yang sedang login adalah Admin IT
 * @returns boolean
 */
export async function isCurrentUserAdminIT(): Promise<boolean> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  return profile?.role === 'ADMIN_IT'
}

/**
 * Filter query builder untuk organization_id
 * Mengembalikan filter object untuk Supabase query
 * @param organizationId - organization_id untuk filter (optional)
 * @returns filter object
 */
export function getOrganizationFilter(organizationId?: string) {
  if (!organizationId) {
    throw new Error('organization_id is required for data filtering')
  }

  return { organization_id: organizationId }
}

/**
 * Validasi bahwa data yang diakses milik organization user
 * @param recordOrganizationId - organization_id dari record yang akan diakses
 * @param userOrganizationId - organization_id dari user yang sedang login
 * @returns boolean - true jika user berhak mengakses data
 */
export function validateOrganizationAccess(
  recordOrganizationId: string | null | undefined,
  userOrganizationId: string
): boolean {
  if (!recordOrganizationId) {
    return false
  }

  return recordOrganizationId === userOrganizationId
}

/**
 * Wrapper untuk memastikan user hanya mengakses data dari organization-nya sendiri
 * Throw error jika organization tidak match
 * @param recordOrganizationId - organization_id dari record
 * @param userOrganizationId - organization_id dari user
 * @throws Error jika organization tidak match
 */
export function assertOrganizationAccess(
  recordOrganizationId: string | null | undefined,
  userOrganizationId: string
): void {
  if (!validateOrganizationAccess(recordOrganizationId, userOrganizationId)) {
    throw new Error('Akses ditolak: Anda tidak memiliki akses ke data dari organisasi lain.')
  }
}
