import { createAdminClient, createClient } from '@/utils/supabase/server'

const WITHDRAW_STATUS_CANDIDATES = ['WITHDRAWN', 'NONAKTIF', 'PINDAH']

const isCheckConstraintError = (error: any) =>
  (error?.message || '').toLowerCase().includes('check constraint')

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const enrollmentId = params.id
    if (!enrollmentId) {
      return Response.json(
        { success: false, error: 'enrollmentId wajib diisi' },
        { status: 400 }
      )
    }

    // Auth check
    const userClient = await createClient()
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Role check
    const { data: profile, error: profileError } = await userClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'ADMIN_IT') {
      return Response.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    // Use service role to bypass RLS for update
    const adminClient = await createAdminClient()

    for (const statusValue of WITHDRAW_STATUS_CANDIDATES) {
      const { data, error } = await adminClient
        .from('enrollments')
        .update({ status: statusValue })
        .eq('id', enrollmentId)
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

    const { data: deletedRow, error: deleteError } = await adminClient
      .from('enrollments')
      .delete()
      .eq('id', enrollmentId)
      .select()
      .single()

    if (deleteError) {
      return Response.json(
        { success: false, error: deleteError.message, details: deleteError.details, hint: deleteError.hint },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data: deletedRow, deleted: true })
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message || 'Gagal mengeluarkan siswa' },
      { status: 500 }
    )
  }
}
