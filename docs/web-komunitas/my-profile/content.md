# Content Map — Halaman `/myprofile`

> Dokumen ini merupakan hasil **audit menyeluruh** halaman `/myprofile` berdasarkan `concept.md`, `implementation_plan.md`, skema database Supabase, dan kondisi aktual kode di `front/app/myprofile`. Setiap bagian merinci konten yang ditampilkan, sumber data, status implementasi, dan gap yang masih ada.

---

## Metadata Dokumen

| Aspek | Detail |
|---|---|
| **Route** | `/myprofile` (dan `/myprofile/edit`) |
| **Auth Guard** | ✅ Redirect ke `/login` jika belum autentikasi |
| **Target User** | Member yang sedang login (self-view dashboard) |
| **Layout** | Split-layout 2 kolom: Identitas Kiri (4 col) + Data Kanan (8 col) |
| **Admin Redirect** | ✅ Non-admin yang akses `/admin/*` → redirect ke `/myprofile` (28 halaman admin) |
| **Terakhir Diaudit** | 12 Agustus 2026 |

---

## Struktur File Aktual

```
front/app/myprofile/
├── page.tsx                          ✅ IMPLEMENTED — Orchestrator utama halaman
├── edit/
│   └── page.tsx                      ✅ IMPLEMENTED — Halaman edit profil terpisah
└── components/
    ├── ProfileLayout.tsx             ✅ IMPLEMENTED — Layout 2-kolom split
    ├── ProfileSidebar.tsx            ✅ IMPLEMENTED — Kolom identitas kiri
    ├── ProfileTabs.tsx               ✅ IMPLEMENTED — Tab navigasi kanan
    ├── ProfileOverviewContent.tsx    ✅ IMPLEMENTED — Tab Ikhtisar
    ├── ProfileStatsCards.tsx         ✅ EXISTS (file ada) — ⚠️ BELUM DIINTEGRASIKAN ke halaman
    ├── AttendanceTracker.tsx         ✅ IMPLEMENTED — Tab Absensi Event
    ├── AttendanceStats.tsx           ✅ IMPLEMENTED — Statistik ringkas kehadiran
    ├── AttendanceHistory.tsx         ✅ IMPLEMENTED — Tabel riwayat kehadiran
    └── AffiliatePanel.tsx            ✅ IMPLEMENTED — Tab Program Affiliate (conditional)

front/components/member/
├── ProfileForm.tsx                   ✅ REUSED — via route /myprofile/edit
└── PortfolioManager.tsx              ✅ REUSED — Tab Portfolio Karya
```

**Gap Struktur File vs. Spec:**
- `AttendanceHeatmap.tsx` — ❌ TIDAK DIIMPLEMENTASI (keputusan desain: dihilangkan di v1)
- `AffiliateLink.tsx`, `AffiliateStats.tsx`, `ReferralTable.tsx` — ❌ TIDAK DIIMPLEMENTASI (digabung dalam `AffiliatePanel.tsx`)
- `ProfileStatsCards.tsx` — ⚠️ FILE ADA tapi tidak dipanggil di `page.tsx`

---

## Area 1 — Kolom Kiri: Identitas Member (`ProfileSidebar.tsx`)

### 1.1 Konten yang Ditampilkan

| Elemen | Sumber DB | Kolom | Status |
|---|---|---|---|
| Label "PROFIL MEMBER" | — | — | ✅ |
| Foto profil / Inisial | `members` | `avatar_url` | ✅ |
| Nama Panggung (Serif) | `members` | `stage_name` | ✅ |
| Nama Lengkap | `members` | `full_name` | ✅ |
| Handle `@username` | `members` | `username` | ✅ |
| Badge Tier Keanggotaan | `members` | `membership_tier` | ✅ |
| Kota Domisili | `members` | `city` | ✅ |
| Profesi | `members` | `occupation` | ✅ |
| Bio / Deskripsi | `members` | `description` | ✅ |
| Tombol **"Edit Profil"** | — | Navigasi ke `/myprofile/edit` | ✅ |
| Tombol **"Logout"** | — | Panggil `signout()` | ✅ |
| Tanggal Terdaftar | `members` | `created_at` | ✅ |

### 1.2 Konten TIDAK Ditampilkan (Ada di Spec, Belum Diimplementasi)

