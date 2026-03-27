import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Check if Supabase environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return early if Supabase is not configured - allow the request to proceed
    return supabaseResponse
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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

  // Tentukan rute terlebih dahulu sebelum memanggil API eksternal
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth')

  // Hanya ambil user jika kita berada di rute yang memerlukan pengecekan session/role
  // ATAU jika kita ingin memperbarui cookie secara umum (opsional, tapi skip untuk landing page demi kecepatan)
  let user = null
  if (isDashboardRoute || isLoginPage || isAuthCallback) {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    user = authUser
  }

  const isAuthenticated = !!user

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
