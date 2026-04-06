'use server'

import { createAdminClient, createClient } from '@/utils/supabase/server'
import { type User } from '@/types/user'

async function attachOrganizationName(
  profile: User,
  organizationId: string,
  useAdminFallback = false
): Promise<User> {
  if (profile.organization_name) {
    return profile
  }

  const client = useAdminFallback ? await createAdminClient() : await createClient()
  const { data: org, error } = await client
    .from('organizations')
    .select('name')
    .eq('id', organizationId)
    .single()

  if (error || !org?.name) {
    return profile
  }

  return {
    ...profile,
    organization_name: org.name,
  }
}

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
    const enrichedProfile = profile as unknown as User
    if (enrichedProfile.organization_id) {
      return attachOrganizationName(enrichedProfile, enrichedProfile.organization_id)
    }
    return enrichedProfile
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

  const enrichedFallback = fallbackProfile as unknown as User
  if (enrichedFallback.organization_id) {
    return attachOrganizationName(enrichedFallback, enrichedFallback.organization_id, true)
  }

  return enrichedFallback
}
