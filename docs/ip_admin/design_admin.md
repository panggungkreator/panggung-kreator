# Design System: Panggung Kreator — Admin CMS
**Project ID:** panggung-kreator-admin-01
**Aesthetic Style:** Modern Monochrome Dashboard — *"Clean Data-Driven Interface"*
**Referensi Visual:** Ecomora Dashboard

---

## 0. Filosofi Desain

Admin CMS ini dirancang berdasarkan prinsip **"Data First, Decoration Never"** — tampilan yang bersih, hierarki visual yang kuat melalui ukuran dan berat tipografi, bukan melalui warna berlebih. Ini adalah filosofi yang berbeda namun memiliki garis DNA yang sama dengan Web Komunitas (yang juga mendahulukan konten di atas dekorasi):

| Aspek | Web Komunitas | Admin CMS |
|---|---|---|
| **Pengguna** | Publik / Kreator | Internal / Operator |
| **Mood** | Bold, Provocative, Editorial | Clean, Data-Driven, Professional |
| **Navigasi** | — | Horizontal Top Nav (icon + label) |
| **Warna** | Monokrom hitam-putih murni | Monokrom abu-abu + **satu aksen lime-green** |
| **Corner** | Sharp (0px) | Besar & lembut (16–20px pada kartu) |
| **Bayangan** | Tidak ada | Sangat tipis, hampir tak terlihat |
| **Tipografi angka** | — | Raksasa, berat ekstrem (number display) |

> **DNA yang dipertahankan:** Kedua sistem monokromatik dan mendahulukan konten/data. Aksen warna digunakan sangat terkendali — hanya satu keluarga warna aksen yang muncul dalam seluruh antarmuka.

---

## 1. Visual Theme & Atmosphere

Desain menggunakan konsep **"Modern Monochrome Dashboard"** yang terinspirasi langsung dari gaya Ecomora Dashboard. Karakteristik utama:

- **Monochrome with One Accent:** Seluruh UI menggunakan palet hitam-putih-abu, dengan **satu pengecualian**: warna lime-green cerah (`#BAFF6A` atau `#A8F53D`) digunakan eksklusif hanya pada badge perubahan positif (growth indicators). Warna lain (merah untuk negatif) adalah satu-satunya warna kedua yang diizinkan.
- **White Cards on Light Gray:** Latar belakang halaman adalah abu-abu sangat terang (`#F2F4F7`). Kartu konten adalah putih bersih (`#FFFFFF`). Kontras antara background dan kartu sangat subtle — tidak ada bayangan dramatis.
- **Number Display Typography:** Angka statistik utama ditampilkan dalam ukuran raksasa (`40–56px`) dengan font weight `800–900`. Ini adalah elemen paling menonjol di halaman.
- **Horizontal Navigation (Bukan Sidebar):** Navigasi utama berada di **top navigation bar secara horizontal** dengan ikon + label teks. Item aktif ditandai oleh **garis bawah tebal berwarna hitam** (bukan background pill atau sidebar).
- **Large Rounded Cards:** Semua kartu menggunakan `border-radius: 16–20px` — sudut yang cukup besar untuk terasa modern dan ramah, namun tidak berlebihan.
- **Minimal Chrome:** Tidak ada dekorasi yang tidak perlu. Setiap piksel di UI memiliki fungsi informasi.

---

## 2. Color Palette & Roles

### 2.1 Background & Surface

| Nama | Kode Hex | Peran |
|---|---|---|
| **Page Background** | `#F2F4F7` | Latar belakang seluruh halaman — abu-abu biru sangat terang |
| **Card Surface** | `#FFFFFF` | Semua kartu, top nav bar, panel dropdown |
| **Input Background** | `#F5F5F5` | Search bar, textarea, field input |
| **Row Hover** | `#F8F9FA` | Baris tabel saat di-hover |

### 2.2 Teks & Hierarki

| Nama | Kode Hex | Peran |
|---|---|---|
| **Primary Text** | `#111111` | Angka besar, judul kartu, teks utama |
| **Secondary Text** | `#6B7280` | Label deskriptif, sub-teks, metadata |
| **Placeholder** | `#9CA3AF` | Placeholder input, teks non-aktif |
| **Table Header** | `#374151` | Header kolom tabel |
| **Divider** | `#E5E7EB` | Border kartu, garis pemisah row tabel |

