# Prompt UI Stitch: Halaman Detail Talent (Portfolio Detail Showcase)

*Copy dan paste seluruh teks di bawah ini ke dalam Google Stitch (atau AI UI Generator lainnya) untuk melihat pratinjau langsung antarmuka halaman Detail Talent.*

---

**Role & Context:**
Kamu adalah seorang Frontend Engineer dan UI/UX Expert. Buatlah halaman "Detail Talent / Profil Kreator" untuk Panggung Kreator menggunakan React, Tailwind CSS, dan Lucide React Icons. Halaman ini adalah representasi publik dari profil seorang kreator beserta portofolionya.

**Data yang Ditampilkan (Mock Data berdasarkan Database Supabase):**
- **Member:** Avatar, Nama Panggung (Stage Name), Profesi (Occupation), Bio (Description), Lokasi (City), Links Sosial Media.
- **Interests:** Tag Keahlian (Primary Interests), Tingkat Pengalaman (Experience Level).
- **Portfolio:** Daftar karya unggulan (Featured) dan keseluruhan karya, yang berisi: Thumbnail, Judul, Deskripsi, Tipe Media (Video/Image/Link), dan Total Views.

**Aesthetic Style & Design System (Hybrid Kombinasi):**
Gabungkan gaya **"Bold Monochrome Grid-Based Editorial"** dengan **"Modern Monochrome Dashboard (Clean Data-Driven)"**:
1. **Palet Warna Monokrom + 1 Aksen:** Gunakan Latar Belakang Abu-abu Terang (`#F2F4F7`) dan Kartu Konten Putih Bersih (`#FFFFFF`). Gunakan warna **Lime Green (`#BAFF6A`)** HANYA sebagai warna aksen untuk badge (seperti tag keahlian utama, status "Available", atau indikator views).
2. **Bentuk (Shapes) - Rounded Cards:** Seluruh kartu (cards) memiliki lengkungan besar (Border Radius `16px` hingga `24px`). Avatar dapat berupa lingkaran sempurna atau persegi dengan sudut melengkung.
3. **Flat & Minimal Chrome:** Tidak ada bayangan (shadow) dramatis. Elevasi dicapai melalui border tipis (`1px solid #E5E7EB`) pada kartu putih di atas latar belakang abu-abu terang.
4. **Tipografi Raksasa (Display Typography):**
   - **Nama Kreator & Angka Statistik:** Gunakan font Sans-serif (seperti Inter) ultra-bold/black dengan ukuran raksasa (misal: `text-5xl` untuk nama, `text-4xl` untuk angka statistik).
   - **Serif Accents:** Gunakan font Serif klasik bergaya *lowercase italic* (`font-serif italic text-neutral-500`) untuk aksen pelunak (misalnya kata *kreator* sebelum nama, atau *karya* sebelum judul).

**Struktur Halaman (Page Layout):**

1. **Top Navigation/Breadcrumb:**
   - Navigasi simple di kiri atas: `[ KEMBALI KE DIREKTORI ]`. Teks uppercase, font Sans-serif bold kecil (`text-[10px] tracking-widest`).

2. **Hero Profile Card (Kartu Utama Profil):**
   - Layout: Grid 2 kolom asimetris (Kiri: Info Profil, Kanan: Statistik Data-Driven).
   - Background Putih (`bg-white`), Border tipis, Rounded `24px`, Padding lega (`p-8`).
   - **Kolom Kiri (Profil):**
     - Avatar Kreator (besar, rounded).
     - Badge Status/Lokasi di atas nama.
     - Headline: Teks Serif italic "*kreator*" diikuti Nama Panggung raksasa Sans-serif (`uppercase`).
     - Teks sekunder: Profesi (Occupation) warna abu-abu.
     - Tag Keahlian (Primary Interests) bergaya "pill" (kapsul). Tag pertama memiliki background Lime Green (`#BAFF6A`) dengan teks hitam, tag lainnya abu-abu muda.
     - Bio singkat (teks Sans-serif regular).
     - Deretan Ikon Sosial Media (Instagram, LinkedIn, YouTube) bentuk bulat/lingkaran outline.
   - **Kolom Kanan (Statistik Data-Driven):**
     - Tersusun dari 2-3 kotak statistik (Stat Cards) kecil di dalam hero card.
     - Contoh Stat 1: "TOTAL KARYA" (Label kecil abu-abu), "12" (Angka Sans-serif raksasa bold).
     - Contoh Stat 2: "TOTAL VIEWS" (Label), "1.2K" (Angka raksasa), dengan badge kecil Lime Green "+15%".
     - Contoh Stat 3: "PENGALAMAN" (Label), "ADVANCED" (Teks bold besar).

3. **Section "Karya Unggulan" (Featured Portfolio):**
   - Header Section: Judul "KARYA <span class='font-serif italic lowercase text-neutral-500'>unggulan</span>" dengan garis pemisah bawah (`border-b`).
   - Grid 2 Kolom untuk kartu portofolio yang lebar.
   - **Portfolio Card:**
     - Rounded `16px`, bg putih, border abu-abu tipis.
     - Thumbnail gambar memanjang di atas (aspect ratio 16:9), bagian bawah memuat info.
     - Keterangan tipe karya (misal: "VIDEO", "ARTICLE") dalam badge kecil di pojok gambar.
     - Judul karya tebal, deskripsi 2 baris.

4. **Section "Eksplorasi Karya" (Data-Driven Portfolio Grid):**
   - Header Section: Judul "SEMUA <span class='font-serif italic lowercase text-neutral-500'>portofolio</span>".
   - Search & Filter bar lokal (input cari karya, dropdown pilar) dengan bentuk input melengkung `rounded-full` (kapsul) dan background abu-abu muda (`#F5F5F5`).
   - Grid 3 Kolom untuk kartu portofolio reguler.
   - Desain kartu lebih ringkas dari karya unggulan, tetapi tetap mempertahankan border tipis dan rounded `16px`.

Tampilkan output sebagai satu file komponen React tunggal (`TalentDetail.tsx`) lengkap dengan mock data yang disesuaikan dari skema Supabase di atas. Pastikan kode Tailwind mematuhi aturan warna, typography, dan border-radius yang ketat tersebut.
