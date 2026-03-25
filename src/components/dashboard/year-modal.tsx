'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, Calendar } from 'lucide-react'
import type { AcademicYear, AcademicYearFormData } from '@/types/academic'
import { useLanguage } from '@/contexts/LanguageContext'

interface YearModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AcademicYearFormData) => Promise<void>
  year?: AcademicYear | null
  mode: 'create' | 'edit'
}

export default function YearModal({
  isOpen,
  onClose,
  onSubmit,
  year,
  mode
}: YearModalProps) {
  const [formData, setFormData] = useState<AcademicYearFormData>({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && year) {
        setFormData({
          name: year.name,
          start_date: year.start_date.split('T')[0],
          end_date: year.end_date.split('T')[0],
          is_active: year.is_active,
          description: year.description || ''
        })
      } else {
        setFormData({
          name: '',
          start_date: '',
          end_date: '',
          is_active: false,
          description: ''
        })
      }
      setError('')
    }
  }, [isOpen, mode, year])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim()) {
      setError('Nama tahun akademik wajib diisi')
      return
    }

    if (!formData.start_date) {
      setError('Tanggal mulai wajib diisi')
      return
    }

    if (!formData.end_date) {
      setError('Tanggal selesai wajib diisi')
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('Tanggal selesai harus setelah tanggal mulai')
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
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-text-main">
            {mode === 'create' ? 'Tambah Tahun Akademik' : 'Edit Tahun Akademik'}
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

          {/* Nama Tahun Akademik */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nama Tahun Akademik <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: 2024/2025"
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Tanggal Mulai */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tanggal Mulai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required
                disabled={loading}
              />
            </div>
          </div>

          {/* Tanggal Selesai */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Tanggal Selesai <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required
                disabled={loading}
              />
            </div>
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
              placeholder="Deskripsi tahun akademik"
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
              Tandai sebagai tahun akademik aktif
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
