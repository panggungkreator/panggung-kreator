# Spesifikasi Desain & Teknis: Admin Dashboard (Xenith-Style)

## 1. Overview & Referensi Desain

Halaman Dashboard Admin (`front/app/(admin)/admin/page.tsx`) dan komponen antarmukanya (`front/components/admin/dashboard/DashboardClient.tsx`) dirancang mengadopsi referensi visual **Xenith Dashboard** yang diselaraskan dengan aturan ketat **Design System Panggung Kreator** (`docs/admin-cms/design-system.md`):

- **Prinsip Utama:** *"Data First, Decoration Never"* — tampilan monokromatik bersih dengan hierarki tipografi tegas dan kartu rounded besar (`16–20px`).
- **Palet Warna Terbatas:**
  - Latar Belakang: `#F2F4F7` (Light) / `#0F1117` (Dark)
  - Permukaan Kartu: `#FFFFFF` (Light) / `#1A1D27` (Dark)
  - Teks Utama: `#111111` (Light) / `#F0F0F0` (Dark)
  - Teks Sekunder: `#6B7280` (Light) / `#8B8FA8` (Dark)
  - Border / Divider: `#E5E7EB` (Light) / `#2A2E42` (Dark)
  - **Aksen Tunggal (Strictly 2 Colors):**
    - **Lime Green `#BAFF6A`** (teks `#2D5A00`): Indikator pertumbuhan positif (`+30%`, `+23%`), status *In Stock*, dot aktif.
    - **Red/Salmon `#FF6B6B`** (teks `#CC0000`): Indikator pertumbuhan negatif (`-15%`), status *Out of Stock*.

---

## 2. Bedah Anatomi & Hierarki Visual (Mengacu pada Gambar Referensi Xenith)

### 2.1 Header Row

- **Sapaan Utama**: `Welcome Back, Zac!` / `Welcome Back, Admin!` (`font-extrabold text-2xl sm:text-3xl tracking-tight text-[#111111]`).
- **Sub-sapaan**: `Here's what happening with your store today` / ringkasan aktivitas harian komunitas.
- **Tools Kanan**:
  - Kolom pencarian kapsul (`rounded-full py-2 pl-9 pr-4 text-xs bg-[#F5F5F5] border-[#E5E7EB]`).
  - Ikon notifikasi dengan indikator dot merah (`#FF6B6B`).
  - Avatar profil bulat (`#111111`), nama admin, role (`Super Admin`), dan dropdown chevron.

---

### 2.2 Row of 3 Stat Cards (Mini Sparkline Cards)

Terdiri dari 3 kartu statistik sejajar horizontal (`grid-cols-1 md:grid-cols-3 gap-5`). **Komponen Utama:** Shadcn UI `Card` (`Card`, `CardHeader`, `CardTitle`, `CardContent`).

1. **Card 1 (`Total Member`):**
   - **Sumber Data:** `SELECT count(*) FROM members` (atau `profiles`).
   - **Visual:** Angka raksasa total member terdaftar, badge persentase pertumbuhan bulan ini (Pill hijau/merah).
   - **Sparkline:** SVG Mini wave (`recharts` LineChart mini tanpa sumbu).

2. **Card 2 (`Total Event`):**
   - **Sumber Data:** `SELECT count(*) FROM events`.
   - **Visual:** Angka raksasa total event, badge persentase perbandingan dengan periode sebelumnya.
   - **Sparkline:** SVG Mini wave.

3. **Card 3 (`Data Demografi Peserta` - Action Card & Modal):**
   - **Visual Utama:** Card berisi teks ringkasan (misal: "Mayoritas usia 18-24") dan tombol `Lihat Detail Demografi` (Shadcn UI `Button`).
   - **Bentukan Modal Demografi (Shadcn UI `Dialog`):**
     - Menggunakan `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`.
     - Layout Modal: `grid-cols-1 md:grid-cols-2 gap-4` memuat 4 bagian utama:
       1. **Usia (Age):** Recharts `BarChart` vertikal atau `PieChart` (sumber data: kolom `age_range` di form pendataan).
       2. **Gender:** Recharts `PieChart` atau `DonutChart` (sumber data: kolom `gender`).
       3. **Pekerjaan/Status:** Recharts `BarChart` horizontal (sumber data: kolom `occupation`).
       4. **Domisili/Asal Kota:** Shadcn UI `Table` sederhana atau *ScrollArea* berisi list kota terbanyak.

