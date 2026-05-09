import type { Class, ClassSchedule } from './class-roster'
import type { Subject } from './data-management'
import type { User } from './user'

export type AttendanceRecordStatus = 'PRESENT' | 'LATE' | 'SICK' | 'PERMIT' | 'ABSENT'
export type AttendanceSessionStatus = 'DRAFT' | 'SUBMITTED'

export interface AttendanceSession {
  id: string
  organization_id: string
  class_schedule_id: string | null
  class_id: string
  subject_id: string
  teacher_id: string
  attendance_date: string
  status: AttendanceSessionStatus
  submitted_at: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  class?: Pick<Class, 'id' | 'name' | 'code'> | null
  subject?: Pick<Subject, 'id' | 'name' | 'code'> | null
  teacher?: Pick<User, 'id' | 'full_name'> | null
  schedule?: Pick<ClassSchedule, 'id' | 'start_time' | 'end_time' | 'day_of_week'> | null
}

export interface AttendanceRecord {
  id: string
  organization_id: string
  session_id: string
  student_id: string
  status: AttendanceRecordStatus
  check_in_time: string | null
  note: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
  session?: AttendanceSession | null
  student?: Pick<User, 'id' | 'full_name' | 'nisn'> | null
}

export interface StudentAttendanceSummary {
  total: number
  present: number
  late: number
  sick: number
  permit: number
  absent: number
  attendanceRate: number
  currentStreak: number
  absencesRemaining: number
}

export interface StudentAttendanceData {
  success: boolean
  error?: string
  month: string
  startDate: string
  endDate: string
  records: AttendanceRecord[]
  summary: StudentAttendanceSummary
}

export interface TeacherAttendanceStudent {
  id: string
  full_name: string
  nisn: string | null
  status: AttendanceRecordStatus
  note: string
  check_in_time: string
  record_id?: string
}

export interface TeacherAttendanceScheduleOption {
  id: string
  class_id: string
  subject_id: string
  class_name: string
  class_code: string
  subject_name: string
  subject_code: string
  start_time: string
  end_time: string
  day_of_week: number
}

export interface TeacherAttendanceSessionData {
  success: boolean
  error?: string
  date: string
  schedules: TeacherAttendanceScheduleOption[]
  selectedSchedule: TeacherAttendanceScheduleOption | null
  session: AttendanceSession | null
  students: TeacherAttendanceStudent[]
}

export interface SaveTeacherAttendanceInput {
  classScheduleId: string
  date: string
  notes?: string
  records: Array<{
    studentId: string
    status: AttendanceRecordStatus
    note?: string
    checkInTime?: string
  }>
}

export interface SaveTeacherAttendanceResult {
  success: boolean
  error?: string
  sessionId?: string
}

export interface HeadmasterAttendanceClassSummary {
  classId: string
  className: string
  classCode: string
  total: number
  present: number
  late: number
  sick: number
  permit: number
  absent: number
  attendanceRate: number
}

export interface HeadmasterAttendanceStudentRisk {
  studentId: string
  studentName: string
  studentInitials: string
  className: string
  sick: number
  permit: number
  absent: number
  total: number
  attendanceRate: number
}

export interface HeadmasterAttendanceReport {
  success: boolean
  error?: string
  startDate: string
  endDate: string
  classSummaries: HeadmasterAttendanceClassSummary[]
  chronicStudents: HeadmasterAttendanceStudentRisk[]
}
