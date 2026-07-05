# Implementation Plan — Halaman Tentang (`/tentang`)

**Dokumen:** `docs/implementation_plan_web_komunitas/implementation_plan_tentang.md`
**Tanggal:** 2026-06-27
**Berdasarkan:**
- Konten → [`docs/contentofwebkomunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/contentofwebkomunitas.md) (Bagian "Halaman Tentang")
- Desain → [`docs/design-web-komunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/design-web-komunitas.md)
- Profil Komunitas → [`docs/Profil_Komunitas_Panggung_Kreator.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/Profil_Komunitas_Panggung_Kreator.md)

---

## Latar Belakang

Halaman Tentang (`/tentang`) saat ini berisi **placeholder kosong** ("Halaman ini sedang dalam pengembangan."). Tujuan pekerjaan ini adalah **membangun halaman lengkap** yang berfungsi sebagai pengenalan mendalam komunitas Panggung Kreator — ditujukan untuk calon member, media, partner, dan institusi yang ingin mengenal lebih jauh sebelum bergabung atau bermitra.

> **Prinsip utama:** Halaman ini mengikuti sepenuhnya *design system* **Bold Monochrome Grid-Based Editorial** yang sudah diterapkan di landing page — termasuk pola tipografi, border grid, warna monokrom, animasi GSAP ScrollTrigger, dan Lenis smooth scroll.

---

## Audiens

Pengunjung yang ingin tahu lebih jauh sebelum bergabung atau bermitra:
- Calon member yang butuh konteks lebih dalam
- Media yang ingin menulis liputan
- Partner/sponsor yang ingin memahami organisasi
- Institusi pendidikan (kampus)

---

## Struktur Section Halaman Tentang

```
tentang/page.tsx:
01. TentangHeroSection         ← Hero khas halaman Tentang
02. TentangAboutSection        ← Deskripsi lengkap komunitas
03. TentangHistorySection      ← Sejarah perjalanan (reuse StorySection pattern)
04. TentangPhilosophySection   ← Filosofi nama & tagline
05. TentangVisionSection       ← Visi & Misi
06. TentangValuesSection       ← Nilai-nilai komunitas (reuse ValuesSection)
07. TentangTimelineSection     ← Timeline 5 fase pengembangan
08. TentangTeamSection         ← Struktur organisasi
09. TentangCTASection          ← CTA penutup
```

> Semua komponen baru dibuat di folder `front/components/tentang/` agar terpisah dari komponen landing page (`community/`). Hook `useScrollAnimations` tetap dipakai dari `@/components/community/useScrollAnimations`.

---

## Detail Perubahan Per Komponen

---

### 1. `TentangHeroSection.tsx` — NEW

**File:** `front/components/tentang/TentangHeroSection.tsx`

**Deskripsi:**
Hero section dengan gaya editorial yang konsisten dengan landing page. Menggunakan headline raksasa dengan serif accent.

**Konten:**

| Elemen | Teks |
|--------|------|
| Badge atas | `TENTANG KAMI` |
| Headline | `SATU KOMUNITAS. BANYAK` *panggung.* `SATU TUJUAN.` |
| Subheadline | `Komunitas pengembangan diri berbasis di Bandung yang membantu setiap individu berani tampil, kreatif berkarya, dan membangun personal branding yang berdampak.` |

> Kata *panggung* ditulis dengan font serif italic lowercase sesuai design system.

**Layout & Styling:**
- Full-width section dengan padding besar (`p-8 md:p-16 lg:p-24`)
- Background `bg-white dark:bg-[#2c2c2c]`
- Border bawah `border-b border-[#2c2c2c] dark:border-white`
- Headline menggunakan fluid typography `text-[clamp(2.25rem,6vw,5.5rem)]`
- `leading-[0.85]`, `uppercase`, `tracking-tighter`, `font-black`
- Badge label: `text-xs uppercase tracking-[0.3em] font-black text-[#2c2c2c]/40 dark:text-white/40`
- Subheadline: `font-sans text-sm md:text-base text-[#2c2c2c]/60 dark:text-white/60 max-w-2xl leading-relaxed uppercase tracking-wider`
- Min height: `min-h-[60vh] md:min-h-[70vh]` dengan `flex flex-col justify-center`

**Animasi:**
- `textReveal` pada headline
- `fadeUp` pada badge dan subheadline

---

### 2. `TentangAboutSection.tsx` — NEW

**File:** `front/components/tentang/TentangAboutSection.tsx`

**Deskripsi:**
Section dua kolom (editorial split) yang memperkenalkan Panggung Kreator secara lengkap. Mengikuti pola layout `StorySection` (grid 2 kolom dengan parallax image placeholder di satu sisi).

**Layout:**
- Grid 2 kolom: `grid grid-cols-1 md:grid-cols-2`
- **Kolom kiri:** Parallax image placeholder (foto suasana komunitas)
- **Kolom kanan:** Teks deskripsi panjang

**Konten kolom kanan:**

| Elemen | Teks |
|--------|------|
| Section label | `[ TENTANG PANGGUNG KREATOR ]` |
| Headline | `RUANG TUMBUH BAGI MEREKA YANG BERANI BERPROSES` |
| Paragraf 1 | `Panggung Kreator merupakan komunitas pengembangan diri (self-development) inovatif yang berfokus pada tiga pilar utama: Public Speaking, Content Creation, dan Personal Branding. Komunitas ini hadir sebagai ruang belajar, berlatih, bertumbuh, dan berkolaborasi bagi siapa saja yang ingin meningkatkan kemampuan komunikasi, membangun kepercayaan diri, serta melejitkan potensi diri di era digital.` |
| Paragraf 2 | `Kami percaya bahwa lingkungan yang tepat adalah kunci dari sebuah pertumbuhan. Oleh karena itu, Panggung Kreator mengedepankan metode praktik langsung (action-oriented). Setiap anggota diberikan panggung dan kesempatan yang sama untuk tampil, berekspresi, dan melatih kapasitas dirinya secara berkala.` |
| Paragraf 3 | `Dengan semangat kolaborasi, Panggung Kreator membantu setiap individu bertransformasi menjadi versi terbaik mereka – berani tampil, adaptif, dan siap menghadapi tantangan di dunia profesional maupun kehidupan sehari-hari.` |

**Image placeholder kiri:**

| Elemen | Teks |
|--------|------|
| Label atas kiri | `[ VISUAL TENTANG ]` |
| Label atas kanan | `01/03` |
| Placeholder desc | `[ Foto suasana komunitas — anggota berkumpul, berdiskusi, suasana hangat dan inklusif di kafe Bandung. ]` |
| Label bawah kiri | `PANGGUNG KREATOR` |
| Label bawah kanan | `EST. 2024` |

**Styling:**
- Mengikuti pola `StorySection` — kolom kiri dengan `overflow-hidden`, parallax inner div height 120%
- Border pemisah: `border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white`
- Teks paragraf: `font-sans text-sm text-[#2c2c2c]/70 dark:text-white/70 space-y-5 leading-relaxed`
- Highlight penting: gunakan `<span className="highlight-stabilo">` pada frasa kunci

**Animasi:**
- `fadeUp` pada image container
- `parallax` pada inner image div
- `fadeUp` pada text container

---

### 3. `TentangHistorySection.tsx` — NEW

**File:** `front/components/tentang/TentangHistorySection.tsx`

**Deskripsi:**
Section cerita sejarah komunitas — dari 6 orang di kafe hingga 300+ anggota. Layout serupa `StorySection` tapi dengan urutan terbalik (teks di kiri, image di kanan).

**Layout:**
- Grid 2 kolom: `grid grid-cols-1 md:grid-cols-2`
- **Kolom kiri:** Teks narasi sejarah
- **Kolom kanan:** Parallax image placeholder (foto kafe awal)

**Konten kolom kiri:**

| Elemen | Teks |
|--------|------|
| Section label | `[ SEJARAH PERJALANAN ]` |
| Headline | `DARI 6 ORANG DI KAFE, MENJADI 300+` *anggota* |
| Paragraf 1 | `Dimulai dari momentum sederhana di sudut kota Bandung. Awalnya hanya tongkrongan ~6 orang yang rutin berkumpul di kafe, dengan keresahan yang sama: ingin lancar berbicara di depan umum dan saling mendukung untuk keluar dari zona nyaman.` |
| Paragraf 2 | `Tanpa konsep awal yang kaku, pertemuan tersebut bertransformasi menjadi ruang diskusi yang hangat dan inklusif. Peserta yang datang makin beragam – pelajar, mahasiswa, pekerja kantoran, content creator, pemula di dunia MC, hingga para profesional.` |
| Paragraf 3 | `Melihat kebutuhan besar akan ruang berkembang, wadah informal ini diresmikan menjadi komunitas Panggung Kreator dengan program kreatif yang distrukturkan secara rapi.` |
| Kalimat penutup (italic serif) | `"Kini dari 6 orang, telah berkembang menjadi 300+ anggota aktif. Banyak alumni dan anggota yang berhasil berkarier sebagai MC profesional, public speaker, maupun content creator handal."` |

**Image placeholder kanan:**

| Elemen | Teks |
|--------|------|
| Label atas kiri | `[ VISUAL SEJARAH ]` |
| Label atas kanan | `02/03` |
| Placeholder desc | `[ Foto suasana awal — 6 orang duduk melingkar di kafe kecil Bandung, berdiskusi hangat, suasana intim dan autentik. ]` |
| Label bawah kiri | `FOUNDER STORY` |
| Label bawah kanan | `EST. 2024` |

**Animasi:**
- `fadeUp` pada teks container
- `fadeUp` + `parallax` pada image container

---

### 4. `TentangPhilosophySection.tsx` — NEW

**File:** `front/components/tentang/TentangPhilosophySection.tsx`

**Deskripsi:**
Section filosofi nama dan tagline. Layout 3 kolom grid editorial yang menjelaskan makna "Panggung", "Kreator", dan "1 Stage, 1 Progress".

**Layout:**
- Header section (full-width) + 3-column grid di bawahnya
- Mengikuti pola `PillarsSection` (3 kolom dengan border pemisah)

**Konten header:**

| Elemen | Teks |
|--------|------|
| Section label | `[ FILOSOFI NAMA & TAGLINE ]` |
| Headline | `APA MAKNA DI BALIK NAMA KAMI` |
| Subheadline | `Setiap kata dalam identitas kami memiliki makna yang membentuk semangat dan arah perjuangan komunitas.` |

**Konten 3 kolom:**

```tsx
const philosophy = [
  {
    num: "01",
    icon: "🎭",
    title: "PANGGUNG",
    desc: "Melambangkan keberanian untuk tampil di depan publik, menyuarakan gagasan, mengambil peran, serta menunjukkan potensi terbaik tanpa ragu.",
  },
  {
    num: "02",
    icon: "✨",
    title: "KREATOR",
    desc: "Melambangkan individu yang tidak sekadar menjadi penonton, melainkan aktif belajar, berkarya, berinovasi, dan menciptakan dampak positif bagi lingkungan sekitar.",
  },
  {
    num: "03",
    icon: "🎯",
    title: "1 STAGE, 1 PROGRESS",
    desc: "Setiap panggung yang dipijak — sekecil apa pun — adalah satu langkah kemajuan nyata menuju versi terbaik dari diri sendiri. Tidak ada proses yang sia-sia; setiap penampilan adalah sebuah progres.",
  },
];
```

**Styling per kolom:**
- Pola kartu mengikuti `PillarsSection`: nomor besar (`text-5xl md:text-6xl font-black text-[#2c2c2c]/15`), judul, dan deskripsi
- Border pemisah vertikal antara kolom: `border-b md:border-b-0 md:border-r border-[#2c2c2c] dark:border-white`
- Hover state: `hover:bg-neutral-50 dark:hover:bg-neutral-950/40`
- Padding: `p-8 md:p-10`

**Animasi:**
- `fadeUp` pada header
- `staggerIn` pada 3 kolom

---

### 5. `TentangVisionSection.tsx` — NEW

**File:** `front/components/tentang/TentangVisionSection.tsx`

**Deskripsi:**
Section dua bagian — Visi di atas (full-width prominent block) dan 5 Misi dalam grid di bawahnya.

**Layout:**
- **Bagian atas (Visi):** Full-width block dengan background kontras (dark section `bg-[#2c2c2c] dark:bg-white` — inverted)
- **Bagian bawah (Misi):** Grid 5 kolom mengikuti pola `ValuesSection`

**Konten Visi:**

| Elemen | Teks |
|--------|------|
| Section label | `[ VISI ]` |
| Headline | `MENJADI KOMUNITAS PENGEMBANGAN DIRI TERDEPAN` |
| Deskripsi | `Yang menginspirasi dan menggerakkan masyarakat untuk berani berbicara, kreatif berkarya, serta mampu membangun personal branding yang kuat dan berdampak luas.` |

**Styling Visi:**
- Background inverted: `bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c]`
- Padding: `p-8 md:p-16 lg:p-24`
- Headline: `text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]`
- Deskripsi: `font-serif italic text-lg md:text-2xl leading-relaxed`
- Border bawah: `border-b border-white dark:border-[#2c2c2c]`

**Konten Misi (5 kolom):**

```tsx
const missions = [
  {
    num: "01",
    title: "EDUKASI APLIKATIF",
    desc: "Menyediakan ruang belajar yang praktis, interaktif, berkelanjutan, dan menyenangkan bagi semua kalangan.",
  },
  {
    num: "02",
    title: "OPTIMALISASI POTENSI",
    desc: "Mengembangkan kemampuan public speaking anggota secara terukur melalui metode praktik langsung di setiap sesi.",
  },
  {
    num: "03",
    title: "INKUBASI KREATIF",
    desc: "Menjadi wadah pembinaan bagi calon content creator dan pembentukan personal branding di era digital.",
  },
  {
    num: "04",
    title: "EKOSISTEM SUPORTIF",
    desc: "Membangun kultur komunitas yang positif, suportif, inklusif, dan penuh semangat kolaborasi.",
  },
  {
    num: "05",
    title: "SINERGI JARINGAN",
    desc: "Menciptakan peluang networking dan kemitraan strategis guna mendukung karier serta perkembangan diri anggota.",
  },
];
```

**Styling Misi:**
- Grid: `grid grid-cols-1 md:grid-cols-5`
- Mengikuti pola `ValuesSection` — nomor besar, judul, deskripsi
- Header misi: `[ MISI ]` + `5 LANGKAH MENUJU VISI KAMI`
- Border pemisah antar kolom

**Animasi:**
- `fadeUp` pada blok visi
- `fadeUp` pada header misi
- `staggerIn` pada 5 kolom misi

---

### 6. `TentangValuesSection.tsx` — REUSE dari `ValuesSection`

**Pendekatan:** Import langsung komponen `ValuesSection` yang sudah ada di `@/components/community/ValuesSection.tsx` ke dalam halaman tentang. Tidak perlu membuat komponen baru karena konten dan layout sudah 100% sesuai dengan spesifikasi halaman Tentang.

---

### 7. `TentangTimelineSection.tsx` — NEW

**File:** `front/components/tentang/TentangTimelineSection.tsx`

**Deskripsi:**
Section timeline 5 fase pengembangan komunitas. Menggunakan layout horizontal 5 kolom yang mirip `JourneySection` (4 kolom) tapi diadaptasi untuk 5 fase.

**Konten header:**

| Elemen | Teks |
|--------|------|
| Section label | `[ TIMELINE PENGEMBANGAN ]` |
| Headline | `PERJALANAN YANG TERUS BERLANJUT` |
| Subheadline | `Dari pertemuan informal 6 orang hingga ekosistem komunitas dengan 300+ anggota — setiap fase adalah fondasi untuk fase berikutnya.` |

**Konten 5 fase:**

```tsx
const phases = [
  {
    num: "01",
    phase: "FASE AWAL",
    title: "TONGKRONGAN 6 ORANG",
    desc: "Pertemuan informal 6 orang pemula di kafe Bandung — berbagi keresahan yang sama tentang rasa takut berbicara di depan umum.",
    placeholder: "Ilustrasi 6 orang duduk melingkar di kafe, berdiskusi santai.",
  },
  {
    num: "02",
    phase: "FASE PERTAMA",
    title: "DEKLARASI KOMUNITAS",
    desc: "Wadah informal diresmikan menjadi komunitas Panggung Kreator. Peluncuran Open Mic perdana sebagai program unggulan.",
    placeholder: "Momen deklarasi komunitas — mic stand di atas panggung kecil kafe.",
  },
  {
    num: "03",
    phase: "FASE EKSPANSI",
    title: "DIVERSIFIKASI KELAS",
    desc: "Perluasan program: MC Practice, Voice Over Challenge, Content Creator Class — menjangkau audiens yang lebih beragam.",
    placeholder: "Kolase beberapa kegiatan kelas yang berbeda-beda.",
  },
  {
    num: "04",
    phase: "FASE KINI",
    title: "300+ ANGGOTA AKTIF",
    desc: "Penyatuan 300+ anggota aktif, peluncuran resmi sistem membership, dan pemantapan tiga pilar utama.",
    placeholder: "Foto grup besar anggota komunitas — ramai dan energik.",
  },
  {
    num: "05",
    phase: "FASE DEPAN",
    title: "EKOSISTEM DIGITAL",
    desc: "Peluncuran website resmi, aplikasi belajar mandiri, dan persiapan bootcamp berskala nasional.",
    placeholder: "Mockup layar website dan aplikasi belajar komunitas.",
  },
];
```

**Layout:**
- Mobile: Stack vertikal (1 kolom) — seperti timeline vertikal
- Desktop: Grid 5 kolom horizontal `grid grid-cols-1 md:grid-cols-5`
- Setiap kartu memiliki: nomor besar, badge fase, placeholder kotak landscape, judul, dan deskripsi
- Border pemisah vertikal: `border-b md:border-b-0 md:border-r` (4 kartu pertama)

**Styling:**
- Mengikuti pola `JourneySection` persis — layout kartu, nomor besar transparan, badge, placeholder box, judul, deskripsi
- Phase badge: `text-[9px] font-black tracking-widest text-[#2c2c2c]/40 border border-[#2c2c2c]/10 px-2 py-0.5 uppercase`

**Animasi:**
- `fadeUp` pada header
- `staggerIn` pada 5 kolom

---

### 8. `TentangTeamSection.tsx` — NEW

**File:** `front/components/tentang/TentangTeamSection.tsx`

**Deskripsi:**
Section struktur organisasi — menampilkan Founder dan Tim Inti.

**Konten header:**

| Elemen | Teks |
|--------|------|
| Section label | `[ STRUKTUR ORGANISASI ]` |
| Headline | `ORANG-ORANG DI BALIK PANGGUNG` |
| Subheadline | `Tim inti yang menggerakkan visi komunitas setiap harinya.` |

**Konten tim:**

```tsx
const founder = {
  name: "ALDI",
  role: "FOUNDER & KETUA",
  placeholder: "[ Foto portrait Aldi — formal namun hangat, background netral. ]",
};

const team = [
  { name: "RIANDI", role: "TIM INTI" },
  { name: "RESTU", role: "TIM INTI" },
  { name: "AHMAD", role: "TIM INTI" },
  { name: "EDO", role: "TIM INTI" },
  { name: "RIJAL", role: "TIM INTI" },
  { name: "RAHMA", role: "TIM INTI" },
  { name: "BAGAS", role: "TIM INTI" },
  { name: "ADEL", role: "TIM INTI" },
  { name: "TITO", role: "TIM INTI" },
  { name: "AWI", role: "TIM INTI" },
];
```

**Layout:**
- **Founder block:** Prominent full-width atau 2-kolom split (portrait placeholder besar + nama/role)
  - Grid 2 kolom: `grid grid-cols-1 md:grid-cols-2`
  - Kolom kiri: Portrait placeholder kotak besar (`aspect-square`)
  - Kolom kanan: Nama besar, role, quote singkat
- **Tim inti:** Grid 5 kolom × 2 baris `grid grid-cols-2 md:grid-cols-5`
  - Setiap sel: Portrait placeholder kecil (aspect-square) + nama + role
  - Border pemisah antar sel

**Styling:**
- Portrait placeholder: `bg-neutral-100 dark:bg-neutral-900` dengan label teks deskriptif
- Nama: `text-base md:text-lg font-black uppercase tracking-wider`
- Role: `text-[10px] font-black tracking-widest text-[#2c2c2c]/40 dark:text-white/40 uppercase`
- Hover state pada kartu: `hover:bg-neutral-50 dark:hover:bg-neutral-950/40`
- Border sistem: `border border-[#2c2c2c] dark:border-white` antar kartu

**Animasi:**
- `fadeUp` pada header dan founder block
- `staggerIn` pada kartu tim inti

---

### 9. `TentangCTASection.tsx` — NEW

**File:** `front/components/tentang/TentangCTASection.tsx`

**Deskripsi:**
Section CTA penutup halaman Tentang. Gaya mengikuti `ClosingCTA` di landing page — full-bleed background gelap kontras.

**Konten:**

| Elemen | Teks |
|--------|------|
| Section label | `[ BERGABUNG SEKARANG ]` |
| Headline | `SIAP BERGABUNG?` |
| Deskripsi | `Bergabunglah bersama 300+ anggota yang sudah membuktikan bahwa bertumbuh lebih menyenangkan jika dilakukan bersama.` |
| CTA Utama | `DAFTAR GRATIS SEBAGAI MEMBER` → link WhatsApp |
| CTA Sekunder | `Tertarik bermitra?` → `/kolaborasi` |

**Layout & Styling:**
- Full-bleed background: `bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c]` (inverted)
- Padding: `p-8 md:p-16 lg:p-24`
- Centered layout: `text-center max-w-2xl mx-auto`
- Tombol CTA: `bg-white text-[#2c2c2c] dark:bg-[#2c2c2c] dark:text-white` dengan hover inverted
- Link sekunder: `text-[10px] uppercase tracking-widest underline`

**Animasi:**
- `fadeUp` pada container konten

---

## Perubahan File Page

### `front/app/(community)/tentang/page.tsx` — MODIFY

**Dari:** Placeholder teks sederhana
**Menjadi:** Komposisi lengkap 9 section

```tsx
import React from "react";
import TentangHeroSection from "@/components/tentang/TentangHeroSection";
import TentangAboutSection from "@/components/tentang/TentangAboutSection";
import TentangHistorySection from "@/components/tentang/TentangHistorySection";
import TentangPhilosophySection from "@/components/tentang/TentangPhilosophySection";
import TentangVisionSection from "@/components/tentang/TentangVisionSection";
import ValuesSection from "@/components/community/ValuesSection";
import TentangTimelineSection from "@/components/tentang/TentangTimelineSection";
import TentangTeamSection from "@/components/tentang/TentangTeamSection";
import TentangCTASection from "@/components/tentang/TentangCTASection";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      <TentangHeroSection />
      <TentangAboutSection />
      <TentangHistorySection />
      <TentangPhilosophySection />
      <TentangVisionSection />
      <ValuesSection />
      <TentangTimelineSection />
      <TentangTeamSection />
      <TentangCTASection />
    </div>
  );
}
```

---

## Ringkasan File yang Dibuat/Diubah

| Aksi | File | Keterangan |
|------|------|------------|
| **NEW** | `front/components/tentang/TentangHeroSection.tsx` | Hero editorial halaman Tentang |
| **NEW** | `front/components/tentang/TentangAboutSection.tsx` | Deskripsi lengkap komunitas (2-col split) |
| **NEW** | `front/components/tentang/TentangHistorySection.tsx` | Sejarah dari 6 orang di kafe (2-col split terbalik) |
| **NEW** | `front/components/tentang/TentangPhilosophySection.tsx` | Filosofi nama & tagline (3-col grid) |
| **NEW** | `front/components/tentang/TentangVisionSection.tsx` | Visi (inverted block) + 5 Misi (5-col grid) |
| **REUSE** | `front/components/community/ValuesSection.tsx` | Nilai komunitas — import langsung tanpa duplikasi |
| **NEW** | `front/components/tentang/TentangTimelineSection.tsx` | Timeline 5 fase pengembangan (5-col grid) |
| **NEW** | `front/components/tentang/TentangTeamSection.tsx` | Struktur organisasi Founder + Tim Inti |
| **NEW** | `front/components/tentang/TentangCTASection.tsx` | CTA penutup (inverted block) |
| **MODIFY** | `front/app/(community)/tentang/page.tsx` | Komposisi lengkap 9 section |

**Total:** 8 file baru, 1 file diubah, 1 file di-reuse.

---

## Aturan Desain yang WAJIB Dipatuhi

Berdasarkan [`design-web-komunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/design-web-komunitas.md):

1. **Monokrom murni** — hanya `#FFFFFF`, `#2c2c2c`, `#666666`, dan gray scale Tailwind
2. **No rounded corners** — semua elemen `rounded-none`
3. **No drop shadows** — hirarki via ukuran tipografi dan kontras
4. **Border grid divisions** — garis 1px solid hitam/putih memisahkan setiap section dan kolom
5. **Serif italic accent** — kata kunci dalam headline ditulis lowercase italic serif
6. **Giant headlines** — fluid typography dengan clamp, uppercase, tracking-tighter
7. **Section labels** — `text-xs uppercase tracking-[0.3em] font-black` dalam kurung siku `[ ]`
8. **Body text uppercase** — deskripsi kartu `text-xs uppercase tracking-wider`
9. **Animasi GSAP** — `fadeUp`, `textReveal`, `parallax`, `staggerIn` dari `useScrollAnimations` hook
10. **Dark mode** — semua komponen harus memiliki varian `dark:` yang membalik warna secara konsisten

---

## Verification Plan

### Build Test
```bash
cd front && npm run build
```
- Pastikan tidak ada error TypeScript
- Pastikan halaman `/tentang` ter-generate sebagai static page

### Visual Verification
- Buka `localhost:3000/tentang` dan verifikasi:
  - Semua 9 section render dengan benar
  - Dark mode toggle berfungsi di semua section
  - Animasi scroll trigger aktif pada tiap section
  - Responsif pada mobile (grid collapse ke single column)
  - Navigasi dari landing page → tentang → kembali berjalan lancar (loading state + animasi reset)
  - Border grid konsisten dengan landing page
