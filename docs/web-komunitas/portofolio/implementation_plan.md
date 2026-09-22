# Implementation Plan: Redesign Manajemen Portofolio (Dinamis & Non-Tabular)

## 1. Analisis Masalah & Visi Baru
Saat ini, `PortfolioManager.tsx` memisahkan karya kreator ke dalam tab kaku berdasarkan pilar (Public Speaking, Content Creation, dll). Pendekatan ini kurang ideal karena:
- Membuat kreator yang hanya fokus pada 1 pilar melihat tab kosong di pilar lain.
- Karya tidak terlihat secara keseluruhan (overview).
- Terkesan seperti *folder file* alih-alih *feed* kreator yang inspiratif.

**Visi Baru:**
Menerapkan pendekatan **"Dynamic Masonry / Bento Grid"** yang menggabungkan semua karya dalam satu tampilan *feed* besar. Filter tetap ada, tetapi menggunakan *Chips/Pills* yang interaktif (menyaring secara instan tanpa memuat ulang atau memisahkan ruang secara kaku).

## 2. Breakdown Data yang Ditampilkan
Data bersumber dari tabel `portfolio_items` dan dibagi menjadi beberapa hierarki visual:

### A. Featured Highlights (Karya Unggulan)
Karya dengan status `is_featured = true`.
- **Tampilan:** Ditempatkan di urutan paling atas dengan ukuran kartu lebih besar (hero card / bento box lebar).
- **Data:** Thumbnail besar, Judul tebal, Deskripsi, Badge "Featured" warna aksen (misal: kuning/hijau lime).

### B. Achievements & Milestone (Pencapaian)
Karya dengan status `item_type = 'achievement'`.
- **Tampilan:** Baris horizontal khusus (horizontal scroll) berbentuk sertifikat mini atau badge, ditempatkan di bawah Featured Highlights.
- **Data:** Judul penghargaan/sertifikasi, ikon piala/sertifikat, deskripsi pendek.

### C. The Dynamic Feed (Semua Karya)
Sisa karya reguler (`is_featured = false` dan `item_type != 'achievement'`).
- **Tampilan:** Masonry grid (kolom bervariasi) atau Grid standar 3 kolom.
- **Data per Kartu:**
  - Thumbnail dengan indikator tipe media (Ikon *Play* untuk video, Ikon *Dokumen* untuk artikel).
  - Judul & Deskripsi singkat (maks 2 baris).
  - Tanda/Pill untuk Pilar (misal: "Public Speaking").
  - Status Visibilitas (Ikon 🔒 jika `is_public = false`).
  - Menu aksi cepat (Titik tiga: Edit, Hapus, Jadikan Featured).

## 3. Desain Interaksi (UX) & Alur Kerja
Pendekatan "Non-Kaku" memerlukan interaksi yang halus:

1. **Smart Filter Chips:**
   Di bagian atas area portofolio, terdapat barisan kapsul (chips):
   `[Semua Karya] [Public Speaking] [Content Creation] [Personal Branding] [Video] [Artikel]`
   Saat diklik, grid karya di bawahnya akan melakukan animasi transisi (layout animasi menggunakan Framer Motion atau Auto-Animate) untuk memfilter karya tanpa menghilangkan konteks halaman.
2. **Inline Add/Edit Modal:**
   Tombol "Tambah Karya Baru" berbentuk kartu putus-putus (dashed card) yang diletakkan sebagai item pertama di Grid (sebelum *Featured*). Saat diklik, modal (overlay) terbuka untuk input data.
3. **Drag-and-Drop Sort (Opsional/Masa Depan):**
   Kreator dapat menahan dan menggeser kartu untuk mengatur `sort_order` karya mereka.

## 4. Rencana Implementasi (Technical Breakdown)

### Fase 1: Perubahan Pengambilan Data (State Management)
- Ubah state `activePillar` menjadi `activeFilters` (Array) untuk memungkinkan multi-filter (misal: *Content Creation* AND *Video*).
- Ambil semua data portofolio dari `/api/member/portfolio` di awal (tanpa filter query database).
- Gunakan *computed variable* di frontend untuk membagi data:
  ```javascript
  const featuredItems = items.filter(i => i.is_featured);
  const achievements = items.filter(i => i.item_type === 'achievement' && !i.is_featured);
  const regularItems = items.filter(i => !i.is_featured && i.item_type !== 'achievement');
  ```

