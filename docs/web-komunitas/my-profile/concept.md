# Desain Halaman Profil Member — Panggung Kreator

> Dokumen ini berisi hasil audit `MembersClient.tsx`, analisis skema database terkait, dan rancangan detail halaman profil member baru yang mencakup **Absensi Tracker**, **Link Referral**, dan informasi relevan lainnya.

---

## 1. Audit `MembersClient.tsx`

### 1.1 Ringkasan File

| Aspek | Detail |
|---|---|
| **Path** | `front/app/(admin)/admin/members/MembersClient.tsx` |
| **Ukuran** | 747 baris |
| **Tipe** | Client Component (`"use client"`) |
| **Fungsi Utama** | Dashboard admin untuk manajemen data member |

### 1.2 Fitur yang Ada

| # | Fitur | Deskripsi |
|---|---|---|
| 1 | **Stats Summary** | 3 kartu: Total Member, Membership PK, Member Priority |
| 2 | **Search & Filter** | Cari nama/email/WA + filter komunitas & tier |
| 3 | **Tabel Member** | Nama, email, WA, tipe member, tanggal bergabung, aksi |
| 4 | **Detail Modal** | Info personal, kontak, sosmed, status keanggotaan, minat & AI insights |
| 5 | **Edit Status Modal** | Ubah komunitas, tier, catatan perubahan |
| 6 | **Export CSV** | Ekspor data member yang ter-filter ke file CSV |

### 1.3 Temuan & Kelemahan

| # | Temuan | Severity |
|---|---|---|
| 1 | **Tidak ada fitur absensi** — Tabel `attendances` sudah ada di DB tapi tidak terhubung ke `MembersClient` | 🔴 Major Gap |
| 2 | **Tidak ada halaman profil per-member** — Detail hanya berupa modal popup, bukan halaman penuh | 🟡 UX Gap |
| 3 | **Tidak ada referral tracking** — Kolom `referred_by`, `affiliate_code`, `commission_balance` sudah ada di DB tapi tidak ditampilkan di admin | 🟡 Missing Feature |
| 4 | **Tier badge duplikasi** — Logika render tier badge di-repeat 3x di file yang sama (baris 421-452, 684-696) | 🟡 Code Smell |
| 5 | **Data portfolio tidak ditampilkan** — Tabel `portfolio_items` ada tapi admin tidak bisa lihat portfolio member | ⚪ Nice to have |

### 1.4 Halaman Profil yang Sudah Ada

**Existing page: `front/app/(community)/myprofile/page.tsx`** (264 baris)

| Tab | Komponen | Fungsi |
|---|---|---|
| `Edit Profil` | `<ProfileForm>` | Edit bio, sosmed, minat & goals |
| `Kelola Portfolio` | `<PortfolioManager>` | CRUD portfolio items per pilar |
| `Program Affiliate` | Inline | Link referral, tabel teman yang bergabung |

> [!IMPORTANT]
> Halaman `myprofile` **sudah memiliki** tab Edit Profil, Portfolio, dan Affiliate. Halaman profil baru yang akan dirancang adalah **tampilan profil untuk member sendiri** (self-view dashboard) yang meng-integrasikan **Absensi Tracker** sebagai fitur baru dan memperbaiki UX keseluruhan.

---

## 2. Analisis Skema Database

### 2.1 Entity-Relationship Diagram

