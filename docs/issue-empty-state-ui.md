# Issue: Penambahan Empty State UI untuk List Kosong

## Deskripsi
Saat ini, beberapa halaman di dashboard tidak menampilkan indikator atau pesan yang jelas ketika tidak ada data untuk ditampilkan (data kosong). Hal ini bisa menyebabkan kebingungan bagi pengguna karena mereka mungkin berasumsi bahwa halaman sedang dimuat (loading) atau terjadi kesalahan sistem (error). Oleh karena itu, diperlukan implementasi komponen **Empty State UI** yang informatif pada halaman-halaman tersebut guna membantu orientasi dan user experience (UX) dari pengguna.

## Lokasi Halaman yang Terdampak
Beberapa halaman yang perlu diimplementasikan fitur ini (namun tidak terbatas pada ini saja):
- `/dashboard/admin-it/manajemen-pengguna`
- `/dashboard/admin-it/data-management`
- `/dashboard/admin-it/kelas-dan-roster`
- Boleh ditambahkan juga di segala file yang me-render list/table dari database di dalam modul dashboard.

## Kriteria Penerimaan (Acceptance Criteria)
1. **Komponen UI Reusable**: Membuat komponen `EmptyState` (misalnya di path `src/components/ui/empty-state.tsx`) yang fleksibel dengan properti (props) seperti `title`, `description`, `icon`, dan opsional `actionButton`.
2. **Kualitas Visual**: Tampilan empty state harus menarik secara visual dan merujuk pada standar web design modern, yang terdiri dari:
   - Ikon yang relevan (menggunakan Lucide icons, misalnya `Inbox`, `FolderOpen`, atau `Files` dengan ukuran proposional dan warna yang lembut).
   - Judul singkat dengan tipografi yang pas (misal. "Belum Ada Data Pengguna").
   - Deskripsi penjelasan singkat (misal. "Silakan tambahkan data baru melalui tombol tambah di atas.").
3. **Penerapan Bersyarat (Conditional Rendering)**: Pada komponen tabel atau list data, terapkan pengecekan array data. Apabila `data.length === 0` atau array kosong/null dari database, maka render komponen `EmptyState` menggantikan skeleton/tabel kosong.
4. **Responsivitas**: Komponen memposisikan dirinya dengan baik di layar kecil (mobile) maupun layar lebar (desktop).

## Langkah-Langkah Implementasi
1. Buat folder/file baru jika diperlukan untuk komponen khusus Empty State.
2. Definisikan komponen fungsional React (contoh: `export function EmptyState({ ... })`).
3. Temukan komponen yang mengurutkan atau mapping list data (misalnya di `page.tsx` atau `client/server component` dari `/dashboard/admin-it/manajemen-pengguna`).
4. Ubah struktur rendering untuk menampilkan `EmptyState` saat jumlah baris (rows/items) adalah 0.
5. Jalankan `npm run dev` dan pastikan tampilan pada URL tersebut render state kosong yang dibuat ketika data benar-benar kosong di database, dan memastikan tabel tampil normal ketika ada data.

## Catatan
- Gunakan TailwindCSS framework dengan kaidah yang sejalan pada elemen desain UI yang lain.
- Pastikan penggunaan bahasa Indonesia yang baik pada teks Empty State.
