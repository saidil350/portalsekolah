import { createAdminClient, createClient } from '@/utils/supabase/server'

/**
 * User role types
 */
export type UserRole = 'ADMIN_IT' | 'GURU' | 'KEPALA_SEKOLAH' | 'SISWA'

/**
 * Authenticated user structure
 */
export interface AuthenticatedUser {
  id: string
  email: string
  role: UserRole
  full_name: string
  organization_id: string
  [key: string]: unknown
}

/**
 * Authorization result structure
 */
export type AuthResult =
  | { success: true; user: AuthenticatedUser }
  | { success: false; error: string; statusCode: number }

function isDynamicServerUsageError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    (
      ('digest' in error && error.digest === 'DYNAMIC_SERVER_USAGE') ||
      ('message' in error &&
        typeof error.message === 'string' &&
        error.message.includes('Dynamic server usage'))
    )
  )
}

async function getProfileForAuthorization(userId: string) {
  const supabase = await createClient()

  const primaryResult = await supabase
    .from('profiles')
    .select('id, email, role, full_name, organization_id')
    .eq('id', userId)
    .single()

  if (!primaryResult.error && primaryResult.data) {
    return primaryResult
  }

  console.warn('[AUTH] Primary profile lookup failed, retrying with admin client:', {
    userId,
    error: primaryResult.error?.message,
    code: primaryResult.error?.code,
  })

  const adminClient = await createAdminClient()
  const fallbackResult = await adminClient
    .from('profiles')
    .select('id, email, role, full_name, organization_id')
    .eq('id', userId)
    .single()

  return fallbackResult
}

/**
 * Standardized error responses
 */
export class AuthError {
  static unauthorized(message = 'Unauthorized - Please login to continue') {
    return {
      success: false,
      error: message,
      statusCode: 401
    } as const
  }

  static forbidden(message = 'Forbidden - You do not have permission to perform this action') {
    return {
      success: false,
      error: message,
      statusCode: 403
    } as const
  }

  static serverError(message = 'Internal server error') {
    return {
      success: false,
      error: message,
      statusCode: 500
    } as const
  }
}

/**
 * Authorize API route requests
 * Use this in API route handlers (GET, POST, PUT, DELETE in route.ts files)
 *
 * @param request - The incoming request object
 * @param allowedRoles - Array of roles that can access this endpoint
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * export async function GET(request: Request) {
 *   const auth = await authorizeApi(request, ['ADMIN_IT'])
 *   if (!auth.success) {
 *     return Response.json(
 *       { success: false, error: auth.error },
 *       { status: auth.statusCode }
 *     )
 *   }
 *
 *   // auth.user is available here
 *   // ... your logic
 * }
 * ```
 */
export async function authorizeApi(
  request: Request,
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  try {
    void request
    const supabase = await createClient()

    // Step 1: Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return AuthError.unauthorized()
    }

    // Step 2: Fetch user profile with role
    const { data: profile, error: profileError } = await getProfileForAuthorization(user.id)

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return AuthError.serverError('Failed to verify user permissions')
    }

    // Step 3: Validate role
    if (!profile.role || !allowedRoles.includes(profile.role as UserRole)) {
      return AuthError.forbidden()
    }

    return {
      success: true,
      user: profile as AuthenticatedUser
    }
  } catch (error: unknown) {
    if (isDynamicServerUsageError(error)) {
      throw error
    }
    console.error('Authorization error:', error)
    return AuthError.serverError('Authorization check failed')
  }
}

/**
 * Authorize server actions
 * Use this in server action functions (marked with 'use server')
 *
 * @param allowedRoles - Array of roles that can perform this action
 * @returns AuthResult with user data or error
 *
 * @example
 * ```typescript
 * 'use server'
 * export async function createAcademicYear(formData: AcademicYearFormData) {
 *   const auth = await authorizeAction(['ADMIN_IT'])
 *   if (!auth.success) {
 *     return { success: false, error: auth.error }
 *   }
 *
 *   // auth.user is available here
 *   // ... your logic
 * }
 * ```
 */
