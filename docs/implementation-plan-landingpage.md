# Implementation Plan — Landing Page Panggung Kreator (Super Clean Inline Editor)
> **Dibuat:** 19 Juni 2026
> **Tujuan:** Panduan pengembangan ulang landing page dengan arsitektur folder `front/layout/`. Memaksimalkan kemudahan bagi Admin untuk mengedit teks langsung di halaman (*Inline Edit*), sekaligus memberikan pengalaman koding yang sangat bersih bagi Programmer tanpa perlu *class* tambahan yang merusak tata letak.

---

## 1. MENGURAI KEBINGUNGAN (SUPABASE VS JSON)

### Mengapa Tetap Pakai Supabase (SQL)?
Jika website ini di-hosting di Vercel/cloud, kita **tidak bisa** menyimpan perubahan admin ke dalam file JSON lokal. Saat admin mengedit dan menekan tombol save, data harus disimpan ke database agar perubahannya permanen untuk semua pengunjung. Jika disimpan ke JSON, perubahannya akan hilang saat server *restart*. Oleh karena itu, kita **tetap menggunakan Supabase** (`landing_sections`).

### Solusi untuk Keluhan Programmer
Masalah utama programmer sebelumnya adalah kode yang *berantakan* karena komponen edit. Solusinya: Kita membuat komponen super ringkas `<Edit>` yang membungkus semua kerumitan, tanpa memaksa programmer memasukkan atribut *class* tambahan.

---

## 2. ARSITEKTUR "SUPER CLEAN INLINE EDITOR"

### 2.1 Pola Penulisan Kode (Bagi Programmer)
Ide utamanya adalah `<Edit>` tidak boleh mengganggu gaya (*styling*) induknya. Komponen ini akan menyesuaikan gaya teks tempat ia berada.

```tsx
// Contoh kode yang SUPER BERSIH bagi programmer
import { Edit } from '@/components/editor/Edit';

export function SectionHero() {
  return (
    <section className="pt-36 pb-24 text-center">
      
      {/* Teks mengikuti styling induknya */}
      <div className="text-red-500 font-bold mb-4">
        <Edit id="hero.badge">Bukan Sekadar Belajar Ngomong.</Edit>
      </div>

      <h1 className="text-4xl md:text-7xl font-bold">
        <Edit id="hero.heading1">Tapi Belajar Gimana Cara</Edit>
        <br />
        <span className="text-blue-500">
          <Edit id="hero.heading2">Lo Didengar.</Edit>
        </span>
      </h1>

    </section>
  );
}
```

**Kelebihan Sintaks `<Edit id="...">`:**
1. **Sangat Pendek:** Hanya butuh `id` unik (kombinasi nama section dan nama kolom datanya, misal `hero.badge`).
2. **Tanpa Class Tambahan:** Programmer cukup mengatur CSS/Tailwind di tag pembungkus (induknya, misal di `div`, `h1`, atau `span`). Komponen `<Edit>` di dalamnya akan otomatis mewarisi font, ukuran, dan warnanya tanpa merusak *layout* (*flexbox* / *grid*).

### 2.2 Struktur Folder: Partisi Tata Letak di `front/layout/`
Sesuai arahan, semua section landing page akan dipisah menjadi komponen layout mandiri.

```
front/
├── components/
│   └── editor/
│       ├── Edit.tsx             <-- "Komponen Super Ringkas"
│       ├── EditorContext.tsx    <-- State untuk mengecek mode Admin & Data Supabase
│
├── layout/
│   ├── nav-header.tsx           <-- Komponen Navbar
│   ├── section-hero.tsx         <-- Section Hero
│   ├── section-pain-points.tsx
│   ├── section-turning-point.tsx
│   ├── section-origin-story.tsx
│   ├── section-performer-vision.tsx
│   ├── section-curriculum.tsx
│   ├── section-pricing.tsx
│   ├── section-why-us.tsx
│   ├── section-transformation.tsx
│   ├── section-testimonials.tsx
│   ├── section-closing-cta.tsx
│   ├── section-faq.tsx
│   └── footer-main.tsx          <-- Komponen Footer
│
└── app/
    └── page.tsx                 <-- Memanggil semua komponen di folder layout/
```

---

## 3. RENCANA IMPLEMENTASI DETAIL

### FASE 1 — Membangun "Komponen Super Ringkas" (Edit)
1. Buat `EditorContext.tsx` untuk melakukan *fetch* data secara global sekali saja.
2. Refactor `InlineEditText.tsx` menjadi `Edit.tsx`. 
3. Pastikan `Edit.tsx` me-render tag `<span display="contents">` atau `<span>` biasa jika pengunjung adalah *user*, dan tag *contentEditable* transparan jika pengunjung adalah *admin*.

### FASE 2 — Pembuatan Komponen Layout Modular (`front/layout/`)
1. Buat folder `front/layout/`.
2. Pecah file lama (`RemainingSections.tsx` dll) menjadi `section-*.tsx`.
3. Gunakan tag `<Edit>` untuk semua teks statis yang perlu diedit.

### FASE 3 — Implementasi Animasi (Estetika)
1. Install dependensi animasi: `npm install gsap split-type lenis`
2. Buat hook di `front/lib/animations/useScrollAnimation.ts`.
3. Inisialisasi Lenis (Smooth Scroll).
4. Terapkan efek *Word-by-word reveal*, parallax, dan stagger animasi di komponen layout.

### FASE 4 — Pembaruan Entry Point (`app/page.tsx`)
`app/page.tsx` diubah menjadi penyalur data terpusat, memanggil Supabase *sekali* dan menyebarkannya lewat Context.

---

## 4. URUTAN PENGERJAAN (Checklist)

### Sprint 1 — Setup Editor & Arsitektur (1 Hari)
- [ ] Buat folder `front/layout/` dan `front/components/editor/`.
- [ ] Setup `EditorContext.tsx`.
- [ ] Bangun komponen `<Edit id="...">` yang tidak merusak *styling* (tanpa *class* bawaan).

### Sprint 2 — Refactor & Pecah Layout (2 Hari)
- [ ] Buat `section-hero.tsx` (dengan tag `<Edit>`).
- [ ] Buat `section-pain-points.tsx`.
- [ ] Buat `section-turning-point.tsx` (baru).
- [ ] Buat `section-origin-story.tsx` (baru).
- [ ] Buat `section-performer-vision.tsx` (baru).
- [ ] Buat `section-curriculum.tsx`.
- [ ] Buat `section-pricing.tsx`.
- [ ] Buat `section-why-us.tsx`.
- [ ] Buat `section-transformation.tsx`.
- [ ] Buat `section-closing-cta.tsx`.
- [ ] Buat `section-faq.tsx`.
- [ ] Buat `footer-main.tsx`.

### Sprint 3 — Animasi & Desain Estetika (2 Hari)
- [ ] Setup Lenis dan dependensi GSAP.
- [ ] Redesign dengan referensi *Dark/Light mode* serta transisi elemen elegan.
- [ ] Uji performa dan responsivitas web (Mobile, Tablet, Desktop).

---

## 5. KESIMPULAN

Pola baru `<Edit id="nama.field">Teks</Edit>` memastikan kode HTML tetap terbaca lurus seperti membuat halaman statis biasa. Programmer bisa fokus ke *Layouting* CSS tanpa terganggu atribut tambahan. Sementara itu, Supabase tetap berjalan di latar belakang memastikan data awet (*persisted*).
