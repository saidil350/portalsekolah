import { getStudentAttendance } from '@/app/dashboard/attendance-actions'
import { StudentAttendanceClient } from './student-attendance-client'

export default async function AttendancePage({
  searchParams,
}: {
  searchParams?: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const data = await getStudentAttendance(params?.month)

  return <StudentAttendanceClient data={data} />
}
