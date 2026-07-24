# Implementation Plan — Admin CMS (`/admin`)

**Tanggal:** 2026-06-27
**Berdasarkan:**
- [New Concept.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/New%20Concept%20387e123ee4b3805194cec32231057ece.md)
- [design-web-komunitas.md](file:///d:/Community/Pangkreas/Project/panggung-kreator/docs/design-web-komunitas.md)
- Supabase schema aktual (queried langsung)

---

## Latar Belakang & Scope

Admin panel saat ini (`front/app/(admin)/admin/`) sudah memiliki struktur routing lengkap, namun sebagian besar halaman masih berupa **placeholder**. Hanya beberapa halaman yang sudah diimplementasikan fungsionalitasnya:

**Sudah berfungsi:**
- `data-center/members/` — MembersClient dengan CRUD lengkap
- `akademi/packages/` — Package management (CRUD)
- `akademi/voucher/` — VoucherManagement (CRUD)
- `cms/galeri/` — GaleriCMSClient (CRUD + upload)

**Placeholder (perlu diimplementasikan — 16 halaman):**
- `data-center/transactions/`, `data-center/attendance/`
- `akademi/mentoring/`, `akademi/payment/`, `akademi/resources/`
- `komunitas/acara/` (+ create + [id]), `komunitas/venue/`, `komunitas/partner/`
- `cms/komunitas/`, `cms/akademi/`, `cms/media/`
- `analytics/funnel/`, `analytics/revenue/`, `analytics/aktivitas/`
- `system/admins/`, `system/roles/`, `system/logs/`

**Perlu diperbarui:**
- `layout.tsx` — sidebar redesign monochrome
- `page.tsx` (dashboard) — data live dari Supabase

---

## Design System Admin

Admin mengadopsi **Bold Monochrome Grid-Based Editorial Architecture** — konsep yang sama dengan web komunitas, disesuaikan untuk konteks dashboard internal:

### Warna & Tema

| Elemen | Light Mode | Dark Mode |
|--------|-----------|-----------|
| Sidebar bg | `#2c2c2c` | `#1a1a1a` |
| Sidebar text | `#FFFFFF` | `#FFFFFF` |
| Main bg | `#FFFFFF` | `#2c2c2c` |
| Border | `1px solid #2c2c2c` | `1px solid rgba(255,255,255,0.12)` |
| Menu aktif | `bg-white text-[#2c2c2c]` | `bg-white/10` |
| Card bg | `#FFFFFF` | `#333333` |
| Table header | `bg-neutral-50` | `bg-neutral-900` |

### Tipografi Admin
- **Page Title**: `text-2xl font-black uppercase tracking-tighter`
- **Section Label**: `text-[9px] uppercase tracking-[0.25em] font-black` dalam `[ ]`
- **Table Header**: `text-[10px] font-black uppercase tracking-widest`
- **Body/cell**: `text-xs font-sans`
- **Button primary**: `bg-[#2c2c2c] text-white text-[10px] font-black uppercase tracking-wider rounded-none`
- **Button secondary**: `border border-[#2c2c2c] text-[10px] font-black uppercase tracking-wider rounded-none`

### Prinsip Komponen
- Semua sudut: `rounded-none` (90 derajat)
- Tidak ada `shadow-*`
- Border sebagai pemisah: `1px solid`
- Input: `border border-[#2c2c2c] rounded-none focus:ring-0 focus:outline focus:outline-2`
- Table: header `border-b-2 border-[#2c2c2c]`, row `border-b border-neutral-100`
- Badge status: filled hitam untuk aktif/berhasil, border abu untuk pending/draft

---

## Struktur Folder Target

```
front/app/(admin)/admin/
├── layout.tsx                     [MODIFY] Sidebar redesign monochrome
├── page.tsx                       [MODIFY] Dashboard dengan live data Supabase
│
├── data-center/
│   ├── members/                   [MODIFY] Tampilkan seluruh member non-admin + Edit status community/tier
│   └── attendance/
│       ├── page.tsx               [MODIFY] Server wrapper
│       └── AttendanceClient.tsx   [NEW]
│
├── akademi/
│   ├── packages/                  [EXISTS] Sudah OK
│   ├── voucher/                   [EXISTS] Sudah OK
│   ├── registration/
│   │   ├── page.tsx               [NEW] Server wrapper
│   │   └── RegistrationClient.tsx [NEW] Verifikasi pembayaran registrasi Rp49k
│   ├── mentoring/
│   │   ├── page.tsx               [MODIFY] Server wrapper
│   │   └── MentoringClient.tsx    [NEW]
│   └── resources/
│       ├── page.tsx               [MODIFY] Server wrapper
│       └── ResourcesClient.tsx    [NEW]
│
├── komunitas/
│   ├── acara/
│   │   ├── page.tsx               [MODIFY] Server wrapper
│   │   ├── AcaraListClient.tsx    [NEW]
│   │   ├── create/page.tsx        [MODIFY] Form buat acara
│   │   └── [id]/
│   │       ├── page.tsx           [MODIFY] Server wrapper
│   │       └── AcaraDetailClient.tsx [NEW]
│   ├── venue/
│   │   ├── page.tsx               [MODIFY] Server wrapper
│   │   └── VenueClient.tsx        [NEW]
│   └── partner/
│       ├── page.tsx               [MODIFY] Server wrapper
│       └── PartnerClient.tsx      [NEW]
│
├── cms/
│   ├── galeri/                    [EXISTS] Sudah OK
│   ├── komunitas/
│   │   ├── page.tsx               [MODIFY] Server wrapper
│   │   └── KomunitasCMSClient.tsx [NEW]
│   ├── akademi/
│   │   ├── page.tsx               [MODIFY] Server wrapper
│   │   └── AkademiCMSClient.tsx   [NEW]
│   └── media/
│       ├── page.tsx               [MODIFY] Server wrapper
│       └── MediaLibraryClient.tsx [NEW]
│
├── analytics/
│   ├── funnel/page.tsx            [MODIFY] Read-only analytics
│   ├── revenue/page.tsx           [MODIFY] Read-only analytics
│   └── aktivitas/page.tsx         [MODIFY] Read-only analytics
│
└── system/
    ├── admins/
    │   ├── page.tsx               [MODIFY] Server wrapper
    │   └── AdminsClient.tsx       [NEW]
    ├── roles/page.tsx             [MODIFY] Static reference tabel
    └── logs/
        ├── page.tsx               [MODIFY] Server wrapper
        └── LogsClient.tsx         [NEW]
```

---

## Detail Implementasi Per Modul

---

### TAHAP 0 — Layout & Dashboard (Prioritas Utama)

**Struktur menu lengkap:**
```
[ DASHBOARD ]        → /admin

[ DATA CENTER ]
  Member             → /admin/data-center/members
  Attendance         → /admin/data-center/attendance

[ AKADEMI ]
  Packages           → /admin/akademi/packages
  Voucher            → /admin/akademi/voucher
  Registration       → /admin/akademi/registration
  Mentoring          → /admin/akademi/mentoring
  Resources          → /admin/akademi/resources

[ KOMUNITAS ]
  Acara & Event      → /admin/komunitas/acara
  Venue              → /admin/komunitas/venue
  Partner            → /admin/komunitas/partner

[ CMS ]
  Landing Komunitas  → /admin/cms/komunitas
  Landing Akademi    → /admin/cms/akademi
  Kelola Galeri      → /admin/cms/galeri
  Media Library      → /admin/cms/media

[ ANALYTICS ]
  Funnel             → /admin/analytics/funnel
  Revenue            → /admin/analytics/revenue
  Aktivitas          → /admin/analytics/aktivitas

[ SYSTEM ]
  Admin Users        → /admin/system/admins
  Roles & Permissions → /admin/system/roles
  Activity Logs      → /admin/system/logs
```

---

#### [MODIFY] `page.tsx` — Dashboard

**Stat cards (Row 1, 4 kolom):**

| Card | Sumber | Query |
|------|--------|-------|
| Total Member | `members` | `COUNT(*) WHERE role='member'` |
| Member Berbayar | `members` | `COUNT(*) WHERE membership_tier != 'free'` |
| Transaksi Bulan Ini | `transactions` | `COUNT(*) WHERE status='paid' AND paid_at >= start_of_month` |
| Revenue Bulan Ini | `transactions` | `SUM(final_amount) WHERE status='paid' AND paid_at >= start_of_month` |

**Data panel (Row 2, 3 kolom):**
- Acara Terbaru: 3 event terakhir dari `events` (title, event_date, event_type)
- Transaksi Terbaru: 5 transaksi terakhir `paid` (nama member, paket, jumlah, tanggal)
- Member Baru: 5 member terdaftar terakhir (full_name, email, membership_tier, created_at)

---

### TAHAP 1 — Data Center

#### [NEW] `TransactionsClient.tsx`

**Tabel `transactions` — Schema:**
```
id, member_id, package_id, voucher_id, order_id,
status (pending/paid/failed/expired),
gross_amount, discount_amount, final_amount,
payment_method, paid_at, expired_at, created_at
```

**Fitur:**
- Tabel dengan kolom: Order ID · Nama Member · Paket · Status · Gross · Diskon · Final · Metode · Tanggal
- Filter: status (dropdown), tanggal (date range picker), paket
- Search: order_id atau nama member
- Badge status: `paid`=bg-[#2c2c2c] text-white · `pending`=border text-neutral · `failed`/`expired`=border text-neutral-400
- View-only (tidak ada delete/edit) untuk integritas data

---

#### [NEW] `AttendanceClient.tsx`

**Tabel `attendances` JOIN `events` JOIN `members` — Schema:**
```
attendances: id, event_id, member_id, is_present,
             scan_method (manual/qr), scanned_at, created_at
events: id, title, event_type, event_date
members: id, full_name, stage_name, whatsapp_number
```

**Fitur:**
- Filter utama: pilih acara (dropdown dari semua events)
- Tabel: Nama Member · WA · Tipe Event · Tanggal · Status Hadir (toggle) · Scan Method · Waktu
- Summary bar: "N dari M peserta hadir"
- Form "Catat Kehadiran Manual": search member by name/WA → pilih event → submit
- Konfirmasi sebelum toggle status kehadiran

---

### TAHAP 2 — Akademi

#### [NEW] `PaymentClient.tsx`

**Tabel `transactions` — Schema (sudah ada + affiliate):**

**Fitur khusus:**
- Tab utama: Pending (butuh perhatian), Semua Transaksi
- Kartu transaksi pending: nama, paket, jumlah, tanggal, metode bayar
- Tombol "Konfirmasi Lunas" → update `transactions.status='paid'` + update `members.membership_tier`
- Summary header: total masuk hari ini, total masuk bulan ini, jumlah pending
- Field `metadata` (jsonb) digunakan untuk simpan bukti transfer jika ada

---

#### [NEW] `MentoringClient.tsx`

**Tabel `mentoring_sessions` — Schema:**
```
id, member_id, mentor_id, package_id,
session_date, start_time, end_time,
platform (zoom/meet/offline), meeting_link, location,
status (scheduled/completed/cancelled/rescheduled),
session_number, notes, member_notes,
created_at, updated_at
```

**Fitur:**
- Kalender/tabel jadwal dengan filter: status, bulan, mentor
- Create session: pilih member (search), pilih mentor, tanggal, waktu, platform, link/lokasi
- Edit: update link, reschedule, ubah status
- Detail per sesi: notes admin + notes member (read-only untuk member_notes)
- Kolom: Member · Mentor · Sesi ke-N · Tanggal · Waktu · Platform · Status · Aksi

---

#### [NEW] `ResourcesClient.tsx`

**Tabel `resources` — Schema:**
```
id, title, description, file_url, file_type,
file_size_kb, package_tier (free/regular/mvp),
category, is_published, order_index,
uploaded_by, created_at, updated_at
```

**Fitur:**
- Tabel materi: Judul · Kategori · Tier · Ukuran · Status · Tanggal
- Filter: kategori, tier, status publish
- Upload: judul, deskripsi, pilih tier, kategori → upload ke Supabase Storage bucket `resources`
- Toggle publish/draft per item
- Edit metadata (judul, deskripsi, tier, kategori)
- Delete dengan konfirmasi (hapus dari DB + Storage)

---

### TAHAP 3 — Komunitas

#### [NEW] `AcaraListClient.tsx`

**Tabel `events` — Schema:**
```
id, title, description,
event_type (open_mic/speech_practice/mc_practice/networking/content_class/lainnya),
event_date, start_time, end_time, location,
capacity, is_published, created_by, created_at
```

**Fitur:**
- Tabel: Judul · Tipe (badge) · Tanggal · Lokasi · Kapasitas · Jumlah Hadir · Status · Aksi
- Filter: event_type, bulan
- Tombol per baris: "Detail & Absensi" → `/admin/komunitas/acara/[id]`
- Tombol global: "+ Buat Acara" → `/admin/komunitas/acara/create`
- Toggle is_published inline

#### `komunitas/acara/create/page.tsx`

**Form buat acara:**
- Judul, Tipe (select), Tanggal, Waktu mulai & selesai
- Lokasi (text + opsi pilih dari `venues`)
- Kapasitas, Deskripsi
- Toggle publish langsung atau simpan draft

#### [NEW] `AcaraDetailClient.tsx`

**Fitur:**
- Info acara lengkap di header
- Tabel kehadiran: Nama · WA · Status Hadir (toggle langsung) · Waktu Dicatat
- Search & tambah member yang hadir: search by nama/WA → tambahkan ke absensi
- Summary: N hadir dari total member yang pernah datang
- Export kehadiran ke CSV

---

#### [NEW] `VenueClient.tsx`

**Tabel `venues` — Schema:**
```
id, name, address, city, description,
capacity, contact_wa, contact_name, maps_url,
photo_urls (jsonb - array URL), amenities (jsonb - array string),
pros (jsonb - array string), cons (jsonb - array string),
last_used_at, internal_notes,
is_recommended, order_index, created_at, updated_at
```

**Fitur:**
- Grid kartu venue: nama, foto pertama, alamat, kapasitas, badge rekomendasi
- Filter: kota, is_recommended
- Form tambah/edit: semua field, upload multiple foto ke Storage
- Toggle `is_recommended`
- Field `internal_notes` hanya terlihat admin (tidak tampil di publik)
- Kolom amenities, pros, cons: input tag-style (add/remove)
- Delete dengan konfirmasi

---

#### [NEW] `PartnerClient.tsx`

**Tabel `partners` — Schema:**
```
id, name, type (kafe/kampus/brand/media),
logo_url, website_url, instagram_url,
contact_person, contact_wa, description,
partnership_since (date), is_active,
is_featured, order_index, created_at
```

**Fitur:**
- Tabel: Logo thumbnail · Nama · Tipe (badge) · Kontak · Sejak · Featured (toggle) · Aktif (toggle)
- Filter: type, is_active, is_featured
- Form tambah/edit: semua field + upload logo ke Storage
- Drag reorder untuk order_index (urutan tampil di web publik)
- Delete dengan konfirmasi

---

### TAHAP 4 — CMS

#### [NEW] `KomunitasCMSClient.tsx`

**Tabel `landing_sections` — Schema:**
```
id, section_type, site ('komunitas'),
content (jsonb), is_visible, section_order, updated_at
```

**Fitur:**
- Daftar section landing komunitas dalam tabel:
  `hero, problem, cerita, pillar, program, stats, journey, gallery_preview, partner, cta`
- Per baris: urutan, nama section, toggle `is_visible`, tombol "Edit Konten", last updated
- Modal/drawer edit: form fields dinamis berdasarkan `section_type`:
  - `hero`: headline, subheadline, cta_text
  - `stats`: member_count, event_frequency, venue_count, alumni_label
  - `cta`: headline, button_text, button_href
  - dll.
- Auto-save ke `landing_sections.content`

---

#### [NEW] `AkademiCMSClient.tsx`

**Sumber data:** `landing_sections` WHERE `site = 'akademi'`

**Fitur:** Sama dengan KomunitasCMSClient, sections untuk akademi:
`hero_offer, pain_point, solution, method, roadmap, pricing, testimonial, faq, cta_checkout`

---

#### [NEW] `MediaLibraryClient.tsx`

**Sumber data:** Supabase Storage (list files dari bucket `media` + bucket `gallery`)

**Fitur:**
- Grid foto yang sudah diupload dengan nama file + ukuran
- Upload gambar baru (drag & drop atau file picker)
- Copy URL ke clipboard dengan satu klik
- Filter: bucket (media/gallery), tipe file
- Search by filename
- Delete dengan konfirmasi (hapus dari Storage)

---

### TAHAP 5 — Analytics (Read-Only, Server-Side Query)

#### `analytics/funnel/page.tsx`

**Data (Server Component, query Supabase):**
```sql
SELECT membership_tier, COUNT(*) as total
FROM members WHERE role = 'member'
GROUP BY membership_tier
```

**Tampilan:**
- Horizontal funnel bars: Visitor (manual input) → Free Member → Regular → MVP
- Angka aktual + persentase konversi tiap tahap
- Tabel breakdown per tier

---

#### `analytics/revenue/page.tsx`

**Data:**
```sql
-- Per bulan (12 bulan terakhir)
SELECT DATE_TRUNC('month', paid_at) as month,
       SUM(final_amount) as total, COUNT(*) as jumlah
FROM transactions WHERE status = 'paid'
GROUP BY month ORDER BY month DESC

-- Per paket
SELECT p.name, SUM(t.final_amount), COUNT(t.id)
FROM transactions t JOIN packages p ON t.package_id = p.id
WHERE t.status = 'paid' GROUP BY p.name
```

**Tampilan:** Bar chart (CSS-only) + tabel detail + summary total

---

#### `analytics/aktivitas/page.tsx`

**Data:**
```sql
-- Kehadiran per bulan
SELECT DATE_TRUNC('month', e.event_date) as month,
       COUNT(a.id) as total
FROM attendances a JOIN events e ON a.event_id = e.id
WHERE a.is_present = true GROUP BY month ORDER BY month

-- Top 10 member aktif
SELECT m.full_name, COUNT(a.id) as hadir
FROM attendances a JOIN members m ON a.member_id = m.id
WHERE a.is_present = true
GROUP BY m.id, m.full_name ORDER BY hadir DESC LIMIT 10
```

**Tampilan:** Bar chart kehadiran per bulan + tabel top member aktif

---

### TAHAP 6 — System

#### [NEW] `AdminsClient.tsx`

**Sumber data:** `members` WHERE `role != 'member'`

**Schema relevan:**
```
id, full_name, email, role, admin_role
(super_admin/admin_akademi/admin_komunitas), created_at
```

**Fitur:**
- Tabel admin: Nama · Email · Role · Admin Role · Bergabung · Aksi
- Undang admin baru: input email, pilih admin_role → kirim magic link atau set manual
- Edit admin_role yang sudah ada
- Revoke akses: set `role = 'member'` dan hapus `admin_role`

---

#### `system/roles/page.tsx`

**Konten:** Tabel permissions per role (static, sesuai New Concept)

| Modul | Super Admin | Admin Akademi | Admin Komunitas |
|-------|-------------|---------------|-----------------|
| Dashboard | ✅ | ✅ | ✅ |
| Member | ✅ Full | 👁 View | 👁 View |
| Attendance | ✅ | ❌ | ✅ |
| Packages | ✅ | ✅ | ❌ |
| Voucher | ✅ | ✅ | ❌ |
| Registration | ✅ | ✅ | ❌ |
| Mentoring | ✅ | ✅ | ❌ |
| Resources | ✅ | ✅ | ❌ |
| Acara & Absensi | ✅ | ❌ | ✅ |
| Venue & Partner | ✅ | ❌ | ✅ |
| CMS | ✅ Full | 📝 Akademi only | 📝 Komunitas only |
| Analytics | ✅ | 👁 Akademi | 👁 Komunitas |
| System | ✅ | ❌ | ❌ |

Halaman ini dokumentasi/referensi — tidak ada edit di fase ini.

---

#### [NEW] `LogsClient.tsx`

**Tabel `admin_activity_logs` — Schema:**
```
id, admin_id, action, module,
target_id, description,
old_data (jsonb), new_data (jsonb),
ip_address, created_at
```

**Fitur:**
- Tabel log: Waktu · Admin · Modul · Aksi · Deskripsi
- Filter: admin (dropdown), modul, tanggal
- Klik baris → ekspand detail: old_data vs new_data (diff sederhana)
- View-only, tidak ada delete

---

## Database Migrations yang Diperlukan

### Migration 1 — RLS Policies untuk tabel yang perlu diakses admin

Cek dan tambahkan RLS policies untuk tabel yang belum ada:
`events`, `attendances`, `venues`, `partners`, `resources`, `mentoring_sessions`, `landing_sections`, `admin_activity_logs`

```sql
-- Contoh pola policy untuk tabel 'events':
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access events"
ON events FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND role != 'member'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND role != 'member'
  )
);

CREATE POLICY "Public read published events"
ON events FOR SELECT TO anon, authenticated
USING (is_published = true);
```

### Migration 2 — Seed `landing_sections` (jika tabel kosong)

```sql
INSERT INTO landing_sections (section_type, site, content, is_visible, section_order)
VALUES
  ('hero', 'komunitas',
   '{"headline": "Dari Panggung Kecil, Menjadi Versi Terbaik Dirimu",
     "subheadline": "Komunitas public speaking, content creation & personal branding di Bandung",
     "cta_text": "Gabung Gratis Sekarang"}',
   true, 1),
  ('stats', 'komunitas',
   '{"member_count": 300, "event_frequency": "Weekly",
     "venue_label": "Multi-Venue", "alumni_label": "Alumni Pro"}',
   true, 6),
  ('cta', 'komunitas',
   '{"headline": "Panggungmu Dimulai Hari Ini",
     "button_text": "Daftar Gratis", "button_href": "/register"}',
   true, 10)
ON CONFLICT DO NOTHING;
```

### Migration 3 — Storage Bucket `resources`

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', false)
ON CONFLICT DO NOTHING;

CREATE POLICY "Admin upload resources"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'resources'
  AND EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role != 'member'
  )
);