| Elemen | Alasan / Catatan |
|---|---|
| Link Instagram | Dihapus saat redesign monokrom; ada di spec `concept.md` §3.3.B |
| Link TikTok | Sama seperti di atas |
| Link YouTube | Sama seperti di atas |
| Link LinkedIn | Sama seperti di atas |
| Link Website/Portfolio | Sama seperti di atas |
| Email kontak | Dihapus dari sidebar saat redesign |
| No. WhatsApp | Dihapus dari sidebar saat redesign |
| QR Code (`qr_token`) | Belum diimplementasi — ada di spec `concept.md` §3.3.B |
| Saldo Komisi (`commission_balance`) | Tidak ada di sidebar; hanya di `ProfileStatsCards` |

### 1.3 Ukuran & Perilaku Foto Profil

- **Ukuran:** `w-48 h-48` (mobile) → `sm:w-56 sm:h-56` → `md:w-64 md:h-64` (max 256px)
- **Fallback inisial:** 2 karakter pertama dari `stage_name` atau `full_name`
- **Efek:** `grayscale` default, `hover:grayscale-0` (warna) saat hover
- **Frame:** Border monokrom, padding dalam 1.5px

---

## Area 2 — Kolom Kanan: Navigasi Tab (`ProfileTabs.tsx`)

### 2.1 Daftar Tab

| Key Tab | Label Ditampilkan | Visibilitas | Status |
|---|---|---|---|
| `overview` | `[ IKHTISAR ]` | ✅ Selalu tampil | ✅ |
| `attendance` | `[ ABSENSI EVENT ]` | ✅ Selalu tampil | ✅ |
| `portfolio` | `[ PORTFOLIO KARYA ]` | ✅ Selalu tampil | ✅ |
| `affiliate` | `[ PROGRAM AFFILIATE ]` | ⚠️ Conditional | ✅ |

**Kondisi visibilitas `affiliate`:**
```typescript
const isAffiliateActive = !!member.affiliate_code || (member.commission_balance || 0) > 0;
```

**Gap vs. Spec (`implementation_plan.md` §2.1):**
- Spec mendefinisikan tab default = `'attendance'`. Implementasi aktual = `'overview'` (berbeda — ada tab Ikhtisar tambahan yang tidak ada di spec awal).
- Spec tidak menyertakan tab "Ikhtisar/Overview" — ini adalah penambahan di redesign.
- Tab "Edit Profil" dipindahkan ke route terpisah `/myprofile/edit` (berbeda dari spec yang memasukkannya sebagai tab).

---

## Area 3 — Tab Ikhtisar (`ProfileOverviewContent.tsx`)

> **Catatan:** Tab ini TIDAK ada di spec `concept.md` maupun `implementation_plan.md`. Ini adalah penambahan baru saat redesign visual pada Agustus 2026.

### 3.1 Konten yang Ditampilkan

#### Section A: Key Highlights

| Item | Konten | Sumber Data |
|---|---|---|
| Highlight 1 | "Telah menghadiri **{N} Event Komunitas**" | `COUNT(attendances WHERE is_present=true)` |
| Highlight 2 | "Status Keanggotaan: **{TIER} TIER**" | `members.membership_tier` |
| Highlight 3 | "Mengajak **{N} Kreator** bergabung di komunitas" | `COUNT(members WHERE referred_by=:uid)` |

Format setiap item: border kiri 2px monokrom + teks semibold + deskripsi kecil.

#### Section B: Pilar & Fokus Keahlian (2×2 Grid)

| Pilar | Konten |
|---|---|
| **PILAR 01** | Public Speaking & MC — "Mengasah kejelasan pesan, intonasi, dan keberanian tampil di depan publik." |
| **PILAR 02** | Content Creation — "Memproduksi konten edukatif, kreatif, dan konsisten di media digital." |
| **PILAR 03** | Personal Branding — "Membangun identitas karya yang kuat dan reputasi profesional yang otentik." |
| **PILAR 04** | Networking & Kolaborasi — "Memperluas jejaring profesional dan berkolaborasi dalam proyek komunitas." |

