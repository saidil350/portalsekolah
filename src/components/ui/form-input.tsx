'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const formInputVariants = cva(
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
      size: 'md',
      state: 'default',
    },
  }
)

export interface FormInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof formInputVariants> {
  name: string
  label?: string
  required?: boolean
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  showPasswordToggle?: boolean
}

export function FormInput({
  name,
  label,
  required,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle,
  size,
  type,
  className,
  ...props
}: FormInputProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext()

  const [showPassword, setShowPassword] = React.useState(false)
  const inputType = type === 'password' && showPasswordToggle && showPassword ? 'text' : type

  const error = errors[name]
  const hasError = !!error
  const value = watch(name)
  const hasValue = value !== undefined && value !== ''

  const id = React.useId()
  const helperId = `${id}-helper`
  const errorId = `${id}-error`

  const state = hasError ? 'error' : 'default'

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
            formInputVariants({ size, state }),
            leftIcon && "pl-10",
            (rightIcon || showPasswordToggle) && "pr-10",
            className
          )}
          {...register(name)}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          {...props}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {hasError && <AlertCircle className="w-4 h-4 text-error-500" />}
          {!hasError && hasValue && <CheckCircle2 className="w-4 h-4 text-success-500" />}
          {!hasError && !hasValue && rightIcon && (
            <div className="w-4 h-4 flex items-center justify-center text-text-tertiary">
              {rightIcon}
            </div>
          )}
          {!hasError && showPasswordToggle && type === 'password' && (
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
          {error.message as string}
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className="mt-1.5 text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Select input variant
export interface FormSelectProps {
  name: string
  label?: string
  required?: boolean
  helperText?: string
  options: { value: string; label: string }[]
  placeholder?: string
  className?: string
}

export function FormSelect({
  name,
  label,
  required,
  helperText,
  options,
  placeholder,
  className,
}: FormSelectProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const hasError = !!error

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

      <select
        id={id}
        className={cn(
          "flex w-full h-[40px] px-4 rounded-lg border text-sm transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed",
          hasError
            ? "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20"
            : "border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          className
        )}
        {...register(name)}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : helperText ? helperId : undefined
        }
      >
        <option value="">{placeholder || 'Pilih...'}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {hasError && (
        <p id={errorId} className="mt-1.5 text-sm text-error-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" />
          {error.message as string}
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className="mt-1.5 text-sm text-text-secondary">
          {helperText}
        </p>
      )}
    </div>
  )
}

// Checkbox input
export interface FormCheckboxProps {
  name: string
  label?: string
  required?: boolean
  helperText?: string
  className?: string
}

export function FormCheckbox({
  name,
  label,
  required,
  helperText,
  className,
}: FormCheckboxProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()

  const error = errors[name]
  const hasError = !!error

  const id = React.useId()
  const helperId = `${id}-helper`
  const errorId = `${id}-error`

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="flex items-center h-5">
        <input
          id={id}
          type="checkbox"
          className={cn(
            "w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-2 focus:ring-primary-500/20",
            hasError && "border-error-500"
          )}
          {...register(name)}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
        />
      </div>
      <div className="flex-1">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-text-primary cursor-pointer"
          >
            {label}
            {required && <span className="text-error-500 ml-1">*</span>}
          </label>
        )}
        {helperText && (
          <p id={helperId} className="text-xs text-text-secondary mt-0.5">
            {helperText}
          </p>
        )}
        {hasError && (
          <p id={errorId} className="mt-1 text-sm text-error-500">
            {error.message as string}
          </p>
        )}
      </div>
    </div>
  )
}

// Textarea
export interface FormTextareaProps {
  name: string
  label?: string
  required?: boolean
  helperText?: string
  rows?: number
  maxLength?: number
  showCount?: boolean
  className?: string
}

export function FormTextarea({
  name,
  label,
  required,
  helperText,
  rows = 4,
  maxLength,
  showCount = false,
  className,
}: FormTextareaProps) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext()

  const error = errors[name]
  const hasError = !!error
  const value = watch(name) || ''
  const currentLength = String(value).length

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

      <textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "flex w-full px-4 rounded-lg border text-sm transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed resize-none",
          hasError
            ? "border-error-500 focus:border-error-500 focus:ring-2 focus:ring-error-500/20"
            : "border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          className
        )}
        {...register(name)}
        aria-invalid={hasError}
        aria-describedby={
          hasError ? errorId : helperText ? helperId : undefined
        }
      />

      <div className="flex items-center justify-between mt-1.5">
        <div className="flex-1">
          {hasError && (
            <p id={errorId} className="text-sm text-error-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {error.message as string}
            </p>
          )}
          {!hasError && helperText && (
            <p id={helperId} className="text-sm text-text-secondary">
              {helperText}
            </p>
          )}
        </div>
        {showCount && maxLength && (
          <span className={cn(
            "text-xs",
            currentLength > maxLength ? 'text-error-500' : 'text-text-tertiary'
          )}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