CREATE POLICY "Member read resources"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resources');

CREATE POLICY "Admin delete resources"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'resources'
  AND EXISTS (
    SELECT 1 FROM members WHERE id = auth.uid() AND role != 'member'
  )
);
```

---

## Ringkasan File Dibuat/Diubah

| Aksi | File | Prioritas |
|------|------|-----------|
| MODIFY | `layout.tsx` | 🔴 Tinggi |
| MODIFY | `page.tsx` (dashboard) | 🔴 Tinggi |
| NEW | `data-center/transactions/TransactionsClient.tsx` | 🟡 Sedang |
| MODIFY | `data-center/transactions/page.tsx` | 🟡 Sedang |
| NEW | `data-center/attendance/AttendanceClient.tsx` | 🟡 Sedang |
| MODIFY | `data-center/attendance/page.tsx` | 🟡 Sedang |
| NEW | `akademi/payment/PaymentClient.tsx` | 🟡 Sedang |
| MODIFY | `akademi/payment/page.tsx` | 🟡 Sedang |
| NEW | `akademi/mentoring/MentoringClient.tsx` | 🟡 Sedang |
| MODIFY | `akademi/mentoring/page.tsx` | 🟡 Sedang |
| NEW | `akademi/resources/ResourcesClient.tsx` | 🟡 Sedang |
| MODIFY | `akademi/resources/page.tsx` | 🟡 Sedang |
| NEW | `komunitas/acara/AcaraListClient.tsx` | 🟡 Sedang |
| MODIFY | `komunitas/acara/page.tsx` | 🟡 Sedang |
| MODIFY | `komunitas/acara/create/page.tsx` | 🟡 Sedang |
| NEW | `komunitas/acara/[id]/AcaraDetailClient.tsx` | 🟡 Sedang |
| MODIFY | `komunitas/acara/[id]/page.tsx` | 🟡 Sedang |
| NEW | `komunitas/venue/VenueClient.tsx` | 🟡 Sedang |
| MODIFY | `komunitas/venue/page.tsx` | 🟡 Sedang |
| NEW | `komunitas/partner/PartnerClient.tsx` | 🟡 Sedang |
| MODIFY | `komunitas/partner/page.tsx` | 🟡 Sedang |
| NEW | `cms/komunitas/KomunitasCMSClient.tsx` | 🟢 Rendah |
| MODIFY | `cms/komunitas/page.tsx` | 🟢 Rendah |
| NEW | `cms/akademi/AkademiCMSClient.tsx` | 🟢 Rendah |
| MODIFY | `cms/akademi/page.tsx` | 🟢 Rendah |
| NEW | `cms/media/MediaLibraryClient.tsx` | 🟢 Rendah |
| MODIFY | `cms/media/page.tsx` | 🟢 Rendah |
| MODIFY | `analytics/funnel/page.tsx` | 🟢 Rendah |
| MODIFY | `analytics/revenue/page.tsx` | 🟢 Rendah |
| MODIFY | `analytics/aktivitas/page.tsx` | 🟢 Rendah |
| NEW | `system/admins/AdminsClient.tsx` | 🟢 Rendah |
| MODIFY | `system/admins/page.tsx` | 🟢 Rendah |
| MODIFY | `system/roles/page.tsx` | 🟢 Rendah |
| NEW | `system/logs/LogsClient.tsx` | 🟢 Rendah |
| MODIFY | `system/logs/page.tsx` | 🟢 Rendah |

**Total: 35 file** (13 NEW + 22 MODIFY)

---

## Urutan Pengerjaan

```
Tahap 0: Layout & Dashboard (FONDASI — kerjakan dulu sebelum modul apapun)
  1. layout.tsx — sidebar redesign monochrome
  2. page.tsx — dashboard dengan live Supabase data

