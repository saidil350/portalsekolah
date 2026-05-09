'use server'

import { revalidatePath } from 'next/cache'
import { authorizeAction } from '@/lib/auth/authorization'
import { createClient } from '@/utils/supabase/server'
import { getActiveAcademicPeriod } from '@/lib/academic-period'
import type {
  AttendanceRecord,
  AttendanceRecordStatus,
  HeadmasterAttendanceReport,
  SaveTeacherAttendanceInput,
  SaveTeacherAttendanceResult,
  StudentAttendanceData,
  TeacherAttendanceScheduleOption,
  TeacherAttendanceSessionData,
} from '@/types/attendance'

const STUDENT_ABSENCE_LIMIT = 3

type Relation<T> = T | T[] | null

type TeacherScheduleRow = {
  id: string
  class_id: string
  subject_id: string
  day_of_week: number
  start_time: string
  end_time: string
  class: Relation<{ id: string; name: string | null; code: string | null }>
  subject: Relation<{ id: string; name: string | null; code: string | null }>
}

type EnrollmentStudentRow = {
  student: Relation<{ id: string; full_name: string; nisn: string | null }>
}

type TeacherAttendanceRecordRow = {
  id: string
  student_id: string
  status: AttendanceRecordStatus
  check_in_time: string | null
  note: string | null
}

type HeadmasterAttendanceRecordRow = {
  id: string
  student_id: string
  status: AttendanceRecordStatus
  student: Relation<{ id: string; full_name: string | null; nisn: string | null }>
  session: Relation<{
    id: string
    attendance_date: string
    class: Relation<{ id: string; name: string | null; code: string | null }>
  }>
}

function firstRelation<T>(value: Relation<T>) {
  if (Array.isArray(value)) return value[0] || null
  return value
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === 'string') return message
  }
  return fallback
}

function toDateOnly(date: Date) {
  return date.toISOString().slice(0, 10)
}

function getMonthRange(month?: string) {
  const now = new Date()
  const match = month?.match(/^(\d{4})-(\d{2})$/)
  const year = match ? Number(match[1]) : now.getFullYear()
  const monthIndex = match ? Number(match[2]) - 1 : now.getMonth()
  const first = new Date(Date.UTC(year, monthIndex, 1))
  const last = new Date(Date.UTC(year, monthIndex + 1, 0))

  return {
    month: `${year}-${String(monthIndex + 1).padStart(2, '0')}`,
    startDate: toDateOnly(first),
    endDate: toDateOnly(last),
  }
}

function normalizeDate(date?: string) {
  if (date?.match(/^\d{4}-\d{2}-\d{2}$/)) return date
  return toDateOnly(new Date())
}

function getAttendanceRate(records: Array<{ status: AttendanceRecordStatus }>) {
  if (records.length === 0) return 0
  const attended = records.filter((record) => record.status === 'PRESENT' || record.status === 'LATE').length
  return Math.round((attended / records.length) * 100)
}

