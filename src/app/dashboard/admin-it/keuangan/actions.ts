'use server'

import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import { createClient } from '@/utils/supabase/server'

export type GradeRateKey = 'grade10' | 'grade11' | 'grade12'
export type InvoiceDay = '1st' | '5th' | '10th'
export type DueDateOption = '15th' | '20th' | 'end'

export interface FinanceSettings {
  tuitionRates: Record<GradeRateKey, number | null>
  billingCycle: {
    invoiceDay: InvoiceDay
    dueDate: DueDateOption
    latePenaltyEnabled: boolean
    latePenaltyAmount: number | null
  }
  paymentMethods: {
    virtualAccount: boolean
    cashManual: boolean
    qris: boolean
  }
}

export interface FinanceSummary {
  revenueThisMonth: number
  paidInvoiceCountThisMonth: number
  outstandingAmount: number
  outstandingInvoiceCount: number
  nextCycleDate: string
}

export interface IncompleteFinanceStudent {
  id: string
  name: string
  nisn: string | null
  grade: string
  gradeRateKey: GradeRateKey | null
  lastPayment: string | null
}

export interface FinanceDashboardData {
  settings: FinanceSettings
  summary: FinanceSummary
  incompleteStudents: IncompleteFinanceStudent[]
  activeAcademicYearId: string | null
  activeAcademicYearName: string | null
}

const defaultFinanceSettings: FinanceSettings = {
  tuitionRates: {
    grade10: null,
    grade11: null,
    grade12: null,
  },
  billingCycle: {
    invoiceDay: '1st',
    dueDate: '15th',
    latePenaltyEnabled: false,
    latePenaltyAmount: null,
  },
  paymentMethods: {
    virtualAccount: false,
    cashManual: false,
    qris: false,
  },
}

const monthNames = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeAmount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return Math.round(value)
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[^\d]/g, ''))
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null
  }

  return null
}

function normalizeFinanceSettings(value: unknown): FinanceSettings {
  if (!isRecord(value)) return defaultFinanceSettings

  const tuitionRates = isRecord(value.tuitionRates) ? value.tuitionRates : {}
  const billingCycle = isRecord(value.billingCycle) ? value.billingCycle : {}
  const paymentMethods = isRecord(value.paymentMethods) ? value.paymentMethods : {}

  const invoiceDay =
    billingCycle.invoiceDay === '5th' || billingCycle.invoiceDay === '10th'
      ? billingCycle.invoiceDay
      : defaultFinanceSettings.billingCycle.invoiceDay

  const dueDate =
    billingCycle.dueDate === '20th' || billingCycle.dueDate === 'end'
      ? billingCycle.dueDate
      : defaultFinanceSettings.billingCycle.dueDate

  return {
    tuitionRates: {
      grade10: normalizeAmount(tuitionRates.grade10),
      grade11: normalizeAmount(tuitionRates.grade11),
      grade12: normalizeAmount(tuitionRates.grade12),
    },
    billingCycle: {
      invoiceDay,
      dueDate,
      latePenaltyEnabled: billingCycle.latePenaltyEnabled === true,
      latePenaltyAmount: normalizeAmount(billingCycle.latePenaltyAmount),
    },
    paymentMethods: {
      virtualAccount: paymentMethods.virtualAccount === true,
      cashManual: paymentMethods.cashManual === true,
      qris: paymentMethods.qris === true,
    },
  }
}

function getFinanceFromOrganizationSettings(settings: unknown): FinanceSettings {
  if (!isRecord(settings)) return defaultFinanceSettings
  return normalizeFinanceSettings(settings.finance)
}

function mergeFinanceIntoOrganizationSettings(
  existingSettings: unknown,
  financeSettings: FinanceSettings
) {
  return {
    ...(isRecord(existingSettings) ? existingSettings : {}),
    finance: financeSettings,
  }
}

function getBillingDayValue(day: InvoiceDay) {
  if (day === '5th') return 5
  if (day === '10th') return 10
  return 1
}

function getDueDayValue(date: DueDateOption, year: number, monthIndex: number) {
  if (date === '20th') return 20
  if (date === 'end') return new Date(year, monthIndex + 1, 0).getDate()
  return 15
}

function getNextCycleDate(invoiceDay: InvoiceDay) {
  const now = new Date()
  const day = getBillingDayValue(invoiceDay)
  let next = new Date(now.getFullYear(), now.getMonth(), day)

  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    next = new Date(now.getFullYear(), now.getMonth() + 1, day)
  }

  return next.toISOString()
}

function getGradeRateKey(level: unknown, code: unknown, name: unknown): GradeRateKey | null {
  if (level === 10 || code === '10' || String(name || '').includes('10')) return 'grade10'
  if (level === 11 || code === '11' || String(name || '').includes('11')) return 'grade11'
  if (level === 12 || code === '12' || String(name || '').includes('12')) return 'grade12'
  return null
}

function getInvoiceTitle(date = new Date()) {
  return `SPP ${monthNames[date.getMonth()]} ${date.getFullYear()}`
}

function getCurrentMonthRange() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

