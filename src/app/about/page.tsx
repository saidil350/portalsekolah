"use client";

import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Star,
  CheckCircle2,
  Target,
  Rocket,
  Heart,
  Award,
  Code,
  MessageCircle,
  Briefcase,
  TrendingUp,
  Shield,
  Zap,
  Globe,
  Users,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Building,
  Lightbulb,
  Clock,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/animations/AnimatedSection";
import CardHover from "@/components/animations/CardHover";
import TextReveal from "@/components/animations/TextReveal";
import FloatingElements from "@/components/animations/FloatingElements";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Floating Background Elements */}
      <FloatingElements />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md">
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
            <Link href="/" className="text-xl font-bold tracking-tight text-slate-900">
              SIAKAD <span className="text-blue-600">Plus</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {["Beranda", "Fitur", "Harga"].map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link
                  href={item === "Beranda" ? "/" : `/#${item.toLowerCase().replace(" ", "-")}`}
                  className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </Link>
              </motion.div>
            ))}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Link
                href="/about"
                className="text-sm font-medium text-blue-600"
              >
                Tentang Kami
              </Link>
            </motion.div>
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
        {/* Hero Header - Company Identity */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 py-20 sm:py-32">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:32px_32px]" />

          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Company Info */}
              <AnimatedSection direction="right">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white mb-6 backdrop-blur-sm">
                    <Building className="h-4 w-4" />
                    EdTech Company Indonesia
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    Transformasi Digital untuk Pendidikan Indonesia
                  </h1>

                  <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                    SIAKAD Plus adalah platform manajemen sekolah terpadu yang membantu
                    500+ sekolah di Indonesia mendigitalkan seluruh aspek operasional pendidikan.
                  </p>

                  <div className="flex flex-wrap gap-4 mb-8">
                    <div className="flex items-center gap-2 text-white">
                      <MapPin className="h-5 w-5 text-blue-200" />
                      <span>Jakarta Selatan, Indonesia</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Calendar className="h-5 w-5 text-blue-200" />
                      <span>Est. 2021</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                      <Users className="h-5 w-5 text-blue-200" />
                      <span>50+ Tim Kami</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/contact"
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-colors"
                      >
                        Hubungi Kami
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/careers"
                        className="inline-flex items-center gap-2 rounded-xl border-2 border-white px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors"
                      >
                        Bergabung dengan Tim
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatedSection>

              {/* Right: Office Image */}
              <AnimatedSection direction="left" delay={0.2}>
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center">
                    {/* Placeholder for office photo */}
                    <div className="text-center text-white p-8">
                      <Building className="h-24 w-24 mx-auto mb-4 opacity-80" />
                      <p className="text-2xl font-bold mb-2">Kantor Pusat Jakarta</p>
                      <p className="text-blue-100">Modern Office Space</p>
                    </div>
                  </div>

                  {/* Floating Stats Cards */}
                  <motion.div
                    className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                        <Check className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">500+</p>
                        <p className="text-sm text-slate-600">Sekolah Mitra</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">50K+</p>
                        <p className="text-sm text-slate-600">Siswa Aktif</p>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Cerita Kami
              </h2>
              <p className="text-lg text-slate-600">
                Dari ide sederhana hingga menjadi platform manajemen sekolah terpercaya di Indonesia
              </p>
            </AnimatedSection>

            {/* Story Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
              <AnimatedSection direction="right">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white shrink-0">
                      <Lightbulb className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Awal Mula (2021)</h3>
                      <p className="text-slate-600">
                        Didirikan oleh Andi Susanto dan Maya Wijaya dengan visi untuk mendigitalkan
                        sistem manajemen sekolah di Indonesia. Bermula dari pengalaman pribadi
                        melihat banyak sekolah yang masih menggunakan manual processes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-600 text-white shrink-0">
                      <Rocket className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Pertumbuhan Cepat (2022-2023)</h3>
                      <p className="text-slate-600">
                        Dalam 2 tahun pertama, kami berhasil mengembangkan platform komprehensif
                        dan mendapatkan kepercayaan dari 100+ sekolah. Tim kami berkembang dari
                        5 orang menjadi 30 profesional berbakat.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-600 text-white shrink-0">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">Ekspansi Nasional (2024-Sekarang)</h3>
                      <p className="text-slate-600">
                        Kini hadir di 34 provinsi dengan 500+ sekolah mitra. Terpilih sebagai
                        "Best EdTech Startup 2024" dan terus berinovasi untuk memberikan solusi
                        terbaik bagi pendidikan Indonesia.
                      </p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              <AnimatedSection direction="left" delay={0.2}>
                <div className="relative">
                  <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-100 to-slate-200">
                    {/* Placeholder for team photo */}
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center p-8">
                        <Users className="h-32 w-32 mx-auto mb-4 text-slate-400" />
                        <p className="text-xl font-semibold text-slate-600">Tim SIAKAD Plus</p>
                        <p className="text-slate-500">Together We Grow</p>
                      </div>
                    </div>
                  </div>

                  {/* Overlay Quote */}
                  <motion.div
                    className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-lg font-medium text-slate-900 italic mb-2">
                      "Kami percaya bahwa teknologi dapat membuat pendidikan lebih baik dan
                      dapat diakses oleh semua anak Indonesia."
                    </p>
                    <p className="text-sm text-slate-600">— Andi Susanto, CEO & Founder</p>
                  </motion.div>
                </div>
              </AnimatedSection>
            </div>

            {/* Timeline */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl">
                <h3 className="text-2xl font-bold text-slate-900 text-center mb-12">
                  Perjalanan Kami
                </h3>

                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-blue-200 hidden sm:block" />

                  {/* Timeline Items */}
                  <div className="space-y-12">
                    {[
                      {
                        year: "2021",
                        title: "Pendirian Perusahaan",
                        desc: "Didirikan di Jakarta dengan tim 5 orang",
                        icon: Rocket,
                      },
                      {
                        year: "2022 Q1",
                        title: "Rilis Platform V1.0",
                        desc: "Luncur versi pertama dengan modul akademik",
                        icon: Code,
                      },
                      {
                        year: "2022 Q3",
                        title: "100 Sekolah Mitra",
                        desc: "Mencapai milestone 100 sekolah berlangganan",
                        icon: Users,
                      },
                      {
                        year: "2023 Q2",
                        title: "Series A Funding",
                        desc: "Dapat pendanaan untuk ekspansi nasional",
                        icon: TrendingUp,
                      },
                      {
                        year: "2024 Q1",
                        title: "Best EdTech Startup",
                        desc: "Menerima penghargaan Tech Indonesia Awards",
                        icon: Award,
                      },
                      {
                        year: "2024 Q4",
                        title: "500+ Sekolah Mitra",
                        desc: "Kini hadir di 34 provinsi seluruh Indonesia",
                        icon: Globe,
                      },
                    ].map((milestone, index) => (
                      <motion.div
                        key={milestone.year}
                        className="relative flex flex-col sm:flex-row items-center gap-6"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex-1 text-center sm:text-right">
                          <div className="inline-block">
                            <span className="text-sm font-semibold text-blue-600 mb-1 block">
                              {milestone.year}
                            </span>
                            <h4 className="text-lg font-bold text-slate-900 mb-1">
                              {milestone.title}
                            </h4>
                            <p className="text-sm text-slate-600">{milestone.desc}</p>
                          </div>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg z-10 shrink-0">
                          <milestone.icon className="h-5 w-5" />
                        </div>

                        <div className="flex-1 hidden sm:block" />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Visi & Misi
              </h2>
              <p className="text-lg text-slate-600">
                Arah dan tujuan kami untuk masa depan pendidikan Indonesia
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Vision */}
              <AnimatedSection direction="right" delay={0.1}>
                <CardHover>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl p-8 h-full">
                    <motion.div
                      className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 mb-6"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Target className="h-8 w-8 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      Visi Kami
                    </h3>

                    <p className="text-lg text-slate-700 leading-relaxed mb-6">
                      Menjadi platform manajemen sekolah terdepan yang
                      <span className="font-semibold text-blue-600"> mendemokratisasi akses teknologi pendidikan</span> di
                      Indonesia dan memberdayakan 10.000 sekolah untuk transformasi digital.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Platform #1 di Indonesia",
                        "10.000 sekolah mitra",
                        "Cover seluruh provinsi",
                        "Standar internasional",
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHover>
              </AnimatedSection>

              {/* Mission */}
              <AnimatedSection direction="left" delay={0.2}>
                <CardHover>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 h-full">
                    <motion.div
                      className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-600 mb-6"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Rocket className="h-8 w-8 text-white" />
                    </motion.div>

                    <h3 className="text-2xl font-bold text-slate-900 mb-4">
                      Misi Kami
                    </h3>

                    <p className="text-lg text-slate-700 leading-relaxed mb-6">
                      Memberdayakan sekolah dengan teknologi modern yang
                      <span className="font-semibold text-green-600"> terjangkau, mudah digunakan, dan komprehensif</span>.
                    </p>

                    <div className="space-y-3">
                      {[
                        "Digitalisasi 10.000 sekolah",
                        "Solusi terjangkau semua jenjang",
                        "Ekosistem pendidikan terintegrasi",
                        "Memberdayakan guru dengan teknologi",
                        "Support 24/7 untuk semua sekolah",
                      ].map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                          <span className="text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardHover>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Core Values */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Nilai-Nilai Utama Kami
              </h2>
              <p className="text-lg text-slate-300">
                Prinsip yang mengarahkan setiap keputusan dan tindakan kami
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Zap,
                  title: "Inovasi",
                  desc: "Terus berinovasi untuk pendidikan lebih baik. Kami tidak pernah berhenti belajar dan meningkatkan.",
                  color: "yellow",
                },
                {
                  icon: Shield,
                  title: "Integritas",
                  desc: "Transparansi dan kepercayaan adalah prioritas. Kami menjunjung tinggi kejujuran dalam setiap interaksi.",
                  color: "green",
                },
                {
                  icon: Heart,
                  title: "Kolaborasi",
                  desc: "Bersama memajukan pendidikan Indonesia. Kami percaya pada kekuatan kerjasama tim dan mitra.",
                  color: "pink",
                },
                {
                  icon: Award,
                  title: "Kualitas",
                  desc: "Standar tinggi untuk setiap fitur. Kami tidak berkompromi pada kualitas dan pengalaman pengguna.",
                  color: "blue",
                },
              ].map((value, index) => (
                <AnimatedSection key={value.title} delay={index * 0.1}>
                  <motion.div
                    className="bg-slate-800 rounded-2xl p-6 h-full hover:bg-slate-700 transition-colors"
                    whileHover={{ y: -10 }}
                  >
                    <motion.div
                      className="inline-flex h-14 w-14 items-center justify-center rounded-xl mb-4"
                      style={{
                        backgroundColor:
                          value.color === "yellow"
                            ? "rgb(250, 204, 21)"
                            : value.color === "green"
                            ? "rgb(34, 197, 94)"
                            : value.color === "pink"
                            ? "rgb(236, 72, 153)"
                            : "rgb(59, 130, 246)",
                      }}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <value.icon className="h-7 w-7 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      {value.desc}
                    </p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Tim Pemimpin
              </h2>
              <p className="text-lg text-slate-600">
                Profesional berpengalaman yang mengarahkan misi kami
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {[
                {
                  name: "Andi Susanto",
                  role: "CEO & Founder",
                  bio: "15 tahun pengalaman di EdTech. Ex-Google, Stanford MBA.",
                  initials: "AS",
                  color: "blue",
                  linkedin: "#",
                },
                {
                  name: "Maya Wijaya",
                  role: "CTO",
                  bio: "Ex-Software Engineer at Google. 12 tahun di tech industry.",
                  initials: "MW",
                  color: "purple",
                  linkedin: "#",
                },
                {
                  name: "Budi Rahardjo",
                  role: "Head of Product",
                  bio: "10 tahun di product development. Ex-Traveloka.",
                  initials: "BR",
                  color: "green",
                  linkedin: "#",
                },
                {
                  name: "Sari Nurul",
                  role: "Head of Customer Success",
                  bio: "Former Principal at International School. 20 tahun di pendidikan.",
                  initials: "SN",
                  color: "orange",
                  linkedin: "#",
                },
                {
                  name: "Dewi Pratiwi",
                  role: "Head of Operations",
                  bio: "MBA from Stanford. Ex-McKinsey consultant.",
                  initials: "DP",
                  color: "pink",
                  linkedin: "#",
                },
              ].map((member, index) => (
                <AnimatedSection key={member.name} delay={index * 0.1}>
                  <motion.div
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    whileHover={{ y: -10 }}
                  >
                    {/* Photo Placeholder */}
                    <div
                      className="aspect-square flex items-center justify-center"
                      style={{
                        backgroundColor:
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
                      <span className="text-white text-5xl font-bold">
                        {member.initials}
                      </span>
                    </div>

                    <div className="p-6 text-center">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {member.name}
                      </h3>
                      <p
                        className="text-sm font-semibold mb-3"
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
                      <p className="text-sm text-slate-600 mb-4">
                        {member.bio}
                      </p>
                      <motion.a
                        href={member.linkedin}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Linkedin className="h-4 w-4" />
                        LinkedIn
                      </motion.a>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Company Culture */}
        <section className="py-20 bg-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                Budaya Perusahaan
              </h2>
              <p className="text-lg text-slate-600">
                Lingkungan kerja yang mendorong inovasi dan pertumbuhan
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: Users,
                  title: "Team Collaboration",
                  desc: "Kami bekerja dalam tim yang saling mendukung. Setiap ide dihargai dan setiap kontribusi diakui.",
                  items: ["Weekly team bonding", "Cross-functional projects", "Open communication"],
                },
                {
                  icon: Lightbulb,
                  title: "Innovation Culture",
                  desc: "Kami mendorong inovasi dan eksperimen. Gagal adalah bagian dari proses belajar.",
                  items: ["Innovation days", "R&D time allocation", "Idea incubation program"],
                },
                {
                  icon: Heart,
                  title: "Work-Life Balance",
                  desc: "Kami peduli dengan keseimbangan kerja dan hidup. Kesehatan tim adalah prioritas.",
                  items: ["Flexible hours", "Remote work options", "Mental health support"],
                },
              ].map((culture, index) => (
                <AnimatedSection key={culture.title} delay={index * 0.1}>
                  <CardHover>
                    <div className="bg-slate-50 rounded-2xl p-8 h-full">
                      <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-600 mb-6">
                        <culture.icon className="h-7 w-7 text-white" />
                      </div>

                      <h3 className="text-xl font-bold text-slate-900 mb-3">
                        {culture.title}
                      </h3>

                      <p className="text-slate-600 mb-6">
                        {culture.desc}
                      </p>

                      <ul className="space-y-3">
                        {culture.items.map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-sm text-slate-700">
                            <Check className="h-4 w-4 text-green-600 shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardHover>
                </AnimatedSection>
              ))}
            </div>

            {/* Culture Image Grid */}
            <AnimatedSection delay={0.4} className="mt-16">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <motion.div
                    key={item}
                    className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="text-center text-slate-400">
                      <Users className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-sm font-medium">Team Activity {item}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Why Join Us */}
        <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Mengapa Bergabung dengan Kami?
              </h2>
              <p className="text-lg text-blue-100">
                Bangun karir bersama tim yang bersemangat untuk mengubah pendidikan Indonesia
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Rocket,
                  title: "Rapid Growth",
                  desc: "Berkembang bersama perusahaan yang tumbuh 100% YoY",
                },
                {
                  icon: Shield,
                  title: "Competitive Benefits",
                  desc: "Salary di atas pasar, BPJS Kesehatan, bonus performa",
                },
                {
                  icon: Users,
                  title: "Great Team",
                  desc: "Bekerja dengan talenta terbaik dari berbagai latar belakang",
                },
                {
                  icon: Lightbulb,
                  title: "Learning & Development",
                  desc: "Budget training, conference, dan mentorship program",
                },
                {
                  icon: Clock,
                  title: "Flexible Work",
                  desc: "Opsi hybrid working dan jam kerja fleksibel",
                },
                {
                  icon: Heart,
                  title: "Impact",
                  desc: "Dampak nyata pada pendidikan jutaan siswa Indonesia",
                },
              ].map((benefit, index) => (
                <AnimatedSection key={benefit.title} delay={index * 0.1}>
                  <motion.div
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-colors"
                    whileHover={{ y: -5 }}
                  >
                    <benefit.icon className="h-10 w-10 mb-4 text-blue-200" />
                    <h3 className="text-xl font-bold mb-2">{benefit.title}</h3>
                    <p className="text-blue-100 text-sm">{benefit.desc}</p>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={0.6} className="text-center mt-12">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/careers"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-semibold text-blue-600 shadow-lg hover:bg-blue-50 transition-colors"
                >
                  Lihat Posisi Terbuka
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <motion.div
                className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl"
                whileHover={{ scale: 1.01 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                      Ingin Berkolaborasi?
                    </h2>
                    <p className="text-lg text-slate-600 mb-8">
                      Kami selalu terbuka untuk diskusi mengenai potensi kerjasama,
                      investasi, atau media partnership.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Alamat</p>
                          <p className="text-slate-600">Jl. Sudirman No. 123, Jakarta Selatan 12190</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
                          <Mail className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Email</p>
                          <p className="text-slate-600">hello@siakadplus.id</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100">
                          <Phone className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Telepon</p>
                          <p className="text-slate-600">+62 21 1234 5678</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/contact"
                        className="flex flex-col items-center justify-center gap-3 bg-blue-600 text-white rounded-2xl p-6 hover:bg-blue-700 transition-colors h-full"
                      >
                        <MessageCircle className="h-10 w-10" />
                        <span className="font-semibold text-center">Hubungi Kami</span>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Link
                        href="/careers"
                        className="flex flex-col items-center justify-center gap-3 bg-green-600 text-white rounded-2xl p-6 hover:bg-green-700 transition-colors h-full"
                      >
                        <Briefcase className="h-10 w-10" />
                        <span className="font-semibold text-center">Karir</span>
                      </Link>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="https://wa.me/6281234567890"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center justify-center gap-3 bg-emerald-600 text-white rounded-2xl p-6 hover:bg-emerald-700 transition-colors h-full"
                      >
                        <MessageCircle className="h-10 w-10" />
                        <span className="font-semibold text-center">WhatsApp</span>
                      </a>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <a
                        href="#"
                        className="flex flex-col items-center justify-center gap-3 bg-purple-600 text-white rounded-2xl p-6 hover:bg-purple-700 transition-colors h-full"
                      >
                        <Calendar className="h-10 w-10" />
                        <span className="font-semibold text-center">Jadwal Demo</span>
                      </a>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white border-t border-slate-800">
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
                <span className="text-xl font-bold tracking-tight">
                  SIAKAD <span className="text-blue-400">Plus</span>
                </span>
              </motion.div>
              <p className="text-sm text-slate-400 mb-6">
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
                    className="text-slate-400 hover:text-blue-400 transition-colors"
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
              <h3 className="text-sm font-semibold mb-4">Produk</h3>
              <ul className="space-y-3">
                {["Fitur Utama", "Untuk Guru", "Untuk Siswa", "Integrasi"].map(
                  (link) => (
                    <motion.li
                      key={link}
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Link
                        href={link === "Fitur Utama" ? "/#fitur" : "#"}
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Perusahaan</h3>
              <ul className="space-y-3">
                {["Tentang Kami", "Karir", "Blog", "Kontak"].map((link) => (
                  <motion.li
                    key={link}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Link
                      href={link === "Tentang Kami" ? "/about" : "#"}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold mb-4">Legal</h3>
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
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        {link}
                      </Link>
                    </motion.li>
                  )
                )}
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-400">
              © 2026 SIAKAD Plus. All rights reserved.
            </p>
            <p className="text-sm text-slate-400">Jakarta, Indonesia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
