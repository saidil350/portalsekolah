# Sistem Multi-Ekosistem (Multi-Organization)

## Overview

Sistem ini menggunakan arsitektur **multi-tenant** di mana setiap sekolah/organisasi memiliki ekosistem data yang terpisah. Setiap Admin IT hanya bisa melihat dan mengelola data dari organisasinya sendiri.

## Konsep Utama

### Organization ID
Setiap sekolah/organisasi memiliki unique identifier:
- **organization_id**: ID unik (contoh: `sma-negeri-1-jakarta-abc123`)
- **organization_name**: Nama sekolah/organisasi (contoh: `SMA Negeri 1 Jakarta`)

### Isolasi Data
- Data Admin IT A tidak akan bercampur dengan Admin IT B
- Setiap query HARUS difilter by `organization_id`
- User hanya bisa mengakses data dari organization-nya sendiri

## Penggunaan

### 1. Register Sekolah Baru

Ketika Admin IT mendaftar, sistem akan:
1. Membuat akun dengan role `ADMIN_IT`
2. Generate `organization_id` unik
3. Simpan `organization_name` dari input form
4. Mengisolasi semua data berdasarkan `organization_id`

**URL**: `/register`

### 2. Mengambil Data Organization User

```typescript
import {
  getCurrentOrganizationId,
  getCurrentOrganizationName
} from '@/utils/organization'

// Di Server Component atau Server Action
const orgId = await getCurrentOrganizationId()
const orgName = await getCurrentOrganizationName()

console.log(`Organization ID: ${orgId}`) // 'sma-negeri-1-jakarta-abc123'
console.log(`Organization Name: ${orgName}`) // 'SMA Negeri 1 Jakarta'
```

### 3. Query Data dengan Organization Filter

#### Contoh: Mengambil semua siswa dari organization user

```typescript
import { createClient } from '@/utils/supabase/server'
import { getCurrentOrganizationId } from '@/utils/organization'

export async function getStudents() {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()

  if (!organizationId) {
    throw new Error('User tidak memiliki organization')
  }

  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('organization_id', organizationId) // PENTING: Filter by organization_id

  return { students: data, error }
}
```

#### Contoh: Mengambil jurusan/department

```typescript
export async function getDepartments() {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()

  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('organization_id', organizationId)

  return { departments: data, error }
}
```

### 4. Membuat Data Baru dengan Organization ID

```typescript
export async function createDepartment(name: string, code: string) {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()

  if (!organizationId) {
    return { error: 'Organization tidak ditemukan' }
  }

  const { data, error } = await supabase
    .from('departments')
    .insert({
      name,
      code,
      organization_id: organizationId, // PENTING: Set organization_id
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  return { department: data, error }
}
```

### 5. Validasi Akses Organization

```typescript
import {
  validateOrganizationAccess,
  assertOrganizationAccess
} from '@/utils/organization'

export async function updateDepartment(
  departmentId: string,
  updates: any
) {
  const supabase = await createClient()
  const organizationId = await getCurrentOrganizationId()

  // 1. Ambil data department
  const { data: department } = await supabase
    .from('departments')
    .select('organization_id')
    .eq('id', departmentId)
    .single()

  // 2. Validasi bahwa department milik organization user
  assertOrganizationAccess(
    department?.organization_id,
    organizationId!
  )

  // 3. Lanjut update jika valid
  const { data, error } = await supabase
    .from('departments')
    .update(updates)
    .eq('id', departmentId)

  return { data, error }
}
```

## Helper Functions

### `getCurrentOrganizationId()`
Mengambil `organization_id` dari user yang sedang login.

```typescript
const orgId = await getCurrentOrganizationId()
```

### `getCurrentOrganizationName()`
Mengambil `organization_name` dari user yang sedang login.

```typescript
const orgName = await getCurrentOrganizationName()
```

### `isCurrentUserAdminIT()`
Cek apakah user yang sedang login adalah Admin IT.

```typescript
const isAdminIT = await isCurrentUserAdminIT()
```

### `getOrganizationFilter(organizationId)`
Membuat filter object untuk Supabase query.

```typescript
const filter = getOrganizationFilter(orgId)
// Returns: { organization_id: 'sma-negeri-1-jakarta-abc123' }

// Use in query:
await supabase
  .from('students')
  .select('*')
  .match(filter)
```

### `validateOrganizationAccess(recordOrgId, userOrgId)`
Validasi apakah user berhak mengakses data.

```typescript
const canAccess = validateOrganizationAccess(
  record.organization_id,
  userOrganizationId
) // Returns: true or false
```

### `assertOrganizationAccess(recordOrgId, userOrgId)`
Throw error jika organization tidak match.

```typescript
assertOrganizationAccess(
  record.organization_id,
  userOrganizationId
)
// Throws Error if organizations don't match
```

## Database Schema

### Table: `profiles`
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN_IT', 'KEPALA_SEKOLAH', 'GURU', 'SISWA')),
  organization_id TEXT UNIQUE, -- ID unik untuk setiap sekolah
  organization_name TEXT, -- Nama sekolah/organisasi
  nip TEXT,
  nisn TEXT,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index untuk organization
CREATE INDEX idx_profiles_organization_id ON profiles(organization_id);
```

### Table: `departments` (Contoh)
```sql
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  organization_id TEXT NOT NULL, -- PENTING: Setiap table harus punya ini
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(code, organization_id) -- Code unik per organization
);

-- Index untuk filtering
CREATE INDEX idx_departments_organization_id ON departments(organization_id);
```

## Best Practices

### ✅ DO:
1. **SELALU** filter query by `organization_id`
2. **SELALU** set `organization_id` saat insert data baru
3. **SELALU** validate organization access sebelum update/delete
4. Gunakan helper functions dari `@/utils/organization`

### ❌ DON'T:
1. JANGAN query data tanpa filter `organization_id`
2. JANGAN biarkan user mengakses data organization lain
3. JANGAN hardcode organization_id
4. JANGAN lupa index `organization_id` di database

## Troubleshooting

### Problem: User tidak melihat data apapun
**Solution**: Cek apakah query sudah difilter by `organization_id`

### Problem: User bisa melihat data dari sekolah lain
**Solution**: Tambahkan filter `organization_id` di semua query

### Problem: Error "Organization tidak ditemukan"
**Solution**: Pastikan user memiliki `organization_id` di table `profiles`

## Migration Guide

Jika ingin menambahkan `organization_id` ke table yang sudah ada:

```sql
-- 1. Add column
ALTER TABLE nama_table ADD COLUMN organization_id TEXT;

-- 2. Create index
CREATE INDEX idx_nama_table_organization_id ON nama_table(organization_id);

-- 3. Backfill existing data (jika perlu)
UPDATE nama_table
SET organization_id = (
  SELECT p.organization_id
  FROM profiles p
  WHERE p.id = nama_table.created_by
);
```

## Support

Untuk pertanyaan atau issues, hubungi tim development.
