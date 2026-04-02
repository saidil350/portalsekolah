'use client'

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  // Listen for auth errors and clear session if refresh token is invalid
  client.auth.onAuthStateChange((event, session) => {
    if (event === 'TOKEN_REFRESHED' && !session) {
      console.warn('Session was lost during token refresh, redirecting to login')
      window.location.href = '/login'
    }
  })

  return client;
}
