'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Search, Users, Loader2, Check, UserPlus } from 'lucide-react'
import type { User } from '@/types/class-roster'

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onEnroll: (studentId: string) => Promise<void>
  classId: string
  academicYearId: string
}

export default function AddStudentModal({
  isOpen,
  onClose,
  onEnroll,
  classId,
  academicYearId
}: AddStudentModalProps) {
  const [search, setSearch] = useState('')
  const [availableStudents, setAvailableStudents] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [enrolling, setEnrolling] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  // Fetch available students (not enrolled in this class)
  const fetchAvailableStudents = useCallback(async () => {
    if (!isOpen) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/students/available?classId=${classId}&search=${encodeURIComponent(search)}`)
      const json = await res.json().catch(() => null)

      if (!json || typeof json.success === 'undefined') {
        if (!res.ok) {
          throw new Error(`HTTP error: ${res.status}`)
        }
        throw new Error('Format response tidak valid')
      }

      if (json.success) {
        setAvailableStudents(json.data || [])
      } else {
        throw new Error(json.error || `HTTP error: ${res.status}`)
      }
    } catch (err: any) {
      console.error('Error fetching students:', err)
      setError(err.message || 'Gagal memuat data siswa')
    } finally {
      setLoading(false)
    }
  }, [isOpen, classId, search])

  useEffect(() => {
    fetchAvailableStudents()
  }, [fetchAvailableStudents])

  const handleStudentClick = async (studentId: string) => {
    setEnrolling(studentId)
    setError('')

    try {
      await onEnroll(studentId)

      // Remove from available list after successful enrollment
      setAvailableStudents(prev => prev.filter(s => s.id !== studentId))
      setSelectedStudents(prev => {
        const newSet = new Set(prev)
        newSet.delete(studentId)
        return newSet
      })

      // Auto-close modal after successful enrollment
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan siswa')
    } finally {
      setEnrolling(null)
    }
  }

  const toggleSelection = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(studentId)) {
        newSet.delete(studentId)
      } else {
        newSet.add(studentId)
      }
      return newSet
    })
  }

  const handleEnrollSelected = async () => {
    if (selectedStudents.size === 0) return

    setEnrolling('batch')
    setError('')

    try {
      // Enroll all selected students
      for (const studentId of selectedStudents) {
        await onEnroll(studentId)
      }

      // Refresh available students
      await fetchAvailableStudents()

      // Clear selection
      setSelectedStudents(new Set())

      // Auto-close modal after successful batch enrollment
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menambahkan siswa')
    } finally {
      setEnrolling(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tambah Siswa ke Kelas</h2>
              <p className="text-sm text-slate-500">
                {selectedStudents.size > 0
                  ? `${selectedStudents.size} siswa dipilih`
                  : 'Pilih siswa untuk ditambahkan'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={enrolling !== null}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan nama, NISN, atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={loading || enrolling !== null}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Memuat data siswa...</span>
            </div>
          ) : availableStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">
                {search
                  ? 'Tidak ditemukan siswa dengan pencarian tersebut'
                  : 'Tidak ada siswa tersedia'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Batch Enroll Button */}
              {selectedStudents.size > 0 && (
                <div className="sticky top-0 z-10 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedStudents.size} siswa dipilih
                    </span>
                    <button
                      onClick={handleEnrollSelected}
                      disabled={enrolling !== null}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {enrolling === 'batch' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Tambahkan Semua
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Student Items */}
              {availableStudents.map((student) => {
                const isSelected = selectedStudents.has(student.id)
                const isEnrolling = enrolling === student.id

                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <button
                        onClick={() => toggleSelection(student.id)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600'
                            : 'border-slate-300 hover:border-blue-600'
                        }`}
                        disabled={isEnrolling || enrolling !== null}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white" />
                        )}
                      </button>

                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {student.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {student.full_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {student.nisn || 'NISN tidak tersedia'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStudentClick(student.id)}
                      disabled={isEnrolling || enrolling !== null}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Memproses...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          Tambah
                        </>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {availableStudents.length} siswa tersedia
          </p>
          <button
            onClick={onClose}
            disabled={enrolling !== null}
            className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
