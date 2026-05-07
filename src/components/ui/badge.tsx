import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react'

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-white",
        outline: "text-foreground",
        success: "border-success-500/30 bg-success-50 text-success-700",
        warning: "border-warning-500/30 bg-warning-50 text-warning-700",
        error: "border-destructive/30 bg-error-50 text-error-700",
        info: "border-primary/20 bg-primary-50 text-primary-700",
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-primary/20 bg-primary-50 text-primary-700",
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
      default: null,
      secondary: null,
      destructive: <AlertCircle />,
      outline: null,
      success: <CheckCircle />,
      warning: <AlertTriangle />,
      error: <AlertCircle />,
      info: <Info />,
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
            "size-1.5 rounded-full",
            variant === 'success' && "bg-success-500",
            variant === 'warning' && "bg-warning-500",
            variant === 'error' && "bg-error-500",
            variant === 'info' && "bg-info-500",
            variant === 'neutral' && "bg-muted-foreground",
            variant === 'primary' && "bg-primary-500",
            !variant && "bg-muted-foreground"
          )} />
        )}
        {!showDot && icons[variant || 'neutral']}
        <span>{children}</span>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            type="button"
          >
            <X />
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
  offline: 'bg-muted-foreground',
  away: 'bg-warning-500',
  busy: 'bg-error-500',
}

export function StatusIndicator({ status, showLabel = false, label }: StatusIndicatorProps) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("size-2 rounded-full", statusColors[status])} />
      {showLabel && <span className="text-sm text-muted-foreground">{label || status}</span>}
    </div>
  )
}
