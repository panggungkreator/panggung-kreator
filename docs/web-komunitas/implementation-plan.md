# Implementation Plan — Pembaruan Isi Landing Page Web Komunitas

**Dokumen:** `new/implementation_plan_web_komunitas.md`
**Tanggal:** 2026-06-26
**Berdasarkan:**
- Konten → [`docs/lp-web-komunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/lp-web-komunitas.md) (v2.2)
- Desain → [`docs/design-web-komunitas.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/design-web-komunitas.md)
- Profil Komunitas → [`docs/Profil_Komunitas_Panggung_Kreator.md`](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/Profil_Komunitas_Panggung_Kreator.md)

---

## Latar Belakang

Landing page web komunitas saat ini menggunakan konten **placeholder** yang tidak mencerminkan identitas nyata Panggung Kreator. Tujuan pekerjaan ini adalah **memperbarui konten** di semua komponen yang sudah ada, sekaligus **menata ulang urutan section** dan **menambahkan 1 komponen baru (Membership)** — semua tanpa mengubah sistem desain (*design system*), pola animasi, atau arsitektur teknis yang sudah berjalan.

> **Prinsip utama:** Ini adalah operasi *content & structure update*, bukan redesign. Gaya visual, token warna, tipografi, border grid, dan animasi GSAP dipertahankan sepenuhnya.

---

## Peta Perubahan: Before vs After

### Urutan Section Saat Ini
```
page.tsx:
01. HeroSection
02. MarqueeSection
03. PillarsSection       ← "APA YANG KAMI LAKUKAN" (4 kolom)
04. GallerySection
05. StatsBarSection
06. StorySection         ← Cerita + Filosofi
07. JourneySection
08. ProgramsSection      ← 3 kartu program (placeholder)
09. ClosingCTA
```

### Urutan Section Setelah Update
```
page.tsx:
01. HeroSection          ← konten diperbarui
02. MarqueeSection       ← konten diperbarui
03. PillarsSection       ← konten & struktur diperbarui (3 pilar, bukan 4)
04. ProgramsSection      ← konten diperbarui total (9 kartu, carousel mobile)
05. StatsBarSection      ← konten sudah sesuai, minor tweak
06. JourneySection       ← konten diperbarui
07. MembershipSection    ← BARU — komponen baru dibuat
08. GallerySection       ← konten diperbarui (label kategori)
09. ValuesSection        ← BARU — komponen baru dibuat (menggantikan StorySection di LP)
10. ClosingCTA           ← konten diperbarui
```

> ⚠️ **StorySection** tidak dihapus dari codebase, tetapi **dicopot dari `page.tsx`** landing page.
> Konten cerita (asal muasal 6 orang di kafe) akan dipakai ulang di halaman `/tentang` nantinya.

---

## Detail Perubahan Per Komponen

---

### 1. `HeroSection.tsx` — MODIFY