async function getActiveAcademicYear(
  supabase: Awaited<ReturnType<typeof createClient>>,
  organizationId: string
) {
  const { data: settingsRow } = await supabase
    .from('organization_settings')
    .select('current_academic_year_id')
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (settingsRow?.current_academic_year_id) {
    const { data } = await supabase
      .from('academic_years')
      .select('id, name')
      .eq('organization_id', organizationId)
      .eq('id', settingsRow.current_academic_year_id)
      .maybeSingle()

    if (data) return data
  }

  const { data } = await supabase
    .from('academic_years')
    .select('id, name')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('start_date', { ascending: false })
    .limit(1)
    .maybeSingle()

  return data || null
}

export async function getFinanceDashboardData(): Promise<{
  success: boolean
  data?: FinanceDashboardData
  error?: string
}> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()
    const organizationId = auth.user.organization_id

    const [{ data: organization }, activeAcademicYear] = await Promise.all([
      supabase
        .from('organizations')
        .select('id, settings')
        .eq('id', organizationId)
        .maybeSingle(),
      getActiveAcademicYear(supabase, organizationId),
    ])

    const settings = getFinanceFromOrganizationSettings((organization as any)?.settings)
    const { start, end } = getCurrentMonthRange()

    let paidInvoicesQuery = supabase
      .from('student_invoices')
      .select('amount, updated_at')
      .eq('organization_id', organizationId)
      .eq('status', 'PAID')
      .gte('updated_at', start)
      .lt('updated_at', end)

    let outstandingInvoicesQuery = supabase
      .from('student_invoices')
      .select('amount')
      .eq('organization_id', organizationId)
      .in('status', ['PENDING', 'ARREARS'])

    if (activeAcademicYear?.id) {
      paidInvoicesQuery = paidInvoicesQuery.eq('academic_year_id', activeAcademicYear.id)
      outstandingInvoicesQuery = outstandingInvoicesQuery.eq('academic_year_id', activeAcademicYear.id)
    }

    const [
      { data: paidInvoices, error: paidInvoicesError },
      { data: outstandingInvoices, error: outstandingInvoicesError },
      { data: students, error: studentsError },
      { data: enrollments, error: enrollmentsError },
      { data: lastPaidInvoices, error: lastPaidInvoicesError },
    ] = await Promise.all([
      paidInvoicesQuery,
      outstandingInvoicesQuery,
      supabase
        .from('profiles')
        .select('id, full_name, nisn, is_active')
        .eq('organization_id', organizationId)
        .eq('role', 'SISWA')
        .order('full_name', { ascending: true }),
      (() => {
        let query = supabase
          .from('enrollments')
          .select(`
            student_id,
            status,
            class:classes (
              id,
              name,
              class_level:class_levels (
                id,
                name,
                code,
                level
              )
            )
          `)
          .eq('organization_id', organizationId)
          .eq('status', 'ACTIVE')

        if (activeAcademicYear?.id) {
          query = query.eq('academic_year_id', activeAcademicYear.id)
        }

        return query
      })(),
      supabase
        .from('student_invoices')
        .select('student_id, title, updated_at, due_date')
        .eq('organization_id', organizationId)
        .eq('status', 'PAID')
        .order('updated_at', { ascending: false }),
    ])

    if (paidInvoicesError) throw paidInvoicesError
    if (outstandingInvoicesError) throw outstandingInvoicesError
    if (studentsError) throw studentsError
    if (enrollmentsError) throw enrollmentsError
    if (lastPaidInvoicesError) throw lastPaidInvoicesError

    const paidInvoiceList = paidInvoices || []
    const outstandingInvoiceList = outstandingInvoices || []
    const summary: FinanceSummary = {
      revenueThisMonth: paidInvoiceList.reduce((sum, invoice: any) => sum + Number(invoice.amount || 0), 0),
      paidInvoiceCountThisMonth: paidInvoiceList.length,
      outstandingAmount: outstandingInvoiceList.reduce((sum, invoice: any) => sum + Number(invoice.amount || 0), 0),
      outstandingInvoiceCount: outstandingInvoiceList.length,
      nextCycleDate: getNextCycleDate(settings.billingCycle.invoiceDay),
    }

    const enrollmentByStudent = new Map<string, any>()
    ;(enrollments || []).forEach((enrollment: any) => {
      if (!enrollmentByStudent.has(enrollment.student_id)) {
        enrollmentByStudent.set(enrollment.student_id, enrollment)
      }
    })

    const lastPaidByStudent = new Map<string, any>()
    ;(lastPaidInvoices || []).forEach((invoice: any) => {
      if (!lastPaidByStudent.has(invoice.student_id)) {
        lastPaidByStudent.set(invoice.student_id, invoice)
      }
    })

    const incompleteStudents: IncompleteFinanceStudent[] = (students || [])
      .filter((student: any) => student.is_active !== false)
      .map((student: any) => {
        const enrollment = enrollmentByStudent.get(student.id)
        const classData = enrollment?.class || null
        const classLevel = classData?.class_level || null
        const gradeRateKey = getGradeRateKey(classLevel?.level, classLevel?.code, classLevel?.name)
        const lastPayment = lastPaidByStudent.get(student.id)

        return {
          id: student.id,
          name: student.full_name || '-',
          nisn: student.nisn || null,
          grade: classData?.name || classLevel?.name || '-',
          gradeRateKey,
          lastPayment: lastPayment?.title || null,
        }
      })
      .filter((student) => {
        if (!student.gradeRateKey) return true
        return !settings.tuitionRates[student.gradeRateKey]
      })

    return {
      success: true,
      data: {
        settings,
        summary,
        incompleteStudents,
        activeAcademicYearId: activeAcademicYear?.id || null,
        activeAcademicYearName: activeAcademicYear?.name || null,
      },
    }
  } catch (error: any) {
    console.error('Error fetching finance dashboard data:', error)
    return {
      success: false,
      error: error.message || 'Gagal memuat data keuangan',
    }
  }
}

