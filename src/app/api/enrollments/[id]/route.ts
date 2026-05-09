import { createAdminClient } from '@/utils/supabase/server-admin'
import { authorizeApi } from '@/lib/auth/authorization'
import { NextRequest } from 'next/server'

const WITHDRAW_STATUS_CANDIDATES = ['PINDAH', 'NONAKTIF', 'WITHDRAWN']

const isCheckConstraintError = (error: any) =>
  (error?.message || '').toLowerCase().includes('check constraint')

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await context.params
    if (!enrollmentId) {
      return Response.json(
        { success: false, error: 'enrollmentId wajib diisi' },
        { status: 400 }
      )
    }

    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: auth.statusCode })
    }

    const organizationId = auth.user.organization_id
    const adminClient = await createAdminClient()

    for (const statusValue of WITHDRAW_STATUS_CANDIDATES) {
      const { data, error } = await adminClient
        .from('enrollments')
        .update({
          status: statusValue,
          notes: 'Dikeluarkan dari roster oleh Admin IT',
        })
        .eq('id', enrollmentId)
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
