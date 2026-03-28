'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react'
import type { ClassLevel, ClassLevelFormData } from '@/types/academic'
import { useLanguage } from '@/contexts/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

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

    // Basic validation logic remains the same
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          {/* Backdrop Glassmorphism */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden border border-white/20"
          >
            {/* Header: Sticky */}
            <div className="flex items-center justify-between p-7 pb-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-primary to-primary-dark flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display">
                    {mode === 'create' ? 'Tambah Tingkat' : 'Edit Tingkat'}
                  </h3>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Modul Pengaturan Akademik
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="p-2.5 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition-all text-slate-400 hover:text-red-500 group"
                disabled={loading}
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform" />
              </button>
            </div>

            {/* Content: Scrollable Area */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-7 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                {/* Error Box */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-4 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* Form Fields */}
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                      Nama Tingkat Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Masukkan nama kelas (Contoh: Kelas 10)"
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary dark:focus:border-primary transition-all text-sm font-medium placeholder:text-slate-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="code" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        Kode <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="code"
                        id="code"
                        value={formData.code}
                        onChange={handleChange}
                        placeholder="Kode: X"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm uppercase font-bold placeholder:text-slate-400"
                        maxLength={10}
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="level_order" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        Urutan Tingkat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="level_order"
                        id="level_order"
                        value={formData.level_order}
                        onChange={handleChange}
                        min="1"
                        max="99"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm font-bold placeholder:text-slate-400"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="description" className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Informasi tambahan mengenai tingkat ini..."
                      rows={3}
                      className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-sm resize-none font-medium placeholder:text-slate-400"
                      disabled={loading}
                    />
                  </div>

                  {/* Toggle Aktif */}
                  <div 
                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                      formData.is_active 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-slate-50 dark:bg-slate-800/30 border-transparent'
                    }`}
                    onClick={() => !loading && setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        formData.is_active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 font-bold'
                      }`}>
                        {formData.is_active ? <CheckCircle2 className="w-5 h-5" /> : 'OFF'}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Status Aktif</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Tampilkan tingkat di sistem</p>
                      </div>
                    </div>
                    <div className={`w-12 h-6 rounded-full p-1 transition-all flex items-center ${
                      formData.is_active ? 'bg-primary justify-end' : 'bg-slate-300 dark:bg-slate-600 justify-start'
                    }`}>
                      <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: Sticky */}
              <div className="p-7 border-t border-slate-100 dark:border-slate-800 flex gap-4 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-12 px-6 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-bold text-sm"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-[1.5] h-12 px-6 bg-linear-to-r from-primary to-primary-dark text-white rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all font-bold text-sm flex items-center justify-center gap-2 group disabled:opacity-50 disabled:translate-y-0"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{mode === 'create' ? 'Tambah Data' : 'Simpan Perubahan'}</span>
                      <CheckCircle2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
