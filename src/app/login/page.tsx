"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap, Info, Lock, School, User } from "lucide-react";
import { useState, useTransition } from "react";

import { login } from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      } else if (result?.success && result?.redirect) {
        router.push(result.redirect);
      }
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-xl border bg-card shadow-sm">
          <GraduationCap className="size-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          SIAKAD <span className="text-primary">System</span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sistem Informasi Akademik Terpadu
        </p>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Portal Masuk</CardTitle>
          <CardDescription>
            Gunakan kredensial resmi sekolah Anda untuk mengakses sistem.
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
              id="organizationCode"
              name="organizationCode"
              required
              disabled={isPending}
              label="Kode Sekolah"
              leftIcon={<School />}
              placeholder="Contoh: SMA1PIDIE-SMHR"
              autoCapitalize="characters"
            />

            <Input
              type="text"
              id="identifier"
              name="identifier"
              required
              disabled={isPending}
              label="Email / NIP / NISN"
              leftIcon={<User />}
              placeholder="Masukkan email atau ID"
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Button asChild variant="link" className="h-auto px-0 py-0">
                  <Link href="/forgot-password" title="Atur ulang password">
                    Lupa Password?
                  </Link>
                </Button>
              </div>
              <Input
                type="password"
                id="password"
                name="password"
                required
                disabled={isPending}
                leftIcon={<Lock />}
                showPasswordToggle
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="remember-me" name="remember-me" disabled={isPending} />
              <Label htmlFor="remember-me" className="text-muted-foreground">
                Ingat saya di perangkat ini
              </Label>
            </div>

            <Button type="submit" disabled={isPending} loading={isPending} className="w-full">
              {isPending ? "Memproses..." : "Sign In"}
              {!isPending && <ArrowRight />}
            </Button>
          </form>

          <div className="mt-8 rounded-lg border bg-primary/5 p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Info className="size-4" />
              Pendaftaran Sekolah
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Belum memiliki akun sekolah? <br className="sm:hidden" />
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Daftar sebagai Admin IT
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-muted-foreground">
        <Link href="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-foreground transition-colors">Contact Support</Link>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>
    </main>
  );
}
