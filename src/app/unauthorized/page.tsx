'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Link from 'next/link'

function UnauthorizedContent() {
  const searchParams = useSearchParams()
  const requiredRole = searchParams.get('role')

  useEffect(() => {
    // Log unauthorized access attempt for security monitoring
    console.warn('[AUTH] Unauthorized access attempt', {
      timestamp: new Date().toISOString(),
      requiredRole,
      userAgent: navigator.userAgent
    })
  }, [requiredRole])

  const roleMessages: Record<string, { title: string; message: string }> = {
    'ADMIN_IT': {
      title: 'Admin IT',
      message: 'Halaman ini khusus untuk Administrator IT'
    },
    'GURU': {
      title: 'Guru',
      message: 'Halaman ini khusus untuk Guru'
    },
    'KEPALA_SEKOLAH': {
      title: 'Kepala Sekolah',
      message: 'Halaman ini khusus untuk Kepala Sekolah'
    },
    'SISWA': {
      title: 'Siswa',
      message: 'Halaman ini khusus untuk Siswa'
    }
  }

  const roleInfo = roleMessages[requiredRole || ''] || {
    title: 'Akses Terbatas',
    message: 'Anda tidak memiliki akses ke halaman ini'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          {/* Lock Icon */}
          <div className="mx-auto h-16 w-16 text-red-500 mb-4">
            <svg
              className="h-full w-full"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Akses Ditolak
          </h1>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
            <p className="text-sm font-semibold text-blue-900 mb-1">
              {roleInfo.title}
            </p>
            <p className="text-sm text-blue-700">
              {roleInfo.message}
            </p>
          </div>

          <p className="text-gray-600 mb-6">
            Anda tidak memiliki izin untuk mengakses halaman ini.
            Jika Anda merasa ini adalah kesalahan, silakan hubungi Administrator IT.
          </p>

          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium text-center"
            >
              Kembali ke Dashboard
            </Link>

            <Link
              href="/"
              className="block w-full bg-gray-200 text-gray-900 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors font-medium text-center"
            >
              Ke Halaman Utama
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              ID Referensi: {requiredRole || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background-light px-4">
        <p>Memuat...</p>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  )
}
