# Implementation Plan — Galeri Album System (Database + CMS + Public Page)

**Dokumen:** `docs/implementation_plan_web_komunitas/implementation_plan_galeri_album.md`
**Tanggal:** 2026-06-27
**Berdasarkan:**
- Diskusi user tentang kebutuhan galeri album berbasis event/kegiatan
- Arsitektur Supabase yang sudah ada di codebase
- Pola admin panel yang sudah berjalan

---

## Latar Belakang

Halaman Galeri (`/galeri`) saat ini menampilkan **placeholder hardcoded** dengan 12 item foto individual. User membutuhkan pendekatan berbeda:

> **Konsep baru:** Galeri menampilkan **album per kegiatan** (bukan foto individual). Setiap album berisi: nama program, tanggal, hero image (foto bersama), dan link ke album lengkap di Google Drive atau platform eksternal lainnya.

Foto jumlahnya akan sangat banyak dan dikelola secara eksternal (Google Drive), sehingga website hanya perlu menampilkan **kartu album** sebagai "pintu masuk" ke koleksi foto lengkap.

---

## Arsitektur Sistem

```
┌─────────────────────────────────────────────────┐
│                  SUPABASE                       │
│                                                 │
│  ┌─────────────────┐   ┌────────────────────┐   │
│  │ gallery_albums  │   │  Supabase Storage  │   │
│  │ (tabel data)    │   │  bucket: gallery   │   │
│  └────────┬────────┘   └────────┬───────────┘   │
│           │                     │               │
└───────────┼─────────────────────┼───────────────┘
            │                     │
    ┌───────▼──────────┐  ┌───────▼──────────┐
    │  Admin CMS       │  │  Upload API      │
    │  /admin/cms/     │  │  /api/upload     │
    │  galeri           │  │  (Supabase ver)  │
    └───────┬──────────┘  └──────────────────┘
            │
    ┌───────▼──────────┐
    │  Public Page     │
    │  /galeri          │
    │  (fetch albums)  │
    └──────────────────┘
```

---

## Detail Perubahan

---

### 1. Database — Tabel `gallery_albums`

**Metode:** Supabase MCP `apply_migration` atau `execute_sql`

**Schema:**

```sql
CREATE TABLE IF NOT EXISTS gallery_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,                          -- "Panggung ke-10", "Open Mic Night Vol.5"
  slug TEXT NOT NULL UNIQUE,                    -- "panggung-ke-10" (auto-generated dari title)
  category TEXT NOT NULL DEFAULT 'open-mic',    -- enum-like: open-mic, public-speaking, mc-practice, networking, content-class, lainnya
  event_date DATE NOT NULL,                     -- tanggal kegiatan
  hero_image_url TEXT,                          -- URL hero image (bisa dari Storage atau URL eksternal)
  album_link TEXT,                              -- link ke Google Drive / album eksternal
  description TEXT,                             -- deskripsi singkat opsional
  is_published BOOLEAN DEFAULT false,           -- draft/published toggle
  display_order INT DEFAULT 0,                  -- urutan tampil (terbaru di atas, atau manual)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index untuk query publik (published + ordered)
CREATE INDEX idx_gallery_albums_published ON gallery_albums (is_published, event_date DESC);

-- Index untuk filter kategori
CREATE INDEX idx_gallery_albums_category ON gallery_albums (category, is_published);

-- RLS Policies
ALTER TABLE gallery_albums ENABLE ROW LEVEL SECURITY;

-- Public read (hanya yang published)
CREATE POLICY "Public can read published albums"
  ON gallery_albums FOR SELECT
  USING (is_published = true);

-- Admin full access (authenticated users - nanti bisa diperketat berdasarkan role)
CREATE POLICY "Authenticated users can manage albums"
  ON gallery_albums FOR ALL
  USING (auth.role() = 'authenticated');
```

**Kategori yang tersedia:**

| Value | Label |
|-------|-------|
| `open-mic` | Open Mic |
| `public-speaking` | Public Speaking |
| `mc-practice` | MC Practice |
| `networking` | Networking |
| `content-class` | Content Class |
| `lainnya` | Lainnya |

---

### 2. Supabase Storage — Bucket `gallery`

