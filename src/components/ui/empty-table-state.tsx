'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import {
  GraduationCap,
  Users,
  DoorOpen,
  BookOpen,
  Calendar,
  User,
  Search,
  X,
  Plus,
  Inbox,
  FileSearch
} from 'lucide-react'
import { Button } from '@/components/ui'
import { motion } from 'framer-motion'

export interface EmptyTableStateProps {
  type: 'classes' | 'students' | 'rooms' | 'subjects' | 'schedules' | 'teachers' | 'users' | 'generic'
  hasFilters?: boolean
  hasSearch?: boolean
  onAdd?: () => void
  onClearFilters?: () => void
  addLabel?: string
  title?: string
  description?: string
  className?: string
}

export function EmptyTableState({
  type,
  hasFilters = false,
  hasSearch = false,
  onAdd,
  onClearFilters,
  addLabel,
  title,
  description,
  className
}: EmptyTableStateProps) {
  const isFiltering = hasFilters || hasSearch

  const messages = {
    classes: {
      title: isFiltering ? 'Tidak ada kelas yang cocok' : 'Belum ada kelas',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Mulai dengan membuat kelas baru untuk tahun ajaran ini',
      icon: <GraduationCap className="w-8 h-8" />,
      addLabel: 'Buat Kelas Baru'
    },
    students: {
      title: isFiltering ? 'Tidak ada siswa yang cocok' : 'Belum ada siswa di kelas ini',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Daftar siswa akan muncul setelah mereka ditambahkan ke kelas ini',
      icon: <Users className="w-8 h-8" />,
      addLabel: 'Tambah Siswa'
    },
    rooms: {
      title: isFiltering ? 'Tidak ada ruangan yang cocok' : 'Belum ada data ruangan',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Tambahkan ruangan kelas, laboratorium, atau ruangan lainnya',
      icon: <DoorOpen className="w-8 h-8" />,
      addLabel: 'Tambah Ruangan'
    },
    subjects: {
      title: isFiltering ? 'Tidak ada mata pelajaran yang cocok' : 'Belum ada mata pelajaran',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Buat mata pelajaran baru untuk kurikulum sekolah',
      icon: <BookOpen className="w-8 h-8" />,
      addLabel: 'Tambah Mata Pelajaran'
    },
    schedules: {
      title: isFiltering ? 'Tidak ada jadwal yang cocok' : 'Belum ada jadwal pelajaran',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Buat jadwal pelajaran untuk mengisi waktu kelas ini',
      icon: <Calendar className="w-8 h-8" />,
      addLabel: 'Tambah Jadwal'
    },
    teachers: {
      title: isFiltering ? 'Tidak ada guru yang cocok' : 'Belum ada data guru',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Data guru akan muncul setelah mereka ditambahkan ke sistem',
      icon: <User className="w-8 h-8" />,
      addLabel: 'Tambah Guru'
    },
    users: {
      title: isFiltering ? 'Tidak ada pengguna yang cocok' : 'Belum ada data pengguna',
      description: isFiltering
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Silakan tambahkan pengguna baru untuk memberikan akses ke sistem',
      icon: <Users className="w-8 h-8" />,
      addLabel: 'Tambah Pengguna'
    },
    generic: {
      title: 'Tidak ada data',
      description: isFiltering
        ? 'Tidak ada data yang cocok dengan filter atau pencarian'
        : 'Belum ada data yang tersedia saat ini',
      icon: <Inbox className="w-8 h-8" />,
      addLabel: 'Tambah Data'
    }
  }

  const config = messages[type] || messages.generic
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayAddLabel = addLabel || config.addLabel

  const showAddButton = onAdd && !isFiltering
  const showClearFilters = isFiltering && onClearFilters

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={cn(
        "flex flex-col items-center justify-center py-20 px-8 bg-linear-to-br from-slate-50/80 to-blue-50/40 rounded-3xl border-2 border-dashed border-slate-200/80 shadow-inner", 
        className
      )}
    >
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-3xl bg-white shadow-xl shadow-slate-200/50 border border-slate-100 flex items-center justify-center text-primary/60 rotate-6 transition-all hover:rotate-0 hover:scale-110 duration-300">
          {isFiltering ? <FileSearch className="w-12 h-12" /> : config.icon}
        </div>
        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/30 flex items-center justify-center text-white border-4 border-white">
          {isFiltering ? <Search className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </div>

      <h3 className="text-2xl font-black text-slate-800 mb-3 text-center tracking-tight">
        {displayTitle}
      </h3>

      <p className="text-base text-slate-500 text-center max-w-sm mb-10 leading-relaxed font-medium">
        {displayDescription}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {showClearFilters && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onClearFilters}
            className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-bold px-8 rounded-xl"
            leftIcon={<X className="w-5 h-5" />}
          >
            Hapus Filter
          </Button>
        )}

        {showAddButton && (
          <Button
            variant="primary"
            size="lg"
            onClick={onAdd}
            className="font-bold px-10 rounded-xl hover:scale-105 active:scale-95 transition-all bg-primary"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            {displayAddLabel}
          </Button>
        )}
      </div>
    </motion.div>
  )
}

