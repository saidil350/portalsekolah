'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Subject, SubjectFormData } from '@/types/data-management'
import { SUBJECT_TYPE_CONFIGS } from '@/types/data-management'
import { useLanguage } from '@/contexts/LanguageContext'
import { fetchSubjectDropdownData } from '@/app/dashboard/admin-it/data-management/actions'

interface Department {
  id: string
  name: string
}

interface AcademicYear {
  id: string
  name: string
}

interface SubjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SubjectFormData) => Promise<void>
  subject?: Subject | null
  mode: 'create' | 'edit'
}

export default function SubjectModal({
  isOpen,
  onClose,
  onSubmit,
  subject,
  mode
}: SubjectModalProps) {
  const [formData, setFormData] = useState<SubjectFormData>({
    name: '',
    code: '',
    subject_type: 'MANDATORY',
    credit_hours: 2,
    department_id: '',
    academic_year_id: '',
    description: '',
    prerequisites: [],
    is_active: true
  })
  const [departments, setDepartments] = useState<Department[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')

  // Fetch departments and academic years when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDropdownData()
      if (mode === 'edit' && subject) {
        setFormData({
          name: subject.name,
          code: subject.code,
          subject_type: subject.subject_type,
          credit_hours: subject.credit_hours,
          department_id: subject.department_id || '',
          academic_year_id: subject.academic_year_id || '',
          description: subject.description || '',
          prerequisites: subject.prerequisites || [],
          is_active: subject.is_active
        })
      } else {
        setFormData({
          name: '',
          code: '',
          subject_type: 'MANDATORY',
          credit_hours: 2,
          department_id: '',
          academic_year_id: '',
          description: '',
          prerequisites: [],
          is_active: true
        })
      }
      setError('')
    }
  }, [isOpen, mode, subject])

  const fetchDropdownData = async () => {
    setLoadingData(true)
    try {
      const result = await fetchSubjectDropdownData()

      if (result.success) {
        if (result.departments) {
          setDepartments(result.departments)
        }
        if (result.academicYears) {
          setAcademicYears(result.academicYears)
        }
      } else {
        console.error('Error fetching dropdown data:', result.error)
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    } finally {
      setLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Nama mata pelajaran wajib diisi')
      return
    }

    if (!formData.code.trim()) {
      setError('Kode mata pelajaran wajib diisi')
      return
    }

    if (formData.credit_hours < 1 || formData.credit_hours > 6) {
      setError('Beban SKS harus antara 1-6')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
             type === 'number' ? parseInt(value) || 0 :
             value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-text-main">
            {mode === 'create' ? 'Tambah Mata Pelajaran' : 'Edit Mata Pelajaran'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Nama Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Contoh: Matematika"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Kode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Contoh: MTK-101"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tipe Mata Pelajaran <span className="text-red-500">*</span>
                </label>
                <select
                  name="subject_type"
                  value={formData.subject_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
                  required
                  disabled={loading}
                >
                  {SUBJECT_TYPE_CONFIGS.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Beban SKS <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="credit_hours"
                  value={formData.credit_hours}
                  onChange={handleChange}
                  min="1"
                  max="6"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Jurusan
                </label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
                  disabled={loading}
                >
                  <option value="">Tidak ada jurusan</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Tahun Akademik
                </label>
                <select
                  name="academic_year_id"
                  value={formData.academic_year_id}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
                  disabled={loading}
                >
                  <option value="">Tidak ada tahun akademik</option>
                  {academicYears.map(year => (
                    <option key={year.id} value={year.id}>
                      {year.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Deskripsi
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Deskripsi mata pelajaran"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
                  disabled={loading}
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
                  disabled={loading}
                />
                <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                  Mata pelajaran aktif
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/30"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    mode === 'create' ? 'Tambah' : 'Simpan'
                  )}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}
