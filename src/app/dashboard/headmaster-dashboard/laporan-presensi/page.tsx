import { AlertTriangle, BarChart3, FileText } from 'lucide-react'
import { getHeadmasterAttendanceReport } from '@/app/dashboard/attendance-actions'

function getBarHeight(rate: number) {
  return Math.max(8, Math.round((rate / 100) * 220))
}

function getRateTone(rate: number) {
  if (rate < 75) return 'text-red-600'
  if (rate < 80) return 'text-amber-600'
  return 'text-emerald-600'
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00Z`))
}

export default async function LaporanPresensiPage() {
  const report = await getHeadmasterAttendanceReport()
  const totalRecords = report.classSummaries.reduce((sum, item) => sum + item.total, 0)
  const averageRate = report.classSummaries.length
    ? Math.round(report.classSummaries.reduce((sum, item) => sum + item.attendanceRate, 0) / report.classSummaries.length)
    : 0

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-6 p-8">
          <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Laporan Presensi Siswa</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Monitoring kehadiran siswa berdasarkan data presensi yang tersimpan di Supabase.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
              Periode: <span className="font-semibold text-foreground">{formatDate(report.startDate)} - {formatDate(report.endDate)}</span>
            </div>
          </header>

          {report.error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <p>{report.error}</p>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Rata-rata Kehadiran</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{averageRate}%</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Record Presensi</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{totalRecords}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <p className="text-sm font-medium text-muted-foreground">Risiko Kronis</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{report.chronicStudents.length}</p>
            </div>
          </div>

          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Rata-rata Kehadiran Per Kelas</h2>
                <p className="text-sm text-muted-foreground">Persentase hadir dan terlambat dibanding total record presensi.</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <span className="size-3 rounded-full bg-primary" />
                Hadir
              </div>
            </div>

            {report.classSummaries.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <BarChart3 className="size-10 text-muted-foreground" />
                <h3 className="mt-4 text-base font-semibold text-foreground">Belum ada data presensi</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Grafik akan muncul setelah guru menyimpan presensi kelas.
                </p>
              </div>
            ) : (
              <div className="relative overflow-x-auto">
                <div className="flex min-w-[720px] items-end gap-4 border-b border-border px-2 pb-8 pt-6">
                  {report.classSummaries.map((item) => (
                    <div key={item.classId} className="flex flex-1 flex-col items-center gap-3">
                      <span className={`text-xs font-bold ${getRateTone(item.attendanceRate)}`}>
                        {item.attendanceRate}%
                      </span>
                      <div
                        className={`w-10 rounded-t-lg ${item.attendanceRate < 80 ? 'bg-amber-500' : 'bg-primary'}`}
                        style={{ height: `${getBarHeight(item.attendanceRate)}px` }}
                      />
                      <span className="max-w-20 text-center text-xs font-semibold uppercase text-muted-foreground">
                        {item.classCode || item.className}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border/60 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-5 text-red-500" />
                  <h2 className="text-lg font-semibold text-foreground">Deteksi Ketidakhadiran Kronis</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Siswa dengan tingkat kehadiran di bawah 80% pada periode ini.
                </p>
              </div>
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700">
                {report.chronicStudents.length} siswa
              </span>
            </div>

            {report.chronicStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
                <FileText className="size-10 text-muted-foreground" />
                <h3 className="mt-4 text-base font-semibold text-foreground">Tidak ada siswa berisiko</h3>
                <p className="mt-1 max-w-md text-sm text-muted-foreground">
                  Belum ada data atau semua siswa masih berada di atas ambang kehadiran.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Siswa</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Kelas</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Sakit</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Izin</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase text-muted-foreground">Alpha</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase text-muted-foreground">Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {report.chronicStudents.map((student) => (
                      <tr key={student.studentId} className="hover:bg-muted/40">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                              {student.studentInitials}
                            </div>
                            <span className="text-sm font-semibold text-foreground">{student.studentName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{student.className}</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{student.sick} hari</td>
                        <td className="px-5 py-4 text-sm text-muted-foreground">{student.permit} hari</td>
                        <td className="px-5 py-4 text-sm font-semibold text-red-600">{student.absent} hari</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`text-sm font-bold ${getRateTone(student.attendanceRate)}`}>
                            {student.attendanceRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
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
