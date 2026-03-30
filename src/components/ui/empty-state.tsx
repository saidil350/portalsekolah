import * as React from 'react'
import { cn } from '@/lib/utils'

export interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actions?: EmptyStateAction[]
  className?: string
}

export function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-12 px-4", className)}>
      {icon && (
        <div className="w-16 h-16 flex items-center justify-center text-slate-300 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-md mb-6">{description}</p>
      )}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                action.variant === 'primary' && "bg-primary-500 text-white hover:bg-primary-600",
                action.variant === 'secondary' && "bg-white border border-slate-200 text-text-primary hover:bg-surface-bg-alt",
                action.variant === 'ghost' && "bg-transparent text-text-primary hover:bg-surface-bg-alt",
                action.variant === 'danger' && "bg-error-500 text-white hover:bg-error-600",
                !action.variant && "bg-primary-500 text-white hover:bg-primary-600"
              )}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Specialized empty state variants
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function EmptyStateCard({
  title,
  description,
  className,
  children,
  ...props
}: React.PropsWithChildren<EmptyStateProps>) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4 bg-white rounded-xl border border-dashed border-slate-200",
        className
      )}
      {...props}
    >
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
        {children || <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>}
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-text-secondary max-w-sm">{description}</p>
      )}
    </div>
  )
}
