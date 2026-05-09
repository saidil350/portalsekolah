import { createAdminClient } from '@/utils/supabase/server-admin'
import { authorizeApi } from '@/lib/auth/authorization'

type WithdrawRequest = {
  enrollmentId?: string | null
  classId?: string | null
  studentId?: string | null
}

const ACTIVE_STATUS_CANDIDATES = ['ACTIVE', 'active']
const WITHDRAW_STATUS_CANDIDATES = ['PINDAH', 'NONAKTIF', 'WITHDRAWN']

const isCheckConstraintError = (error: any) =>
  (error?.message || '').toLowerCase().includes('check constraint')

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as WithdrawRequest
    const enrollmentId = body.enrollmentId || null
    const classId = body.classId || null
    const studentId = body.studentId || null

    if (!enrollmentId && (!classId || !studentId)) {
      return Response.json(
        { success: false, error: 'enrollmentId atau (classId + studentId) wajib diisi' },
        { status: 400 }
      )
    }

    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: auth.statusCode })
    }

    const organizationId = auth.user.organization_id
    const adminClient = await createAdminClient()

    let targetId = enrollmentId
    if (!targetId) {
      const { data: existing, error: existingError } = await adminClient
        .from('enrollments')
        .select('id')
        .eq('organization_id', organizationId)
        .eq('class_id', classId as string)
        .eq('student_id', studentId as string)
        .in('status', ACTIVE_STATUS_CANDIDATES)
        .order('created_at', { ascending: false })
        .maybeSingle()

      if (existingError) {
        return Response.json(
          { success: false, error: existingError.message },
          { status: 500 }
        )
      }

      if (!existing) {
        return Response.json(
          { success: false, error: 'Enrollment tidak ditemukan' },
          { status: 404 }
        )
      }

      targetId = existing.id
    }

    for (const statusValue of WITHDRAW_STATUS_CANDIDATES) {
      const { data, error } = await adminClient
        .from('enrollments')
        .update({
          status: statusValue,
          notes: 'Dikeluarkan dari roster oleh Admin IT',
        })
        .eq('id', targetId)
        .eq('organization_id', organizationId)
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
      { success: false, error: 'Status keluar siswa tidak cocok dengan constraint database' },
      { status: 500 }
    )
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || 'Gagal mengeluarkan siswa' },
      { status: 500 }
    )
  }
}
