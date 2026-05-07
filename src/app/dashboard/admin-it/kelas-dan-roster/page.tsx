'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Users, Calendar, BookOpen, Loader2, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fetchClasses, fetchFilterDropdownData } from './actions'
import type { Class, ClassFilters } from '@/types/class-roster'
import { getOccupancyBadge } from '@/types/class-roster'
import { EmptyTableState } from '@/components/ui'
import { useLanguage } from '@/contexts/LanguageContext'

interface ClassLevel {
  id: string
  name: string
  code: string
}

interface Department {
  id: string
  name: string
  code: string
}

export default function KelasDanRosterPage() {
  const router = useRouter()
  const { t } = useLanguage()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [error, setError] = useState('')

  // Filters
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')

  // Dropdown data
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    fetchClassesData()
    fetchDropdownData()
  }, [search, levelFilter, departmentFilter])

  const fetchClassesData = async () => {
    setLoading(true)
    setError('')

    try {
      const filters: ClassFilters = {
        search,
        class_level_id: levelFilter,
        department_id: departmentFilter
      }

      const result = await fetchClasses(filters)

      if (result.success && result.data) {
        setClasses(result.data)
      } else {
        setError(result.error || t('admin.roster.error.loadClasses'))
      }
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : t('admin.roster.error.loadClasses'))
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const result = await fetchFilterDropdownData()

      if (result.success) {
        setClassLevels(result.classLevels as unknown as ClassLevel[])
        setDepartments(result.departments as unknown as Department[])
      }
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    }
  }

  const handleClassClick = (classId: string) => {
    router.push(`/dashboard/admin-it/kelas-dan-roster/${classId}`)
  }

  const handleCreateClass = () => {
    router.push('/dashboard/admin-it/kelas-dan-roster/create')
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-5 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{t('admin.roster.title')}</h1>
              <p className="text-muted-foreground text-sm">
                {t('admin.roster.subtitle')}
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateClass}
            className="flex h-8 items-center gap-2 px-3 bg-blue-600 text-white rounded-md text-xs font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            {t('admin.roster.createClass')}
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-card border-b border-border px-6 py-3.5 shrink-0">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('admin.roster.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              title={t('admin.roster.filter.level')}
              className="pl-9 pr-9 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-card appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">{t('admin.roster.filter.allLevels')}</option>
              {classLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              title={t('admin.roster.filter.department')}
              className="pl-9 pr-9 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-card appearance-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="">{t('admin.roster.filter.allDepartments')}</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(search || levelFilter || departmentFilter) && (
            <button
              onClick={() => {
                setSearch('')
                setLevelFilter('')
                setDepartmentFilter('')
              }}
              className="h-8 px-3 text-muted-foreground hover:text-slate-900 text-xs font-medium hover:bg-accent rounded-md transition-colors"
            >
              {t('common.action.clearFilter')}
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="mt-3 text-sm text-muted-foreground">
          {t('admin.roster.resultCount', { count: classes.length })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-muted-foreground">{t('common.state.loadingData')}</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchClassesData}
              className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-slate-200 transition-colors"
            >
              {t('admin.roster.retry')}
            </button>
          </div>
        ) : classes.length === 0 ? (
          <EmptyTableState
            type="classes"
            hasFilters={!!search || !!levelFilter || !!departmentFilter}
            hasSearch={!!search}
            onAdd={handleCreateClass}
            onClearFilters={() => {
              setSearch('')
              setLevelFilter('')
              setDepartmentFilter('')
            }}
            addLabel={t('admin.roster.firstClass')}
          />
        ) : (
          /* Class Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => {
              const badge = getOccupancyBadge(cls.current_enrollment, cls.capacity)

              return (
                <div
                  key={cls.id}
                  onClick={() => handleClassClick(cls.id)}
                  className="bg-card rounded-xl border border-border shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-border/60">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{cls.code}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badge.bgColor} ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {cls.class_level && (
                        <>
                          <span>{cls.class_level.name}</span>
                          {cls.department && <span>•</span>}
                        </>
                      )}
                      {cls.department && <span>{cls.department.name}</span>}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('common.label.students')}</p>
                          <p className="text-sm font-semibold text-foreground">
                            {cls.current_enrollment}/{cls.capacity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{t('admin.roster.hoursPerWeek')}</p>
                          <p className="text-sm font-semibold text-foreground">
                            {cls.total_hours_per_week || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Wali Kelas */}
                    {cls.wali_kelas && (
                      <div className="mt-4 pt-4 border-t border-border/60">
                        <p className="text-xs text-muted-foreground mb-1">{t('common.label.homeroomTeacher')}</p>
                        <p className="text-sm font-medium text-foreground">
                          {cls.wali_kelas.full_name}
                        </p>
                      </div>
                    )}

                    {/* Room */}
                    {cls.home_room && (
                      <div className="mt-3">
                        <p className="text-xs text-muted-foreground">{t('common.label.baseRoom')}</p>
                        <p className="text-sm font-medium text-foreground">
                          {cls.home_room.name} ({cls.home_room.code})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-2 bg-muted/50 rounded-b-xl flex items-center justify-center">
                    <span className="text-sm text-blue-600 font-medium group-hover:underline">
                      {t('admin.roster.viewDetails')}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