```mermaid
erDiagram
    MEMBERS ||--o| MEMBER_INTERESTS : has
    MEMBERS ||--o{ PORTFOLIO_ITEMS : owns
    MEMBERS ||--o{ ATTENDANCES : attends
    MEMBERS ||--o{ TRANSACTIONS : makes
    MEMBERS ||--o{ REFERRAL_CODES : owns
    MEMBERS ||--o{ MEMBERS : refers
    EVENTS ||--o{ ATTENDANCES : has
    PACKAGES ||--o{ MEMBERS : subscribed_by
    PACKAGES ||--o{ TRANSACTIONS : purchased_in

    MEMBERS {
        uuid id PK
        text full_name
        text stage_name
        text username UK
        text email
        text whatsapp_number UK
        text instagram_username
        text tiktok_username
        text occupation
        text description
        text city
        text membership_tier
        text community
        text role
        text avatar_url
        text youtube_url
        text linkedin_url
        text portfolio_url
        text affiliate_code
        uuid referred_by FK
        uuid referred_by_member_id FK
        text my_referral_code
        numeric commission_balance
        uuid package_id FK
        text payment_status
        text payment_order_id
        timestamptz profile_completed_at
        boolean subscribed_newsletter
        timestamptz tier_changed_at
        uuid tier_changed_by
        text tier_note
        uuid qr_token UK
        timestamptz created_at
        timestamptz updated_at
    }

    MEMBER_INTERESTS {
        uuid id PK
        uuid member_id FK_UK
        text_arr primary_interests
        text experience_level
        text_arr goals
        text_arr content_topics
        text_arr learning_preference
        text availability
        text referral_source
        text ai_analysis
        timestamptz created_at
        timestamptz updated_at
    }

    PORTFOLIO_ITEMS {
        uuid id PK
        uuid member_id FK
        text pillar
        text item_type
        text title
        text description
        text media_url
        text media_source
        text thumbnail_url
        boolean is_featured
        boolean is_public
        integer view_count
        integer sort_order
        timestamptz created_at
        timestamptz updated_at
    }

    EVENTS {
        uuid id PK
        text title
        text description
        text event_type
        date event_date
        time start_time
        time end_time
        text location
        integer capacity
        boolean is_published
        uuid created_by FK
        timestamptz created_at
        timestamptz updated_at
    }

    ATTENDANCES {
        uuid id PK
        uuid event_id FK
        uuid member_id FK
        boolean is_present
        text scan_method
        timestamptz scanned_at
        timestamptz created_at
    }

    REFERRAL_CODES {
        uuid id PK
        text code UK
        uuid owner_member_id FK
        text description
        boolean is_active
        integer usage_count
        integer total_revenue
        timestamptz created_at
        timestamptz updated_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid member_id FK
        uuid package_id FK
        uuid voucher_id FK
        text referral_code
        uuid referred_by_id FK
        text order_id
        text status
        integer gross_amount
        integer final_amount
        integer discount_amount
        integer unique_code
        text payment_method
        text affiliate_code_used
        numeric commission_earned
        timestamptz paid_at
        timestamptz expired_at
        jsonb metadata
        timestamptz created_at
        timestamptz updated_at
    }
```

### 2.2 Tabel Yang Relevan untuk Profil Member

#### `members` — 35 kolom

Kolom yang relevan untuk halaman profil:

| Kolom | Tipe | Fungsi di Profil |
|---|---|---|
| `full_name` | text | Header nama |
| `stage_name` | text | Header nama panggung |
| `username` | text | Handle (@username) |
| `avatar_url` | text | Foto profil |
| `email` | text | Info kontak |
| `whatsapp_number` | text | Info kontak |
| `instagram_username` | text | Link sosmed |
| `tiktok_username` | text | Link sosmed |
| `youtube_url` | text | Link sosmed |
| `linkedin_url` | text | Link sosmed |
| `portfolio_url` | text | Link website |
| `city` | text | Lokasi |
| `occupation` | text | Pekerjaan |
| `description` | text | Bio / deskripsi |
| `membership_tier` | text | Badge tier (free/priority/membership) |
| `community` | text | Komunitas (PK/BTB) |
| `affiliate_code` | text | Kode affiliate untuk referral link |
| `commission_balance` | numeric | Saldo komisi |
| `qr_token` | uuid | QR code untuk absensi |
| `referred_by` | uuid | Siapa yang merekomendasikan |
| `profile_completed_at` | timestamptz | Progress penyelesaian profil |
| `created_at` | timestamptz | Tanggal bergabung |

#### `attendances` — 7 kolom

| Kolom | Tipe | Fungsi di Profil |
|---|---|---|
| `event_id` | uuid FK→events | Link ke event yang dihadiri |
| `member_id` | uuid FK→members | Filter berdasarkan member |
| `is_present` | boolean | Status kehadiran |
| `scan_method` | text | Metode scan (qr/manual/rsvp_only) |
| `scanned_at` | timestamptz | Waktu scan kehadiran |

#### `events` — 11 kolom

| Kolom | Tipe | Fungsi di Profil |
|---|---|---|
| `title` | text | Nama event yang dihadiri |
| `event_type` | text | Tipe event |
| `event_date` | date | Tanggal event |
| `location` | text | Lokasi event |

#### `referral_codes` — 8 kolom

