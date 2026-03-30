'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, UserPlus, UserMinus, Search, Users } from 'lucide-react'
import type { SubjectTeacher, TeacherRank } from '@/types/data-management'
import { getTeacherRankConfig } from '@/types/data-management'

interface Teacher {
  id: string
  full_name: string
  email?: string
  nip?: string
}

interface SubjectTeachersModalProps {
  isOpen: boolean
  onClose: () => void
  subjectId: string
  subjectName: string
  onAssign: (teacherId: string, teacherRankId: string | null) => Promise<void>
  onRemove: (teacherId: string) => Promise<void>
  onUpdateRank: (teacherId: string, teacherRankId: string) => Promise<void>
}

export default function SubjectTeachersModal({
  isOpen,
  onClose,
  subjectId,
  subjectName,
  onAssign,
  onRemove,
  onUpdateRank
}: SubjectTeachersModalProps) {
  const [assignedTeachers, setAssignedTeachers] = useState<SubjectTeacher[]>([])
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([])
  const [teacherRanks, setTeacherRanks] = useState<TeacherRank[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(false)
  const [error, setError] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [selectedTeacherRankId, setSelectedTeacherRankId] = useState('')

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData()
      setSearchQuery('')
      setSelectedTeacherId('')
      setSelectedTeacherRankId('')
      setError('')
    }
  }, [isOpen, subjectId])

  const fetchData = async () => {
    setLoadingData(true)
    try {
      // Import actions
      const { fetchSubjectTeachers, fetchTeachersForDropdown, fetchTeacherRanks } = await import('@/app/dashboard/admin-it/data-management/actions')

      // Fetch assigned teachers
      const teachersResult = await fetchSubjectTeachers(subjectId)

      if (teachersResult.success && teachersResult.data) {
        setAssignedTeachers(teachersResult.data)
      } else {
        setError(teachersResult.error || 'Gagal memuat data guru pengajar')
      }

      // Fetch available teachers (all active teachers)
      const dropdownResult = await fetchTeachersForDropdown()

      if (dropdownResult.success && dropdownResult.teachers) {
        setAvailableTeachers(dropdownResult.teachers)
      } else {
        setError(dropdownResult.error || 'Gagal memuat data guru')
      }

      // Fetch teacher ranks
      const ranksResult = await fetchTeacherRanks()

      if (ranksResult.success && ranksResult.teacherRanks) {
        setTeacherRanks(ranksResult.teacherRanks)
      } else {
        setError(ranksResult.error || 'Gagal memuat data tingkat guru')
      }
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Gagal memuat data')
    } finally {
      setLoadingData(false)
    }
  }

  const handleAssignTeacher = async () => {
    if (!selectedTeacherId) {
      setError('Pilih guru terlebih dahulu')
      return
    }

    setLoading(true)
    setError('')
    try {
      await onAssign(selectedTeacherId, selectedTeacherRankId || null)
      await fetchData() // Refresh data
      setSelectedTeacherId('')
      setSelectedTeacherRankId('')
    } catch (err: any) {
      setError(err.message || 'Gagal menugaskan guru')
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveTeacher = async (teacherId: string) => {
    setLoading(true)
    setError('')
    try {
      await onRemove(teacherId)
      await fetchData() // Refresh data
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus guru')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRank = async (teacherId: string, teacherRankId: string) => {
    setLoading(true)
    setError('')
    try {
      await onUpdateRank(teacherId, teacherRankId)
      await fetchData() // Refresh data
    } catch (err: any) {
      setError(err.message || 'Gagal mengupdate tingkat guru')
    } finally {
      setLoading(false)
    }
  }

  // Filter available teachers based on search and exclude already assigned
  const assignedTeacherIds = assignedTeachers.map(st => st.teacher_id)
  const filteredAvailableTeachers = availableTeachers
    .filter(t => !assignedTeacherIds.includes(t.id))
    .filter(t =>
      t.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.nip?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Distribusi Guru Pengajar</h3>
            <p className="text-sm text-slate-500 mt-1">{subjectName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {loadingData ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-slate-600">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Add Teacher Section */}
              <div className="bg-slate-50 rounded-lg p-4">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Tambah Guru Pengajar
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-1 relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Cari guru..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                      disabled={loading}
                    />
                  </div>
                  <div className="md:col-span-1">
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                      disabled={loading}
                    >
                      <option value="">Pilih Guru</option>
                      {filteredAvailableTeachers.map(teacher => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.full_name} {teacher.nip ? `(${teacher.nip})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-1">
                    <select
                      value={selectedTeacherRankId}
                      onChange={(e) => setSelectedTeacherRankId(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                      disabled={loading}
                    >
                      <option value="">Tanpa Tingkat</option>
                      {teacherRanks.map(rank => (
                        <option key={rank.id} value={rank.id}>
                          {rank.icon ? `${rank.icon} ` : ''}{rank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleAssignTeacher}
                    disabled={!selectedTeacherId || loading}
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Tambah Guru
                  </button>
                </div>
              </div>

              {/* Assigned Teachers List */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Guru Pengajar ({assignedTeachers.length})
                </h4>

                {assignedTeachers.length === 0 ? (
                  <div className="text-center py-8 bg-slate-50 rounded-lg">
                    <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">Belum ada guru yang ditugaskan</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assignedTeachers.map((subjectTeacher) => {
                      const rankConfig = getTeacherRankConfig(subjectTeacher.teacher_rank?.code)

                      return (
                        <div
                          key={subjectTeacher.id}
                          className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {/* Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                              {subjectTeacher.teacher?.full_name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </div>

                            {/* Teacher Info */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-sm font-semibold text-slate-900">
                                  {subjectTeacher.teacher?.full_name}
                                </p>
                                {rankConfig && (
                                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${rankConfig.bgColor} ${rankConfig.color}`}>
                                    {rankConfig.icon && <span>{rankConfig.icon}</span>}
                                    {rankConfig.label}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                {subjectTeacher.teacher?.nip && (
                                  <span>NIP: {subjectTeacher.teacher.nip}</span>
                                )}
                                {subjectTeacher.teacher?.email && (
                                  <>
                                    <span>•</span>
                                    <span>{subjectTeacher.teacher.email}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            {/* Rank Dropdown */}
                            <select
                              value={subjectTeacher.teacher_rank_id || ''}
                              onChange={(e) => e.target.value && handleUpdateRank(subjectTeacher.teacher_id, e.target.value)}
                              className="px-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary bg-white"
                              disabled={loading}
                              title="Ubah tingkat guru"
                            >
                              <option value="">Tanpa Tingkat</option>
                              {teacherRanks.map(rank => (
                                <option key={rank.id} value={rank.id}>
                                  {rank.icon ? `${rank.icon} ` : ''}{rank.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleRemoveTeacher(subjectTeacher.teacher_id)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Hapus Guru"
                            >
                              <UserMinus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