### 2.3 Warna Aksen (DIGUNAKAN SANGAT TERBATAS)

> ⚠️ **Aturan Ketat:** Hanya **dua** warna aksen yang diizinkan di seluruh UI. Tidak ada pengecualian.

| Nama | Kode Hex | Peran |
|---|---|---|
| **Accent Lime Green** | `#BAFF6A` | Badge pertumbuhan positif (e.g., `+10% ↑`), satu-satunya warna yang "mencolok" |
| **Accent Red / Salmon** | `#FF6B6B` | Badge pertumbuhan negatif (e.g., `-12% ↓`) |

> Kedua warna aksen ini **HANYA** muncul pada badge perubahan/pertumbuhan statistik (growth indicators). Di tempat lain, semua elemen harus monokrom.

### 2.4 Warna Status (Tabel & Badges)

Status badge di dalam tabel menggunakan warna pastel yang sangat lembut:

| Status | Background | Text Color |
|---|---|---|
| **In Progress** | `#EEF0FF` | `#5B67D8` |
| **Complete** | `#EDFFF4` | `#22C55E` |
| **Waiting** | `#FFF4EE` | `#F97316` |
| **Cancelled** | `#FFF0F0` | `#EF4444` |

### 2.5 Chart Colors

| Elemen | Warna | Keterangan |
|---|---|---|
| **Bar Utama (Filled)** | `#111111` | Batang chart data utama (solid hitam) |
| **Bar Sekunder (Hatched)** | `#D1D5DB` | Batang chart perbandingan (abu-abu, pola arsir) |
| **Donut Segment Utama** | `#1A1A2E` atau `#111111` | Segmen terbesar pada donut/pie chart |
| **Donut Segment Sekunder** | `#E5E7EB` | Segmen lain (abu-abu muda) |
| **Chart Grid Line** | `#F3F4F6` | Garis grid horizontal pada chart area |

---

## 3. Typography Rules

> **Tidak ada font Serif sama sekali.** Ini berbeda dari desain sebelumnya. Admin CMS versi ini sepenuhnya menggunakan Sans-serif.

### Font Family

- **Primary Font:** `"Inter"` (dari Google Fonts) — satu-satunya font yang digunakan di seluruh antarmuka, dari judul raksasa hingga teks terkecil.
- **Fallback:** `ui-sans-serif, system-ui, -apple-system, sans-serif`

### Hierarki Tipografi (Ukuran Standar)

| Level | Size | Weight | Warna | Keterangan |
|---|---|---|---|---|
| **Display Number** | `38–56px` | `800` (ExtraBold) | `#111111` | Angka statistik utama (e.g. 202,324 / $500,324) |
| **Page Title** | `24–28px` | `700` (Bold) | `#111111` | Judul halaman di content area ("Dashboard") |
| **Card Label** | `13–14px` | `500` (Medium) | `#6B7280` | Label di atas angka statistik ("Total Products Sales") |
| **Section Title** | `16–18px` | `600` (SemiBold) | `#111111` | Judul section ("Recant Orders", "Top Selling Products") |
| **Section Subtitle** | `12px` | `400` (Regular) | `#9CA3AF` | Sub-deskripsi section di bawah judul |
| **Table Header** | `12px` | `600` (SemiBold) | `#374151` | Header kolom tabel (Order id, Product Name, dll.) |
| **Table Body** | `13px` | `500` (Medium) | `#111111` | Isi data kolom utama tabel |
| **Table Body Meta** | `13px` | `400` (Regular) | `#374151` | Isi data kolom sekunder tabel |
| **Nav Label (Sidebar)** | `12–13px` | `600` (SemiBold) | `#374151` | Label item navigasi vertikal |
| **Nav Label Active** | `12–13px` | `700` (Bold) | `#111111` | Label item aktif di sidebar |
| **Button Text** | `13px` | `600` (SemiBold) | Sesuai konteks | Teks tombol aksi utama |
| **Badge Text** | `11–12px` | `600` (SemiBold) | Sesuai status | Teks badge growth indicator & status |
| **Link Action** | `13px` | `600` (SemiBold) | `#111111` | Teks link "View Sales Details →" |

> **Catatan:** Inter mendukung `font-feature-settings: "tnum"` (tabular numbers) yang **harus diaktifkan** untuk semua angka dalam tabel dan statistik agar kolom angka sejajar rapi.

