# Implementation Plan — Halaman Galeri (`/galeri`)

**Dokumen:** `docs/implementation_plan_web_komunitas/implementation_plan_galeri.md`
**Tanggal:** 2026-06-27
**Berdasarkan:**
- Konten → [`docs/contentofwebkomunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/contentofwebkomunitas.md) (Bagian "Halaman Galeri")
- Desain → [`docs/design-web-komunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/design-web-komunitas.md)
- Profil Komunitas → [`docs/Profil_Komunitas_Panggung_Kreator.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/Profil_Komunitas_Panggung_Kreator.md)

---

## Latar Belakang

Halaman Galeri (`/galeri`) saat ini berisi **placeholder kosong** ("Halaman ini sedang dalam pengembangan."). Tujuan pekerjaan ini adalah **membangun halaman lengkap** yang berfungsi sebagai bukti visual bahwa komunitas aktif, hidup, dan punya energi nyata — ditujukan untuk calon member yang ingin merasakan *vibe* komunitas dan kafe/sponsor yang melihat kualitas event.

> **Prinsip utama:** Halaman ini mengikuti sepenuhnya *design system* **Bold Monochrome Grid-Based Editorial** yang sudah diterapkan di landing page dan halaman tentang — termasuk pola tipografi, border grid, warna monokrom, animasi GSAP ScrollTrigger, dan Lenis smooth scroll.

> **Catatan teknis:** Semua gambar dikelola via CMS Admin. Untuk sementara, tampilkan placeholder teks deskriptif dengan kategori yang benar.

---

## Audiens

- Calon member yang ingin merasakan *vibe* komunitas sebelum bergabung
- Kafe dan sponsor yang melihat kualitas event sebagai pertimbangan kerja sama

---

## Struktur Section Halaman Galeri

```
galeri/page.tsx:
01. GaleriHeroSection           ← Hero khas halaman Galeri
02. GaleriFilterSection         ← Tombol filter kategori + Galeri grid gabungan (semua kategori)
03. GaleriCTASection            ← CTA penutup
```

> Semua komponen baru dibuat di folder `front/components/galeri/`. Hook `useScrollAnimations` tetap dipakai dari `@/components/community/useScrollAnimations`.

> **Pendekatan desain:** Alih-alih membuat 5 section grid terpisah per kategori (yang akan sangat panjang secara vertikal), digunakan pendekatan **satu galeri grid besar** dengan **filter kategori** di atasnya. Filter ini memungkinkan pengunjung menampilkan/sembunyikan item berdasarkan kategori tanpa reload halaman.

---

## Detail Perubahan Per Komponen

---

### 1. `GaleriHeroSection.tsx` — NEW

**File:** `front/components/galeri/GaleriHeroSection.tsx`

**Deskripsi:**
Hero section editorial halaman galeri. Simpel dan impactful — judul besar di atas, deskripsi singkat di bawah.

**Konten:**

| Elemen | Teks |
|--------|------|
| Badge atas | `[ GALERI KEGIATAN ]` |
| Headline | `BEGINILAH CARA KAMI BERTUMBUH` *bersama* |
| Subheadline | `Dokumentasi kegiatan nyata komunitas — dari panggung Open Mic, ruang kelas intensif, hingga momen networking yang mempertemukan orang-orang luar biasa.` |

> Kata *bersama* menggunakan font serif italic lowercase sesuai design system.

**Layout & Styling:**
- Full-width section dengan padding besar (`p-8 md:p-16 lg:p-24`)
- Background `bg-white dark:bg-[#2c2c2c]`
- Border bawah `border-b border-[#2c2c2c] dark:border-white`
- Headline menggunakan fluid typography `text-[clamp(2.25rem,6vw,5.5rem)]`
- `leading-[0.85]`, `uppercase`, `tracking-tighter`, `font-black`
- Min height: `min-h-[50vh] md:min-h-[60vh]` dengan `flex flex-col justify-center`

**Animasi:**
- `textReveal` pada headline
- `fadeUp` pada badge dan subheadline

---

### 2. `GaleriFilterSection.tsx` — NEW

**File:** `front/components/galeri/GaleriFilterSection.tsx`

**Deskripsi:**
Ini adalah section utama halaman galeri — terdiri dari:
1. **Baris tombol filter** untuk menyaring berdasarkan kategori
2. **Grid galeri** menampilkan semua item foto/placeholder, bisa difilter

**Filter Kategori (tombol):**

```tsx
const categories = [
  { label: "SEMUA", value: "all" },
  { label: "OPEN MIC", value: "open-mic" },
  { label: "PUBLIC SPEAKING", value: "public-speaking" },
  { label: "MC PRACTICE", value: "mc-practice" },
  { label: "NETWORKING", value: "networking" },
  { label: "CONTENT CLASS", value: "content-class" },
  { label: "LAINNYA", value: "lainnya" },
];
```

**Data Galeri (placeholder):**

```tsx
const galleryItems = [
  // Open Mic Night
  {
    category: "open-mic",
    title: "OPEN MIC NIGHT",
    tag: "🎤 PUBLIC SPEAKING",
    placeholder: "[ Foto suasana Open Mic — peserta tampil di panggung mini dengan mikrofon, audiens antusias, pencahayaan dramatis. ]",
  },
  {
    category: "open-mic",
    title: "OPEN MIC — BACKSTAGE",
    tag: "🎤 PUBLIC SPEAKING",
    placeholder: "[ Foto peserta Open Mic di belakang panggung sedang mempersiapkan diri, saling menyemangati. ]",
  },
  {
    category: "open-mic",
    title: "OPEN MIC — AUDIENS",
    tag: "🎤 PUBLIC SPEAKING",
    placeholder: "[ Foto audiens Open Mic — tertawa, bertepuk tangan, ekspresi terlibat dan gembira. ]",
  },

  // Public Speaking & MC Practice
  {
    category: "public-speaking",
    title: "PS PRACTICE — KELAS",
    tag: "🎤 PUBLIC SPEAKING",
    placeholder: "[ Foto kelas Public Speaking — peserta sedang presentasi di depan kelompok, gestur tangan aktif. ]",
  },
  {
    category: "public-speaking",
    title: "PS PRACTICE — FEEDBACK",
    tag: "🎤 PUBLIC SPEAKING",
    placeholder: "[ Foto sesi feedback — peserta mendengarkan evaluasi terstruktur setelah tampil. ]",
  },
  {
    category: "mc-practice",
    title: "MC PRACTICE",
    tag: "🎤 PUBLIC SPEAKING",
    placeholder: "[ Foto peserta MC Practice — memegang mic memandu sesi, penonton duduk di depannya. ]",
  },

  // Networking Session
  {
    category: "networking",
    title: "NETWORKING SESSION",
    tag: "💡 RELASI & GATHERING",
    placeholder: "[ Foto interaksi hangat anggota saat gathering — suasana akrab, pertukaran kartu nama, saling berbincang. ]",
  },
  {
    category: "networking",
    title: "NETWORKING — SHARING",
    tag: "💡 RELASI & GATHERING",
    placeholder: "[ Foto sesi sharing santai di kafe — anggota berbagi pengalaman dan insight di lingkungan informal. ]",
  },

  // Content Creator Class
  {
    category: "content-class",
    title: "CONTENT CREATOR CLASS",
    tag: "🎬 CONTENT CREATION",
    placeholder: "[ Foto kelas Content Creator — peserta belajar teknik editing, memegang kamera mirrorless sambil berdiskusi. ]",
  },
  {
    category: "content-class",
    title: "CONTENT — BEHIND THE SCENES",
    tag: "🎬 CONTENT CREATION",
    placeholder: "[ Foto proses syuting mini — anggota sedang merekam konten dengan smartphone dan ring light di kafe. ]",
  },

  // Kegiatan Lainnya
  {
    category: "lainnya",
    title: "VOICE OVER CHALLENGE",
    tag: "🎙️ OLAH SUARA",
    placeholder: "[ Foto peserta di depan mikrofon kondenser, membaca naskah iklan dengan ekspresi penuh. ]",
  },
  {
    category: "lainnya",
    title: "SHARING SESSION",
    tag: "💡 MINDSET & RELASI",
    placeholder: "[ Foto sesi sharing — pembicara tamu membagikan pengalaman profesional, peserta mencatat. ]",
  },
];
```

**Layout Filter Bar:**
- Sticky/inline horizontal row di atas grid
- Background: `bg-white dark:bg-[#2c2c2c]` dengan padding dan border bawah
- Tombol filter: `text-[10px] md:text-xs font-black uppercase tracking-[0.2em]`
- Tombol aktif: `bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c]`
- Tombol non-aktif: `border border-[#2c2c2c]/20 dark:border-white/20 text-[#2c2c2c]/60 dark:text-white/60 hover:border-[#2c2c2c] dark:hover:border-white`
- Layout flex horizontal dengan `gap-3` dan horizontal scroll pada mobile (`overflow-x-auto`)
- Tanpa rounded corners: `rounded-none`

**Layout Galeri Grid:**
- Mengikuti pola visual dari [`GallerySection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/GallerySection.tsx) di landing page
- Grid responsif: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Setiap item kartu berupa kotak `aspect-[4/3]` (landscape) yang berisi:
  - Background placeholder abu-abu (`bg-neutral-100 dark:bg-neutral-900`)
  - Teks placeholder deskriptif di tengah
  - Overlay gradient gelap di bawah (`from-[#2c2c2c]/90 to-transparent`)
  - Judul item, tag kategori, dan corner bracket details
  - Hover effects: `group-hover:scale-105` pada background, deskripsi muncul `group-hover:opacity-100`
- Border grid: `border border-[#2c2c2c] dark:border-white` antar item (menggunakan border-right dan border-bottom logic)

**Filter Behavior (Client-Side):**
- `useState` untuk menyimpan kategori aktif (default: `"all"`)
- Saat filter berubah, item yang tidak sesuai kategori di-hide (`hidden` class atau conditional render)
- Transisi smooth: gunakan CSS `transition-opacity` + `opacity-0`/`opacity-100` atau GSAP untuk animasi filter change (opsional, keep simple)

**Animasi:**
- `fadeUp` pada filter bar
- `staggerIn` pada grid items (saat pertama kali mount)

---

### 3. `GaleriCTASection.tsx` — NEW

**File:** `front/components/galeri/GaleriCTASection.tsx`

**Deskripsi:**
CTA penutup halaman Galeri. Inverted full-bleed dark section.

**Konten:**

| Elemen | Teks |
|--------|------|
| Section label | `[ GABUNG SEKARANG ]` |
| Headline | `MAU JADI BAGIAN DARI CERITA INI?` |
| Deskripsi | `Setiap foto di atas adalah momen nyata dari anggota kami. Kamu bisa menjadi bagian dari cerita selanjutnya.` |
| CTA Utama | `DAFTAR GRATIS SEBAGAI MEMBER` → link WhatsApp |
| CTA Sekunder | `Kembali ke beranda` → `/` |

**Layout & Styling:**
- Full-bleed background inverted: `bg-[#2c2c2c] dark:bg-white text-white dark:text-[#2c2c2c]`
- Padding: `p-8 md:p-16 lg:p-24`
- Centered layout: `text-center max-w-2xl mx-auto`
- Tombol CTA: `bg-white text-[#2c2c2c] dark:bg-[#2c2c2c] dark:text-white` dengan hover inverted
- Link sekunder: `text-[10px] uppercase tracking-widest underline`

**Animasi:**
- `fadeUp` pada container konten

---

## Perubahan File Page

### `front/app/(community)/galeri/page.tsx` — MODIFY

**Dari:** Placeholder teks sederhana
**Menjadi:** Komposisi lengkap 3 section

```tsx
import React from "react";
import GaleriHeroSection from "@/components/galeri/GaleriHeroSection";
import GaleriFilterSection from "@/components/galeri/GaleriFilterSection";
import GaleriCTASection from "@/components/galeri/GaleriCTASection";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      <GaleriHeroSection />
      <GaleriFilterSection />
      <GaleriCTASection />
    </div>
  );
}
```

---

## Ringkasan File yang Dibuat/Diubah

| Aksi | File | Keterangan |
|------|------|------------|
| **NEW** | `front/components/galeri/GaleriHeroSection.tsx` | Hero editorial halaman Galeri |
| **NEW** | `front/components/galeri/GaleriFilterSection.tsx` | Filter kategori + Grid galeri dengan placeholder visual |
| **NEW** | `front/components/galeri/GaleriCTASection.tsx` | CTA penutup (inverted block) |
| **MODIFY** | `front/app/(community)/galeri/page.tsx` | Komposisi lengkap 3 section |

**Total:** 3 file baru, 1 file diubah.

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
11. **Filter tombol** — tanpa rounded corners, uppercase, tracking lebar, border solid monokrom

---

## Verification Plan

### Build Test
```bash
cd front && npm run build
```
- Pastikan tidak ada error TypeScript
- Pastikan halaman `/galeri` ter-generate sebagai static page

### Visual Verification
- Buka `localhost:3000/galeri` dan verifikasi:
  - Semua 3 section render dengan benar
  - Filter kategori berfungsi: klik tombol menyaring item sesuai kategori
  - Dark mode toggle berfungsi di semua section
  - Animasi scroll trigger aktif pada tiap section
  - Responsif pada mobile (grid collapse ke single column, filter horizontal scroll)
  - Navigasi dari landing page → galeri → kembali berjalan lancar (loading state + animasi reset)
  - Border grid konsisten dengan landing page dan halaman tentang
  - Placeholder teks deskriptif tampil dengan benar di setiap kartu galeri
