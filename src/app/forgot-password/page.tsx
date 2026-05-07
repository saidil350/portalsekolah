"use client";

import Link from "next/link";
import { ArrowLeft, CheckCircle2, GraduationCap, Lock, User, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";

import { resetPassword } from "./actions";
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

export default function ForgotPasswordPage() {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);

    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok.");
      return;
    }

    startTransition(async () => {
      const result = await resetPassword(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success) {
        setSuccessMsg(result.message || "Password berhasil diperbarui.");
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
              <h2 className="text-2xl font-bold">Berhasil!</h2>
              <p className="text-muted-foreground leading-relaxed">{successMsg}</p>
            </div>
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
        <p className="mt-2 text-sm text-muted-foreground">Atur Ulang Password Anda</p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <Button asChild variant="link" className="mb-2 h-auto w-fit px-0 py-0 text-muted-foreground">
            <Link href="/login">
              <ArrowLeft />
              Kembali ke Login
            </Link>
          </Button>
          <CardTitle>Lupa Password?</CardTitle>
          <CardDescription>
            Lengkapi data di bawah ini untuk mereset password Anda secara instan.
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
              id="identifier"
              name="identifier"
              required
              disabled={isPending}
              label="Email / NIP / NISN"
              leftIcon={<User />}
              placeholder="Masukkan email atau ID Anda"
            />
            <Input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isPending}
              label="Nama Lengkap (Sesuai Database)"
              leftIcon={<UserCheck />}
              placeholder="Masukkan nama lengkap Anda"
            />
            <Input
              type="password"
              id="password"
              name="password"
              required
              disabled={isPending}
              label="Password Baru"
              leftIcon={<Lock />}
              showPasswordToggle
              placeholder="••••••••"
            />
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              disabled={isPending}
              label="Konfirmasi Password Baru"
              leftIcon={<Lock />}
              showPasswordToggle
              placeholder="••••••••"
            />

            <Button type="submit" disabled={isPending} loading={isPending} className="w-full">
              {isPending ? "Memproses..." : "Reset Password Sekarang"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="mt-8 text-xs text-muted-foreground">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>
    </main>
  );
}