function getStudentSummary(records: AttendanceRecord[]) {
  const present = records.filter((record) => record.status === 'PRESENT').length
  const late = records.filter((record) => record.status === 'LATE').length
  const sick = records.filter((record) => record.status === 'SICK').length
  const permit = records.filter((record) => record.status === 'PERMIT').length
  const absent = records.filter((record) => record.status === 'ABSENT').length

  const latestFirst = [...records].sort((a, b) => {
    const aDate = a.session?.attendance_date || a.created_at
    const bDate = b.session?.attendance_date || b.created_at
    return bDate.localeCompare(aDate)
  })

  let currentStreak = 0
  for (const record of latestFirst) {
    if (record.status === 'PRESENT' || record.status === 'LATE') {
      currentStreak += 1
      continue
    }
    break
  }

  return {
    total: records.length,
    present,
    late,
    sick,
    permit,
    absent,
    attendanceRate: getAttendanceRate(records),
    currentStreak,
    absencesRemaining: Math.max(0, STUDENT_ABSENCE_LIMIT - absent),
  }
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getDayOfWeek(date: string) {
  const jsDay = new Date(`${date}T00:00:00Z`).getUTCDay()
  return jsDay === 0 ? 7 : jsDay
}

export async function getStudentAttendance(month?: string): Promise<StudentAttendanceData> {
  const range = getMonthRange(month)
  const auth = await authorizeAction(['SISWA'])

  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      ...range,
      records: [],
      summary: getStudentSummary([]),
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        session:attendance_sessions!inner(
          id,
          organization_id,
          class_schedule_id,
          class_id,
          subject_id,
          teacher_id,
          attendance_date,
          status,
          submitted_at,
          notes,
          created_by,
          created_at,
          updated_at,
          class:classes(id, name, code),
          subject:subjects(id, name, code),
          teacher:profiles!attendance_sessions_teacher_id_fkey(id, full_name),
          schedule:class_schedules(id, day_of_week, start_time, end_time)
        )
      `)
      .eq('organization_id', auth.user.organization_id)
      .eq('student_id', auth.user.id)
      .gte('session.attendance_date', range.startDate)
      .lte('session.attendance_date', range.endDate)

    if (error) throw error

    const records = ((data || []) as unknown as AttendanceRecord[]).sort((a, b) => {
      const aDate = a.session?.attendance_date || a.created_at
      const bDate = b.session?.attendance_date || b.created_at
      return bDate.localeCompare(aDate)
    })

    return {
      success: true,
      ...range,
      records,
      summary: getStudentSummary(records),
    }
  } catch (error: unknown) {
    console.error('Error fetching student attendance:', error)
    return {
      success: false,
      error: getErrorMessage(error, 'Gagal memuat data presensi siswa'),
      ...range,
      records: [],
      summary: getStudentSummary([]),
    }
  }
}

async function getTeacherSchedules(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherId: string,
  organizationId: string,
  date: string
): Promise<TeacherAttendanceScheduleOption[]> {
  const dayOfWeek = getDayOfWeek(date)
  const { academicYear, semester } = await getActiveAcademicPeriod(supabase, organizationId)

  if (!academicYear || !semester) {
    return []
  }

  const { data, error } = await supabase
    .from('class_schedules')
    .select(`
      id,
      class_id,
      subject_id,
      day_of_week,
      start_time,
      end_time,
      class:classes(id, name, code),
      subject:subjects(id, name, code)
    `)
    .eq('organization_id', organizationId)
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
    .eq('academic_year_id', academicYear.id)
    .eq('semester', semester.semester_number)
    .order('start_time', { ascending: true })

  if (error) throw error

  const schedules = (data || []) as unknown as TeacherScheduleRow[]

  return schedules
    .filter((schedule) => schedule.day_of_week === dayOfWeek || schedules.length === 1)
    .map((schedule) => {
      const classData = firstRelation(schedule.class)
      const subjectData = firstRelation(schedule.subject)

      return {
      id: schedule.id,
      class_id: schedule.class_id,
      subject_id: schedule.subject_id,
      class_name: classData?.name || 'Kelas',
      class_code: classData?.code || '-',
      subject_name: subjectData?.name || 'Mata Pelajaran',
      subject_code: subjectData?.code || '-',
      start_time: schedule.start_time,
      end_time: schedule.end_time,
      day_of_week: schedule.day_of_week,
      }
    })
}

export async function getTeacherAttendanceSession(
  scheduleId?: string,
  date?: string
): Promise<TeacherAttendanceSessionData> {
  const selectedDate = normalizeDate(date)
  const auth = await authorizeAction(['GURU'])

  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      date: selectedDate,
      schedules: [],
      selectedSchedule: null,
      session: null,
      students: [],
    }
  }

  try {
    const supabase = await createClient()
    const schedules = await getTeacherSchedules(supabase, auth.user.id, auth.user.organization_id, selectedDate)
    const selectedSchedule = schedules.find((schedule) => schedule.id === scheduleId) || schedules[0] || null

    if (!selectedSchedule) {
      return {
        success: true,
        date: selectedDate,
        schedules,
        selectedSchedule: null,
        session: null,
        students: [],
      }
    }

    const { data: enrollmentData, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('student:profiles!enrollments_student_id_fkey(id, full_name, nisn)')
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', selectedSchedule.class_id)
      .eq('status', 'ACTIVE')

    if (enrollmentError) throw enrollmentError

    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .select('*')
      .eq('organization_id', auth.user.organization_id)
      .eq('class_schedule_id', selectedSchedule.id)
      .eq('attendance_date', selectedDate)
      .maybeSingle()

    if (sessionError) throw sessionError

    let records: TeacherAttendanceRecordRow[] = []
    if (session?.id) {
      const { data: recordData, error: recordError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('organization_id', auth.user.organization_id)
        .eq('session_id', session.id)

      if (recordError) throw recordError
      records = (recordData || []) as unknown as TeacherAttendanceRecordRow[]
    }

    const recordByStudent = new Map(records.map((record) => [record.student_id, record]))
    const students = ((enrollmentData || []) as unknown as EnrollmentStudentRow[])
      .map((enrollment) => firstRelation(enrollment.student))
      .filter(isPresent)
      .map((student) => {
        const record = recordByStudent.get(student.id)
        return {
          id: student.id,
          full_name: student.full_name,
          nisn: student.nisn || null,
          status: (record?.status || 'PRESENT') as AttendanceRecordStatus,
          note: record?.note || '',
          check_in_time: record?.check_in_time || '',
          record_id: record?.id,
        }
      })

    return {
      success: true,
      date: selectedDate,
      schedules,
      selectedSchedule,
      session: (session || null) as TeacherAttendanceSessionData['session'],
      students,
    }
  } catch (error: unknown) {
    console.error('Error fetching teacher attendance session:', error)
    return {
      success: false,
      error: getErrorMessage(error, 'Gagal memuat sesi presensi'),
      date: selectedDate,
      schedules: [],
      selectedSchedule: null,
      session: null,
      students: [],
    }
  }
}

export async function saveTeacherAttendanceSession(
  input: SaveTeacherAttendanceInput
): Promise<SaveTeacherAttendanceResult> {
  const auth = await authorizeAction(['GURU'])
  if (!auth.success) return { success: false, error: auth.error }

  try {
    const supabase = await createClient()
    const attendanceDate = normalizeDate(input.date)
    const { academicYear, semester } = await getActiveAcademicPeriod(supabase, auth.user.organization_id)

    if (!academicYear || !semester) {
      return { success: false, error: 'Periode akademik aktif belum diatur' }
    }

    const { data: schedule, error: scheduleError } = await supabase
      .from('class_schedules')
      .select('id, class_id, subject_id, teacher_id, organization_id')
      .eq('id', input.classScheduleId)
      .eq('teacher_id', auth.user.id)
      .eq('organization_id', auth.user.organization_id)
      .eq('academic_year_id', academicYear.id)
      .eq('semester', semester.semester_number)
      .single()

    if (scheduleError || !schedule) {
      return { success: false, error: 'Jadwal presensi tidak ditemukan' }
    }

    const { data: session, error: sessionError } = await supabase
      .from('attendance_sessions')
      .upsert({
        organization_id: auth.user.organization_id,
        class_schedule_id: schedule.id,
        class_id: schedule.class_id,
        subject_id: schedule.subject_id,
        teacher_id: auth.user.id,
        attendance_date: attendanceDate,
        status: 'SUBMITTED',
        submitted_at: new Date().toISOString(),
        notes: input.notes || null,
        created_by: auth.user.id,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'organization_id,class_schedule_id,attendance_date',
      })
      .select()
      .single()

    if (sessionError || !session) throw sessionError

    const studentIds = input.records.map((record) => record.studentId)
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('student_id')
      .eq('organization_id', auth.user.organization_id)
      .eq('class_id', schedule.class_id)
      .eq('status', 'ACTIVE')
      .in('student_id', studentIds)

    if (enrollmentError) throw enrollmentError

    const allowedStudentIds = new Set(
      ((enrollments || []) as unknown as Array<{ student_id: string }>).map((enrollment) => enrollment.student_id)
    )
    const rows = input.records
      .filter((record) => allowedStudentIds.has(record.studentId))
      .map((record) => ({
        organization_id: auth.user.organization_id,
        session_id: session.id,
        student_id: record.studentId,
        status: record.status,
        check_in_time: record.checkInTime || null,
        note: record.note || null,
        recorded_by: auth.user.id,
        updated_at: new Date().toISOString(),
      }))

    if (rows.length > 0) {
      const { error: recordsError } = await supabase
        .from('attendance_records')
        .upsert(rows, { onConflict: 'session_id,student_id' })

      if (recordsError) throw recordsError
    }

    revalidatePath('/dashboard/teaching-dashboard/kehadiran')
    revalidatePath('/dashboard/student-dashboard/attendance')
    revalidatePath('/dashboard/headmaster-dashboard/laporan-presensi')

    return { success: true, sessionId: session.id }
  } catch (error: unknown) {
    console.error('Error saving teacher attendance session:', error)
    return { success: false, error: getErrorMessage(error, 'Gagal menyimpan presensi') }
  }
}

export async function getHeadmasterAttendanceReport(filters?: {
  startDate?: string
  endDate?: string
}): Promise<HeadmasterAttendanceReport> {
  const auth = await authorizeAction(['KEPALA_SEKOLAH', 'ADMIN_IT'])
  const range = {
    startDate: filters?.startDate || getMonthRange().startDate,
    endDate: filters?.endDate || getMonthRange().endDate,
  }

  if (!auth.success) {
    return {
      success: false,
      error: auth.error,
      ...range,
      classSummaries: [],
      chronicStudents: [],
    }
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('attendance_records')
      .select(`
        *,
        student:profiles!attendance_records_student_id_fkey(id, full_name, nisn),
        session:attendance_sessions!inner(
          id,
          organization_id,
          attendance_date,
          class:classes(id, name, code)
        )
      `)
      .eq('organization_id', auth.user.organization_id)
      .gte('session.attendance_date', range.startDate)
      .lte('session.attendance_date', range.endDate)

    if (error) throw error

    const records = (data || []) as unknown as HeadmasterAttendanceRecordRow[]
    const classMap = new Map<string, HeadmasterAttendanceRecordRow[]>()
    const studentMap = new Map<string, HeadmasterAttendanceRecordRow[]>()

    for (const record of records) {
      const session = firstRelation(record.session)
      const classData = firstRelation(session?.class || null)
      const student = firstRelation(record.student)
      const classId = classData?.id || 'unknown'
      const studentId = student?.id || record.student_id

      classMap.set(classId, [...(classMap.get(classId) || []), record])
      studentMap.set(studentId, [...(studentMap.get(studentId) || []), record])
    }

    const classSummaries = Array.from(classMap.entries()).map(([classId, classRecords]) => {
      const first = classRecords[0]
      const firstSession = firstRelation(first.session)
      const firstClass = firstRelation(firstSession?.class || null)
      const statusCount = (status: AttendanceRecordStatus) =>
        classRecords.filter((record) => record.status === status).length

      return {
        classId,
        className: firstClass?.name || 'Kelas',
        classCode: firstClass?.code || '-',
        total: classRecords.length,
        present: statusCount('PRESENT'),
        late: statusCount('LATE'),
        sick: statusCount('SICK'),
        permit: statusCount('PERMIT'),
        absent: statusCount('ABSENT'),
        attendanceRate: getAttendanceRate(classRecords),
      }
    }).sort((a, b) => b.attendanceRate - a.attendanceRate)

    const chronicStudents = Array.from(studentMap.entries())
      .map(([studentId, studentRecords]) => {
        const first = studentRecords[0]
        const firstStudent = firstRelation(first.student)
        const firstSession = firstRelation(first.session)
        const firstClass = firstRelation(firstSession?.class || null)
        const count = (status: AttendanceRecordStatus) =>
          studentRecords.filter((record) => record.status === status).length

        return {
          studentId,
          studentName: firstStudent?.full_name || 'Siswa',
          studentInitials: getInitials(firstStudent?.full_name || 'Siswa'),
          className: firstClass?.name || '-',
          sick: count('SICK'),
          permit: count('PERMIT'),
          absent: count('ABSENT'),
          total: studentRecords.length,
          attendanceRate: getAttendanceRate(studentRecords),
        }
      })
      .filter((student) => student.total > 0 && student.attendanceRate < 80)
      .sort((a, b) => a.attendanceRate - b.attendanceRate)

    return {
      success: true,
      ...range,
      classSummaries,
      chronicStudents,
    }
  } catch (error: unknown) {
    console.error('Error fetching headmaster attendance report:', error)
    return {
      success: false,
      error: getErrorMessage(error, 'Gagal memuat laporan presensi'),
      ...range,
      classSummaries: [],
      chronicStudents: [],
    }
  }
}