**Metode:** Supabase MCP `execute_sql` atau dashboard

```sql
-- Buat bucket public untuk gambar galeri
INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);

-- Policy: public bisa read
CREATE POLICY "Public read gallery" ON storage.objects
  FOR SELECT USING (bucket_id = 'gallery');

-- Policy: authenticated bisa upload
CREATE POLICY "Auth upload gallery" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'gallery' AND auth.role() = 'authenticated');

-- Policy: authenticated bisa delete
CREATE POLICY "Auth delete gallery" ON storage.objects
  FOR DELETE USING (bucket_id = 'gallery' AND auth.role() = 'authenticated');
```

---

### 3. Admin CMS — Halaman Kelola Galeri Album

**File baru:** `front/app/(admin)/admin/cms/galeri/page.tsx`

**Deskripsi:**
Halaman admin untuk CRUD (Create, Read, Update, Delete) album galeri. Mengikuti pola desain admin panel yang sudah ada.

**Fitur:**
- **Tabel daftar album** — kolom: Hero Image (thumbnail), Judul, Kategori, Tanggal, Status (Draft/Published), Aksi
- **Tombol "Tambah Album Baru"** — membuka form dialog/inline
- **Form album** (bisa modal atau inline):
  - **Judul** (`input text`, required) — slug auto-generated
  - **Kategori** (`select dropdown`) — dari daftar enum di atas
  - **Tanggal Kegiatan** (`input date`, required)
  - **Hero Image** — dua opsi:
    - Tab 1: **Upload file** → upload ke Supabase Storage bucket `gallery`, simpan URL
    - Tab 2: **URL Eksternal** → paste URL langsung (Google Drive public link, dll)
  - **Link Album** (`input url`) — URL ke Google Drive atau album eksternal
  - **Deskripsi** (`textarea`, opsional)
  - **Published** (`toggle/checkbox`) — default: draft (false)
- **Edit album** — klik baris → form terisi data, submit = update
- **Delete album** — konfirmasi dialog → delete record + delete file dari Storage (jika pakai upload)
- **Preview hero image** — tampilkan thumbnail saat URL diisi atau file diupload

**Pola kode:**
- Menggunakan `createClient()` dari `@/lib/supabase/client` untuk operasi CRUD
- State management dengan `useState` + `useEffect`
- Real-time refresh setelah mutasi (insert/update/delete)

**Layout & Styling:**
- Mengikuti admin design system yang sudah ada (Tailwind classes, tabel striped, form rounded)
- Tidak perlu mengikuti design system monokrom editorial — ini halaman admin internal

---

### 4. Refactor Upload API (Opsional)

> **Catatan:** Upload route saat ini (`/api/upload`) menulis ke filesystem lokal (`public/assets/`). Ini **tidak berfungsi di production** (Vercel filesystem bersifat ephemeral). Untuk galeri, upload akan langsung menggunakan **Supabase Storage client-side** (`supabase.storage.from('gallery').upload(...)`) dari halaman admin CMS, tanpa perlu API route terpisah.

Jadi **tidak perlu mengubah `/api/upload`** — admin CMS galeri akan langsung memanggil Supabase Storage SDK.

---

### 5. Refactor Halaman Galeri Publik (`/galeri`)

**File diubah:**
- `front/components/galeri/GaleriFilterSection.tsx` — MAJOR REFACTOR
- `front/app/(community)/galeri/page.tsx` — MINOR MODIFY (jadikan async server component untuk SSR fetch)

**Perubahan `GaleriFilterSection.tsx`:**

**Dari:** Data hardcoded 12 item placeholder
**Menjadi:** Fetch dari Supabase + render kartu album dinamis

**Data fetching:**
```tsx
// Server-side fetch (di page.tsx) atau client-side fetch (di component)
const supabase = createClient();
const { data: albums } = await supabase
  .from('gallery_albums')
  .select('*')
  .eq('is_published', true)
  .order('event_date', { ascending: false });
```

**Desain kartu album baru:**