**File:** [`front/components/community/HeroSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/HeroSection.tsx)

**Perubahan konten:**

| Elemen | Teks Lama (Placeholder) | Teks Baru |
|--------|------------------------|-----------|
| Badge atas | `KOMUNITAS PUBLIC SPEAKING & KREATOR` | `KOMUNITAS PENGEMBANGAN DIRI · BANDUNG` |
| Headline | `DARI panggung KECIL, MENJADI VERSI TERBAIK DIRIMU` | Tetap sama ✓ |
| Subheadline | Sudah sesuai | Tetap sama ✓ |
| CTA Utama | `GABUNG — MULAI GRATIS` | Tetap sama ✓ |
| CTA Sekunder | `JELAJAHI PROGRAM` (href `#program`) | Tetap sama ✓ |
| Image placeholder label | `[ VISUAL RECORD ]` / `01/03` | `[ OPEN MIC · BANDUNG ]` / `2024—` |
| Image placeholder desc | Teks instruksi foto | `[ Letakkan foto suasana Open Mic — peserta tampil di panggung mini, audiens antusias, pencahayaan dramatis monokrom. ]` |
| Tagline di image | `"1 Stage, 1 Progress"` | Tetap sama ✓ |
| Bottom image label kiri | `PANGGUNG KREATOR` | `PANGGUNG KREATOR` ✓ |
| Bottom image label kanan | `MEMBER IN FOCUS` | `OPEN MIC WEEKLY` |

---

### 2. `MarqueeSection.tsx` — MODIFY

**File:** [`front/components/community/MarqueeSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/MarqueeSection.tsx)

**Perubahan array `items`:**

```tsx
// SEBELUM
const items = [
  "PUBLIC SPEAKING", "CONTENT CREATION", "PERSONAL BRANDING",
  "1 STAGE 1 PROGRESS", "KELAS MINGGUAN", "KOLABORASI KREATIF",
  "NETWORKING KREATOR", "PERTUMBUHAN NYATA",
];

// SESUDAH — selaraskan dengan program nyata
const items = [
  "PUBLIC SPEAKING", "CONTENT CREATION", "PERSONAL BRANDING",
  "1 STAGE 1 PROGRESS", "OPEN MIC WEEKLY", "MC PRACTICE",
  "VOICE OVER CHALLENGE", "NETWORKING SESSION",
  "CONTENT CREATOR CLASS", "SHARING SESSION",
];
```

---

### 3. `PillarsSection.tsx` — MODIFY (Struktural)

**File:** [`front/components/community/PillarsSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/PillarsSection.tsx)

**Perubahan:**
- Grid berubah dari **4 kolom** → **3 kolom** (sesuai 3 pilar resmi)
- Kolom ke-4 ("WHY 1 STAGE?") dihapus dari pilar — kontennya diintegrasikan ke section lain (MembershipSection atau ClosingCTA)
- Data `pillars[]` diperbarui total

```tsx
// SEBELUM — 4 item (termasuk "WHY 1 STAGE?")
// SESUDAH — 3 item sesuai pilar resmi

const pillars = [
  {
    num: "01",
    title: "PUBLIC SPEAKING",
    desc: "Latih keberanian berbicara di depan publik secara langsung. Kami menyediakan panggung mingguan yang aman untuk mencoba, gagal, dan tumbuh bersama.",
    points: ["OPEN MIC WEEKLY", "MC PRACTICE", "VOICE OVER CHALLENGE"],
  },
  {
    num: "02",
    title: "CONTENT CREATION",
    desc: "Ubah gagasan menjadi konten digital yang berdampak. Belajar strategi algoritma, teknik editing, hingga storytelling yang memikat audiens.",
    points: ["CONTENT CREATOR CLASS", "RADIO ANNOUNCER CHALLENGE", "STORYTELLING STRUCTURE"],
  },
  {
    num: "03",
    title: "PERSONAL BRANDING",
    desc: "Petakan nilai unik dirimu dan bangun reputasi digital yang kuat, autentik, dan relevan di era yang terus bergerak cepat.",
    points: ["PERSONAL BRANDING CLASS", "NETWORKING SESSION", "DIGITAL PORTFOLIO"],
  },
];
```

**Label section:**

| Elemen | Lama | Baru |
|--------|------|------|
| Section label | `[ CORE CAPABILITIES ]` | `[ TIGA PILAR UTAMA ]` |
| Headline | `APA YANG KAMI LAKUKAN` | `SATU KOMUNITAS. TIGA SKILL MASA DEPAN.` |
| Subheadline | Teks lama | `Satu tempat untuk melatih public speaking, membangun konten, dan membentuk personal branding yang berdampak.` |

**Perubahan layout:**

```diff
- <div className="grid grid-cols-1 md:grid-cols-4">
+ <div className="grid grid-cols-1 md:grid-cols-3">
```

Border logic kartu juga disesuaikan: hanya 2 kartu pertama punya `border-r`, kartu ke-3 tidak.

---

### 4. `ProgramsSection.tsx` — MODIFY (Besar)

**File:** [`front/components/community/ProgramsSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/ProgramsSection.tsx)

**Perubahan utama:**
- Data `programs[]` diperbarui dari 3 placeholder → **9 program nyata**
- Layout: Desktop tetap grid 3 kolom; Mobile ditambahkan **horizontal scroll carousel**
- Setiap kartu: foto placeholder diperbarui dengan deskripsi foto yang kontekstual
- Label pilar (`category`) ditambahkan per program (sebelumnya hanya ada teks generik)

**Data baru `programs[]`:**

```tsx
const programs = [
  {
    title: "OPEN MIC",
    category: "🎤 PUBLIC SPEAKING",
    desc: "Panggung mingguan untuk berbicara bebas — melatih mental, ritme tampil, dan manajemen demam panggung.",
    linkText: "IKUT OPEN MIC",
    placeholder: "Foto suasana Open Mic — peserta di panggung dengan mikrofon, audiens memperhatikan, pencahayaan dramatis.",
  },
  {
    title: "PUBLIC SPEAKING PRACTICE",
    category: "🎤 PUBLIC SPEAKING",
    desc: "Kelas intensif teknik komunikasi: olah vokal, artikulasi, body language, dan penyusunan presentasi efektif.",
    linkText: "IKUT KELAS",
    placeholder: "Foto kelas Public Speaking — peserta sedang presentasi di depan teman-teman, gestur tangan aktif.",
  },
  {
    title: "MC PRACTICE",
    category: "🎤 PUBLIC SPEAKING",
    desc: "Pelatihan menjadi Master of Ceremony: memandu acara formal/informal, crowd control, dan mencairkan suasana.",
    linkText: "IKUT MC PRACTICE",
    placeholder: "Foto MC Practice — peserta memegang mic memandu sesi, penonton duduk di depannya.",
  },
  {
    title: "VOICE OVER CHALLENGE",
    category: "🎙️ OLAH SUARA",
    desc: "Tantangan mengisi suara naskah iklan/dokumenter — melatih intonasi, ekspresi, dan karakter vokal.",
    linkText: "IKUT CHALLENGE",
    placeholder: "Foto peserta di depan mikrofon kondenser, membaca naskah dengan ekspresi penuh.",
  },
  {
    title: "RADIO ANNOUNCER CHALLENGE",
    category: "🎙️ OLAH SUARA",
    desc: "Simulasi penyiar radio: improvisasi cepat, teknik siaran, dan kecakapan menghibur pendengar.",
    linkText: "IKUT CHALLENGE",
    placeholder: "Foto suasana simulasi siaran radio — peserta di depan mic dengan headphone, santai tapi fokus.",
  },
  {
    title: "CONTENT CREATOR CLASS",
    category: "🎬 CONTENT CREATION",
    desc: "Ide kreatif, strategi algoritma media sosial, hingga proses editing konten digital.",
    linkText: "IKUT KELAS",
    placeholder: "Foto kelas konten — laptop terbuka, kamera di tripod, peserta berdiskusi tentang konten.",
  },
  {
    title: "PERSONAL BRANDING CLASS",
    category: "🌟 PERSONAL BRANDING",
    desc: "Memetakan keunikan diri, membangun portofolio digital, dan menata citra diri profesional.",
    linkText: "IKUT KELAS",
    placeholder: "Foto sesi personal branding — peserta menuliskan value proposition mereka di papan, antusias.",
  },
  {
    title: "SHARING SESSION",
    category: "💡 MINDSET & GROWTH",
    desc: "Diskusi interaktif berbasis pengalaman nyata: kesehatan mental, personal growth, dan motivasi kehidupan.",
    linkText: "IKUT SESI",
    placeholder: "Foto Sharing Session — suasana lingkaran duduk, anggota berbagi cerita, ekspresi hangat.",
  },
  {
    title: "NETWORKING SESSION",
    category: "💡 RELASI",
    desc: "Kegiatan eksklusif bertukar peluang karier, memperluas relasi bisnis, dan menjalin kolaborasi antar-anggota.",
    linkText: "IKUT NETWORKING",
    placeholder: "Foto Networking Session — anggota berdiri dan saling berkenalan, suasana profesional tapi akrab.",
  },
];
```

**Perubahan layout (Mobile Carousel):**

```tsx
// Tambahkan wrapper dengan overflow-x-auto untuk mobile:
<div className="grid grid-cols-1 md:grid-cols-3
  md:overflow-visible
  flex md:grid overflow-x-auto snap-x snap-mandatory
  scrollbar-hide">
  {programs.map(...)}
</div>
```

Setiap kartu di mobile mendapatkan: `snap-start min-w-[80vw] sm:min-w-[60vw]`

**Label section:**

| Elemen | Lama | Baru |
|--------|------|------|
| Section label | `[ COMMUNITY PROGRAMS ]` | `[ PROGRAM KOMUNITAS ]` |
| Headline | `PROGRAM MINGGUAN` | `TEMPAT BERLATIH, BUKAN SEKADAR BELAJAR` |
| Subheadline | Teks lama | `80% praktik. Setiap anggota mendapat panggung dan kesempatan tampil yang sama, setiap minggunya.` |

**Ditambahkan setelah grid:**
```tsx
{/* Coming Soon Badge */}
<div className="border-t border-[#2c2c2c] dark:border-white p-8 md:p-12 text-center">
  <span className="text-[10px] font-black tracking-[0.3em] text-[#2c2c2c]/40 dark:text-white/40 uppercase">
    [ COMING SOON ]
  </span>
  <p className="text-xl md:text-3xl font-black uppercase tracking-tighter text-[#2c2c2c] dark:text-white mt-3">
    BOOTCAMP — Program inkubasi intensif bersama mentor pakar industri.
  </p>
</div>
```

---

### 5. `StatsBarSection.tsx` — MINOR MODIFY

**File:** [`front/components/community/StatsBarSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/StatsBarSection.tsx)

Data sudah sesuai dengan profil komunitas. Perubahan minor:

| Elemen | Lama | Baru |
|--------|------|------|
| Label stat 1 | `ACTIVE MEMBERS` | `ANGGOTA AKTIF` |
| Label stat 2 | `WEEKLY SESSIONS` | `KEGIATAN RUTIN` |
| Label stat 3 | `ALUMNI PRO` | `ALUMNI PRO` ✓ |
| Label stat 4 | `MULTI-VENUE` | `MULTI-VENUE` ✓ |
| Label stat 5 | `MEDIA COVERAGE` | `MEDIA COVERAGE` ✓ |

---

### 6. `JourneySection.tsx` — MODIFY

**File:** [`front/components/community/JourneySection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/JourneySection.tsx)

Perlu dibaca dulu isinya saat implementasi, tapi berdasarkan konteks:

**Perubahan konten yang direncanakan:**
- Label section: `[ PROSES KAMI ]` → `[ 1 STAGE, 1 PROGRESS ]`
- Headline: diperbarui ke: `SETIAP PANGGUNG ADALAH SEBUAH KEMAJUAN`
- 4 fase journey diperbarui:

| Fase | Lama (estimasi) | Baru |
|------|-----------------|------|
| 1 | Daftar / Bergabung | `DATANG & BERGABUNG` — Masuk komunitas, bisa sebagai penonton Open Mic pertama |
| 2 | Latihan pertama | `BERANI TAMPIL` — Pertama kali naik panggung, melatih keberanian |
| 3 | Evaluasi | `EVALUASI & BERTUMBUH` — Feedback, kelas intensif, membangun skill |
| 4 | Menjadi Performer | `MENJADI PERFORMER ⭐` — PD tampil, bangun portofolio, karier kreatif |

**Filosofi tagline** (ditambahkan sebagai quote blok):
> *"Setiap panggung yang kita pijak — sekecil apapun — adalah satu langkah kemajuan nyata menuju versi terbaik dari diri sendiri."*

---

### 7. `MembershipSection.tsx` — NEW COMPONENT

**File:** [`front/components/community/MembershipSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/MembershipSection.tsx)

**Ini adalah komponen baru yang harus dibuat dari scratch.**

**Posisi di `page.tsx`:** Setelah `JourneySection`, sebelum `GallerySection`.

**Konsep layout (mengikuti design system):**

```
┌─────────────────────────────────────────────────────────┐
│  [ MEMBERSHIP ]                                         │
│  IKUT LEBIH DALAM.                                      │
│  TUMBUH LEBIH CEPAT.                                    │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┬──────────────┬──────────────┬────────┐│
│  │ 📒           │ 📱           │ 🧑‍🏫           │ ⭐     ││
│  │ E-JOURNAL &  │ MATERI       │ MENTORING    │ PRIORI ││
│  │ MODUL        │ PREMIUM      │ TERBIMBING   │ -TAS   ││
│  │ EKSKLUSIF    │              │              │ TAMPIL ││
│  │              │              │              │        ││
│  │ [deskripsi]  │ [deskripsi]  │ [deskripsi]  │ [desc] ││
│  └──────────────┴──────────────┴──────────────┴────────┘│
│  + 1 benefit ke-5: UNDANGAN NETWORKING EKSKLUSIF         │
├─────────────────────────────────────────────────────────┤
│  [ CTA — Full width ]                                   │
│  JELAJAHI PLATFORM BELAJAR KAMI →                       │
│  akademi.panggungkreator.web.id                         │
│                                                         │
│  Ingin bergabung gratis dulu? ↓ Scroll ke bawah         │
└─────────────────────────────────────────────────────────┘
```

**Spesifikasi teknis komponen:**

```tsx
"use client";

import React, { useEffect, useRef } from "react";
import { useScrollAnimations } from "./useScrollAnimations";

const benefits = [
  {
    icon: "📒",
    title: "E-JOURNAL & MODUL EKSKLUSIF",
    desc: "Panduan berkala untuk mencatat dan mengukur perkembangan skill pribadimu secara terstruktur.",
  },
  {
    icon: "📱",
    title: "MATERI PEMBELAJARAN PREMIUM",
    desc: "Akses materi pembelajaran digital dari mentor tamu dan praktisi industri.",
  },
  {
    icon: "🧑‍🏫",
    title: "MENTORING TERBIMBING",
    desc: "Berdiskusi langsung dengan pengurus dan mentor tentang progres kemampuan komunikasimu.",
  },
  {
    icon: "⭐",
    title: "PRIORITAS SESI PRAKTIK",
    desc: "Hak utama mengisi kuota tampil di panggung Open Mic dan kelas praktik mingguan.",
  },
  {
    icon: "🎟️",
    title: "UNDANGAN NETWORKING EKSKLUSIF",
    desc: "Akses ke acara internal komunitas untuk memperluas peluang karier dan bisnis.",
  },
];

export default function MembershipSection() {
  const { fadeUp, staggerIn } = useScrollAnimations();

  const headerRef = useRef<HTMLDivElement>(null);
  const benefitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current) fadeUp(headerRef.current, 0.1, 30);
    staggerIn(benefitRefs.current, 0.1, 40);
    if (ctaRef.current) fadeUp(ctaRef.current, 0.2, 20);
  }, [fadeUp, staggerIn]);

  return (
    <section id="membership" className="relative bg-[#2c2c2c] text-white border-b border-white z-10">
      {/* Section Header */}
      <div ref={headerRef} className="p-8 md:p-16 border-b border-white flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] font-black text-white/40 mb-3 block">
            [ MEMBERSHIP ]
          </span>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
            IKUT LEBIH DALAM.<br />
            <span className="font-serif italic font-normal normal-case text-white/60">Tumbuh lebih cepat.</span>
          </h2>
        </div>
        <p className="font-sans text-xs md:text-sm text-white/60 max-w-sm leading-relaxed uppercase tracking-wider">
          Daftarkan dirimu sebagai Member Resmi Panggung Kreator dan dapatkan akses eksklusif ke materi, mentoring, dan platform belajar kami.
        </p>
      </div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5">
        {benefits.map((b, idx) => (
          <div
            key={b.title}
            ref={(el) => { benefitRefs.current[idx] = el; }}
            className={`p-8 md:p-10 flex flex-col group hover:bg-white/5 transition-colors duration-300
              ${idx < 4 ? "border-b md:border-b-0 md:border-r border-white/20" : "border-b md:border-b-0"}`}
          >
            <span className="text-3xl mb-6 block">{b.icon}</span>
            <h3 className="text-sm font-black uppercase tracking-wider text-white mb-3">{b.title}</h3>
            <p className="font-sans text-xs text-white/60 leading-relaxed uppercase tracking-wide">{b.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA Block */}
      <div ref={ctaRef} className="border-t border-white/20 p-8 md:p-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
        <div>
          <span className="text-[10px] font-black tracking-[0.3em] text-white/40 uppercase block mb-2">
            [ PLATFORM BELAJAR ]
          </span>
          <p className="text-white/50 text-xs uppercase tracking-wider mt-3">
            Ingin bergabung gratis dulu? ↓ Scroll ke bawah
          </p>
        </div>
        <a
          href="https://akademi.panggungkreator.web.id"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-[#2c2c2c] text-xs font-bold uppercase tracking-[0.25em] px-10 py-5 border border-white hover:bg-transparent hover:text-white transition-all duration-350 rounded-none inline-block whitespace-nowrap"
        >
          JELAJAHI PLATFORM BELAJAR KAMI →
        </a>
      </div>
    </section>
  );
}
```

---

### 8. `GallerySection.tsx` — MODIFY

**File:** [`front/components/community/GallerySection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/GallerySection.tsx)

**Perubahan konten label kategori:**

| Slot | Lama | Baru |
|------|------|------|
| Label section | (dikonfirmasi saat implementasi) | `[ GALERI KEGIATAN ]` |
| Headline | (dikonfirmasi saat implementasi) | `BEGINILAH CARA KAMI BERTUMBUH BERSAMA` |
| Foto 1 | Placeholder generik | `Open Mic Night` + desc: `Dokumentasi keseruan panggung Open Mic mingguan` |
| Foto 2 | Placeholder generik | `Public Speaking Practice` + desc: `Suasana kelas yang fokus dan interaktif` |
| Foto 3 | Placeholder generik | `Networking Session` + desc: `Interaksi hangat antar-anggota dalam gathering` |
| Foto 4 | Placeholder generik | `Content Creator Class` + desc: `Aksi kreatif belajar membuat konten` |

**CTA ditambahkan:**
```tsx
<a href="/galeri" className="...rounded-none">
  LIHAT SEMUA DOKUMENTASI →
</a>
```

---

### 9. `ValuesSection.tsx` — NEW COMPONENT

**File:** [`front/components/community/ValuesSection.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/ValuesSection.tsx)

**Menggantikan StorySection di landing page.** StorySection.tsx tidak dihapus dari codebase (akan dipakai di `/tentang`).

**Konsep layout:** Grid 5 kolom (1 per nilai) dengan border pemisah, mengikuti pola PillarsSection.

```tsx
const values = [
  {
    icon: "🌱",
    title: "GROWTH",
    sub: "Pertumbuhan",
    desc: "Berkomitmen untuk terus belajar dan bertumbuh melampaui batasan diri setiap harinya.",
  },
  {
    icon: "💪",
    title: "CONFIDENCE",
    sub: "Kepercayaan Diri",
    desc: "Menumbuhkan keberanian internal untuk menyuarakan ide dan tampil secara autentik.",
  },
  {
    icon: "🎨",
    title: "CREATIVITY",
    sub: "Kreativitas",
    desc: "Selalu mendorong inovasi dan cara-cara baru dalam menghasilkan karya yang menarik.",
  },
  {
    icon: "🤝",
    title: "COLLABORATION",
    sub: "Kolaborasi",
    desc: "Menjunjung tinggi kerja sama tim — kita melangkah lebih jauh jika berjalan bersama.",
  },
  {
    icon: "🌟",
    title: "IMPACT",
    sub: "Dampak",
    desc: "Setiap ilmu dan kegiatan memberikan nilai manfaat nyata bagi diri dan masyarakat.",
  },
];
```

**Label section:** `[ NILAI KOMUNITAS ]`
**Headline:** `NILAI YANG KAMI PEGANG SETIAP HARI`

---

### 10. `ClosingCTA.tsx` — MODIFY

**File:** [`front/components/community/ClosingCTA.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/ClosingCTA.tsx)

| Elemen | Lama | Baru |
|--------|------|------|
| Headline | `PANGGUNGMU DIMULAI hari INI.` | Tetap sama ✓ |
| Subheadline | `Tidak ada prasyarat keahlian...` | `Bergabunglah bersama 300+ anggota yang sudah membuktikan bahwa bertumbuh lebih menyenangkan jika dilakukan bersama.` |
| CTA button href | `https://wa.me/628123456789` (placeholder) | `https://wa.me/6287823239575` (nomor real Aldi) |
| CTA button teks | `HUBUNGI KAMI — GRATIS GABUNG` | `GABUNG MEMBER — MULAI GRATIS` |
| WhatsApp di grid bawah | `+62 812-3456-789` (placeholder) | `0878-2323-9575 (Aldi — Founder)` |
| Email di grid bawah | `HALO@PANGGUNGKREATOR.ID` | Tetap sama (konfirmasi ke tim) |
| Ditambahkan: CTA kolaborasi | *(tidak ada)* | Teks kecil: `Ingin kolaborasi? → /kolaborasi \| Unduh Media Kit → /media-kit` |

---

### 11. `Footer.tsx` — MODIFY

**File:** [`front/components/community/Footer.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/components/community/Footer.tsx)

| Elemen | Lama | Baru |
|--------|------|------|
| Link navigasi | `Venue Directory → /venue` | Hapus — diganti `Akademi → akademi.panggungkreator.web.id` |
| Partner placeholder | `CAFE D'PAKAR`, `CO-WORKING HUB`, `KULINERI BDG`, `CREATIVE LABS` | Ubah ke teks netral: `COMING SOON — PARTNER VENUE BANDUNG` atau hapus sementara |

---

### 12. `page.tsx` — RESTRUCTURE

**File:** [`front/app/(community)/page.tsx`](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/app/%28community%29/page.tsx)

```tsx
// SESUDAH
import HeroSection from "@/components/community/HeroSection";
import MarqueeSection from "@/components/community/MarqueeSection";
import PillarsSection from "@/components/community/PillarsSection";
import ProgramsSection from "@/components/community/ProgramsSection";
import StatsBarSection from "@/components/community/StatsBarSection";
import JourneySection from "@/components/community/JourneySection";
import MembershipSection from "@/components/community/MembershipSection"; // NEW
import GallerySection from "@/components/community/GallerySection";
import ValuesSection from "@/components/community/ValuesSection";           // NEW
import ClosingCTA from "@/components/community/ClosingCTA";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      <HeroSection />
      <MarqueeSection />
      <PillarsSection />
      <ProgramsSection />
      <StatsBarSection />
      <JourneySection />
      <MembershipSection />   {/* BARU */}
      <GallerySection />
      <ValuesSection />        {/* BARU — menggantikan StorySection */}
      <ClosingCTA />
    </div>
  );
}
```

---

## Rencana Implementasi (Urutan Pengerjaan)

Dikerjakan **satu per satu** untuk meminimalkan risk regresi:

```
[ ] 1. Buat MembershipSection.tsx (komponen baru)
[ ] 2. Buat ValuesSection.tsx (komponen baru)
[ ] 3. Update page.tsx (restructure import & urutan)
[ ] 4. Update MarqueeSection.tsx (items array)
[ ] 5. Update HeroSection.tsx (minor text update)
[ ] 6. Update PillarsSection.tsx (3 pilar, data baru)
[ ] 7. Update ProgramsSection.tsx (9 program, mobile carousel)
[ ] 8. Update StatsBarSection.tsx (label update)
[ ] 9. Update JourneySection.tsx (konten & filosofi)
[ ] 10. Update GallerySection.tsx (label & kategori)
[ ] 11. Update ClosingCTA.tsx (nomor WA real, subheadline baru)
[ ] 12. Update Footer.tsx (link navigasi)
[ ] 13. Verifikasi build: npm run build
```

---

## Batasan & Hal yang TIDAK Berubah

- ✅ Design system: warna, tipografi, border, spacing — **tidak diubah**
- ✅ Animasi GSAP (`useScrollAnimations.ts`) — **tidak diubah**
- ✅ Dark mode logic — **tidak diubah**
- ✅ `StorySection.tsx` — **tidak dihapus**, hanya dikeluarkan dari `page.tsx` landing page
- ✅ Layout responsif yang sudah ada — **dipertahankan**, dengan tambahan carousel di ProgramsSection
- ✅ Semua `id` anchor (`#program`, `#gabung`, `#pilar`) — **dipertahankan** untuk kompatibilitas link lama

---

## Verifikasi

### Build Check
```bash
npm run build
```
Pastikan tidak ada error TypeScript atau import yang rusak.

### Visual Check (Manual)
Setelah dev server jalan (`npm run dev`), periksa:
- [ ] Desktop: semua section tampil dengan border grid yang bersih
- [ ] Mobile: ProgramsSection bisa di-swipe horizontal
- [ ] MembershipSection: CTA link ke `akademi.panggungkreator.web.id` buka di tab baru
- [ ] Tidak ada teks placeholder lama yang tersisa
- [ ] Animasi GSAP masih berjalan normal di semua section yang diubah
