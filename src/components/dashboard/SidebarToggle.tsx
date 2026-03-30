'use client'

import React from 'react'
import { Menu, X } from 'lucide-react'
import { useSidebarContext } from '@/contexts/SidebarContext'

export default function SidebarToggle() {
  const { isSidebarOpen, toggleSidebar } = useSidebarContext()

  return (
    <button
      onClick={toggleSidebar}
      className={`
        fixed top-6 left-6 z-50
        w-10 h-10 flex items-center justify-center
        bg-gradient-to-br from-blue-500 to-blue-600
        hover:from-blue-600 hover:to-blue-700
        text-white
        shadow-lg hover:shadow-xl
        border-2 border-white/20
        rounded-full
        transition-all duration-200 ease-in-out
        group
        hover:scale-110 active:scale-95
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-0'}
      `}
      title={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
      aria-label={isSidebarOpen ? 'Tutup Sidebar' : 'Buka Sidebar'}
    >
      <Menu
        className={`w-5 h-5 transition-transform duration-200 ${
          isSidebarOpen ? 'rotate-0' : 'rotate-180'
        }`}
      />
    </button>
  )
}