---

## 4. Layout & Navigation System

### 4.1 Sidebar Navigation (Vertikal Kiri)

- **Ukuran:** Lebar tetap **`220px` (w-56)**, selalu terbuka (always expanded) dan tidak pernah colapse ke mode ikon-saja pada layar desktop.
- **Background:** `#FFFFFF` dengan garis batas kanan `1px solid #E5E7EB`.
- **Nav Items:** Tersusun vertikal dengan padding vertical standar (`py-2`) dan ukuran teks standar (`text-xs font-semibold`).
- **Active Indicator:** Teks aktif berubah menjadi warna `#111111` (Primary Text), font-weight menjadi `700` (Bold), dan memiliki **left border indicator tebal `3px solid #111111`** di ujung kiri baris menu. Tanpa background warna atau pill shape.
- **Isi:** Hanya menampung logo brand di bagian atas dan tautan modul menu. **Tidak berisi info profil user** di bagian bawah sidebar.

### 4.2 Top Header Bar

- **Tinggi:** `56px` (h-14).
- **Lebar:** Memanjang penuh dari ujung kiri ke ujung kanan (**`w-full` / full width**).
- **Background:** `#FFFFFF` dengan border bawah `1px solid #E5E7EB`.
- **Logo Area (Kiri):** Memuat ikon kustom + nama brand `"PanggungKreator"` (`text-xs font-bold uppercase tracking-wider`).
- **Breadcrumbs (Kiri/Tengah):** Ditempatkan tepat di samping logo (dipisahkan garis pembatas vertikal) dengan format `[ ADMIN ] / BREADCRUMB / SUB-BREADCRUMB`.
- **User Profile Dropdown (Kanan):** Avatar bulat (`32px`), nama admin (`text-xs font-semibold`), dan chevron `∨`.
- **Peran Lain:** Menampung toggle dark-mode (w-8 h-8) dan notifikasi pending transaksi jika ada.

### 4.3 Content Area Layout

```
+--------------------------------------------------------------+
|                    TOP HEADER BAR (56px)                     |
+--------------------------------------------------------------+
| SIDEBAR   |                                                  |
| (220px)   |  Dashboard       [Search...] [Export CSV] [Report]|
|           |                                                  |
| Kiri      |  ┌────────────┐  ┌─────────────────┐  ┌────────┐ |
| Di bawah  |  │ Stat Card  │  │ Chart Card (bar)│  │ Donut  │ |
| Header    |  │ (narrow)   │  │ (wide)          │  │ Card   │ |
|           |  └────────────┘  └─────────────────┘  └────────┘ |
| Hanya     |                                                  |
| Menu      |  ┌─────────────────────────────┐  ┌────────────┐ |
| Nav       |  │ Table: Recent Orders        │  │ Upcoming   │ |
|           |  │ (2/3 width)                 │  │ Events     │ |
|           |  └─────────────────────────────┘  └────────────┘ |
+--------------------------------------------------------------+
```

- **Padding konten:** `24–32px` (kiri, kanan, atas dari topbar).
- **Grid atas:** 3 kolom — `1fr : 2fr : 1.5fr` (stat kecil : chart bar : donut chart).
- **Grid bawah:** `2fr : 1fr` (tabel orders : panel produk/event).
- **Gap antar kartu:** `16–24px`.

### 4.4 Page Header Section

```
Dashboard                          [🔍 Search product...]  [↑ Export CSV]  [↓ Download Report]
```

- **Judul halaman:** Inter `24px`, `font-weight: 700`, warna `#111111`.
- **Search bar:** Lebar `w-full sm:w-[280px]`, background `#F5F5F5` (`bg-bg-well`), border `1px solid #E5E7EB`, `border-radius: 999px` (pill/rounded-full), padding `py-4 pl-10 pr-4` (vertical 16px), text `14px` (`text-sm`).
- **Action buttons:** `border-radius: 999px` (pill/rounded-full), padding `px-6 py-4` (vertical 16px, horizontal 24px), text `12px` (`text-xs`), `font-weight: 700` (`font-bold`).
  - *Export CSV:* Background `#d4f6ac` (lime green).
  - *Download Report:* Background `#bc151b` (red), text warna putih.

---

## 5. Border Radius System

> **Konsistensi ketat.** Setiap komponen memiliki nilai radius yang spesifik dan tidak boleh berubah-ubah.

