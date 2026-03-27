"use client";

import Link from "next/link";
import { GraduationCap, Building2, Mail, ArrowLeft, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useTransition } from "react";
import { registerAdmin } from "./actions";

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
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mx-auto">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pendaftaran Berhasil!</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            {successMsg}
          </p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800">
              Akun Anda akan ditinjau dalam 1-2 hari kerja. Setelah disetujui, Anda dapat login dan mulai mengelola ekosistem sekolah Anda.
            </p>
          </div>
          <Link
            href="/login"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all"
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
          Pendaftaran Admin IT Sekolah
        </p>
      </div>

      {/* Register Form Card */}
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Login
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Daftar Ekosistem Sekolah Baru</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Buat akun Admin IT untuk sekolah/instansi Anda. Setiap sekolah memiliki ekosistem data yang terpisah.
          </p>
        </div>

        {/* Info Banner */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Multi-Ekosistem System</p>
              <p className="text-blue-700">
                Setiap sekolah memiliki database yang terpisah. Data Anda tidak akan bercampur dengan sekolah lain.
              </p>
            </div>
          </div>
        </div>

        <form action={handleSubmit} className="space-y-5">
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl ring-1 ring-inset ring-red-100">
              {errorMsg}
            </div>
          )}

          {/* Nama Sekolah/Organisasi */}
          <div className="space-y-2">
            <label htmlFor="organizationName" className="block text-sm font-semibold text-slate-700">
              Nama Sekolah / Organisasi <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="organizationName"
                name="organizationName"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="Contoh: SMA Negeri 1 Jakarta"
              />
            </div>
            <p className="text-xs text-slate-500">Nama ini akan menjadi identitas ekosistem Anda</p>
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
              Nama Lengkap Admin <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              required
              disabled={isPending}
              className="block w-full rounded-xl border-0 bg-slate-50 py-3 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
              placeholder="Nama lengkap Anda"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="admin@sekolah.sch.id"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              disabled={isPending}
              className="block w-full rounded-xl border-0 bg-slate-50 py-3 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
              placeholder="Minimal 6 karakter"
            />
            <p className="text-xs text-slate-500">Minimal 6 karakter</p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={6}
              disabled={isPending}
              className="block w-full rounded-xl border-0 bg-slate-50 py-3 px-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
              placeholder="Ulangi password"
            />
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                Akun akan ditinjau sebelum aktif. Pastikan data yang diisi benar.
              </p>
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
              "Daftar Sekarang"
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Masuk
            </Link>
          </p>
        </div>
      </div>

      <p className="mt-8 text-xs text-slate-400">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>

    </div>
  );
}
