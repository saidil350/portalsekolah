import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const inputVariants = cva(
  "flex w-full rounded-lg border transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      size: {
        sm: "h-[32px] px-3 text-sm",
        md: "h-[40px] px-4 text-sm",
        lg: "h-[48px] px-4 text-base",
      },
      state: {
        default: "border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
        error: "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20",
        success: "border-success-500 focus:border-success-500 focus:ring-2 focus:ring-success-500/20",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string
  error?: string
  success?: string
  helperText?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  loading?: boolean
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({
    className,
    type,
    size,
    state,
    label,
    error,
    success,
    helperText,
    required,
    leftIcon,
    rightIcon,
    loading,
    showPasswordToggle,
    disabled,
    ...props
  }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [inputType, setInputType] = React.useState(type)

    React.useEffect(() => {
      if (type === 'password' && showPasswordToggle) {
        setInputType(showPassword ? 'text' : 'password')
      } else {
        setInputType(type)
      }
    }, [showPassword, type, showPasswordToggle])

    const hasError = !!error
    const hasSuccess = !!success && !hasError
    const finalState = hasError ? 'error' : hasSuccess ? 'success' : state

    const id = React.useId()
    const helperId = `${id}-helper`
    const errorId = `${id}-error`

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-text-primary mb-1.5"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-text-tertiary">
              {leftIcon}
            </div>
          )}

          <input
            id={id}
            type={inputType}
            className={cn(
              inputVariants({ size, state: finalState }),
              leftIcon && "pl-10",
              (rightIcon || loading || showPasswordToggle) && "pr-10",
              className
            )}
            ref={ref}
            disabled={disabled || loading}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            {...props}
          />

          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {loading && <Loader2 className="w-4 h-4 animate-spin text-text-tertiary" />}
            {!loading && hasError && <AlertCircle className="w-4 h-4 text-error-500" />}
            {!loading && hasSuccess && <CheckCircle2 className="w-4 h-4 text-success-500" />}
            {!loading && !hasError && !hasSuccess && rightIcon && (
              <div className="w-4 h-4 flex items-center justify-center text-text-tertiary">
                {rightIcon}
              </div>
            )}
            {!loading && !hasError && !hasSuccess && showPasswordToggle && type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {hasError && (
          <p id={errorId} className="mt-1.5 text-sm text-error-500 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="mt-1.5 text-sm text-text-secondary">
            {helperText}
          </p>
        )}

        {!hasError && success && (
          <p className="mt-1.5 text-sm text-success-600 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
