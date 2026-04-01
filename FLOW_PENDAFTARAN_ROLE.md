# Flow Pendaftaran Role Akun - SIAKAD System

## 📋 Overview

Dokumentasi ini menjelaskan flow lengkap dari pendaftaran akun mulai dari Admin IT hingga pendaftaran seluruh role lainnya dalam sistem SIAKAD.

---

## 🏗️ Arsitektur Multi-Organization

Sistem menggunakan arsitektur multi-tenant di mana setiap sekolah/organisasi memiliki ekosistem data yang terpisah.

### Tabel Utama:
- **`organizations`**: Menyimpan data sekolah/organisasi
- **`profiles`**: Menyimpan data user dengan role dan organization_id
- **`auth.users`**: Supabase Auth untuk autentikasi

### Role yang Tersedia:
1. **ADMIN_IT** - Administrator sistem (full access)
2. **GURU** - Guru/Teacher
3. **KEPALA_SEKOLAH** - Kepala Sekolah/Headmaster
4. **SISWA** - Siswa/Student

---

## 🔄 Flow 1: Pendaftaran Admin IT (Self-Registration)

### Endpoint: `/register`

### Step-by-Step Flow:

#### 1. **Input Form** (`src/app/register/page.tsx`)
```typescript
- organizationName: string  // Nama sekolah
- fullName: string          // Nama lengkap admin
- email: string             // Email admin
- password: string          // Password (min 6 karakter)
- confirmPassword: string   // Konfirmasi password
```

#### 2. **Server Action** (`src/app/register/actions.ts` - `registerAdmin`)

```typescript
// Location: src/app/register/actions.ts:7-117
export async function registerAdmin(formData: FormData)
```

**Flow:**

2.1. **Validasi Input** (Line 14-25)
- Cek semua field terisi
- Cek password cocok
- Cek password minimal 6 karakter

2.2. **Cek Email Duplikat** (Line 29-43)
```typescript
const { data: existingUser } = await supabase
  .from('profiles')
  .select('id, email')
  .eq('email', email)
  .maybeSingle()
```
- Jika email sudah ada → return error

2.3. **Register ke Supabase Auth** (Line 46-64)
```typescript
const { data: authData, error: authError } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      full_name: fullName,
      organization_name: organizationName,  // ❌ PROBLEM: Only in metadata
    }
  }
})
```

2.4. **Insert/Update Profile** (Line 66-108)
```typescript
// Cek apakah profile sudah ada (mungkin dibuat trigger)
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('id, email, role')
  .eq('id', authData.user.id)
  .maybeSingle()

if (existingProfile) {
  // Update profile
  await supabase.from('profiles').update({
    email: email,
    full_name: fullName,
    role: 'ADMIN_IT',  // ❌ PROBLEM: No organization_id
    is_active: true,
    updated_at: new Date().toISOString(),
  }).eq('id', authData.user.id)
} else {
  // Insert baru
  await supabase.from('profiles').insert({
    id: authData.user.id,
    email: email,
    full_name: fullName,
    role: 'ADMIN_IT',  // ❌ PROBLEM: No organization_id
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}
```

#### 3. **Hasil**
- ✅ Akun Admin IT terbuat
- ❌ **TIDAK ada record organization yang dibuat**
- ❌ **Profile TIDAK terhubung ke organization manapun**

---

## 🔐 Flow 2: Login

### Endpoint: `/login`

### Step-by-Step Flow:

#### 1. **Input Form** (`src/app/login/page.tsx`)
```typescript
- identifier: string  // Email / NIP / NISN
- password: string    // Password
```

#### 2. **Server Action** (`src/app/login/actions.ts` - `login`)

**Flow:**

2.1. **Validasi Input** (Line 10-12)
```typescript
if (!identifier || !password) {
  return { error: 'Email/NIP/NISN dan password harus diisi.' }
}
```

