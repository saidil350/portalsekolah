'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, UserPlus, MapPin, Save } from 'lucide-react'

interface EditClassInfoModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: { wali_kelas_id?: string | null; home_room_id?: string | null }) => Promise<void>
  classData: {
    wali_kelas?: { id: string; full_name: string } | null
    home_room?: { id: string; name: string } | null
  }
}

export default function EditClassInfoModal({
  isOpen,
  onClose,
  onSave,
  classData
}: EditClassInfoModalProps) {
  const [waliKelasId, setWaliKelasId] = useState<string>('')
  const [homeRoomId, setHomeRoomId] = useState<string>('')
  const [teachers, setTeachers] = useState<Array<{ id: string; full_name: string }>>([])
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Fetch teachers and rooms when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData()
      // Set initial values
      setWaliKelasId(classData.wali_kelas?.id || '')
      setHomeRoomId(classData.home_room?.id || '')
    }
  }, [isOpen, classData])

  const fetchData = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch teachers (GURU role)
      const [teachersRes, roomsRes] = await Promise.all([
        fetch('/api/users/teachers'),
        fetch('/api/rooms')
      ])

      const teachersData = await teachersRes.json()
      const roomsData = await roomsRes.json()

      if (teachersData.success) {
        setTeachers(teachersData.data || [])
      } else {
        throw new Error(teachersData.error || 'Gagal memuat data guru')
      }

      if (roomsData.success) {
        setRooms(roomsData.data || [])
      } else {
        throw new Error(roomsData.error || 'Gagal memuat data ruangan')
      }
    } catch (err: any) {
      console.error('Error fetching data:', err)
      setError(err.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      // Get current values
      const currentWaliKelasId = classData.wali_kelas?.id || null
      const currentHomeRoomId = classData.home_room?.id || null

      // Check if anything changed
      const waliKelasChanged = waliKelasId !== currentWaliKelasId
      const homeRoomChanged = homeRoomId !== currentHomeRoomId

      if (!waliKelasChanged && !homeRoomChanged) {
        setError('Tidak ada perubahan untuk disimpan')
        setSaving(false)
        return
      }

      // Only send changed fields
      const updateData: { wali_kelas_id?: string | null; home_room_id?: string | null } = {}

      if (waliKelasChanged) {
        // Send empty string to clear, or the actual ID
        updateData.wali_kelas_id = waliKelasId || null
      }

      if (homeRoomChanged) {
        // Send empty string to clear, or the actual ID
        updateData.home_room_id = homeRoomId || null
      }

      console.log('Saving class info:', updateData)

      await onSave(updateData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan perubahan')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Save className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Edit Info Kelas</h2>
              <p className="text-sm text-slate-500">Ubah wali kelas dan ruang base</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={saving}
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-3 text-slate-600">Memuat data...</span>
            </div>
          ) : (
            <>
              {/* Wali Kelas */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Wali Kelas
                  </div>
                </label>
                <select
                  value={waliKelasId}
                  onChange={(e) => setWaliKelasId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="">-- Pilih Wali Kelas --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Guru yang bertanggung jawab atas kelas ini
                </p>
              </div>

              {/* Ruang Base */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Ruang Base
                  </div>
                </label>
                <select
                  value={homeRoomId}
                  onChange={(e) => setHomeRoomId(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving}
                >
                  <option value="">-- Pilih Ruang Base --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500">
                  Ruangan utama untuk kegiatan kelas
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
