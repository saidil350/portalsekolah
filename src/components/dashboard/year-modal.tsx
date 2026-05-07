'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { AcademicYear, AcademicYearFormData } from '@/types/academic'
import {
  Alert,
  AlertDescription,
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from '@/components/ui'

interface YearModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: AcademicYearFormData) => Promise<void>
  year?: AcademicYear | null
  mode: 'create' | 'edit'
}

export default function YearModal({
  isOpen,
  onClose,
  onSubmit,
  year,
  mode
}: YearModalProps) {
  const [formData, setFormData] = useState<AcademicYearFormData>({
    name: '',
    start_date: '',
    end_date: '',
    is_active: false,
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && year) {
        setFormData({
          name: year.name,
          start_date: year.start_date.split('T')[0],
          end_date: year.end_date.split('T')[0],
          is_active: year.is_active,
          description: year.description || ''
        })
      } else {
        setFormData({
          name: '',
          start_date: '',
          end_date: '',
          is_active: false,
          description: ''
        })
      }
      setError('')
    }
  }, [isOpen, mode, year])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim()) {
      setError('Nama tahun akademik wajib diisi')
      return
    }

    if (!formData.start_date) {
      setError('Tanggal mulai wajib diisi')
      return
    }

    if (!formData.end_date) {
      setError('Tanggal selesai wajib diisi')
      return
    }

    if (new Date(formData.end_date) <= new Date(formData.start_date)) {
      setError('Tanggal selesai harus setelah tanggal mulai')
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan data')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !loading && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-md">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>
            {mode === 'create' ? 'Tambah Tahun Akademik' : 'Edit Tahun Akademik'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <FieldGroup className="px-6 py-4">
          {error && (
            <Alert variant="error">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Field>
            <FieldLabel required>Nama Tahun Akademik</FieldLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: 2024/2025"
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel required>Tanggal Mulai</FieldLabel>
            <Input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel required>Tanggal Selesai</FieldLabel>
            <Input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel>Deskripsi</FieldLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi tahun akademik"
              rows={3}
              disabled={loading}
            />
          </Field>

          <Field className="flex-row items-center gap-3">
            <Checkbox
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked === true }))
              }
              disabled={loading}
            />
            <FieldLabel htmlFor="is_active" className="font-normal">
              Tandai sebagai tahun akademik aktif
            </FieldLabel>
          </Field>
          </FieldGroup>

          <DialogFooter className="border-t bg-muted/40 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                mode === 'create' ? 'Tambah' : 'Simpan'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
