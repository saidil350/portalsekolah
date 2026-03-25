'use server'

import { createClient } from '@/utils/supabase/server'
import { type User } from '@/types/user'

/**
 * Get current authenticated user with full profile data
 */
export async function getCurrentTeacher(): Promise<User | null> {
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
    console.error('Error fetching teacher profile:', error)
    return null
  }

  return profile as User
}

/**
 * Get list of students for grading
 */
export async function getStudentsForGrading(limit: number = 10): Promise<User[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'SISWA')
    .eq('status', 'ACTIVE')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }

  return (data || []) as User[]
}

/**
 * Get statistics for teaching dashboard
 */
export async function getTeachingStats() {
  const supabase = await createClient()

  // Get total students
  const { count: totalStudents } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'SISWA')
    .eq('status', 'ACTIVE')

  // Get pending grading (students with recent submissions - placeholder logic)
  // In real app, this would check assignments table
  const pendingReviews = 0 // Placeholder

  return {
    totalStudents: totalStudents || 0,
    pendingReviews,
  }
}
