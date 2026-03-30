'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isSidebarOpen: boolean
  toggleSidebar: () => void
  openSidebar: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const SIDEBAR_STORAGE_KEY = 'sidebar-open'

interface SidebarProviderProps {
  children: ReactNode
  defaultOpen?: boolean
}

export function SidebarProvider({ children, defaultOpen = true }: SidebarProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(defaultOpen)

  // Load sidebar state from localStorage on mount (browser only)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY)
      if (stored !== null) {
        setIsSidebarOpen(stored === 'true')
      }
    } catch (error) {
      console.error('Failed to load sidebar state from localStorage:', error)
    }
  }, [])

  // Save sidebar state to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isSidebarOpen))
    } catch (error) {
      console.error('Failed to save sidebar state to localStorage:', error)
    }
  }, [isSidebarOpen])

  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev)
  }

  const openSidebar = () => {
    setIsSidebarOpen(true)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, openSidebar, closeSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebarContext(): SidebarContextType {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebarContext must be used within a SidebarProvider')
  }
  return context
}
