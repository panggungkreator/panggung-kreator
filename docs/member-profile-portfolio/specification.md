# Spesifikasi Teknis: Member Profile, Portfolio & Form Priority
# Panggung Kreator — Platform v2

**Path:** `docs/member-profile-portfolio/specification.md`
**Versi:** 1.0
**Tanggal:** Juli 2026
**Status:** Draft — Menunggu Review
**Author:** Senior Full-Stack Architect

---

## 1. Gambaran Umum

Dokumen ini mendefinisikan spesifikasi teknis untuk **4 sistem baru** yang saling terhubung:

| Sistem | Scope | Domain |
|---|---|---|
| **A. Form Priority** | Pengumpulan data diri & pemetaan minat | Web Komunitas (`/register` + `/myprofile`) |
| **B. Audit & Ekstensi Schema** | Evaluasi tabel existing, tambahan kolom & tabel | Supabase (database) |
| **C. Talent Showcase & Portfolio** | Halaman profil member post-login | Web Komunitas (`/talent`, `/myprofile`) |
| **D. Data Processing Pipeline** | Alur otomasi pasca-input form | Backend (Supabase Functions + Edge Functions) |

---

## 2. Form Priority — Pengumpulan Data Diri & Pemetaan Minat

### 2.1 Konteks & Tujuan

Form ini mengumpulkan data yang **belum ada di schema existing** (`members`):
- Pemetaan minat spesifik (VO, MC, Content Creator, dll.) → untuk segmentasi course & newsletter
- Data diri tambahan untuk portofolio publik (bio, sosial media lengkap)

Untuk mengurangi friksi saat pendaftaran (drop-off rate), pengumpulan data dibagi menjadi **dua tahap**:
1. **Tahap Onboarding Cepat (`/register`)** — Hanya menanyakan data esensial dan pemetaan minat utama.
2. **Tahap Lengkapi Profil (`/myprofile`)** — Input data sekunder (foto, bio, link sosial media) dan minat lanjutan dilakukan setelah user berhasil login.

### 2.2 Pembagian Field Form

#### Tahap 1: Onboarding Register (Ringkas)
*Tujuan: User cepat masuk ke sistem namun sistem tetap mendapat data segmentasi dasar.*

| Field | Tipe | Lokasi Simpan | Keterangan |
|---|---|---|---|
| Nama Lengkap | text | `members.full_name` | Wajib |
| Nama Panggung | text | `members.stage_name` | Opsional |
| WhatsApp | text | `members.whatsapp_number` | Wajib |
| Kota Domisili | text | `members.city` | Opsional |
| Kode Affiliate Teman | text | `members.referred_by` | Opsional (Input kode referral) |
| Minat Utama | multi-select | `member_interests.primary_interests` | Wajib (PS, MC, VO, CC, PB, Live Host) |
| Tingkat Pengalaman | radio | `member_interests.experience_level` | Wajib (Pemula / Menengah / Lanjutan) |
| Sumber Info | single select | `member_interests.referral_source` | Opsional |
| Berlangganan Newsletter | toggle | `members.subscribed_newsletter` | Default: true |

#### Tahap 2: Lengkapi Profil Post-Login (Sekunder)
*Tujuan: Membangun portofolio publik dan talent showcase. User bisa mengisi kapan saja dari `/myprofile`.*

| Field | Tipe | Lokasi Simpan |
|---|---|---|
| Foto Profil | file upload | `members.avatar_url` (Storage) |
| Bio Singkat | text | `members.description` |
| Pekerjaan/Status | text | `members.occupation` |
| Instagram | text | `members.instagram_username` |
| TikTok | text | `members.tiktok_username` |
| YouTube Channel | text | `members.youtube_url` |
| LinkedIn | text | `members.linkedin_url` |
| Website/Portfolio URL | text | `members.portfolio_url` |
| Goal di Panggung Kreator | multi-select | `member_interests.goals` |
| Topik Konten Disukai | multi-select | `member_interests.content_topics` |
| Preferensi Belajar & Waktu| multi-select | `member_interests.learning_preference`, `availability` |

### 2.3 Validasi Form

```typescript
// Validasi minimal yang harus lulus:
const required = ['full_name', 'whatsapp_number', 'instagram_username', 'occupation']
const interestRequired = ['primary_interests'] // minimal 1 pilihan
// Semua field lain: opsional
```

---

## 3. Audit Supabase — Evaluasi Schema Existing

### 3.1 Inventaris Tabel Existing (24 tabel)

