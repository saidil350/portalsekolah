import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Only call getUser for protected routes to avoid excessive API calls
  const pathname = request.nextUrl.pathname
  const isProtectedRoute = pathname.startsWith('/dashboard') ||
                           pathname.startsWith('/api/') ||
                           pathname === '/login'

  if (isProtectedRoute) {
    try {
      await supabase.auth.getUser()
    } catch (error: any) {
      // If refresh token is invalid, clear the auth cookies
      if (error?.code === 'refresh_token_not_found' ||
          error?.message?.includes('refresh_token_not_found')) {
        console.debug('Clearing invalid auth cookies due to refresh_token_not_found')
        // Clear the auth cookies by setting them with Max-Age=0
        supabaseResponse.cookies.delete('sb-access-token')
        supabaseResponse.cookies.delete('sb-refresh-token')
      }
    }
  }

  return supabaseResponse
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
