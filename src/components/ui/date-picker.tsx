'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isSameDay } from 'date-fns'
import { id } from 'date-fns/locale'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      locale={id}
      classNames={{
        months: "flex flex-col sm:flex-row gap-2",
        month: "flex flex-col gap-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium text-text-primary",
        nav: "flex items-center gap-1",
        button_previous: cn(
          "flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        ),
        button_next: cn(
          "flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors cursor-pointer",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        ),
        month_grid: "w-full border-collapse space-x-1",
        weekdays: "flex",
        weekday: "text-[0.8rem] font-medium text-text-secondary w-9",
        week: "flex w-full mt-2",
        day: cn(
          "relative h-9 w-9 p-0 text-sm font-normal text-text-primary transition-colors",
          "hover:bg-slate-100 hover:rounded-md cursor-pointer",
          "selected:bg-primary-500 selected:text-white selected:hover:bg-primary-600",
          "disabled:text-text-tertiary disabled:hover:bg-transparent disabled:cursor-not-allowed",
          "outside-month:text-text-tertiary"
        ),
        day_button: "h-9 w-9 p-0 font-normal",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        today: "bg-slate-100 text-primary-600 font-semibold",
        selected: "bg-primary-500 text-white hover:bg-primary-600 focus:bg-primary-600",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}

// Single Date Picker
export interface DatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled = false,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-[40px] px-4 rounded-lg border text-sm text-left transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
          "border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          disabled && "cursor-not-allowed"
        )}
      >
        {value ? format(value, 'dd MMMM yyyy', { locale: id }) : placeholder}
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-2">
              <Calendar
                mode="single"
                selected={value}
                onSelect={(date) => {
                  onChange(date)
                  setIsOpen(false)
                }}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                initialFocus
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Date Range Picker
export interface DateRangePickerProps {
  value?: { from: Date | undefined; to: Date | undefined }
  onChange: (range: { from: Date | undefined; to: Date | undefined } | undefined) => void
  placeholder?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  numberOfMonths?: number
  className?: string
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  disabled = false,
  minDate,
  maxDate,
  numberOfMonths = 2,
  className,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-[40px] px-4 rounded-lg border text-sm text-left transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
          "border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          disabled && "cursor-not-allowed"
        )}
      >
        {value?.from ? (
          value.to ? (
            <>
              {format(value.from, 'dd MMM yyyy', { locale: id })} -{" "}
              {format(value.to, 'dd MMM yyyy', { locale: id })}
            </>
          ) : (
            format(value.from, 'dd MMM yyyy', { locale: id })
          )
        ) : (
          placeholder
        )}
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 z-20 mt-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-2">
              <Calendar
                mode="range"
                selected={value?.from}
                onSelect={(range) => {
                  onChange(range ? { from: range.from, to: range.to } : undefined)
                }}
                numberOfMonths={numberOfMonths}
                disabled={(date) => {
                  if (minDate && date < minDate) return true
                  if (maxDate && date > maxDate) return true
                  return false
                }}
                initialFocus
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Preset Date Ranges
export interface PresetDateRange {
  label: string
  range: { from: Date; to: Date }
}

export const presetDateRanges: PresetDateRange[] = [
  {
    label: 'Hari ini',
    range: { from: new Date(), to: new Date() },
  },
  {
    label: '7 hari terakhir',
    range: { from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), to: new Date() },
  },
  {
    label: '30 hari terakhir',
    range: { from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), to: new Date() },
  },
  {
    label: 'Bulan ini',
    range: {
      from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      to: new Date(),
    },
  },
  {
    label: '3 bulan terakhir',
    range: { from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), to: new Date() },
  },
  {
    label: 'Tahun ini',
    range: {
      from: new Date(new Date().getFullYear(), 0, 1),
      to: new Date(),
    },
  },
]

// Date Range Picker with Presets
export interface DateRangePickerWithPresetsProps extends Omit<DateRangePickerProps, 'className'> {
  presets?: PresetDateRange[]
  className?: string
}

export function DateRangePickerWithPresets({
  value,
  onChange,
  placeholder = "Pilih rentang tanggal",
  disabled = false,
  minDate,
  maxDate,
  presets = presetDateRanges,
  className,
}: DateRangePickerWithPresetsProps) {
  const [isOpen, setIsOpen] = React.useState(false)

  const handlePresetClick = (preset: PresetDateRange) => {
    onChange(preset.range)
    setIsOpen(false)
  }

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full h-[40px] px-4 rounded-lg border text-sm text-left transition-all duration-200 bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
          "border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          disabled && "cursor-not-allowed"
        )}
      >
        {value?.from ? (
          value.to ? (
            <>
              {format(value.from, 'dd MMM yyyy', { locale: id })} -{" "}
              {format(value.to, 'dd MMM yyyy', { locale: id })}
            </>
          ) : (
            format(value.from, 'dd MMM yyyy', { locale: id })
          )
        ) : (
          placeholder
        )}
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 z-20 mt-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-lg p-4 flex gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-text-secondary">Preset</p>
                {presets.map((preset, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={cn(
                      "text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                      "hover:bg-slate-50",
                      value?.from && value.to &&
                        isSameDay(value.from, preset.range.from) &&
                        isSameDay(value.to, preset.range.to) &&
                        "bg-primary-50 text-primary-600 font-medium"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <div>
                <Calendar
                  mode="range"
                  selected={value?.from}
                  onSelect={(range) => {
                    onChange(range ? { from: range.from, to: range.to } : undefined)
                  }}
                  numberOfMonths={2}
                  disabled={(date) => {
                    if (minDate && date < minDate) return true
                    if (maxDate && date > maxDate) return true
                    return false
                  }}
                  initialFocus
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
