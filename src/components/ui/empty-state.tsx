import * as React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export interface EmptyStateAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  disabled?: boolean
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actions?: EmptyStateAction[]
  className?: string
}

export function EmptyState({ icon, title, description, actions, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 px-4 py-12 text-center", className)}>
      {icon && (
        <div className="flex size-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
      )}
      <div className="flex max-w-md flex-col gap-2">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              variant={
                action.variant === 'secondary'
                  ? 'outline'
                  : action.variant === 'ghost'
                    ? 'ghost'
                    : action.variant === 'danger'
                      ? 'destructive'
                      : 'default'
              }
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

// Specialized empty state variants
export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
}

export function EmptyStateCard({
  title,
  description,
  className,
  children,
  ...props
}: React.PropsWithChildren<EmptyStateProps>) {
  return (
    <Card
      className={cn(
        "flex flex-col items-center justify-center border-dashed px-4 py-12 text-center",
        className
      )}
      {...props}
    >
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {children || <svg className="size-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>}
      </div>
      <h3 className="mb-1 text-base font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      )}
    </Card>
  )
}
