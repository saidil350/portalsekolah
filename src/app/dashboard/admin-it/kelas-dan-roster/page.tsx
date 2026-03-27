'use client'

import React, { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Users, Calendar, BookOpen, Loader2, Search, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fetchClasses, fetchFilterDropdownData } from './actions'
import type { Class, ClassFilters } from '@/types/class-roster'
import { getOccupancyBadge } from '@/types/class-roster'

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
        setError(result.error || 'Gagal memuat data kelas')
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data kelas')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const result = await fetchFilterDropdownData()

      if (result.success) {
        setClassLevels(result.classLevels as ClassLevel[])
        setDepartments(result.departments as Department[])
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
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Kelas & Roster</h1>
              <p className="text-slate-500 text-sm">
                Kelola kelas, jadwal, dan daftar siswa
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateClass}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/30"
          >
            <Plus className="w-4 h-4" />
            Buat Kelas Baru
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama atau kode kelas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none"
            >
              <option value="">Semua Tingkat</option>
              {classLevels.map(level => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white appearance-none"
            >
              <option value="">Semua Jurusan</option>
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
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Result count */}
        <div className="mt-3 text-sm text-slate-500">
          {classes.length} kelas ditemukan
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-3 text-slate-600">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              onClick={fetchClassesData}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        ) : classes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {search || levelFilter || departmentFilter
                ? 'Tidak ada kelas ditemukan'
                : 'Belum ada kelas'}
            </h3>
            <p className="text-slate-500 text-sm mb-6">
              {search || levelFilter || departmentFilter
                ? 'Coba ubah filter atau kata kunci pencarian'
                : 'Mulai dengan membuat kelas baru'}
            </p>
            {!search && !levelFilter && !departmentFilter && (
              <button
                onClick={handleCreateClass}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-sm shadow-blue-600/30"
              >
                <Plus className="w-4 h-4" />
                Buat Kelas Pertama
              </button>
            )}
          </div>
        ) : (
          /* Class Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => {
              const badge = getOccupancyBadge(cls.current_enrollment, cls.capacity)

              return (
                <div
                  key={cls.id}
                  onClick={() => handleClassClick(cls.id)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-sm text-slate-500">{cls.code}</p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${badge.bgColor} ${badge.color}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
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
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Siswa</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {cls.current_enrollment}/{cls.capacity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Jam/Minggu</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {cls.total_hours_per_week || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Wali Kelas */}
                    {cls.wali_kelas && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-500 mb-1">Wali Kelas</p>
                        <p className="text-sm font-medium text-slate-900">
                          {cls.wali_kelas.full_name}
                        </p>
                      </div>
                    )}

                    {/* Room */}
                    {cls.home_room && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500">Ruang Base</p>
                        <p className="text-sm font-medium text-slate-900">
                          {cls.home_room.name} ({cls.home_room.code})
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-6 py-3 bg-slate-50 rounded-b-xl flex items-center justify-center">
                    <span className="text-sm text-blue-600 font-medium group-hover:underline">
                      Lihat Jadwal & Roster →
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