```
members             packages            vouchers
events              attendances         landing_sections
transactions        referral_codes      mentoring_sessions
resources           partners            venues
team_members        gallery_items       gallery_albums
wa_group_assignments media_library      testimonials
admin_activity_logs privilege_groups    privilege_items
privilege_actions   admin_roles         admin_role_permissions
```

### 3.2 Keputusan: Tabel Baru vs Kolom Tambahan

#### ✅ CUKUP tambah kolom di tabel `members` yang sudah ada

Kolom baru yang ditambahkan ke `members`:

```sql
-- Kolom sosial media & identitas tambahan
city                    text,
youtube_url             text,
linkedin_url            text,
portfolio_url           text,
avatar_url              text,          -- URL ke Supabase Storage

-- Kolom audit trail tier (sudah dirancang di concept-member.md)
tier_changed_at         timestamptz,
tier_changed_by         uuid REFERENCES members(id),
tier_note               text,

-- Kolom untuk newsletter
subscribed_newsletter   boolean DEFAULT true,
newsletter_subscribed_at timestamptz DEFAULT now(),

-- Kolom untuk Affiliate System
affiliate_code          text UNIQUE,
referred_by             uuid REFERENCES members(id),
commission_balance      numeric DEFAULT 0
```

**Alasan tidak perlu tabel terpisah untuk data sosial:**
- Data 1:1 dengan member (satu member = satu set data sosial)
- Tidak ada relasi many-to-many yang membutuhkan junction table
- Query lebih sederhana tanpa JOIN tambahan

#### ✅ CUKUP tambah kolom di tabel `transactions` yang sudah ada

```sql
ALTER TABLE public.transactions
  ADD COLUMN affiliate_code_used text,
  ADD COLUMN commission_earned numeric DEFAULT 0;
```
*Tujuan: Mencatat kode siapa yang dipakai saat beli paket, dan komisi yang cair setelah Admin mengkonfirmasi lunas.*

#### ❌ BUTUH tabel baru: `member_interests`

Data minat bersifat **multi-value per member** (satu member bisa punya banyak minat), sehingga harus dinormalisasi ke tabel terpisah.

```sql
CREATE TABLE public.member_interests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  -- Pemetaan minat (array atau JSONB)
  primary_interests   text[] NOT NULL DEFAULT '{}',
  -- Nilai valid: 'public_speaking' | 'mc_host' | 'voice_over' |
  --              'content_creator' | 'personal_branding' | 'live_host'

  experience_level    text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  -- 'beginner' | 'intermediate' | 'advanced'

  goals               text[] DEFAULT '{}',
  -- 'self_learning' | 'professional_career' | 'business' | 'social_media'

  content_topics      text[] DEFAULT '{}',
  -- 'motivation' | 'education' | 'entertainment' | 'lifestyle' | 'business' | 'technology'

  availability        text CHECK (availability IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),

  learning_preference text[] DEFAULT '{}',
  -- 'online' | 'offline' | 'hybrid'

  referral_source     text,
  -- 'instagram' | 'tiktok' | 'friend' | 'event' | 'other'

  ai_analysis         text,
  -- Hasil ringkasan otomatis dari LLM (Gemini API) untuk Admin/Mentor

  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT member_interests_member_id_unique UNIQUE (member_id)
  -- Satu member hanya punya satu baris interest (upsert pattern)
);
```

#### ❌ BUTUH tabel baru: `portfolio_items`

Data portofolio bersifat **multi-item per member** (satu member bisa punya banyak karya/proyek).

```sql
CREATE TABLE public.portfolio_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,

  pillar          text NOT NULL CHECK (pillar IN ('public_speaking', 'content_creation', 'personal_branding')),
  -- Pilar mana yang relevan dengan item ini

  item_type       text NOT NULL CHECK (item_type IN ('video', 'image', 'article', 'link', 'achievement')),
  -- Jenis item portofolio

  title           text NOT NULL,
  description     text,

  -- Storage strategy (lihat Bagian 4)
  media_url       text,           -- URL final yang tampil (bisa eksternal atau storage)
  media_source    text NOT NULL CHECK (media_source IN ('youtube', 'instagram', 'tiktok', 'storage', 'external')),
  thumbnail_url   text,           -- Thumbnail (selalu dari storage, ukuran kecil)

  -- Metadata tambahan
  is_featured     boolean DEFAULT false,  -- Tampil di bagian "Unggulan" profil
  is_public       boolean DEFAULT true,   -- Kontrol visibilitas
  view_count      integer DEFAULT 0,
  sort_order      integer DEFAULT 0,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
```

