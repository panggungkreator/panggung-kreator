# Panduan Desain & Standar UI/UX Portal Member (`/myprofile`)
**Project ID:** panggung-kreator-member-profile
**Aesthetic Style:** Clean Minimalist Monochrome & Smooth Palette (Monochrome Matte Bento)
**Diselaraskan dengan:** Implementasi terkini pada `ProfileOverviewContent.tsx`

---

## 0. Filosofi & Karakter Visual

Portal Member (`/myprofile`) dirancang dengan pendekatan **Monochrome Matte Bento**, memadukan arsitektur tata letak terstruktur dengan palet warna diredam (muted/matte):
- **Monochrome Base**: Penggunaan latar belakang abu-abu terang yang sangat bersih (`#F6F5FA`) di mode terang dan hitam kehijauan (`#0E1210`) di mode gelap, memastikan teks hitam/putih kontras tinggi dapat dibaca dengan sangat jelas.
- **Smooth Pastel Tints (Matte Accents)**: Penggunaan aksen warna diredam (tidak mencolok) seperti *Honeydew* (Hijau pudar), *Vanilla* (Kuning pudar), dan *Soft Slate* (Biru keabuan pudar) untuk menyorot kartu spesifik tanpa memecah kesan minimalis.
- **Typographic Hierarchy**: Kombinasi nama yang besar, tebal, bertumpuk (stacked bold typography) dengan teks label berbasis `monospace` (*typewriter-style*) berhuruf kapital, memberi kesan editorial atau *magazine-like layout*.
- **Structured Bento & Connected Dots**: Elemen antarmuka dikelompokkan dalam grid Bento Box bersudut `rounded-2xl`. Proses/timeline direpresentasikan menggunakan gaya visual *Connected Dot List* yang sangat presisi dengan efek terpotong (cut-out) menggunakan ring outline.

---

## 1. Pedoman Warna & Token Visual (Color Tokens)

| Token / Elemen | Light Mode | Dark Mode | Penggunaan |
|---|---|---|---|
| **Page Background** | `#F6F5FA` (`bg-[#F6F5FA]`) | `#0E1210` (`bg-[#0E1210]`) | Latar belakang kanvas utama halaman |
| **Card Surface** | `#FFFFFF` (`bg-white`) | `#151B18` (`bg-[#151B18]`) | Base kartu profil utama, bento grid standar |
| **Primary Text** | `#212121` (`text-[#212121]`)| `#F4F4F4` (`text-[#F4F4F4]`) | Heading besar, nama talent, teks konten utama |
| **Secondary Text** | `#737373` (`text-neutral-500`)| `#A3A3A3` (`text-neutral-400`) | Sub-label, username, metadata deskripsi |
| **Accent: Honeydew**| `#CFDECA` (`bg-[#CFDECA]`)| `#253822` (`bg-[#253822]`) | Metrik utama, tombol copy, badge role/inspirasi |
| **Accent: Vanilla** | `#EFF0A3` (`bg-[#EFF0A3]`)| `#38371F` (`bg-[#38371F]`) | Badge monetisasi, tile heatmap kehadiran, titik timeline |
| **Accent: Soft Slate**| `#D8DFE9` (`bg-[#D8DFE9]`)| `#D8DFE9/10` | Kartu pemicu gugup / skala kepedean (mental diagnostic) |
| **Border & Divider**| `#212121/10` | `white/10` | Pembatas seksi, pinggiran kartu Bento, panel foto |

---

## 2. Tipografi & Hierarki Teks

- **Sans-Serif (`font-sans`)**: Digunakan sebagai pondasi teks. Heading menggunakan varian ekstra tebal (`font-black`, `uppercase`, `tracking-tight`) agar menyerupai layout majalah (misal: teks "BENTOKAWAN" besar).
- **Monospace (`font-mono`)**: Ciri khas utama portal member ini. Digunakan untuk:
  - Label bagian: `[ TENTANG / BIO ]`, `[ KEHADIRAN & AKTIVITAS ]` (ukurannya sangat kecil, misal `text-[10px]`, `tracking-widest`).
  - Username: `@bentokawani`
  - Indikator metadata: ikon kecil dan teks informasi kontak.
- **Uppercase & Tracking**: Label kecil (*pill*) selalu dalam huruf kapital dengan spasi antar huruf yang lebar (tracking-wider/widest).

---

