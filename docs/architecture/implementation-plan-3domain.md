# Restrukturisasi Arsitektur: 3-Domain Multi-Site

Perombakan arsitektur Panggung Kreator dari single-site menjadi sistem 3-domain menggunakan Next.js App Router dengan rewrite middleware, disertai perombakan database Supabase secara menyeluruh.

---

## User Review Required

> [!IMPORTANT]
> **Breaking change pada `members`:** Migrasi kolom di tabel yang sudah ada data (1 member aktif). Semua SQL migration disertakan untuk review sebelum dijalankan.

> [!WARNING]
> **`packages` tidak memiliki RLS** — tabel ini terbuka penuh ke semua user. Wajib diperbaiki sebelum go-live.

> [!CAUTION]
> **`landing_sections` existing (13 baris) = konten Akademi.** Setelah kolom `site` ditambahkan, semua data existing akan di-tag `site='akademi'`. Konten komunitas dibuat baru oleh admin via CMS.

---

## Keputusan & Catatan Akhir

| # | Topik | Keputusan |
|---|---|---|
| 1 | `/venue` Web Komunitas | **Dihapus** dari halaman & folder. Tabel `venues` tetap ada di DB untuk referensi admin (dengan data plus/minus) |
| 2 | `/dashboard/transaksi` Akademi | **Dihapus** dari dashboard member. Data tetap ada, hanya tampil di Admin |
| 3 | Sistem paket | **Lifetime** — tidak ada durasi/expiry. Hapus `duration_days` & `membership_expires_at` |
| 4 | Referral | **Ditambahkan** — kode referral milik admin inti, diinput di checkout, nyambung ke data admin |
| 5 | Timeline/milestones | **Statis** — tidak perlu tabel, cukup hardcode di kode |
| 6 | WA Group | **Disederhanakan** — tanpa kolom `status` (tidak bisa auto-sync dari WhatsApp). Multi-grup per member sudah didukung |
| 7 | Resources video | **YouTube** — `file_type = 'youtube'`, URL berupa link YouTube |
| 8 | `/kolaborasi` & `/media-kit` | **Coming soon** — placeholder halaman |

---

## Kondisi Saat Ini (As-Is)

### Struktur Folder App (Sekarang)

```
front/app/
├── (admin)/
│   └── admin/            ← Hanya: dashboard member, packages, vouchers
├── (auth)/
│   ├── auth/callback/
│   └── login/
├── (member)/
│   ├── checkout/
│   └── onboarding/       ← Multi-step form (AKAN DIHAPUS)
├── (public)/
│   └── dashboard/        ← Dashboard member setelah bayar
├── page.tsx              ← Landing page (kontennya Akademi, seharusnya Komunitas)
└── layout.tsx
```

### Database Supabase (Sekarang)

| Tabel | Rows | RLS | Status |
|---|---|---|---|
| `members` | 1 | ✅ | Perlu refaktor kolom |
| `packages` | 2 | ❌ **BAHAYA** | RLS belum aktif |
| `vouchers` | 1 | ✅ | OK |
| `events` | 0 | ✅ | Perlu +`event_type` |
| `attendances` | 0 | ✅ | Perlu aktifkan RLS policy |
| `landing_sections` | 13 | ✅ | Perlu +kolom `site` |
| `announcements` | 0 | ✅ | **DIHAPUS** |

---

## Proposed Changes

### 1. Middleware & Routing

---

#### [MODIFY] [middleware.ts](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/middleware.ts)

Diganti total. Logika baru:

```typescript
// Pseudocode logika baru:
// 1. Skip static assets (_next, favicon, file ber-ekstensi)
// 2. Deteksi subdomain dari host header
// 3. Jika dari subdomain & akses /login atau /register → redirect ke root domain
// 4. Jika subdomain = 'akademi' → rewrite ke /akademi{pathname}
// 5. Jika subdomain = 'admin'   → rewrite ke /admin-app{pathname}
// 6. Cek session Supabase
// 7. Auth guard per domain (redirect by role & tier)
```

---

### 2. Struktur Folder App — Target

---