Tahap 1: Data Center (view operasional)
  3. TransactionsClient
  4. AttendanceClient + catat manual

Tahap 2: Akademi (tools operasional akademi)
  5. PaymentClient + konfirmasi manual
  6. MentoringClient + jadwal CRUD
  7. ResourcesClient + upload ke Storage

Tahap 3: Komunitas (tools operasional komunitas)
  8. AcaraListClient + AcaraDetailClient (absensi)
  9. acara/create (form buat acara)
  10. VenueClient
  11. PartnerClient

Tahap 4: CMS (kelola konten web publik)
  12. KomunitasCMSClient
  13. AkademiCMSClient
  14. MediaLibraryClient

Tahap 5: Analytics (read-only queries)
  15. funnel page
  16. revenue page
  17. aktivitas page

Tahap 6: System
  18. AdminsClient
  19. roles page (static)
  20. LogsClient
```

---

## Keputusan Desain (Revisi 2026-06-27)

> Semua pertanyaan berikut sudah dikonfirmasi. Implementasi mengikuti keputusan ini.

---

### Q1 — Absensi: Manual dulu, QR sebagai Coming Soon

**Keputusan:** Input manual dahulu. Scaffold untuk QR disiapkan tapi belum aktif.

**Implikasi implementasi:**
- `AttendanceClient.tsx` → catat kehadiran manual (search member → pilih event → submit)
- Kolom `scan_method` di `attendances` saat ini selalu diisi `'manual'`
- Kolom `scanned_at` diisi `NOW()` saat submit manual
- Siapkan komponen `<QRScannerPlaceholder />` di halaman detail acara: tampilkan blok `[ COMING SOON — QR SCANNER ]` dengan styling monochrome, tidak ada fungsi aktif
- Pastikan kolom `qr_token` di tabel `members` sudah ada (sudah ada berdasarkan schema) — akan dipakai saat QR aktif nanti

---

### Q2 — Payment: Manual dulu, Midtrans sebagai Coming Soon

**Keputusan:** Konfirmasi manual. Admin klik "Konfirmasi Lunas" tanpa upload bukti.

**Implikasi implementasi:**
- `PaymentClient.tsx` → tampilkan daftar transaksi `status='pending'` + tombol "Konfirmasi Lunas"
- Klik konfirmasi → `transactions.status = 'paid'` + `transactions.paid_at = NOW()` + update `members.membership_tier` sesuai paket
- Field `metadata` (jsonb) di `transactions` sudah ada — saat ini tidak wajib diisi, dicadangkan untuk payload Midtrans di masa depan
- Tambahkan komentar `// TODO: Replace with Midtrans webhook handler` di file `PaymentClient.tsx`
- Tidak ada form upload bukti transfer di fase ini

