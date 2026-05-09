import { createClient } from '@/utils/supabase/server'
import { authorizeApi } from '@/lib/auth/authorization'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const academicYearId = searchParams.get('academicYearId')
    const currentClassId = searchParams.get('currentClassId')

    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return Response.json({ success: false, error: auth.error }, { status: auth.statusCode })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('organization_id', auth.user.organization_id)
      .eq('role', 'GURU')
      .order('full_name')

    if (error) throw error

    const teachers = data || []

    if (!academicYearId || teachers.length === 0) {
      return Response.json({ success: true, data: teachers })
    }

    let homeroomQuery = supabase
      .from('classes')
      .select('id, name, code, wali_kelas_id')
      .eq('organization_id', auth.user.organization_id)
      .eq('academic_year_id', academicYearId)
      .eq('is_active', true)
      .in('wali_kelas_id', teachers.map((teacher: any) => teacher.id))

    if (currentClassId) {
      homeroomQuery = homeroomQuery.neq('id', currentClassId)
    }

    const { data: homeroomClasses, error: homeroomError } = await homeroomQuery

    if (homeroomError) throw homeroomError

    const homeroomByTeacher = new Map(
      (homeroomClasses || []).map((cls: any) => [cls.wali_kelas_id, cls])
    )

    return Response.json({
      success: true,
      data: teachers.map((teacher: any) => {
        const homeroomClass = homeroomByTeacher.get(teacher.id) as any
        return {
          ...teacher,
          homeroom_class_id: homeroomClass?.id || null,
          homeroom_class_name: homeroomClass?.name || null,
          homeroom_class_code: homeroomClass?.code || null,
        }
      }),
    })
  } catch (error: any) {
    return Response.json(
      {
        success: false,
        error: error.message || 'Gagal mengambil data guru',
        details: error.details,
        hint: error.hint,
      },
      { status: 500 }
    )
  }
}
