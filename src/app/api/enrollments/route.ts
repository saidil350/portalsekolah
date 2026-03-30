import { createAdminClient, createClient } from '@/utils/supabase/server'

type EnrollRequest = {
  studentId?: string
  classId?: string
  academicYearId?: string | null
}

const ACTIVE_STATUS_CANDIDATES = ['ACTIVE', 'active']

const isCheckConstraintError = (error: any) =>
  (error?.message || '').toLowerCase().includes('check constraint')

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as EnrollRequest
    const studentId = body.studentId?.trim()
    const classId = body.classId?.trim()
    const academicYearId = body.academicYearId?.trim() || null

    if (!studentId || !classId) {
      return Response.json(
        { success: false, error: 'studentId dan classId wajib diisi' },
        { status: 400 }
      )
    }

    // Auth check (must be logged in)
    const userClient = await createClient()
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Role check (ADMIN_IT)
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'ADMIN_IT') {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Use service role to bypass RLS for insert
    const adminClient = await createAdminClient()

    // Check for ANY existing enrollment (regardless of status)
    // This handles cases where there's a WITHDRAWN enrollment that would cause UNIQUE constraint violation
    const checkQuery = adminClient
      .from('enrollments')
      .select('id, status')
      .eq('class_id', classId)
      .eq('student_id', studentId)

    // Include academic_year_id in check if provided
    if (academicYearId) {
      checkQuery.eq('academic_year_id', academicYearId)
    } else {
      checkQuery.is('academic_year_id', null)
    }

    const { data: existingEnrollment, error: existingError } = await checkQuery.maybeSingle()

    if (existingError) {
      return Response.json(
        { success: false, error: existingError.message },
        { status: 500 }
      )
    }

    // If there's an existing ACTIVE enrollment, return error
    if (existingEnrollment && ACTIVE_STATUS_CANDIDATES.includes(existingEnrollment.status)) {
      return Response.json(
        { success: false, error: 'Siswa sudah terdaftar di kelas ini' },
        { status: 409 }
      )
    }

    // If there's an existing enrollment with non-ACTIVE status (e.g., WITHDRAWN), delete it first
    if (existingEnrollment && !ACTIVE_STATUS_CANDIDATES.includes(existingEnrollment.status)) {
      const { error: deleteError } = await adminClient
        .from('enrollments')
        .delete()
        .eq('id', existingEnrollment.id)

      if (deleteError) {
        return Response.json(
          { success: false, error: deleteError.message },
          { status: 500 }
        )
      }
    }

    const basePayload: any = {
      student_id: studentId,
      class_id: classId,
      academic_year_id: academicYearId,
      enrollment_date: new Date().toISOString().split('T')[0],
    }

    for (const statusValue of ACTIVE_STATUS_CANDIDATES) {
      const { data, error } = await adminClient
        .from('enrollments')
        .insert({ ...basePayload, status: statusValue })
        .select()
        .single()

      if (!error) {
        return Response.json({ success: true, data })
      }

      if (!isCheckConstraintError(error)) {
        return Response.json(
          { success: false, error: error.message, details: error.details, hint: error.hint },
          { status: 500 }
        )
      }
    }

    return Response.json(
      { success: false, error: 'Status enrollment tidak cocok dengan constraint database' },
      { status: 500 }
    )
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || 'Gagal menambahkan siswa ke kelas' },
      { status: 500 }
    )
  }
}