---

### Q3 — Analytics Charts: Install Recharts

**Keputusan:** Install Recharts.

**Command instalasi (dikerjakan di Tahap 0):**
```bash
cd front && npm install recharts
```

**Penggunaan per halaman:**

| Halaman | Chart Type | Data |
|---------|-----------|------|
| `analytics/funnel` | `BarChart` horizontal | Tier breakdown member |
| `analytics/revenue` | `BarChart` | Revenue per bulan |
| `analytics/aktivitas` | `BarChart` | Kehadiran per bulan |
| `page.tsx` dashboard | `AreaChart` mini | 7 hari terakhir (transaksi/member baru) |

**Styling Recharts (konsisten monochrome):**
- Light: `fill="#2c2c2c"` · Dark: `fill="#ffffff"`
- Tidak ada warna-warni — sesuai design system
- Custom `<Tooltip>` dengan font `text-xs font-sans`

---

### Q4 — Role System: Granular Permission per Modul (Checkbox)

**Keputusan:** Tidak menggunakan kategori `admin_akademi` / `admin_komunitas`. Super Admin membuat akun admin lain dan mengatur izin akses per modul via **checkbox granular**.

#### Migration Baru: Tabel `admin_permissions`

```sql
CREATE TABLE admin_permissions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id   UUID REFERENCES members(id) ON DELETE CASCADE,
  module     TEXT NOT NULL,
  -- Nilai module yang valid:
  -- 'members', 'transactions', 'attendance', 'packages',
  -- 'voucher', 'payment', 'mentoring', 'resources',
  -- 'acara', 'venue', 'partner', 'cms_komunitas',
  -- 'cms_akademi', 'cms_galeri', 'media_library',
  -- 'analytics', 'system'
  can_view   BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit   BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(admin_id, module)
);

ALTER TABLE admin_permissions ENABLE ROW LEVEL SECURITY;

-- Hanya super admin yang bisa kelola permissions
CREATE POLICY "Super admin manage permissions"
ON admin_permissions FOR ALL TO authenticated
USING (
  EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND admin_role = 'super_admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM members WHERE id = auth.uid() AND admin_role = 'super_admin')
);

-- Admin bisa baca permission miliknya sendiri
CREATE POLICY "Admin read own permissions"
ON admin_permissions FOR SELECT TO authenticated
USING (admin_id = auth.uid());
```