### Fase 2: Pembangunan Komponen UI (Tailwind & React)
- **Buat Komponen Filter Bar:** Rentetan tombol *pill* dengan gaya *toggle*.
- **Buat Bento/Grid Layout:**
  - Area Featured: `grid-cols-1 lg:grid-cols-2` dengan kartu besar.
  - Area Achievements: `flex overflow-x-auto gap-4`.
  - Area Reguler: `grid-cols-2 md:grid-cols-3` atau Masonry.
- **Kartu Tambah Baru:**
  Gantikan tombol standar dengan *Add Card* statis di dalam grid agar terasa natural.

### Fase 3: Transisi & Animasi (Opsional tapi disarankan)
- Gunakan library ringan seperti `@formkit/auto-animate` pada container grid karya. Ini akan secara otomatis membuat efek menggeser yang mulus ketika item difilter atau dihapus.

## 5. Revisi UX: Kemudahan Input & Otomatisasi (Social Media Integration)
Menyadari bahwa menginput data portofolio satu per satu dapat membebani (friction) member, pendekatan pengisian data perlu dibuat semudah dan se-otomatis mungkin.

### A. Otomatisasi Tautan (Link Unfurling / Scraping)
Member tidak perlu mengunggah gambar thumbnail dan menulis judul/deskripsi secara manual jika karyanya sudah ada di platform sosial.
- **Cara Kerja:** Saat member menempelkan (paste) link dari **YouTube, TikTok, atau Instagram (Reels/Post)** ke dalam input, sistem akan secara otomatis mengambil (scrape / memanggil API) metadata-nya.
- **Data yang ditarik otomatis:** Thumbnail cover, Judul Konten, dan Deskripsi awal.
- **UX yang diharapkan:** Member cukup menekan tombol "Generate" setelah menempelkan URL, dan form akan otomatis terisi. Member tinggal memverifikasi dan menyimpannya.

### B. Integrasi "Sync" (Masa Depan)
- Opsi untuk "Sync with YouTube" atau "Sync with Instagram" melalui OAuth API.
- Sistem dapat menampilkan daftar konten terakhir dari akun sosmed member, lalu member cukup men-ceklis mana saja yang ingin dimasukkan ke dalam etalase portofolio Panggung Kreator.

## 6. Penyederhanaan UI/UX agar Tidak Membingungkan
Desain yang dinamis bisa menjadi membingungkan (overwhelming) jika tidak diatur dengan rapi. Oleh karena itu, antarmuka pengelolaannya harus sangat terstruktur dan intuitif.

### A. Konsep "Preview vs Edit Mode" (WYSIWYG - What You See Is What You Get)
- Member tidak disuguhkan dengan tabel data admin yang kaku. Sebaliknya, saat member mengelola portofolionya, mereka **melihat tampilan portofolionya sama persis seperti yang akan dilihat oleh pengunjung publik**.
- Setiap kartu karya akan memiliki tombol melayang kecil (Edit / Hapus / Pin) yang hanya muncul saat di-*hover* oleh pemilik profil.

### B. Proses Tambah Karya yang Terpandu (Wizard/Step-by-Step)
Daripada menyajikan satu form modal yang sangat panjang, proses penambahan karya dibuat terarah:
- **Langkah 1:** Pilih sumber (Upload dari Komputer OR Tempel Link Sosmed).
- **Langkah 2:** Review Metadata (Otomatis terisi jika pakai link, atau input manual jika upload).
- **Langkah 3:** Pilih Label (Pilih pilar dan tipe karya).
Hal ini akan mengurangi beban kognitif (cognitive load) member.

## 7. Ringkasan Keuntungan UI Dinamis
- **Lebih Menarik:** Kreator bisa memamerkan seluruh spektrum karyanya sekaligus.
- **Bercerita (Storytelling):** Pemisahan *Featured*, *Achievements*, dan *Regular Feed* membantu menceritakan perjalanan karir.
- **Minim Gesekan (Frictionless):** Integrasi URL sosmed membuat pengisian portofolio bisa dilakukan dalam hitungan detik.
- **Intuitif:** Pengelolaan yang menyerupai tampilan publik (WYSIWYG) membuat member langsung paham bagaimana presentasi akhirnya.