> ⚠️ **Gap:** Pilar yang ditampilkan adalah **statis/hardcoded** — tidak mengambil dari `member_interests.primary_interests` di database. Seharusnya pilar yang dipilih oleh member saat registrasi yang ditampilkan.

#### Section C: Quote Statement

| Elemen | Konten |
|---|---|
| Quote | *"Membangun keberanian berbicara dan berkarya dari panggung kecil menuju versi terbaik diri."* |
| Atribusi | `— {stage_name}` |

> ⚠️ **Gap:** Quote bersifat **statis/hardcoded** — tidak terhubung ke data member maupun `member_interests.goals`.

---

## Area 4 — Tab Absensi Event (`AttendanceTracker.tsx`)

### 4.1 Data yang Diambil (Lazy — saat tab aktif)

```sql
SELECT
  a.id, a.is_present, a.scan_method, a.scanned_at, a.created_at,
  e.title, e.event_type, e.event_date, e.start_time, e.end_time, e.location
FROM attendances a
JOIN events e ON a.event_id = e.id
WHERE a.member_id = :current_user_id
ORDER BY a.created_at DESC;
```

Tabel Supabase: `attendances` + JOIN `events`

### 4.2 Sub-Komponen: `AttendanceStats` (4 Kartu Statistik)

| Metrik | Kalkulasi | Kolom DB |
|---|---|---|
| **EVENT HADIR** | `COUNT(is_present = true)` | `attendances.is_present` |
| **TOTAL EVENT** | `COUNT(records)` | `attendances` (semua baris) |
| **RATE KEHADIRAN** | `(hadir / total) × 100%` | Kalkulasi frontend |
| **CURRENT STREAK** | Beruntun terakhir hadir berurutan | Kalkulasi frontend |

> ⚠️ **Gap vs. spec:** `implementation_plan.md` §2.3 mendefinisikan kartu "EVENT TERAKHIR" (nama event terakhir dihadiri). Implementasi menggantinya dengan "CURRENT STREAK" — kurang informatif.

### 4.3 Sub-Komponen: `AttendanceHistory` (Tabel Riwayat)

| Kolom Header | Sumber Data | Format |
|---|---|---|
| Nama Event | `events.title` | Teks tebal |
| Tipe Event | `events.event_type` | Badge label (label mapping: `open_mic` → "Open Mic", dsb.) |
| Tanggal | `events.event_date` | Format `dd MMM yyyy` locale id-ID |
| Lokasi | `events.location` | Teks |
| Status Kehadiran | `attendances.is_present` | `HADIR` (teks normal) / `TIDAK HADIR` — menggunakan warna (bukan monokrom murni) |
| Metode Scan | `attendances.scan_method` | Badge: `QR` / `MANUAL` / `AUTOMATIC` |

**Mapping `event_type`:**
```
open_mic          → Open Mic
mc_practice       → MC Practice
voice_over        → Voice Over Challenge
sharing_session   → Sharing Session
networking        → Networking Session
workshop          → Workshop
content_class     → Content Creator Class
branding_class    → Personal Branding Class
```

**Empty state:** `[ BELUM ADA RIWAYAT KEHADIRAN EVENT ]`

---

## Area 5 — Tab Portfolio Karya (`PortfolioManager.tsx`)

> Komponen di-reuse dari `front/components/member/PortfolioManager.tsx`.

### 5.1 Konten yang Ditampilkan

| Fitur | Sumber DB | Tabel |
|---|---|---|
| Filter Tab per Pilar | `portfolio_items.pillar` | `portfolio_items` |
| Grid kartu portofolio | `portfolio_items` (semua kolom) | `portfolio_items` |
| Thumbnail gambar/video | `portfolio_items.thumbnail_url` | — |
| Badge "Featured" | `portfolio_items.is_featured` | — |
| Badge "Private" | `portfolio_items.is_public = false` | — |
| Link eksternal karya | `portfolio_items.media_url` | — |
| Modal tambah/edit item | Form fields semua kolom `portfolio_items` | — |

### 5.2 Pilar yang Tersedia

| Value | Label |
|---|---|
| `public_speaking` | 🎤 Public Speaking |
| `content_creation` | 🎬 Content Creation |
| `personal_branding` | ✨ Personal Branding |

### 5.3 Tipe Karya yang Tersedia