#### Alur Kerja Permission

1. Super Admin buat akun admin baru → set `role = 'admin'`, `admin_role = NULL`
2. Buka `system/admins` → pilih admin → klik **"Atur Izin"**
3. Modal checkbox grid muncul:

```
MODUL               VIEW   CREATE   EDIT   DELETE
Member               [x]    [ ]     [x]    [ ]
Attendance           [x]    [x]     [x]    [ ]
Packages             [ ]    [ ]     [ ]    [ ]
Voucher              [x]    [x]     [x]    [x]
Registration         [x]    [ ]     [x]    [ ]
Mentoring            [x]    [x]     [x]    [ ]
Resources            [x]    [x]     [x]    [x]
Acara                [x]    [x]     [x]    [ ]
Venue                [x]    [x]     [x]    [x]
Partner              [x]    [x]     [x]    [x]
CMS Komunitas        [ ]    [ ]     [ ]    [ ]
CMS Akademi          [ ]    [ ]     [ ]    [ ]
CMS Galeri           [x]    [x]     [x]    [x]
Media Library        [x]    [x]     [ ]    [ ]
Analytics            [x]    [ ]     [ ]    [ ]
System               [ ]    [ ]     [ ]    [ ]
```

4. Simpan → upsert ke `admin_permissions`
5. Sidebar otomatis hanya menampilkan modul yang `can_view = true`
6. Tombol Create/Edit/Delete di tiap halaman conditional berdasarkan permission

