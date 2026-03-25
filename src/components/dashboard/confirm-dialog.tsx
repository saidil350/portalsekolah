'use client'

import React from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = 'danger',
  loading = false
}: ConfirmDialogProps) {
  const { t } = useLanguage()
  const handleConfirm = async () => {
    await onConfirm()
  }

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600',
          buttonHover: 'hover:bg-red-700'
        }
      case 'warning':
        return {
          iconBg: 'bg-amber-100',
          iconColor: 'text-amber-600',
          buttonBg: 'bg-amber-600',
          buttonHover: 'hover:bg-amber-700'
        }
      case 'info':
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          buttonBg: 'bg-blue-600',
          buttonHover: 'hover:bg-blue-700'
        }
      default:
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          buttonBg: 'bg-red-600',
          buttonHover: 'hover:bg-red-700'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header with Icon */}
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full ${styles.iconBg} flex items-center justify-center`}>
              <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-text-main mb-2">
                {title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText || t('admin.userManagement.dialog.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 ${styles.buttonBg} text-white rounded-lg ${styles.buttonHover} transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t('admin.userManagement.dialog.processing')}
              </>
            ) : (
              confirmText || t('admin.userManagement.dialog.syncConfirm')
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
