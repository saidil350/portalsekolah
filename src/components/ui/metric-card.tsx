import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from './card'
import { Badge } from './badge'
import { Skeleton } from './skeleton'

const metricCardVariants = cva(
  "p-5 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-md",
        compact: "p-4",
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface MetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof metricCardVariants> {
  title: string
  value: string | number
  unit?: string
  trend?: {
    value: number
    label?: string
    period?: string
  }
  icon?: React.ReactNode
  iconBg?: string
  description?: string
  loading?: boolean
}

export function MetricCard({
  className,
  variant,
  title,
  value,
  unit,
  trend,
  icon,
  iconBg = "bg-blue-50",
  description,
  loading = false,
  ...props
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={cn(metricCardVariants({ variant }), className)} {...props}>
        <div className="flex items-start justify-between mb-10">
          <Skeleton className={cn("h-[42px] w-[46px] rounded-xl", iconBg)} />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-8 w-1/2" />
        </div>
      </Card>
    )
  }

  const trendValue = trend?.value || 0
  const isPositive = trendValue > 0
  const isNegative = trendValue < 0

  const trendColor = isPositive ? 'text-green-600' : isNegative ? 'text-error-600' : 'text-slate-600'
  const trendBg = isPositive ? 'bg-green-100' : isNegative ? 'bg-error-50' : 'bg-slate-100'
  const trendIcon = isPositive ? <TrendingUp className="w-3 h-2" /> : isNegative ? <TrendingDown className="w-3 h-2" /> : <Minus className="w-3 h-2" />

  return (
    <Card className={cn(metricCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start justify-between mb-10">
        {icon && (
          <div className={cn("w-[46px] h-[42px] rounded-xl flex items-center justify-center", iconBg)}>
            {icon}
          </div>
        )}
        {trend && (
          <Badge className={cn(trendBg, trendColor)}>
            {trendIcon}
            {isPositive ? '+' : ''}{trendValue}%
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-[30px] font-bold text-foreground leading-9">
            {value}
          </p>
          {unit && (
            <span className="text-sm text-muted-foreground">{unit}</span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend?.period && (
          <p className="text-xs text-muted-foreground mt-1">
            vs {trend.period}
          </p>
        )}
      </div>
    </Card>
  )
}

// Compact variant for smaller displays
export interface MetricCardCompactProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  className?: string
}

export function MetricCardCompact({
  title,
  value,
  change,
  icon,
  className
}: MetricCardCompactProps) {
  const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-error-600' : 'text-slate-600'

  return (
    <Card className={cn("rounded-lg p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {change !== undefined && (
          <span className={cn("text-xs font-medium", changeColor)}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </Card>
  )
}

// Stat card for simple statistics
export interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: string
  trendColor?: 'green' | 'red' | 'neutral'
  description?: string
  className?: string
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  trendColor = 'neutral',
  description,
  className
}: StatCardProps) {
  const trendColors = {
    green: 'text-green-600 bg-green-100',
    red: 'text-error-600 bg-error-50',
    neutral: 'text-slate-600 bg-slate-100'
  }

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", trendColors[trendColor])}>
            {trend}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mt-2">{description}</p>
      )}
    </Card>
  )
}
