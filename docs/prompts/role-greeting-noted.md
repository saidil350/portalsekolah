# Prompt untuk Membangun Personal Role Greeting (Noted)

## Konteks & Tujuan
Gunakan prompt ini untuk memerintahkan AI dalam membangun komponen **Hero Greeting Section** pada dashboard aplikasi Portal Sekolah. Tujuannya adalah untuk memberikan kesan (impression) yang ramah, personal, dan profesional kepada pengguna setiap kali mereka masuk ke sistem.

## Struktur Prompt (Salin Konten di Bawah Ini)

---

### ROLE GREETING GENERATOR PROMPT

"Buatlah sebuah komponen React (Next.js) bernama `RoleGreetingCard` yang berfungsi sebagai header utama pada dashboard sekolah. Komponen ini harus memiliki fitur-fitur berikut:

1.  **Dinamisme Waktu & Nama**: 
    - Gunakan logika waktu lokal untuk memberikan salam: Pagi (05:00-11:00), Siang (11:01-14:00), Sore (14:01-18:00), dan Malam (18:01-04:59).
    - Format kalimat: '[Salam], [Nama User]! 👋'.

2.  **Identitas Sekolah & Kelas**:
    - Tampilkan nama sekolah dengan font yang elegan.
    - Jika role-nya adalah 'Siswa' atau 'Guru', tampilkan informasi **Kelas** (e.g., 'Wali Kelas: XII MIPA 1' atau 'Kelas: XI IPS 2').

3.  **Visual Impression (Premium UI)**:
    - Gunakan **Tailwind CSS** dengan efek **Glassmorphism** (`bg-white/10`, `backdrop-blur-lg`).
    - Latar belakang menggunakan **Mesh Gradient** yang lembut (misal: biru muda ke ungu lembut).
    - Tambahkan **Micro-animations** menggunakan **Framer Motion** saat komponen pertama kali dimuat (fade-in + slide-up).
    - Sertakan ikon yang relevan dari **Lucide React** (misal: Matahari untuk pagi, Bulan untuk malam, dan Ikon Sekolah).

4.  **Responsivitas**:
    - Pastikan tampilan rapi di mobile (layout stack) dan desktop (layout side-by-side).

5.  **Role Badge**:
    - Tampilkan label peran (Admin, Guru, Siswa, Orang Tua) dengan warna aksen yang berbeda (e.g., Admin: Violet, Guru: Emerald, Siswa: Blue)."

---

## Petunjuk Penggunaan
Simpanlah prompt di atas dan berikan kepada asisten AI untuk menghasilkan kode komponen yang siap pakai. Pastikan `props` yang dibutuhkan (Nama, Role, Sekolah, Kelas) sudah tersedia di context atau state aplikasi Anda.
