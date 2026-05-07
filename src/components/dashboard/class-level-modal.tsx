'use client'

import React, { useState, useEffect } from 'react'
import { X, Layers } from 'lucide-react'
import type { ClassLevel, ClassLevelFormData } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface ClassLevelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClassLevelFormData) => Promise<void>
  classLevel?: ClassLevel | null
  mode: 'create' | 'edit'
}

export default function ClassLevelModal({
  isOpen,
  onClose,
  onSubmit,
  classLevel,
  mode
}: ClassLevelModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<ClassLevelFormData>({
    name: '',
    code: '',
    level_order: 10,
    description: '',
    is_active: true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && classLevel) {
        setFormData({
          name: classLevel.name,
          code: classLevel.code,
          level_order: classLevel.level_order,
          description: classLevel.description || '',
          is_active: classLevel.is_active
        })
      } else {
        // Reset form for create mode
        setFormData({
          name: '',
          code: '',
          level_order: 10,
          description: '',
          is_active: true
        })
      }
      setErrors({})
    }
  }, [isOpen, mode, classLevel])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('admin.dataManagement.modal.classLevel.nameRequired')
    }

    if (!formData.code.trim()) {
      newErrors.code = t('admin.dataManagement.modal.classLevel.codeRequired')
    }

    if (formData.level_order < 10 || formData.level_order > 12) {
      newErrors.level = t('admin.dataManagement.modal.classLevel.levelRange')
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
      console.error('Error submitting class level:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePresetChange = (level: number) => {
    const presets: Record<number, { name: string; code: string }> = {
      10: { name: t('admin.dataManagement.modal.classLevel.preset10'), code: 'X' },
      11: { name: t('admin.dataManagement.modal.classLevel.preset11'), code: 'XI' },
      12: { name: t('admin.dataManagement.modal.classLevel.preset12'), code: 'XII' }
    }

    const preset = presets[level]
    if (preset) {
      setFormData({
        ...formData,
        level_order: level,
        name: preset.name,
        code: preset.code
      })
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">
                {mode === 'create'
                  ? t('admin.dataManagement.modal.classLevel.create')
                  : t('admin.dataManagement.modal.classLevel.edit')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {mode === 'create'
                  ? t('admin.dataManagement.modal.classLevel.createDesc')
                  : t('admin.dataManagement.modal.classLevel.editDesc')}
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
          {/* Preset Buttons */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.classLevel.preset')}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePresetChange(10)}
                className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.level_order === 10
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-card text-foreground border-border hover:bg-accent'
                }`}
                disabled={submitting}
              >
                {t('admin.dataManagement.modal.classLevel.preset10')}
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange(11)}
                className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.level_order === 11
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-card text-foreground border-border hover:bg-accent'
                }`}
                disabled={submitting}
              >
                {t('admin.dataManagement.modal.classLevel.preset11')}
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange(12)}
                className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.level_order === 12
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-card text-foreground border-border hover:bg-accent'
                }`}
                disabled={submitting}
              >
                {t('admin.dataManagement.modal.classLevel.preset12')}
              </button>
            </div>
          </div>

          {/* Nama Tingkat */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.classLevel.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('admin.dataManagement.modal.classLevel.namePlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Kode */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('common.label.code')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder={t('admin.dataManagement.modal.classLevel.codePlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.code ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Level (Numerik) */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.classLevel.level')} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.level_order}
              onChange={(e) => setFormData({ ...formData, level_order: parseInt(e.target.value) || 10 })}
              min="10"
              max="12"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.level ? 'border-red-300 bg-red-50' : 'border-border'
              }`}
              disabled={submitting}
            />
            {errors.level && (
              <p className="mt-1 text-xs text-red-600">{errors.level}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              {t('admin.dataManagement.modal.classLevel.levelHint')}
            </p>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {t('admin.dataManagement.modal.room.description')}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder={t('admin.dataManagement.modal.classLevel.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none"
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
              className="w-5 h-5 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
              disabled={submitting}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              {t('admin.dataManagement.modal.classLevel.active')}
            </label>
          </div>

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
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={submitting}
            >
              {submitting
                ? t('admin.dataManagement.modal.saving')
                : mode === 'create'
                  ? t('common.action.add')
                  : t('common.action.update')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
