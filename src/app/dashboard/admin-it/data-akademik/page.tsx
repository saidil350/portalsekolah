'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, Plus, ListFilter, Download, Edit2, Trash2, Loader2, Calendar, GraduationCap, Building2, BookOpen, CheckCircle2, Network, Hourglass } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import ConfirmDialog from '@/components/dashboard/confirm-dialog'
import YearModal from '@/components/dashboard/year-modal'
import LevelModal from '@/components/dashboard/level-modal'
import DepartmentModal from '@/components/dashboard/department-modal'
import {
  fetchAcademicYears,
  createAcademicYear,
  updateAcademicYear,
  deleteAcademicYear,
  fetchClassLevels,
  createClassLevel,
  updateClassLevel,
  deleteClassLevel,
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment
} from './actions'
import type { AcademicYear, ClassLevel, Department } from '@/types/academic'
import { getAcademicStatusConfig as getStatusConfig, formatDateRange } from '@/types/academic'
import { EmptyTableState } from '@/components/ui'

type TabType = 'years' | 'subjects' | 'levels' | 'departments'

export default function DataAkademikPage() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState<TabType>('years')

  // Years state
  const [years, setYears] = useState<AcademicYear[]>([])
  const [yearsLoading, setYearsLoading] = useState(false)
  const [yearsPage, setYearsPage] = useState(1)
  const [yearsTotal, setYearsTotal] = useState(0)

  // Levels state
  const [levels, setLevels] = useState<ClassLevel[]>([])
  const [levelsLoading, setLevelsLoading] = useState(false)
  const [levelsPage, setLevelsPage] = useState(1)
  const [levelsTotal, setLevelsTotal] = useState(0)

  // Departments state
  const [departments, setDepartments] = useState<Department[]>([])
  const [departmentsLoading, setDepartmentsLoading] = useState(false)
  const [departmentsPage, setDepartmentsPage] = useState(1)
  const [departmentsTotal, setDepartmentsTotal] = useState(0)

  // Modal states
  const [showYearModal, setShowYearModal] = useState(false)
  const [showLevelModal, setShowLevelModal] = useState(false)
  const [showDepartmentModal, setShowDepartmentModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Load functions
  const loadYears = useCallback(async (page = 1) => {
    setYearsLoading(true)
    try {
      const result = await fetchAcademicYears({ page, limit: 10 })
      if (result.success) {
        setYears(result.data || [])
        setYearsTotal(result.total || 0)
        setYearsPage(page)
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal memuat data tahun akademik', 'error')
    } finally {
      setYearsLoading(false)
    }
  }, [])

  const loadLevels = useCallback(async (page = 1) => {
    setLevelsLoading(true)
    try {
      const result = await fetchClassLevels({ page, limit: 10 })
      if (result.success) {
        setLevels(result.data || [])
        setLevelsTotal(result.total || 0)
        setLevelsPage(page)
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal memuat data tingkat kelas', 'error')
    } finally {
      setLevelsLoading(false)
    }
  }, [])

  const loadDepartments = useCallback(async (page = 1) => {
    setDepartmentsLoading(true)
    try {
      const result = await fetchDepartments({ page, limit: 10 })
      if (result.success) {
        setDepartments(result.data || [])
        setDepartmentsTotal(result.total || 0)
        setDepartmentsPage(page)
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal memuat data jurusan', 'error')
    } finally {
      setDepartmentsLoading(false)
    }
  }, [])

  // Initial load - only load active tab data
  useEffect(() => {
    if (activeTab === 'years') {
      loadYears()
    } else if (activeTab === 'levels') {
      loadLevels()
    } else if (activeTab === 'departments') {
      loadDepartments()
    }
  }, [activeTab, loadYears, loadLevels, loadDepartments])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Year handlers
  const handleCreateYear = async (data: any) => {
    setActionLoading(true)
    try {
      const result = await createAcademicYear(data)
      if (result.success) {
        showToast('Tahun akademik berhasil ditambahkan', 'success')
        await loadYears(yearsPage)
      } else {
        showToast(result.error || 'Gagal menambahkan tahun akademik', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal menambahkan tahun akademik', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateYear = async (data: any) => {
    setActionLoading(true)
    try {
      const result = await updateAcademicYear(selectedItem.id, data)
      if (result.success) {
        showToast('Tahun akademik berhasil diupdate', 'success')
        await loadYears(yearsPage)
      } else {
        showToast(result.error || 'Gagal mengupdate tahun akademik', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal mengupdate tahun akademik', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteYear = async () => {
    setActionLoading(true)
    try {
      const result = await deleteAcademicYear(selectedItem.id)
      if (result.success) {
        showToast('Tahun akademik berhasil dihapus', 'success')
        await loadYears(yearsPage)
        setShowDeleteConfirm(false)
      } else {
        showToast(result.error || 'Gagal menghapus tahun akademik', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal menghapus tahun akademik', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Level handlers
  const handleCreateLevel = async (data: any) => {
    setActionLoading(true)
    try {
      const result = await createClassLevel(data)
      if (result.success) {
        showToast('Tingkat kelas berhasil ditambahkan', 'success')
        await loadLevels(levelsPage)
      } else {
        showToast(result.error || 'Gagal menambahkan tingkat kelas', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal menambahkan tingkat kelas', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateLevel = async (data: any) => {
    setActionLoading(true)
    try {
      const result = await updateClassLevel(selectedItem.id, data)
      if (result.success) {
        showToast('Tingkat kelas berhasil diupdate', 'success')
        await loadLevels(levelsPage)
      } else {
        showToast(result.error || 'Gagal mengupdate tingkat kelas', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal mengupdate tingkat kelas', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteLevel = async () => {
    setActionLoading(true)
    try {
      const result = await deleteClassLevel(selectedItem.id)
      if (result.success) {
        showToast('Tingkat kelas berhasil dihapus', 'success')
        await loadLevels(levelsPage)
        setShowDeleteConfirm(false)
      } else {
        showToast(result.error || 'Gagal menghapus tingkat kelas', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal menghapus tingkat kelas', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Department handlers
  const handleCreateDepartment = async (data: any) => {
    setActionLoading(true)
    try {
      const result = await createDepartment(data)
      if (result.success) {
        showToast('Jurusan berhasil ditambahkan', 'success')
        await loadDepartments(departmentsPage)
      } else {
        showToast(result.error || 'Gagal menambahkan jurusan', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal menambahkan jurusan', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleUpdateDepartment = async (data: any) => {
    setActionLoading(true)
    try {
      const result = await updateDepartment(selectedItem.id, data)
      if (result.success) {
        showToast('Jurusan berhasil diupdate', 'success')
        await loadDepartments(departmentsPage)
      } else {
        showToast(result.error || 'Gagal mengupdate jurusan', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal mengupdate jurusan', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteDepartment = async () => {
    setActionLoading(true)
    try {
      const result = await deleteDepartment(selectedItem.id)
      if (result.success) {
        showToast('Jurusan berhasil dihapus', 'success')
        await loadDepartments(departmentsPage)
        setShowDeleteConfirm(false)
      } else {
        showToast(result.error || 'Gagal menghapus jurusan', 'error')
      }
    } catch (error: any) {
      showToast(error.message || 'Gagal menghapus jurusan', 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // Get delete handler based on active tab
  const getDeleteHandler = () => {
    switch (activeTab) {
      case 'years': return handleDeleteYear
      case 'levels': return handleDeleteLevel
      case 'departments': return handleDeleteDepartment
      default: return () => {}
    }
  }

  // Tab content rendering
  const renderTabContent = () => {
    switch (activeTab) {
      case 'years':
        return (
          <div className="flex flex-col gap-6 w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center w-full">
              <div>
                <h3 className="text-slate-900 text-lg font-bold leading-7">Tahun Akademik</h3>
                <p className="text-slate-500 text-xs">Kelola data tahun akademik</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setModalMode('create')
                  setShowYearModal(true)
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
                Tambah Tahun
              </button>
            </div>

            {/* Table */}
            {yearsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : years.length === 0 ? (
              <EmptyTableState
                type="generic"
                title="Belum ada data tahun akademik"
                description="Mulai dengan menambahkan tahun akademik pertama Anda."
                onAdd={() => {
                  setSelectedItem(null)
                  setModalMode('create')
                  setShowYearModal(true)
                }}
                addLabel="Tambah Tahun"
              />
            ) : (
              <div className="w-full border border-slate-100 rounded-lg overflow-hidden">
                <div className="w-full min-w-[600px]">
                  {/* Header */}
                  <div className="bg-slate-50 grid grid-cols-[2fr_2fr_1fr_1fr] border-b border-slate-200">
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Nama</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Periode</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Status</span>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-end">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Aksi</span>
                    </div>
                  </div>

                  {/* Rows */}
                  {years.map((year) => {
                    const statusConfig = getStatusConfig(year.is_active)
                    return (
                      <div key={year.id} className="grid grid-cols-[2fr_2fr_1fr_1fr] border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <div className="px-6 py-[22px] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-blue-500" />
                          </div>
                          <span className="text-slate-900 text-base font-semibold">{year.name}</span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center">
                          <span className="text-slate-500 text-sm">{formatDateRange(year.start_date, year.end_date)}</span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center">
                          <span className={`px-2 py-0.5 ${statusConfig.bgColor} ${statusConfig.color} text-[11px] font-medium rounded-full flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedItem(year)
                              setModalMode('edit')
                              setShowYearModal(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(year)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                            disabled={year.is_active}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pagination */}
            {yearsTotal > 10 && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <button
                  onClick={() => loadYears(yearsPage - 1)}
                  disabled={yearsPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-900 text-xs font-medium hover:bg-slate-50 transition-colors bg-white disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: Math.ceil(yearsTotal / 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadYears(page)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      page === yearsPage
                        ? 'bg-primary text-white'
                        : 'border border-slate-200 text-slate-900 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => loadYears(yearsPage + 1)}
                  disabled={yearsPage >= Math.ceil(yearsTotal / 10)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-900 text-xs font-medium hover:bg-slate-50 transition-colors bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )

      case 'levels':
        return (
          <div className="flex flex-col gap-6 w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center w-full">
              <div>
                <h3 className="text-slate-900 text-lg font-bold leading-7">Tingkat Kelas</h3>
                <p className="text-slate-500 text-xs">Kelola data tingkat kelas</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setModalMode('create')
                  setShowLevelModal(true)
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
                Tambah Tingkat
              </button>
            </div>

            {/* Table */}
            {levelsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : levels.length === 0 ? (
              <EmptyTableState
                type="generic"
                title="Belum ada data tingkat kelas"
                description="Tambahkan tingkat kelas (seperti X, XI, XII) untuk mengelola data siswa."
                onAdd={() => {
                  setSelectedItem(null)
                  setModalMode('create')
                  setShowLevelModal(true)
                }}
                addLabel="Tambah Tingkat"
              />
            ) : (
              <div className="w-full border border-slate-100 rounded-lg overflow-hidden">
                <div className="w-full min-w-[600px]">
                  {/* Header */}
                  <div className="bg-slate-50 grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-slate-200">
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Nama</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Kode</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Status</span>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-end">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Aksi</span>
                    </div>
                  </div>

                  {/* Rows */}
                  {levels.map((level) => {
                    const statusConfig = getStatusConfig(level.is_active)
                    return (
                      <div key={level.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <div className="px-6 py-[22px] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center shrink-0">
                            <GraduationCap className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <span className="text-slate-900 text-base font-semibold">{level.name}</span>
                            <p className="text-slate-500 text-xs">{level.description}</p>
                          </div>
                        </div>
                        <div className="px-6 py-[22px] flex items-center">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">{level.code}</span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center">
                          <span className={`px-2 py-0.5 ${statusConfig.bgColor} ${statusConfig.color} text-[11px] font-medium rounded-full flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedItem(level)
                              setModalMode('edit')
                              setShowLevelModal(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(level)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pagination */}
            {levelsTotal > 10 && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <button
                  onClick={() => loadLevels(levelsPage - 1)}
                  disabled={levelsPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-900 text-xs font-medium hover:bg-slate-50 transition-colors bg-white disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: Math.ceil(levelsTotal / 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadLevels(page)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      page === levelsPage
                        ? 'bg-primary text-white'
                        : 'border border-slate-200 text-slate-900 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => loadLevels(levelsPage + 1)}
                  disabled={levelsPage >= Math.ceil(levelsTotal / 10)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-900 text-xs font-medium hover:bg-slate-50 transition-colors bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )

      case 'departments':
        return (
          <div className="flex flex-col gap-6 w-full">
            {/* Section Header */}
            <div className="flex justify-between items-center w-full">
              <div>
                <h3 className="text-slate-900 text-lg font-bold leading-7">Jurusan/Departemen</h3>
                <p className="text-slate-500 text-xs">Kelola data jurusan</p>
              </div>
              <button
                onClick={() => {
                  setSelectedItem(null)
                  setModalMode('create')
                  setShowDepartmentModal(true)
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                <Plus className="w-[14px] h-[14px] stroke-[2.5]" />
                Tambah Jurusan
              </button>
            </div>

            {/* Table */}
            {departmentsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : departments.length === 0 ? (
              <EmptyTableState
                type="generic"
                title="Belum ada data jurusan"
                description="Tambahkan jurusan atau departemen untuk mengelompokkan kelas."
                onAdd={() => {
                  setSelectedItem(null)
                  setModalMode('create')
                  setShowDepartmentModal(true)
                }}
                addLabel="Tambah Jurusan"
              />
            ) : (
              <div className="w-full border border-slate-100 rounded-lg overflow-hidden">
                <div className="w-full min-w-[600px]">
                  {/* Header */}
                  <div className="bg-slate-50 grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-slate-200">
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Nama</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Kode</span>
                    </div>
                    <div className="px-6 py-4 flex items-center">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Status</span>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-end">
                      <span className="text-slate-500 text-xs font-bold uppercase tracking-[0.6px]">Aksi</span>
                    </div>
                  </div>

                  {/* Rows */}
                  {departments.map((dept) => {
                    const statusConfig = getStatusConfig(dept.is_active)
                    return (
                      <div key={dept.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] border-b border-slate-100 hover:bg-slate-50 transition-colors group">
                        <div className="px-6 py-[22px] flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                            <Building2 className="w-4 h-4 text-emerald-500" />
                          </div>
                          <div>
                            <span className="text-slate-900 text-base font-semibold">{dept.name}</span>
                            <p className="text-slate-500 text-xs">{dept.description}</p>
                          </div>
                        </div>
                        <div className="px-6 py-[22px] flex items-center">
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded">{dept.code}</span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center">
                          <span className={`px-2 py-0.5 ${statusConfig.bgColor} ${statusConfig.color} text-[11px] font-medium rounded-full flex items-center gap-1.5`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="px-6 py-[22px] flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedItem(dept)
                              setModalMode('edit')
                              setShowDepartmentModal(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedItem(dept)
                              setShowDeleteConfirm(true)
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Pagination */}
            {departmentsTotal > 10 && (
              <div className="flex items-center justify-center gap-1 mt-2">
                <button
                  onClick={() => loadDepartments(departmentsPage - 1)}
                  disabled={departmentsPage === 1}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-900 text-xs font-medium hover:bg-slate-50 transition-colors bg-white disabled:opacity-50"
                >
                  Prev
                </button>
                {Array.from({ length: Math.ceil(departmentsTotal / 10) }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => loadDepartments(page)}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                      page === departmentsPage
                        ? 'bg-primary text-white'
                        : 'border border-slate-200 text-slate-900 hover:bg-slate-50 bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => loadDepartments(departmentsPage + 1)}
                  disabled={departmentsPage >= Math.ceil(departmentsTotal / 10)}
                  className="px-3 py-1.5 border border-slate-200 rounded text-slate-900 text-xs font-medium hover:bg-slate-50 transition-colors bg-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )

      case 'subjects':
        return (
          <div className="text-center py-12 text-slate-500">
            Fitur Mata Pelajaran akan segera hadir
          </div>
        )

      default:
        return null
    }
  }

  return (
    <main className="flex-1 flex flex-col h-full bg-background-light relative min-w-0">
      {/* Toast Message */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        } text-white text-sm font-medium animate-in slide-in-from-right duration-300`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="h-[64px] bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
        <div className="flex items-center">
          <h2 className="text-slate-900 text-[20px] font-bold">{t('admin.academic.title')}</h2>
        </div>
        <div className="flex items-center gap-4">
          {/* Search Input */}
          <div className="relative w-[256px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-[15px] w-[15px] text-slate-400" />
            </div>
            <input
              type="text"
              placeholder={t('admin.academic.search.placeholder')}
              className="w-full bg-slate-50 border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-primary focus:border-primary block pl-10 px-4 py-2 outline-none transition-colors"
              title="Search field"
            />
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-[1280px] flex flex-col gap-6 mx-auto w-full">

          {/* Main Card Area */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col w-full">

            {/* Tab Navigation */}
            <div className="border-b border-slate-100 px-6 flex items-center h-[56px] overflow-x-auto hide-scrollbar">
              <button
                onClick={() => setActiveTab('years')}
                className={`px-4 h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'years'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('admin.academic.tab.years')}
              </button>
              <button
                onClick={() => setActiveTab('subjects')}
                className={`px-4 h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'subjects'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('admin.academic.tab.subjects')}
              </button>
              <button
                onClick={() => setActiveTab('levels')}
                className={`px-4 h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'levels'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('admin.academic.tab.levels')}
              </button>
              <button
                onClick={() => setActiveTab('departments')}
                className={`px-4 h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'departments'
                    ? 'text-primary border-b-2 border-primary font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t('admin.academic.tab.departments')}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 flex flex-col w-full">
              {renderTabContent()}
            </div>

          </div>

          {/* Bottom Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full pb-8">
            {/* Card 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-medium">Total Tahun Akademik</span>
                <span className="text-slate-900 text-lg font-bold leading-tight mt-0.5">{yearsTotal}</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-500 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-medium">Total Tingkat Kelas</span>
                <span className="text-slate-900 text-lg font-bold leading-tight mt-0.5">{levelsTotal}</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-medium">Total Jurusan</span>
                <span className="text-slate-900 text-lg font-bold leading-tight mt-0.5">{departmentsTotal}</span>
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-slate-500 text-xs font-medium">Total Mata Pelajaran</span>
                <span className="text-slate-900 text-lg font-bold leading-tight mt-0.5">0</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Modals */}
      <YearModal
        isOpen={showYearModal}
        onClose={() => setShowYearModal(false)}
        onSubmit={modalMode === 'create' ? handleCreateYear : handleUpdateYear}
        year={selectedItem}
        mode={modalMode}
      />

      <LevelModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        onSubmit={modalMode === 'create' ? handleCreateLevel : handleUpdateLevel}
        level={selectedItem}
        mode={modalMode}
      />

      <DepartmentModal
        isOpen={showDepartmentModal}
        onClose={() => setShowDepartmentModal(false)}
        onSubmit={modalMode === 'create' ? handleCreateDepartment : handleUpdateDepartment}
        department={selectedItem}
        mode={modalMode}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={getDeleteHandler()}
        title="Hapus Data"
        message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan."
        type="danger"
        loading={actionLoading}
      />
    </main>
  )
}
