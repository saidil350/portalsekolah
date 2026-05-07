import { createAdminClient } from '@/utils/supabase/server-admin'
import { authorizeApi } from '@/lib/auth/authorization'
import { revalidatePath } from 'next/cache'
import { NextRequest } from 'next/server'

type UpdateClassRequest = {
  wali_kelas_id?: string | null
  home_room_id?: string | null
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await context.params
    const body = (await request.json().catch(() => ({}))) as UpdateClassRequest

    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: auth.statusCode })
    }

    const organizationId = auth.user.organization_id
    const adminClient = await createAdminClient()

    const { data: existingClass } = await adminClient
      .from('classes')
      .select('id')
      .eq('id', classId)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (!existingClass) {
      return Response.json({ success: false, error: 'Kelas tidak ditemukan di sekolah ini' }, { status: 404 })
    }

    // Prepare update data - ONLY update wali_kelas_id and home_room_id
    const updateData: any = {}

    // Only update these specific fields, leave everything else unchanged
    if (body.wali_kelas_id !== undefined) {
      if (body.wali_kelas_id) {
        const { data: teacher } = await adminClient
          .from('profiles')
          .select('id')
          .eq('id', body.wali_kelas_id)
          .eq('organization_id', organizationId)
          .eq('role', 'GURU')
          .maybeSingle()

        if (!teacher) {
          return Response.json({ success: false, error: 'Wali kelas tidak valid untuk sekolah ini' }, { status: 403 })
        }
      }

      updateData.wali_kelas_id = body.wali_kelas_id
    }
    if (body.home_room_id !== undefined) {
      if (body.home_room_id) {
        const { data: room } = await adminClient
          .from('rooms')
          .select('id')
          .eq('id', body.home_room_id)
          .eq('organization_id', organizationId)
          .maybeSingle()

        if (!room) {
          return Response.json({ success: false, error: 'Ruangan tidak valid untuk sekolah ini' }, { status: 403 })
        }
      }

      updateData.home_room_id = body.home_room_id
    }

    console.log('Updating class:', classId, 'with data:', updateData)

    // Update class
    const { data, error } = await adminClient
      .from('classes')
      .update(updateData)
      .eq('id', classId)
      .eq('organization_id', organizationId)
      .select(`
        *,
        wali_kelas:profiles!classes_wali_kelas_id_fkey(id, full_name),
        home_room:rooms(id, name)
      `)
      .single()

    if (error) {
      console.error('Error updating class:', error)
      throw error
    }

    console.log('Update successful, revalidating paths...')

    // Revalidate paths to refresh UI
    revalidatePath('/dashboard/admin-it/data-management')
    revalidatePath('/dashboard/admin-it/kelas-dan-roster')
    revalidatePath(`/dashboard/admin-it/kelas-dan-roster/${classId}`)

    return Response.json({ success: true, data })
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Gagal mengupdate info kelas',
        details: error.details,
        hint: error.hint,
      },
      { status: 500 }
    )
  }
}
