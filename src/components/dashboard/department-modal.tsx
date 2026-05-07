'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import type { Department, DepartmentFormData } from '@/types/academic'
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
  FieldDescription,
  FieldGroup,
  FieldLabel,
  Input,
  Textarea,
} from '@/components/ui'

interface DepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: DepartmentFormData) => Promise<void>
  department?: Department | null
  mode: 'create' | 'edit'
}

export default function DepartmentModal({
  isOpen,
  onClose,
  onSubmit,
  department,
  mode
}: DepartmentModalProps) {
  const [formData, setFormData] = useState<DepartmentFormData>({
    name: '',
    code: '',
    description: '',
    head_id: '',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && department) {
        setFormData({
          name: department.name,
          code: department.code,
          description: department.description || '',
          head_id: department.head_id || '',
          is_active: department.is_active
        })
      } else {
        setFormData({
          name: '',
          code: '',
          description: '',
          head_id: '',
          is_active: true
        })
      }
      setError('')
    }
  }, [isOpen, mode, department])

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (!formData.name.trim()) {
      setError('Nama jurusan wajib diisi')
      return
    }

    if (!formData.code.trim()) {
      setError('Kode jurusan wajib diisi')
      return
    }

    if (formData.code.length > 10) {
      setError('Kode jurusan maksimal 10 karakter')
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
            {mode === 'create' ? 'Tambah Jurusan' : 'Edit Jurusan'}
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
            <FieldLabel required>Nama Jurusan</FieldLabel>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Contoh: MIPA - Matematika dan Ilmu Pengetahuan Alam"
              required
              disabled={loading}
            />
          </Field>

          <Field>
            <FieldLabel required>Kode</FieldLabel>
            <Input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="Contoh: MIPA"
              className="uppercase"
              maxLength={10}
              required
              disabled={loading}
            />
            <FieldDescription>Maksimal 10 karakter</FieldDescription>
          </Field>

          <Field>
            <FieldLabel>Deskripsi</FieldLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Deskripsi jurusan"
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
              Jurusan aktif
            </FieldLabel>
          </Field>
          </FieldGroup>

          <DialogFooter className="border-t bg-muted/40 px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
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
