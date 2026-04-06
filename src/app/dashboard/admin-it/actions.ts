'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
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

  if (!error && profile) {
    return profile as unknown as User
  }

  console.warn('[ADMIN] Primary admin profile lookup failed, retrying with admin client:', {
    userId: user.id,
    error: error?.message,
    code: error?.code,
  })

  const adminClient = await createAdminClient()
  const { data: fallbackProfile, error: fallbackError } = await adminClient
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (fallbackError || !fallbackProfile) {
    console.error('Error fetching admin profile:', fallbackError ?? error)
    return null
  }

  return fallbackProfile as unknown as User
}
