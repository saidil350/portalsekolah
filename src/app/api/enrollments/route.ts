import { createAdminClient } from '@/utils/supabase/server-admin'
import { authorizeApi } from '@/lib/auth/authorization'

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
    const requestedAcademicYearId = body.academicYearId?.trim() || null

    if (!studentId || !classId) {
      return Response.json(
        { success: false, error: 'studentId dan classId wajib diisi' },
        { status: 400 }
      )
    }

    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: auth.statusCode })
    }

    const organizationId = auth.user.organization_id
    const adminClient = await createAdminClient()

    const [{ data: classData }, { data: studentData }] = await Promise.all([
      adminClient.from('classes').select('id, academic_year_id').eq('id', classId).eq('organization_id', organizationId).maybeSingle(),
      adminClient.from('profiles').select('id').eq('id', studentId).eq('organization_id', organizationId).eq('role', 'SISWA').maybeSingle(),
    ])

    const academicYearId = requestedAcademicYearId || classData?.academic_year_id || null

    const { data: academicYearData } = academicYearId
      ? await adminClient
        .from('academic_years')
        .select('id')
        .eq('id', academicYearId)
        .eq('organization_id', organizationId)
        .maybeSingle()
      : { data: { id: null } }

    if (!classData || !studentData || (academicYearId && !academicYearData)) {
      return Response.json(
        { success: false, error: 'Kelas, siswa, atau tahun ajaran tidak valid untuk sekolah ini' },
        { status: 403 }
      )
    }

    const activeQuery = adminClient
      .from('enrollments')
      .select('id, class_id, class:classes(name, code)')
      .eq('organization_id', organizationId)
      .eq('student_id', studentId)
      .in('status', ACTIVE_STATUS_CANDIDATES)

    if (academicYearId) {
      activeQuery.eq('academic_year_id', academicYearId)
    } else {
      activeQuery.is('academic_year_id', null)
    }

    const { data: activeEnrollment, error: activeError } = await activeQuery.limit(1).maybeSingle()

    if (activeError) {
      return Response.json(
        { success: false, error: activeError.message },
        { status: 500 }
      )
    }

    if (activeEnrollment && activeEnrollment.class_id !== classId) {
      const className = (activeEnrollment.class as any)?.name || (activeEnrollment.class as any)?.code || 'kelas lain'
      return Response.json(
        { success: false, error: `Siswa sudah aktif di ${className} pada tahun ajaran ini. Keluarkan dari kelas lama terlebih dahulu.` },
        { status: 409 }
      )
    }

    if (activeEnrollment?.class_id === classId) {
      return Response.json(
        { success: false, error: 'Siswa sudah terdaftar aktif di kelas ini' },
        { status: 409 }
      )
    }

    const checkQuery = adminClient
      .from('enrollments')
      .select('id, status')
      .eq('organization_id', organizationId)
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

    // If there is an old non-active row in the same class/year, reactivate it
    // instead of deleting history or creating a duplicate.
    if (existingEnrollment && !ACTIVE_STATUS_CANDIDATES.includes(existingEnrollment.status)) {
      const { data, error } = await adminClient
        .from('enrollments')
        .update({
          status: 'ACTIVE',
          enrollment_date: new Date().toISOString().split('T')[0],
          notes: null,
        })
        .eq('id', existingEnrollment.id)
        .eq('organization_id', organizationId)
        .select()
        .single()

      if (error) {
        return Response.json(
          { success: false, error: error.message, details: error.details, hint: error.hint },
          { status: 500 }
        )
      }

      return Response.json({ success: true, data })
    }

    const basePayload: any = {
      student_id: studentId,
      class_id: classId,
      academic_year_id: academicYearId,
      enrollment_date: new Date().toISOString().split('T')[0],
      organization_id: organizationId,
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
