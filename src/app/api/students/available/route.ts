import { createClient } from '@/utils/supabase/server'
import { authorizeApi } from '@/lib/auth/authorization'
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
    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, data: [], error: auth.error }, { status: auth.statusCode })
    }

    const supabase = await createClient()
    const hasIsActive = await detectProfilesHasIsActive(supabase)
    const hasNisn = await detectProfilesHasColumn(supabase, 'nisn')

    const { data: classData } = await supabase
      .from('classes')
      .select('id, academic_year_id')
      .eq('id', classId)
      .eq('organization_id', auth.user.organization_id)
      .maybeSingle()

    if (!classData) {
      return Response.json(
        { success: false, data: [], error: 'Kelas tidak ditemukan di sekolah ini' },
        { status: 404 }
      )
    }

    // Get student IDs that already have an active class in this academic year.
    // This keeps roster assignment one-active-class-per-student-per-year.
    let enrollmentsQuery = supabase
      .from('enrollments')
      .select('student_id')
      .eq('organization_id', auth.user.organization_id)
      .eq('status', 'ACTIVE')

    if (classData.academic_year_id) {
      enrollmentsQuery = enrollmentsQuery.eq('academic_year_id', classData.academic_year_id)
    } else {
      enrollmentsQuery = enrollmentsQuery.is('academic_year_id', null)
    }

    const { data: enrollmentsData, error: enrollmentsError } = await enrollmentsQuery

    if (enrollmentsError) throw enrollmentsError

    const enrolledIds = (enrollmentsData || [])
      .map((e: any) => e.student_id)
      .filter(Boolean)

    const selectFields = ['id', 'full_name', 'email']
    if (hasNisn) selectFields.push('nisn')

    let query = supabase
      .from('profiles')
      .select(selectFields.join(', '))
      .eq('organization_id', auth.user.organization_id)
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
      const searchFields = [`full_name.ilike.%${search}%`, `email.ilike.%${search}%`]
      if (hasNisn) searchFields.splice(1, 0, `nisn.ilike.%${search}%`)
      query = query.or(searchFields.join(','))
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