## 3. Sistem Komponen Visual Spesifik

### a. Hero Layout (Profil Utama)
- **Talent Canvas (Foto)**: Kotak potret tegak lurus proporsi `aspect-[3/4]` (tinggi minimum `320px`), di sudut kiri. Jika kosong, menampilkan inisial berlatar gradasi abu-hitam.
- **Detail Inline**: Terangkum rapat (Justify-End anchor ke bawah). Berurutan dari: Nama besar -> Username + Pekerjaan (Inline meta) -> Bio singkat -> Divider -> Metadata Kontak -> Divider -> Tombol Sosmed & Referral.

### b. Connected Dot List (Timeline / Checklist Presisi)
Digunakan pada rincian "Tantangan Berbicara" dan "Roadmap Kreator":
- **Garis Vertikal**: Absolute positioning di sisi kiri (contoh: `left-[7px] w-[2px]`).
- **Titik (Dot)**: Presisi di tengah sumbu, dibantu efek `ring-4 ring-white dark:ring-[#151B18]` agar memotong (cut-out) garis vertikal di belakangnya secara mulus.

### c. Activity Cadence (Heatmap)
Menampilkan 16 sesi manggung layaknya *GitHub Contributions*:
- Grid 8 sampai 16 kolom (`grid-cols-8 sm:grid-cols-16`).
- Box rasio 1:1 (`aspect-square`), melengkung `rounded-md`.
- Sesi terisi berwarna Vanilla (`#EFF0A3`), sesi kosong berwarna keabuan.

---

## 4. Arsitektur Tata Letak Desktop (`lg:` ≥ 1024px)

```text
+----------------------------------------------------------------------------------------------------+
|                                    (bg-[#F6F5FA] / Dark: #0E1210)                                  |
|                                                                                                    |
|          +----------------------------------------------------------------------------------+      |
|          | ( 🏠 ) Nav Tab        [ 📸 FOTO TALENT ]  BENTOKAWAN                               |      |
|          | ( 📅 ) (Kiri Float)   [ Aspect 3/4     ]  @bentokawani • KREATOR KONTEN            |      |
|          | ( 🎨 )                [ min-h: 320px   ]  Bio singkat atau deskripsi diri profil.  |      |
|          | ( 🤝 )                [ rounded-2xl    ]  -----------------------------------------|      |
|          |                       [                ]  [📍] Jakarta  [✉️] email [📞] Nomor      |      |
|          |                       [                ]  -----------------------------------------|      |
|          |                       [                ]  ( IG ) ( TT ) ( YT )      [ Copy Ref ]   |      |
|          |                       +----------------+-------------------------------------------+      |
|          |                                                                                    |      |
|          | Ringkasan Kehadiran                                     [ KEHADIRAN & AKTIVITAS ]  |      |
|          | +--------------------------+ +---------------------------------------------------+ |      |
|          | | TOTAL EVENT   (Honeydew) | | RIWAYAT SESI MANGGUNG (16 SESI)          [Legend] | |      |
|          | | 12                       | | [■] [■] [■] [□] [□] [□] [□] [□]                   | |      |
|          | | TINGKAT KOMITMEN         | | [□] [□] [□] [□] [□] [□] [□] [□]                   | |      |
|          | | 2 Minggu Sekali          | | SESI 01                                   SESI 16 | |      |
|          | +--------------------------+ +---------------------------------------------------+ |      |
|          |                                                                                    |      |
|          | Diagnosis & Tantangan                                       [ DIAGNOSTIK MENTAL ]  |      |
|          | +------------------------------------+ +-----------------------------------------+ |      |
|          | | TANTANGAN BERBICARA (White/Base)   | | PEMICU GUGUP UTAMA         (Soft Slate) | |      |
|          | | ⚪ (Pill) Ngomong Terbata-bata     | | Overthinking sebelum tampil             | |      |
|          | | |                                  | |                                         | |      |
|          | | ⚪ (Pill) Blank di tengah panggung | | SKALA KEPERCAYAAN DIRI [======    ] 6/10| |      |
|          | +------------------------------------+ +-----------------------------------------+ |      |
|          +----------------------------------------------------------------------------------+      |
+----------------------------------------------------------------------------------------------------+
```

## 5. Arsitektur Tata Letak Mobile (`< 1024px`)

