import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()

    // Get active academic year
    const { data: activeAY } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    const academicYearId = activeAY?.id

    // Get total active students (role = SISWA, is_active = true)
    const { count: totalStudents } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'SISWA')
      .eq('is_active', true)

    // Get total active teachers (role = GURU, is_active = true)
    const { count: totalTeachers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'GURU')
      .eq('is_active', true)

    // Get total active classes
    let activeClasses = 0
    if (academicYearId) {
      const { count } = await supabase
        .from('classes')
        .select('*', { count: 'exact', head: true })
        .eq('academic_year_id', academicYearId)
        .eq('is_active', true)

      activeClasses = count || 0
    }

    return NextResponse.json({
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        totalTeachers: totalTeachers || 0,
        activeClasses,
      },
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard statistics',
      },
      { status: 500 }
    )
  }
}
