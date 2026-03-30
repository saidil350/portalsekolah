import { z } from 'zod'

// Subject validation schema
export const subjectSchema = z.object({
  name: z.string()
    .min(1, 'Nama mata pelajaran harus diisi')
    .max(100, 'Nama mata pelajaran maksimal 100 karakter'),
  code: z.string()
    .min(1, 'Kode mata pelajaran harus diisi')
    .max(20, 'Kode mata pelajaran maksimal 20 karakter')
    .regex(/^[A-Z0-9_-]+$/, 'Kode hanya boleh huruf kapital, angka, underscore, dan tanda hubung')
    .toUpperCase(),
  type: z.enum(['mandatory', 'elective'], {
    errorMap: () => ({ message: 'Tipe mata pelajaran harus dipilih' })
  }),
  department_id: z.string()
    .optional(),
  credits: z.number()
    .min(0, 'SKS minimal 0')
    .max(10, 'SKS maksimal 10')
    .default(2),
  description: z.string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  status: z.enum(['active', 'inactive'])
    .default('active'),
})

export type SubjectFormData = z.infer<typeof subjectSchema>

// Subject teacher assignment schema
export const subjectTeacherSchema = z.object({
  subject_id: z.string().min(1, 'Mata pelajaran harus dipilih'),
  teacher_id: z.string().min(1, 'Guru harus dipilih'),
  rank: z.enum(['primary', 'secondary']).default('secondary'),
  academic_year_id: z.string().min(1, 'Tahun ajaran harus dipilih'),
  semester_id: z.string().min(1, 'Semester harus dipilih'),
})

export type SubjectTeacherFormData = z.infer<typeof subjectTeacherSchema>
