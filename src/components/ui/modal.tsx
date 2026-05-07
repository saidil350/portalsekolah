"use client"

import * as React from "react"
import { AlertTriangle, Info, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

type ModalSize = "sm" | "md" | "lg" | "xl" | "full"

const sizeClassName: Record<ModalSize, string> = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-3xl",
  xl: "sm:max-w-5xl",
  full: "sm:max-w-[95vw]",
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: ModalSize
  closeOnEsc?: boolean
  closeOnBackdrop?: boolean
  showCloseButton?: boolean
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  closeOnEsc = true,
  closeOnBackdrop = true,
  showCloseButton = true,
  className,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={showCloseButton}
        onEscapeKeyDown={(event) => {
          if (!closeOnEsc) event.preventDefault()
        }}
        onInteractOutside={(event) => {
          if (!closeOnBackdrop) event.preventDefault()
        }}
        className={cn("max-h-[90vh] overflow-hidden p-0", sizeClassName[size], className)}
      >
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className={!title ? "sr-only" : undefined}>
            {title || "Dialog"}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && <DialogFooter className="border-t bg-muted/40 px-6 py-4">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  )
}

export interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "danger" | "warning" | "info"
  loading?: boolean
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const [isConfirming, setIsConfirming] = React.useState(false)

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setIsConfirming(false)
    }
  }

  const icon =
    variant === "info" ? (
      <Info className="size-6 text-info-500" />
    ) : (
      <AlertTriangle className={cn("size-6", variant === "warning" ? "text-warning-500" : "text-destructive")} />
    )

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4 text-left">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted">
              {icon}
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialogTitle>{title}</AlertDialogTitle>
              <AlertDialogDescription className="mt-2 leading-relaxed">
                {message}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isConfirming}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            disabled={isConfirming || loading}
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            className={cn(variant !== "info" && "bg-destructive text-white hover:bg-destructive/90")}
          >
            {isConfirming || loading ? (
              <>
                <Loader2 className="animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export interface FormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: () => void | Promise<void>
  title: string
  description?: string
  children: React.ReactNode
  submitText?: string
  cancelText?: string
  submitVariant?: "primary" | "danger" | "success"
  loading?: boolean
  disableSubmit?: boolean
  size?: ModalSize
}

export function FormModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = "Submit",
  cancelText = "Cancel",
  submitVariant = "primary",
  loading = false,
  disableSubmit = false,
  size = "md",
}: FormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      closeOnBackdrop={!isSubmitting}
      closeOnEsc={!isSubmitting}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            {cancelText}
          </Button>
          <Button
            variant={submitVariant === "danger" ? "destructive" : submitVariant}
            onClick={handleSubmit}
            disabled={isSubmitting || loading || disableSubmit}
          >
            {isSubmitting || loading ? <Loader2 className="animate-spin" /> : null}
            {isSubmitting || loading ? "Processing..." : submitText}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  )
}
