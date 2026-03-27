'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Users, BookOpen, Clock, Loader2, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useRouter } from 'next/navigation'

interface TeacherClass {
  id: string
  class_name: string
  class_code: string
  subject_name: string
  subject_code: string
  schedules_count: number
  students_count: number
  class_level?: string
  department?: string
}

export default function TeacherClassSchedulePage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [error, setError] = useState('')
  const [academicYear, setAcademicYear] = useState('')
  const [semester, setSemester] = useState('1')

  useEffect(() => {
    fetchTeacherClasses()
  }, [academicYear, semester])

  const fetchTeacherClasses = async () => {
    setLoading(true)
    setError('')

    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Get teacher's profile
      const { data: teacherProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .eq('role', 'GURU')
        .single()

      if (profileError || !teacherProfile) {
        throw new Error('Teacher profile not found')
      }

      // Fetch classes taught by this teacher
      const { data: schedulesData, error: schedulesError } = await supabase
        .from('class_schedules')
        .select(`
          class_id,
          classes (
            id,
            name,
            code,
            class_level:class_levels(name),
            department:departments(name)
          ),
          subject:subjects(id, name, code),
          academic_year_id
        `)
        .eq('teacher_id', teacherProfile.id)
        .eq('is_active', true)

      if (schedulesError) throw schedulesError

      // Group by class and subject
      const classMap = new Map<string, TeacherClass>()

      schedulesData?.forEach((schedule: any) => {
        const classData = schedule.classes
        const subjectData = schedule.subject

        if (!classData || !subjectData) return

        const key = `${classData.id}-${subjectData.id}`
        const existing = classMap.get(key)

        if (existing) {
          existing.schedules_count++
        } else {
          classMap.set(key, {
            id: classData.id,
            class_name: classData.name,
            class_code: classData.code,
            subject_name: subjectData.name,
            subject_code: subjectData.code,
            schedules_count: 1,
            students_count: 0, // Will be fetched separately
            class_level: classData.class_level?.name,
            department: classData.department?.name
          })
        }
      })

      // Fetch student count for each class
      const classIds = Array.from(classMap.values()).map(c => c.id)
      if (classIds.length > 0) {
        const { data: enrollmentsData } = await supabase
          .from('enrollments')
          .select('class_id')
          .in('class_id', classIds)
          .eq('status', 'ACTIVE')

        enrollmentsData?.forEach((enrollment: any) => {
          classMap.forEach((classInfo) => {
            if (classInfo.id === enrollment.class_id) {
              classInfo.students_count++
            }
          })
        })
      }

      setClasses(Array.from(classMap.values()))
    } catch (err: any) {
      console.error('Error fetching teacher classes:', err)
      setError(err.message || 'Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  const handleClassClick = (classId: string) => {
    router.push(`/dashboard/teaching-dashboard/jadwal-kelas/${classId}`)
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Jadwal Kelas Saya</h1>
            <p className="text-slate-500 text-sm">
              Kelola jadwal mengajar dan roster siswa
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Tahun Akademik</label>
            <select
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Semua Tahun</option>
              {/* Academic years would be loaded dynamically */}
              <option value="2024-2025">2024/2025</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">Semester</label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
            >
              <option value="1">Semester Ganjil</option>
              <option value="2">Semester Genap</option>
            </select>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            <span className="ml-3 text-slate-600">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchTeacherClasses}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Belum Ada Jadwal Mengajar
            </h3>
            <p className="text-slate-500 text-sm">
              Anda belum diassign ke kelas manapun. Hubungi admin IT untuk informasi lebih lanjut.
            </p>
          </div>
        ) : (
          /* Class Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classInfo) => (
              <div
                key={`${classInfo.id}-${classInfo.subject_code}`}
                onClick={() => handleClassClick(classInfo.id)}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
                        {classInfo.class_name}
                      </h3>
                      <p className="text-sm text-slate-500">{classInfo.class_code}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>

                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-50 border border-purple-200">
                    <span className="text-xs font-semibold text-purple-700">
                      {classInfo.subject_name}
                    </span>
                  </div>

                  {(classInfo.class_level || classInfo.department) && (
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                      {classInfo.class_level && <span>{classInfo.class_level}</span>}
                      {classInfo.class_level && classInfo.department && <span>•</span>}
                      {classInfo.department && <span>{classInfo.department}</span>}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Jam/Minggu</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {classInfo.schedules_count}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Siswa</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {classInfo.students_count}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3 bg-slate-50 rounded-b-xl flex items-center justify-center">
                  <span className="text-sm text-purple-600 font-medium group-hover:underline">
                    Lihat Jadwal & Roster →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
