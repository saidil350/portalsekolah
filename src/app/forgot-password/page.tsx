"use client";

import Link from "next/link";
import { GraduationCap, User, Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, UserCheck } from "lucide-react";
import { useState, useTransition } from "react";
import { resetPassword } from "./actions";

export default function ForgotPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    
    // Client-side validation
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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Berhasil!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {successMsg}
          </p>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all font-sans"
          >
            Kembali ke Login
          </Link>
        </div>
      </div>
    );
  }

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
          Atur Ulang Password Anda
        </p>
      </div>

      {/* Forgot Password Card */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="mb-8">
          <Link 
            href="/login" 
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Lupa Password?</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Lengkapi data di bawah ini untuk mereset password Anda secara instan.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl ring-1 ring-inset ring-red-100">
              {errorMsg}
            </div>
          )}

          {/* Identifier Field */}
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
                placeholder="Masukkan email atau ID Anda"
              />
            </div>
          </div>

          {/* Full Name Verification */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
              Nama Lengkap (Sesuai Database)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <UserCheck className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password Baru
            </label>
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
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Konfirmasi Password Baru
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : (
              "Reset Password Sekarang"
            )}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-xs text-slate-400">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>

    </div>
  );
}
