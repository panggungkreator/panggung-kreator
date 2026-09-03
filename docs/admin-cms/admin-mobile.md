# Panduan Standar UI/UX Admin Mobile

*(Diselaraskan dengan Pedoman Warna & Desain System Modern Monochrome Dashboard)*

Dokumen ini berisi aturan dan standar desain (*implementation plan*) untuk pengembangan seluruh halaman admin dalam mode mobile. Desain ini mengacu langsung pada filosofi **Modern Monochrome Dashboard** (`docs/admin-cms/design-system.md`) yang menekankan prinsip *"Data First, Decoration Never"*, palet monokromatik bersih dengan aksen lime green terkontrol, ukuran elemen proporsional, ringkasan statistik responsif, dan penempatan kontrol tombol yang efisien.

---

## 1. Pedoman Warna & Palet Visual (Color Tokens)

Sesuai standar `design-system.md`, seluruh halaman admin mobile mengadopsi palet monokromatik dengan aksen warna terkendali:

| Token / Elemen | Light Mode | Dark Mode | Penggunaan pada Mobile |
| --- | --- | --- | --- |
| **Page Background** | `#F2F4F7` | `#0F1117` | Latar belakang seluruh halaman |
| **Card Surface** | `#FFFFFF` | `#1A1D27` / `#121212` | Kartu data, panel modal, popover |
| **Input Background** | `#F5F5F5` (`bg-bg-well/50`) | `#22263A` (`bg-bg-well/50`) | Search bar, field input, dropdown select |
| **Primary Text** | `#111111` | `#F0F0F0` | Judul, nama item, nilai utama |
| **Secondary Text** | `#6B7280` | `#8B8FA8` | Label metadata, sub-teks, username |
| **Border Default** | `#E5E7EB` | `#2A2E42` (`border-border-default/70`) | Garis pembatas kartu, separator header |
| **Accent Lime Green** | `#BAFF6A` / `#A3E85A` | `#BAFF6A` / `#bef264` | Badge *Published* / indikator aktif / pertumbuhan |
| **Accent Red** | `#FF6B6B` / `#EF4444` | `#FF5252` / `#f87171` | Badge prioritas tinggi, aksi hapus permanen |

> ⚠️ **Aturan Ketat:** Hindari warna-warni dekoratif acak. Pertahankan estetika monokrom (hitam, putih, abu-abu netral) dengan aksen hijau lime untuk penanda positif/aktif dan merah untuk peringatan/hapus.

---

## 2. Aturan Tata Letak & Hierarki Visual (Layout Rules)

### A. Halaman Daftar / List & Dashboard

1. **Container Utama:**
   - Gunakan wrapper `space-y-6 pb-28 md:pb-12` agar konten di bagian bawah tidak tertutup oleh *floating dock bar*.
   - Hilangkan border kontainer luar di mobile (`border-0 bg-transparent`).
2. **Top Header & Bilah Pencarian Cepat:**
   - **Tagline Modul:** `text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted` (contoh: `[ KOMUNITAS ]` atau `[ ANGGOTA KOMUNITAS ]`).
   - **Judul Utama:** `text-2xl font-bold tracking-tight text-text-primary mt-0.5`.
   - **Quick Search Input (Header):** Tinggi **`h-9`**, bentuk kapsul `rounded-full`, padding `pl-9 pr-3 text-xs`, latar `bg-bg-well/70 border border-border-default`.
   - **Action Button Header (Desktop/Tablet):** Tinggi **`h-9 px-4 rounded-full text-xs font-bold text-white bg-zinc-900 hover:bg-zinc-800`**.
   - **Separator:** Garis bawah halus `border-b border-border-default/60 pb-4`.
3. **Kartu Seluler (Mobile Cards `md:hidden`):**
   - Mengonversi data tabel menjadi susunan kartu bersudut lengkung modern `rounded-3xl` (radius 20–24px).
   - Background: `#FFFFFF` (Light) / `#121212` (Dark) dengan border `border-border-default/70` dan shadow mikro `shadow-xs hover:shadow-md`.
   - Respons sentuh: `active:scale-[0.99] cursor-pointer transition-all`.

### B. Ringkasan Statistik (Summary Statistics)

Tersedia 2 pola ringkasan statistik yang dapat dipilih sesuai kebutuhan konteks modul:

