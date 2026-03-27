'use client'

import React, { useState, useEffect } from 'react'
import { Users, GraduationCap, BookOpen, Calendar, TrendingUp, Loader2, AlertCircle, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Class } from '@/types/class-roster'

interface SchoolStats {
  total_classes: number
  total_students: number
  total_teachers: number
  average_occupancy: number
}

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

export default function HeadmasterClassOverviewPage() {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [classes, setClasses] = useState<Class[]>([])
  const [stats, setStats] = useState<SchoolStats>({
    total_classes: 0,
    total_students: 0,
    total_teachers: 0,
    average_occupancy: 0
  })
  const [error, setError] = useState('')

  // Filters
  const [levelFilter, setLevelFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const [search, setSearch] = useState('')

  // Dropdown data
  const [classLevels, setClassLevels] = useState<ClassLevel[]>([])
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    fetchClassesData()
    fetchDropdownData()
  }, [levelFilter, departmentFilter, search])

  const fetchClassesData = async () => {
    setLoading(true)
    setError('')

    try {
      const { fetchClasses } = await import('@/app/dashboard/admin-it/kelas-dan-roster/actions')

      const filters = {
        search,
        class_level_id: levelFilter,
        department_id: departmentFilter
      }

      const result = await fetchClasses(filters)

      if (result.success && result.data) {
        setClasses(result.data)

        // Calculate statistics
        const totalStudents = result.data.reduce((sum, cls) => sum + cls.current_enrollment, 0)
        const avgOccupancy = result.data.length > 0
          ? Math.round(result.data.reduce((sum, cls) => sum + (cls.occupancy_rate || 0), 0) / result.data.length)
          : 0

        // Get total teachers count
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'GURU')
          .eq('is_active', true)

        setStats({
          total_classes: result.data.length,
          total_students: totalStudents,
          total_teachers: count || 0,
          average_occupancy: avgOccupancy
        })
      } else {
        setError(result.error || 'Gagal memuat data')
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const fetchDropdownData = async () => {
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()

      // Fetch class levels
      const { data: levelsData } = await supabase
        .from('class_levels')
        .select('id, name, code')
        .eq('is_active', true)
        .order('level_order')

      if (levelsData) setClassLevels(levelsData as ClassLevel[])

      // Fetch departments
      const { data: deptData } = await supabase
        .from('departments')
        .select('id, name, code')
        .eq('is_active', true)
        .order('name')

      if (deptData) setDepartments(deptData as Department[])
    } catch (err) {
      console.error('Error fetching dropdown data:', err)
    }
  }

  const handleClassClick = (classId: string) => {
    router.push(`/dashboard/admin-it/kelas-dan-roster/${classId}`)
  }

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-red-600'
    if (rate >= 70) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getOccupancyBg = (rate: number) => {
    if (rate >= 90) return 'bg-red-50'
    if (rate >= 70) return 'bg-yellow-50'
    return 'bg-green-50'
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-[#FAFAFA]">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Overview Kelas Sekolah</h1>
            <p className="text-slate-500 text-sm">
              Monitoring seluruh kelas, siswa, dan jadwal pelajaran
            </p>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="bg-white border-b border-slate-200 px-8 py-6 shrink-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Kelas */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 bg-blue-200 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-blue-900">{stats.total_classes}</p>
            <p className="text-sm text-blue-700 mt-1">Kelas Aktif</p>
          </div>

          {/* Total Siswa */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <div className="flex items-center justify-between mb-3">
              <Users className="w-8 h-8 text-green-600" />
              <span className="text-xs font-medium text-green-600 bg-green-200 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-green-900">{stats.total_students}</p>
            <p className="text-sm text-green-700 mt-1">Siswa Terdaftar</p>
          </div>

          {/* Total Guru */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <BookOpen className="w-8 h-8 text-purple-600" />
              <span className="text-xs font-medium text-purple-600 bg-purple-200 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-purple-900">{stats.total_teachers}</p>
            <p className="text-sm text-purple-700 mt-1">Guru Pengajar</p>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
            <div className="flex items-center justify-between mb-3">
              <TrendingUp className="w-8 h-8 text-amber-600" />
              <span className="text-xs font-medium text-amber-600 bg-amber-200 px-2 py-1 rounded-full">Rata-rata</span>
            </div>
            <p className="text-3xl font-bold text-amber-900">{stats.average_occupancy}%</p>
            <p className="text-sm text-amber-700 mt-1">Tingkat Isi Kelas</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 shrink-0">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Cari kelas berdasarkan nama atau kode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Level Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white appearance-none"
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
              className="pl-9 pr-8 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm bg-white appearance-none"
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
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <span className="ml-3 text-slate-600">Memuat data...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-red-600" />
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
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              Tidak ada kelas ditemukan
            </h3>
            <p className="text-slate-500 text-sm">
              Coba ubah filter atau kata kunci pencarian
            </p>
          </div>
        ) : (
          /* Class Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {classes.map((cls) => {
              const occupancyRate = cls.occupancy_rate || 0

              return (
                <div
                  key={cls.id}
                  onClick={() => handleClassClick(cls.id)}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group"
                >
                  {/* Header */}
                  <div className="p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
                          {cls.name}
                        </h3>
                        <p className="text-xs text-slate-500">{cls.code}</p>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${getOccupancyBg(occupancyRate)} ${getOccupancyColor(occupancyRate)}`}>
                        {occupancyRate}%
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600">
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
                        <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Siswa</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {cls.current_enrollment}/{cls.capacity}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center">
                          <Calendar className="w-3.5 h-3.5 text-purple-600" />
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
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">Wali Kelas</p>
                        <p className="text-xs font-medium text-slate-900 truncate">
                          {cls.wali_kelas.full_name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 bg-slate-50 rounded-b-xl flex items-center justify-center">
                    <span className="text-xs text-emerald-600 font-medium group-hover:underline">
                      Lihat Detail →
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
