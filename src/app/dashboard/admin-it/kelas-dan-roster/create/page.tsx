'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/contexts/LanguageContext'
import { createClass, fetchClassDropdownData } from '../actions'
import type { ClassFormData } from '@/types/class-roster'

interface ClassLevel {
  id: string
  name: string
  code: string
}

interface Department {
  id: string
  name: string
  code: string
}

interface Room {
  id: string
  name: string
  code: string
}

interface Teacher {
  id: string
  full_name: string
}

interface AcademicYear {
  id: string
  name: string
  is_active: boolean
}

export default function CreateClassPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    code: '',
    class_level_id: '',
    department_id: '',
    academic_year_id: '',
    home_room_id: '',
    wali_kelas_id: '',
    capacity: 30,
    description: '',
    is_active: true
  })

  const [classLevels, setClassLevels] = useState<ClassLevel[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true)
      setError('')

      try {
        const result = await fetchClassDropdownData()

        if (result.success) {
          setClassLevels(result.classLevels || [])
          setDepartments(result.departments || [])
          setRooms(result.rooms || [])
          setTeachers(result.teachers || [])
          setAcademicYears(result.academicYears || [])

          // Auto-select active academic year
          const activeYear = result.academicYears?.find(y => y.is_active)
          if (activeYear) {
            setFormData(prev => ({ ...prev, academic_year_id: activeYear.id }))
          }
        } else {
          setError(result.error || 'Gagal memuat data dropdown')
        }
      } catch (err: any) {
        console.error('Error fetching dropdown data:', err)
        setError(err.message || 'Gagal memuat data referensi')
      } finally {
        setLoading(false)
      }
    }

    fetchDropdownData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      console.log('Submitting form data:', formData)
      const result = await createClass(formData)
      console.log('Server action result:', result)

      if (result.success) {
        console.log('Class created successfully:', result.data)
        // Show success message
        alert(`Kelas "${formData.name}" berhasil dibuat!`)
        // Navigate back to class list
        router.push('/dashboard/admin-it/kelas-dan-roster')
      } else {
        console.error('Server action failed:', result.error)
        setError(result.error || 'Gagal membuat kelas')
      }
    } catch (err: any) {
      console.error('Exception during submit:', err)
      setError(err.message || 'Gagal membuat kelas')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const generateClassCode = () => {
    const level = classLevels.find(l => l.id === formData.class_level_id)
    const dept = departments.find(d => d.id === formData.department_id)

    if (level && formData.name) {
      // Generate code like "CLS-X-A" or "CLS-XI-MIPA-1"
      let code = `CLS-${level.code}`

      if (dept) {
        code += `-${dept.code}`
      }

      code += `-${formData.name.toUpperCase().replace(/\s/g, '-')}`

      setFormData(prev => ({ ...prev, code }))
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

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Plus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Buat Kelas Baru</h1>
            <p className="text-slate-500 text-sm">
              Tambahkan kelas baru ke sistem sekolah
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* Nama Kelas */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Nama Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={generateClassCode}
                  placeholder="Contoh: X-A, XI-MIPA-1, XII-IPS-2"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Nama kelas tanpa tingkat dan jurusan (contoh: "A", "MIPA-1", "IPS-2")
                </p>
              </div>

              {/* Kode Kelas */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Kode Kelas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="CLS-X-A"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Kode unik untuk mengidentifikasi kelas. Auto-generated dari nama.
                </p>
              </div>

              {/* Tingkat Kelas */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tingkat Kelas <span className="text-red-500">*</span>
                </label>
                <select
                  name="class_level_id"
                  value={formData.class_level_id}
                  onChange={handleInputChange}
                  onBlur={generateClassCode}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Tingkat Kelas</option>
                  {classLevels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Jurusan */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Jurusan
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  onBlur={generateClassCode}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tanpa Jurusan</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tahun Akademik */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Tahun Akademik <span className="text-red-500">*</span>
                </label>
                <select
                  name="academic_year_id"
                  value={formData.academic_year_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih Tahun Akademik</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.name} {year.is_active && '(Aktif)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ruang Base */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Ruang Base
                </label>
                <select
                  name="home_room_id"
                  value={formData.home_room_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Ruang Base</option>
                  {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Wali Kelas */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Wali Kelas
                </label>
                <select
                  name="wali_kelas_id"
                  value={formData.wali_kelas_id}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pilih Wali Kelas</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Kapasitas */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Kapasitas <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity}
                  onChange={handleInputChange}
                  min="1"
                  max="50"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Jumlah maksimum siswa yang dapat ditampung dalam kelas ini
                </p>
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Deskripsi tambahan tentang kelas..."
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              {/* Status Aktif */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-900">
                  Kelas Aktif
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                disabled={submitting}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Buat Kelas
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