#### Hierarki
```
Super Admin (admin_role = 'super_admin')
  → Bypass semua permission check, akses penuh
  → Satu-satunya yang bisa kelola akun admin lain

Admin Biasa (admin_role = NULL)
  → Hanya akses modul sesuai baris di admin_permissions
```

#### Komponen yang Terpengaruh
- **`layout.tsx`**: fetch `admin_permissions` untuk user aktif → render menu sidebar conditional
- **`system/admins/AdminsClient.tsx`**: tombol "Atur Izin" → modal checkbox grid
- **Setiap Client component**: terima prop `permissions: AdminPermission` → conditional render tombol aksi

---

### Q5 — Eksekusi: Per Tahap

**Keputusan:** Satu tahap dikerjakan, dikonfirmasi, baru lanjut ke tahap berikutnya.

**Urutan eksekusi yang diperbarui:**

```
Tahap 0: Layout + Dashboard + Recharts install
  1. npm install recharts
  2. layout.tsx — sidebar monochrome + permission-aware menu
  3. page.tsx — dashboard dengan live Supabase data + mini chart

Tahap 1: Data Center
  4. TransactionsClient (view only)
  5. AttendanceClient (manual + QR placeholder)

Tahap 2: Akademi
  6. PaymentClient (konfirmasi manual + TODO Midtrans comment)
  7. MentoringClient
  8. ResourcesClient

Tahap 3: Komunitas
  9. AcaraListClient + AcaraDetailClient + create form
  10. VenueClient
  11. PartnerClient

Tahap 4: CMS
  12. Seed migration landing_sections (komunitas + akademi)
  13. KomunitasCMSClient
  14. AkademiCMSClient
  15. MediaLibraryClient

Tahap 5: Analytics (Recharts charts)
  16. funnel/page.tsx
  17. revenue/page.tsx
  18. aktivitas/page.tsx

Tahap 6: System + Permission Engine
  19. Migration: CREATE TABLE admin_permissions
  20. AdminsClient + modal checkbox permission grid
  21. system/roles/page.tsx (tabel referensi statis)
  22. LogsClient
```

