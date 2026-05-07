"use client"

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
import { useLanguage } from "@/contexts/LanguageContext"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void> | void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
  loading?: boolean
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  type = "danger",
  loading = false,
}: ConfirmDialogProps) {
  const { t } = useLanguage()

  const icon =
    type === "info" ? (
      <Info className="size-6 text-info-500" />
    ) : (
      <AlertTriangle className={cn("size-6", type === "warning" ? "text-warning-500" : "text-destructive")} />
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
          <AlertDialogCancel disabled={loading}>
            {cancelText || t("admin.userManagement.dialog.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault()
              void onConfirm()
            }}
            className={cn(type === "danger" && "bg-destructive text-white hover:bg-destructive/90")}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" />
                {t("admin.userManagement.dialog.processing")}
              </>
            ) : (
              confirmText || t("admin.userManagement.dialog.syncConfirm")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
