"use client"

import * as React from "react"
import { useFormContext } from "react-hook-form"
import { AlertCircle } from "lucide-react"

import { Checkbox } from "@/components/ui/checkbox"
import { Input, type InputProps } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export interface FormInputProps
  extends Omit<InputProps, "name" | "error" | "success"> {
  name: string
  label?: string
  required?: boolean
  helperText?: string
}

export function FormInput({
  name,
  label,
  required,
  helperText,
  ...props
}: FormInputProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext()
  const error = errors[name]?.message as string | undefined

  return (
    <Input
      label={label}
      required={required}
      helperText={helperText}
      error={error}
      aria-invalid={Boolean(error)}
      {...register(name)}
      {...props}
    />
  )
}

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
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()
  const value = watch(name)
  const error = errors[name]?.message as string | undefined
  const id = React.useId()

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <Select value={value ?? ""} onValueChange={(nextValue) => setValue(name, nextValue, { shouldDirty: true, shouldValidate: true })}>
        <SelectTrigger id={id} className={cn("w-full", className)} aria-invalid={Boolean(error)}>
          <SelectValue placeholder={placeholder || "Pilih..."} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p className="flex items-center gap-1 text-sm text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  )
}

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
    setValue,
    watch,
    formState: { errors },
  } = useFormContext()
  const checked = Boolean(watch(name))
  const error = errors[name]?.message as string | undefined
  const id = React.useId()

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => setValue(name, Boolean(value), { shouldDirty: true, shouldValidate: true })}
        aria-invalid={Boolean(error)}
      />
      <div className="flex flex-1 flex-col gap-1">
        {label && (
          <Label htmlFor={id}>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </Label>
        )}
        {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  )
}

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
    watch,
    formState: { errors },
  } = useFormContext()
  const error = errors[name]?.message as string | undefined
  const currentLength = String(watch(name) || "").length
  const id = React.useId()

  return (
    <div className="flex w-full flex-col gap-1.5">
      {label && (
        <Label htmlFor={id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <Textarea
        id={id}
        rows={rows}
        maxLength={maxLength}
        aria-invalid={Boolean(error)}
        className={className}
        {...register(name)}
      />
      <div className="flex items-center justify-between gap-3">
        {error ? (
          <p className="flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="size-3.5" />
            {error}
          </p>
        ) : helperText ? (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        ) : (
          <span />
        )}
        {showCount && maxLength && (
          <span className="text-xs text-muted-foreground">
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  )
}
