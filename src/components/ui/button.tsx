import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
        secondary: "bg-white border border-slate-200 text-text-primary hover:bg-surface-bg-alt active:bg-surface-bg-hover",
        ghost: "bg-transparent text-text-primary hover:bg-surface-bg-alt active:bg-surface-bg-hover",
        danger: "bg-error-500 text-white hover:bg-error-600 active:bg-error-700",
        success: "bg-success-500 text-white hover:bg-success-600 active:bg-success-700",
      },
      size: {
        sm: "h-[32px] px-3 text-sm",
        md: "h-[40px] px-4 text-sm",
        lg: "h-[48px] px-6 text-base",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          <span className="w-4 h-4 flex items-center justify-center">{leftIcon}</span>
        ) : null}
        {children}
        {!loading && rightIcon && (
          <span className="w-4 h-4 flex items-center justify-center">{rightIcon}</span>
        )}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
