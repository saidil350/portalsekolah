import type { AcademicYear, Semester } from '@/types/shared'

type SupabaseLike = {
  from: (table: string) => any
}

export type ActiveAcademicPeriod = {
  academicYear: AcademicYear | null
  semester: Semester | null
}

export async function getActiveAcademicPeriod(
  supabase: SupabaseLike,
  organizationId: string
): Promise<ActiveAcademicPeriod> {
  const { data: academicYear, error: academicYearError } = await supabase
    .from('academic_years')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (academicYearError) throw academicYearError

  if (!academicYear) {
    return { academicYear: null, semester: null }
  }

  const { data: semester, error: semesterError } = await supabase
    .from('semesters')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('academic_year_id', academicYear.id)
    .eq('is_active', true)
    .order('semester_number', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (semesterError) throw semesterError

  return {
    academicYear: academicYear as AcademicYear,
    semester: (semester as Semester | null) || null,
  }
}

export async function resolveAcademicYearId(
  supabase: SupabaseLike,
  organizationId: string,
  inputAcademicYearId?: string | null
) {
  if (inputAcademicYearId) {
    const { data, error } = await supabase
      .from('academic_years')
      .select('id')
      .eq('id', inputAcademicYearId)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (error) throw error
    return data?.id || null
  }

  const { academicYear } = await getActiveAcademicPeriod(supabase, organizationId)
  return academicYear?.id || null
}

export async function resolveSemesterForSchedule(
  supabase: SupabaseLike,
  organizationId: string,
  params: {
    classId: string
    fallbackAcademicYearId?: string | null
    fallbackSemester?: number | null
  }
) {
  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id, academic_year_id, semester:semesters(id, semester_number)')
    .eq('id', params.classId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (classError) throw classError

  const classSemester = Array.isArray(classData?.semester)
    ? classData?.semester[0]
    : classData?.semester

  if (classData?.academic_year_id && classSemester?.semester_number) {
    return {
      academicYearId: classData.academic_year_id as string,
      semesterNumber: classSemester.semester_number as number,
    }
  }

  const { academicYear, semester } = await getActiveAcademicPeriod(supabase, organizationId)

  return {
    academicYearId: classData?.academic_year_id || params.fallbackAcademicYearId || academicYear?.id || null,
    semesterNumber: classSemester?.semester_number || params.fallbackSemester || semester?.semester_number || null,
  }
}
