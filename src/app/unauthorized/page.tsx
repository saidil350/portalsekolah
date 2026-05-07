'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, LayoutDashboard, LockKeyhole } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'

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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LockKeyhole />
          </div>
          <CardTitle>Akses Ditolak</CardTitle>
          <CardDescription>
            Anda tidak memiliki izin untuk mengakses halaman ini.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-6">
          <Alert variant="info">
            <AlertTitle>{roleInfo.title}</AlertTitle>
            <AlertDescription>{roleInfo.message}</AlertDescription>
          </Alert>

          <p className="text-center text-sm text-muted-foreground">
            Jika Anda merasa ini adalah kesalahan, silakan hubungi Administrator IT.
          </p>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t pt-6">
          <Button asChild className="w-full">
            <Link href="/dashboard">
              <LayoutDashboard data-icon="inline-start" />
              Kembali ke Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">
              <ArrowLeft data-icon="inline-start" />
              Ke Halaman Utama
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            ID Referensi: {requiredRole || 'N/A'}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col gap-4 pt-6">
            <Skeleton variant="avatar" className="mx-auto" />
            <Skeleton variant="title" />
            <Skeleton count={3} />
          </CardContent>
        </Card>
      </div>
    }>
      <UnauthorizedContent />
    </Suspense>
  )
}