- **Navigasi Atas**: Bar minimalis menampilkan judul halaman (PORTAL MEMBER) dan ikon Menu Hamburger.
- **Talent Canvas (Foto)**: Mengambil lebar penuh layar (`w-full`) di layar terkecil, menyusun (stacking) teks identitas (Nama, Bio, Kontak) di bawah foto secara berurutan.
- **Kartu Bento**: Layout Grid beralih menjadi 1 kolom (`grid-cols-1`) di layar kecil, sehingga metrik (Honeydew) muncul di atas riwayat sesi manggung.
- **Dock Navigasi**: Tab beralih menjadi mengambang di bawah (Floating Bottom Dock) untuk mempermudah tap menggunakan ibu jari, atau tersembunyi di drawer menu samping.

---

## 6. Standar Desain Form & Input (Bento Form)

Pengisian form dalam halaman edit profil atau admin (seperti pendaftaran paket) mengikuti pola tata letak terstruktur dengan pembagian seksi bernomor.

### a. Top Header (Header Form)
- **Tombol Kembali (Back)**: Berbentuk lingkaran presisi (`w-9 h-9 rounded-full`) dengan efek hover yang lembut (`hover:bg-bg-well`).
- **Typography Header**: 
  - Sub-label (*eyebrow*): Teks super kecil, monospace/kapital, tracking ekstra lebar (contoh: `[ PENGATURAN PAKET PRICING ]` atau `[ EDIT PROFIL ]`). Class: `text-[9px] uppercase tracking-[0.25em] font-bold text-text-muted`.
  - Judul Utama: Besar dan tebal (contoh: `text-xl sm:text-2xl font-bold tracking-tight text-text-primary`).

### b. Main Form Container
Keseluruhan form dibungkus dalam sebuah kontainer "Bento Card" besar yang responsif:
- **Desktop (`sm:`)**: Memiliki latar belakang card (`bg-bg-card`), garis batas (`border border-border-default/70`), sudut sangat membulat (`rounded-3xl`), bayangan halus (`shadow-xs`), dan padding lega (`p-8`).
- **Mobile**: Latar belakang transparan (`bg-transparent`), tanpa pinggiran, tanpa sudut bulat (menyesuaikan layar), padding rapat (`p-1`).

### c. Numbered Sections (Seksi Bernomor)
Setiap kelompok input dipisah berdasarkan nomor urut untuk memudahkan fokus pengguna.
- **Header Seksi**: Memiliki garis pembatas bawah (`border-b border-border-default/40`).
- **Indikator Angka**: Kotak kecil bersudut lengkung (`w-6 h-6 rounded-lg bg-zinc-100 dark:bg-zinc-800`) menampung angka (1, 2, dst).
- **Judul Seksi**: Huruf kapital, tebal, dan berjarak lebar (`text-sm font-bold uppercase tracking-wider`).

### d. Elemen Input & Label
- **Label Field**: Sangat rapi, font semi-bold berukuran 11px (`text-[11px] font-semibold text-text-secondary mb-1.5`). Jika wajib (required), tambahkan bintang merah (`<span className="text-red-500">*</span>`).
- **Input Text / Select**: 
  - Tinggi konsisten: `h-10 px-3.5`.
  - Warna dan Shape: `bg-bg-well/50 border border-border-default rounded-xl`.
  - Font: `text-xs font-medium`.
  - Interaksi: Garis batas menjadi tebal/menonjol saat fokus (`focus:border-text-primary focus:outline-none`).
- **Validasi Error (Krusial)**: 
  - Jika terjadi error, teks validasi diletakkan tepat di bawah input (tidak floating, tidak mengambil white-space tambahan).
  - Menggunakan warna solid red (`text-red-600 dark:text-red-500`).
  - Atribut form harus selalu menggunakan `noValidate` pada `<form>` untuk menonaktifkan tooltip bawaan browser.

### e. Form Actions (Tombol Simpan)
- Diletakkan di bagian paling bawah form, dengan garis pembatas di atasnya (`border-t border-border-default/60`).
- Format barisan dikanankan (`justify-end gap-3`).
- **Tombol Batal / Secondary**: `h-10 px-5 rounded-xl bg-bg-well text-text-secondary border border-border-default`.
- **Tombol Simpan / Primary**: `h-10 px-6 rounded-xl bg-zinc-900 text-white dark:bg-yellow-100 dark:text-zinc-900`. Sering disematkan ikon kecil di samping teks utama.
