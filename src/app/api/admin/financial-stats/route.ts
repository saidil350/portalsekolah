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

    // 1. Get unpaid bills count (PENDING or ARREARS)
    let unpaidQuery = supabase
      .from('student_invoices')
      .select('*', { count: 'exact', head: true })
      .in('status', ['PENDING', 'ARREARS'])

    if (academicYearId) {
      unpaidQuery = unpaidQuery.eq('academic_year_id', academicYearId)
    }

    const { count: unpaidCount } = await unpaidQuery

    // 2. Get recent outstanding invoices for the table
    let invoicesQuery = supabase
      .from('student_invoices')
      .select(`
        id,
        title,
        amount,
        status,
        due_date,
        student:profiles!student_id (
          id,
          full_name,
          role,
          registration_number
        ),
        class:classes!student_invoices_academic_year_id_fkey (
          id,
          name
        )
      `)
      .in('status', ['PENDING', 'ARREARS'])
      .order('due_date', { ascending: true })
      .limit(10)

    // Note: The relation student_invoices -> classes might be indirect or via enrollments. 
    // In our dummy script, we didn't add class_id to student_invoices. 
    // Let's refine the query to fetch class name from enrollments if possible, 
    // but for now, let's just get student and invoice data.
    
    const { data: rawInvoices, error: invoicesError } = await invoicesQuery

    if (invoicesError) {
      console.error('Error fetching invoices:', invoicesError)
    }

    // Since our schema might not have the direct link to classes in invoices, 
    // let's fetch class name from enrollments for these students
    const studentIds = rawInvoices?.map(inv => (inv.student as any)?.id).filter(Boolean) || []
    
    let enrollmentsMap: Record<string, string> = {}
    if (studentIds.length > 0 && academicYearId) {
      const { data: enrollments } = await supabase
        .from('enrollments')
        .select(`
          student_id,
          class:classes (
            name
          )
        `)
        .in('student_id', studentIds)
        .eq('academic_year_id', academicYearId)
      
      enrollments?.forEach(e => {
        enrollmentsMap[e.student_id] = (e.class as any)?.name || '-'
      })
    }

    const invoices = rawInvoices?.map(inv => ({
      id: inv.id,
      studentName: (inv.student as any)?.full_name || 'Unknown',
      nisn: (inv.student as any)?.registration_number || '-',
      className: enrollmentsMap[(inv.student as any)?.id] || '-',
      month: inv.title,
      amount: inv.amount,
      status: inv.status,
      dueDate: inv.due_date
    }))

    return NextResponse.json({
      success: true,
      data: {
        unpaidCount: unpaidCount || 0,
        recentInvoices: invoices || [],
      },
    })
  } catch (error) {
    console.error('Error fetching financial stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch financial statistics',
      },
      { status: 500 }
    )
  }
}
