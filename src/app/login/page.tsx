"use client";

import Link from "next/link";
import { GraduationCap, User, Lock, Eye, EyeOff, Info, ArrowRight, Loader2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    setShowPassword(false); // Reset password visibility on submit
    startTransition(async () => {
      const result = await login(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  const togglePassword = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const input = passwordRef.current;
    const selectionStart = input?.selectionStart ?? null;
    const selectionEnd = input?.selectionEnd ?? null;
    setShowPassword(prev => !prev);
    if (input) {
      // Restore caret/selection after type toggle to prevent jump to start.
      requestAnimationFrame(() => {
        input.focus();
        if (selectionStart !== null && selectionEnd !== null) {
          try {
            input.setSelectionRange(selectionStart, selectionEnd);
          } catch {
            // Some browsers might not allow selection on password type.
          }
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      {/* Logo & Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <GraduationCap className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          SIAKAD <span className="text-blue-600">System</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Sistem Informasi Akademik Terpadu
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">Portal Masuk</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Gunakan kredensial resmi sekolah Anda untuk mengakses sistem.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl ring-1 ring-inset ring-red-100">
              {errorMsg}
            </div>
          )}

          {/* Email/ID Field */}
          <div className="space-y-2">
            <label htmlFor="identifier" className="block text-sm font-semibold text-slate-700">
              Email / NIP / NISN
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="identifier"
                name="identifier"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="Masukkan email atau ID"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <Link href="/forgot-password" title="Atur ulang password" className="flex text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
                Lupa Password?
              </Link>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                required
                disabled={isPending}
                ref={passwordRef}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={togglePassword}
                onMouseDown={(e) => e.preventDefault()}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none z-10"
                aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              disabled={isPending}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
            />
            <label htmlFor="remember-me" className="ml-3 block text-sm text-slate-600">
              Ingat saya di perangkat ini
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 flex flex-col items-center justify-center rounded-xl bg-blue-50/50 p-4 text-center">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Info className="h-4 w-4" />
            Pendaftaran Sekolah
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Belum memiliki akun sekolah? <br className="sm:hidden" />
            <Link href="/register" className="font-semibold text-blue-600 hover:underline">Daftar sebagai Admin IT</Link>
          </p>
        </div>
      </div>
      
      {/* Bottom Legal Links */}
      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-500">
        <Link href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-slate-900 transition-colors">Terms of Service</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-slate-900 transition-colors">Contact Support</Link>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>

    </div>
  );
}