### 3.3 Ringkasan Perubahan Schema

| Aksi | Target | Jumlah Perubahan |
|---|---|---|
| ALTER TABLE (tambah kolom) | `members` | +11 kolom |
| CREATE TABLE | `member_interests` | 1 tabel baru |
| CREATE TABLE | `portfolio_items` | 1 tabel baru |
| **Total tabel setelah** | | **26 tabel** |

---

## 4. Talent Showcase & Portfolio — Arsitektur Teknis

### 4.1 Penempatan di Web Komunitas

| URL | Akses | Deskripsi |
|---|---|---|
| `/talent` | **Publik** | Direktori semua talent — bisa dilihat siapapun (visitor, mitra, sponsor) |
| `/talent/[username]` | **Publik** | Profil publik member individual — portofolio, pilar, karya |
| `/myprofile` | Login | Area private member — termasuk tab "Edit Profil & Portfolio" |

> **Keputusan arsitektur:** Halaman `/talent` dan `/talent/[username]` dibuat **publik** agar bisa digunakan sebagai **talent showcase untuk mitra & sponsor** (sesuai fungsi Web Komunitas di PRD: Pitching & Talent Management).

**Struktur halaman `/talent/[username]`:**

```
[Header: Foto, Nama, Stage Name, Bio]
[Badge Tier: Priority / Membership]
[3 Pilar Tabs: Public Speaking | Content Creation | Personal Branding]
  └── Grid portfolio items per pilar
[Sosial Media Links]
[CTA: Hubungi via WA (jika is_public = true)]
```

### 4.2 Arsitektur Storage — Hemat Biaya & Efisien

#### Prinsip Utama: **"Store Small, Link Large"**

Supabase Storage **gratis tier = 1 GB**. Untuk skala 300+ member dengan portofolio video, ini akan cepat penuh jika tidak dikelola dengan benar.

#### Strategi per Tipe Konten:

```
┌─────────────────────────────────────────────────────────────────┐
│                    DECISION TREE STORAGE                        │
│                                                                  │
│  User upload konten                                              │
│         │                                                        │
│    Tipe konten?                                                  │
│    ┌──────────┬────────────┐                                     │
│   VIDEO     IMAGE        ARTIKEL                                 │
│    │          │             │                                    │
│  Sudah       <500KB?     Simpan sebagai                          │
│  ada di      ┌──┴──┐     text di DB ✓                           │
│  YouTube?  YES    NO                                             │
│  ┌──┴──┐    │       │                                            │
│ YES   NO  Simpan  Compress                                       │
│  │     │  Storage  dulu →                                        │
│  │   Wajib  thumbnail  Simpan Storage                            │
│  │   upload (max 200KB) ✓                                        │
│  │   ke YT                                                       │
│ Simpan      Thumbnail saja                                       │
│ YouTube URL di Storage ✓                                         │
│ + auto-gen  Video URL = YT                                       │
│ thumbnail ✓                                                      │
└─────────────────────────────────────────────────────────────────┘
```

#### Implementasi Detail per Tipe:

**1. VIDEO — Wajib External Link (Zero Storage Cost)**

```typescript
// Aturan keras: video TIDAK disimpan di Supabase Storage
// Member harus upload ke YouTube / TikTok / Instagram dulu
// Lalu paste URL → sistem ekstrak thumbnail otomatis

const videoSources = {
  youtube: {
    pattern: /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    thumbnail: (id: string) => `https://img.youtube.com/vi/${id}/hqdefault.jpg`,
    // Thumbnail YouTube gratis via URL publik — TIDAK perlu disimpan ke Storage
  },
  tiktok: {
    // Gunakan TikTok oEmbed API untuk ambil thumbnail
    thumbnail: 'via TikTok oEmbed API → cache di Supabase',
  },
  instagram: {
    // Gunakan URL Reel/Post langsung
    thumbnail: 'screenshot manual oleh member atau skip',
  }
}
```

**2. IMAGE — Compressed & Optimized Upload**

```typescript
// Pipeline sebelum upload ke Supabase Storage:
const imageUploadPipeline = {
  maxSizeBefore: '10MB',     // Batas upload dari client
  compressionTarget: '200KB', // Target setelah kompresi (browser-image-compression lib)
  format: 'webp',             // Konversi ke WebP untuk efisiensi
  dimensions: {
    avatar: { w: 400, h: 400 },      // Foto profil — 1:1
    portfolio: { w: 1200, h: 800 },  // Gambar portfolio — landscape
    thumbnail: { w: 400, h: 300 },   // Thumbnail video — kecil
  },
  storagePath: 'member-avatars/{member_id}/avatar.webp',
  portfolioPath: 'portfolio/{member_id}/{item_id}.webp',
}
```

**3. Supabase Storage Bucket Structure:**

```
Buckets:
├── member-avatars/        (public)   ← Foto profil — target <200KB/file
│   └── {member_id}/
│       └── avatar.webp
│
├── portfolio-images/      (public)   ← Gambar portfolio — target <500KB/file
│   └── {member_id}/
│       └── {item_id}.webp
│
└── portfolio-thumbnails/  (public)   ← Thumbnail video (cached) — target <100KB/file
    └── {member_id}/
        └── {item_id}-thumb.webp