---

### Q6 — CMS landing_sections: Seed Data Saat Eksekusi Tahap 4

**Keputusan:** Buat seed data untuk semua section saat Tahap 4 dieksekusi (bukan sekarang).

**Strategi seed:**

```sql
-- Tambahkan unique constraint jika belum ada
ALTER TABLE landing_sections
ADD CONSTRAINT IF NOT EXISTS landing_sections_type_site_unique
UNIQUE (section_type, site);

-- Seed section komunitas
INSERT INTO landing_sections (section_type, site, content, is_visible, section_order)
VALUES
  ('hero', 'komunitas',
   '{"headline": "Dari Panggung Kecil, Menjadi Versi Terbaik Dirimu",
     "subheadline": "Komunitas public speaking, content creation & personal branding di Bandung",
     "cta_text": "Gabung Gratis Sekarang"}',
   true, 1),
  ('problem', 'komunitas',
   '{"items": ["Takut tampil di depan orang", "Tidak punya circle yang suportif",
     "Bingung mulai dari mana", "Tidak percaya diri", "Merasa stagnan"]}',
   true, 2),
  ('stats', 'komunitas',
   '{"member_count": 300, "event_frequency": "Weekly",
     "venue_label": "Multi-Venue", "alumni_label": "Alumni Pro"}',
   true, 6),
  ('cta', 'komunitas',
   '{"headline": "Panggungmu Dimulai Hari Ini",
     "button_text": "Daftar Gratis", "button_href": "/register"}',
   true, 10)
ON CONFLICT (section_type, site) DO NOTHING;

-- Seed section akademi
INSERT INTO landing_sections (section_type, site, content, is_visible, section_order)
VALUES
  ('hero_offer', 'akademi',
   '{"headline": "Dari Gugup Jadi Percaya Diri di Atas Panggung",
     "subheadline": "Program belajar terstruktur untuk public speaking & personal branding",
     "cta_text": "Mulai Perjalanan Belajarmu"}',
   true, 1),
  ('cta_checkout', 'akademi',
   '{"headline": "Siap Mulai Perjalananmu?",
     "button_text": "Pilih Program Sekarang", "button_href": "/checkout"}',
   true, 10)
ON CONFLICT (section_type, site) DO NOTHING;
```

