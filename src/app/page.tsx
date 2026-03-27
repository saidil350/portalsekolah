import Image from "next/image";
import Link from "next/link";
import { 
  PlayCircle, 
  BookOpen, 
  Wallet, 
  Clock, 
  BarChart3, 
  Twitter, 
  Instagram, 
  Linkedin
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SIAKAD <span className="text-blue-600">Plus</span></span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="#fitur" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Fitur</Link>
            <Link href="#harga" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Harga</Link>
            <Link href="#tentang" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Tentang Kami</Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/register" className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors">
              Daftar Sekolah
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32">
          {/* Background decoration */}
          <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80 sm:ml-16 sm:translate-x-0" aria-hidden="true">
            <div className="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
          </div>
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-8">
              <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
              V0.2.0 Tech Preview
            </div>

            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
              Digitalkan <span className="text-blue-600">Ekosistem</span> Sekolah Anda
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Platform manajemen sekolah terpadu dengan akses berbasis peran untuk administrator, guru, siswa, dan orang tua. Tingkatkan efisiensi dan transparansi pendidikan sekarang.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                Hubungi Kami
              </Link>
              <Link href="/demo" className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                <PlayCircle className="h-5 w-5 text-slate-500" />
                Demo Sistem
              </Link>
            </div>

            {/* Social Proof */}
            <div className="mt-12 flex flex-col items-center justify-center gap-4 border-t border-slate-200 pt-8 sm:flex-row">
              <div className="flex -space-x-3">
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
                <img className="inline-block h-10 w-10 rounded-full ring-2 ring-white" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Avatar" />
              </div>
              <p className="text-sm font-medium text-slate-600 text-left">
                Dipercaya oleh <span className="font-bold text-slate-900">500+ Sekolah</span><br/>
                di seluruh Indonesia
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="bg-white py-24 sm:py-32">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold leading-7 text-blue-600 uppercase tracking-wider">Fitur Unggulan</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Modul Lengkap untuk Sekolah Modern</p>
              <p className="mt-6 text-lg leading-8 text-slate-600">Satu sistem terintegrasi untuk menangani seluruh aspek operasional sekolah Anda, dari akademik hingga keuangan dengan keamanan tingkat tinggi.</p>
            </div>

            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-4">
                
                {/* Feature 1 */}
                <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition-shadow">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <dl>
                    <dt className="text-xl font-semibold leading-7 text-slate-900">Akademik Terpadu</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">Kelola kurikulum, jadwal pelajaran, nilai, dan rapor siswa dalam satu platform yang mudah diakses oleh guru.</p>
                    </dd>
                  </dl>
                </div>

                {/* Feature 2 */}
                <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition-shadow">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <dl>
                    <dt className="text-xl font-semibold leading-7 text-slate-900">Manajemen Keuangan</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">Otomatisasi tagihan SPP, pembayaran online gateway, dan pelaporan keuangan yang transparan dan akurat.</p>
                    </dd>
                  </dl>
                </div>

                {/* Feature 3 */}
                <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition-shadow">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <Clock className="h-6 w-6 text-purple-600" />
                  </div>
                  <dl>
                    <dt className="text-xl font-semibold leading-7 text-slate-900">Presensi Real-time</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">Pantau kehadiran siswa dan staf secara real-time dengan integrasi mesin fingerprint atau aplikasi mobile GPS.</p>
                    </dd>
                  </dl>
                </div>

                {/* Feature 4 */}
                <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-lg transition-shadow">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100">
                    <BarChart3 className="h-6 w-6 text-orange-600" />
                  </div>
                  <dl>
                    <dt className="text-xl font-semibold leading-7 text-slate-900">Laporan Cerdas</dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                      <p className="flex-auto">Dashboard analitik komprehensif untuk membantu kepala sekolah mengambil keputusan strategis berbasis data.</p>
                    </dd>
                  </dl>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-blue-50 py-16">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:divide-x divide-slate-200">
              <div className="flex flex-col items-center justify-center p-4">
                <span className="text-4xl font-extrabold text-blue-600">150+</span>
                <span className="mt-2 text-sm font-medium text-slate-600">Sekolah Mitra</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-t border-slate-200 md:border-t-0">
                <span className="text-4xl font-extrabold text-blue-600">50k+</span>
                <span className="mt-2 text-sm font-medium text-slate-600">Siswa Aktif</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-t border-slate-200 md:border-t-0">
                <span className="text-4xl font-extrabold text-blue-600">99.9%</span>
                <span className="mt-2 text-sm font-medium text-slate-600">Uptime Server</span>
              </div>
              <div className="flex flex-col items-center justify-center p-4 border-t border-slate-200 md:border-t-0">
                <span className="text-4xl font-extrabold text-blue-600">24/7</span>
                <span className="mt-2 text-sm font-medium text-slate-600">Dukungan Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-24 border-b border-slate-200">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-slate-900 px-6 py-24 text-center shadow-2xl rounded-3xl sm:px-16">
              <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Siap Mentransformasi Sekolah Anda?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                Bergabunglah dengan ratusan sekolah yang telah beralih ke sistem digital kami. Jadwalkan demo gratis hari ini tanpa komitmen.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/demo" className="rounded-md bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors">
                  Jadwalkan Demo Gratis
                </Link>
                <Link href="/sales" className="text-base font-semibold leading-6 text-white hover:text-blue-300 transition-colors">
                  Hubungi Sales <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
              {/* Optional background decoration for CTA */}
              <svg viewBox="0 0 1024 1024" className="absolute top-1/2 left-1/2 -z-10 h-256 w-5xl -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]" aria-hidden="true">
                <circle cx="512" cy="512" r="512" fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7"></circle>
                <defs>
                  <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                    <stop stopColor="#0061ff"></stop>
                    <stop offset="1" stopColor="#0061ff"></stop>
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">SIAKAD <span className="text-blue-600">Plus</span></span>
              </div>
              <p className="text-sm text-slate-600 mb-6">
                Solusi manajemen sekolah #1 di Indonesia yang terpercaya, aman, dan mudah digunakan.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-blue-600 transition-colors" aria-label="Twitter"><Twitter className="h-5 w-5"/></a>
                <a href="#" className="text-slate-400 hover:text-pink-600 transition-colors" aria-label="Instagram"><Instagram className="h-5 w-5"/></a>
                <a href="#" className="text-slate-400 hover:text-blue-800 transition-colors" aria-label="Linkedin"><Linkedin className="h-5 w-5"/></a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Produk</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Fitur Utama</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Untuk Guru</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Untuk Siswa</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Integrasi</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Perusahaan</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Tentang Kami</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Karir</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Kontak</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Kebijakan Privasi</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Syarat Ketentuan</Link></li>
                <li><Link href="#" className="text-sm text-slate-600 hover:text-blue-600 transition-colors">Keamanan</Link></li>
              </ul>
            </div>

          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2026 SIAKAD Plus. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">
               Jakarta, Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
