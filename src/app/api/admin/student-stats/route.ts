import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { authorizeApi } from '@/lib/auth/authorization'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    // Authorization check - only ADMIN_IT can access stats
    const auth = await authorizeApi(request, ['ADMIN_IT'])
    if (!auth.success) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: auth.statusCode }
      )
    }

    const supabase = await createClient()

    // Get active academic year
    const { data: activeAY } = await supabase
      .from('academic_years')
      .select('id')
      .eq('is_active', true)
      .single()

    const academicYearId = activeAY?.id

    // Get enrollment statistics grouped by status for the current academic year
    let enrollmentsQuery = supabase
      .from('enrollments')
      .select('status')

    if (academicYearId) {
      enrollmentsQuery = enrollmentsQuery.eq('academic_year_id', academicYearId)
    }

    const { data: enrollments, error } = await enrollmentsQuery

    if (error) {
      console.error('Error fetching enrollments:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch enrollment statistics' },
        { status: 500 }
      )
    }

    // Count enrollments by status
    const stats = {
      active: 0,
      graduated: 0,
      transferred: 0,
      dropout: 0,
      inactive: 0,
    }

    enrollments?.forEach((enrollment) => {
      switch (enrollment.status) {
        case 'ACTIVE':
          stats.active++
          break
        case 'LULUS':
          stats.graduated++
          break
        case 'PINDAH':
          stats.transferred++
          break
        case 'DROPOUT':
          stats.dropout++
          break
        case 'NONAKTIF':
          stats.inactive++
          break
      }
    })

    const total = stats.active + stats.graduated + stats.transferred + stats.dropout + stats.inactive

    return NextResponse.json({
      success: true,
      data: {
        ...stats,
        total,
      },
    })
  } catch (error) {
    console.error('Error fetching student stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch student statistics',
      },
      { status: 500 }
    )
  }
}