| Komponen | Border Radius | Catatan |
|---|---|---|
| **Kartu konten (cards)** | `16px` | Semua kartu data, chart, tabel |
| **Kartu panel lebar** | `20px` | Kartu chart bar & donut yang lebih besar |
| **Top nav bar** | `0px` | Bar navigasi, no rounding |
| **Tombol pill (Export, Download)** | `999px` (rounded-full) | Penuh, kapsul sempurna |
| **Search bar** | `999px` (rounded-full) | Penuh, kapsul sempurna |
| **Status badges (tabel)** | `12px` | Rounded rectangle kecil |
| **Growth badges (+10%, -12%)** | `999px` | Pill penuh |
| **Avatar user** | `50%` | Bulat sempurna |
| **Thumbnail produk di tabel** | `8px` | Sedikit melengkung |
| **Input field** | `8px` | Melengkung ringan |
| **Dropdown menus** | `12px` | Panel dropdown |

---

## 6. Component Anatomy

### 6.1 Stat Card (Kartu Statistik Kecil)

```
┌────────────────────────────────┐
│  Total Products Sales    [ikon]│
│                                │
│  202,324  [+10% ↑]             │
│                                │
│  View Sales Details       →    │
└────────────────────────────────┘
```

- **Container:** `border-radius: 16px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`, padding `20–24px`.
- **Label:** Inter `13px`, `font-weight: 500`, warna `#6B7280`, di atas angka.
- **Angka Utama:** Inter `48–56px`, `font-weight: 800`, warna `#111111`, `letter-spacing: -0.02em`.
- **Growth Badge:** Pill `border-radius: 999px`. Positif: background `#BAFF6A`, teks `#2D5A00`, `11px` `font-weight: 600`. Negatif: background `#FFE4E4`, teks `#CC0000`.
- **Ikon Dekorasi (pojok kanan atas):** Kotak abu-abu kecil `border-radius: 8px`, background `#F3F4F6`, ikon outline `20px` warna `#6B7280`.
- **Link "View Details":** Teks `13px` `font-weight: 500` warna `#111111`, ikon `→` di kanan. Separator: garis tipis di atas link area.

### 6.2 Chart Bar Card

- **Container:** `border-radius: 20px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`, padding `24px`.
- **Header:** Label + angka besar + growth badge + menu `...` (titik tiga).
- **Legend:** Bulatan kecil + label teks, font `12px`, warna `#6B7280`.
- **Bar Chart:**
  - Bar solid hitam (`#111111`) = data utama (Total Revenue)
  - Bar arsir abu-abu (`#D1D5DB` dengan pattern diagonal) = data pembanding (Total Profit)
  - Grid horizontal: garis `1px solid #F3F4F6`
  - Label sumbu X (bulan): `10px` `#6B7280`
  - Tidak ada label sumbu Y di luar area chart
  - Bar memiliki `border-radius: 4px` di atas

### 6.3 Donut Chart Card

- **Container:** `border-radius: 20px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`.
- **Header:** "Total Sales Statistics" + dropdown "Monthly ∨".
- **Donut Chart:** 
  - Segmen utama: `#1A1A2E` (navy gelap)
  - Segmen lain: `#E5E7EB` (abu muda)
  - Label tengah: angka besar + growth badge
- **Legend kanan dan kiri:** Label kategori + angka `font-weight: 600`, teks kategori `12px` `#6B7280`.
- **Sub-total bawah:** "Total Number of Sales" label kecil + angka `32px` `font-weight: 800`.

### 6.4 Tabel (Tabular Data & Recent Orders)

- **Container:** `border-radius: 16px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`.
- **Section Header:**
  - Judul: Inter `18px`, `font-weight: 600`, `#111111`
  - Sub-teks: Inter `12px`, `#9CA3AF`
  - Tombol "View All →": pill tombol kecil, `border: 1px solid #E5E7EB`, `border-radius: 999px`, font `12px`
- **Table Header Cells (`th`):**
  - Padding: `py-4 px-6` (tinggi baris longgar).
  - Borders: Memiliki garis pembatas bawah (**`border-b`**) dan kanan (**`border-r`**) dengan ketebalan tipis (`border-zinc-400/70 dark:border-zinc-800/60`).
  - Background: Warna latar belakang lembut `bg-zinc-50/50 dark:bg-zinc-900/30`.
  - Font: `12px` (`text-xs`), `font-weight: 600` (`font-semibold`), warna `text-zinc-650 dark:text-zinc-400`.
