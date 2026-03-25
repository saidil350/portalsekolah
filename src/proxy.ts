import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function proxy(request: NextRequest) {
  // update user's auth session
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Cocok dengan semua path tujuan kecuali:
     * - _next/static (jalur statis halaman)
     * - _next/image (tujuan gambar yang dioptimalkan)
     * - favicon.ico (ikon fav browser)
     * - gambar dan file statis lainnya dengan ekstensi .svg, .png, .jpg, dll.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
