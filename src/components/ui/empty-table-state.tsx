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
import { useLanguage } from '@/contexts/LanguageContext'

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
  const { t } = useLanguage()
  const isFiltering = hasFilters || hasSearch

  const messages = {
    classes: {
      title: isFiltering ? t('common.empty.classes.filtered') : t('common.empty.classes.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.classes.desc'),
      icon: <GraduationCap className="w-8 h-8" />,
      addLabel: t('common.empty.classes.add')
    },
    students: {
      title: isFiltering ? t('common.empty.students.filtered') : t('common.empty.students.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.students.desc'),
      icon: <Users className="w-8 h-8" />,
      addLabel: t('common.empty.students.add')
    },
    rooms: {
      title: isFiltering ? t('common.empty.rooms.filtered') : t('common.empty.rooms.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.rooms.desc'),
      icon: <DoorOpen className="w-8 h-8" />,
      addLabel: t('common.empty.rooms.add')
    },
    subjects: {
      title: isFiltering ? t('common.empty.subjects.filtered') : t('common.empty.subjects.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.subjects.desc'),
      icon: <BookOpen className="w-8 h-8" />,
      addLabel: t('common.empty.subjects.add')
    },
    schedules: {
      title: isFiltering ? t('common.empty.schedules.filtered') : t('common.empty.schedules.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.schedules.desc'),
      icon: <Calendar className="w-8 h-8" />,
      addLabel: t('common.empty.schedules.add')
    },
    teachers: {
      title: isFiltering ? t('common.empty.teachers.filtered') : t('common.empty.teachers.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.teachers.desc'),
      icon: <User className="w-8 h-8" />,
      addLabel: t('common.empty.teachers.add')
    },
    users: {
      title: isFiltering ? t('common.empty.users.filtered') : t('common.empty.users.title'),
      description: isFiltering
        ? t('common.empty.searchHint')
        : t('common.empty.users.desc'),
      icon: <Users className="w-8 h-8" />,
      addLabel: t('common.empty.users.add')
    },
    generic: {
      title: t('common.empty.generic.title'),
      description: isFiltering
        ? t('common.empty.generic.filtered')
        : t('common.empty.generic.desc'),
      icon: <Inbox className="w-8 h-8" />,
      addLabel: t('common.empty.generic.add')
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
        <div className="w-24 h-24 rounded-3xl bg-card shadow-xl shadow-slate-200/50 border border-border/60 flex items-center justify-center text-primary/60 rotate-6 transition-all hover:rotate-0 hover:scale-110 duration-300">
          {isFiltering ? <FileSearch className="w-12 h-12" /> : config.icon}
        </div>
        <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center text-white border-4 border-white">
          {isFiltering ? <Search className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </div>

      <h3 className="text-2xl font-black text-foreground mb-3 text-center tracking-tight">
        {displayTitle}
      </h3>

      <p className="text-base text-muted-foreground text-center max-w-sm mb-10 leading-relaxed font-medium">
        {displayDescription}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {showClearFilters && (
          <Button
            variant="secondary"
            size="lg"
            onClick={onClearFilters}
            className="bg-card hover:bg-accent border-border text-foreground font-bold px-8 rounded-xl"
            leftIcon={<X className="w-5 h-5" />}
          >
            {t('common.action.clearFilter')}
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