```
front/
│
├── middleware.ts                          ← [MODIFY TOTAL]
│
├── app/
│   │
│   │  ── SHARED AUTH ────────────────────────────────────────────
│   ├── login/
│   │   └── page.tsx                       ← [PINDAH] LOGIN CENTER — satu-satunya
│   ├── register/
│   │   └── page.tsx                       ← [NEW] Daftar member gratis
│   └── auth/
│       └── callback/
│           └── route.ts                   ← [PINDAH] Redirect by role & tier
│   │
│   │  ── WEB KOMUNITAS (panggungkreator.web.id) ──────────────────
│   ├── page.tsx                           ← [MODIFY] Ganti jadi landing page komunitas
│   ├── tentang/
│   │   └── page.tsx                       ← [NEW]
│   ├── galeri/
│   │   └── page.tsx                       ← [NEW]
│   ├── kolaborasi/
│   │   └── page.tsx                       ← [NEW] Coming Soon placeholder
│   ├── media-kit/
│   │   └── page.tsx                       ← [NEW] Coming Soon placeholder
│   └── myprofile/
│       └── page.tsx                       ← [NEW] Area member semua tier
│   │
│   │  (catatan: /venue TIDAK ADA sebagai halaman publik)
│   │
│   │  ── WEB AKADEMI (akademi.panggungkreator.web.id) ─────────────
│   ├── akademi/
│   │   ├── page.tsx                       ← [NEW] Landing page Akademi
│   │   ├── checkout/
│   │   │   └── page.tsx                   ← [PINDAH dari (member)/checkout/]
│   │   └── dashboard/
│   │       ├── layout.tsx                 ← [NEW] GUARD: blokir tier = free
│   │       ├── page.tsx                   ← [NEW] Home dashboard
│   │       ├── program/page.tsx           ← [NEW] Program yang diikuti
│   │       ├── jadwal/page.tsx            ← [NEW] Jadwal mentoring
│   │       └── resource/page.tsx          ← [NEW] Materi & file
│   │       (catatan: /dashboard/transaksi TIDAK ADA)
│   │       (catatan: /dashboard/course → [FUTURE])
│   │
│   │  ── ADMIN CMS (admin.panggungkreator.web.id) ─────────────────
│   ├── admin-app/
│   │   ├── layout.tsx                     ← [NEW] GUARD + Sidebar menu berbasis admin_role
│   │   ├── page.tsx                       ← [NEW] Dashboard ringkasan sistem
│   │   ├── data-center/
│   │   │   ├── members/page.tsx           ← [EXPAND dari AdminClient.tsx]
│   │   │   ├── transactions/page.tsx      ← [NEW]
│   │   │   └── attendance/page.tsx        ← [NEW]
│   │   ├── akademi/
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx               ← [PINDAH dari (admin)/packages/]
│   │   │   │   ├── create/page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── voucher/page.tsx           ← [PINDAH dari (admin)/vouchers/]
│   │   │   ├── payment/page.tsx           ← [NEW] Monitor transaksi masuk
│   │   │   ├── mentoring/page.tsx         ← [NEW]
│   │   │   └── resources/page.tsx         ← [NEW]
│   │   ├── komunitas/
│   │   │   ├── acara/
│   │   │   │   ├── page.tsx               ← [NEW]
│   │   │   │   ├── create/page.tsx        ← [NEW]
│   │   │   │   └── [id]/page.tsx          ← [NEW] Detail + rekam kehadiran
│   │   │   ├── venue/page.tsx             ← [NEW] Referensi venue (internal admin)
│   │   │   └── partner/page.tsx           ← [NEW]
│   │   ├── cms/
│   │   │   ├── komunitas/page.tsx         ← [NEW] Edit landing_sections site='komunitas'
│   │   │   ├── akademi/page.tsx           ← [NEW] Edit landing_sections site='akademi'
│   │   │   ├── tim/page.tsx               ← [NEW] CRUD team_members
│   │   │   ├── galeri/page.tsx            ← [NEW] CRUD gallery_items
│   │   │   └── media/page.tsx             ← [NEW] Media Library
│   │   ├── analytics/
│   │   │   ├── funnel/page.tsx            ← [NEW]
│   │   │   ├── revenue/page.tsx           ← [NEW]
│   │   │   └── aktivitas/page.tsx         ← [NEW]
│   │   └── system/
│   │       ├── admins/page.tsx            ← [NEW]
│   │       ├── roles/page.tsx             ← [NEW]
│   │       └── logs/page.tsx              ← [NEW]
│   │
│   └── api/
│       └── upload/
│           └── route.ts                   ← [PERTAHANKAN]
│
├── components/
│   ├── ui/                                ← [PERTAHANKAN] Shared UI
│   ├── editor/                            ← [PERTAHANKAN] Inline CMS editor
│   ├── komunitas/                         ← [NEW]
│   │   ├── HeroSection.tsx
│   │   ├── GaleriPreview.tsx
│   │   └── TestimonialSection.tsx
│   ├── akademi/                           ← [NEW]
│   │   ├── DashboardNav.tsx
│   │   └── ProgramPricing.tsx
│   └── admin/
│       └── Sidebar.tsx                    ← [REORGANISASI] Menu per admin_role
│
└── lib/
    ├── supabase/
    │   ├── client.ts                      ← [PERTAHANKAN]
    │   └── server.ts                      ← [MODIFY] Cookie domain + options
    ├── auth/                              ← [NEW]
    │   ├── getRedirectTarget.ts
    │   └── rbac.ts
    └── animations/                        ← [NEW]
        └── useScrollAnimation.ts
```

---

### 3. Perubahan Database Supabase

---

#### [MODIFY] Tabel `members`

**Hapus:** `status` (duplikat `payment_status`), `temporary_password`, `unique_code` (pindah ke `transactions`)

**Tambah:** `membership_tier`, `admin_role`, `joined_at`, `my_referral_code`, `referred_by_member_id`

