'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const alertVariants = cva(
  "relative flex w-full items-start gap-3 rounded-lg border p-4 text-sm",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&_svg]:text-destructive",
        success: "border-success-500/30 bg-success-50 text-success-700 [&_svg]:text-success-700",
        warning: "border-warning-500/30 bg-warning-50 text-warning-700 [&_svg]:text-warning-700",
        error: "border-destructive/30 bg-error-50 text-error-700 [&_svg]:text-error-700",
        info: "border-primary/20 bg-primary-50 text-primary-700 [&_svg]:text-primary-700",
        neutral: "border-border bg-muted/50 text-foreground",
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
      default: <Info className="mt-0.5 size-4 shrink-0" />,
      destructive: <AlertCircle className="mt-0.5 size-4 shrink-0" />,
      success: <CheckCircle className="mt-0.5 size-4 shrink-0" />,
      warning: <AlertTriangle className="mt-0.5 size-4 shrink-0" />,
      error: <AlertCircle className="mt-0.5 size-4 shrink-0" />,
      info: <Info className="mt-0.5 size-4 shrink-0" />,
      neutral: <Info className="mt-0.5 size-4 shrink-0" />,
    }

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(alertVariants({ variant }), className)}
        {...props}
      >
        {showIcon && icons[variant || 'neutral']}
        <div className="min-w-0 flex-1">
          {title && (
            <h5 className="mb-1 font-medium leading-none tracking-tight">{title}</h5>
          )}
          <div className="leading-relaxed text-current/90">{children}</div>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Dismiss alert"
          >
            <X className="size-4" />
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
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
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
    success: 'border-success-500/30 bg-success-50 text-success-700',
    warning: 'border-warning-500/30 bg-warning-50 text-warning-700',
    error: 'border-destructive/30 bg-error-50 text-error-700',
    info: 'border-primary/20 bg-primary-50 text-primary-700',
  }

  const icons = {
    success: <CheckCircle className="size-4" />,
    warning: <AlertTriangle className="size-4" />,
    error: <AlertCircle className="size-4" />,
    info: <Info className="size-4" />,
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium',
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
