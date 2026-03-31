'use client'

import * as React from 'react'
import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const tooltipContentVariants = cva(
  "z-50 overflow-hidden rounded-md px-3 py-1.5 text-sm animate-in fade-in-0 zoom-in-95",
  {
    variants: {
      variant: {
        default: "bg-slate-900 text-white",
        light: "bg-white border border-slate-200 text-text-primary shadow-lg",
        primary: "bg-primary-500 text-white",
        success: "bg-success-500 text-white",
        warning: "bg-warning-500 text-white",
        error: "bg-error-500 text-white",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> &
    VariantProps<typeof tooltipContentVariants>
>(({ className, variant, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(tooltipContentVariants({ variant }), className)}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  variant?: VariantProps<typeof tooltipContentVariants>['variant']
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  disableHoverableContent?: boolean
}

export function SimpleTooltip({
  content,
  children,
  variant = 'default',
  side = 'top',
  align = 'center',
  delayDuration = 200,
  disableHoverableContent = true,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip
        delayDuration={delayDuration}
        disableHoverableContent={disableHoverableContent}
      >
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent
          variant={variant}
          side={side}
          align={align}
        >
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Helper component for showing tooltip on hover
export interface WithTooltipProps {
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function WithTooltip({ tooltip, children, side = 'top' }: WithTooltipProps) {
  return (
    <SimpleTooltip content={tooltip} side={side}>
      <span className="inline-flex">{children}</span>
    </SimpleTooltip>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
