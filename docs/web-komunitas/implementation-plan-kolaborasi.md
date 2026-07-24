# Implementation Plan — Halaman Kolaborasi & Media Kit (`/kolaborasi`)

**Dokumen:** `docs/implementation_plan_web_komunitas/implementation_plan_kolaborasi.md`  
**Tanggal:** 2026-06-27  
**Berdasarkan:**
- [contentofwebkomunitas.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/contentofwebkomunitas.md) — Bagian "Halaman Media Kit"
- [design-web-komunitas.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/design-web-komunitas.md)
- [Profil_Komunitas_Panggung_Kreator.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/Profil_Komunitas_Panggung_Kreator.md)

---

## Latar Belakang

Halaman `/kolaborasi` saat ini hanyalah **placeholder kosong** bertuliskan "Halaman ini sedang dalam pengembangan." Halaman ini juga merangkap fungsi Media Kit — menjadi satu pintu masuk bagi calon mitra (kafe, brand, kampus, media partner, event organizer) untuk mengenal ekosistem Panggung Kreator secara terstruktur dan membuat keputusan kemitraan.

> **Konsep:** Halaman editorial monokromatis yang menyajikan data komunitas, profil audiens, daftar program, bentuk kolaborasi yang tersedia, dan alasan bermitra — diakhiri CTA kontak langsung. Sekaligus berfungsi sebagai **digital media kit** yang profesional.

**Audiens target:** Kafe & venue · Brand & UMKM · Kampus & institusi · Media partner · Event organizer.

---

## Struktur Halaman (7 Section)

```
┌─────────────────────────────────────────────────┐
│  1. KolaborasiHeroSection                       │
│     Headline + Sub: "Kenali Ekosistem..."       │
├─────────────────────────────────────────────────┤
│  2. KolaborasiOverviewSection                   │
│     Deskripsi singkat + Grid data statistik     │
├─────────────────────────────────────────────────┤
│  3. KolaborasiAudiensSection                    │
│     Profil segmen audiens komunitas             │
├─────────────────────────────────────────────────┤
│  4. KolaborasiProgramSection                    │
│     Ringkasan 9 program aktif                   │
├─────────────────────────────────────────────────┤
│  5. KolaborasiPartnerTypeSection                │
│     4 tipe kolaborasi yang tersedia             │
├─────────────────────────────────────────────────┤
│  6. KolaborasiWhySection                        │
│     5 alasan bermitra                           │
├─────────────────────────────────────────────────┤
│  7. KolaborasiCTASection                        │
│     Kontak partnership + CTA                    │
└─────────────────────────────────────────────────┘
```

---

## Detail Per Komponen

---

### 1. `KolaborasiHeroSection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiHeroSection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Badge | `[ KOLABORASI & MEDIA KIT ]` |
| Headline | `KENALI EKOSISTEM` *panggung kreator.* |
| Subheadline | Data komunitas yang terstruktur untuk keputusan kemitraan yang tepat. |

**Layout & Styling:**
- Full-width section, `min-h-[50vh]` di desktop, padding besar
- Background: `bg-white dark:bg-[#2c2c2c]`
- Border bawah: `border-b border-[#2c2c2c] dark:border-white`
- Headline: fluid typography `clamp(2.25rem, 6vw, 5.5rem)`, `font-black uppercase tracking-tighter leading-[0.85]`
- Kata *panggung kreator.* menggunakan `font-serif italic font-normal lowercase text-neutral-500`
- Badge: `text-[9px] font-black uppercase tracking-[0.25em]` dalam `[ ]`

**Animasi:**
- Badge & headline: `fadeUp` dengan delay bertingkat
- Subheadline: `fadeUp` dengan delay lebih panjang

---

### 2. `KolaborasiOverviewSection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiOverviewSection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Label | `[ TENTANG KAMI ]` |
| Deskripsi | Panggung Kreator adalah komunitas pengembangan diri berbasis di Bandung yang berfokus pada public speaking, content creation, dan personal branding. Kami menyelenggarakan kegiatan rutin mingguan di berbagai kafe dan creative hub, memberikan wadah nyata bagi siapa saja yang ingin bertumbuh di depan publik. |

**Data Statistik (Grid 2×2 desktop / 1 kolom mobile):**

| Angka | Label |
|-------|-------|
| `300+` | Anggota Aktif |
| `Weekly` | Kegiatan Rutin |
| `Multi-Venue` | Kafe & Creative Hub di Bandung |
| `Alumni Pro` | MC, Podcaster, Content Creator |