- **Table Body Cells (`td`):**
  - Padding: `py-4 px-6`.
  - Borders: Menggunakan pembatas sel penuh. Setiap kolom dipisahkan oleh garis kanan (**`border-r`**, kolom terakhir dikecualikan dengan `last:border-r-0`). Setiap baris dipisahkan oleh garis bawah (**`border-b`**, baris terakhir dikecualikan agar tidak memiliki border bawah ganda di kaki kontainer).
  - Warna Border Sel: `border-zinc-100 dark:border-zinc-800/40`.
  - Hover Row: Baris tabel berganti latar belakang saat di-hover dengan `hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20` dengan efek transisi warna (`transition-colors`).
- **Kolom Order ID:** Font `13px`, `font-weight: 600`, `#111111`, diawali `#`.
- **Kolom Product Name:** Thumbnail gambar `32x32px` `border-radius: 8px` + nama produk. Font `13px`, `font-weight: 500`.
- **Kolom tanggal, payment:** Font `13px`, `font-weight: 400`, `#374151`.
- **Kolom Amount:** Font `13px`, `font-weight: 600`, `#111111`.
- **Kolom Status (Badge):**
  - `border-radius: 12px`
  - Padding: `4px 10px`
  - Font: `11px`, `font-weight: 500`
  - Warna sesuai tabel status di seksi 2.4
- **Kolom Action:** Ikon `...` (titik tiga) atau tombol aksi ikonik dengan background warna lunak (seperti edit/hapus). Hover: warna berubah lebih tegas.

### 6.5 Top Selling Panel (Kanan Bawah)

- **Container:** `border-radius: 16px`, background `#FFFFFF`, `border: 1px solid #E5E7EB`.
- **Header:** "Top Selling Products" + dropdown "Monthly ∨".
- **Product Card:** Thumbnail gambar `48x48px` `border-radius: 8px` + nama produk bold + brand + stok + harga.
- **Mini Bar Chart:** Chart batang horizontal sederhana dengan label hari (Tue, Wed, Thu, Fri) dan nilai. Bar warna `#111111`, tipis dan minimalis.

---

## 7. Elevation & Shadow System

> **Prinsip utama:** Bayangan adalah musuh. Pembeda elemen dicapai melalui **border tipis** dan **perbedaan background warna**, bukan shadow.

| Level | CSS Value | Penggunaan |
|---|---|---|
| **0 (Flat)** | `none` | Default semua elemen |
| **1 (Card)** | `0 1px 2px rgba(0,0,0,0.04)` | Kartu konten — hanya digunakan jika tidak ada border |
| **2 (Popover)** | `0 4px 12px rgba(0,0,0,0.06)` | Dropdown, tooltip, menu |
| **3 (Modal)** | `0 20px 60px rgba(0,0,0,0.10)` | Modal, dialog |

> Semua kartu menggunakan `border: 1px solid #E5E7EB` **ATAU** `box-shadow: elevation-1`, tidak keduanya.

---

## 8. Spacing System (Base 4px Grid)

| Token | Nilai | Contoh Penggunaan |
|---|---|---|
| `space-1` | `4px` | Jarak ikon ke teks dalam badge |
| `space-2` | `8px` | Padding badge, gap legend chart |
| `space-3` | `12px` | Padding vertikal tombol kecil, gap antar badge |
| `space-4` | `16px` | Padding card kecil, gap antar kartu |
| `space-5` | `20px` | Padding standard dalam kartu |
| `space-6` | `24px` | Padding kartu utama, gap section |
| `space-8` | `32px` | Jarak antar baris grid utama |

---

## 9. Interactive States

| State | Efek |
|---|---|
| **Hover (Tombol)** | Background berubah ke `#F5F5F5`, transisi `100ms ease` |
| **Hover (Table Row)** | Background berubah ke `#F8F9FA`, transisi `80ms ease` |
| **Hover (Nav Item)** | Teks warna berubah ke `#111111`, transisi `100ms` |
| **Active (Nav Item)** | Border-bottom `3px solid #111111`, font-weight `600` |
| **Focus (Input)** | Border `1px solid #111111`, `outline: none` |
| **Click (Button)** | `transform: scale(0.98)`, durasi `80ms ease-in` |
| **Hover (Link "View All")** | Teks `#111111` dengan underline |

