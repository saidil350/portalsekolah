'use server'

import { createClient } from '@/utils/supabase/server'
import { type User } from '@/types/user'

/**
 * Get current authenticated admin with full profile data
 */
export async function getCurrentAdmin(): Promise<User | null> {
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
    console.error('Error fetching admin profile:', error)
    return null
  }

  return profile as unknown as User
}
