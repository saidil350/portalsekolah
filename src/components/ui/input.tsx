"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20",
  {
    variants: {
      size: {
        sm: "h-8 text-sm",
        md: "h-9",
        lg: "h-10 text-base",
      },
      state: {
        default: "",
        error: "border-destructive ring-destructive/20",
        success: "border-success-500 ring-success-500/20",
      },
    },
    defaultVariants: {
      size: "md",
      state: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
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
  (
    {
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
      id,
      ...props
    },
    ref
  ) => {
    const reactId = React.useId()
    const inputId = id ?? reactId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    const [showPassword, setShowPassword] = React.useState(false)
    const inputType = type === "password" && showPasswordToggle && showPassword ? "text" : type
    const hasError = Boolean(error)
    const hasSuccess = Boolean(success) && !hasError
    const finalState = hasError ? "error" : hasSuccess ? "success" : state

    const control = (
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted-foreground [&_svg]:size-4">
            {leftIcon}
          </span>
        )}
        <input
          id={inputId}
          type={inputType}
          className={cn(
            inputVariants({ size, state: finalState }),
            leftIcon && "pl-9",
            (rightIcon || loading || showPasswordToggle || hasError || hasSuccess) && "pr-9",
            className
          )}
          ref={ref}
          disabled={disabled || loading}
          aria-invalid={hasError || undefined}
          aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
          {...props}
        />
        {(rightIcon || loading || showPasswordToggle || hasError || hasSuccess) && (
          <span className="absolute inset-y-0 right-2 flex items-center gap-1 text-muted-foreground [&_svg]:size-4">
            {loading && <Loader2 className="animate-spin" />}
            {!loading && hasError && <AlertCircle className="text-destructive" />}
            {!loading && hasSuccess && <CheckCircle2 className="text-success-500" />}
            {!loading && !hasError && !hasSuccess && rightIcon}
            {!loading && !hasError && !hasSuccess && showPasswordToggle && type === "password" && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-7"
                tabIndex={-1}
                onClick={() => setShowPassword((value) => !value)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            )}
          </span>
        )}
      </div>
    )

    if (!label && !error && !helperText && !success) return control

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <Label htmlFor={inputId}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
        )}
        {control}
        {hasError && (
          <p id={errorId} className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        )}
        {!hasError && success && (
          <p className="flex items-center gap-1 text-sm text-success-700">
            <CheckCircle2 className="size-3.5" />
            {success}
          </p>
        )}
        {!hasError && helperText && (
          <p id={helperId} className="text-sm text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }
