import { z } from 'zod'

// Student validation schema
export const studentSchema = z.object({
  full_name: z.string()
    .min(2, 'Nama harus minimal 2 karakter')
    .max(100, 'Nama maksimal 100 karakter'),
  email: z.string()
    .email('Format email tidak valid')
    .optional()
    .or(z.literal('')),
  nis: z.string()
    .min(5, 'NIS harus minimal 5 karakter')
    .max(20, 'NIS maksimal 20 karakter')
    .regex(/^[0-9]+$/, 'NIS harus berupa angka'),
  nisn: z.string()
    .min(10, 'NISN harus 10 karakter')
    .max(10, 'NISN harus 10 karakter')
    .regex(/^[0-9]+$/, 'NISN harus berupa angka')
    .optional()
    .or(z.literal('')),
  gender: z.enum(['L', 'P'] as const, {
    message: 'Jenis kelamin harus dipilih',
  }),
  birth_date: z.string()
    .min(1, 'Tanggal lahir harus diisi')
    .refine(date => {
      const d = new Date(date)
      return !isNaN(d.getTime())
    }, 'Format tanggal tidak valid'),
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor telepon tidak valid')
    .optional()
    .or(z.literal('')),
  address: z.string()
    .max(500, 'Alamat maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  class_id: z.string()
    .min(1, 'Kelas harus dipilih')
    .optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'transferred'] as const)
    .default('active'),
})

export type StudentFormData = z.infer<typeof studentSchema>

// Student filter schema
export const studentFilterSchema = z.object({
  search: z.string().optional(),
  class_id: z.string().optional(),
  status: z.enum(['active', 'inactive', 'graduated', 'transferred'] as const).optional(),
  gender: z.enum(['L', 'P'] as const).optional(),
})

export type StudentFilterData = z.infer<typeof studentFilterSchema>
