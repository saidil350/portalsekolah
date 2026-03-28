"use client";

import Link from "next/link";
import {
  PlayCircle,
  BookOpen,
  Wallet,
  Clock,
  BarChart3,
  Twitter,
  Instagram,
  Linkedin,
  Check,
  X,
  Star,
  HelpCircle,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Target,
  Rocket,
  Heart,
  Award,
  Code,
  MessageCircle,
  Handshake,
  Briefcase,
  TrendingUp,
  Shield,
  Zap,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/animations/AnimatedSection";
import CounterAnimation from "@/components/animations/CounterAnimation";
import CardHover from "@/components/animations/CardHover";
import TextReveal from "@/components/animations/TextReveal";
import FloatingElements from "@/components/animations/FloatingElements";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Floating Background Elements */}
      <FloatingElements />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
        >
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              SIAKAD <span className="text-blue-600">Plus</span>
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Fitur", "Harga", "Tentang Kami"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
            >
              Login
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Daftar Sekolah
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-12 sm:pt-20 sm:pb-16 lg:pb-20">
          {/* Background decoration */}
          <motion.div
            className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:-top-80 sm:ml-16 sm:translate-x-0"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.3, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            aria-hidden="true"
          >
            <div
              className="aspect-1097/845 w-274.25 bg-linear-to-tr from-[#ff4694] to-[#776fff] opacity-20"
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
            ></div>
          </motion.div>

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <AnimatedSection>
              <motion.div
                className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-8"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <motion.span
                  className="flex h-2 w-2 rounded-full bg-blue-600"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.7, 1],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                  }}
                ></motion.span>
                V0.2.0 Tech Preview
              </motion.div>
            </AnimatedSection>

            <TextReveal
              className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
              delay={0.2}
            >
              Digitalkan Ekosistem Sekolah Anda
            </TextReveal>

            <AnimatedSection delay={0.4} className="mx-auto mt-6 max-w-2xl">
              <p className="text-lg leading-8 text-slate-600">
                Platform manajemen sekolah terpadu dengan akses berbasis peran
                untuk administrator, guru, siswa, dan orang tua. Tingkatkan
                efisiensi dan transparansi pendidikan sekarang.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.6} className="mt-10">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    href="/contact"
                    className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-lg bg-blue-600 px-8 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                  >
                    Hubungi Kami
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href="/demo"
                    className="inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-8 py-3 text-base font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <PlayCircle className="h-5 w-5 text-slate-500" />
                    Demo Sistem
                  </Link>
                </motion.div>
              </div>
            </AnimatedSection>

            {/* Social Proof */}
            <AnimatedSection delay={0.8} className="mt-12">
              <div className="flex flex-col items-center justify-center gap-4 border-t border-slate-200 pt-8 sm:flex-row">
                <motion.div
                  className="flex -space-x-3"
                  whileHover={{ x: -4 }}
                >
                  {[1, 2, 3, 4].map((i) => (
                    <motion.img
                      key={i}
                      className="inline-block h-10 w-10 rounded-full ring-2 ring-white"
                      src={`https://images.unsplash.com/photo-${[
                        "1544005313-94ddf0286df2",
                        "1506794778202-cad84cf45f1d",
                        "1494790108377-be9c29b29330",
                        "1534528741775-53994a69daeb",
                      ][i - 1]}?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                      alt="Avatar"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                    />
                  ))}
                </motion.div>
                <p className="text-sm font-medium text-slate-600 text-left">
                  Dipercaya oleh{" "}
                  <span className="font-bold text-slate-900">500+ Sekolah</span>
                  <br />
                  di seluruh Indonesia
                </p>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Features Section */}
        <section id="fitur" className="bg-white py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <h2 className="text-sm font-semibold leading-7 text-blue-600 uppercase tracking-wider">
                Fitur Unggulan
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Modul Lengkap untuk Sekolah Modern
              </p>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Satu sistem terintegrasi untuk menangani seluruh aspek operasional
                sekolah Anda, dari akademik hingga keuangan dengan keamanan
                tingkat tinggi.
              </p>
            </AnimatedSection>

            <div className="mx-auto mt-12 max-w-2xl sm:mt-16 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-6 gap-y-8 lg:max-w-none lg:grid-cols-4">
                {[
                  {
                    icon: BookOpen,
                    title: "Akademik Terpadu",
                    desc: "Kelola kurikulum, jadwal pelajaran, nilai, dan rapor siswa dalam satu platform yang mudah diakses oleh guru.",
                    color: "blue",
                  },
                  {
                    icon: Wallet,
                    title: "Manajemen Keuangan",
                    desc: "Otomatisasi tagihan SPP, pembayaran online gateway, dan pelaporan keuangan yang transparan dan akurat.",
                    color: "green",
                  },
                  {
                    icon: Clock,
                    title: "Presensi Real-time",
                    desc: "Pantau kehadiran siswa dan staf secara real-time dengan integrasi mesin fingerprint atau aplikasi mobile GPS.",
                    color: "purple",
                  },
                  {
                    icon: BarChart3,
                    title: "Laporan Cerdas",
                    desc: "Dashboard analitik komprehensif untuk membantu kepala sekolah mengambil keputusan strategis berbasis data.",
                    color: "orange",
                  },
                ].map((feature, index) => (
                  <AnimatedSection
                    key={feature.title}
                    delay={index * 0.1}
                    direction="up"
                  >
                    <CardHover
                      scale={1.05}
                      glowColor={`rgba(${
                        feature.color === "blue"
                          ? "59, 130, 246"
                          : feature.color === "green"
                          ? "16, 185, 129"
                          : feature.color === "purple"
                          ? "139, 92, 246"
                          : "249, 115, 22"
                      }, 0.3)`}
                    >
                      <div className="relative flex flex-col rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
                        <motion.div
                          className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor:
                              feature.color === "blue"
                                ? "rgb(239, 246, 255)"
                                : feature.color === "green"
                                ? "rgb(236, 253, 245)"
                                : feature.color === "purple"
                                ? "rgb(250, 245, 255)"
                                : "rgb(255, 237, 213)",
                          }}
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <feature.icon
                            className="h-6 w-6"
                            style={{
                              color:
                                feature.color === "blue"
                                  ? "rgb(37, 99, 235)"
                                  : feature.color === "green"
                                  ? "rgb(5, 150, 105)"
                                  : feature.color === "purple"
                                  ? "rgb(147, 51, 234)"
                                  : "rgb(234, 88, 12)",
                            }}
                          />
                        </motion.div>
                        <dl>
                          <dt className="text-xl font-semibold leading-7 text-slate-900">
                            {feature.title}
                          </dt>
                          <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                            <p className="flex-auto">{feature.desc}</p>
                          </dd>
                        </dl>
                      </div>
                    </CardHover>
                  </AnimatedSection>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-blue-50 py-10">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 md:divide-x divide-slate-200">
              {[
                { value: 150, suffix: "+", label: "Sekolah Mitra" },
                { value: 50, suffix: "k+", label: "Siswa Aktif" },
                { value: 99.9, suffix: "%", label: "Uptime Server", decimals: 1 },
                { value: 24, suffix: "/7", label: "Dukungan Support" },
              ].map((stat, index) => (
                <AnimatedSection key={stat.label} delay={index * 0.1}>
                  <div className="flex flex-col items-center justify-center p-4">
                    <CounterAnimation
                      end={stat.value}
                      suffix={stat.suffix}
                      decimals={stat.decimals || 0}
                      className="text-4xl font-extrabold text-blue-600"
                      duration={2}
                    />
                    <span className="mt-2 text-sm font-medium text-slate-600">
                      {stat.label}
                    </span>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="harga" className="bg-slate-50 py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-600 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-green-600"></span>
                Transparan & Terjangkau
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Pilih Paket yang Sesuai Kebutuhan Sekolah Anda
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Investasi cerdas untuk transformasi digital pendidikan. Tanpa
                biaya tersembunyi, fleksibel, dan dapat disesuaikan.
              </p>
            </AnimatedSection>

            {/* Pricing Cards */}
            <div className="mx-auto mt-12 grid max-w-lg grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-3">
              {/* Basic Plan */}
              <AnimatedSection delay={0.1} direction="up">
                <CardHover>
                  <div className="flex flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold leading-7 text-slate-900">
                        Basic
                      </h3>
                      <p className="mt-4 text-sm text-slate-600">
                        Cocok untuk sekolah kecil yang baru memulai digitalisasi
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-slate-900">
                          Rp 499rb
                        </span>
                        <span className="text-sm font-semibold leading-6 text-slate-600">
                          /bulan
                        </span>
                      </p>
                    </div>
                    <ul role="list" className="space-y-4 flex-1">
                      {[
                        { text: "50 Siswa", included: true },
                        { text: "5 Guru", included: true },
                        { text: "2 Admin", included: true },
                        { text: "Manajemen Data Akademik Dasar", included: true },
                        { text: "Absensi Online", included: true },
                        { text: "Generate Raport", included: true },
                        { text: "Manajemen Keuangan", included: false },
                        { text: "Mobile App", included: false },
                      ].map((item) => (
                        <li
                          key={item.text}
                          className="flex gap-x-3 text-sm leading-6 text-slate-600"
                        >
                          {item.included ? (
                            <Check
                              className="h-6 w-5 flex-none text-green-600"
                              aria-hidden="true"
                            />
                          ) : (
                            <X
                              className="h-6 w-5 flex-none text-slate-400"
                              aria-hidden="true"
                            />
                          )}
                          {item.text}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className="mt-8 block rounded-xl bg-slate-100 px-3.5 py-2.5 text-center text-sm font-semibold leading-6 text-slate-900 hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-colors"
                    >
                      Mulai Sekarang
                    </Link>
                    <p className="mt-4 text-xs text-center text-slate-500">
                      Ideal untuk SD/SMP kecil
                    </p>
                  </div>
                </CardHover>
              </AnimatedSection>

              {/* Professional Plan - Most Popular */}
              <AnimatedSection delay={0.2} direction="up">
                <CardHover
                  scale={1.08}
                  glowColor="rgba(37, 99, 235, 0.4)"
                  glowOpacity={0.4}
                >
                  <div className="flex flex-col rounded-3xl bg-white p-8 shadow-xl ring-2 ring-blue-600 hover:shadow-2xl transition-shadow duration-300 relative">
                    {/* Popular Badge */}
                    <motion.div
                      className="absolute -top-4 left-1/2 -translate-x-1/2"
                      animate={{
                        y: [0, -5, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-sm font-semibold leading-5 text-white shadow-lg">
                        <Star className="h-4 w-4 fill-white" />
                        POPULER
                      </span>
                    </motion.div>

                    <div className="mb-6 pt-2">
                      <h3 className="text-xl font-semibold leading-7 text-slate-900">
                        Professional
                      </h3>
                      <p className="mt-4 text-sm text-slate-600">
                        Untuk sekolah menengah yang membutuhkan fitur lengkap
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-blue-600">
                          Rp 1.499rb
                        </span>
                        <span className="text-sm font-semibold leading-6 text-slate-600">
                          /bulan
                        </span>
                      </p>
                    </div>
                    <ul role="list" className="space-y-4 flex-1">
                      {[
                        { text: "500 Siswa", bold: true },
                        { text: "50 Guru", bold: true },
                        { text: "10 Admin", bold: true },
                        { text: "Semua fitur Basic", bold: false },
                        { text: "Manajemen Keuangan", bold: true },
                        { text: "Jadwal & Roster", bold: true },
                        { text: "Inventory Management", bold: true },
                        { text: "Mobile App untuk Guru & Siswa", bold: true },
                        { text: "Email Support", bold: false },
                      ].map((item) => (
                        <li
                          key={item.text}
                          className="flex gap-x-3 text-sm leading-6 text-slate-600"
                        >
                          <Check
                            className="h-6 w-5 flex-none text-green-600"
                            aria-hidden="true"
                          />
                          {item.bold ? (
                            <strong>{item.text}</strong>
                          ) : (
                            item.text
                          )}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/register"
                      className="mt-8 block rounded-xl bg-blue-600 px-3.5 py-2.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                      Mulai Sekarang
                    </Link>
                    <p className="mt-4 text-xs text-center text-blue-600 font-semibold">
                      Paling laku untuk SMA/SMK
                    </p>
                  </div>
                </CardHover>
              </AnimatedSection>

              {/* Enterprise Plan */}
              <AnimatedSection delay={0.3} direction="up">
                <CardHover>
                  <div className="flex flex-col rounded-3xl bg-linear-to-b from-slate-900 to-slate-800 p-8 shadow-xl hover:shadow-2xl transition-shadow duration-300">
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold leading-5 text-white">
                          PREMIUM
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold leading-7 text-white">
                        Enterprise
                      </h3>
                      <p className="mt-4 text-sm text-slate-300">
                        Untuk sekolah besar dengan kebutuhan kustom
                      </p>
                      <p className="mt-6 flex items-baseline gap-x-1">
                        <span className="text-4xl font-bold tracking-tight text-white">
                          Custom
                        </span>
                      </p>
                    </div>
                    <ul role="list" className="space-y-4 flex-1">
                      {[
                        "Unlimited Siswa & Guru",
                        "Unlimited Admin",
                        "Semua fitur Professional",
                        "Dedicated Server",
                        "Custom Domain (siap.sekolah.sch.id)",
                        "White Label (Logo Sekolah Sendiri)",
                        "API Access",
                        "Priority Support 24/7",
                        "On-site Training",
                      ].map((item) => (
                        <li
                          key={item}
                          className="flex gap-x-3 text-sm leading-6 text-slate-300"
                        >
                          <CheckCircle2
                            className="h-6 w-5 flex-none text-purple-400"
                            aria-hidden="true"
                          />
                          <strong className="text-white">{item}</strong>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/contact"
                      className="mt-8 block rounded-xl bg-purple-600 px-3.5 py-2.5 text-center text-sm font-semibold leading-6 text-white shadow-sm hover:bg-purple-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 transition-colors"
                    >
                      Hubungi Sales
                    </Link>
                    <p className="mt-4 text-xs text-center text-slate-400">
                      Solusi enterprise untuk sekolah top
                    </p>
                  </div>
                </CardHover>
              </AnimatedSection>
            </div>

            {/* Trust Elements */}
            <AnimatedSection delay={0.4} className="mt-12">
              <div className="flex flex-col items-center justify-center gap-6 text-center">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
                  {[
                    "14 hari free trial",
                    "Tanpa kartu kredit",
                    "Cancel anytime",
                    "Uang kembali jika tidak puas",
                  ].map((text, index) => (
                    <motion.div
                      key={text}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>{text}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* FAQ Section */}
            <AnimatedSection delay={0.5} className="mx-auto mt-12 max-w-3xl">
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
                Pertanyaan Umum
              </h3>
              <div className="space-y-4">
                {[
                  {
                    q: "Apakah bisa upgrade paket?",
                    a: "Ya, Anda bisa upgrade paket kapan saja. Biaya akan dihitung secara prorata berdasarkan sisa masa berlangganan.",
                  },
                  {
                    q: "Apakah ada biaya setup?",
                    a: "Tidak ada biaya setup untuk paket Basic dan Professional. Untuk Enterprise, biaya setup akan didiskusikan bersama tim kami.",
                  },
                  {
                    q: "Bagaimana cara pembayaran?",
                    a: "Kami menerima pembayaran melalui transfer bank, kartu kredit, dan e-wallet. Invoice akan dikirim setiap bulan atau tahunan sesuai preferensi Anda.",
                  },
                  {
                    q: "Apakah data sekolah aman?",
                    a: "Sangat aman. Kami menggunakan enkripsi SSL 256-bit, backup harian, dan server berlokasi di Indonesia dengan keamanan tingkat enterprise.",
                  },
                ].map((faq, index) => (
                  <AnimatedSection key={faq.q} delay={0.6 + index * 0.1}>
                    <motion.div
                      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex items-start gap-4">
                        <HelpCircle className="h-6 w-6 text-blue-600 shrink-0 mt-1" />
                        <div>
                          <h4 className="font-semibold text-slate-900 mb-2">
                            {faq.q}
                          </h4>
                          <p className="text-sm text-slate-600">{faq.a}</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            {/* Consultation CTA */}
            <AnimatedSection delay={1} className="mt-12">
              <motion.div
                className="rounded-3xl bg-blue-50 p-8 text-center"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Bingung Pilih Paket?
                </h3>
                <p className="text-slate-600 mb-6">
                  Konsultasikan kebutuhan sekolah Anda dengan tim kami. Kami
                  siap membantu menemukan solusi terbaik.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Konsultasi Gratis
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <a
                      href="https://wa.me/6281234567890"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-green-600 px-6 py-3 text-base font-semibold text-green-600 hover:bg-green-50 transition-colors"
                    >
                      WhatsApp Kami
                    </a>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* About Section */}
        <section id="tentang" className="bg-white py-16 sm:py-20">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <AnimatedSection className="mx-auto max-w-2xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-600 mb-8">
                <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
                Tentang SIAKAD Plus
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Membangun Masa Depan Pendidikan Indonesia
              </h2>
              <p className="mt-6 text-lg leading-8 text-slate-600">
                Kami berkomitmen untuk mentransformasi sistem pendidikan
                Indonesia melalui teknologi yang inovatif, terjangkau, dan mudah
                digunakan.
              </p>
            </AnimatedSection>

            {/* Vision & Mission */}
            <div className="mx-auto mt-12 grid max-w-lg grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-2">
              {/* Vision */}
              <AnimatedSection delay={0.1} direction="left">
                <motion.div
                  className="flex flex-col rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 p-8 shadow-sm ring-1 ring-blue-200"
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Target className="h-6 w-6 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    Visi Kami
                  </h3>
                  <p className="text-base leading-7 text-slate-700">
                    Menjadi platform manajemen sekolah terdepan yang
                    mendemokratisasi akses teknologi pendidikan di Indonesia dan
                    memberdayakan 10.000 sekolah untuk digital transformation.
                  </p>
                </motion.div>
              </AnimatedSection>

              {/* Mission */}
              <AnimatedSection delay={0.2} direction="right">
                <motion.div
                  className="flex flex-col rounded-2xl bg-linear-to-br from-green-50 to-emerald-50 p-8 shadow-sm ring-1 ring-green-200"
                  whileHover={{ y: -10 }}
                >
                  <motion.div
                    className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-green-600"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Rocket className="h-6 w-6 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">
                    Misi Kami
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Digitalisasi 10.000 sekolah di seluruh Indonesia",
                      "Menyediakan solusi terjangkau untuk semua jenjang pendidikan",
                      "Membangun ekosistem pendidikan yang terintegrasi",
                      "Memberdayakan guru dengan teknologi modern",
                    ].map((item, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 text-base text-slate-700"
                      >
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </motion.div>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatedSection>
            </div>

            {/* Core Values */}
            <AnimatedSection delay={0.3} className="mx-auto mt-12">
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-8">
                Nilai-Nilai Utama Kami
              </h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    icon: Zap,
                    color: "blue",
                    title: "Inovasi",
                    desc: "Terus berinovasi untuk pendidikan lebih baik",
                  },
                  {
                    icon: Shield,
                    color: "green",
                    title: "Integritas",
                    desc: "Transparansi dan kepercayaan adalah prioritas",
                  },
                  {
                    icon: Heart,
                    color: "purple",
                    title: "Kolaborasi",
                    desc: "Bersama memajukan pendidikan Indonesia",
                  },
                  {
                    icon: Award,
                    color: "orange",
                    title: "Kualitas",
                    desc: "Standar tinggi untuk setiap fitur",
                  },
                ].map((value, index) => (
                  <AnimatedSection key={value.title} delay={index * 0.1}>
                    <motion.div
                      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow text-center"
                      whileHover={{ y: -10, scale: 1.05 }}
                    >
                      <motion.div
                        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
                        style={{
                          backgroundColor:
                            value.color === "blue"
                              ? "rgb(239, 246, 255)"
                              : value.color === "green"
                              ? "rgb(236, 253, 245)"
                              : value.color === "purple"
                              ? "rgb(250, 245, 255)"
                              : "rgb(255, 237, 213)",
                        }}
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <value.icon
                          className="h-7 w-7"
                          style={{
                            color:
                              value.color === "blue"
                                ? "rgb(37, 99, 235)"
                                : value.color === "green"
                                ? "rgb(5, 150, 105)"
                                : value.color === "purple"
                                ? "rgb(147, 51, 234)"
                                : "rgb(234, 88, 12)",
                          }}
                        />
                      </motion.div>
                      <h4 className="text-lg font-bold text-slate-900 mb-2">
                        {value.title}
                      </h4>
                      <p className="text-sm text-slate-600">{value.desc}</p>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            {/* Team Section */}
            <AnimatedSection delay={0.4} className="mx-auto mt-12">
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-4">
                Tim Pendiri
              </h3>
              <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                Dipimpin oleh profesional berpengalaman di bidang teknologi dan
                pendidikan
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {[
                  { name: "Andi Susanto", role: "CEO & Founder", bio: "15 tahun pengalaman di EdTech", initials: "AS", color: "blue" },
                  { name: "Maya Wijaya", role: "CTO", bio: "Ex-Software Engineer at Google", initials: "MW", color: "purple" },
                  { name: "Budi Rahardjo", role: "Head of Product", bio: "10 tahun di product development", initials: "BR", color: "green" },
                  { name: "Sari Nurul", role: "Head of Customer Success", bio: "Former Principal at International School", initials: "SN", color: "orange" },
                  { name: "Dewi Pratiwi", role: "Head of Operations", bio: "MBA from Stanford University", initials: "DP", color: "pink" },
                ].map((member, index) => (
                  <AnimatedSection key={member.name} delay={index * 0.1}>
                    <motion.div
                      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md transition-shadow text-center"
                      whileHover={{ y: -10, scale: 1.05 }}
                    >
                      <motion.div
                        className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-linear-to-br text-white text-2xl font-bold"
                        style={{
                          backgroundColor: member.color === "blue" ? "rgb(37, 99, 235)" :
                                         member.color === "purple" ? "rgb(147, 51, 234)" :
                                         member.color === "green" ? "rgb(5, 150, 105)" :
                                         member.color === "orange" ? "rgb(234, 88, 12)" :
                                         "rgb(219, 39, 119)"
                        }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                      >
                        {member.initials}
                      </motion.div>
                      <h4 className="text-base font-bold text-slate-900">
                        {member.name}
                      </h4>
                      <p
                        className="text-sm font-semibold mb-2"
                        style={{
                          color:
                            member.color === "blue"
                              ? "rgb(37, 99, 235)"
                              : member.color === "purple"
                              ? "rgb(147, 51, 234)"
                              : member.color === "green"
                              ? "rgb(5, 150, 105)"
                              : member.color === "orange"
                              ? "rgb(234, 88, 12)"
                              : "rgb(219, 39, 119)",
                        }}
                      >
                        {member.role}
                      </p>
                      <p className="text-xs text-slate-600">{member.bio}</p>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            {/* Tech Stack */}
            <AnimatedSection delay={0.5} className="mx-auto mt-12">
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-4">
                Teknologi Kami
              </h3>
              <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                Dibangun dengan teknologi terkini untuk performa dan keamanan
                terbaik
              </p>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { icon: Code, name: "Next.js 16", desc: "React Framework", color: "blue" },
                  { icon: Shield, name: "Supabase", desc: "Database & Auth", color: "green" },
                  { icon: TrendingUp, name: "TypeScript", desc: "Type Safety", color: "blue" },
                  { icon: Zap, name: "Tailwind CSS", desc: "Styling", color: "cyan" },
                  { icon: Globe, name: "Vercel", desc: "Hosting", color: "purple" },
                  { icon: Users, name: "Server ID", desc: "Indonesia", color: "orange" },
                ].map((tech, index) => (
                  <AnimatedSection key={tech.name} delay={index * 0.1}>
                    <motion.div
                      className="rounded-xl bg-slate-50 p-4 text-center hover:bg-slate-100 transition-colors"
                      whileHover={{ y: -5, scale: 1.05 }}
                    >
                      <motion.div
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        transition={{ duration: 0.5 }}
                      >
                        <tech.icon
                          className="h-8 w-8 mx-auto mb-2"
                          style={{
                            color:
                              tech.color === "blue"
                                ? "rgb(37, 99, 235)"
                                : tech.color === "green"
                                ? "rgb(5, 150, 105)"
                                : tech.color === "cyan"
                                ? "rgb(6, 182, 212)"
                                : tech.color === "purple"
                                ? "rgb(147, 51, 234)"
                                : "rgb(234, 88, 12)",
                          }}
                        />
                      </motion.div>
                      <p className="text-sm font-semibold text-slate-900">
                        {tech.name}
                      </p>
                      <p className="text-xs text-slate-600">{tech.desc}</p>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            {/* Testimonials */}
            <AnimatedSection delay={0.6} className="mx-auto mt-12">
              <h3 className="text-2xl font-bold text-slate-900 text-center mb-4">
                Apa Kata Mereka?
              </h3>
              <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                Testimonial dari sekolah-sekolah yang telah menggunakan SIAKAD
                Plus
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    name: "Drs. Rudi Hartono",
                    role: "Kepala SDN 1 Jakarta",
                    initials: "DR",
                    color: "blue",
                    text: "SIAKAD Plus sangat membantu sekolah kami dalam digitalisasi. Guru-guru jadi lebih efisien dalam mengelola nilai dan absensi.",
                  },
                  {
                    name: "Dr. Ahmad Anshori",
                    role: "Kepala SMA Islam Al-Azhar",
                    initials: "AA",
                    color: "green",
                    text: "Sistem yang sangat user-friendly. Orang tua siswa pun bisa memantau perkembangan anak dengan mudah.",
                  },
                  {
                    name: "Ir. Priyanto",
                    role: "Kepala SMK Telkom Jakarta",
                    initials: "IP",
                    color: "purple",
                    text: "Support team yang sangat responsif. Setiap kendala selalu diselesaikan dengan cepat dan solutif.",
                  },
                  {
                    name: "Maria Yuliana",
                    role: "Kepala SMP Santo Yosef",
                    initials: "MY",
                    color: "orange",
                    text: "Investasi terbaik untuk sekolah kami. Sistem ini membantu menghemat waktu dan biaya operasional.",
                  },
                ].map((testimonial, index) => (
                  <AnimatedSection key={testimonial.name} delay={index * 0.1}>
                    <motion.div
                      className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                      whileHover={{ y: -10, scale: 1.02 }}
                    >
                      <div className="flex items-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <MotionStar
                            key={star}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                      <MessageCircle
                        className="h-8 w-8 mb-3"
                        style={{
                          color:
                            testimonial.color === "blue"
                              ? "rgb(191, 219, 254)"
                              : testimonial.color === "green"
                              ? "rgb(187, 247, 208)"
                              : testimonial.color === "purple"
                              ? "rgb(233, 213, 255)"
                              : "rgb(253, 186, 116)",
                        }}
                      />
                      <p className="text-sm text-slate-700 mb-4 italic">
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-full text-white font-bold text-sm"
                          style={{
                            backgroundColor:
                              testimonial.color === "blue"
                                ? "rgb(37, 99, 235)"
                                : testimonial.color === "green"
                                ? "rgb(5, 150, 105)"
                                : testimonial.color === "purple"
                                ? "rgb(147, 51, 234)"
                                : "rgb(234, 88, 12)",
                          }}
                        >
                          {testimonial.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {testimonial.name}
                          </p>
                          <p className="text-xs text-slate-600">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatedSection>
                ))}
              </div>
            </AnimatedSection>

            {/* Achievements */}
            <AnimatedSection delay={0.7} className="mx-auto mt-12">
              <motion.div
                className="rounded-3xl bg-linear-to-br from-blue-600 to-indigo-700 p-8 text-center text-white shadow-xl"
                whileHover={{ scale: 1.02 }}
              >
                <h3 className="text-2xl font-bold mb-8">
                  Penghargaan & Sertifikasi
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  {[
                    {
                      icon: Award,
                      color: "yellow",
                      title: "Best EdTech Startup 2024",
                      desc: "Tech Indonesia Awards",
                    },
                    {
                      icon: Shield,
                      color: "green",
                      title: "ISO 27001 Certified",
                      desc: "Information Security",
                    },
                    {
                      icon: CheckCircle2,
                      color: "emerald",
                      title: "Data Protection Compliant",
                      desc: "GDPR & PDPA Standards",
                    },
                  ].map((achievement, index) => (
                    <motion.div
                      key={achievement.title}
                      className="flex items-center justify-center gap-3"
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <achievement.icon
                        className="h-10 w-10 shrink-0"
                        style={{
                          color:
                            achievement.color === "yellow"
                              ? "rgb(250, 204, 21)"
                              : achievement.color === "green"
                              ? "rgb(134, 239, 172)"
                              : "rgb(52, 211, 153)",
                        }}
                      />
                      <div className="text-left">
                        <p className="font-bold">{achievement.title}</p>
                        <p className="text-sm text-blue-100">
                          {achievement.desc}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatedSection>

            {/* Career CTA */}
            <AnimatedSection delay={0.8} className="mx-auto mt-12">
              <motion.div
                className="rounded-3xl bg-slate-50 p-8 text-center ring-1 ring-slate-200"
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Briefcase className="h-12 w-12 mx-auto mb-4 text-blue-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  Ingin Bergabung dengan Tim Kami?
                </h3>
                <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                  Kami selalu mencari talenta terbaik yang bersemangat untuk
                  memajukan pendidikan Indonesia.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/careers"
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      Lihat Lowongan Karir
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/contact"
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 px-6 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5" />
                      Hubungi HR
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-white py-16 border-b border-slate-200">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <motion.div
                className="relative isolate overflow-hidden bg-slate-900 px-6 py-16 text-center shadow-2xl rounded-3xl sm:px-12"
                whileHover={{ scale: 1.01 }}
              >
                <motion.div
                  className="absolute top-1/2 left-1/2 -z-10 h-256 w-5xl -translate-x-1/2 mask-[radial-gradient(closest-side,white,transparent)]"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.7, 1, 0.7],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <svg
                    viewBox="0 0 1024 1024"
                    className="h-full w-full"
                    aria-hidden="true"
                  >
                    <circle
                      cx="512"
                      cy="512"
                      r="512"
                      fill="url(#gradient)"
                      fillOpacity="0.7"
                    ></circle>
                    <defs>
                      <radialGradient id="gradient">
                        <stop stopColor="#0061ff"></stop>
                        <stop offset="1" stopColor="#0061ff"></stop>
                      </radialGradient>
                    </defs>
                  </svg>
                </motion.div>

                <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Siap Mentransformasi Sekolah Anda?
                </h2>
                <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
                  Bergabunglah dengan ratusan sekolah yang telah beralih ke
                  sistem digital kami. Jadwalkan demo gratis hari ini tanpa
                  komitmen.
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      href="/demo"
                      className="rounded-md bg-blue-600 px-8 py-3.5 text-base font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
                    >
                      Jadwalkan Demo Gratis
                    </Link>
                  </motion.div>
                  <Link
                    href="/sales"
                    className="text-base font-semibold leading-6 text-white hover:text-blue-300 transition-colors"
                  >
                    Hubungi Sales <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
              <motion.div
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <BookOpen className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  SIAKAD <span className="text-blue-600">Plus</span>
                </span>
              </motion.div>
              <p className="text-sm text-slate-600 mb-6">
                Solusi manajemen sekolah #1 di Indonesia yang terpercaya, aman,
                dan mudah digunakan.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: Twitter, color: "blue", label: "Twitter" },
                  { icon: Instagram, color: "pink", label: "Instagram" },
                  { icon: Linkedin, color: "blue-dark", label: "Linkedin" },
                ].map((social) => (
                  <motion.a
                    key={social.label}
                    href="#"
                    className="text-slate-400 hover:text-blue-600 transition-colors"
                    aria-label={social.label}
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Produk
              </h3>
              <ul className="space-y-3">
                {["Fitur Utama", "Untuk Guru", "Untuk Siswa", "Integrasi"].map(
                  (link) => (
                    <motion.li
                      key={link}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href="#"
                        className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {link}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Perusahaan
              </h3>
              <ul className="space-y-3">
                {["Tentang Kami", "Karir", "Blog", "Kontak"].map((link) => (
                  <motion.li
                    key={link}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      href="#"
                      className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      {link}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {["Kebijakan Privasi", "Syarat Ketentuan", "Keamanan"].map(
                  (link) => (
                    <motion.li
                      key={link}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href="#"
                        className="text-sm text-slate-600 hover:text-blue-600 transition-colors"
                      >
                        {link}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © 2026 SIAKAD Plus. All rights reserved.
            </p>
            <p className="text-sm text-slate-500">Jakarta, Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper component for animated star
function MotionStar(props: any) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        delay: Math.random() * 0.5,
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
    >
      <Star {...props} />
    </motion.div>
  );
}