| Value | Label |
|---|---|
| `video` | Video |
| `image` | Gambar |
| `article` | Artikel / Tulisan |
| `link` | Tautan Karya |
| `achievement` | Prestasi / Sertifikasi |

---

## Area 6 — Tab Program Affiliate (`AffiliatePanel.tsx`)

> Tab hanya muncul jika `member.affiliate_code !== null` ATAU `member.commission_balance > 0`.

### 6.1 Konten yang Ditampilkan

| Elemen | Sumber DB | Kolom | Status |
|---|---|---|---|
| Judul & Deskripsi panel | — | Statis | ✅ |
| Kotak Link Affiliate | `members` | `affiliate_code` | ✅ |
| Tombol Copy Link | — | `navigator.clipboard` | ✅ |
| Status kode belum tersedia | `members` | `affiliate_code = null` | ✅ |
| Counter jumlah teman | Dihitung dari `referrals.length` | Passed as prop | ✅ |
| Tabel daftar teman | `members` (referred) | `full_name, email, membership_tier, created_at` | ✅ |

### 6.2 Query Referral Table

```sql
SELECT id, full_name, email, membership_tier, created_at
FROM members
WHERE referred_by = :current_user_id
ORDER BY created_at DESC;
```

### 6.3 Konten TIDAK Ditampilkan (Ada di Spec)

| Elemen | Sumber Spec | Status |
|---|---|---|
| Saldo Komisi (`commission_balance`) | `concept.md` §3.3.G, `implementation_plan.md` §3.1 | ❌ Tidak ditampilkan di panel |
| Total revenue dari referral (`referral_codes.total_revenue`) | `concept.md` §3.3.G | ❌ Tidak ditampilkan |
| Kode referral dari tabel `referral_codes` | `concept.md` §3.3.G | ❌ Tidak diambil (hanya dari `members.affiliate_code`) |
| Tombol Share WhatsApp / Instagram | `concept.md` §3.3.G | ❌ Tidak ada |

---

## Area 7 — Halaman Edit Profil (`/myprofile/edit`)

> Route terpisah — TIDAK ada di spec awal. Ditambahkan saat redesign Agustus 2026 sebagai ganti tab "Edit Profil" yang dihapus dari navigasi tab utama.

### 7.1 Struktur Halaman

| Elemen | Konten |
|---|---|
| Tombol kembali | `← Kembali ke Profil` → navigasi ke `/myprofile` |
| Judul halaman | "Edit Profil Member" (Serif) |
| Subjudul | "Perbarui data diri, foto profil, jejaring sosial, serta minat pilar keahlianmu." |
| Konten utama | Komponen `<ProfileForm member={member} onSave={handleSaveSuccess} />` |

### 7.2 Perilaku setelah Simpan

- Menampilkan toast `"Perubahan profil berhasil disimpan."`
- Navigasi otomatis kembali ke `/myprofile`

### 7.3 Sub-Tab dalam `ProfileForm`

| Sub-Tab | Kolom DB yang Dapat Diedit |
|---|---|
| **01. BIO & DATA DIRI** | `full_name`, `stage_name`, `whatsapp_number`, `city`, `occupation`, `description`, `avatar_url` |
| **02. SOSIAL & PORTFOLIO** | `instagram_username`, `tiktok_username`, `youtube_url`, `linkedin_url`, `portfolio_url` |
| **03. MINAT & GOALS** | `member_interests.primary_interests`, `member_interests.experience_level`, `member_interests.goals`, `member_interests.content_topics`, `member_interests.availability` |

---

## Area 8 — `ProfileStatsCards.tsx` (Ada tapi Tidak Terintegrasi)

> ⚠️ **Status kritis:** File `ProfileStatsCards.tsx` **sudah ada** di direktori `components/` dan memiliki implementasi lengkap, tetapi **tidak dipanggil** dari mana pun di `page.tsx`. Komponen ini "orphan" — tidak terintegrasi ke halaman.

### 8.1 Konten dalam Komponen (Belum Ditampilkan)