Setiap kartu menampilkan:
```
┌─────────────────────────────────┐
│                                 │
│    [HERO IMAGE / PLACEHOLDER]   │   ← aspect-[4/3], object-cover
│                                 │
│─────────────────────────────────│
│  🎤 OPEN MIC                   │   ← tag kategori
│  PANGGUNG KE-10                │   ← judul besar uppercase
│  12 Juni 2026                  │   ← tanggal
│                                 │
│  LIHAT ALBUM LENGKAP →         │   ← link ke Google Drive
└─────────────────────────────────┘
```

**Styling kartu:**
- `aspect-[4/3]` untuk area gambar
- Hero image: `<img>` dengan `object-cover` jika ada URL, fallback ke placeholder teks deskriptif jika tidak ada
- Overlay gradient gelap di bawah gambar (sama seperti pattern saat ini)
- Judul: `text-lg font-black uppercase tracking-wider`
- Tanggal: `text-[10px] font-bold tracking-widest text-[#2c2c2c]/40`
- Link album: `text-[10px] uppercase tracking-widest` dengan hover underline
- Target `_blank` + `rel="noopener noreferrer"` untuk link eksternal
- Hover effects: `group-hover:scale-105` pada gambar, corner brackets

**Filter kategori:**
- Tetap menggunakan tombol filter client-side seperti sekarang
- Filter berdasarkan field `category` dari data albums
- Tombol "SEMUA" menampilkan semua album

**Empty state:**
- Jika tidak ada album di kategori yang dipilih: tampilkan pesan "Belum ada dokumentasi untuk kategori ini."

---

### 6. Perubahan `page.tsx` Galeri

**Pendekatan:** Hybrid — page.tsx tetap sebagai Server Component yang men-fetch data, lalu pass ke client component.

```tsx
// front/app/(community)/galeri/page.tsx
import React from "react";
import { createClient } from "@/lib/supabase/server";
import GaleriHeroSection from "@/components/galeri/GaleriHeroSection";
import GaleriFilterSection from "@/components/galeri/GaleriFilterSection";
import GaleriCTASection from "@/components/galeri/GaleriCTASection";

export default async function Page() {
  const supabase = await createClient();
  const { data: albums } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("is_published", true)
    .order("event_date", { ascending: false });

  return (
    <div className="overflow-x-hidden">
      <GaleriHeroSection />
      <GaleriFilterSection albums={albums || []} />
      <GaleriCTASection />
    </div>
  );
}
```

---

## Ringkasan File yang Dibuat/Diubah

| Aksi | File | Keterangan |
|------|------|------------|
| **SQL** | Supabase Migration | Tabel `gallery_albums` + indexes + RLS policies |
| **SQL** | Supabase Storage | Bucket `gallery` + storage policies |
| **NEW** | `front/app/(admin)/admin/cms/galeri/page.tsx` | Admin CMS halaman kelola galeri album |
| **REFACTOR** | `front/components/galeri/GaleriFilterSection.tsx` | Dari hardcoded ke dynamic fetch + kartu album baru |
| **MODIFY** | `front/app/(community)/galeri/page.tsx` | Jadikan async server component untuk SSR data fetch |

---

## Urutan Eksekusi

1. **Database dulu** — Buat tabel + bucket di Supabase (via MCP)
2. **Admin CMS** — Buat halaman admin untuk kelola album
3. **Public page** — Refactor komponen galeri untuk consume data dari Supabase
4. **Build & verify** — Pastikan build berhasil dan halaman berfungsi

---

## Verification Plan

### Build Test
```bash
cd front && npm run build
```
- Pastikan tidak ada error TypeScript
- Pastikan halaman `/galeri` masih ter-generate (sekarang sebagai dynamic page karena fetch data)

### Functional Test
1. Buka admin CMS → tambahkan 2-3 album test (dengan kategori berbeda)
2. Buka `/galeri` → verifikasi:
   - Album ter-render sebagai kartu
   - Filter kategori berfungsi
   - Klik link album membuka tab baru ke URL eksternal
   - Hero image tampil (jika ada URL) atau placeholder (jika tidak)
   - Dark mode berfungsi
   - Responsif mobile (1 kolom)
   - Animasi scroll berjalan

### Edge Cases
- Tidak ada album sama sekali → tampilkan empty state
- Album tanpa hero image → tampilkan placeholder
- Album tanpa link album → sembunyikan tombol "Lihat Album"
