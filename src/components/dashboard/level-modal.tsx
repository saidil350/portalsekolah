'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, GraduationCap } from 'lucide-react'
import type { ClassLevel, ClassLevelFormData } from '@/types/academic'
import { useLanguage } from '@/contexts/LanguageContext'

interface LevelModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: ClassLevelFormData) => Promise<void>
  level?: ClassLevel | null
  mode: 'create' | 'edit'
}

export default function LevelModal({
  isOpen,
  onClose,
  onSubmit,
  level,
  mode
}: LevelModalProps) {
  const [formData, setFormData] = useState<ClassLevelFormData>({
    name: '',
    code: '',
    level_order: 10,
    description: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && level) {
        setFormData({
          name: level.name,
          code: level.code,
          level_order: level.level_order,
          description: level.description || '',
          is_active: level.is_active
        })
      } else {
        setFormData({
          name: '',
          code: '',
          level_order: 10,
          description: '',
          is_active: true
        })
      }
      setError('')
    }
  }, [isOpen, mode, level])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim()) {
      setError('Nama tingkat kelas wajib diisi')
      return
    }

    if (!formData.code.trim()) {
      setError('Kode tingkat kelas wajib diisi')
      return
    }

    if (formData.code.length > 10) {
      setError('Kode tingkat kelas maksimal 10 karakter')
      return
    }

    if (formData.level_order < 1 || formData.level_order > 99) {
      setError('Urutan tingkat harus antara 1-99')
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
            {mode === 'create' ? 'Tambah Tingkat Kelas' : 'Edit Tingkat Kelas'}
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
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Nama Tingkat Kelas */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Tingkat Kelas <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: Kelas 10"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Kode */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Kode <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Contoh: X"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase"
              maxLength={10}
              required
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">Maksimal 10 karakter</p>
          </div>

          {/* Urutan Tingkat */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Urutan Tingkat <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="level_order"
              value={formData.level_order}
              onChange={handleChange}
              min="1"
              max="99"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-1">Gunakan angka untuk pengurutan (10, 11, 12)</p>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Deskripsi
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi tingkat kelas"
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
              disabled={loading}
            />
          </div>

          {/* Status Aktif */}
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
              Tingkat kelas aktif
            </label>
          </div>

          {/* Actions */}
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
        </form>
      </div>
    </div>
  )
}