2.2. **Resolve Email dari NIP/NISN** (Line 18-36)
```typescript
// Jika identifier tidak mengandung '@', asumsikan NIP/NISN
if (!identifier.includes('@')) {
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('email')
    .or(`nip.eq.${identifier},nisn.eq.${identifier}`)
    .single()

  if (!userProfile) {
    return { error: 'Akun dengan NIP atau NISN tersebut tidak ditemukan.' }
  }

  emailToLogin = userProfile.email
}
```

2.3. **Login dengan Email & Password** (Line 39-46)
```typescript
const { data: authData, error } = await supabase.auth.signInWithPassword({
  email: emailToLogin,
  password,
})
```

2.4. **Update Last Login & Get Role** (Line 48-68)
```typescript
await supabase
  .from('profiles')
  .update({ last_login: new Date().toISOString() })
  .select('role')
  .eq('id', userId)
  .single()
```

2.5. **Redirect ke Dashboard** (Line 70-83)
```typescript
const roleDashboardMap: Record<string, string> = {
  'ADMIN_IT': '/dashboard/admin-it',
  'GURU': '/dashboard/teaching-dashboard',
  'KEPALA_SEKOLAH': '/dashboard/headmaster-dashboard',
  'SISWA': '/dashboard/student-dashboard'
}

return { success: true, redirect: roleDashboardMap[userRole] }
```

---

## 👥 Flow 3: Pendaftaran Role Lain ( oleh Admin IT )

### Endpoint: `/dashboard/admin-it/manajemen-pengguna`

### Prasyarat:
- User harus login sebagai **ADMIN_IT**
- Authorization check via `authorizeAction(['ADMIN_IT'])`

### Step-by-Step Flow:

#### 1. **Authorization Check** (`src/lib/auth/authorization.ts`)
```typescript
// Location: src/lib/auth/authorization.ts:143-181
export async function authorizeAction(allowedRoles: UserRole[])

// Step 1: Check authentication
const { data: { user } } = await supabase.auth.getUser()

// Step 2: Fetch user profile with role
const { data: profile } = await supabase
  .from('profiles')
  .select('id, email, role, full_name')
  .eq('id', user.id)
  .single()

// Step 3: Validate role
if (!profile.role || !allowedRoles.includes(profile.role)) {
  return AuthError.forbidden()
}
```

#### 2. **Create User** (`src/app/dashboard/admin-it/manajemen-pengguna/actions.ts` - `createUser`)

**Input Form Data:**
```typescript
interface UserFormData {
  email: string
  full_name: string
  role: 'GURU' | 'KEPALA_SEKOLAH' | 'SISWA'
  nip?: string      // Required for GURU & KEPALA_SEKOLAH
  nisn?: string     // Required for SISWA
  password?: string
  status?: 'ACTIVE' | 'INACTIVE'
}
```

**Flow:**

2.1. **Validasi Role-Specific** (Line 92-102)
```typescript
if (formData.role === 'GURU' || formData.role === 'KEPALA_SEKOLAH') {
  if (!formData.nip || formData.nip.trim() === '') {
    throw new Error('NIP wajib diisi untuk Guru dan Kepala Sekolah')
  }
}

if (formData.role === 'SISWA') {
  if (!formData.nisn || formData.nisn.trim() === '') {
    throw new Error('NISN wajib diisi untuk Siswa')
  }
}
```

2.2. **Cek Duplikat** (Line 104-139)
- Cek email duplikat
- Cek NIP duplikat (untuk GURU/STAF)
- Cek NISN duplikat (untuk SISWA)

2.3. **Create Auth User** (Line 141-150)
```typescript
// Menggunakan ADMIN client untuk bypass RLS
const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
  email: formData.email,
  password: formData.password || 'Password123!',
  email_confirm: true,
  user_metadata: {
    full_name: formData.full_name,
    role: formData.role
  }
})
```

