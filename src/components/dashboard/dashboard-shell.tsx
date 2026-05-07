'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

import { cn } from '@/lib/utils'

interface DashboardShellProps {
  children: React.ReactNode
  className?: string
}

function isModifiedClick(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [isNavigating, setIsNavigating] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const navigationTimeout = React.useRef<number | null>(null)
  const progressInterval = React.useRef<number | null>(null)

  const stopTimers = React.useCallback(() => {
    if (navigationTimeout.current) {
      window.clearTimeout(navigationTimeout.current)
      navigationTimeout.current = null
    }
    if (progressInterval.current) {
      window.clearInterval(progressInterval.current)
      progressInterval.current = null
    }
  }, [])

  const startNavigationFeedback = React.useCallback(() => {
    stopTimers()
    setIsNavigating(true)
    setProgress(18)

    progressInterval.current = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 88) return current
        return current + Math.max(2, (88 - current) * 0.16)
      })
    }, 140)

    navigationTimeout.current = window.setTimeout(() => {
      setProgress(100)
      window.setTimeout(() => {
        setIsNavigating(false)
        setProgress(0)
        stopTimers()
      }, 240)
    }, 8000)
  }, [stopTimers])

  React.useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (isModifiedClick(event) || event.defaultPrevented) return

      const target = event.target as HTMLElement | null
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const url = new URL(anchor.href, window.location.href)
      const isSameOrigin = url.origin === window.location.origin
      const isDashboardRoute = url.pathname.startsWith('/dashboard')
      const isSamePath = url.pathname === window.location.pathname && url.search === window.location.search
      const opensElsewhere = anchor.target && anchor.target !== '_self'

      if (!isSameOrigin || !isDashboardRoute || isSamePath || opensElsewhere) return

      startNavigationFeedback()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [startNavigationFeedback])

  React.useEffect(() => {
    if (!isNavigating) return

    setProgress(100)
    const done = window.setTimeout(() => {
      setIsNavigating(false)
      setProgress(0)
      stopTimers()
    }, 260)

    return () => window.clearTimeout(done)
  }, [pathname, isNavigating, stopTimers])

  React.useEffect(() => stopTimers, [stopTimers])

  return (
    <main className={cn('relative flex min-w-0 flex-1 overflow-hidden bg-background', className)}>
      <div
        className={cn(
          'pointer-events-none absolute inset-x-0 top-0 z-40 h-0.5 overflow-hidden bg-transparent',
          isNavigating && 'bg-primary/10'
        )}
        aria-hidden="true"
      >
        <div
          className="h-full bg-primary shadow-[0_0_16px_rgba(19,127,236,0.35)] transition-[width,opacity] duration-200 ease-out"
          style={{ width: `${progress}%`, opacity: isNavigating ? 1 : 0 }}
        />
      </div>

      <AnimatePresence>
        {isNavigating && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16 }}
            className="pointer-events-none absolute right-5 top-4 z-40 inline-flex items-center gap-2 rounded-full border bg-card/95 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur"
          >
            <Loader2 className="size-3.5 animate-spin" />
            Memuat
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: reduceMotion ? 0.08 : 0.22, ease: [0.22, 1, 0.36, 1] }}
          className="min-w-0 flex-1 overflow-hidden"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}
