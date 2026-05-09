'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Info,
} from 'lucide-react'
import type { AttendanceRecordStatus, StudentAttendanceData } from '@/types/attendance'

const statusMeta: Record<AttendanceRecordStatus, {
  label: string
  short: string
  badge: string
  cell: string
}> = {
  PRESENT: {
    label: 'Hadir',
    short: 'HDR',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cell: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  LATE: {
    label: 'Terlambat',
    short: 'TLT',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    cell: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  SICK: {
    label: 'Sakit',
    short: 'SKT',
    badge: 'bg-sky-50 text-sky-700 border-sky-200',
    cell: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  PERMIT: {
    label: 'Izin',
    short: 'IZN',
    badge: 'bg-violet-50 text-violet-700 border-violet-200',
    cell: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  ABSENT: {
    label: 'Alpha',
    short: 'ALP',
    badge: 'bg-red-50 text-red-700 border-red-200',
    cell: 'bg-red-50 text-red-700 border-red-200',
  },
}

function formatMonth(month: string) {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' })
    .format(new Date(Date.UTC(year, monthNumber - 1, 1)))
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`))
}

function getMonthHref(month: string, direction: -1 | 1) {
  const [year, monthNumber] = month.split('-').map(Number)
  const next = new Date(Date.UTC(year, monthNumber - 1 + direction, 1))
  const value = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`
  return `/dashboard/student-dashboard/attendance?month=${value}`
}

function buildCalendar(data: StudentAttendanceData) {
  const [year, monthNumber] = data.month.split('-').map(Number)
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate()
  const firstDay = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay()
  const recordsByDate = new Map(
    data.records.map((record) => [record.session?.attendance_date || '', record])
  )
  const cells: Array<{ day: number | null; date?: string; status?: AttendanceRecordStatus }> = []

  for (let i = 0; i < firstDay; i += 1) cells.push({ day: null })
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = `${data.month}-${String(day).padStart(2, '0')}`
    cells.push({
      day,
      date,
      status: recordsByDate.get(date)?.status,
    })
  }

  while (cells.length % 7 !== 0) cells.push({ day: null })
  return cells
}

function MetricCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string
  description: string
  icon: ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

export function StudentAttendanceClient({ data }: { data: StudentAttendanceData }) {
  const calendarCells = buildCalendar(data)
  const summary = data.summary

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm">
                <Link href="/dashboard/student-dashboard" className="font-medium text-primary hover:underline">
                  Dashboard
                </Link>
                <ChevronRight className="size-3 text-muted-foreground" />
                <span className="font-medium text-muted-foreground">Kehadiran</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Riwayat Kehadiran</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Rekap presensi berdasarkan data yang dicatat guru.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={getMonthHref(data.month, -1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft className="size-4" />
              </Link>
              <div className="min-w-[170px] rounded-lg border border-border bg-card px-4 py-2 text-center text-sm font-semibold text-foreground shadow-sm">
                {formatMonth(data.month)}
              </div>
              <Link
                href={getMonthHref(data.month, 1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          {data.error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{data.error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Tingkat Kehadiran"
              value={`${summary.attendanceRate}%`}
              description={`${summary.present + summary.late} dari ${summary.total} presensi tercatat`}
              icon={<CheckCircle2 className="size-5" />}
            />
            <MetricCard
              title="Hadir"
              value={String(summary.present)}
              description={`${summary.late} terlambat tetap dihitung hadir`}
              icon={<CalendarDays className="size-5" />}
            />
            <MetricCard
              title="Sakit / Izin"
              value={String(summary.sick + summary.permit)}
              description={`${summary.sick} sakit, ${summary.permit} izin`}
              icon={<Info className="size-5" />}
            />
            <MetricCard
              title="Alpha"
              value={String(summary.absent)}
              description={`${summary.absencesRemaining} sisa dari batas ${3} alpha`}
              icon={<AlertTriangle className="size-5" />}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Kalender Presensi</h2>
                  <p className="text-sm text-muted-foreground">Status harian untuk bulan yang dipilih.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusMeta).map(([status, meta]) => (
                    <span key={status} className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${meta.badge}`}>
                      {meta.label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-5">
                <div className="mb-2 grid grid-cols-7 gap-2">
                  {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-semibold uppercase text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarCells.map((cell, index) => {
                    const meta = cell.status ? statusMeta[cell.status] : null
                    return (
                      <div
                        key={`${cell.date || 'blank'}-${index}`}
                        className={`flex aspect-square min-h-16 flex-col items-center justify-center rounded-lg border text-center ${
                          cell.day
                            ? meta?.cell || 'border-border bg-background text-muted-foreground'
                            : 'border-transparent bg-transparent'
                        }`}
                      >
                        {cell.day && (
                          <>
                            <span className="text-sm font-semibold">{cell.day}</span>
                            {meta && <span className="mt-1 text-[10px] font-bold uppercase">{meta.short}</span>}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            <aside className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground">Ringkasan Bulan Ini</h2>
                <div className="mt-4 flex flex-col gap-3">
                  {([
                    ['PRESENT', summary.present],
                    ['LATE', summary.late],
                    ['SICK', summary.sick],
                    ['PERMIT', summary.permit],
                    ['ABSENT', summary.absent],
                  ] as Array<[AttendanceRecordStatus, number]>).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{statusMeta[status].label}</span>
                      <span className="font-semibold text-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-foreground">Streak Hadir</h2>
                <div className="mt-4 flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-emerald-700">
                  <Clock className="size-4 shrink-0" />
                  <p className="text-sm font-semibold">{summary.currentStreak} hari terakhir tercatat hadir</p>
                </div>
              </div>
            </aside>
          </div>

          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border/60 p-5">
              <h2 className="text-lg font-semibold text-foreground">Log Detail</h2>
              <p className="text-sm text-muted-foreground">Riwayat presensi per mata pelajaran.</p>
            </div>

            {data.records.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <FileText className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">Belum ada data presensi</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Data akan muncul setelah guru menyimpan presensi untuk kelas Anda.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Tanggal</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Mata Pelajaran</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Waktu</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Catatan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {data.records.map((record) => {
                      const meta = statusMeta[record.status]
                      return (
                        <tr key={record.id} className="hover:bg-muted/40">
                          <td className="px-5 py-4 text-sm font-medium text-foreground">
                            {formatDate(record.session?.attendance_date || record.created_at.slice(0, 10))}
                          </td>
                          <td className="px-5 py-4">
                            <p className="text-sm font-semibold text-foreground">{record.session?.subject?.name || '-'}</p>
                            <p className="text-xs text-muted-foreground">{record.session?.class?.name || '-'}</p>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badge}`}>
                              {meta.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">{record.check_in_time || '-'}</td>
                          <td className="px-5 py-4 text-sm text-muted-foreground">{record.note || '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
