"use client";

import Link from "next/link";
import { ArrowRight, Hash, Lock, Mail, ShieldAlert, User } from "lucide-react";
import { useState, useTransition } from "react";

import { registerAdminIT } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterAdminITPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await registerAdminIT(formData);
      if (result?.error) setErrorMsg(result.error);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-xl border bg-card shadow-sm">
          <ShieldAlert className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          SIAKAD <span className="text-primary">Admin IT</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pendaftaran Hak Akses Administrator Sistem
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Portal Pendaftaran</CardTitle>
          <CardDescription>
            Daftarkan diri Anda untuk mengelola sistem akademik secara penuh.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="flex flex-col gap-6">
            {errorMsg && (
              <Alert variant="error">
                <AlertDescription>{errorMsg}</AlertDescription>
              </Alert>
            )}

            <Input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isPending}
              label="Nama Lengkap"
              leftIcon={<User />}
              placeholder="Masukkan nama lengkap"
            />
            <Input
              type="email"
              id="email"
              name="email"
              required
              disabled={isPending}
              label="Alamat Email"
              leftIcon={<Mail />}
              placeholder="admin@sekolah.sch.id"
            />
            <Input
              type="text"
              id="nip"
              name="nip"
              required
              disabled={isPending}
              label="NIP / ID Pegawai"
              leftIcon={<Hash />}
              placeholder="Nomor Induk Pegawai"
            />
            <Input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              disabled={isPending}
              label="Password"
              leftIcon={<Lock />}
              showPasswordToggle
              placeholder="Minimal 6 karakter"
            />

            <Button type="submit" disabled={isPending} loading={isPending} className="w-full">
              {isPending ? "Mendaftarkan..." : "Daftar Sekarang"}
              {!isPending && <ArrowRight />}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Masuk ke sini
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <Link href="#" className="hover:text-foreground transition-colors">Kebijakan Privasi</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-foreground transition-colors">Ketentuan Layanan</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-foreground transition-colors">Bantuan</Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>
    </main>
  );
}
