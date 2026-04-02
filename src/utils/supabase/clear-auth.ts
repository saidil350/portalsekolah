/**
 * Clear all Supabase auth cookies from the response
 * This is useful when the refresh token is invalid or expired
 */
export function clearAuthCookies(response: Response): Response {
  const authCookieNames = [
    'sb-access-token',
    'sb-refresh-token',
    'sb-access-token-token',
    'sb-refresh-token-token',
  ]

  const headers = new Headers(response.headers)

  authCookieNames.forEach(name => {
    headers.append(
      'Set-Cookie',
      `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
    )
  })

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Check if an error is related to an invalid refresh token
 */
export function isInvalidRefreshTokenError(error: any): boolean {
  return (
    error?.code === 'refresh_token_not_found' ||
    error?.message?.includes('refresh_token_not_found') ||
    error?.message?.includes('Invalid Refresh Token')
  )
}