```

**4. Estimasi Penggunaan Storage:**

```
300 member × 200KB (avatar)              = 60 MB
300 member × 5 item × 500KB (portfolio)  = 750 MB
300 member × 3 video × 100KB (thumbnail) = 90 MB
─────────────────────────────────────────
Total estimasi                           ≈ 900 MB  (dalam batas 1GB Supabase free)
```

> **Strategi scaling:** Jika mendekati limit 1GB, implementasi `cleanup_orphaned_files` Edge Function untuk hapus file lama yang item portfolio-nya sudah dihapus.

#### RLS Policy Storage:

```sql
-- Avatar: siapapun bisa baca, hanya pemilik yang bisa upload
CREATE POLICY "Public read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'member-avatars');

CREATE POLICY "Owner upload avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'member-avatars' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Portfolio: sama — publik baca, pemilik upload
CREATE POLICY "Public read portfolio" ON storage.objects
  FOR SELECT USING (bucket_id IN ('portfolio-images', 'portfolio-thumbnails'));

CREATE POLICY "Owner upload portfolio" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('portfolio-images', 'portfolio-thumbnails') AND
    auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## 5. Data Processing Pipeline — Pasca-Input Form

### 5.1 Alur Lengkap Pasca Submit Form Register/Priority

```
Member submit Form
       │
       ▼
[1] Validasi client-side (Zod schema)
       │ gagal → tampilkan error inline
       │ lolos ↓
[2] POST ke API Route: /api/member/profile
       │
       ▼
[3] Server-side validation (ulang dengan Zod)
       │
       ▼
[4] Transaction Supabase (atomic):
    ├── UPDATE members SET (kolom baru)
    └── UPSERT member_interests (by member_id)
       │
       ▼
[5] Jika ada upload gambar:
    ├── Kompresi di browser → upload ke Supabase Storage
    └── UPDATE members SET avatar_url = {storage_url}
       │
       ▼
[6] Trigger Supabase: update_updated_at_column() (auto)
       │
       ▼
[7] Response ke client:
    ├── Sukses → invalidate React Query cache, tampilkan toast "Profil diperbarui"
    └── Gagal → rollback transaction, tampilkan error spesifik
       │
       ▼
[8] Background (async — tidak blocking UI):
    ├── Kirim email konfirmasi (jika newsletter = true)
    ├── Tag member di newsletter list (MailerLite/Brevo)
    └── Update WA group assignment jika tier berubah
```

### 5.2 Segmentasi Otomatis Berdasarkan Minat

Setelah form tersimpan, sistem membaca `member_interests` untuk menentukan:

```typescript
// Fungsi segmentasi (Supabase Edge Function / server-side)
function segmentMember(interests: MemberInterests): SegmentTags[] {
  const tags: string[] = []

  // Tag berdasarkan minat → menentukan newsletter segment & course recommendation
  if (interests.primary_interests.includes('voice_over')) tags.push('segment:vo')
  if (interests.primary_interests.includes('mc_host')) tags.push('segment:mc')
  if (interests.primary_interests.includes('content_creator')) tags.push('segment:content')
  if (interests.primary_interests.includes('live_host')) tags.push('segment:livehost')

  // Tag berdasarkan level → menentukan konten yang dikirim
  tags.push(`level:${interests.experience_level}`)

  // Tag berdasarkan referral source → analytics tracking
  tags.push(`source:${interests.referral_source}`)

  return tags
}
```

### 5.3 Newsletter Integration

