import { createClient } from '@/utils/supabase/server'
import { detectProfilesHasColumn, detectProfilesHasIsActive } from '@/utils/supabase/profile-columns'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId')
  const search = searchParams.get('search') || ''

  if (!classId) {
    return Response.json(
      { success: false, data: [], error: 'classId wajib diisi' },
      { status: 400 }
    )
  }

  try {
    const supabase = await createClient()
    const hasIsActive = await detectProfilesHasIsActive(supabase)
    const hasNisn = await detectProfilesHasColumn(supabase, 'nisn')

    // Get enrolled student IDs
    const { data: enrollmentsData, error: enrollmentsError } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('class_id', classId)
      .eq('status', 'ACTIVE')

    if (enrollmentsError) throw enrollmentsError

    const enrolledIds = (enrollmentsData || [])
      .map((e: any) => e.student_id)
      .filter(Boolean)

    const selectFields = ['id', 'full_name', 'email']
    if (hasNisn) selectFields.push('nisn')

    let query = supabase
      .from('profiles')
      .select(selectFields.join(', '))
      .eq('role', 'SISWA')
      .order('full_name')

    if (hasIsActive) {
      query = query.eq('is_active', true)
    }

    if (enrolledIds.length > 0) {
      const inList = `(${enrolledIds.map((id: string) => `"${id}"`).join(',')})`
      query = query.not('id', 'in', inList)
    }

    if (search) {
      query = query.or(`full_name.ilike.%${search}%,nisn.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error } = await query
    if (error) throw error

    return Response.json({ success: true, data: data || [] })
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        data: [],
        error: error.message || 'Gagal mengambil data siswa',
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
      { status: 500 }
    )
  }
}