- CMS editor menampilkan semua section yang ada di DB
- Jika ada section baru yang belum ada seed-nya, admin bisa menambahkan entry langsung dari UI CMS

---

## Verification Plan

### Build Test
```bash
cd front && npm run build
```

### Manual Verification Checklist
- [ ] Sidebar monochrome tampil, semua link aktif, highlight menu aktif berfungsi
- [ ] Sidebar menyembunyikan menu yang tidak ada `can_view` permission (admin biasa)
- [ ] Super admin melihat semua menu (bypass permission)
- [ ] Dashboard: stat cards dengan angka live dari Supabase
- [ ] Dashboard: mini AreaChart (Recharts) muncul tanpa error
- [ ] Transactions: tabel terisi, filter status/tanggal berfungsi
- [ ] Attendance: catat kehadiran manual berhasil update DB, QR placeholder muncul bertulisan "Coming Soon"
- [ ] Mentoring: create + edit session berfungsi
- [ ] Payment: konfirmasi manual update `status='paid'` + tier member, TODO comment ada
- [ ] Resources: upload ke Supabase Storage bucket `resources` + toggle publish
- [ ] Acara: create event + detail + toggle absensi member
- [ ] Venue: CRUD + upload foto + toggle rekomendasi
- [ ] Partner: CRUD + upload logo + toggle featured + drag reorder
- [ ] CMS Komunitas: seed data muncul di tabel, edit section content berhasil save
- [ ] CMS Akademi: sama seperti di atas
- [ ] Media Library: upload + copy URL + delete dari Storage
- [ ] Analytics funnel: BarChart Recharts muncul dengan data tier member
- [ ] Analytics revenue: BarChart per bulan muncul
- [ ] Analytics aktivitas: BarChart kehadiran + tabel top member
- [ ] System Admins: buat admin baru + modal checkbox permission grid berfungsi
- [ ] System Logs: log terbuat otomatis saat admin melakukan CRUD sensitif
- [ ] Dark mode berfungsi di seluruh admin panel (sidebar, table, chart, form)
- [ ] Tidak ada TypeScript error saat `npm run build`

---

## Verification Plan

### Build Test
```bash
cd front && npm run build
```

### Manual Verification Checklist
- [ ] Sidebar monochrome tampil, semua link aktif, highlight menu aktif
- [ ] Dashboard: stat cards dengan angka live dari Supabase
- [ ] Transactions: tabel terisi, filter status/tanggal berfungsi
- [ ] Attendance: catat kehadiran manual berhasil update DB
- [ ] Mentoring: create + edit session berfungsi
- [ ] Payment: konfirmasi update status transaksi + tier member
- [ ] Resources: upload ke Supabase Storage + toggle publish
- [ ] Acara: create event + detail + toggle absensi member
- [ ] Venue: CRUD + upload foto + toggle rekomendasi
- [ ] Partner: CRUD + upload logo + toggle featured
- [ ] CMS Komunitas: edit section content berhasil save ke DB
- [ ] CMS Akademi: sama seperti di atas
- [ ] Media Library: upload + copy URL + delete dari Storage
- [ ] Analytics: data muncul dari query live (bukan dummy)
- [ ] System Logs: log terbuat otomatis saat admin melakukan CRUD sensitif
- [ ] Dark mode berfungsi di seluruh admin panel
- [ ] Tidak ada TypeScript error saat `npm run build`
