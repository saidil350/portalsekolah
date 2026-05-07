"use client";

import Link from "next/link";
import { ArrowLeft, Building2, CheckCircle2, GraduationCap, Mail } from "lucide-react";
import { useState, useTransition } from "react";

import { registerAdmin } from "./actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    startTransition(async () => {
      const result = await registerAdmin(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setSuccessMsg(result.message || "Pendaftaran berhasil!");
      }
    });
  };

  if (successMsg) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
        <Card className="w-full max-w-md text-center">
          <CardContent className="flex flex-col items-center gap-6 pt-6">
            <div className="flex size-16 items-center justify-center rounded-full bg-success-50 text-success-700">
              <CheckCircle2 className="size-10" />
            </div>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl font-bold">Pendaftaran Berhasil!</h2>
              <p className="text-muted-foreground leading-relaxed">{successMsg}</p>
            </div>
            <Alert variant="info" className="text-left">
              <AlertDescription>
                Simpan kode sekolah tersebut. Kode itu wajib dipakai bersama
                Email/NIP/NISN dan password saat login.
              </AlertDescription>
            </Alert>
            <Button asChild className="w-full">
              <Link href="/login">Kembali ke Login</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-xl border bg-card shadow-sm">
          <GraduationCap className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          SIAKAD <span className="text-primary">System</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">Pendaftaran Admin IT Sekolah</p>
      </div>

      <Card className="w-full max-w-lg">
        <CardHeader>
          <Button asChild variant="link" className="mb-2 h-auto w-fit px-0 py-0 text-muted-foreground">
            <Link href="/login">
              <ArrowLeft />
              Kembali ke Login
            </Link>
          </Button>
          <CardTitle>Daftar Ekosistem Sekolah Baru</CardTitle>
          <CardDescription>
            Buat akun Admin IT untuk sekolah/instansi Anda. Setiap sekolah memiliki
            ekosistem data yang terpisah.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="info" className="mb-6">
            <Building2 className="size-5" />
            <div>
              <AlertTitle>Multi-Ekosistem System</AlertTitle>
              <AlertDescription>
                Setiap sekolah memiliki database yang terpisah. Data Anda tidak
                akan bercampur dengan sekolah lain.
              </AlertDescription>
            </div>
          </Alert>

          <form action={handleSubmit} className="flex flex-col gap-5">
            {errorMsg && (
              <Alert variant="error">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <Input
              type="text"
              id="organizationName"
              name="organizationName"
              required
              disabled={isPending}
              label="Nama Sekolah / Organisasi"
              helperText="Nama ini akan menjadi identitas ekosistem Anda"
              leftIcon={<Building2 />}
              placeholder="Contoh: SMA Negeri 1 Jakarta"
            />
            <Input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isPending}
              label="Nama Lengkap Admin"
              placeholder="Nama lengkap Anda"
            />
            <Input
              type="email"
              id="email"
              name="email"
              required
              disabled={isPending}
              label="Email"
              leftIcon={<Mail />}
              placeholder="admin@sekolah.sch.id"
            />
            <Input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              disabled={isPending}
              label="Password"
              helperText="Minimal 6 karakter"
              showPasswordToggle
              placeholder="Minimal 6 karakter"
            />
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={6}
              disabled={isPending}
              label="Konfirmasi Password"
              showPasswordToggle
              placeholder="Ulangi password"
            />

            <Alert variant="warning">
              <AlertDescription>
                Akun akan ditinjau sebelum aktif. Pastikan data yang diisi benar.
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={isPending} loading={isPending} className="w-full">
              {isPending ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk
            </Link>
          </p>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>
    </main>
  );
}
