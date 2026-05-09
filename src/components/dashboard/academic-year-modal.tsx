'use client'

import React, { useState, useEffect } from 'react'
import { X, Calendar } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface AcademicYear {
  id: string
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  description?: string | null
}

interface AcademicYearFormData {
  name: string
  start_date: string
  end_date: string
  is_active: boolean
  description?: string
}

interface AcademicYearModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AcademicYearFormData) => Promise<void>
  academicYear?: AcademicYear | null
  mode: 'create' | 'edit'
}

export default function AcademicYearModal({
  isOpen,
  onClose,
  onSubmit,
  academicYear,
  mode
}: AcademicYearModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<AcademicYearFormData>({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    description: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && academicYear) {
        setFormData({
          name: academicYear.name,
          start_date: academicYear.start_date,
          end_date: academicYear.end_date,
          is_active: academicYear.is_active,
          description: academicYear.description || ''
        })
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          start_date: '',
          end_date: '',
          is_active: false,
          description: ''
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, academicYear])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('admin.dataManagement.modal.academicYear.nameRequired')
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

    // Validate name format (should be like "2024/2025")
    if (formData.name && !/^\d{4}\/\d{4}$/.test(formData.name.trim())) {
      newErrors.name = t('admin.dataManagement.modal.academicYear.formatError')
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
      // Error handling sudah di parent component
      console.error('Error submitting academic year:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const generateNameFromDates = () => {
    if (formData.start_date) {
      const startYear = new Date(formData.start_date).getFullYear()
      const endYear = startYear + 1
      setFormData(prev => ({
        ...prev,
        name: `${startYear}/${endYear}`,
        end_date: prev.end_date || `${endYear}-06-30`
      }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {mode === 'create' ? t('admin.dataManagement.modal.academicYear.create') : t('admin.dataManagement.modal.academicYear.edit')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mode === 'create' ? t('admin.dataManagement.modal.academicYear.createDesc') : t('admin.dataManagement.modal.academicYear.editDesc')}
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
          {/* Nama Tahun Ajaran */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.academicYear.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.dataManagement.modal.academicYear.namePlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{t('admin.dataManagement.modal.academicYear.formatHint')}</p>
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.academicYear.startDate')} <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => {
                setFormData({ ...formData, start_date: e.target.value })
                if (mode === 'create' && !formData.name) {
                  generateNameFromDates()
                }
              }}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
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
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.end_date ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-red-600">{errors.end_date}</p>
            )}
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.room.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.dataManagement.modal.academicYear.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none"
              disabled={submitting}
            />
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              disabled={submitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              {t('admin.dataManagement.modal.academicYear.active')}
            </label>
          </div>
          {formData.is_active && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Tahun ajaran aktif lain di sekolah ini akan otomatis dinonaktifkan.
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
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