| Kolom | Tipe | Fungsi di Profil |
|---|---|---|
| `code` | text | Kode referral |
| `owner_member_id` | uuid FK→members | Pemilik kode |
| `usage_count` | integer | Jumlah pemakaian |
| `total_revenue` | integer | Total revenue dari kode ini |
| `is_active` | boolean | Status aktif |

---

## 3. Rancangan Halaman Profil Member Baru

### 3.1 Konsep & Prinsip

| Aspek | Keputusan |
|---|---|
| **Route** | `/myprofile` (rewrite halaman existing) |
| **Layout** | Sidebar kiri (identitas) + Main area (tabs) |
| **Design Language** | Konsisten dengan editorial/monochrome style yang sudah ada |
| **Target User** | Member yang login (self-view) |
| **Auth Guard** | Redirect ke `/login` jika belum auth |

### 3.2 Wireframe Layout

```
┌──────────────────────────────────────────────────────────────────────┐
│  HEADER: Logo + "Workspace [Stage Name]" + [Keluar]                 │
├─────────────────┬────────────────────────────────────────────────────┤
│                 │  ┌──────────────────────────────────────────────┐  │
│   SIDEBAR       │  │ STATS CARDS (4 kartu ringkasan)              │  │
│   ┌──────────┐  │  │ [Tier] [Kehadiran] [Komisi] [Referral]      │  │
│   │  Avatar  │  │  └──────────────────────────────────────────────┘  │
│   └──────────┘  │                                                    │
│   Stage Name    │  ┌────────┬──────────┬───────────┬──────────────┐  │
│   @username     │  │Absensi │ Profil   │ Portfolio │  Affiliate   │  │
│   🏷️ PRIORITY  │  ├────────┴──────────┴───────────┴──────────────┤  │
│   📍 Jakarta    │  │                                              │  │
│   💼 Creator    │  │  [Tab Content Area]                          │  │
│                 │  │                                              │  │
│   ──────────    │  │  • Absensi: Heatmap + Riwayat Event         │  │
│   📱 Sosmed     │  │  • Profil: Edit Form                        │  │
│   📧 Email      │  │  • Portfolio: CRUD Manager                  │  │
│   📞 WhatsApp   │  │  • Affiliate: Link + Teman + Komisi         │  │
│                 │  │                                              │  │
│   ──────────    │  └──────────────────────────────────────────────┘  │
│   🔗 QR Code    │                                                    │
│   Bergabung:    │                                                    │
│   12 Jan 2026   │                                                    │
└─────────────────┴────────────────────────────────────────────────────┘
```

### 3.3 Daftar Komponen

#### A. `ProfileLayout` — Layout Wrapper

| Property | Tipe | Deskripsi |
|---|---|---|
| `member` | `MemberProfile` | Data member yang sedang login |
| `children` | `ReactNode` | Konten tab aktif |

**Tanggung jawab:**
- Render sidebar kiri + area konten kanan
- Responsive: sidebar jadi horizontal card di mobile

---

#### B. `ProfileSidebar` — Sidebar Identitas

| Property | Tipe | Deskripsi |
|---|---|---|
| `member` | `MemberProfile` | Data member |

**Data yang ditampilkan:**
- Avatar (dari `avatar_url`, fallback ke inisial)
- Stage name + full name
- `@username`
- Tier badge (membership_tier)
- Kota (city)
- Pekerjaan (occupation)
- Separator
- Social links (Instagram, TikTok, YouTube, LinkedIn, Portfolio)
- Email & WhatsApp
- Separator
- QR Code (render dari `qr_token`)
- Tanggal bergabung (`created_at`)

**Query yang diperlukan:**
```sql
SELECT id, full_name, stage_name, username, avatar_url, email,
       whatsapp_number, instagram_username, tiktok_username,
       youtube_url, linkedin_url, portfolio_url, city, occupation,
       membership_tier, community, qr_token, created_at
FROM members
WHERE id = :current_user_id
```

---

#### C. `ProfileStatsCards` — Kartu Ringkasan

4 kartu horizontal di atas tab content:

| # | Kartu | Sumber Data | Ikon |
|---|---|---|---|
| 1 | **Membership Tier** | `members.membership_tier` | `Award` |
| 2 | **Total Kehadiran** | `COUNT(attendances WHERE is_present = true)` | `CalendarCheck` |
| 3 | **Saldo Komisi** | `members.commission_balance` | `DollarSign` |
| 4 | **Total Referral** | `COUNT(members WHERE referred_by = :id)` | `Users` |

