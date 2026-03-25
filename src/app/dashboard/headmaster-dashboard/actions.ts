'use server'

import { createClient } from '@/utils/supabase/server'
import { type User } from '@/types/user'

/**
 * Get current authenticated headmaster with full profile data
 */
export async function getCurrentHeadmaster(): Promise<User | null> {
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
    console.error('Error fetching headmaster profile:', error)
    return null
  }

  return profile as User
}

/**
 * Get statistics for headmaster dashboard
 */
export async function getHeadmasterStats() {
  const supabase = await createClient()

  // Get total students
  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'SISWA')
    .eq('status', 'ACTIVE')

  // Get total teachers
  const { count: totalTeachers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'GURU')
    .eq('status', 'ACTIVE')

  return {
    totalStudents: totalStudents || 0,
    totalTeachers: totalTeachers || 0,
  }
}
