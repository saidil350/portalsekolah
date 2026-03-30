'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Users, Calendar, BookOpen, GraduationCap, MapPin, Clock, Loader2, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fetchClassRosterView, enrollStudent, withdrawStudent } from '../actions'
import type { ClassSchedule } from '@/types/class-roster'
import { getOccupancyBadge } from '@/types/class-roster'
import dynamic from 'next/dynamic'

// Dynamically import modals to avoid SSR issues
const AddStudentModal = dynamic(() => import('@/components/dashboard/add-student-modal'), {
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

  // Early return untuk loading params
  if (!resolved) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-600">Memuat...</span>
      </div>
    )
  }

  const handleEnrollStudent = async (studentId: string) => {
    try {
      const result = await enrollStudent(classId, studentId, rosterData?.class_info?.academic_year_id)
      if (result.success) {
        // Show success message
        alert('Siswa berhasil ditambahkan ke kelas')
        fetchRoster()
      } else {
        alert(result.error || 'Gagal menambahkan siswa')
      }
    } catch (err: any) {
      alert(err.message || 'Gagal menambahkan siswa')
    }
  }

  const handleWithdrawStudent = async (enrollmentId: string) => {
    if (!confirm('Apakah Anda yakin ingin mengeluarkan siswa ini dari kelas?')) return

    try {
      const result = await withdrawStudent(enrollmentId)
      if (result.success) {
        alert('Siswa berhasil dikeluarkan dari kelas')
        fetchRoster()
      } else {
        alert(result.error || 'Gagal mengeluarkan siswa')
      }
    } catch (err: any) {
      alert(err.message || 'Gagal mengeluarkan siswa')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-slate-600">Memuat data...</span>
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
      const schedule = schedules.find((s: any) => s.day_of_week === day.value && s.start_time === time)
      scheduleGrid[day.value][time] = schedule || null
    })
  })

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {class_info.name}
              </h1>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${badge.bgColor} ${badge.color}`}>
                {badge.icon} {badge.label}
              </span>
            </div>
            <p className="text-slate-500 text-sm">
              {class_info.code}
              {class_info.class_level && ` • ${class_info.class_level.name}`}
              {class_info.department && ` • ${class_info.department.name}`}
              {class_info.academic_year && ` • ${class_info.academic_year.name}`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddStudentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-all shadow-sm shadow-primary/30"
            >
              <Plus className="w-4 h-4" />
              Tambah Siswa
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Left Column - Student List (40%) */}
          <div className="w-2/5 border-r border-slate-200 bg-white overflow-y-auto">
            {/* Class Info */}
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Info Kelas
              </h3>
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
                  <div className="text-center py-8 text-slate-500">
                    Belum ada siswa di kelas ini
                  </div>
                ) : (
                  students.map((student: any) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {student.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{student.full_name}</p>
                          <p className="text-xs text-slate-500">{student.nisn || '-'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleWithdrawStudent(student.enrollment_id)}
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
          <div className="w-3/5 bg-white overflow-y-auto">
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Jadwal Mingguan
              </h3>

              {/* Schedule Grid */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="w-20 px-3 py-3 text-left font-semibold text-slate-600 text-xs">Jam</th>
                      {days.map(day => (
                        <th key={day.value} className="px-3 py-3 text-center font-semibold text-slate-600 text-xs">
                          {day.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time, timeIdx) => (
                      <tr key={time} className="border-b border-slate-100 last:border-b-0">
                        <td className="px-3 py-2 text-slate-500 text-xs align-top whitespace-nowrap">
                          {time}
                        </td>
                        {days.map(day => {
                          const schedule = scheduleGrid[day.value]?.[time]
                          return (
                            <td key={day.value} className="px-2 py-2 align-top">
                              {schedule ? (
                                <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-2 min-h-[70px] transition-all hover:shadow-md">
                                  <p className="font-semibold text-slate-900 text-xs mb-1">{schedule.subject?.name}</p>
                                  <p className="text-xs text-slate-600 mb-2">{schedule.teacher?.full_name}</p>
                                  <div className="flex items-center gap-2">
                                    <span className="flex items-center gap-1 text-xs text-slate-500">
                                      <MapPin className="w-3 h-3" />
                                      {schedule.room?.code || '-'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="min-h-[70px] rounded-lg border border-dashed border-slate-200 bg-slate-50/30" />
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
            <div className="mt-6 p-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <GraduationCap className="w-4 h-4" />
                Guru Pengajar ({statistics.total_teachers})
              </h3>
              <div className="flex flex-wrap gap-2">
                {teachers.map((teacher: any) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                      {teacher.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-900">{teacher.full_name}</span>
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
    </main>
  )
}
