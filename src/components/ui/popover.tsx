'use client'

import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { cn } from '@/lib/utils'

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverAnchor = PopoverPrimitive.Anchor

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'center', sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-slate-200 bg-white p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

// Dropdown Menu - specialized popover for menu items
export interface DropdownMenuItem {
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: 'default' | 'danger' | 'warning'
  disabled?: boolean
}

export interface DropdownMenuProps {
  trigger: React.ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
}

export function DropdownMenu({ trigger, items, align = 'end', side = 'bottom' }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent align={align} side={side} className="w-48 p-1">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => {
              item.onClick()
              setOpen(false)
            }}
            disabled={item.disabled}
            className={cn(
              "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              item.variant === 'danger' && "hover:bg-error-50 text-error-600",
              item.variant === 'warning' && "hover:bg-warning-50 text-warning-600",
              (!item.variant || item.variant === 'default') && "hover:bg-slate-50 text-text-primary"
            )}
          >
            {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
            <span className="flex-1 text-left">{item.label}</span>
          </button>
        ))}
      </PopoverContent>
    </Popover>
  )
}

// Context Menu - right-click menu
export interface ContextMenuProps {
  items: DropdownMenuItem[]
  children: React.ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setPosition({ x: e.clientX, y: e.clientY })
    setOpen(true)
  }

  return (
    <div onContextMenu={handleContextMenu}>
      {children}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border border-slate-200 bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95"
            style={{ left: position.x, top: position.y }}
          >
            {items.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick()
                  setOpen(false)
                }}
                disabled={item.disabled}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors cursor-pointer",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  item.variant === 'danger' && "hover:bg-error-50 text-error-600",
                  item.variant === 'warning' && "hover:bg-warning-50 text-warning-600",
                  (!item.variant || item.variant === 'default') && "hover:bg-slate-50 text-text-primary"
                )}
              >
                {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
                <span className="flex-1 text-left">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }
