'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Loader2, Clock, CheckCircle, XCircle, AlertCircle, BookOpen } from 'lucide-react'
import { createClassSchedule, checkScheduleAvailability } from '@/app/dashboard/admin-it/kelas-dan-roster/actions'
import type { ClassScheduleFormData } from '@/types/class-roster'
import { detectProfilesHasIsActive } from '@/utils/supabase/profile-columns'

interface Subject {
  id: string
  name: string
  code: string
}

interface Teacher {
  id: string
  full_name: string
}

interface Room {
  id: string
  name: string
  code: string
  capacity: number
}

interface AvailabilityStatus {
  id: string
  full_name: string
  reason?: string
}

interface AddScheduleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  classId: string
  classAcademicYearId?: string
}

const DAYS = [
  { value: 1, label: 'Senin' },
  { value: 2, label: 'Selasa' },
  { value: 3, label: 'Rabu' },
  { value: 4, label: 'Kamis' },
  { value: 5, label: 'Jumat' },
]

const TIME_SLOTS = [
  '07:00', '08:30', '10:15', '12:00', '13:30', '15:00'
]

export default function AddScheduleModal({
  isOpen,
  onClose,
  onSuccess,
  classId,
  classAcademicYearId
}: AddScheduleModalProps) {
  const [formData, setFormData] = useState<ClassScheduleFormData>({
    class_id: classId,
    subject_id: '',
    teacher_id: '',
    room_id: '',
    day_of_week: 1,
    start_time: '07:00',
    end_time: '08:30',
    academic_year_id: classAcademicYearId || '',
    is_active: true
  })

  const [subjects, setSubjects] = useState<Subject[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [checkingAvailability, setCheckingAvailability] = useState(false)

  // Fetch dropdown data
  const fetchDropdownData = useCallback(async () => {
    if (!isOpen) return

    setLoadingData(true)
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      const hasProfilesIsActive = await detectProfilesHasIsActive(supabase)

      // Fetch subjects
      const { data: subjectsData } = await supabase
        .from('subjects')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name')

      if (subjectsData) setSubjects(subjectsData as unknown as Subject[])

      // Fetch teachers (all active teachers initially)
      let teachersQuery = supabase
        .from('profiles')
        .select('id, full_name')
        .eq('role', 'GURU')
        .order('full_name')

      if (hasProfilesIsActive) {
        teachersQuery = teachersQuery.eq('is_active', true)
      }

      const { data: teachersData } = await teachersQuery

      if (teachersData) setTeachers(teachersData as unknown as Teacher[])

      // Fetch rooms
      const { data: roomsData } = await supabase
        .from('rooms')
        .select('id, name, code, capacity')
        .eq('is_active', true)
        .order('name')

      if (roomsData) setRooms(roomsData as unknown as Room[])
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    } finally {
      setLoadingData(false)
    }
  }, [isOpen])

  // Fetch teachers assigned to specific subject
  const fetchSubjectTeachers = useCallback(async (subjectId: string) => {
    if (!subjectId) return

    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Fetch teachers assigned to this subject
      const { data: subjectTeachersData, error } = await supabase
        .from('subject_teachers')
        .select('teacher_id, teacher:profiles!subject_teachers_teacher_id_fkey(id, full_name)')
        .eq('subject_id', subjectId)

      if (error) {
        console.error('Error fetching subject teachers:', error)
        return
      }

      if (subjectTeachersData && subjectTeachersData.length > 0) {
        // Update teachers list with only those assigned to this subject
        const filteredTeachers = (subjectTeachersData as any[])
          .map(st => Array.isArray(st.teacher) ? st.teacher[0] : st.teacher)
          .filter(Boolean) as unknown as Teacher[]
 
        setTeachers(filteredTeachers)
      } else {
        // If no teachers assigned to this subject, show all teachers
        await fetchDropdownData()
      }
    } catch (err) {
      console.error('Error fetching subject teachers:', err)
    }
  }, [fetchDropdownData])

  // Check availability
  const checkAvailability = useCallback(async () => {
    if (!formData.day_of_week || !formData.start_time || !formData.end_time) {
      setAvailabilityStatus([])
      return
    }

    setCheckingAvailability(true)
    try {
      const result = await checkScheduleAvailability(
        formData.day_of_week,
        formData.start_time,
        formData.end_time
      )

      if (result.success) {
        setAvailabilityStatus(result.available_teachers || [])
      }
    } catch (err) {
      console.error('Error checking availability:', err)
    } finally {
      setCheckingAvailability(false)
    }
  }, [formData.day_of_week, formData.start_time, formData.end_time])

  useEffect(() => {
    fetchDropdownData()
  }, [fetchDropdownData])

  useEffect(() => {
    if (isOpen && formData.day_of_week && formData.start_time && formData.end_time) {
      // Debounce availability check
      const timer = setTimeout(() => {
        checkAvailability()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isOpen, formData.day_of_week, formData.start_time, formData.end_time, checkAvailability])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!formData.subject_id) {
      setError('Mata pelajaran wajib dipilih')
      return
    }

    if (!formData.teacher_id) {
      setError('Guru wajib dipilih')
      return
    }

    if (!formData.room_id) {
      setError('Ruangan wajib dipilih')
      return
    }

    // Check if teacher is available
    const teacherStatus = availabilityStatus.find(s => s.id === formData.teacher_id)
    if (teacherStatus && teacherStatus.reason) {
      setError(`Guru tidak tersedia: ${teacherStatus.reason}`)
      return
    }

    setSubmitting(true)

    try {
      const result = await createClassSchedule(formData)

      if (result.success) {
        onSuccess()
        handleClose()
      } else {
        setError(result.error || 'Gagal membuat jadwal')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal membuat jadwal')
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'day_of_week'
        ? parseInt(value)
        : value
    }))

    // When subject changes, fetch teachers for that subject
    if (name === 'subject_id' && value) {
      fetchSubjectTeachers(value)
      // Reset teacher selection since teacher list changed
      setFormData(prev => ({
        ...prev,
        subject_id: value,
        teacher_id: ''
      }))
    }
  }

  const handleTimeSlotChange = (startTime: string) => {
    // Calculate end time (90 minutes later)
    const [hours, minutes] = startTime.split(':').map(Number)
    const endDate = new Date()
    endDate.setHours(hours, minutes + 90, 0)
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`

    setFormData(prev => ({
      ...prev,
      start_time: startTime,
      end_time: endTime
    }))
  }

  const handleClose = () => {
    setFormData({
      class_id: classId,
      subject_id: '',
      teacher_id: '',
      room_id: '',
      day_of_week: 1,
      start_time: '07:00',
      end_time: '08:30',
      academic_year_id: classAcademicYearId || '',
      is_active: true
    })
    setError('')
    setAvailabilityStatus([])
    onClose()
  }

  const getTeacherAvailability = (teacherId: string) => {
    return availabilityStatus.find(s => s.id === teacherId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tambah Jadwal Pelajaran</h2>
              <p className="text-sm text-slate-500">Atur jadwal untuk kelas ini</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            title="Tutup"
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Memuat data...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Day */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Hari <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {DAYS.map(day => (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, day_of_week: day.value as 1 | 2 | 3 | 4 | 5 | 6 | 7 }))}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        formData.day_of_week === day.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Slot */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Jam Pelajaran <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map(time => {
                    const isSelected = formData.start_time === time
                    const [hours] = time.split(':').map(Number)
                    const endTime = `${String((hours + 1) % 24).padStart(2, '0')}:${String(parseInt(time.split(':')[1]) + 30).padStart(2, '0')}`

                    return (
                      <button
                        key={time}
                        type="button"
                        onClick={() => handleTimeSlotChange(time)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {time} - {endTime}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label
                  htmlFor="subject_id"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject_id"
                  id="subject_id"
                  value={formData.subject_id}
                  onChange={handleChange}
                  title="Pilih Mata Pelajaran"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  required
                >
                  <option value="">Pilih Mata Pelajaran</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher with Availability */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Guru <span className="text-red-500">*</span>
                  {checkingAvailability && (
                    <span className="ml-2 text-xs font-normal text-slate-500">
                      <Loader2 className="w-3 h-3 inline animate-spin" />
                      Mengecek ketersediaan...
                    </span>
                  )}
                </label>
                {formData.subject_id && (
                  <div className="mb-2 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                    <BookOpen className="w-3 h-3" />
                    <span>Menampilkan guru yang mengajar mata pelajaran ini</span>
                  </div>
                )}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {teachers.map(teacher => {
                    const availability = getTeacherAvailability(teacher.id)
                    const isAvailable = !availability || !availability.reason

                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, teacher_id: teacher.id }))}
                        disabled={!isAvailable && !checkingAvailability}
                        className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                          formData.teacher_id === teacher.id
                            ? 'border-blue-500 bg-blue-50'
                            : isAvailable
                            ? 'border-slate-200 hover:border-slate-300 bg-white'
                            : 'border-red-200 bg-red-50 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <span className={`text-sm font-medium ${
                          formData.teacher_id === teacher.id
                            ? 'text-blue-900'
                            : isAvailable
                            ? 'text-slate-900'
                            : 'text-slate-500'
                        }`}>
                          {teacher.full_name}
                        </span>
                        {isAvailable ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle className="w-4 h-4" />
                            <span>Terjadwal</span>
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Room */}
              <div>
                <label
                  htmlFor="room_id"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  Ruangan <span className="text-red-500">*</span>
                </label>
                <select
                  name="room_id"
                  id="room_id"
                  value={formData.room_id}
                  onChange={handleChange}
                  title="Pilih Ruangan"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  required
                >
                  <option value="">Pilih Ruangan</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.code}) - Kapasitas {room.capacity}
                    </option>
                  ))}
                </select>
              </div>

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={submitting}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || loadingData}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses...
              </>
            ) : (
              'Simpan Jadwal'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