2.4. **Create Profile** (Line 154-181)
```typescript
const profileData: any = {
  id: authData.user.id,
  email: formData.email,
  full_name: formData.full_name,
  role: formData.role,
  status: formData.status || 'ACTIVE'
}

// Conditional NIP/NISN
if (formData.role !== 'SISWA' && formData.nip) {
  profileData.nip = formData.nip.trim()
}

if (formData.role === 'SISWA' && formData.nisn) {
  profileData.nisn = formData.nisn.trim()
}

// Insert profile
await supabase.from('profiles').upsert(profileData, { onConflict: 'id' })
```

2.5. **Rollback on Error** (Line 177-180)
```typescript
if (profileError) {
  // Delete auth user jika profile creation gagal
  await adminSupabase.auth.admin.deleteUser(authData.user.id)
  throw profileError
}
```

#### 3. **Update User** (`updateUser`)
- Mirip dengan create user
- Tambahan: Prevent self-deletion dan last admin protection (Line 234-264)

#### 4. **Delete User** (`deleteUser`)
- Cek apakah user adalah admin terakhir (Line 404-425)
- Invalidate semua sessions user
- Cascade delete profile

---

## 🛡️ Authorization System

### Functions:

#### 1. **authorizeApi** (API Routes)
```typescript
// Location: src/lib/auth/authorization.ts:81-120
export async function authorizeApi(request: Request, allowedRoles: UserRole[])

// Usage:
export async function GET(request: Request) {
  const auth = await authorizeApi(request, ['ADMIN_IT'])
  if (!auth.success) {
    return Response.json({ error: auth.error }, { status: auth.statusCode })
  }
  // ... logic
}
```

#### 2. **authorizeAction** (Server Actions)
```typescript
// Location: src/lib/auth/authorization.ts:143-181
export async function authorizeAction(allowedRoles: UserRole[])

// Usage:
'use server'
export async function createAcademicYear(formData: AcademicYearFormData) {
  const auth = await authorizeAction(['ADMIN_IT'])
  if (!auth.success) {
    return { success: false, error: auth.error }
  }
  // ... logic
}
```

#### 3. **authorizeDashboard** (Dashboard Layouts)
```typescript
// Location: src/lib/auth/authorization.ts:204-276
export async function authorizeDashboard(allowedRole: UserRole)

// Usage:
export default async function AdminLayout({ children }) {
  const authResult = await authorizeDashboard('ADMIN_IT')
  if (!authResult) {
    redirect('/unauthorized?role=ADMIN_IT')
  }
  // ... render layout
}
```

---

## ❌ PROBLEMS & ISSUES

### 🔴 Critical Issues:

#### 1. **Organization ID Not Set During Registration**
**Location:** `src/app/register/actions.ts:66-108`

**Problem:**
- `organizationName` diinput di form (line 8)
- `organizationName` disimpan ke auth metadata (line 52) ❌
- **TAPI tidak ada record organization yang dibuat di tabel `organizations`**
- **Profile tidak memiliki `organization_id`** ❌

**Impact:**
- Admin IT terdaftar tanpa organization
- Melanggar constraint `organization_id NOT NULL` (setelah migration 012)
- User tidak bisa membuat user lain karena tidak punya organization

**Expected Flow:**
```typescript
// 1. Create organization
const { data: org } = await supabase
  .from('organizations')
  .insert({
    name: organizationName,
    code: generateOrgCode(organizationName),
    created_by: authData.user.id
  })
  .select()
  .single()

// 2. Create profile dengan organization_id
await supabase.from('profiles').insert({
  id: authData.user.id,
  email: email,
  full_name: fullName,
  role: 'ADMIN_IT',
  organization_id: org.id,  // ✅ Link ke organization
  is_active: true,
})
```

#### 2. **RLS Policy Conflict**
**Location:** `supabase/migrations/014_allow_user_self_insert_profile.sql`

**Problem:**
- Policy memperbolehkan user insert profile dengan `id = auth.uid()` ✅
- **Tapi tidak menangani `organization_id`** ❌
- Setelah migration 012, `organization_id` adalah NOT NULL

**Impact:**
- Insert profile akan gagal karena `organization_id` required
- Atau akan insert dengan NULL (jika constraint belum diterapkan)

