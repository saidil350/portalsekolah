import { createClient } from '@/utils/supabase/server'
import { authorizeApi } from '@/lib/auth/authorization'

export async function GET(request: Request) {
  try {
    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: auth.statusCode })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('rooms')
      .select('id, name, code')
      .eq('organization_id', auth.user.organization_id)
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