**Query yang diperlukan:**
```sql
-- Attendance count
SELECT COUNT(*) as total_hadir
FROM attendances
WHERE member_id = :current_user_id AND is_present = true;

-- Referral count
SELECT COUNT(*) as total_referral
FROM members
WHERE referred_by = :current_user_id;
```

---

#### D. `AttendanceTracker` — Tab Absensi ⭐ FITUR BARU

##### D.1 Sub-Komponen: `AttendanceHeatmap`

Kalender heatmap (mirip GitHub contribution graph) yang menunjukkan kehadiran member sepanjang tahun.

| Property | Tipe | Deskripsi |
|---|---|---|
| `attendances` | `AttendanceRecord[]` | Data kehadiran |
| `year` | `number` | Tahun yang ditampilkan |

**Visualisasi:**
- Grid 52 minggu × 7 hari
- Warna: abu-abu (tidak ada event) → hijau muda (hadir) → hijau tua (hadir multiple)
- Merah muda untuk RSVP tapi tidak hadir

##### D.2 Sub-Komponen: `AttendanceStats`

| Metrik | Sumber | Kalkulasi |
|---|---|---|
| Total Event Dihadiri | `attendances` | `COUNT(is_present = true)` |
| Streak Kehadiran | `attendances + events` | Hitung beruntun hadir |
| Rate Kehadiran | `attendances` | `hadir / total_rsvp × 100%` |
| Event Terakhir | `attendances + events` | Event terbaru yang dihadiri |

##### D.3 Sub-Komponen: `AttendanceHistory`

Tabel riwayat kehadiran event:

| Kolom | Sumber |
|---|---|
| Nama Event | `events.title` |
| Tipe | `events.event_type` |
| Tanggal | `events.event_date` |
| Lokasi | `events.location` |
| Status | `attendances.is_present` (Hadir ✅ / Tidak Hadir ❌) |
| Metode | `attendances.scan_method` (QR / Manual) |

**Query yang diperlukan:**
```sql
SELECT
    a.id,
    a.is_present,
    a.scan_method,
    a.scanned_at,
    a.created_at,
    e.title as event_title,
    e.event_type,
    e.event_date,
    e.start_time,
    e.end_time,
    e.location
FROM attendances a
JOIN events e ON a.event_id = e.id
WHERE a.member_id = :current_user_id
ORDER BY e.event_date DESC;
```

---

#### E. `ProfileForm` — Tab Edit Profil (EXISTING)

> Komponen ini sudah ada di `front/components/member/ProfileForm.tsx`. Akan digunakan kembali tanpa modifikasi.

3 sub-tab:
1. Bio & Data Diri
2. Sosial & Portfolio
3. Minat & Goals

---

#### F. `PortfolioManager` — Tab Portfolio (EXISTING)

> Komponen ini sudah ada di `front/components/member/PortfolioManager.tsx`. Akan digunakan kembali tanpa modifikasi.

Fitur: CRUD portfolio items per pilar (Public Speaking, Content Creation, Personal Branding).

---

#### G. `AffiliatePanel` — Tab Program Affiliate (ENHANCED)

Peningkatan dari implementasi inline yang ada di `myprofile/page.tsx`:

##### G.1 Sub-Komponen: `AffiliateLink`

| Property | Tipe | Deskripsi |
|---|---|---|
| `affiliateCode` | `string` | Kode affiliate member |

**Fitur:**
- Tampilkan link referral lengkap
- Tombol copy-to-clipboard
- Share buttons (WhatsApp, Instagram Story)

##### G.2 Sub-Komponen: `AffiliateStats`

| Metrik | Sumber Data |
|---|---|
| Total Teman Diajak | `COUNT(members WHERE referred_by = :id)` |
| Saldo Komisi | `members.commission_balance` |
| Total Revenue Generated | `referral_codes.total_revenue` |
| Kode Referral Aktif | `referral_codes WHERE is_active = true` |

##### G.3 Sub-Komponen: `ReferralTable`

Tabel daftar teman yang bergabung via referral:

| Kolom | Sumber |
|---|---|
| Nama | `members.full_name` (referred member) |
| Email | `members.email` (referred member) |
| Membership | `members.membership_tier` |
| Tanggal Gabung | `members.created_at` |