#### 3. **No Organization Creation Logic**
**Problem:**
- Tidak ada kode untuk membuat record `organizations`
- Tidak ada kode untuk generate unique `organization.code`
- Tidak ada validasi organization limit

**Expected:**
```typescript
// Generate unique code
const code = await generateUniqueOrgCode(organizationName)

// Check organization limit (if applicable)
const { count } = await supabase
  .from('organizations')
  .select('*', { count: 'exact', head: true })

// Create organization
const { data: org } = await supabase
  .from('organizations')
  .insert({
    name: organizationName,
    code: code,
    created_by: authData.user.id,
    is_active: false, // Pending approval
  })
  .select()
  .single()
```

#### 4. **Missing Organization Context in User Management**
**Location:** `src/app/dashboard/admin-it/manajemen-pengguna/actions.ts:154-181`

**Problem:**
- Saat Admin IT membuat user baru, tidak ada validasi bahwa user dibuat dalam organization yang sama
- Tidak ada filter `organization_id` saat fetch users

**Expected:**
```typescript
// Saat create user
const currentOrg = await getUserOrganization(auth.user.id)

const profileData = {
  // ... other fields
  organization_id: currentOrg.id,  // ✅ Same organization as admin
}

// Saat fetch users
const { data: users } = await supabase
  .from('profiles')
  .select('*')
  .eq('organization_id', currentOrg.id)  // ✅ Filter by organization
```

### 🟡 Medium Issues:

#### 5. **Hardcoded Default Password**
**Location:** `src/app/dashboard/admin-it/manajemen-pengguna/actions.ts:144`

```typescript
password: formData.password || 'Password123!'
```

**Security Risk:**
- Default password yang lemah
- Tidak ada enforce password complexity
- Tidak ada requirement untuk change password on first login

#### 6. **No Email Verification Flow**
**Problem:**
- `email_confirm: true` bypasses email verification
- Tidak ada email verification link
- Risk: Fake email registration

#### 7. **Missing Audit Trail**
**Problem:**
- Tidak ada logging siapa membuat user
- Tidak ada history perubahan role
- Sulit tracking jika ada masalah

### 🟢 Minor Issues:

#### 8. **Inconsistent Error Messages**
- Kadang bahasa Indonesia, kadang English
- Tidak ada error code standard

#### 9. **No Rate Limiting**
- Tidak ada rate limit di registration
- Vulnerable terhadap spam registration

#### 10. **Missing Validation**
- Tidak ada validasi format NIP (length, pattern)
- Tidak ada validasi format NISN (should be 10 digits)
- Tidak ada validasi email domain

---

## 🔧 RECOMMENDED FIXES

### Fix 1: Complete Registration Flow

```typescript
// src/app/register/actions.ts
export async function registerAdmin(formData: FormData) {
  // ... validation

  // 1. Create Auth User
  const { data: authData } = await supabase.auth.signUp({...})

  // 2. Generate Organization Code
  const code = generateOrgCode(organizationName)

  // 3. Create Organization
  const { data: org } = await supabase
    .from('organizations')
    .insert({
      name: organizationName,
      code: code,
      created_by: authData.user.id,
      is_active: false, // Pending approval
    })
    .select()
    .single()

  // 4. Create Profile dengan organization_id
  await supabase.from('profiles').insert({
    id: authData.user.id,
    email: email,
    full_name: fullName,
    role: 'ADMIN_IT',
    organization_id: org.id, // ✅
    is_active: false, // Pending approval
  })

  // 5. Send approval notification to superadmin
  await sendApprovalNotification(org.id)

  return {
    success: true,
    message: 'Akun akan ditinjau dalam 1-2 hari kerja.'
  }
}
```

### Fix 2: Update RLS Policy

```sql
-- supabase/migrations/015_fix_organization_insert.sql

DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

CREATE POLICY "Users can insert their own profile with organization"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
    AND organization_id IN (
      SELECT id FROM organizations
      WHERE created_by = auth.uid()
         OR is_active = true
    )
  );
```

### Fix 3: Add Organization Context

