'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'

interface Semester {
  id: string
  academic_year_id: string
  name: string
  semester_number: 1 | 2
  start_date: string
  end_date: string
  is_active: boolean
}

interface AcademicYear {
  id: string
  name: string
}

interface SemesterFormData {
  academic_year_id: string
  name: string
  semester_number: 1 | 2
  start_date: string
  end_date: string
  is_active: boolean
}

interface SemesterModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SemesterFormData) => Promise<void>
  semester?: Semester | null
  mode: 'create' | 'edit'
  academicYears: AcademicYear[]
}

export default function SemesterModal({
  isOpen,
  onClose,
  onSubmit,
  semester,
  mode,
  academicYears
}: SemesterModalProps) {
  const [formData, setFormData] = useState<SemesterFormData>({
    academic_year_id: '',
    name: '',
    semester_number: 1,
    start_date: '',
    end_date: '',
    is_active: false
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && semester) {
        setFormData({
          academic_year_id: semester.academic_year_id,
          name: semester.name,
          semester_number: semester.semester_number,
          start_date: semester.start_date,
          end_date: semester.end_date,
          is_active: semester.is_active
        })
      } else {
        // Reset form for create mode
        setFormData({
          academic_year_id: '',
          name: '',
          semester_number: 1,
          start_date: '',
          end_date: '',
          is_active: false
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, semester])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.academic_year_id) {
      newErrors.academic_year_id = 'Tahun ajaran wajib dipilih'
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Nama semester wajib diisi'
    }

    if (!formData.start_date) {
      newErrors.start_date = 'Tanggal mulai wajib diisi'
    }

    if (!formData.end_date) {
      newErrors.end_date = 'Tanggal selesai wajib diisi'
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = 'Tanggal selesai harus setelah tanggal mulai'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (error) {
      console.error('Error submitting semester:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {mode === 'create' ? 'Tambah Semester' : 'Edit Semester'}
              </h3>
              <p className="text-sm text-slate-500">
                {mode === 'create' ? 'Buat semester baru' : 'Update semester'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tahun Ajaran */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tahun Ajaran <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.academic_year_id}
              onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.academic_year_id ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            >
              <option value="">Pilih Tahun Ajaran</option>
              {academicYears.map((ay) => (
                <option key={ay.id} value={ay.id}>
                  {ay.name}
                </option>
              ))}
            </select>
            {errors.academic_year_id && (
              <p className="mt-1 text-xs text-red-600">{errors.academic_year_id}</p>
            )}
          </div>

          {/* Nomor Semester */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Semester <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.semester_number}
              onChange={(e) => setFormData({ ...formData, semester_number: parseInt(e.target.value) as 1 | 2 })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              disabled={submitting}
            >
              <option value={1}>Semester 1 (Ganjil)</option>
              <option value={2}>Semester 2 (Genap)</option>
            </select>
          </div>

          {/* Nama Semester */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Nama Semester <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Ganjil, Genap"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.start_date ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
            )}
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.end_date ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
            )}
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-purple-600 border-slate-300 rounded focus:ring-purple-500"
              disabled={submitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-slate-900">
              Semester Aktif
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              disabled={submitting}
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? 'Menyimpan...' : mode === 'create' ? 'Tambah' : 'Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