**Query yang diperlukan:**
```sql
-- Referral friends
SELECT id, full_name, email, membership_tier, created_at
FROM members
WHERE referred_by = :current_user_id
ORDER BY created_at DESC;

-- Referral codes owned
SELECT code, usage_count, total_revenue, is_active, created_at
FROM referral_codes
WHERE owner_member_id = :current_user_id;
```

---

## 4. Struktur File Komponen

```
front/app/(community)/myprofile/
├── page.tsx                          # REWRITE — Server/Client orchestrator
├── components/
│   ├── ProfileLayout.tsx             # NEW — Layout wrapper (sidebar + main)
│   ├── ProfileSidebar.tsx            # NEW — Sidebar identitas member
│   ├── ProfileStatsCards.tsx         # NEW — 4 kartu ringkasan statistik
│   ├── AttendanceTracker.tsx         # NEW — Tab absensi utama
│   ├── AttendanceHeatmap.tsx         # NEW — Heatmap kalender kehadiran
│   ├── AttendanceStats.tsx           # NEW — Statistik kehadiran ringkas
│   ├── AttendanceHistory.tsx         # NEW — Tabel riwayat kehadiran
│   ├── AffiliatePanel.tsx            # NEW — Tab affiliate (dipecah dari inline)
│   ├── AffiliateLink.tsx             # NEW — Link referral + copy
│   ├── AffiliateStats.tsx            # NEW — Statistik affiliate
│   └── ReferralTable.tsx             # NEW — Tabel teman referral
│
front/components/member/
├── ProfileForm.tsx                   # EXISTING — Tetap digunakan
├── PortfolioManager.tsx              # EXISTING — Tetap digunakan
├── ImageUploader.tsx                 # EXISTING — Tetap digunakan
└── VideoLinkInput.tsx                # EXISTING — Tetap digunakan
```

---

## 5. Kebutuhan Data & Skema

### 5.1 Skema yang Sudah Ada (Tidak Perlu Migrasi)

Semua tabel dan kolom yang dibutuhkan **sudah tersedia** di database production:

| Tabel | Kolom Relevan | Status |
|---|---|---|
| `members` | 35 kolom (termasuk `affiliate_code`, `commission_balance`, `qr_token`, `city`, `avatar_url`) | ✅ Ready |
| `member_interests` | 11 kolom | ✅ Ready |
| `portfolio_items` | 15 kolom | ✅ Ready |
| `events` | 11 kolom (termasuk `event_type`) | ✅ Ready |
| `attendances` | 7 kolom | ✅ Ready |
| `referral_codes` | 8 kolom | ✅ Ready |
| `transactions` | 17 kolom (termasuk `affiliate_code_used`, `commission_earned`) | ✅ Ready |

### 5.2 Foreign Key Relationships (Verified from Production DB)

```
attendances.event_id    → events.id
attendances.member_id   → members.id
events.created_by       → members.id
member_interests.member_id → members.id
members.package_id      → packages.id
members.referred_by     → members.id
members.referred_by_member_id → members.id
portfolio_items.member_id → members.id
referral_codes.owner_member_id → members.id
transactions.member_id  → members.id
transactions.package_id → packages.id
transactions.referred_by_id → members.id
transactions.voucher_id → vouchers.id
```

### 5.3 RLS (Row Level Security) Considerations

| Tabel | Policy yang Diperlukan |
|---|---|
| `members` | Member bisa `SELECT` data sendiri (`id = auth.uid()`) |
| `attendances` | Member bisa `SELECT` kehadiran sendiri (`member_id = auth.uid()`) |
| `events` | Member bisa `SELECT` event yang published (`is_published = true`) |
| `referral_codes` | Member bisa `SELECT` kode milik sendiri (`owner_member_id = auth.uid()`) |

> [!NOTE]
> RLS policies untuk `members`, `member_interests`, dan `portfolio_items` sudah diimplementasi sebelumnya. Perlu verifikasi policy untuk `attendances` dan `referral_codes`.

---

## 6. TypeScript Interfaces