export async function saveFinanceSettings(settings: FinanceSettings): Promise<{
  success: boolean
  data?: FinanceSettings
  error?: string
}> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const normalizedSettings = normalizeFinanceSettings(settings)
    const supabase = await createClient()

    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', auth.user.organization_id)
      .maybeSingle()

    if (organizationError) throw organizationError

    const nextSettings = mergeFinanceIntoOrganizationSettings(
      (organization as any)?.settings,
      normalizedSettings
    )

    const { error } = await supabase
      .from('organizations')
      .update({ settings: nextSettings })
      .eq('id', auth.user.organization_id)

    if (error) throw error

    revalidatePath('/dashboard/admin-it/keuangan')

    return {
      success: true,
      data: normalizedSettings,
    }
  } catch (error: any) {
    console.error('Error saving finance settings:', error)
    return {
      success: false,
      error: error.message || 'Gagal menyimpan konfigurasi keuangan',
    }
  }
}

export async function generateMonthlyBills(): Promise<{
  success: boolean
  created?: number
  skipped?: number
  error?: string
}> {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }

  try {
    const supabase = await createClient()
    const organizationId = auth.user.organization_id
    const activeAcademicYear = await getActiveAcademicYear(supabase, organizationId)

    const { data: organization, error: organizationError } = await supabase
      .from('organizations')
      .select('settings')
      .eq('id', organizationId)
      .maybeSingle()

    if (organizationError) throw organizationError

    const settings = getFinanceFromOrganizationSettings((organization as any)?.settings)
    const now = new Date()
    const title = getInvoiceTitle(now)
    const dueDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      getDueDayValue(settings.billingCycle.dueDate, now.getFullYear(), now.getMonth())
    )

    let enrollmentQuery = supabase
      .from('enrollments')
      .select(`
        student_id,
        class:classes (
          class_level:class_levels (
            code,
            level,
            name
          )
        )
      `)
      .eq('organization_id', organizationId)
      .eq('status', 'ACTIVE')

    if (activeAcademicYear?.id) {
      enrollmentQuery = enrollmentQuery.eq('academic_year_id', activeAcademicYear.id)
    }

    let existingInvoicesQuery = supabase
      .from('student_invoices')
      .select('student_id')
      .eq('organization_id', organizationId)
      .eq('title', title)

    existingInvoicesQuery = activeAcademicYear?.id
      ? existingInvoicesQuery.eq('academic_year_id', activeAcademicYear.id)
      : existingInvoicesQuery.is('academic_year_id', null)

    const [{ data: enrollments, error: enrollmentsError }, { data: existingInvoices, error: existingError }] =
      await Promise.all([
        enrollmentQuery,
        existingInvoicesQuery,
      ])

    if (enrollmentsError) throw enrollmentsError
    if (existingError) throw existingError

    const existingStudentIds = new Set((existingInvoices || []).map((invoice: any) => invoice.student_id))
    const invoiceRows = (enrollments || [])
      .map((enrollment: any) => {
        const classLevel = enrollment.class?.class_level || null
        const gradeRateKey = getGradeRateKey(classLevel?.level, classLevel?.code, classLevel?.name)
        const amount = gradeRateKey ? settings.tuitionRates[gradeRateKey] : null

        if (!amount || existingStudentIds.has(enrollment.student_id)) {
          return null
        }

        return {
          student_id: enrollment.student_id,
          academic_year_id: activeAcademicYear?.id || null,
          organization_id: organizationId,
          title,
          amount,
          status: 'PENDING',
          due_date: dueDate.toISOString().slice(0, 10),
        }
      })
      .filter(Boolean)

    if (invoiceRows.length === 0) {
      return {
        success: true,
        created: 0,
        skipped: existingStudentIds.size,
      }
    }

    const { error } = await supabase.from('student_invoices').insert(invoiceRows)
    if (error) throw error

    revalidatePath('/dashboard/admin-it/keuangan')

    return {
      success: true,
      created: invoiceRows.length,
      skipped: existingStudentIds.size,
    }
  } catch (error: any) {
    console.error('Error generating monthly bills:', error)
    return {
      success: false,
      error: error.message || 'Gagal membuat tagihan bulanan',
    }
  }
}
