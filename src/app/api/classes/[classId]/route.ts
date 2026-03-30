import { createClient, createAdminClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

type UpdateClassRequest = {
  wali_kelas_id?: string | null
  home_room_id?: string | null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params
    const body = (await request.json().catch(() => ({}))) as UpdateClassRequest

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

    // Use admin client to bypass RLS
    const adminClient = await createAdminClient()

    // Prepare update data - ONLY update wali_kelas_id and home_room_id
    const updateData: any = {}

    // Only update these specific fields, leave everything else unchanged
    if (body.wali_kelas_id !== undefined) {
      updateData.wali_kelas_id = body.wali_kelas_id
    }
    if (body.home_room_id !== undefined) {
      updateData.home_room_id = body.home_room_id
    }

    console.log('Updating class:', classId, 'with data:', updateData)

    // Update class
    const { data, error } = await adminClient
      .from('classes')
      .update(updateData)
      .eq('id', classId)
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
