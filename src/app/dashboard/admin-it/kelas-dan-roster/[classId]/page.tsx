'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Calendar, BookOpen, GraduationCap, MapPin, Clock, Loader2, Plus, Trash2, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fetchClassRosterView } from '../actions'
import type { ClassSchedule } from '@/types/class-roster'
import { getOccupancyBadge } from '@/types/class-roster'
import { EmptyTableState } from '@/components/ui'
import dynamic from 'next/dynamic'

// Dynamically import modals to avoid SSR issues
const AddStudentModal = dynamic(() => import('@/components/dashboard/add-student-modal'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading...</div>
})

const EditClassInfoModal = dynamic(() => import('@/components/dashboard/edit-class-info-modal'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading...</div>
})

const AddScheduleModal = dynamic(() => import('@/components/dashboard/add-schedule-modal'), {
  ssr: false,
  loading: () => <div className="p-4 text-center">Loading...</div>
})

export default function ClassDetailPage({ params }: { params: Promise<{ classId: string }> }) {
  const router = useRouter()
  const [classId, setClassId] = useState<string>('')
  const [resolved, setResolved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [rosterData, setRosterData] = useState<any>(null)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false)
  const [showEditClassInfoModal, setShowEditClassInfoModal] = useState(false)
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [withdrawTarget, setWithdrawTarget] = useState<{ id?: string; studentId: string; name: string } | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const fetchRoster = async () => {
    if (!classId) return

    setLoading(true)
    setError('')
    try {
      const result = await fetchClassRosterView(classId)
      if (result.success && result.data) {
        setRosterData(result.data)
      } else {
        setError(result.error || 'Gagal memuat data kelas')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    params.then((p) => {
      setClassId(p.classId)
      setResolved(true)
    })
  }, [params])

  useEffect(() => {
    if (resolved && classId) {
      fetchRoster()
    }
  }, [classId, resolved])

  useEffect(() => {
    if (!actionMessage) return
    const timer = setTimeout(() => setActionMessage(null), 3000)
    return () => clearTimeout(timer)
  }, [actionMessage])

  // Early return untuk loading params
  if (!resolved) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-linear-to-br from-slate-50 to-blue-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-600 font-medium">Memuat...</span>
      </div>
    )
  }

  const handleEnrollStudent = async (studentId: string) => {
    try {
      const res = await fetch('/api/enrollments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId,
          classId,
          academicYearId: rosterData?.class_info?.academic_year_id || null,
        }),
      })

      const json = await res.json().catch(() => null)

      if (!json || typeof json.success === 'undefined') {
        throw new Error(`HTTP error: ${res.status}`)
      }

      if (json.success) {
        setActionMessage({ type: 'success', text: 'Siswa berhasil ditambahkan ke kelas' })
        fetchRoster()
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Gagal menambahkan siswa' })
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal menambahkan siswa' })
    }
  }

  const handleWithdrawStudent = (enrollmentId: string | undefined, studentId: string, studentName: string) => {
    if (!studentId) {
      setActionMessage({ type: 'error', text: 'Student ID tidak ditemukan. Silakan refresh halaman.' })
      return
    }
    setWithdrawTarget({ id: enrollmentId, studentId, name: studentName })
  }

  const confirmWithdrawStudent = async () => {
    if (!withdrawTarget) return

    setWithdrawing(true)
    try {
      const res = await fetch('/api/enrollments/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enrollmentId: withdrawTarget.id || null,
          classId,
          studentId: withdrawTarget.studentId,
        }),
      })
      const json = await res.json().catch(() => null)

      if (!json || typeof json.success === 'undefined') {
        throw new Error(`HTTP error: ${res.status}`)
      }

      if (json.success) {
        setActionMessage({ type: 'success', text: 'Siswa berhasil dikeluarkan dari kelas' })
        fetchRoster()
        setWithdrawTarget(null)
      } else {
        setActionMessage({ type: 'error', text: json.error || 'Gagal mengeluarkan siswa' })
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal mengeluarkan siswa' })
    } finally {
      setWithdrawing(false)
    }
  }

  const handleUpdateClassInfo = async (data: { wali_kelas_id?: string | null; home_room_id?: string | null }) => {
    try {
      // Use server action instead of API endpoint
      const { updateClass } = await import('../actions')
      const result = await updateClass(classId, {
        wali_kelas_id: data.wali_kelas_id ?? undefined,
        home_room_id: data.home_room_id ?? undefined
      })

      if (result.success) {
        setActionMessage({ type: 'success', text: 'Info kelas berhasil diperbarui' })
        fetchRoster()
      } else {
        setActionMessage({ type: 'error', text: result.error || 'Gagal memperbarui info kelas' })
        throw new Error(result.error)
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal memperbarui info kelas' })
      throw err
    }
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-linear-to-br from-slate-50 to-blue-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-600 font-medium">Memuat data...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <span className="text-red-600 text-xl">⚠</span>
        </div>
        <p className="text-red-600 font-medium mb-4">{error}</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
        >
          Kembali
        </button>
      </div>
    )
  }

  if (!rosterData) {
    return null
  }

  const { class_info, students, schedules, teachers, statistics } = rosterData
  const badge = getOccupancyBadge(class_info.current_enrollment, class_info.capacity)

  // Prepare schedule grid (5 days x 7 time slots)
  const timeSlots = ['07:00', '08:30', '10:15', '12:00', '13:30', '15:00']
  const days = [
    { value: 1, label: 'Sen' },
    { value: 2, label: 'Sel' },
    { value: 3, label: 'Rab' },
    { value: 4, label: 'Kam' },
    { value: 5, label: 'Jum' },
  ]

  // Group schedules by day and time
  const scheduleGrid: Record<number, Record<string, ClassSchedule | null>> = {}
  days.forEach(day => {
    scheduleGrid[day.value] = {}
    timeSlots.forEach(time => {
      // Extract HH:mm from start_time (database stores "07:00:00", we need "07:00")
      const schedule = schedules.find((s: any) => s.day_of_week === day.value && s.start_time?.substring(0, 5) === time)
      scheduleGrid[day.value][time] = schedule || null
    })
  })

  return (
    <main className="flex-1 flex flex-col h-full bg-linear-to-br from-slate-50/50 via-white to-blue-50/20">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-8 py-6 shrink-0 sticky top-0 z-10 shadow-sm">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span className="font-medium">Kembali</span>
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {class_info.name}
              </h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${badge.bgColor} ${badge.color}`}>
                {badge.icon} {badge.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">{class_info.code}</span>
              {class_info.class_level && <span>• {class_info.class_level.name}</span>}
              {class_info.department && <span>• {class_info.department.name}</span>}
              {class_info.academic_year && <span className="text-primary/80 font-semibold">• {class_info.academic_year.name}</span>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Siswa
            </button>
          </div>
        </div>
      </header>

      {actionMessage && (
        <div className="px-8 pt-4">
          <div className={`rounded-lg px-4 py-3 text-sm font-medium ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {actionMessage.text}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Left Column - Student List (40%) */}
          <div className="w-2/5 border-r border-slate-200 bg-white overflow-y-auto">
            {/* Class Info */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Info Kelas
                </h3>
                <button
                  type="button"
                  onClick={() => setShowEditClassInfoModal(true)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit info kelas"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Wali Kelas:</span>
                  <span className="font-medium text-slate-900">{class_info.wali_kelas?.full_name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ruang Base:</span>
                  <span className="font-medium text-slate-900">{class_info.home_room?.name || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Kapasitas:</span>
                  <span className="font-medium text-slate-900">{class_info.capacity} siswa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Terkisi:</span>
                  <span className="font-medium text-slate-900">{class_info.current_enrollment} siswa</span>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Statistik</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">{statistics.total_students}</p>
                  <p className="text-xs text-blue-600">Siswa</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-purple-600">{statistics.total_teachers}</p>
                  <p className="text-xs text-purple-600">Guru</p>
                </div>
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <BookOpen className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-emerald-600">{statistics.total_subjects}</p>
                  <p className="text-xs text-emerald-600">Mapel</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-orange-600">{statistics.total_hours_per_week}</p>
                  <p className="text-xs text-orange-600">Jam/minggu</p>
                </div>
              </div>
            </div>

            {/* Student List */}
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Daftar Siswa ({statistics.total_students})
              </h3>
              <div className="space-y-2">
                {students.length === 0 ? (
                  <EmptyTableState
                    type="students"
                    hasSearch={false}
                    hasFilters={false}
                    onAdd={() => setShowAddStudentModal(true)}
                    addLabel="Tambah Siswa"
                  />
                ) : (
                  students.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {(student.full_name || 'Siswa').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{student.full_name || 'Siswa'}</p>
                          <p className="text-xs text-slate-500">{student.nisn || '-'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleWithdrawStudent(student.enrollment_id, student.id, student.full_name)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-md transition-all"
                        title="Keluarkan siswa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Schedule Grid (60%) */}
          <div className="w-3/5 bg-white/40 backdrop-blur-sm overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Jadwal Mingguan
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Atur dan pantau jadwal pelajaran kelas</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Jadwal
                </button>
              </div>

              {/* Schedule Grid */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200">
                      <th className="w-20 px-4 py-4 text-left font-bold text-slate-600 text-[10px] uppercase tracking-wider cursor-default">Jam</th>
                      {days.map(day => (
                        <th key={day.value} className="px-4 py-4 text-center font-bold text-slate-700 text-[11px] uppercase tracking-wider cursor-default">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {timeSlots.map((time, timeIdx) => (
                      <tr key={time} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-4 text-slate-400 text-xs font-bold align-top whitespace-nowrap bg-slate-50/20">
                          {time}
                        </td>
                        {days.map(day => {
                          const schedule = scheduleGrid[day.value]?.[time]
                          return (
                            <td key={day.value} className="px-2 py-2 align-top h-24">
                              {schedule ? (
                                <div className="h-full bg-linear-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-xl p-3 transition-all hover:shadow-lg hover:shadow-blue-200/40 hover:-translate-y-0.5 group cursor-pointer ring-1 ring-blue-500/0 hover:ring-blue-500/30">
                                  <p className="font-bold text-slate-900 text-xs mb-1 group-hover:text-primary transition-colors">{schedule.subject?.name}</p>
                                  <p className="text-[10px] text-slate-500 font-medium mb-2 truncate">{schedule.teacher?.full_name}</p>
                                  <div className="mt-auto pt-2 border-t border-blue-100/50 flex items-center justify-between">
                                    <span className="flex items-center gap-1 text-[10px] text-slate-400 font-bold">
                                      <MapPin className="w-3 h-3 text-primary/50" />
                                      {schedule.room?.code || '-'}
                                    </span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse opacity-0 group-hover:opacity-100" />
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full rounded-xl border-2 border-dashed border-slate-100 bg-slate-50/10 hover:bg-slate-50/50 transition-colors" />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Teachers List */}
            <div className="mt-2 p-8 border-t border-slate-100 bg-linear-to-b from-transparent to-slate-50/30">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                Guru Pengajar <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-[10px] ml-1">{statistics.total_teachers}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {teachers.map((teacher: any) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group hover:border-purple-200"
                  >
                    <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm group-hover:scale-110 transition-transform">
                      {(teacher.full_name || 'Guru').split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{teacher.full_name || 'Guru'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudentModal && (
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
          onEnroll={handleEnrollStudent}
          classId={classId}
          academicYearId={class_info.academic_year_id}
        />
      )}

      {/* Edit Class Info Modal */}
      {showEditClassInfoModal && (
        <EditClassInfoModal
          isOpen={showEditClassInfoModal}
          onClose={() => setShowEditClassInfoModal(false)}
          onSave={handleUpdateClassInfo}
          classData={{
            wali_kelas: class_info.wali_kelas,
            home_room: class_info.home_room
          }}
        />
      )}

      {/* Add Schedule Modal */}
      {showAddScheduleModal && (
        <AddScheduleModal
          isOpen={showAddScheduleModal}
          onClose={() => setShowAddScheduleModal(false)}
          onSuccess={() => {
            fetchRoster()
            setShowAddScheduleModal(false)
          }}
          classId={classId}
          classAcademicYearId={class_info.academic_year_id}
        />
      )}

      {withdrawTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Keluarkan Siswa</h3>
              <p className="text-sm text-slate-500 mt-1">
                Apakah Anda yakin ingin mengeluarkan <span className="font-medium text-slate-900">{withdrawTarget.name}</span> dari kelas?
              </p>
            </div>
            <div className="p-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setWithdrawTarget(null)}
                disabled={withdrawing}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmWithdrawStudent}
                disabled={withdrawing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {withdrawing ? 'Memproses...' : 'Keluarkan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