**Layout & Styling:**
- Split layout: teks deskripsi di kiri (60%), grid statistik di kanan (40%)
- Pada mobile: tumpuk vertikal, deskripsi di atas, grid statistik di bawah
- Grid statistik: border `1px solid` antar sel, angka besar `text-3xl md:text-4xl font-black`, label kecil `text-[10px] uppercase tracking-widest`
- Border pembatas vertikal antara kolom kiri dan kanan di desktop
- Animasi: `fadeUp` untuk teks, `counterUp` untuk angka `300+`, `staggerIn` untuk grid items

---

### 3. `KolaborasiAudiensSection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiAudiensSection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Label | `[ PROFIL AUDIENS KAMI ]` |
| Headline | `SIAPA YANG KAMI` *jangkau?* |

**Segmen Audiens (Grid 3×2 desktop / 2 kolom mobile / 1 kolom small mobile):**

| # | Segmen | Deskripsi Singkat |
|---|--------|-------------------|
| 01 | Pelajar & Mahasiswa | Generasi muda yang ingin mengasah kemampuan berbicara dan berkreasi sejak dini |
| 02 | Pekerja Kantoran | Profesional yang butuh skill presentasi dan personal branding untuk karir |
| 03 | Content Creator Pemula | Kreator yang ingin membangun audiens dan memperkuat storytelling |
| 04 | Calon MC & Public Speaker | Individu yang ingin memulai karir sebagai pembawa acara profesional |
| 05 | Profesional & Praktisi | Pakar di bidangnya yang ingin berbagi ilmu dan memperluas jaringan |
| 06 | Komunitas Bandung | Lokasi utama: Bandung & sekitarnya — basis komunitas yang solid |

**Layout & Styling:**
- Section inverted (dark background): `bg-[#2c2c2c] dark:bg-white` dengan `text-white dark:text-[#2c2c2c]`
- Grid 3 kolom di desktop, 2 kolom di tablet, 1 kolom di mobile
- Setiap kartu: nomor besar `text-4xl font-black` di atas, diikuti judul segmen `text-sm font-black uppercase`, lalu deskripsi `text-xs`
- Border pembatas `1px` antar kartu menggunakan teknik `gap-[1px]` dengan bg kontras
- Animasi: `staggerIn` untuk kartu-kartu

---

### 4. `KolaborasiProgramSection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiProgramSection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Label | `[ PROGRAM AKTIF ]` |
| Headline | `9 PROGRAM YANG BERJALAN` *rutin.* |

**Daftar Program (Grid 3 kolom desktop):**

| # | Program | Pilar | Deskripsi |
|---|---------|-------|-----------|
| 01 | Open Mic Friday | Public Speaking | Sesi tampil bebas setiap Jumat malam — panggung terbuka untuk semua |
| 02 | Speech Practice | Public Speaking | Latihan pidato terstruktur dengan evaluasi dan feedback langsung |
| 03 | MC Practice | Public Speaking | Simulasi memandu acara formal dan non-formal |
| 04 | Storytelling Night | Public Speaking | Berlatih menyampaikan cerita yang memikat audiens |
| 05 | Content Creator Workshop | Content Creation | Pelatihan produksi konten dari pra-produksi hingga distribusi |
| 06 | Podcast Lab | Content Creation | Praktik langsung rekam podcast dengan teknik audio profesional |
| 07 | Branding Bootcamp | Personal Branding | Workshop intensif membangun personal brand yang otentik |
| 08 | Networking Session | Personal Branding | Sesi kolaborasi dan perluasan jaringan antar anggota |
| 09 | Mentoring Circle | Personal Branding | Bimbingan langsung dari alumni senior dan praktisi |

**Layout & Styling:**
- Grid 3 kolom desktop, 1 kolom mobile
- Setiap kartu: nomor besar monokrom, nama program `font-black uppercase`, pilar sebagai tag kecil, deskripsi di bawah
- Tag pilar: `text-[9px] font-black uppercase tracking-[0.25em]` dengan border tipis
- Border `1px` antar kartu
- Animasi: `staggerIn` untuk kartu-kartu

---

### 5. `KolaborasiPartnerTypeSection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiPartnerTypeSection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Label | `[ BENTUK KOLABORASI ]` |
| Headline | `EMPAT JALUR` *kemitraan.* |

**4 Tipe Partner (Grid 2×2 desktop):**