| # | Kartu | Sumber Data | Kondisi Tampil |
|---|---|---|---|
| 1 | **MEMBERSHIP TIER** — nilai tier (PRIORITY/FREE/MEMBERSHIP) | `members.membership_tier` | ✅ Selalu |
| 2 | **TOTAL KEHADIRAN** — `{N} Event` | `COUNT(attendances is_present=true)` | ✅ Selalu |
| 3 | **SALDO KOMISI** — `Rp {commission_balance}` | `members.commission_balance` | ⚠️ Conditional (affiliate aktif) |
| 4 | **TEMAN DIAJAK** — `{N} Orang` | `COUNT(members WHERE referred_by=:uid)` | ⚠️ Conditional (affiliate aktif) |

### 8.2 Cara Mengintegrasikan

Tambahkan `ProfileStatsCards` di `page.tsx` dan `ProfileLayout`:

```tsx
// Di page.tsx — setelah member di-fetch:
<ProfileLayout
  tabs={<ProfileTabs ... />}
  sidebar={<ProfileSidebar ... />}
  statsCards={  // Prop baru yang perlu ditambahkan ke ProfileLayout
    <ProfileStatsCards
      membershipTier={member.membership_tier}
      totalAttended={attendanceCount}
      commissionBalance={member.commission_balance || 0}
      totalReferrals={referrals.length}
      isAffiliateActive={isAffiliateActive}
    />
  }
>
```

---

## Ringkasan Audit: Gap & Penyimpangan dari Spec

### Gap Konten (Belum Diimplementasi)

| # | Gap | Severity | Komponen Terdampak | Sumber Spec |
|---|---|---|---|---|
| G1 | `ProfileStatsCards` ada tapi tidak diintegrasikan ke halaman | 🔴 High | `page.tsx`, `ProfileLayout.tsx` | `implementation_plan.md` §1.4 |
| G2 | Pilar & Fokus Keahlian di tab Ikhtisar bersifat statis (hardcoded) | 🟡 Medium | `ProfileOverviewContent.tsx` | `concept.md` §2 (`member_interests.primary_interests`) |
| G3 | Quote Statement bersifat statis (tidak dari data member) | 🟡 Medium | `ProfileOverviewContent.tsx` | — |
| G4 | Saldo komisi tidak ditampilkan di `AffiliatePanel` | 🟡 Medium | `AffiliatePanel.tsx` | `concept.md` §3.3.G, `implementation_plan.md` §3.1 |
| G5 | Tabel `referral_codes` tidak diambil (hanya pakai `members.affiliate_code`) | 🟡 Medium | `AffiliatePanel.tsx` | `concept.md` §3.3.G |
| G6 | Sosmed & kontak tidak tampil di sidebar | 🟡 Medium | `ProfileSidebar.tsx` | `concept.md` §3.3.B, `implementation_plan.md` §1.3 |
| G7 | QR Code (`qr_token`) tidak dirender di sidebar | 🟡 Medium | `ProfileSidebar.tsx` | `concept.md` §3.3.B |
| G8 | Kartu statistik kehadiran tidak menampilkan nama event terakhir | ⚪ Low | `AttendanceStats.tsx` | `implementation_plan.md` §2.3 |
| G9 | Tab default adalah `overview` (bukan `attendance` sesuai spec) | ⚪ Low | `page.tsx` | `implementation_plan.md` §4.1 |
| G10 | Tombol Share WhatsApp / Instagram Story di panel affiliate | ⚪ Low | `AffiliatePanel.tsx` | `concept.md` §3.3.G |

### Penyimpangan Desain (Berbeda dari Spec, Tapi Disengaja)

| # | Penyimpangan | Alasan |
|---|---|---|
| D1 | Tab "Edit Profil" dipindahkan ke route `/myprofile/edit` (bukan tab) | Redesign Agustus 2026 — UX lebih bersih |
| D2 | Tab "Ikhtisar/Overview" ditambahkan (tidak ada di spec) | Redesign Agustus 2026 — landing konten profil |
| D3 | Layout menggunakan `grid lg:grid-cols-12` (bukan `flex` seperti spec) | Redesign — lebih proporsional 4:8 cols |
| D4 | Background sidebar & konten transparan (bukan kartu putih berframe) | Permintaan visual user 12 Agustus 2026 |
| D5 | Foto profil square (bukan rounded/circle) | Gaya monokrom editorial |
| D6 | `AttendanceHeatmap` tidak dibuat | Keputusan desain v1 dari `implementation_plan.md` §Keputusan Desain |

