'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import type { Room, RoomFormData } from '@/types/data-management'
import { ROOM_TYPE_CONFIGS } from '@/types/data-management'
import { useLanguage } from '@/contexts/LanguageContext'

interface RoomModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RoomFormData) => Promise<void>
  room?: Room | null
  mode: 'create' | 'edit'
}

export default function RoomModal({
  isOpen,
  onClose,
  onSubmit,
  room,
  mode
}: RoomModalProps) {
  const [formData, setFormData] = useState<RoomFormData>({
    name: '',
    code: '',
    room_type: 'CLASSROOM',
    capacity: 30,
    floor: 1,
    building: '',
    facilities: [],
    description: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { t } = useLanguage()

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && room) {
        setFormData({
          name: room.name,
          code: room.code,
          room_type: room.room_type,
          capacity: room.capacity || 30,
          floor: room.floor || 1,
          building: room.building || '',
          facilities: room.facilities || [],
          description: room.description || '',
          is_active: room.is_active
        })
      } else {
        setFormData({
          name: '',
          code: '',
          room_type: 'CLASSROOM',
          capacity: 30,
          floor: 1,
          building: '',
          facilities: [],
          description: '',
          is_active: true
        })
      }
      setError('')
    }
  }, [isOpen, mode, room])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError(t('admin.dataManagement.modal.room.nameRequired'))
      return
    }

    if (!formData.code.trim()) {
      setError(t('admin.dataManagement.modal.room.codeRequired'))
      return
    }

    if (formData.capacity < 1) {
      setError(t('admin.dataManagement.modal.room.capacityMin'))
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : t('admin.dataManagement.modal.saveFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
             type === 'number' ? parseInt(value) || 0 :
             value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">
            {mode === 'create' ? t('admin.dataManagement.modal.room.create') : t('admin.dataManagement.modal.room.edit')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('admin.dataManagement.modal.room.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('admin.dataManagement.modal.room.namePlaceholder')}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('common.label.code')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder={t('admin.dataManagement.modal.room.codePlaceholder')}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm uppercase"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('admin.dataManagement.modal.room.type')} <span className="text-red-500">*</span>
            </label>
            <select
              name="room_type"
              value={formData.room_type}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm bg-card"
              required
              disabled={loading}
            >
              {ROOM_TYPE_CONFIGS.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.value === 'CLASSROOM' ? t('admin.dataManagement.roomType.classroom') : type.value === 'LAB' ? t('admin.dataManagement.roomType.lab') : type.value === 'OFFICE' ? t('admin.dataManagement.roomType.office') : type.value === 'AUDITORIUM' ? t('admin.dataManagement.roomType.auditorium') : t('admin.dataManagement.roomType.other')}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('common.label.capacity')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('admin.dataManagement.table.floor')}
              </label>
              <input
                type="number"
                name="floor"
                value={formData.floor}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('admin.dataManagement.table.building')}
            </label>
            <input
              type="text"
              name="building"
              value={formData.building}
              onChange={handleChange}
              placeholder={t('admin.dataManagement.modal.room.buildingPlaceholder')}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('admin.dataManagement.modal.room.description')}
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder={t('admin.dataManagement.modal.room.descriptionPlaceholder')}
              rows={3}
              className="w-full px-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              disabled={loading}
            />
            <label htmlFor="is_active" className="text-sm font-medium text-foreground">
              {t('admin.dataManagement.modal.room.active')}
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-border text-foreground rounded-lg hover:bg-accent transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {t('common.action.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('admin.dataManagement.modal.saving')}
                </>
              ) : (
                mode === 'create' ? t('common.action.add') : t('common.action.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