```sql
-- ═══════════════════════════════════════════════════════════════
-- STEP 1: Tambah kolom baru
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS membership_tier TEXT NOT NULL DEFAULT 'free'
    CHECK (membership_tier IN ('free', 'regular', 'mvp'));

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS admin_role TEXT DEFAULT NULL
    CHECK (admin_role IN ('super_admin', 'admin_akademi', 'admin_komunitas'));

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT NOW();

-- Setiap user mendapat kode referral unik (untuk admin inti yang aktif share)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS my_referral_code TEXT UNIQUE DEFAULT NULL;

-- FK ke member yang mereferral mereka (admin inti)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS referred_by_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL;

-- ═══════════════════════════════════════════════════════════════
-- STEP 2: Migrasi data existing
-- ═══════════════════════════════════════════════════════════════
UPDATE public.members SET membership_tier = 'regular' WHERE payment_status = 'paid';
UPDATE public.members SET admin_role = 'super_admin' WHERE role = 'admin';
UPDATE public.members SET joined_at = created_at;

-- ═══════════════════════════════════════════════════════════════
-- STEP 3: Hapus kolom tidak terpakai
-- (Jalankan SETELAH memverifikasi tidak ada kode yang pakai ini)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE public.members DROP COLUMN IF EXISTS status;
ALTER TABLE public.members DROP COLUMN IF EXISTS temporary_password;
ALTER TABLE public.members DROP COLUMN IF EXISTS unique_code;
```

**Skema `members` final:**

| Kolom | Tipe | Default | Keterangan |
|---|---|---|---|
| `id` | uuid | — | FK ke `auth.users` |
| `full_name` | text | — | Nama lengkap |
| `stage_name` | text | — | Nama panggung |
| `whatsapp_number` | text | — | Unik |
| `email` | text | null | |
| `instagram_username` | text | — | |
| `tiktok_username` | text | null | |
| `occupation` | text | — | |
| `referral_source` | text | null | Darimana tahu Pangkreas |
| `role` | text | `'member'` | `member` / `admin` |
| `admin_role` | text | null | `super_admin` / `admin_akademi` / `admin_komunitas` |
| `membership_tier` | text | `'free'` | **`free`** / `regular` / `mvp` |
| `package_id` | uuid | null | FK ke `packages` |
| `payment_status` | text | `'pending'` | `pending` / `paid` / `failed` |
| `payment_order_id` | text | null | Order ID payment gateway |
| `used_voucher_code` | varchar | null | Voucher yang dipakai |
| `final_price` | integer | 49000 | Harga akhir dibayar |
| `qr_token` | uuid | auto | Untuk QR absensi |
| `username` | text | null | Unik |
| `my_referral_code` | text | null | Kode referral milik member ini |
| `referred_by_member_id` | uuid | null | FK ke admin yang mereferral |
| `joined_at` | timestamptz | now() | Tanggal jadi member |
| `created_at` | timestamptz | now() | |
| `updated_at` | timestamptz | now() | |

---

#### [MODIFY] Tabel `packages` — Fix RLS + Tambah Kolom

```sql
-- WAJIB: Aktifkan RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read packages"
  ON public.packages FOR SELECT USING (true);

CREATE POLICY "Admin Akademi can manage packages"
  ON public.packages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
      AND admin_role IN ('super_admin', 'admin_akademi')
  ));

-- Tambah kolom tier (mapping ke membership_tier member)
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS tier TEXT NOT NULL DEFAULT 'regular'
    CHECK (tier IN ('regular', 'mvp', 'private'));

-- Tambah is_published
ALTER TABLE public.packages
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- Update data existing
UPDATE public.packages SET tier = 'mvp'    WHERE name ILIKE '%mvp%' OR name ILIKE '%most valuable%';
UPDATE public.packages SET tier = 'regular' WHERE name ILIKE '%regular%';

-- CATATAN: duration_days dan membership_expires_at TIDAK DITAMBAHKAN
-- Sistem paket bersifat lifetime (one-time, tidak ada expiry)
```

---

#### [MODIFY] Tabel `landing_sections` — Tambah Kolom `site`

```sql
-- Tambah kolom site
ALTER TABLE public.landing_sections
  ADD COLUMN IF NOT EXISTS site TEXT NOT NULL DEFAULT 'akademi'
    CHECK (site IN ('komunitas', 'akademi'));

-- Tag semua data existing (13 baris) sebagai konten Akademi
UPDATE public.landing_sections SET site = 'akademi';

-- Ganti unique constraint: (section_type) → (site, section_type)
ALTER TABLE public.landing_sections
  DROP CONSTRAINT IF EXISTS landing_sections_section_type_key;

ALTER TABLE public.landing_sections
  ADD CONSTRAINT landing_sections_site_section_type_key
    UNIQUE (site, section_type);
```

---

#### [MODIFY] Tabel `events` — Tambah `event_type` + RLS