---

## Sinkronisasi Skema Database

### Kolom yang Sudah Dipakai Halaman

| Kolom | Tabel | Dipakai Oleh | Status RLS |
|---|---|---|---|
| `id`, `full_name`, `stage_name`, `username` | `members` | `ProfileSidebar`, `page.tsx` | ✅ |
| `avatar_url` | `members` | `ProfileSidebar` | ✅ |
| `membership_tier` | `members` | `ProfileSidebar`, `ProfileOverviewContent`, `ProfileStatsCards` | ✅ |
| `city`, `occupation`, `description` | `members` | `ProfileSidebar` | ✅ |
| `affiliate_code`, `commission_balance` | `members` | `page.tsx` (guard condition), `AffiliatePanel` | ✅ |
| `created_at` | `members` | `ProfileSidebar` | ✅ |
| `is_present`, `scan_method`, `scanned_at` | `attendances` | `AttendanceTracker`, `AttendanceStats`, `AttendanceHistory` | ⚠️ Perlu verif. |
| `title`, `event_type`, `event_date`, `location` | `events` | `AttendanceHistory` | ⚠️ Perlu verif. |
| `referred_by` | `members` | `page.tsx` (query referral) | ✅ |
| `primary_interests`, `experience_level`, `goals` | `member_interests` | `ProfileForm` (edit saja) | ✅ |
| `pillar`, `item_type`, `title`, `media_url`, `thumbnail_url`, `is_featured`, `is_public` | `portfolio_items` | `PortfolioManager` | ✅ |

### Kolom yang ADA di DB tapi BELUM Dipakai Halaman

| Kolom | Tabel | Potensi Penggunaan |
|---|---|---|
| `qr_token` | `members` | Sidebar — QR Code absensi mandiri |
| `email` | `members` | Sidebar — info kontak |
| `whatsapp_number` | `members` | Sidebar — info kontak |
| `instagram_username`, `tiktok_username`, `youtube_url`, `linkedin_url`, `portfolio_url` | `members` | Sidebar — link sosmed |
| `community` | `members` | Sidebar — badge komunitas (PK/BTB) |
| `code`, `usage_count`, `total_revenue`, `is_active` | `referral_codes` | `AffiliatePanel` — statistik referral kode |
| `commission_balance` | `members` | `AffiliatePanel` — tampilkan saldo |
| `ai_analysis` | `member_interests` | Tab Ikhtisar — insight dari AI |

### RLS Policies yang Perlu Diverifikasi

| Tabel | Policy yang Dibutuhkan | Status |
|---|---|---|
| `attendances` | `SELECT` milik sendiri (`member_id = auth.uid()`) | ⚠️ Perlu verifikasi |
| `events` | `SELECT` semua event published (`is_published = true`) | ⚠️ Perlu verifikasi |
| `referral_codes` | `SELECT` milik sendiri (`owner_member_id = auth.uid()`) | ⚠️ Perlu verifikasi |

---

## Roadmap Penyempurnaan Konten

### Prioritas Tinggi

1. **Integrasikan `ProfileStatsCards`** ke `page.tsx` dan `ProfileLayout.tsx` — sudah ada kodenya, tinggal hubungkan.
2. **Dinamikan Pilar Keahlian** di `ProfileOverviewContent` — ambil dari `member_interests.primary_interests`.
3. **Tampilkan Saldo Komisi** di `AffiliatePanel` — ambil `member.commission_balance`.

### Prioritas Menengah

4. **Tambahkan Sosmed & Kontak** kembali ke `ProfileSidebar` (dengan tampilan minimal, no-icon).
5. **Query `referral_codes`** untuk tampilkan statistik kode referral yang lebih detail.
6. **Verifikasi RLS** pada tabel `attendances` dan `events`.

### Prioritas Rendah / Future

7. **QR Code Sidebar** — render dari `members.qr_token` untuk kehadiran mandiri.
8. **AI Analysis** — tampilkan `member_interests.ai_analysis` di tab Ikhtisar.
9. **Share Buttons Affiliate** — WhatsApp deep link dan Instagram Story.
10. **Event Terakhir** — ganti kartu "Streak" dengan info nama event terakhir dihadiri.
