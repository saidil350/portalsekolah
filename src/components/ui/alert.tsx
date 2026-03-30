'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 flex items-start gap-3",
  {
    variants: {
      variant: {
        success: "bg-success-50 border-success-200 text-success-800",
        warning: "bg-warning-50 border-warning-200 text-warning-800",
        error: "bg-error-50 border-error-200 text-error-800",
        info: "bg-info-50 border-info-200 text-info-800",
        neutral: "bg-slate-50 border-slate-200 text-slate-800",
      },
    },
    defaultVariants: {
      variant: 'neutral',
    },
  }
)

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
  onDismiss?: () => void
  showIcon?: boolean
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      title,
      dismissible = false,
      onDismiss,
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    const icons = {
      success: <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
      warning: <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
      error: <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />,
      info: <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />,
      neutral: <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />,
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {showIcon && icons[variant || 'neutral']}
        <div className="flex-1 min-w-0">
          {title && (
            <h5 className="text-sm font-semibold mb-1">{title}</h5>
          )}
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity cursor-pointer"
            aria-label="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    )
  }
)
Alert.displayName = "Alert"

// AlertTitle component for consistency
const AlertTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("text-sm font-semibold mb-1", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

// AlertDescription component for consistency
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

// Inline alert variant (smaller, less prominent)
export interface InlineAlertProps {
  variant?: 'success' | 'warning' | 'error' | 'info'
  message: string
  className?: string
}

export function InlineAlert({ variant = 'info', message, className }: InlineAlertProps) {
  const colors = {
    success: 'bg-success-50 text-success-700 border-success-200',
    warning: 'bg-warning-50 text-warning-700 border-warning-200',
    error: 'bg-error-50 text-error-700 border-error-200',
    info: 'bg-info-50 text-info-700 border-info-200',
  }

  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    warning: <AlertTriangle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm',
        colors[variant],
        className
      )}
      role="alert"
    >
      {icons[variant]}
      <span>{message}</span>
    </div>
  )
}

export { Alert, AlertTitle, AlertDescription, alertVariants }
