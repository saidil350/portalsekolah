import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  try {
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

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('rooms')
      .select('id, name, code')
      .eq('is_active', true)
      .order('name')

    if (error) throw error

    return Response.json({ success: true, data: data || [] })
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Gagal mengambil data ruangan',
        details: error.details,
        hint: error.hint,
      },
      { status: 500 }
    )
  }
}