---

### 2.3 Row 1: Chart Kehadiran & Leaderboard Streak (Sejajar Bersebelahan)

Tersusun dalam 2 kolom sejajar horizontal (`grid-cols-1 xl:grid-cols-12 gap-6`):

#### A. Kolom Kiri (xl:col-span-7)
1. **Statistik Jumlah Hadir per Event (Spline/Area Chart Card):**
   - **Sumber Data:** Join table `events` dan `attendances` di-group berdasarkan `event.id` dan diurutkan kronologis.
   - **Komponen:** Shadcn UI `Card`, Recharts `AreaChart` dengan gradient fill lime green `#BAFF6A`.
   - **Interaksi:** Custom floating black tooltip (`#111111`) saat titik di-hover.
   - **Styling:** Tinggi `h-[380px]` sejajar sempurna dengan Leaderboard di kanannya.

#### B. Kolom Kanan (xl:col-span-5)
2. **Leaderboard Member (Paling Rajin & Streak Terbanyak):**
   - **Sumber Data:** Query agregat dari table `attendances` di-group by `member_id` untuk menghitung `Total Attendance` dan kalkulasi *Longest Streak*.
   - **Komponen:** Shadcn UI `Card`, `Table` (`TableHeader`, `TableRow`, `TableCell`), `Avatar`, `ScrollArea`.
   - **Visual Kolom:** Menampilkan `Rank`, `Avatar + Nama Member`, `Streak` (dengan ikon 🔥), dan `Total Hadir` (*Kolom tier dihilangkan agar tabel ramping dan fokus pada konsistensi kehadiran*).
   - **Styling:** Tinggi `h-[380px]` sejajar proporsional dengan grafik kehadiran di sebelah kirinya.

---

### 2.4 Row 2: Wawasan Form Pendataan (3 Kolom di Bawah Secara Rapih)

Tersusun sejajar secara horizontal dalam 3 kolom (`grid-cols-1 md:grid-cols-3 gap-6`):

1. **Topik & Minat Belajar Terpopuler (Horizontal Bar Chart):**
   - **Sumber Data:** Menghitung frekuensi kemunculan setiap value di array `content_topics` dan `skills_to_master`.
   - **Visual:** Recharts `BarChart` dengan `layout="vertical"` (`h-[270px]`).
   - **Tujuan:** Admin dapat melihat topik mana yang paling diinginkan untuk event selanjutnya.

2. **Tantangan Utama Member (Horizontal Bar Chart):**
   - **Sumber Data:** Menghitung frekuensi kemunculan value di array `ps_challenges`.
   - **Visual:** Recharts `BarChart` dengan `layout="vertical"` aksen salmon red `#FF6B6B` (`h-[270px]`).
   - **Tujuan:** Melihat hambatan terbesar kreator (misal: Konsistensi, Alat Kurang).

3. **Minat Monetisasi (Monetization Interests):**
   - **Sumber Data:** Frekuensi array dari form monetisasi (misal: Sponsorship, Adsense, Produk Digital).
   - **Visual:** Shadcn UI `Progress` bar list berjenjang (`h-[270px]`).
   - **Tujuan:** Membantu merencanakan program kerja sama komersial yang tepat sasaran.

---

## 3. Integrasi Kode & Arsitektur

- **Server Component (`admin/page.tsx`):** Bertugas melakukan *data fetching* dari Supabase secara asinkron (mengambil data Member, Events, Attendances, dan Interests), kemudian mem-passing raw data tersebut sebagai props.
- **Client Component (`DashboardClient.tsx`):** Menerima data agregat dari Server Component dan merendernya secara reaktif. Komponen ini murni untuk urusan UI/UX, interaksi (hover chart, klik modal demografi), dan penggunaan hook (Shadcn Dialog).
