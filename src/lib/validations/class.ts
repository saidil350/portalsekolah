import { z } from 'zod'

// Class validation schema
export const classSchema = z.object({
  name: z.string()
    .min(1, 'Nama kelas harus diisi')
    .max(50, 'Nama kelas maksimal 50 karakter')
    .regex(/^[A-Z0-9-]+$/, 'Nama kelas hanya boleh huruf kapital, angka, dan tanda hubung'),
  level_id: z.string()
    .min(1, 'Tingkat kelas harus dipilih'),
  department_id: z.string()
    .optional(),
  academic_year_id: z.string()
    .min(1, 'Tahun ajaran harus dipilih'),
  semester_id: z.string()
    .min(1, 'Semester harus dipilih'),
  room_id: z.string()
    .optional(),
  homeroom_teacher_id: z.string()
    .optional(),
  capacity: z.number()
    .min(1, 'Kapasitas minimal 1')
    .max(100, 'Kapasitas maksimal 100')
    .default(40),
  status: z.enum(['active', 'inactive'] as const)
    .default('active'),
})

export type ClassFormData = z.infer<typeof classSchema>

// Class filter schema
export const classFilterSchema = z.object({
  search: z.string().optional(),
  level_id: z.string().optional(),
  department_id: z.string().optional(),
  academic_year_id: z.string().optional(),
  semester_id: z.string().optional(),
  status: z.enum(['active', 'inactive'] as const).optional(),
})

export type ClassFilterData = z.infer<typeof classFilterSchema>
