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
  Plus
} from 'lucide-react'
import { Button } from '@/components/ui'

export interface EmptyTableStateProps {
  type: 'classes' | 'students' | 'rooms' | 'subjects' | 'schedules' | 'teachers' | 'generic'
  hasFilters?: boolean
  hasSearch?: boolean
  onAdd?: () => void
  onClearFilters?: () => void
  addLabel?: string
  className?: string
}

export function EmptyTableState({
  type,
  hasFilters = false,
  hasSearch = false,
  onAdd,
  onClearFilters,
  addLabel = 'Tambah Baru',
  className
}: EmptyTableStateProps) {
  const messages = {
    classes: {
      title: hasFilters || hasSearch ? 'Tidak ada kelas yang cocok' : 'Belum ada kelas',
      description: hasFilters || hasSearch
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Mulai dengan membuat kelas baru untuk tahun ajaran ini',
      icon: <GraduationCap className="w-12 h-12" />,
      addLabel: 'Buat Kelas Baru'
    },
    students: {
      title: hasFilters || hasSearch ? 'Tidak ada siswa yang cocok' : 'Belum ada siswa di kelas ini',
      description: hasFilters || hasSearch
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Daftar siswa akan muncul setelah mereka ditambahkan ke kelas ini',
      icon: <Users className="w-12 h-12" />,
      addLabel: 'Tambah Siswa'
    },
    rooms: {
      title: hasFilters || hasSearch ? 'Tidak ada ruangan yang cocok' : 'Belum ada data ruangan',
      description: hasFilters || hasSearch
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Tambahkan ruangan kelas, laboratorium, atau ruangan lainnya',
      icon: <DoorOpen className="w-12 h-12" />,
      addLabel: 'Tambah Ruangan'
    },
    subjects: {
      title: hasFilters || hasSearch ? 'Tidak ada mata pelajaran yang cocok' : 'Belum ada mata pelajaran',
      description: hasFilters || hasSearch
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Buat mata pelajaran baru untuk kurikulum sekolah',
      icon: <BookOpen className="w-12 h-12" />,
      addLabel: 'Tambah Mata Pelajaran'
    },
    schedules: {
      title: hasFilters || hasSearch ? 'Tidak ada jadwal yang cocok' : 'Belum ada jadwal pelajaran',
      description: hasFilters || hasSearch
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Buat jadwal pelajaran untuk mengisi waktu kelas ini',
      icon: <Calendar className="w-12 h-12" />,
      addLabel: 'Tambah Jadwal'
    },
    teachers: {
      title: hasFilters || hasSearch ? 'Tidak ada guru yang cocok' : 'Belum ada data guru',
      description: hasFilters || hasSearch
        ? 'Coba ubah kata kunci pencarian atau filter yang aktif'
        : 'Data guru akan muncul setelah mereka ditambahkan ke sistem',
      icon: <User className="w-12 h-12" />,
      addLabel: 'Tambah Guru'
    },
    generic: {
      title: 'Tidak ada data',
      description: hasFilters || hasSearch
        ? 'Tidak ada data yang cocok dengan filter atau pencarian'
        : 'Belum ada data yang tersedia',
      icon: <Search className="w-12 h-12" />,
      addLabel: 'Tambah Data'
    }
  }

  const config = messages[type] || messages.generic

  const showAddButton = onAdd && !hasFilters && !hasSearch
  const showClearFilters = (hasFilters || hasSearch) && onClearFilters

  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4", className)}>
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300 mb-4">
        {config.icon}
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-2 text-center">
        {config.title}
      </h3>

      <p className="text-sm text-text-secondary text-center max-w-md mb-6">
        {config.description}
      </p>

      <div className="flex items-center gap-3">
        {showClearFilters && (
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
            leftIcon={<X />}
          >
            Hapus Filter
          </Button>
        )}

        {showAddButton && (
          <Button
            variant="primary"
            size="sm"
            onClick={onAdd}
            leftIcon={<Plus />}
          >
            {addLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