```typescript
// Integrasi dengan email marketing tool (MailerLite / Brevo — free tier cukup untuk 300+ member)
// Dipanggil sebagai Supabase Edge Function setelah form sukses tersimpan

const newsletterPayload = {
  email: member.email,
  name: member.full_name,
  groups: segmentTags,           // Dari segmentasi di atas
  fields: {
    community: member.community,
    tier: member.membership_tier,
    city: member.city,
    interests: member_interests.primary_interests.join(','),
  }
}
// POST ke MailerLite/Brevo API → subscriber masuk ke list & segment yang tepat
```

### 5.4 Analisis AI Kuesioner (Next.js API Route)

Untuk memberikan kemudahan bagi Mentor membaca hasil kuesioner yang panjang, sistem menggunakan **Google Gemini API** (`gemini-1.5-flash`) yang dijalankan di backend Next.js secara *asynchronous* (setelah data tersimpan).

**Alur Kerja AI:**
1. Form profil lengkap dikirim ke `/api/member/profile`.
2. Setelah data berhasil di-*upsert* ke Supabase, backend Next.js memanggil *helper function* yang menembak Gemini API di latar belakang (non-blocking).
3. **Prompt AI:** Diberikan *raw data* jawaban kuesioner dan diminta untuk mengekstrak poin utama (Kekuatan, Kendala Terbesar, Potensi/Goal).
4. Hasil teks dari Gemini akan di-update ke kolom `ai_analysis` pada tabel `member_interests`.
5. Hasil analisis ini **hanya tampil di Dashboard Admin/Mentor**. Member tidak bisa melihat hasil `ai_analysis` ini (dijaga oleh aturan UI dan RLS Admin).

### 5.5 Skema Relasi Data (ERD Sederhana)

```
members (existing + kolom baru)
   │
   ├──< member_interests (1:1 via unique constraint)
   │        primary_interests[]
   │        experience_level
   │        goals[]
   │        ai_analysis (hasil LLM)
   │        ...
   │
   ├──< portfolio_items (1:many)
   │        pillar
   │        item_type
   │        media_url (external) / thumbnail_url (storage)
   │        is_featured, is_public
   │
   ├──< attendances (existing)
   ├──< mentoring_sessions (existing)
   └──< transactions (existing)
```

---

## 6. RLS Policy Tambahan

```sql
-- member_interests: hanya pemilik yang bisa lihat & edit sendiri
-- Admin bisa lihat semua (untuk analytics & segmentasi)
ALTER TABLE member_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member read own interests" ON member_interests
  FOR SELECT USING (auth.uid() = member_id);

CREATE POLICY "Member upsert own interests" ON member_interests
  FOR ALL USING (auth.uid() = member_id);

CREATE POLICY "Admin read all interests" ON member_interests
  FOR SELECT USING (is_admin());

-- portfolio_items: publik baca jika is_public=true, pemilik bisa CRUD
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read portfolio" ON portfolio_items
  FOR SELECT USING (is_public = true);

CREATE POLICY "Member CRUD own portfolio" ON portfolio_items
  FOR ALL USING (auth.uid() = member_id);

CREATE POLICY "Admin read all portfolio" ON portfolio_items
  FOR SELECT USING (is_admin());
```

---

## 7. Keputusan Teknis & Catatan Penting

| # | Keputusan | Alasan |
|---|---|---|
| 1 | Video wajib external (YouTube/TikTok/IG) | Storage cost 0 untuk video, gratis tier Supabase 1GB cukup |
| 2 | Gambar di-compress ke WebP <500KB sebelum upload | Efisiensi storage, loading lebih cepat |
| 3 | `member_interests` pakai UNIQUE constraint (bukan multiple rows) | Simplicity — satu member satu baris interest, update via upsert |
| 4 | Portfolio items menggunakan `media_source` enum | Memudahkan renderer di frontend untuk pilih komponen yang tepat |
| 5 | Halaman `/talent/[username]` dibuat publik | Sesuai PRD: Web Komunitas untuk Talent Management & Pitching ke mitra |
| 6 | Newsletter segment pakai external tool (MailerLite/Brevo) | Supabase tidak punya fitur email marketing — free tier cukup untuk 300-1000 subscriber |
| 7 | Avatar dan thumbnail selalu stored di Supabase Storage | Kontrol penuh atas ketersediaan URL — tidak bergantung platform eksternal |

---

*Dokumen ini adalah pasangan dari `implementationplan.md` di folder yang sama. Selalu baca keduanya bersama.*
