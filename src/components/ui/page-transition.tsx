'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface PageTransitionProps {
  children: React.ReactNode
  className?: string
  variant?: 'fade' | 'slide-up' | 'slide-down' | 'scale' | 'none'
}

const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2, ease: 'easeInOut' }
  },
  'slide-up': {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: { duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }
  },
  'slide-down': {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
    transition: { duration: 0.25, ease: [0.25, 0.4, 0.25, 1] }
  },
  scale: {
    initial: { opacity: 0, scale: 0.98 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: { duration: 0.2, ease: 'easeInOut' }
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
    transition: { duration: 0 }
  }
}

export function PageTransition({
  children,
  className,
  variant = 'slide-up'
}: PageTransitionProps) {
  const config = variants[variant]

  return (
    <motion.div
      initial={config.initial}
      animate={config.animate}
      exit={config.exit}
      transition={config.transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Stagger children animation
export interface StaggerChildrenProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
  delay?: number
}

export function StaggerChildren({
  children,
  className,
  staggerDelay = 0.05,
  delay = 0
}: StaggerChildrenProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: delay
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={item}>
              {child}
            </motion.div>
          ))
        : children
      }
    </motion.div>
  )
}

// View transition wrapper for smooth page changes
export interface ViewTransitionProps {
  children: React.ReactNode
  mode?: 'wait' | 'sync' | 'popLayout'
}

export function ViewTransition({ children, mode = 'wait' }: ViewTransitionProps) {
  return (
    <AnimatePresence mode={mode}>
      {children}
    </AnimatePresence>
  )
}

// Layout transition for preserving layout between pages
export function LayoutTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}