```typescript
// src/app/dashboard/admin-it/manajemen-pengguna/actions.ts

export async function createUser(formData: UserFormData) {
  const auth = await authorizeAction(['ADMIN_IT'])

  // Get current user's organization
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .single()

  // Create user dengan organization yang sama
  const profileData = {
    // ... other fields
    organization_id: currentUser.organization_id, // ✅
  }

  await supabase.from('profiles').insert(profileData)
}

export async function fetchUsers(filters: UserFilters) {
  const auth = await authorizeAction(['ADMIN_IT'])

  // Get current user's organization
  const { data: currentUser } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .single()

  // Filter by organization
  let query = supabase
    .from('profiles')
    .select('*')
    .eq('organization_id', currentUser.organization_id) // ✅

  // ... apply other filters
}
```

### Fix 4: Add Validation

```typescript
// src/lib/validation/user.ts

export function validateNIP(nip: string): boolean {
  // NIP format: 18 digits (YYYYMMDDXXXXXX)
  const nipRegex = /^\d{18}$/
  return nipRegex.test(nip)
}

export function validateNISN(nisn: string): boolean {
  // NISN: 10 digits
  const nisnRegex = /^\d{10}$/
  return nisnRegex.test(nisn)
}

export function generateOrgCode(name: string): string {
  // Remove spaces, convert to uppercase, add random suffix
  const clean = name.replace(/\s+/g, '').toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${clean.substring(0, 10)}${random}`
}

export async function isOrgCodeUnique(code: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('organizations')
    .select('code')
    .eq('code', code)
    .single()

  return !data
}
```

---

## 📊 Database Schema

### Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  domain VARCHAR(255),
  logo_url TEXT,
  address TEXT,
  phone VARCHAR(50),
  email VARCHAR(255),
  school_level VARCHAR(50),
  npsn VARCHAR(50),
  plan VARCHAR(50) DEFAULT 'FREE',
  max_users INTEGER DEFAULT 50,
  is_active BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id)
);
```

### Profiles Table (Relevant Columns)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'ADMIN_IT', 'GURU', 'KEPALA_SEKOLAH', 'SISWA'
  organization_id UUID NOT NULL REFERENCES organizations(id), -- ✅
  nip VARCHAR(50), -- For GURU/KEPALA_SEKOLAH
  nisn VARCHAR(50), -- For SISWA
  status VARCHAR(20) DEFAULT 'ACTIVE',
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, nip),
  UNIQUE(organization_id, nisn)
);
```

---

## 🎯 Summary

### Current State:
- ✅ Basic authentication flow works
- ✅ Role-based authorization implemented
- ✅ Multi-organization database schema exists
- ❌ **Registration flow incomplete** - no organization creation
- ❌ **Organization context missing** in user management
- ❌ **RLS policies incomplete** for organization isolation

### Priority Fixes:
1. **HIGH**: Add organization creation logic to registration
2. **HIGH**: Link profile to organization during registration
3. **HIGH**: Add organization context to all user operations
4. **MEDIUM**: Implement proper RLS policies
5. **MEDIUM**: Add validation for NIP/NISN/org codes
6. **LOW**: Improve security (password policies, email verification)

### Files to Modify:
1. `src/app/register/actions.ts` - Add organization creation
2. `src/app/dashboard/admin-it/manajemen-pengguna/actions.ts` - Add org context
3. `supabase/migrations/` - Add new migration for RLS fixes
4. `src/lib/validation/user.ts` - Create validation utilities

---

## 📝 Notes

- Migration `012_add_multi_organization_support.sql` menambahkan kolom `organization_id` ke semua tabel
- Migration `014_allow_user_self_insert_profile.sql` memperbaiki RLS untuk insert tapi tidak menangani organization_id
- Saat ini ada gap antara database schema (multi-org) dan application logic (single-org)
- Perlu comprehensive testing untuk multi-organization isolation setelah fixes

---

**Generated:** 2026-04-01
**Version:** 1.0
**Status:** DRAFT - Pending Implementation
