import { createClient, createAdminClient } from '@/utils/supabase/server'

export async function POST(request: Request) {
  try {
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
      return Response.json({ success: false, error: 'Forbidden - Admin only' }, { status: 403 })
    }

    const adminClient = await createAdminClient()

    // 1. Cek kelas yang is_active = false atau null
    const { data: inactiveClasses, error: checkError } = await adminClient
      .from('classes')
      .select('id, name, code, is_active, created_at')
      .or('is_active.is.false,is_active.is.null')

    if (checkError) {
      console.error('Error checking inactive classes:', checkError)
      return Response.json({ success: false, error: checkError.message }, { status: 500 })
    }

    console.log(`Found ${inactiveClasses?.length || 0} inactive classes`)

    // 2. Recovery: Set semua kelas ke is_active = true
    const { data: updatedClasses, error: updateError } = await adminClient
      .from('classes')
      .update({ is_active: true })
      .or('is_active.is.false,is_active.is.null')
      .select('id, name, code')

    if (updateError) {
      console.error('Error recovering classes:', updateError)
      return Response.json({ success: false, error: updateError.message }, { status: 500 })
    }

    console.log(`Recovered ${updatedClasses?.length || 0} classes`)

    return Response.json({
      success: true,
      message: `Berhasil mengembalikan ${updatedClasses?.length || 0} kelas`,
      recovered: updatedClasses || [],
      previouslyInactive: inactiveClasses || []
    })
  } catch (error: any) {
    console.error('Error in recover-classes:', error)
    return Response.json(
      {
        success: false,
        error: error.message || 'Gagal mengembalikan kelas',
        details: error.details,
        hint: error.hint,
      },
      { status: 500 }
    )
  }
}
