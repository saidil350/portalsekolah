import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-muted",
  {
    variants: {
      variant: {
        text: "h-4 w-full",
        title: "h-6 w-3/4",
        avatar: "size-10 rounded-full",
        card: "h-24 w-full",
        button: "h-10 w-24",
        thumbnail: "h-16 w-16",
      },
    },
    defaultVariants: {
      variant: "text",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  count?: number
  gap?: number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, count = 1, gap = 2, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col", gap > 0 && `gap-${gap}`)}
        {...props}
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className={cn(skeletonVariants({ variant }), className)}
            style={{ width: variant === 'text' && i === count - 1 ? '60%' : undefined }}
          />
        ))}
      </div>
    )
  }
)
Skeleton.displayName = "Skeleton"

// Table skeleton component
export interface TableSkeletonProps {
  rows?: number
  columns?: number
  hasHeader?: boolean
}

export function TableSkeleton({ rows = 5, columns = 4, hasHeader = true }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <table className="w-full text-sm">
        {hasHeader && (
          <thead className="border-b bg-muted/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-4 py-3 text-left">
                  <div className="h-4 w-24 animate-shimmer rounded bg-muted" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody className="divide-y divide-border">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <td key={colIndex} className="px-4 py-3">
                  <div className="h-4 animate-shimmer rounded bg-muted" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Card skeleton component
export interface CardSkeletonProps {
  hasAvatar?: boolean
  hasTitle?: boolean
  linesOfText?: number
  hasButton?: boolean
}

export function CardSkeleton({
  hasAvatar = false,
  hasTitle = true,
  linesOfText = 3,
  hasButton = false,
}: CardSkeletonProps) {
  return (
    <div className="flex flex-col gap-4 p-6">
      <div className="flex items-start gap-4">
        {hasAvatar && <Skeleton variant="avatar" />}
        <div className="flex flex-1 flex-col gap-2">
          {hasTitle && <Skeleton variant="title" />}
          <Skeleton count={linesOfText} gap={2} />
        </div>
      </div>
      {hasButton && (
        <div className="pt-4 flex gap-3">
          <Skeleton variant="button" />
          <Skeleton variant="button" />
        </div>
      )}
    </div>
  )
}

// Metric card skeleton
export function MetricSkeleton({ hasIcon = true, hasTrend = true }: { hasIcon?: boolean; hasTrend?: boolean }) {
  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        {hasIcon && (
          <div className="h-[42px] w-[46px] rounded-xl">
            <Skeleton className="h-full w-full" />
          </div>
        )}
        {hasTrend && <Skeleton variant="button" />}
      </div>
      <div className="flex flex-col gap-2">
        <Skeleton variant="text" className="w-1/3" />
        <Skeleton variant="title" />
      </div>
    </div>
  )
}

export { Skeleton, skeletonVariants }
