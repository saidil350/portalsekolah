'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'

const modalVariants = cva(
  "bg-white rounded-xl shadow-xl w-full max-h-[90vh] overflow-hidden flex flex-col",
  {
    variants: {
      size: {
        sm: "max-w-md",
        md: "max-w-lg",
        lg: "max-w-3xl",
        xl: "max-w-5xl",
        full: "max-w-[95vw]",
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
)

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: VariantProps<typeof modalVariants>['size']
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  const modalRef = React.useRef<HTMLDivElement>(null)

  // Handle ESC key
  React.useEffect(() => {
    if (!isOpen || !closeOnEsc) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, closeOnEsc, onClose])

  // Focus trap
  React.useEffect(() => {
    if (!isOpen) return

    const modal = modalRef.current
    if (!modal) return

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus()
          e.preventDefault()
        }
      }
    }

    firstElement?.focus()

    document.addEventListener('keydown', handleTab)
    return () => document.removeEventListener('keydown', handleTab)
  }, [isOpen])

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(modalVariants({ size }), "relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-300", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <div className="flex-1">
              {title && (
                <h2
                  id="modal-title"
                  className="text-lg font-semibold text-text-primary"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p
                  id="modal-description"
                  className="text-sm text-text-secondary mt-1"
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-4 text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer p-1 rounded-md hover:bg-slate-100"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// Confirm Dialog Modal
export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsConfirming(false)
    }
  }

  const variants = {
    danger: {
      iconBg: 'bg-error-100',
      iconColor: 'text-error-600',
      buttonBg: 'bg-error-600',
      buttonHover: 'hover:bg-error-700',
    },
    warning: {
      iconBg: 'bg-warning-100',
      iconColor: 'text-warning-600',
      buttonBg: 'bg-warning-600',
      buttonHover: 'hover:bg-warning-700',
    },
    info: {
      iconBg: 'bg-info-100',
      iconColor: 'text-info-600',
      buttonBg: 'bg-info-600',
      buttonHover: 'hover:bg-info-700',
    },
  }

  const style = variants[variant]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnBackdrop={!isConfirming}
      closeOnEsc={!isConfirming}
    >
      <div className="flex items-start gap-4">
        <div className={cn('shrink-0 w-12 h-12 rounded-full flex items-center justify-center', style.iconBg)}>
          <svg className={cn('w-6 h-6', style.iconColor)} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onClose}
          disabled={isConfirming}
          className="flex-1 px-4 py-2.5 border border-slate-200 text-text-primary rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          disabled={isConfirming}
          className={cn(
            'flex-1 px-4 py-2.5 text-white rounded-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2',
            style.buttonBg,
            style.buttonHover
          )}
        >
          {isConfirming || loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            confirmText
          )}
        </button>
      </div>
    </Modal>
  )
}

// Form Modal - for forms with submit/cancel buttons
export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void | Promise<void>
  title: string
  description?: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  submitVariant?: 'primary' | 'danger' | 'success'
  loading?: boolean
  disableSubmit?: boolean
  size?: VariantProps<typeof modalVariants>['size']
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  submitVariant = 'primary',
  loading = false,
  disableSubmit = false,
  size = 'md',
}: FormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitVariants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600',
    danger: 'bg-error-500 text-white hover:bg-error-600',
    success: 'bg-success-500 text-white hover:bg-success-600',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      closeOnBackdrop={!isSubmitting}
      closeOnEsc={!isSubmitting}
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 border border-slate-200 rounded-lg text-text-primary hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || loading || disableSubmit}
            className={cn(
              'px-4 py-2 rounded-lg transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2',
              submitVariants[submitVariant]
            )}
          >
            {isSubmitting || loading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              submitText
            )}
          </button>
        </div>
      }
    >
      {children}
    </Modal>
  )
}