```sql
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS event_type TEXT DEFAULT 'open_mic'
    CHECK (event_type IN ('open_mic', 'sharing_session', 'networking', 'level_up', 'lainnya'));

-- Aktifkan RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage events"
  ON public.events FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [MODIFY] Tabel `attendances` — Aktifkan RLS Policy

```sql
-- RLS sudah aktif, hanya perlu tambah policy
ALTER TABLE public.attendances ENABLE ROW LEVEL SECURITY;

-- Member bisa lihat kehadiran sendiri (untuk /myprofile)
CREATE POLICY "Members can view own attendance"
  ON public.attendances FOR SELECT
  USING (member_id = auth.uid());

-- Admin kelola semua
CREATE POLICY "Admins can manage attendance"
  ON public.attendances FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [MODIFY] Tabel `venues` — Ubah Jadi Internal Admin Reference

Venue **tidak lagi menjadi halaman publik** (`/venue` dihapus). Tabel ini tetap ada sebagai referensi internal admin — mencatat venue mana saja yang pernah/bisa dipakai, lengkap dengan kelebihan dan kekurangan.

```sql
-- Tambah kolom pros/cons untuk data referensi admin
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS pros JSONB DEFAULT '[]'::jsonb;
  -- contoh: ["Parkiran luas", "Sound system bagus", "Harga terjangkau"]

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS cons JSONB DEFAULT '[]'::jsonb;
  -- contoh: ["AC kurang dingin", "Kapasitas terbatas", "Jauh dari stasiun"]

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS last_used_at DATE DEFAULT NULL;
  -- tanggal terakhir dipakai untuk event Panggung Kreator

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS internal_notes TEXT DEFAULT NULL;
  -- catatan internal admin (tidak tampil ke publik)

-- is_published sudah tidak relevan karena tidak ada halaman publik
-- Rename semantically: is_published → is_recommended
ALTER TABLE public.venues RENAME COLUMN is_published TO is_recommended;
-- is_recommended = true → venue yang direkomendasikan untuk acara berikutnya
```

**Tambah RLS:**

```sql
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Tidak ada public policy (venue hanya untuk admin)
CREATE POLICY "Admins can manage venues"
  ON public.venues FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [DELETE] Tabel `announcements`

```sql
DROP TABLE IF EXISTS public.announcements;
```

---

#### [NEW] Tabel `transactions`

Dibutuhkan oleh: Admin > Data Center > Transactions, Admin > Akademi > Payment.
> ⚠️ Tidak lagi muncul di dashboard member (sesuai keputusan poin 2).

```sql
CREATE TABLE IF NOT EXISTS public.transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  package_id      UUID REFERENCES public.packages(id),
  voucher_id      UUID REFERENCES public.vouchers(id),
  referral_code   TEXT DEFAULT NULL,          -- kode referral yang diinput saat checkout
  referred_by_id  UUID REFERENCES public.members(id) ON DELETE SET NULL,  -- admin yang mereferral
  order_id        TEXT UNIQUE NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'paid', 'failed', 'expired', 'refunded')),
  gross_amount    INTEGER NOT NULL,
  final_amount    INTEGER NOT NULL,
  discount_amount INTEGER NOT NULL DEFAULT 0,
  unique_code     INTEGER NOT NULL DEFAULT 0,
  payment_method  TEXT,
  paid_at         TIMESTAMPTZ,
  expired_at      TIMESTAMPTZ,
  metadata        JSONB DEFAULT '{}'::jsonb,  -- callback data dari payment gateway
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Member TIDAK bisa lihat transaksi sendiri di frontend (sesuai keputusan)
-- Hanya admin yang bisa akses
CREATE POLICY "Admins can manage all transactions"
  ON public.transactions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Service role (payment webhook) bisa insert
CREATE POLICY "Service role can insert transactions"
  ON public.transactions FOR INSERT
  WITH CHECK (true);

CREATE INDEX idx_transactions_member_id  ON public.transactions(member_id);
CREATE INDEX idx_transactions_status     ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_referral   ON public.transactions(referred_by_id) WHERE referred_by_id IS NOT NULL;
```

---

#### [NEW] Tabel `referral_codes`

Dibutuhkan oleh: Halaman `/akademi/checkout` (input referral), Admin > System > Admins (kelola kode referral per admin), Admin > Analytics > Revenue (tracking kontribusi per referral).

Konsep: Admin inti memiliki kode referral unik. Saat calon member checkout, mereka bisa input kode ini. Sistem mencatat siapa yang mereferral → bisa dipakai untuk analitik dan reward internal.

```sql
CREATE TABLE IF NOT EXISTS public.referral_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,         -- kode unik, contoh: "RIZAL2026"
  owner_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  description     TEXT,                          -- deskripsi/keterangan kode ini
  is_active       BOOLEAN NOT NULL DEFAULT true,
  usage_count     INTEGER NOT NULL DEFAULT 0,   -- auto-increment saat dipakai
  total_revenue   INTEGER NOT NULL DEFAULT 0,   -- total revenue yang dihasilkan (summary)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Pemilik kode bisa lihat kode miliknya