```typescript
// Existing — front/lib/types/member.ts
type MembershipTier = 'free' | 'priority' | 'membership';
type Community = 'panggung_kreator' | 'berani_tampil_bicara';

// New interfaces needed
interface AttendanceRecord {
  id: string;
  event_id: string;
  member_id: string;
  is_present: boolean;
  scan_method: 'qr' | 'manual' | 'rsvp_only' | null;
  scanned_at: string | null;
  created_at: string;
  event: {
    title: string;
    event_type: string;
    event_date: string;
    start_time: string;
    end_time: string | null;
    location: string;
  };
}

interface AttendanceStats {
  totalAttended: number;
  totalEvents: number;
  attendanceRate: number;  // percentage
  currentStreak: number;
  longestStreak: number;
  lastEvent: AttendanceRecord | null;
}

interface ReferralCode {
  id: string;
  code: string;
  owner_member_id: string;
  description: string | null;
  is_active: boolean;
  usage_count: number;
  total_revenue: number;
  created_at: string;
}

interface AffiliateData {
  affiliateCode: string | null;
  commissionBalance: number;
  referralCodes: ReferralCode[];
  referredMembers: {
    id: string;
    full_name: string;
    email: string;
    membership_tier: MembershipTier;
    created_at: string;
  }[];
}
```

---

## 7. Data Fetching Strategy

### 7.1 Single Query Approach (Recommended)

Gunakan **satu** `useEffect` fetch awal yang mengambil semua data sekaligus:

```typescript
// page.tsx — Data Fetching
const fetchAllProfileData = async () => {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel fetching
  const [profileRes, attendanceRes, referralRes, referralCodesRes] = await Promise.all([
    // 1. Profile + interests
    supabase
      .from('members')
      .select('*, interests:member_interests(*)')
      .eq('id', user.id)
      .single(),
    
    // 2. Attendance history
    supabase
      .from('attendances')
      .select('*, event:events(title, event_type, event_date, start_time, end_time, location)')
      .eq('member_id', user.id)
      .order('created_at', { ascending: false }),
    
    // 3. Referred members
    supabase
      .from('members')
      .select('id, full_name, email, membership_tier, created_at')
      .eq('referred_by', user.id)
      .order('created_at', { ascending: false }),
    
    // 4. Referral codes
    supabase
      .from('referral_codes')
      .select('*')
      .eq('owner_member_id', user.id),
  ]);
};
```

### 7.2 Lazy Loading per Tab

Untuk performa, hanya load data tab aktif:

| Tab | Data yang Di-fetch | Kapan Di-fetch |
|---|---|---|
| **Absensi** | `attendances + events` | Saat tab aktif (lazy) |
| **Profil** | `members + member_interests` | Selalu (initial) |
| **Portfolio** | `portfolio_items` | Saat tab aktif (lazy, handled by PortfolioManager) |
| **Affiliate** | `referral_codes + referred members` | Saat tab aktif (lazy) |

---

## 8. Prioritas Implementasi

| Fase | Komponen | Effort | Prioritas |
|---|---|---|---|
| **1** | `ProfileLayout` + `ProfileSidebar` | 🟢 Low | P0 — Fondasi |
| **1** | `ProfileStatsCards` | 🟢 Low | P0 — Fondasi |
| **2** | `AttendanceTracker` + `AttendanceHistory` | 🟡 Medium | P0 — Fitur Utama Baru |
| **2** | `AttendanceHeatmap` | 🔴 High | P1 — Visual Enhancement |
| **2** | `AttendanceStats` | 🟢 Low | P1 — Quick Win |
| **3** | `AffiliatePanel` refactor | 🟡 Medium | P1 — Improvement |
| **4** | `page.tsx` rewrite (orchestration) | 🟡 Medium | P0 — Integrasi |

---

## 9. Catatan Tambahan

### 9.1 Tidak Perlu Migrasi Database

> [!TIP]
> Seluruh skema database yang dibutuhkan (tabel `attendances`, `events`, `referral_codes`, kolom `affiliate_code`, `commission_balance`, `qr_token`, dll) **sudah tersedia di production**. Implementasi halaman profil baru hanya membutuhkan kerja frontend.

### 9.2 Komponen Reusable yang Sudah Ada

Komponen berikut dari `front/components/member/` bisa langsung di-reuse:
- `ProfileForm.tsx` — form edit profil (3 sub-tab)
- `PortfolioManager.tsx` — CRUD portfolio
- `ImageUploader.tsx` — upload gambar + compress WebP
- `VideoLinkInput.tsx` — validasi & extract thumbnail video

### 9.3 Dependencies

| Package | Kegunaan | Status |
|---|---|---|
| `lucide-react` | Icons | ✅ Sudah terinstall |
| `sonner` | Toast notifications | ✅ Sudah terinstall |
| `@supabase/supabase-js` | Database client | ✅ Sudah terinstall |
| *(No new dependencies needed)* | — | — |
