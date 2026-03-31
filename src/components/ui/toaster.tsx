'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
  action?: {
    label: string
    onClick: () => void
  }
  duration?: number
}

export interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void
  toasts: Toast[]
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

export interface ToastProviderProps {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  maxToasts?: number
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 4,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id, duration: toast.duration || 5000 }

    setToasts((prev) => {
      const updated = [newToast, ...prev]
      return updated.slice(0, maxToasts)
    })

    if (newToast.duration > 0) {
      setTimeout(() => removeToast(id), newToast.duration)
    }

    return id
  }, [maxToasts, removeToast])

  // Close toast on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        removeToast(toasts[0].id)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [toasts, removeToast])

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
  }

  const icons = {
    success: <CheckCircle className="w-5 h-5 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 shrink-0" />,
    info: <Info className="w-5 h-5 shrink-0" />,
  }

  const colors = {
    success: 'bg-white border-l-4 border-l-success-500 shadow-lg',
    error: 'bg-white border-l-4 border-l-error-500 shadow-lg',
    warning: 'bg-white border-l-4 border-l-warning-500 shadow-lg',
    info: 'bg-white border-l-4 border-l-info-500 shadow-lg',
  }

  const iconColors = {
    success: 'text-success-500',
    error: 'text-error-500',
    warning: 'text-warning-500',
    info: 'text-info-500',
  }

  return (
    <ToastContext.Provider value={{ showToast, toasts, removeToast }}>
      {children}
      <div
        className={cn(
          'fixed z-50 flex flex-col gap-2 pointer-events-none',
          positionClasses[position]
        )}
      >
        {toasts.map((toast, index) => (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto min-w-[320px] max-w-md rounded-lg border border-slate-200 p-4 shadow-lg animate-in slide-in-from-right duration-300',
              colors[toast.type],
              index > 0 && 'mt-2'
            )}
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className={cn('mt-0.5', iconColors[toast.type])}>
                {icons[toast.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary">
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="text-sm text-text-secondary mt-1">
                    {toast.message}
                  </p>
                )}
                {toast.action && (
                  <button
                    onClick={toast.action.onClick}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700 underline mt-2 cursor-pointer"
                  >
                    {toast.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Convenience functions for common toast types
export function useToastHelpers() {
  const { showToast } = useToast()

  return {
    success: (title: string, message?: string) =>
      showToast({ type: 'success', title, message }),
    error: (title: string, message?: string) =>
      showToast({ type: 'error', title, message }),
    warning: (title: string, message?: string) =>
      showToast({ type: 'warning', title, message }),
    info: (title: string, message?: string) =>
      showToast({ type: 'info', title, message }),
    toast: showToast,
  }
}
