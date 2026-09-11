# Optimasi Performa Navigasi Admin & Dynamic Top Progress Bar

Dokumen ini menjelaskan strategi perbaikan pengalaman pengguna (UX) dan optimasi kecepatan data fetching pada panel Admin (CMS) Panggung Kreator.

---

## 1. Latar Belakang Masalah

Ketika berpindah antar-halaman pada panel Admin, terjadi jeda waktu tunggu (latency) yang membuat tampilan seolah-olah macet / *freeze*. Hal ini disebabkan oleh:
1. **Server Waterfall Data Fetching**: Beberapa query database ke Supabase (seperti verifikasi role, query data utama, dan query pagination limit) dipanggil secara serial (\wait\ berurutan) di Server Component.
2. **Ketiadaan Feedback Visual Instan**: Saat mengklik menu di sidebar, Next.js App Router menunggu respon server sebelum merender halaman baru, tanpa adanya indikator progress bar di bagian atas layar.

---

## 2. Solusi & Strategi Implementasi

### A. Dynamic Top Progress Bar (\
extjs-toploader\)
- Memasang top loader tipis pada level root aplikasi (\ront/app/layout.tsx\) yang aktif otomatis setiap kali router berpindah halaman.
- Memberikan feedback visual 0ms sehingga pengguna langsung mengetahui bahwa sistem sedang memproses perpindahan halaman.
- Mendukung warna aksen adaptif atau kontras (misal \#18181B\ / \#FAFAFA\) dengan indikator bayangan lembut tanpa membebani performa.

### B. Paralelisasi Data Fetching (\Promise.all\)
- Mempertahankan sistem verifikasi RBAC / granular permission yang spesifik per pengguna.
- Menggabungkan pemanggilan query independen (seperti data tabel utama dan data konfigurasi pagination) ke dalam satu blok \Promise.all\ agar dieksekusi secara paralel di server.

---

## 3. Komponen & Berkas yang Dimodifikasi

1. **\ront/package.json\**:
   - Menambahkan dependency \
extjs-toploader\.
2. **\ront/app/layout.tsx\**:
   - Mengintegrasikan \<NextTopLoader />\ dengan konfigurasi:
     - \showSpinner={false}\
     - \height={3}\
     - \crawl={true}\
     - \speed={200}\
3. **\ront/app/(admin)/admin/partner/page.tsx\**:
   - Optimasi \Promise.all\ untuk \partners\ query dan \paginationLimit\.
4. **\ront/app/(admin)/admin/galeri/page.tsx\**:
   - Optimasi \Promise.all\ untuk data galeri dan pagination limit.
5. **\ront/app/(admin)/admin/admins/page.tsx\ & Halaman Admin Lainnya**:
   - Penerapan pola paralel untuk query server-side.

---

## 4. Verifikasi & Pengujian

- [x] Verifikasi build aplikasi dengan \
pm run build\
- [x] Pengujian navigasi client-side di rute Admin
- [x] Memastikan indikator loading bar muncul seketika saat menu diklik
