import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.json({ success: true, message: 'Auth cookies cleared' })

  // Clear all Supabase auth cookies
  const authCookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-access-token-token',
    'sb-refresh-token-token',
  ]

  authCookieNames.forEach(name => {
    response.cookies.delete(name)
    response.cookies.set(name, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    })
  })

  return response
}