| # | Tipe | Deskripsi | Contoh Kerja Sama |
|---|------|-----------|-------------------|
| 01 | Kafe & Coffee Shop | Menjadi venue tetap kegiatan mingguan — exposure langsung ke 300+ member aktif | Diskon member, branding di venue, co-host event |
| 02 | Kampus & Institusi | Kolaborasi program workshop, seminar, dan pelatihan di lingkungan kampus | Guest lecture, joint workshop, magang MC |
| 03 | Brand & UMKM | Sponsorship program atau endorsement melalui jaringan kreator komunitas | Product placement, content collab, brand ambassador |
| 04 | Media Partner & EO | Kolaborasi liputan event, cross-promotion, dan co-organizing acara | Media coverage, cross-promo sosmed, joint event |

**Layout & Styling:**
- Grid 2×2 desktop, 1 kolom mobile
- Setiap kartu: area gambar placeholder `aspect-[3/2]` di atas, konten di bawah
- Placeholder gambar: background abu-abu dengan teks deskriptif `[ Foto suasana ... ]`
- Nomor besar di sudut kiri atas gambar: `text-6xl font-black text-white/20`
- Judul tipe: `text-lg font-black uppercase`
- Deskripsi: `text-xs uppercase tracking-wider`
- Contoh kerja sama: `text-[10px] text-neutral-500` sebagai list items
- Border `1px` pembatas antar kartu menggunakan teknik gap
- Animasi: `staggerIn` + `parallax` pada area placeholder gambar

---

### 6. `KolaborasiWhySection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiWhySection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Label | `[ MENGAPA BERMITRA DENGAN KAMI? ]` |
| Headline | `5 ALASAN KUAT UNTUK` *berkolaborasi.* |

**5 Alasan (Grid horizontal / numbered list):**

| # | Alasan | Deskripsi |
|---|--------|-----------|
| 01 | Ekosistem Aktif & Terstruktur | Kegiatan rutin mingguan yang konsisten — bukan event sesekali, tapi ekosistem yang hidup |
| 02 | Audiens Nyata & Engaged | 300+ anggota aktif yang hadir langsung — bukan follower pasif di media sosial |
| 03 | Fleksibilitas Kolaborasi | Berbagai format kemitraan yang bisa disesuaikan — dari venue partnership hingga content sponsorship |
| 04 | Jangkauan Media Sosial | Konten dokumentasi rutin di Instagram, TikTok, dan YouTube — exposure digital yang konsisten |
| 05 | Reputasi Komunitas Positif | Dipercaya oleh alumni, venue mitra, dan institusi — track record nyata di Bandung |

**Layout & Styling:**
- Section inverted (dark background): `bg-[#2c2c2c] dark:bg-white`
- Grid 5 kolom horizontal di desktop (masing-masing kolom dibatasi border `1px`)
- Pada tablet: 3 kolom, pada mobile: 1 kolom
- Nomor: `text-5xl font-black` di atas
- Judul: `text-sm font-black uppercase tracking-wider`
- Deskripsi: `text-[11px] uppercase tracking-wide leading-relaxed`
- Animasi: `staggerIn` + `fadeUp`

---

### 7. `KolaborasiCTASection.tsx` [NEW]

**File:** `front/components/kolaborasi/KolaborasiCTASection.tsx`

**Konten:**

| Elemen | Isi |
|--------|-----|
| Label | `[ HUBUNGI KAMI ]` |
| Headline | `TERTARIK` *bermitra?* |
| Deskripsi | Kami terbuka untuk berbagai bentuk kolaborasi. Hubungi kami langsung untuk diskusi lebih lanjut. |

**Kontak Partnership (Grid 3 kolom inline):**

| Kanal | Detail |
|-------|--------|
| WhatsApp | 0878 2323 9575 (Aldi - Founder) |
| Instagram | @panggungkreator |
| Email | panggungkreator.idn@gmail.com |

**CTA Buttons:**
- Primary: `HUBUNGI VIA WHATSAPP` → `https://wa.me/6287823239575`
- Secondary: `KENALI KAMI LEBIH DEKAT` → `/tentang`

**Layout & Styling:**
- Background putih `bg-white dark:bg-[#2c2c2c]`
- Centered layout, headline besar
- Grid kontak 3 kolom dengan border pembatas vertikal
- Setiap item kontak: label kecil di atas, value di bawah
- Tombol primary: `bg-[#2c2c2c] text-white dark:bg-white dark:text-[#2c2c2c]`, kotak solid, hover inverted
- Tombol secondary: `border border-[#2c2c2c]`, transparent, hover fill
- Animasi: `fadeUp`

---

## Perubahan File `page.tsx`

**File diubah:** `front/app/(community)/kolaborasi/page.tsx`

