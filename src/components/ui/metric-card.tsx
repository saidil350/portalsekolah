import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

const metricCardVariants = cva(
  "bg-white rounded-xl p-5 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-slate-200 shadow-sm",
        elevated: "shadow-sm hover:shadow-md",
        compact: "border border-slate-200 p-4",
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
      <div className={cn(metricCardVariants({ variant }), className)} {...props}>
        <div className="flex items-start justify-between mb-10">
          <div className={cn("w-[46px] h-[42px] rounded-xl", iconBg)}>
            <div className="w-full h-full bg-slate-200 animate-pulse" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 rounded w-1/3 animate-pulse" />
          <div className="h-8 bg-slate-200 rounded w-1/2 animate-pulse" />
        </div>
      </div>
    )
  }

  const trendValue = trend?.value || 0
  const isPositive = trendValue > 0
  const isNeutral = trendValue === 0
  const isNegative = trendValue < 0

  const trendColor = isPositive ? 'text-green-600' : isNegative ? 'text-error-600' : 'text-slate-600'
  const trendBg = isPositive ? 'bg-green-100' : isNegative ? 'bg-error-50' : 'bg-slate-100'
  const trendIcon = isPositive ? <TrendingUp className="w-3 h-2" /> : isNegative ? <TrendingDown className="w-3 h-2" /> : <Minus className="w-3 h-2" />

  return (
    <div className={cn(metricCardVariants({ variant }), className)} {...props}>
      <div className="flex items-start justify-between mb-10">
        {icon && (
          <div className={cn("w-[46px] h-[42px] rounded-xl flex items-center justify-center", iconBg)}>
            {icon}
          </div>
        )}
        {trend && (
          <div className={cn("rounded-full px-2 py-1 flex items-center gap-1", trendBg, trendColor)}>
            {trendIcon}
            <span className="text-xs font-medium">
              {isPositive ? '+' : ''}{trendValue}%
            </span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <div className="flex items-baseline gap-1">
          <p className="text-[30px] font-bold text-text-primary leading-9">
            {value}
          </p>
          {unit && (
            <span className="text-sm text-text-secondary">{unit}</span>
          )}
        </div>
        {description && (
          <p className="text-xs text-text-tertiary mt-1">{description}</p>
        )}
        {trend?.period && (
          <p className="text-xs text-text-tertiary mt-1">
            vs {trend.period}
          </p>
        )}
      </div>
    </div>
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
    <div className={cn("bg-white rounded-lg p-4 border border-slate-200", className)}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-text-secondary">{title}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {change !== undefined && (
          <span className={cn("text-xs font-medium", changeColor)}>
            {change > 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </div>
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
    <div className={cn("bg-white rounded-xl p-5 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-secondary">{label}</p>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="flex items-baseline gap-2 mt-1">
        <p className="text-2xl font-bold text-text-primary">{value}</p>
        {trend && (
          <span className={cn("text-xs font-medium px-2 py-1 rounded-full", trendColors[trendColor])}>
            {trend}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-text-tertiary mt-2">{description}</p>
      )}
    </div>
  )
}
