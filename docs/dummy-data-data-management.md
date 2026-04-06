# Data Dummy untuk Manajemen Data (Admin IT)

Dokumen ini berisi sekumpulan data dummy yang dapat digunakan untuk mengisi data pada halaman **Manajemen Data** (`http://localhost:3000/dashboard/admin-it/data-management`) untuk keperluan pengujian dan pengembangan proyek. 

Data di bawah ini mencakup 4 kategori utama yang ada pada *tabs* di halaman manajemen data:

---

## 1. Data Kelas & Roster

Data ini membutuhkan relasi ke Master Data (Tingkat Kelas, Jurusan, Tahun Ajaran) serta profil Guru (Wali Kelas) dan Ruang Kelas.

| Nama Kelas | Kode Kelas | Tingkat | Kapasitas | Terisi | Jurusan | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 10 IPA 1 | X-IPA-1 | Kelas 10 | 36 | 35 | Ilmu Pengetahuan Alam | Aktif |
| 10 IPA 2 | X-IPA-2 | Kelas 10 | 36 | 36 | Ilmu Pengetahuan Alam | Aktif |
| 10 IPS 1 | X-IPS-1 | Kelas 10 | 36 | 34 | Ilmu Pengetahuan Sosial | Aktif |
| 11 IPA 1 | XI-IPA-1 | Kelas 11 | 35 | 35 | Ilmu Pengetahuan Alam | Aktif |
| 11 IPS 1 | XI-IPS-1 | Kelas 11 | 35 | 30 | Ilmu Pengetahuan Sosial | Aktif |
| 12 IPA 1 | XII-IPA-1 | Kelas 12 | 30 | 28 | Ilmu Pengetahuan Alam | Aktif |
| 12 Bahasa | XII-BHS-1| Kelas 12 | 30 | 25 | Ilmu Bahasa & Budaya | Aktif |

---

## 2. Data Ruangan (Rooms)

Menyimpan data fisik ruangan yang ada di sekolah, baik berbentuk ruang kelas, laboratorium, lapangan, dll.

| Nama Ruangan | Kode | Tipe Ruangan | Kapasitas | Lantai | Gedung | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Ruang X IPA 1 | R-101 | Kelas (*Classroom*) | 40 | 1 | Gedung A | Aktif |
| Ruang X IPA 2 | R-102 | Kelas (*Classroom*) | 40 | 1 | Gedung A | Aktif |
| Ruang XI IPA 1| R-201 | Kelas (*Classroom*) | 40 | 2 | Gedung A | Aktif |
| Lab Komputer 1| L-KB1 | Laboratorium   | 35 | 1 | Gedung C | Aktif |
| Lab Fisika   | L-FSK | Laboratorium   | 30 | 2 | Gedung C | Aktif |
| Perpustakaan | P-001 | Fasilitas Lain   | 100| 1 | Gedung B | Aktif |
| Lapangan Basket| L-BSK | Lapangan Olahraga| 150| Dasar| Area Terbuka| Aktif |

---

## 3. Data Mata Pelajaran (Subjects)

Berisi mata pelajaran wajib maupun peminatan.

| Nama Mata Pelajaran | Kode Pelajaran | Tipe | SKS / JP | Status |
| :--- | :--- | :--- | :--- | :--- |
| Pendidikan Agama Islam | PAI-01 | Wajib Nasional | 3 | Aktif |
| Pendidikan Pancasila & Kewarganegaraan | PKN-01 | Wajib Nasional | 2 | Aktif |
| Bahasa Indonesia | BIN-01 | Wajib Nasional | 4 | Aktif |
| Matematika Wajib | MWT-01 | Wajib Nasional | 4 | Aktif |
| Matematika Minat (IPA) | MMT-01 | Peminatan | 3 | Aktif |
| Fisika        | FIS-01 | Peminatan | 3 | Aktif |
| Biologi       | BIO-01 | Peminatan | 3 | Aktif |
| Ekonomi       | EKO-01 | Peminatan | 3 | Aktif |
| Pendidikan Jasmani & Rohani | PJK-01 | Wajib Nasional | 2 | Aktif |
| Muatan Lokal (Bahasa Daerah)| MLK-01 | Muatan Lokal | 2 | Aktif |

---

## 4. Master Data

Master data digunakan sebagai referensi tabel lain untuk dropdown/pilihan.

### A. Tahun Ajaran (Academic Years)
| Tahun Ajaran | Tanggal Mulai | Tanggal Selesai | Status |
| :--- | :--- | :--- | :--- |
| 2024/2025 | 15 Juli 2024 | 20 Juni 2025 | **Aktif** |
| 2025/2026 | 14 Juli 2025 | 19 Juni 2026 | Terencana |
| 2023/2024 | 12 Juli 2023 | 21 Juni 2024 | Selesai |

### B. Semester (Semesters)
| Nama Semester | Tahun Ajaran | Tanggal Mulai | Tanggal Selesai | Berjalan | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Ganjil 2024/2025 | 2024/2025 | 15 Juli 2024 | 15 Des 2024 | Ya | Aktif |
| Genap 2024/2025 | 2024/2025 | 06 Jan 2025 | 20 Juni 2025 | Tidak | Aktif |

### C. Tingkat Kelas (Class Levels)
| Tingkat | Urutan (Order) | Keterangan | Status |
| :--- | :--- | :--- | :--- |
| Kelas 10 | 1 | Siswa Baru (Fase E) | Aktif |
| Kelas 11 | 2 | Tingkat Menengah (Fase F) | Aktif |
| Kelas 12 | 3 | Tingkat Akhir (Fase F) | Aktif |

### D. Jurusan (Departments)
| Nama Jurusan | Kode Jurusan | Keterangan | Status |
| :--- | :--- | :--- | :--- |
| Ilmu Pengetahuan Alam | MIPA / IPA | Peminatan Sains dan Matematika | Aktif |
| Ilmu Pengetahuan Sosial | IPS | Peminatan Sosial dan Ekonomi | Aktif |
| Ilmu Bahasa & Budaya | BAHASA | Peminatan Sastra dan Bahasa | Aktif |
