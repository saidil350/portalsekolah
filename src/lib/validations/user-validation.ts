/**
 * User Validation Functions
 * Validasi format NIP, NISN, dan generate kode organisasi
 */

/**
 * Validasi format NIP (Nomor Induk Pegawai)
 * Format: 18 digit angka (YYYYMMDD YYYYMM X XXXXX)
 * @param nip - NIP yang akan divalidasi
 * @returns object { valid, message }
 */
export function validateNIP(nip: string): { valid: boolean; message?: string } {
  if (!nip || nip.trim() === '') {
    return { valid: false, message: 'NIP wajib diisi' }
  }

  const cleanNIP = nip.trim().replace(/\s/g, '')

  if (!/^\d+$/.test(cleanNIP)) {
    return { valid: false, message: 'NIP hanya boleh berisi angka' }
  }

  if (cleanNIP.length !== 18) {
    return {
      valid: false,
      message: `NIP harus 18 digit, saat ini ${cleanNIP.length} digit`
    }
  }

  return { valid: true }
}

/**
 * Validasi format NISN (Nomor Induk Siswa Nasional)
 * Format: 10 digit angka
 * @param nisn - NISN yang akan divalidasi
 * @returns object { valid, message }
 */
export function validateNISN(nisn: string): { valid: boolean; message?: string } {
  if (!nisn || nisn.trim() === '') {
    return { valid: false, message: 'NISN wajib diisi' }
  }

  const cleanNISN = nisn.trim().replace(/\s/g, '')

  if (!/^\d+$/.test(cleanNISN)) {
    return { valid: false, message: 'NISN hanya boleh berisi angka' }
  }

  if (cleanNISN.length !== 10) {
    return {
      valid: false,
      message: `NISN harus 10 digit, saat ini ${cleanNISN.length} digit`
    }
  }

  return { valid: true }
}

/**
 * Generate kode organisasi deterministik dari nama sekolah
 * Contoh: "SMA Negeri 1 Jakarta" → "SMAN1JAK-A3F2"
 * @param name - Nama sekolah/organisasi
 * @returns Kode organisasi berbasis nama sekolah
 */
export function generateOrgCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 32)
    .trim()
}

/**
 * Validasi format email
 * @param email - Email yang akan divalidasi
 * @returns object { valid, message }
 */
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email || email.trim() === '') {
    return { valid: false, message: 'Email wajib diisi' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return { valid: false, message: 'Format email tidak valid' }
  }

  return { valid: true }
}

/**
 * Validasi password
 * @param password - Password yang akan divalidasi
 * @returns object { valid, message }
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (!password) {
    return { valid: false, message: 'Password wajib diisi' }
  }

  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' }
  }

  return { valid: true }
}
