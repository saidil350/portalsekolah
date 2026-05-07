import * as React from "react"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn("flex w-full flex-col gap-4", className)}
      {...props}
    />
  )
}

type FieldProps = React.ComponentProps<"div"> & {
  "data-invalid"?: boolean
  "data-disabled"?: boolean
}

function Field({
  className,
  "data-invalid": dataInvalid,
  "data-disabled": dataDisabled,
  ...props
}: FieldProps) {
  return (
    <div
      data-slot="field"
      data-invalid={dataInvalid}
      data-disabled={dataDisabled}
      className={cn(
        "group/field flex w-full flex-col gap-1.5",
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  required,
  children,
  ...props
}: React.ComponentProps<typeof Label> & {
  required?: boolean
}) {
  return (
    <Label data-slot="field-label" className={cn("text-foreground", className)} {...props}>
      {children}
      {required && <span className="text-destructive">*</span>}
    </Label>
  )
}

function FieldDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function FieldError({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="field-error"
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    />
  )
}

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="fieldset"
      className={cn("flex min-w-0 flex-col gap-4", className)}
      {...props}
    />
  )
}

function FieldLegend({ className, ...props }: React.ComponentProps<"legend">) {
  return (
    <legend
      data-slot="field-legend"
      className={cn("mb-2 text-sm font-medium text-foreground", className)}
      {...props}
    />
  )
}

export {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
}
