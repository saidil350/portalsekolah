"use client";

import Link from "next/link";
import { ShieldAlert, User, Lock, Eye, EyeOff, Hash, ArrowRight, Loader2, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { registerAdminIT } from "./actions";

export default function RegisterAdminITPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await registerAdminIT(formData);
      if (result?.error) {
        setErrorMsg(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      
      {/* Logo & Header */}
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
          <ShieldAlert className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          SIAKAD <span className="text-blue-600">Admin IT</span>
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Pendaftaran Hak Akses Administrator Sistem
        </p>
      </div>

      {/* Register Card */}
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-900">Portal Pendaftaran</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Daftarkan diri Anda untuk mengelola sistem akademik secara penuh.
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          {errorMsg && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl ring-1 ring-inset ring-red-100">
              {errorMsg}
            </div>
          )}

          {/* Full Name Field */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="fullName"
                name="fullName"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
              Alamat Email
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

          {/* NIP Field */}
          <div className="space-y-2">
            <label htmlFor="nip" className="block text-sm font-semibold text-slate-700">
              NIP / ID Pegawai
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Hash className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                id="nip"
                name="nip"
                required
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all disabled:opacity-50"
                placeholder="Nomor Induk Pegawai"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
              Password
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
                minLength={6}
                disabled={isPending}
                className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-10 pr-10 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 transition-all hover:bg-slate-100 focus:hover:bg-white disabled:opacity-50"
                placeholder="Minimal 6 karakter"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
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
                Mendaftarkan...
              </>
            ) : (
              <>
                Daftar Sekarang
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Sudah memiliki akun?{" "}
            <Link href="/login" className="font-semibold text-blue-600 hover:underline">
              Masuk ke sini
            </Link>
          </p>
        </div>
      </div>
      
      {/* Bottom Legal Links */}
      <div className="mt-8 flex items-center gap-4 text-xs font-medium text-slate-500">
        <Link href="#" className="hover:text-slate-900 transition-colors">Kebijakan Privasi</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-slate-900 transition-colors">Ketentuan Layanan</Link>
        <span>&middot;</span>
        <Link href="#" className="hover:text-slate-900 transition-colors">Bantuan</Link>
      </div>
      <p className="mt-4 text-xs text-slate-400">
        &copy; 2024 SIAKAD Plus Management System. All rights reserved.
      </p>

    </div>
  );
}