1. **Pola 1: Horizontal Scrollable Capsule Pills (Referensi: `RegistrationClient.tsx:L438-L500`)**
   - Sangat dianjurkan untuk modul dengan filter status pendaftaran atau tab kategori aktif.
   - **Wadah Pembungkus:** `p-1.5 bg-zinc-100/90 dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 rounded-2xl overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 shadow-2xs`.
   - **Elemen Pill Tombol/Statistik:**
     - Tinggi & Padding: `px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 inline-flex items-center gap-2 transition-all cursor-pointer select-none`.
     - Badge Counter Angka: `px-2 py-0.5 rounded-full bg-white dark:bg-zinc-950 text-[10px] font-extrabold shadow-2xs`.
     - Status Aktif: Menggunakan warna pastel lembut berbatas halus (contoh: Biru `#e0f2fe`, Kuning `#fef9c3`, Hijau `#dcfce7`, Merah `#fee2e2`).

2. **Pola 2: Grid Kartu Statistik (Referensi: `MembersClient.tsx`)**
   - Digunakan untuk ringkasan metrik global (Total Member, Tier, Kapasitas).
   - Layout: `grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4`.
   - Format Kartu: `rounded-3xl p-4 sm:p-5 border border-border-default/70 bg-bg-card shadow-xs`.

### C. Halaman Detail

1. **Navigasi Header:**
   - Tombol *Back* bulat proporsional (`w-9 h-9 rounded-full border border-border-default hover:bg-bg-well`).
2. **Panel Grid Menjadi Kartu:**
   - Data yang pada desktop berdampingan (grid 3 kolom) diruntuhkan menjadi kartu-kartu terpisah `rounded-3xl p-5 border border-border-default/80`.

### D. Form Tambah / Edit Data

1. **Form Wrapper Minimalis:**
   - Pada mobile, hilangkan bingkai kartu besar: `border-0 sm:border rounded-none sm:rounded-3xl p-1 sm:p-8 bg-transparent sm:bg-card`.
2. **Grid Kolom:**
   - 1 kolom vertikal di mobile, 2 kolom pada tablet/desktop: `grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5`.

---

## 3. Panduan Ukuran Komponen Proporsional & Floating Dock

### A. Standar Ukuran Tombol & Field Input

- **Quick Search Input (Header):** Tinggi **`h-9`**, `rounded-full`, `pl-9 pr-3 text-xs`.
- **Field Form (Input, Select, DatePicker):** Tinggi **`h-10`**, `rounded-xl`, `px-3.5 text-xs font-medium bg-bg-well/50 border-border-default`.
- **Tombol Form & Modal (Batal / Simpan):** Tinggi **`h-10 px-4 rounded-xl text-xs font-bold`**.
- **Tombol Kapsul Header (Desktop/Tablet):** Tinggi **`h-9 px-4 rounded-full text-xs font-bold`**.

### B. Floating Bottom Action Dock (Referensi: `AcaraListClient.tsx:L615-L779` & `AcaraDetailClient.tsx`)

Pada tampilan seluler, aksi navigasi cepat dan pembuatan data dibungkus dalam sebuah dock kapsul mengambang yang terpusat di bagian bawah layar:

1. **Struktur & Kontainer Dock:**
   - Posisi: `fixed bottom-6 inset-x-0 z-30 pointer-events-none flex justify-center px-4`.
   - Wadah Dock: `pointer-events-auto bg-zinc-900/95 dark:bg-[#18181b]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-3 py-1.5 flex items-center gap-2 text-white`.
2. **Tata Letak Elemen Dock:**
   - **Sisi Kiri (Ikon Kontrol Sirkular):**
     - Ukuran: Tombol sirkular ramping **`w-9 h-9 rounded-full text-zinc-400 hover:text-white active:scale-95 transition-all`**.
     - Fungsi: *Urutkan / Sort* (popover), *Filter Acara* (popover dengan dot aktif `#BAFF6A`), *QR Code*, atau *Daftar Absensi* (dengan badge counter).
   - **Sisi Kanan (Tombol Aksi Utama / Tambah Data):**
     - Ukuran & Bentuk: Tombol kapsul putih monokrom **`h-9 px-4 rounded-full bg-white text-zinc-900 dark:bg-white dark:text-zinc-900 hover:bg-zinc-100 flex items-center gap-1.5 text-xs font-bold shadow-md hover:scale-105 active:scale-95 transition-all shrink-0`**.
     - Label: Ikon `<Plus className="w-4 h-4 stroke-[2.5]" />` + teks *"Tambah"*.
3. **Popover Menu di Atas Dock:**
   - Popover muncul ke atas (`side="top"`): `w-72 p-4 rounded-3xl shadow-2xl bg-white dark:bg-[#18181b] border border-border-default/80 text-text-primary space-y-3.5 mb-2 z-50`.
   - **Wajib Berbasis Direct Chips:** Menggunakan tombol-tombol pill interaktif 1-tap (`px-2.5 py-1 rounded-full text-[11px] font-semibold`) daripada dropdown `<Select>` bertingkat untuk mencegah bug *overflow* dan kontras teks gelap.

---

## 4. Penanganan Modal Pop-up, Animasi, & Loading

