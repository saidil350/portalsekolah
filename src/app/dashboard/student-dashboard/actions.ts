'use server'

import { createClient } from '@/utils/supabase/server'
import { type User } from '@/types/user'
import { authorizeAction } from '@/lib/auth/authorization'

/**
 * Get current authenticated student with full profile data
 */
export async function getCurrentStudent(): Promise<User | null> {
  const auth = await authorizeAction(['SISWA'])
  if (!auth.success) {
    return null
  }

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
    console.error('Error fetching student profile:', error)
    return null
  }

  return profile as User
}