export async function authorizeAction(
  allowedRoles: UserRole[]
): Promise<AuthResult> {
  try {
    const supabase = await createClient()

    // Step 1: Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return AuthError.unauthorized()
    }

    // Step 2: Fetch user profile with role
    const { data: profile, error: profileError } = await getProfileForAuthorization(user.id)

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError)
      return AuthError.serverError('Failed to verify user permissions')
    }

    // Step 3: Validate role
    if (!profile.role || !allowedRoles.includes(profile.role as UserRole)) {
      return AuthError.forbidden()
    }

    return {
      success: true,
      user: profile as AuthenticatedUser
    }
  } catch (error: unknown) {
    if (isDynamicServerUsageError(error)) {
      throw error
    }
    console.error('Authorization error:', error)
    return AuthError.serverError('Authorization check failed')
  }
}

/**
 * Authorize dashboard layout access
 * Use this in dashboard layout files to verify user can access the dashboard
 *
 * @param allowedRole - The single role that can access this dashboard
 * @returns Object with user data or null (if unauthorized)
 *
 * @example
 * ```typescript
 * export default async function AdminLayout({ children }) {
 *   const authResult = await authorizeDashboard('ADMIN_IT')
 *
 *   if (!authResult) {
 *     redirect('/unauthorized?role=ADMIN_IT')
 *   }
 *
 *   const { user } = authResult
 *   return <div>{children}</div>
 * }
 * ```
 */
export async function authorizeDashboard(
  allowedRole: UserRole
): Promise<{ user: AuthenticatedUser } | null> {
  try {
    const supabase = await createClient()

    // Step 1: Check authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      // Unauthenticated users should be redirected to login
      console.log('[AUTH] Dashboard authorization failed - User not authenticated:', {
        hasUser: !!user,
        userError: userError?.message,
        allowedRole
      })
      return null
    }

    console.log('[AUTH] Dashboard authorization - User authenticated:', {
      userId: user.id,
      userEmail: user.email,
      allowedRole
    })

    // Step 2: Fetch user profile with role
    const { data: profile, error: profileError } = await getProfileForAuthorization(user.id)

    if (profileError || !profile) {
      console.error('[AUTH] Dashboard authorization - Error fetching user profile:', {
        profileError: profileError?.message,
        profileCode: profileError?.code,
        profileHint: profileError?.hint,
        userId: user.id
      })
      return null
    }

    console.log('[AUTH] Dashboard authorization - Profile fetched:', {
      profileRole: profile.role,
      profileEmail: profile.email,
      allowedRole,
      roleMatches: profile.role === allowedRole
    })

    // Step 3: Validate role matches dashboard requirement
    if (!profile.role || profile.role !== allowedRole) {
      console.log('[AUTH] Dashboard authorization - Role mismatch:', {
        profileRole: profile.role,
        allowedRole,
        hasRole: !!profile.role
      })
      return null
    }

    console.log('[AUTH] Dashboard authorization - SUCCESS:', {
      userId: profile.id,
      role: profile.role,
      allowedRole
    })

    return {
      user: profile as AuthenticatedUser
    }
  } catch (error: unknown) {
    if (isDynamicServerUsageError(error)) {
      throw error
    }
    console.error('[AUTH] Dashboard authorization - Exception:', error)
    return null
  }
}

/**
 * Check if user has a specific role
 * Helper function for additional role checks in your logic
 *
 * @param user - Authenticated user object
 * @param role - Role to check for
 * @returns boolean indicating if user has the role
 */
export function hasRole(user: AuthenticatedUser, role: UserRole): boolean {
  return user.role === role
}

/**
 * Check if user has any of the allowed roles
 * Helper function for checking multiple roles
 *
 * @param user - Authenticated user object
 * @param roles - Array of roles to check against
 * @returns boolean indicating if user has any of the roles
 */
export function hasAnyRole(user: AuthenticatedUser, roles: UserRole[]): boolean {
  return roles.includes(user.role)
}

/**
 * Log authorization failure for security monitoring
 * Use this to track suspicious access attempts
 *
 * @param context - Context about the failed authorization
 */
export function logAuthFailure(context: {
  endpoint?: string
  action?: string
  requiredRole?: UserRole | UserRole[]
  userId?: string
  reason?: string
}) {
  console.warn('[AUTH] Authorization failure', {
    timestamp: new Date().toISOString(),
    ...context
  })
}