1. **Modal Popup Tanpa Border Radius pada Mobile:**
   - Pada layar mobile, seluruh komponen popup (`Modal`, `Dialog`, `ModalConfirmation`, `DeleteConfirmDialog`, dan `AlertDialog`) **wajib tanpa border radius** (`rounded-none sm:rounded-3xl` atau `rounded-none sm:rounded-[24px]`) serta `border-0 sm:border` agar tampilan terasa lebih luas, bersih, dan optimal pada layar seluler.
2. **Transisi Skeleton:**
   - Selalu gunakan `loading.tsx` dengan CSS `animate-pulse select-none` untuk transisi halaman instan.
3. **Modal Konfirmasi Kustom:**
   - Wajib menggunakan komponen kustom `ModalConfirmation` atau `Modal` dengan latar kabur (*backdrop blur*), tanpa menggunakan alert bawaan browser (`window.confirm()`).

---

## 5. Standar Pagination untuk Daftar Data (Data List Pagination)

Untuk menjaga performa aplikasi, efisiensi layar seluler, dan integritas status data, seluruh modul daftar data (seperti *Members*, *Packages*, *Acara*, *Registrasi*, dll.) wajib menggunakan sistem **Pagination Terpusat**:

1. **Rekomendasi UX: Simple URL/State Pagination:**
   - **Hindari Auto Scroll (Infinite Scroll):** Infinite scroll tidak cocok untuk admin CMS karena menyulitkan pelacakan total data, menyebabkan hilangnya posisi scroll saat kembali dari halaman edit/detail, dan membebani memori browser.
   - **Hindari Deretan Angka Rumit:** Pada layar seluler, hindari deretan tombol angka `[1] [2] [3] ... [10]` yang berisiko salah sentuh (*fat-finger problem*).
   - **Format Standar:** Gunakan kontrol tombol navigasi proporsional:

     ```text
     [ ← Sebelumnya ]     Hal X dari Y     [ Selanjutnya → ]
     ```

   - **Indikator Data:** Cantumkan informasi ringkas: `Menampilkan A–B dari Total C data (Limit: N / hal)`.

2. **Pengaturan Limit Terpusat di `admin/settings` > *General Settings*:**
   - Limit data per halaman tidak boleh di-hardcode acak di masing-masing modul.
   - Nilai limit diatur dan dibaca secara dinamis dari tabel `system_settings` dengan kunci **`pagination_limit`** (nilai *fallback* default: `10`).
   - Admin dapat memilih preset limit cepat (5, 10, 15, 20, 25, 50) atau memasukkan angka kustom melalui panel **General Settings**.

---

## 6. Aturan Wajib Sinkronisasi Ganda Supabase (Dual Database Sync)

Setiap penambahan data, pembaruan (*upsert*), maupun migrasi struktur skema pada database Supabase **wajib disinkronkan ke kedua ID database**:

| Lingkungan | Supabase Project ID | URL Database | Keterangan |
| --- | --- | --- | --- |
| **Development** | `zpcsqidgedvuaqgrklgp` | `https://zpcsqidgedvuaqgrklgp.supabase.co` | Database lokal / pengembangan aktif |
| **Production** | `wmuzvefmrbgffftkpdnx` | `https://wmuzvefmrbgffftkpdnx.supabase.co` | Database server produksi |

### Prinsip & Implementasi Teknis

1. **Server Actions / Backend Mutations:**
   - Setiap fungsi server actions yang menulis data (seperti `package-actions.ts`, `settings-actions.ts`, dll.) wajib menyertakan eksekusi ganda menggunakan utilitas sinkronisasi `syncDualOperation` (`front/lib/supabase/dual-sync.ts`).
   - Data yang dibuat/diubah pada environment Development secara otomatis disinkronkan ke Production untuk mencegah *data drift* atau diskrepansi status.
2. **Schema & Migration SQL:**
   - Setiap query DDL / migrasi SQL (melalui Supabase CLI atau Migration Tools) wajib dieksekusi secara simetris pada kedua Project ID: `zpcsqidgedvuaqgrklgp` dan `wmuzvefmrbgffftkpdnx`.
   - Pastikan RLS (*Row Level Security*) dan fungsi trigger sinkron di kedua basis data.

---

Dengan mengikuti panduan cetak biru ini, seluruh antarmuka CMS admin mobile Panggung Kreator akan memiliki keselarasan visual yang tinggi, proporsi yang rapi, pengalaman pengguna yang mulus, serta integritas data yang konsisten di seluruh lingkungan database.

Jangan ada button yang ganda, seperti: jika fitur filter sudah ada buttonnya, maka tidak perlu tambah button filter lagi. Termasuk button ganda yang sekiranya memiliki fungsi yang sama.