```tsx
import React from "react";
import KolaborasiHeroSection from "@/components/kolaborasi/KolaborasiHeroSection";
import KolaborasiOverviewSection from "@/components/kolaborasi/KolaborasiOverviewSection";
import KolaborasiAudiensSection from "@/components/kolaborasi/KolaborasiAudiensSection";
import KolaborasiProgramSection from "@/components/kolaborasi/KolaborasiProgramSection";
import KolaborasiPartnerTypeSection from "@/components/kolaborasi/KolaborasiPartnerTypeSection";
import KolaborasiWhySection from "@/components/kolaborasi/KolaborasiWhySection";
import KolaborasiCTASection from "@/components/kolaborasi/KolaborasiCTASection";

export default function Page() {
  return (
    <div className="overflow-x-hidden">
      <KolaborasiHeroSection />
      <KolaborasiOverviewSection />
      <KolaborasiAudiensSection />
      <KolaborasiProgramSection />
      <KolaborasiPartnerTypeSection />
      <KolaborasiWhySection />
      <KolaborasiCTASection />
    </div>
  );
}
```

---

## Ringkasan File yang Dibuat/Diubah

| Aksi | File | Keterangan |
|------|------|------------|
| **NEW** | `front/components/kolaborasi/KolaborasiHeroSection.tsx` | Hero editorial — headline + badge |
| **NEW** | `front/components/kolaborasi/KolaborasiOverviewSection.tsx` | Deskripsi singkat + grid data statistik komunitas |
| **NEW** | `front/components/kolaborasi/KolaborasiAudiensSection.tsx` | Profil 6 segmen audiens (inverted section) |
| **NEW** | `front/components/kolaborasi/KolaborasiProgramSection.tsx` | Ringkasan 9 program aktif dalam grid |
| **NEW** | `front/components/kolaborasi/KolaborasiPartnerTypeSection.tsx` | 4 tipe kolaborasi dengan placeholder visual |
| **NEW** | `front/components/kolaborasi/KolaborasiWhySection.tsx` | 5 alasan bermitra (inverted section) |
| **NEW** | `front/components/kolaborasi/KolaborasiCTASection.tsx` | Kontak partnership + CTA buttons |
| **MODIFY** | `front/app/(community)/kolaborasi/page.tsx` | Komposisi 7 section baru |

---

## Aturan Desain Wajib

1. **Monokrom murni** — hanya `#2c2c2c`, `#FFFFFF`, dan abu-abu Tailwind. Tidak boleh ada warna aksen (kecuali highlight stabilo yang sudah ditentukan global)
2. **Tanpa sudut melengkung** — semua elemen menggunakan `rounded-none` (sudut 90°)
3. **Tanpa bayangan** — tidak boleh ada `shadow-*` pada komponen publik
4. **Grid berbasis border** — setiap section dan kolom dipisahkan border `1px solid`
5. **Aksen serif italic** — kata-kata kunci di headline menggunakan `font-serif italic font-normal lowercase text-neutral-500`
6. **Headline raksasa** — fluid typography `clamp()` dengan `font-black uppercase tracking-tighter`
7. **Label dalam `[ ]`** — section label/micro-copy dibungkus bracket persegi
8. **Body text uppercase** — deskripsi pada kartu menggunakan `uppercase tracking-wider`
9. **Animasi GSAP** — menggunakan `useScrollAnimations.ts` yang sudah ada (`fadeUp`, `staggerIn`, `parallax`, `counterUp`)
10. **Dark mode wajib** — setiap section harus memiliki variant `dark:` yang tepat
11. **Section alternasi warna** — bergantian antara section terang (`bg-white`) dan inverted gelap (`bg-[#2c2c2c]`)

---

## Verification Plan

### Build Test
```bash
cd front && npm run build
```
- Pastikan tidak ada error TypeScript
- Pastikan halaman `/kolaborasi` ter-generate sebagai static page

### Visual Verification
1. ☐ Hero section tampil dengan headline editorial yang impactful
2. ☐ Overview section menampilkan data statistik dalam grid yang rapi
3. ☐ Audiens section menampilkan 6 segmen dengan numbering besar
4. ☐ Program section menampilkan 9 program dalam grid 3 kolom
5. ☐ Partner type section menampilkan 4 tipe kolaborasi dengan visual placeholder
6. ☐ Why section menampilkan 5 alasan dalam grid horizontal
7. ☐ CTA section menampilkan kontak dan tombol yang berfungsi
8. ☐ Dark mode berfungsi di seluruh section
9. ☐ Responsive: semua grid collapse dengan benar pada mobile
10. ☐ Scroll animations berjalan (fadeUp, staggerIn, counterUp)
11. ☐ Border consistency: semua pembatas tampil simetris
12. ☐ Link WhatsApp dan Instagram membuka tab baru
13. ☐ Navigasi: link "Kolaborasi" di header memiliki highlight aktif
