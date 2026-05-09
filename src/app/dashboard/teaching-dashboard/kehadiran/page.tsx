'use client'

import { useEffect, useMemo, useState, useTransition, type ReactNode } from 'react'
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Save,
  UserCheck,
  UserX,
} from 'lucide-react'
import {
  getTeacherAttendanceSession,
  saveTeacherAttendanceSession,
} from '@/app/dashboard/attendance-actions'
import type {
  AttendanceRecordStatus,
  TeacherAttendanceSessionData,
  TeacherAttendanceStudent,
} from '@/types/attendance'

const statusOptions: Array<{ value: AttendanceRecordStatus; label: string; className: string }> = [
  { value: 'PRESENT', label: 'Hadir', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'LATE', label: 'Terlambat', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'SICK', label: 'Sakit', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  { value: 'PERMIT', label: 'Izin', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  { value: 'ABSENT', label: 'Alpha', className: 'bg-red-50 text-red-700 border-red-200' },
]

function today() {
  return new Date().toISOString().slice(0, 10)
}

function getStatusClass(status: AttendanceRecordStatus) {
  return statusOptions.find((option) => option.value === status)?.className || statusOptions[0].className
}

function StatCard({
  title,
  value,
  icon,
  tone = 'default',
}: {
  title: string
  value: number
  icon: ReactNode
  tone?: 'default' | 'success' | 'warning' | 'danger'
}) {
  const tones = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-red-50 text-red-600',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`flex size-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}

export default function KehadiranPage() {
  const [date, setDate] = useState(today)
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [data, setData] = useState<TeacherAttendanceSessionData | null>(null)
  const [students, setStudents] = useState<TeacherAttendanceStudent[]>([])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let active = true

    getTeacherAttendanceSession(selectedScheduleId || undefined, date)
      .then((result) => {
        if (!active) return
        setData(result)
        setStudents(result.students)
        if (result.selectedSchedule?.id && result.selectedSchedule.id !== selectedScheduleId) {
          setSelectedScheduleId(result.selectedSchedule.id)
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [date, selectedScheduleId])

  const stats = useMemo(() => {
    const count = (status: AttendanceRecordStatus) =>
      students.filter((student) => student.status === status).length

    return {
      total: students.length,
      present: count('PRESENT'),
      late: count('LATE'),
      sickPermit: count('SICK') + count('PERMIT'),
      absent: count('ABSENT'),
    }
  }, [students])

  const updateStudent = (studentId: string, patch: Partial<TeacherAttendanceStudent>) => {
    setStudents((current) =>
      current.map((student) => student.id === studentId ? { ...student, ...patch } : student)
    )
  }

  const saveAttendance = () => {
    if (!data?.selectedSchedule) return
    setMessage('')

    startTransition(async () => {
      const result = await saveTeacherAttendanceSession({
        classScheduleId: data.selectedSchedule!.id,
        date,
        records: students.map((student) => ({
          studentId: student.id,
          status: student.status,
          note: student.note,
          checkInTime: student.check_in_time,
        })),
      })

      setMessage(result.success ? 'Presensi berhasil disimpan.' : result.error || 'Gagal menyimpan presensi.')
      if (result.success) {
        const refreshed = await getTeacherAttendanceSession(data.selectedSchedule!.id, date)
        setData(refreshed)
        setStudents(refreshed.students)
      }
    })
  }

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 p-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Presensi Kelas</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Catat kehadiran siswa berdasarkan jadwal mengajar Anda.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
                Tanggal
                <input
                  type="date"
                  value={date}
                  onChange={(event) => {
                    setIsLoading(true)
                    setMessage('')
                    setDate(event.target.value)
                  }}
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                />
              </label>
              <label className="flex min-w-[280px] flex-col gap-1.5 text-sm font-medium text-foreground">
                Jadwal
                <select
                  value={selectedScheduleId}
                  onChange={(event) => {
                    setIsLoading(true)
                    setMessage('')
                    setSelectedScheduleId(event.target.value)
                  }}
                  className="h-10 rounded-lg border border-border bg-card px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                >
                  {data?.schedules.length ? (
                    data.schedules.map((schedule) => (
                      <option key={schedule.id} value={schedule.id}>
                        {schedule.subject_name} - {schedule.class_name} ({schedule.start_time.slice(0, 5)})
                      </option>
                    ))
                  ) : (
                    <option value="">Tidak ada jadwal</option>
                  )}
                </select>
              </label>
            </div>
          </header>

          {message && (
            <div className="rounded-xl border border-border bg-card p-4 text-sm text-foreground shadow-sm">
              {message}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Total Siswa" value={stats.total} icon={<CalendarDays className="size-5" />} />
            <StatCard title="Hadir" value={stats.present} icon={<UserCheck className="size-5" />} tone="success" />
            <StatCard title="Terlambat / Izin" value={stats.late + stats.sickPermit} icon={<Clock className="size-5" />} tone="warning" />
            <StatCard title="Alpha" value={stats.absent} icon={<UserX className="size-5" />} tone="danger" />
          </div>

          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {data?.selectedSchedule
                    ? `${data.selectedSchedule.subject_name} - ${data.selectedSchedule.class_name}`
                    : 'Daftar Presensi'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {data?.session?.status === 'SUBMITTED'
                    ? 'Presensi sudah pernah disimpan dan dapat diperbarui.'
                    : 'Status awal siswa dibuat Hadir sebelum disimpan.'}
                </p>
              </div>
              <button
                type="button"
                onClick={saveAttendance}
                disabled={!data?.selectedSchedule || students.length === 0 || isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Simpan Presensi
              </button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                Memuat data presensi...
              </div>
            ) : data?.error ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <AlertCircle className="size-10 text-red-500" />
                <h3 className="mt-4 text-base font-semibold text-foreground">Gagal memuat presensi</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">{data.error}</p>
              </div>
            ) : students.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <CalendarDays className="size-10 text-muted-foreground" />
                <h3 className="mt-4 text-base font-semibold text-foreground">Belum ada siswa untuk jadwal ini</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Pastikan jadwal mengajar dan roster kelas sudah terhubung ke Supabase.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Siswa</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">NISN</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Waktu</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {students.map((student) => (
                      <tr key={student.id} className="hover:bg-muted/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                              {student.full_name.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{student.full_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-mono text-sm text-muted-foreground">{student.nisn || '-'}</td>
                        <td className="px-5 py-4">
                          <select
                            value={student.status}
                            onChange={(event) => updateStudent(student.id, { status: event.target.value as AttendanceRecordStatus })}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold outline-none ${getStatusClass(student.status)}`}
                          >
                            {statusOptions.map((option) => (
                              <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="time"
                            value={student.check_in_time || ''}
                            onChange={(event) => updateStudent(student.id, { check_in_time: event.target.value })}
                            className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <input
                            type="text"
                            value={student.note}
                            onChange={(event) => updateStudent(student.id, { note: event.target.value })}
                            placeholder="Opsional"
                            className="h-9 w-full min-w-[220px] rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>Data yang disimpan di halaman ini langsung menjadi sumber untuk halaman siswa dan laporan kepala sekolah.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
