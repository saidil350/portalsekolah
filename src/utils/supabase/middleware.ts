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

  // Ambil user auth saat ini agar cookie dapat diperbarui
  const { data: { user } } = await supabase.auth.getUser()

  // Cek autentikasi untuk route yang dilindungi
  const isAuthenticated = !!user
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')

  // Redirect user yang belum login dari dashboard ke halaman login
  if (isDashboardRoute && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect user yang sudah login dari halaman login ke dashboard sesuai role
  if (isLoginPage && isAuthenticated) {
    // Fetch user role dari database
    let userRole = 'ADMIN_IT' // Default fallback

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role) {
        userRole = profile.role
      }
    }

    // Mapping role ke dashboard path
    const roleDashboardMap: Record<string, string> = {
      'ADMIN_IT': '/dashboard/admin-it',
      'GURU': '/dashboard/teaching-dashboard',
      'KEPALA_SEKOLAH': '/dashboard/headmaster-dashboard',
      'SISWA': '/dashboard/student-dashboard'
    }

    // Redirect ke dashboard sesuai role
    const dashboardPath = roleDashboardMap[userRole] || '/dashboard/admin-it'
    return NextResponse.redirect(new URL(dashboardPath, request.url))
  }

  return supabaseResponse
}
