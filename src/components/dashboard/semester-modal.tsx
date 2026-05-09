'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()
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
      newErrors.academic_year_id = t('admin.dataManagement.modal.semester.academicYearRequired')
    }

    if (!formData.name.trim()) {
      newErrors.name = t('admin.dataManagement.modal.semester.nameRequired')
    }

    if (!formData.start_date) {
      newErrors.start_date = t('admin.dataManagement.modal.academicYear.startDateRequired')
    }

    if (!formData.end_date) {
      newErrors.end_date = t('admin.dataManagement.modal.academicYear.endDateRequired')
    }

    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) <= new Date(formData.start_date)) {
        newErrors.end_date = t('admin.dataManagement.modal.academicYear.endAfterStart')
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
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {mode === 'create' ? t('admin.dataManagement.modal.semester.create') : t('admin.dataManagement.modal.semester.edit')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? t('admin.dataManagement.modal.semester.createDesc') : t('admin.dataManagement.modal.semester.editDesc')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            disabled={submitting}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Tahun Ajaran */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('common.label.academicYear')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.academic_year_id}
              onChange={(e) => setFormData({ ...formData, academic_year_id: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.academic_year_id ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            >
              <option value="">{t('admin.dataManagement.modal.semester.selectAcademicYear')}</option>
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
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('common.label.semester')} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.semester_number}
              onChange={(e) => setFormData({ ...formData, semester_number: parseInt(e.target.value) as 1 | 2 })}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
              disabled={submitting}
            >
              <option value={1}>{t('admin.dataManagement.modal.semester.odd')}</option>
              <option value={2}>{t('admin.dataManagement.modal.semester.even')}</option>
            </select>
          </div>

          {/* Nama Semester */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.semester.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.dataManagement.modal.semester.namePlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.academicYear.startDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.start_date ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-red-600">{errors.start_date}</p>
            )}
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.academicYear.endDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors ${
                errors.end_date ? 'border-red-300 bg-red-50' : 'border-border'
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
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              {t('admin.dataManagement.modal.semester.active')}
            </label>
          </div>
          {formData.is_active && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Semester aktif lain akan otomatis dinonaktifkan. Semester aktif harus berada di tahun ajaran aktif.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border/60 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg font-medium hover:bg-accent transition-colors"
              disabled={submitting}
            >
              {t('common.action.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting ? t('admin.dataManagement.modal.saving') : mode === 'create' ? t('common.action.add') : t('common.action.update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
