'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { User, UserFormData } from '@/types/user'
import { ROLE_CONFIGS, STATUS_CONFIGS } from '@/types/user'
import { useLanguage } from '@/contexts/LanguageContext'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: UserFormData) => Promise<void>
  user?: User | null
  mode: 'create' | 'edit'
}

export default function UserModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  mode
}: UserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    full_name: '',
    password: '',
    role: 'SISWA',
    nip: '',
    nisn: '',
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  // Reset form when modal opens or user changes
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && user) {
        setFormData({
          email: user.email,
          full_name: user.full_name,
          password: '',
          role: user.role,
          nip: user.nip || '',
          nisn: user.nisn || '',
          status: user.status
        })
      } else {
        setFormData({
          email: '',
          full_name: '',
          password: '',
          role: 'SISWA',
          nip: '',
          nisn: '',
          status: 'ACTIVE'
        })
      }
      setError('')
    }
  }, [isOpen, mode, user])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.email.trim()) {
      setError(t('userModal.error.email'))
      return
    }

    if (!formData.full_name.trim()) {
      setError(t('userModal.error.name'))
      return
    }

    if (mode === 'create' && !formData.password) {
      setError(t('userModal.error.password'))
      return
    }

    // Role-based validation
    if (formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH') {
      if (!formData.nip || formData.nip.trim() === '') {
        setError(t('userModal.error.nip'))
        return
      }
    }

    if (formData.role === 'SISWA') {
      if (!formData.nisn || formData.nisn.trim() === '') {
        setError(t('userModal.error.nisn'))
        return
      }
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || t('userModal.error.generic'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  const showNIP = formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH'
  const showNISN = formData.role === 'SISWA'
  const nipRequired = showNIP
  const nisnRequired = showNISN

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <h3 className="text-xl font-bold text-text-main">
            {mode === 'create' ? t('userModal.title.create') : t('userModal.title.edit')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
            aria-label="Tutup modal"
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

          {/* Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('userModal.label.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder={t('userModal.placeholder.name')}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('userModal.label.email')} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('userModal.placeholder.email')}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
              disabled={loading}
            />
          </div>

          {/* Password (only for create or when explicitly changing) */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('userModal.label.password')} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('userModal.placeholder.password')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500 mt-1">
                {t('userModal.hint.password')}
              </p>
            </div>
          )}

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('userModal.label.role')} <span className="text-red-500">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
              required
              disabled={loading}
            >
              {ROLE_CONFIGS.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>

          {/* NIP (for GURU and KEPALA_SEKOLAH) */}
          {showNIP && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('userModal.label.nip')} {nipRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="nip"
                value={formData.nip}
                onChange={handleChange}
                placeholder={t('userModal.placeholder.nip')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required={nipRequired}
                disabled={loading}
              />
            </div>
          )}

          {/* NISN (for SISWA) */}
          {showNISN && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t('userModal.label.nisn')} {nisnRequired && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name="nisn"
                value={formData.nisn}
                onChange={handleChange}
                placeholder={t('userModal.placeholder.nisn')}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required={nisnRequired}
                disabled={loading}
              />
            </div>
          )}

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1.5">
              {t('userModal.label.status')} <span className="text-red-500">*</span>
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-white"
              required
              disabled={loading}
            >
              {STATUS_CONFIGS.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {t('userModal.btn.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/30"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('userModal.btn.saving')}
                </>
              ) : (
                mode === 'create' ? t('userModal.btn.create') : t('userModal.btn.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
