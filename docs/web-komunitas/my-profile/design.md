# Design Specification — Redesign Halaman `/myprofile` (Author Spotlight Card Style)

> Dokumen ini menetapkan **spesifikasi desain baru** untuk halaman profil member (`/myprofile`). Mengacu pada pola visual **Author Spotlight** (Layout 2 Kartu Berdampingan dengan foto lingkaran beraksen kuning, spotlight box gelap, 3 Key Takeaways dengan garis vertikal, 2x2 Mission Grid dengan ikon, dan Quote Statement).

---

## 1. Konsep Desain Utama (Author Spotlight Style)

Desain `/myprofile` memperbarui tampilan lama menjadi **Card Spotlight Layout** yang elegan, modern, dan sangat visual:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ TAB NAVIGATION BAR                                                                       │
│ [ 🌟 Overview Spotlight ]  [ 📅 Absensi Event ]  [ 👤 Edit Profil ]  [ 🎨 Portfolio ]      │
├──────────────────────────────────────────┬───────────────────────────────────────────────┤
│ KARTU KIRI: PROFILE SPOTLIGHT (5 cols)   │ KARTU KANAN: KEY TAKEAWAYS & DETAILS (7 cols) │
│                                          │                                               │
│  "Kreator Spotlight" (Serif)             │  "3 Key Highlights"                           │
│                                          │  │ Point 1: Ringkasan Kehadiran & Rate         │
│  ┌─────────────────────────┐             │  │ Point 2: Membership Tier & Komunitas        │
│  │    [ 👤 Foto Avatar ]   │ (Kuning)    │  │ Point 3: Total Karya & Program Affiliate     │
│  └─────────────────────────┘             │                                               │
│  "Meet [Nama Stage]" (Serif)             │  "Pilar & Kontribusi Utama" (2x2 Grid)        │
│  Deskripsi / Bio Tagline                 │  ┌─────────────────┐ ┌─────────────────┐     │
│                                          │  │ 🧠 Public Speak │ │ 🗣️ MC & Host    │     │
│  ┌────────────────────────────────────┐  │  └─────────────────┘ └─────────────────┘     │
│  │ DARK SPOTLIGHT BOX                 │  │  ┌─────────────────┐ ┌─────────────────┐     │
│  │ "Visi & Fokus Utama" (Kuning)      │  │  │ ✨ Branding     │ │ 🎬 Content      │     │
│  │ "Kreator ini berfokus pada..."    │  │  └─────────────────┘ └─────────────────┘     │
│  └────────────────────────────────────┘  │  "Quote Statement" (Text besar italic)        │
│                                          │  - [Nama Stage]                               │
└──────────────────────────────────────────┴───────────────────────────────────────────────┘
```

---

## 2. Detail Spesifikasi Komponen

### 2.1 Kartu Kiri: Profile Spotlight Card

1. **Header**: Title `"Kreator Spotlight"` atau `"Member Spotlight"` dalam font `Playfair Display` (`font-serif text-2xl md:text-3xl font-normal text-neutral-800 dark:text-neutral-100 mb-2`).
2. **Avatar Circle Accent**:
   - Lingkaran aksen kuning cerah (`bg-[#FACC15]` / `bg-amber-400`).
   - Foto avatar square/circle terpotong rapi di tengah lingkaran kuning (`w-36 h-36 md:w-44 md:h-44 rounded-full object-cover`).
   - Inisial fallback font-serif jika foto tidak tersedia.
3. **Stage Name Heading**:
   - `"Meet [Stage Name]"` dalam font `Playfair Display` (`font-serif text-2xl md:text-3xl text-neutral-900 dark:text-white mt-4 font-normal`).
4. **Sub-heading / Bio**:
   - Deskripsi profil ringkas (`text-sm text-neutral-600 dark:text-neutral-400 max-w-sm leading-relaxed mt-2 font-sans`).
5. **Dark Spotlight Box (Bottom Card)**:
   - Box kontras tinggi (`bg-[#09090B] dark:bg-black text-white rounded-2xl p-6 text-left border border-neutral-800 shadow-lg mt-6 w-full`).
   - Judul Box: `"Visi & Fokus Utama"` dengan warna teks aksen kuning (`text-amber-400 font-bold text-lg font-sans mb-2`).
   - Teks Narasi: Ringkasan minat & profesi dengan kata kunci yang di-highlight aksen kuning (`text-xs text-neutral-300 leading-relaxed font-sans`).
   - Tombol Kontak / Medsos di bagian bawah box.

### 2.2 Kartu Kanan: Key Highlights & Mission Grid

1. **Section 1: 3 Key Highlights (Style: Key Takeaways)**:
   - Judul Section: `"3 Key Highlights"` (`font-sans font-bold text-xl md:text-2xl text-neutral-900 dark:text-white mb-4 pb-2 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between`).
   - 3 List item dengan garis indikator vertikal di sebelah kiri (`border-l-4 border-amber-400 pl-4 py-1 space-y-1`):
     - **Highlight 1**: Ringkasan Kehadiran Event (misal: "Telah menghadiri X Event Komunitas dengan Attendance Rate X%").
     - **Highlight 2**: Tier Status (misal: "Terdaftar sebagai Member Priority Panggung Kreator Bandung").
     - **Highlight 3**: Aktivitas / Referal (misal: "Aktif mengajak X teman bergabung & berkontribusi dalam pilar keahlian").
2. **Section 2: Pilar & Focus (2x2 Grid Cards)**:
   - Judul Section: `"Pilar & Focus Keahlian"` (`font-sans font-bold text-xl md:text-2xl text-neutral-900 dark:text-white mt-6 mb-4`).
   - Grid 2x2 dari soft cards (`grid grid-cols-1 sm:grid-cols-2 gap-4`):
     - Card 1: Icon Brain 🧠 (`bg-[#F4F4F5] dark:bg-[#27272A] rounded-2xl p-4 flex flex-col gap-2 border border-neutral-200/60 dark:border-neutral-800`).
     - Card 2: Icon Voice / MC 🎙️.
     - Card 3: Icon Sparkles ✨.
     - Card 4: Icon Balance / Scale ⚖️.
     - Tiap kartu memuat deskripsi ringkas tentang pilar yang diambil member.
3. **Section 3: Quote Statement**:
   - Blockquote statement inspiratif (`"Membangun keberanian berbicara dan berkarya dari panggung kecil menuju versi terbaik diri."`).
   - Font: `font-sans font-bold text-base md:text-lg text-neutral-800 dark:text-neutral-200 leading-snug italic mt-6 mb-1`.
   - Attribution: `font-serif text-xs text-neutral-500` (`— [Stage Name]`).

### 2.3 Integration Navigation Bar (Tabs)

Untuk mengakomodasi seluruh fitur MyProfile (Overview, Absensi Tracker, Edit Profil, Portfolio, Affiliate):

```tsx
<div className="flex justify-center gap-2 mb-8 overflow-x-auto pb-2">
  <button>[ 🌟 Overview Spotlight ]</button>
  <button>[ 📅 Absensi Event ]</button>
  <button>[ 👤 Edit Profil ]</button>
  <button>[ 🎨 Portfolio ]</button>
  <button>[ 🎁 Affiliate Program ]</button>
</div>
```

---

## 3. Matriks Warna & Token Desain

| Elemen | Color Token / Class |
|---|---|
| Page Background | `bg-[#ECECEC] dark:bg-[#0A0A0A]` |
| Card Container | `bg-white dark:bg-[#18181B] rounded-3xl p-8 border border-neutral-200 dark:border-neutral-800` |
| Avatar Yellow Circle | `bg-[#FACC15]` / `bg-amber-400` |
| Dark Spotlight Box | `bg-[#09090B] dark:bg-black text-white rounded-2xl border border-neutral-800` |
| Yellow Highlight Text | `text-amber-400 font-semibold` |
| Vertical Accent Bar | `border-l-4 border-amber-400` / `border-l-4 border-neutral-400` |
| 2x2 Soft Cards | `bg-[#F4F4F5] dark:bg-[#27272A] rounded-2xl p-4` |
| Primary Font | `font-sans` (Geist / Inter) |
| Headings & Titles | `font-serif` (Playfair Display) |

---

## 4. Panduan Implementasi Komponen

1. **`ProfileLayout.tsx`**: Update layout wrapper menjadi kontainer `max-w-6xl` dengan background `#ECECEC` dan tab bar terintegrasi.
2. **`ProfileSidebar.tsx`**: Redesign menjadi **Spotlight Left Card** (Header "Kreator Spotlight", foto dalam lingkaran kuning, "Meet [Nama]", dan Dark Spotlight Box di bagian bawah).
3. **`ProfileOverviewContent.tsx`** (Komponen Baru): Redesign area konten overview menjadi **Spotlight Right Card** (3 Key Highlights dengan garis vertikal, 2x2 Pilar Cards, dan Quote Statement).
4. **`page.tsx`**: Integrasikan `Overview Spotlight` sebagai tab default, dan tetap sediakan tab Absensi, Edit Profil, Portfolio, dan Affiliate.

---

*Dokumen diperbarui: Agustus 2026. Berdasarkan acuan Author Spotlight Layout.*

