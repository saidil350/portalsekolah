import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        success: "bg-success-50 text-success-700 border border-success-200",
        warning: "bg-warning-50 text-warning-700 border border-warning-200",
        error: "bg-error-50 text-error-700 border border-error-200",
        info: "bg-info-50 text-info-700 border border-info-200",
        neutral: "bg-slate-100 text-slate-700 border border-slate-200",
        primary: "bg-primary-50 text-primary-700 border border-primary-200",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "sm",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  showDot?: boolean
  dismissible?: boolean
  onDismiss?: () => void
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, showDot, dismissible, onDismiss, children, ...props }, ref) => {
    const icons = {
      success: <CheckCircle className="w-3 h-3" />,
      warning: <AlertTriangle className="w-3 h-3" />,
      error: <AlertCircle className="w-3 h-3" />,
      info: <Info className="w-3 h-3" />,
      neutral: null,
      primary: null,
    }

    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {showDot && (
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === 'success' && "bg-success-500",
            variant === 'warning' && "bg-warning-500",
            variant === 'error' && "bg-error-500",
            variant === 'info' && "bg-info-500",
            variant === 'neutral' && "bg-slate-500",
            variant === 'primary' && "bg-primary-500",
            !variant && "bg-slate-500"
          )} />
        )}
        {!showDot && icons[variant || 'neutral']}
        <span>{children}</span>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="hover:opacity-70 transition-opacity cursor-pointer"
            type="button"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }

// Status indicator component for showing status with dot only
export interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'away' | 'busy'
  showLabel?: boolean
  label?: string
}

const statusColors = {
  online: 'bg-success-500',
  offline: 'bg-slate-400',
  away: 'bg-warning-500',
  busy: 'bg-error-500',
}

export function StatusIndicator({ status, showLabel = false, label }: StatusIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("w-2 h-2 rounded-full", statusColors[status])} />
      {showLabel && <span className="text-sm text-text-secondary">{label || status}</span>}
    </div>
  )
}