CREATE POLICY "Owner can view own referral codes"
  ON public.referral_codes FOR SELECT
  USING (owner_member_id = auth.uid());

-- Super Admin bisa kelola semua
CREATE POLICY "Super admin can manage all referral codes"
  ON public.referral_codes FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND admin_role = 'super_admin'
  ));

-- Siapa pun bisa baca kode (untuk validasi di checkout)
CREATE POLICY "Public can validate referral code"
  ON public.referral_codes FOR SELECT
  USING (is_active = true);

CREATE INDEX idx_referral_code       ON public.referral_codes(code);
CREATE INDEX idx_referral_owner      ON public.referral_codes(owner_member_id);
```

**Flow checkout dengan referral:**
1. Calon member input kode referral di checkout form
2. Frontend query `referral_codes` → validasi kode aktif
3. Jika valid → simpan `referred_by_id` di `transactions`
4. Update `members.referred_by_member_id` dan `referral_codes.usage_count`

---

#### [NEW] Tabel `mentoring_sessions`

Dibutuhkan oleh: `/akademi/dashboard/jadwal`, Admin > Akademi > Mentoring.

```sql
CREATE TABLE IF NOT EXISTS public.mentoring_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  mentor_id       UUID REFERENCES public.members(id),
  package_id      UUID REFERENCES public.packages(id),
  session_date    DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  platform        TEXT DEFAULT 'zoom'
                    CHECK (platform IN ('zoom', 'gmeet', 'offline')),
  meeting_link    TEXT,
  location        TEXT,
  status          TEXT NOT NULL DEFAULT 'scheduled'
                    CHECK (status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  session_number  INTEGER DEFAULT 1,      -- sesi ke-berapa
  notes           TEXT,                   -- catatan mentor
  member_notes    TEXT,                   -- catatan dari member
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.mentoring_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view own sessions"
  ON public.mentoring_sessions FOR SELECT
  USING (member_id = auth.uid() OR mentor_id = auth.uid());

CREATE POLICY "Admin Akademi can manage all sessions"
  ON public.mentoring_sessions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
      AND admin_role IN ('super_admin', 'admin_akademi')
  ));

CREATE INDEX idx_mentoring_member ON public.mentoring_sessions(member_id);
CREATE INDEX idx_mentoring_date   ON public.mentoring_sessions(session_date);
```

---

#### [NEW] Tabel `resources`

Dibutuhkan oleh: `/akademi/dashboard/resource`, Admin > Akademi > Resources.

> Video berasal dari **YouTube** (eksternal) — tidak menyimpan file video di storage Supabase. `file_url` untuk YouTube berisi URL video YouTube.

```sql
CREATE TABLE IF NOT EXISTS public.resources (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  description     TEXT,
  file_url        TEXT NOT NULL,           -- URL file/PDF/link atau URL YouTube
  file_type       TEXT NOT NULL
                    CHECK (file_type IN (
                      'pdf',       -- dokumen PDF
                      'youtube',   -- video dari YouTube (file_url = link YouTube)
                      'image',     -- gambar
                      'link',      -- link eksternal
                      'doc'        -- dokumen lain (Word, dll)
                    )),
  file_size_kb    INTEGER DEFAULT NULL,    -- null untuk youtube/link (tidak relevan)
  package_tier    TEXT NOT NULL DEFAULT 'regular'
                    CHECK (package_tier IN ('regular', 'mvp', 'all')),
  category        TEXT
                    CHECK (category IN ('materi', 'referensi', 'template', 'rekaman', 'lainnya')),
  is_published    BOOLEAN DEFAULT FALSE,
  order_index     INTEGER DEFAULT 0,
  uploaded_by     UUID REFERENCES public.members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read resources by tier"
  ON public.resources FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM public.members m
      WHERE m.id = auth.uid()
        AND (
          package_tier = 'all'
          OR (package_tier = 'regular' AND m.membership_tier IN ('regular', 'mvp'))
          OR (package_tier = 'mvp'     AND m.membership_tier = 'mvp')
        )
    )
  );

CREATE POLICY "Admin Akademi can manage resources"
  ON public.resources FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
      AND admin_role IN ('super_admin', 'admin_akademi')
  ));
