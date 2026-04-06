import { createClient } from '@supabase/supabase-js'

/**
 * Admin Supabase client with service role key.
 * This client is stateless on purpose so user session cookies never
 * override the Authorization header and accidentally re-enable RLS.
 */
export async function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