---

## 10. Animation Specifications

Admin CMS menggunakan animasi yang **sangat minimal** — hampir tidak terasa, hanya cukup untuk memberikan umpan balik interaksi:

| Jenis | Durasi | Easing | Penggunaan |
|---|---|---|---|
| **Color Transition** | `100ms` | `ease` | Semua perubahan hover warna |
| **Fade In (Kartu)** | `150ms` | `ease-out` | Kartu muncul saat load/mount |
| **Slide Down (Dropdown)** | `150ms` | `ease-out` | Menu dropdown turun |
| **Skeleton Pulse** | `1200ms loop` | `ease-in-out` | Loading state placeholder |
| **Button Scale** | `80ms` | `ease-in` | Feedback klik tombol |
| **Chart Draw** | `600ms` | `ease-out` | Animasi bar chart saat load pertama |
| **Toast Notif** | `200ms` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Notifikasi spring dari bawah |

> **Aturan Ketat:** Tidak ada animasi yang melebihi `300ms` untuk interaksi. Tidak ada animasi scroll, parallax, atau text reveal — ini konteks kerja, bukan presentasi.

---

## 11. Dark Mode Tokens

| Token CSS | Light Mode | Dark Mode |
|---|---|---|
| `--bg-page` | `#F2F4F7` | `#0F1117` |
| `--bg-card` | `#FFFFFF` | `#1A1D27` |
| `--bg-input` | `#F5F5F5` | `#22263A` |
| `--text-primary` | `#111111` | `#F0F0F0` |
| `--text-secondary` | `#6B7280` | `#8B8FA8` |
| `--text-placeholder` | `#9CA3AF` | `#55596E` |
| `--border-default` | `#E5E7EB` | `#2A2E42` |
| `--accent-green` | `#BAFF6A` | `#A3E85A` |
| `--accent-red` | `#FF6B6B` | `#FF5252` |
| `--chart-main` | `#111111` | `#FFFFFF` |
| `--chart-secondary` | `#D1D5DB` | `#3A3F55` |

Dark mode toggle berada di area profil user di kanan nav bar.

---

## 12. Perbandingan dengan Versi Sebelumnya

| Elemen | Versi Sebelumnya (PayPen-style) | Versi Ini (Ecomora-style) |
|---|---|---|
| **Navigasi** | Sidebar vertikal 220px | **Top nav horizontal** |
| **Font heading section** | Playfair Display Serif italic | **Inter sans-serif bold** — tidak ada serif |
| **Aksen warna** | Dark Teal `#2D6A5E` | **Lime Green `#BAFF6A`** (eksklusif badge saja) |
| **Border radius kartu** | 8–10px (konservatif) | **16–20px (modern & lembut)** |
| **Angka statistik** | Regular card layout | **Display number raksasa 48–56px** |
| **Chart style** | Area chart berwarna teal | **Bar chart hitam + abu arsir** |
| **Welcome banner** | Ada, latar gelap | **Tidak ada** |
| **Background halaman** | `#F0F0EE` warm off-white | **`#F2F4F7` cool gray** |
| **Shadow kartu** | `shadow-sm` ada | **Border tipis, shadow minimal/tidak ada** |
| **Serif DNA** | Playfair Display heading section | **Dihilangkan sepenuhnya** |

---

## 13. Open Questions

> Hal-hal berikut perlu dikonfirmasi sebelum implementasi:

1. **Logo:** Apakah menggunakan ikon kustom + "Panggung Kreator" sebagai nama brand, atau cukup teks "PK" bergaya monogram?
2. **Modul navigasi:** Urutan dan nama item di top nav? (Dashboard, CMS, Akademi, Komunitas, Data Center, Analytics, Settings, System)
3. **Navigasi Tab & Sub-Nav:** Navigasi induk berupa tab horizontal di top-bar, sedangkan sub-modul (e.g., Kelola Member) ditampilkan sebagai baris tautan sub-navigasi di bawah top-bar.
4. **Dark mode:** Wajib fase pertama atau opsional?
5. **Chart library:** Menggunakan Recharts (sudah ada) atau perlu pertimbangkan library lain (Chart.js, Nivo)?
6. **Bahasa:** Indonesia sepenuhnya, atau bilingual?