```

---

#### [NEW] Tabel `partners`

Dibutuhkan oleh: Section Partner di landing page komunitas (logo & nama), `/kolaborasi` coming soon, Admin > Komunitas > Partner.

```sql
CREATE TABLE IF NOT EXISTS public.partners (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  type              TEXT NOT NULL
                      CHECK (type IN ('kafe', 'kampus', 'brand', 'media', 'sponsor', 'lainnya')),
  logo_url          TEXT,
  website_url       TEXT,
  instagram_url     TEXT,
  contact_person    TEXT,
  contact_wa        TEXT,
  description       TEXT,
  partnership_since DATE,
  is_active         BOOLEAN DEFAULT TRUE,
  is_featured       BOOLEAN DEFAULT FALSE,  -- tampil di section landing page
  order_index       INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active partners"
  ON public.partners FOR SELECT USING (is_active = true);

CREATE POLICY "Admin Komunitas can manage partners"
  ON public.partners FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [NEW] Tabel `venues`

> **Catatan:** Venue bukan halaman publik. Ini adalah referensi internal admin untuk mencatat venue yang pernah atau bisa dipakai, lengkap dengan plus/minus-nya.

```sql
CREATE TABLE IF NOT EXISTS public.venues (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL DEFAULT 'Bandung',
  description     TEXT,
  capacity        INTEGER,
  contact_wa      TEXT,
  contact_name    TEXT,
  maps_url        TEXT,
  photo_urls      JSONB DEFAULT '[]'::jsonb,
  amenities       JSONB DEFAULT '[]'::jsonb,   -- ["WiFi", "AC", "Sound System"]
  pros            JSONB DEFAULT '[]'::jsonb,   -- kelebihan venue
  cons            JSONB DEFAULT '[]'::jsonb,   -- kekurangan venue
  last_used_at    DATE DEFAULT NULL,           -- terakhir dipakai event Pangkreas
  internal_notes  TEXT DEFAULT NULL,           -- catatan bebas admin
  is_recommended  BOOLEAN DEFAULT FALSE,       -- layak direkomendasikan untuk event?
  order_index     INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Hanya admin yang bisa akses (bukan publik)
CREATE POLICY "Admins can manage venues"
  ON public.venues FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [NEW] Tabel `team_members`

Dibutuhkan oleh: `/tentang` — Section Struktur Tim, Admin > CMS > Tim.

```sql
CREATE TABLE IF NOT EXISTS public.team_members (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     TEXT NOT NULL,
  role_title    TEXT NOT NULL,   -- "Co-Founder", "Head of Community", dll
  bio           TEXT,
  photo_url     TEXT,
  instagram_url TEXT,
  linkedin_url  TEXT,
  is_founder    BOOLEAN DEFAULT FALSE,
  is_published  BOOLEAN DEFAULT TRUE,
  order_index   INTEGER DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published team members"
  ON public.team_members FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage team members"
  ON public.team_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

> **Catatan:** Timeline/milestones komunitas bersifat **statis** — tidak perlu tabel. Data dicantumkan langsung dalam kode komponen `/tentang`.

---

#### [NEW] Tabel `gallery_items`

Dibutuhkan oleh: `/galeri` Web Komunitas, Section Galeri Preview di landing page komunitas, Admin > CMS > Galeri.

```sql
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT,
  description   TEXT,
  photo_url     TEXT NOT NULL,
  event_id      UUID REFERENCES public.events(id) ON DELETE SET NULL,
  category      TEXT DEFAULT 'kegiatan'
                  CHECK (category IN (
                    'kegiatan', 'open_mic', 'sharing_session',
                    'networking', 'behind_scene', 'lainnya'
                  )),
  taken_at      DATE,
  is_featured   BOOLEAN DEFAULT FALSE,  -- tampil di galeri preview landing page
  is_published  BOOLEAN DEFAULT TRUE,
  order_index   INTEGER DEFAULT 0,
  uploaded_by   UUID REFERENCES public.members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published gallery"
  ON public.gallery_items FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage gallery"
  ON public.gallery_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE INDEX idx_gallery_category ON public.gallery_items(category);
CREATE INDEX idx_gallery_featured  ON public.gallery_items(is_featured) WHERE is_featured = true;
```

---

#### [NEW] Tabel `wa_group_assignments`

Dibutuhkan oleh: `/myprofile` — Info WhatsApp Group (member lihat sudah masuk grup mana), Admin > Data Center > Members (admin assign member ke grup).

Satu member bisa masuk **lebih dari satu grup**. Tidak ada kolom `status` karena tidak bisa di-sync otomatis dari WhatsApp — admin yang manual mencatat.

4 WA Group yang ada:
| `group_key` | Nama Grup | Untuk |
|---|---|---|
| `btb` | KomunitasBeraniTampilBicara | Member free baru (side community/funnel) |
| `general` | Komunitas Panggung Kreator @Bandung | Member umum (lama & baru) |
| `priority` | PanggungKreatorPriority | Member aktif lama (≥2 kelas + ≥3x Open Mic) |
| `membership` | PanggungKreatorMembership | Member yang sudah bayar Rp 49.000 |

```sql
CREATE TABLE IF NOT EXISTS public.wa_group_assignments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id     UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  group_key     TEXT NOT NULL
                  CHECK (group_key IN ('btb', 'general', 'priority', 'membership')),
  group_name    TEXT NOT NULL,       -- nama tampil di UI
  wa_group_link TEXT,                -- invite link (diisi admin)
  assigned_by   UUID REFERENCES public.members(id),
  assigned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes         TEXT,
  UNIQUE (member_id, group_key)      -- satu member, satu entri per jenis grup
);

ALTER TABLE public.wa_group_assignments ENABLE ROW LEVEL SECURITY;

-- Member bisa lihat grup WA mereka sendiri (untuk /myprofile)
CREATE POLICY "Members can view own wa group assignments"
  ON public.wa_group_assignments FOR SELECT
  USING (member_id = auth.uid());

-- Admin bisa kelola semua
CREATE POLICY "Admins can manage wa group assignments"
  ON public.wa_group_assignments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE INDEX idx_wa_member ON public.wa_group_assignments(member_id);
```

---

#### [NEW] Tabel `media_library`

Dibutuhkan oleh: Admin > CMS > Media Library — upload & kelola semua aset gambar yang dipakai di website (logo, banner, foto konten).

```sql
CREATE TABLE IF NOT EXISTS public.media_library (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name     TEXT NOT NULL,
  file_url      TEXT NOT NULL,
  file_type     TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  mime_type     TEXT,
  file_size_kb  INTEGER,
  width         INTEGER,
  height        INTEGER,
  alt_text      TEXT,
  tags          JSONB DEFAULT '[]'::jsonb,
  uploaded_by   UUID REFERENCES public.members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage media library"
  ON public.media_library FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [NEW] Tabel `testimonials`

`landing_sections` menyimpan testimonial sebagai JSONB untuk CMS landing page (sudah ada, dipertahankan). Tabel `testimonials` ini terpisah untuk menampilkan testimoni dengan **foto & nama member nyata** yang terverifikasi.

```sql
CREATE TABLE IF NOT EXISTS public.testimonials (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id        UUID REFERENCES public.members(id) ON DELETE SET NULL,
  display_name     TEXT NOT NULL,
  photo_url        TEXT,
  role_label       TEXT,            -- "Member Regular", "Alumni MVP"
  quote            TEXT NOT NULL,
  result_highlight TEXT,            -- "Dari takut bicara → jadi MC kampus"
  site             TEXT NOT NULL DEFAULT 'komunitas'
                     CHECK (site IN ('komunitas', 'akademi')),
  is_featured      BOOLEAN DEFAULT FALSE,
  is_published     BOOLEAN DEFAULT FALSE,
  order_index      INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read published testimonials"
  ON public.testimonials FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

#### [NEW] Tabel `admin_activity_logs`

Dibutuhkan oleh: Admin > System > Activity Logs.

```sql
CREATE TABLE IF NOT EXISTS public.admin_activity_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID NOT NULL REFERENCES public.members(id),
  action        TEXT NOT NULL,
  module        TEXT,
  target_id     UUID,
  description   TEXT,
  old_data      JSONB,
  new_data      JSONB,
  ip_address    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can read logs"
  ON public.admin_activity_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND admin_role = 'super_admin'
  ));

CREATE POLICY "Admins can insert logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.members
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE INDEX idx_logs_admin_id   ON public.admin_activity_logs(admin_id);
CREATE INDEX idx_logs_created_at ON public.admin_activity_logs(created_at DESC);
```

---

#### [NEW] Database Functions

```sql
-- Fungsi RBAC granular tambahan
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid() AND admin_role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_akademi()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid()
      AND role = 'admin' AND admin_role IN ('super_admin', 'admin_akademi')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_komunitas()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members WHERE id = auth.uid()
      AND role = 'admin' AND admin_role IN ('super_admin', 'admin_komunitas')
  );
$$;

CREATE OR REPLACE FUNCTION public.get_member_tier()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT membership_tier FROM public.members WHERE id = auth.uid();
$$;

-- Fungsi validasi referral code + increment usage
CREATE OR REPLACE FUNCTION public.use_referral_code(p_code TEXT, p_member_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral_id UUID;
  v_owner_id    UUID;
BEGIN
  SELECT id, owner_member_id INTO v_referral_id, v_owner_id
  FROM public.referral_codes
  WHERE code = p_code AND is_active = true;

  IF v_referral_id IS NULL THEN
    RETURN NULL;  -- kode tidak valid
  END IF;

  -- Increment usage count
  UPDATE public.referral_codes
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = v_referral_id;

  -- Set referred_by di member
  UPDATE public.members
  SET referred_by_member_id = v_owner_id
  WHERE id = p_member_id;

  RETURN v_owner_id;  -- return admin_id yang mereferral
END;
$$;
```

---

### 4. Update Cookie Domain Supabase

#### [MODIFY] [server.ts](file:///d:/Community/Pangkreas/Project/panggung-kreator/front/lib/supabase/server.ts)

```typescript
cookieOptions: {
  domain: '.panggungkreator.web.id', // titik di depan = berlaku di 3 subdomain
  sameSite: 'lax',
  secure: true,
  path: '/',
}
```

---

## Pemetaan Tabel Berdasarkan Penggunaan

> Menunjukkan tabel mana dipakai oleh website/domain mana.

| Tabel | Web Komunitas | Web Akademi | Web Admin | Keterangan |
|---|:---:|:---:|:---:|---|
| **`members`** | ✅ | ✅ | ✅ | Dipakai di semua domain — inti sistem |
| **`packages`** | — | ✅ | ✅ | Checkout & CRUD paket |
| **`vouchers`** | — | ✅ | ✅ | Diinput di checkout, dikelola admin |
| **`referral_codes`** | — | ✅ | ✅ | Divalidasi di checkout, dikelola admin |
| **`transactions`** | — | — | ✅ | Hanya tampil di admin (Data Center + Payment) |
| **`landing_sections`** | ✅ | ✅ | ✅ | `site='komunitas'` untuk web komunitas, `site='akademi'` untuk web akademi, dikelola via Admin CMS |
| **`mentoring_sessions`** | — | ✅ | ✅ | Dashboard jadwal member + Admin Akademi |
| **`resources`** | — | ✅ | ✅ | Dashboard resource member + Admin Akademi |
| **`attendances`** | ✅ | — | ✅ | Riwayat aktivitas di `/myprofile` + Admin Komunitas |
| **`events`** | — | — | ✅ | Hanya untuk pencatatan kehadiran oleh admin |
| **`wa_group_assignments`** | ✅ | — | ✅ | Info WA grup di `/myprofile` + Admin assign member |
| **`team_members`** | ✅ | — | ✅ | Halaman `/tentang` + Admin CMS Tim |
| **`gallery_items`** | ✅ | — | ✅ | Halaman `/galeri` + preview landing + Admin CMS Galeri |
| **`testimonials`** | ✅ | ✅ | ✅ | Landing page komunitas & akademi + Admin CMS |
| **`partners`** | ✅ | — | ✅ | Section partner landing komunitas + Admin Komunitas |
| **`venues`** | — | — | ✅ | **Internal admin only** — referensi venue + plus/minus |
| **`media_library`** | — | — | ✅ | Admin CMS Media Library |
| **`admin_activity_logs`** | — | — | ✅ | Admin System Logs (super admin only) |

---

## Ringkasan Semua Perubahan Database

### Tabel Dimodifikasi (6)
| Tabel | Perubahan |
|---|---|
| `members` | +`membership_tier`, +`admin_role`, +`joined_at`, +`my_referral_code`, +`referred_by_member_id` · −`status`, −`temporary_password`, −`unique_code` |
| `packages` | Aktifkan RLS · +`tier`, +`is_published` |
| `landing_sections` | +`site` (`komunitas`/`akademi`) · update unique constraint |
| `events` | +`event_type` · aktifkan RLS |
| `attendances` | Aktifkan RLS policy |
| `venues` | +`pros`, +`cons`, +`last_used_at`, +`internal_notes` · rename `is_published`→`is_recommended` · aktifkan RLS · **tidak ada public policy** |

### Tabel Dihapus (1)
- `announcements`

### Tabel Baru (12)
| # | Tabel | Dipakai Oleh |
|---|---|---|
| 1 | `transactions` | Web Admin |
| 2 | `referral_codes` | Web Akademi + Web Admin |
| 3 | `mentoring_sessions` | Web Akademi + Web Admin |
| 4 | `resources` | Web Akademi + Web Admin |
| 5 | `partners` | Web Komunitas + Web Admin |
| 6 | `venues` | Web Admin (internal) |
| 7 | `team_members` | Web Komunitas + Web Admin |
| 8 | `gallery_items` | Web Komunitas + Web Admin |
| 9 | `wa_group_assignments` | Web Komunitas + Web Admin |
| 10 | `media_library` | Web Admin |
| 11 | `testimonials` | Web Komunitas + Web Akademi + Web Admin |
| 12 | `admin_activity_logs` | Web Admin |

**Total database: 18 tabel aktif** (7 existing + 12 baru − 1 dihapus)

---

## Urutan Pengerjaan

| Fase | Yang Dikerjakan | Priority |
|---|---|---|
| **1** | Migration SQL: refaktor `members`, fix RLS `packages`, update `landing_sections`, hapus `announcements` | 🔴 |
| **2** | Migration SQL: update `events`, `attendances`, `venues` | 🔴 |
| **3** | Migration SQL: buat 12 tabel baru + functions | 🔴 |
| **4** | Rewrite `middleware.ts` — domain routing + auth guard | 🔴 |
| **5** | Update `lib/supabase/server.ts` — cookie domain | 🔴 |
| **6** | Shared Auth: `/login`, `/register`, `/auth/callback` | 🔴 |
| **7** | Reorganisasi folder `app/` — pindah, hapus route groups, buat placeholder | 🟡 |
| **8** | Admin CMS: layout + sidebar RBAC + migrasi halaman lama | 🟡 |
| **9** | `/myprofile` — area member (status tier + info WA grup + riwayat aktivitas) | 🟡 |
| **10** | Halaman publik Web Komunitas: `/`, `/tentang`, `/galeri` | 🟢 |
| **11** | Landing Page Akademi `app/akademi/page.tsx` | 🟢 |
| **12** | Dashboard Akademi: `/dashboard`, `/program`, `/jadwal`, `/resource` | 🟢 |
| **13** | Checkout + referral system + payment gateway | 🟢 |
