'use client'

import React, { useState, useEffect } from 'react'
import { X, Layers } from 'lucide-react'
import type { ClassLevel, ClassLevelFormData } from '@/types'

interface ClassLevelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClassLevelFormData) => Promise<void>
  classLevel?: ClassLevel | null
  mode: 'create' | 'edit'
}

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
      newErrors.name = 'Nama tingkat kelas wajib diisi'
    }

    if (!formData.code.trim()) {
      newErrors.code = 'Kode tingkat kelas wajib diisi'
    }

    if (formData.level_order < 10 || formData.level_order > 12) {
      newErrors.level = 'Level harus antara 10-12'
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
      10: { name: 'Kelas X', code: 'X' },
      11: { name: 'Kelas XI', code: 'XI' },
      12: { name: 'Kelas XII', code: 'XII' }
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
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Layers className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {mode === 'create' ? 'Tambah Tingkat Kelas' : 'Edit Tingkat Kelas'}
              </h3>
              <p className="text-sm text-slate-500">
                {mode === 'create' ? 'Buat tingkat kelas baru' : 'Update tingkat kelas'}
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
          {/* Preset Buttons */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Pilih Preset
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handlePresetChange(10)}
                className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.level_order === 10
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                disabled={submitting}
              >
                Kelas X
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange(11)}
                className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.level_order === 11
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                disabled={submitting}
              >
                Kelas XI
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange(12)}
                className={`flex-1 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.level_order === 12
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
                disabled={submitting}
              >
                Kelas XII
              </button>
            </div>
          </div>

          {/* Nama Tingkat */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Nama Tingkat Kelas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Contoh: Kelas X"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.name ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600">{errors.name}</p>
            )}
          </div>

          {/* Kode */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Kode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="Contoh: X"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.code ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            />
            {errors.code && (
              <p className="mt-1 text-xs text-red-600">{errors.code}</p>
            )}
          </div>

          {/* Level (Numerik) */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Level (Numerik) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.level_order}
              onChange={(e) => setFormData({ ...formData, level_order: parseInt(e.target.value) || 10 })}
              min="10"
              max="12"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                errors.level ? 'border-red-300 bg-red-50' : 'border-slate-200'
              }`}
              disabled={submitting}
            />
            {errors.level && (
              <p className="mt-1 text-xs text-red-600">{errors.level}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">Contoh: 10 untuk Kelas X, 11 untuk Kelas XI</p>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Deskripsi
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi tambahan tentang tingkat kelas..."
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors resize-none"
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
            <label htmlFor="is_active" className="text-sm font-medium text-slate-900">
              Tingkat Kelas Aktif
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
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
