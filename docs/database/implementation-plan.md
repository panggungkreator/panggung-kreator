# Database Migration & Sync Implementation Plan
## Dev → Production Supabase

> **Dokumen ini menjelaskan proses migrasi awal dan alur kerja harian untuk menjaga schema database tetap sinkron antara environment development dan production.**

---

## 📋 Ringkasan Project

| | Development (Local) | Production (Server) |
|---|---|---|
| **Project Name** | `panggungkreator-dev` | `panggungkreator's-prod` |
| **Supabase URL** | `https://zpcsqidgedvuaqgrklgp.supabase.co` | `https://wmuzvefmrbgffftkpdnx.supabase.co` |
| **Project Ref** | `zpcsqidgedvuaqgrklgp` | `wmuzvefmrbgffftkpdnx` |
| **Region** | `ap-southeast-1` (Singapore) | `ap-northeast-2` (Seoul) |
| **Status** | ACTIVE_HEALTHY | ACTIVE_HEALTHY |
| **Postgres** | 17.6.1 | 17.6.1 |

---

## 🗄️ Inventaris Schema (Dev)

### Tables (24 tabel, semua dengan RLS enabled)

| Table | Rows (Dev) | Rows (Prod) | Catatan |
|---|---|---|---|
| `members` | 2 | 0 | Data user utama |
| `packages` | 2 | 0 | Paket membership |
| `vouchers` | 1 | 0 | Kode voucher |
| `events` | 1 | 0 | Data event |
| `attendances` | 0 | 0 | Absensi event |
| `landing_sections` | 13 | 0 | Konten landing page |
| `transactions` | 0 | 0 | Transaksi pembayaran |
| `referral_codes` | 0 | 0 | Kode referral |
| `mentoring_sessions` | 0 | 0 | Sesi mentoring |
| `resources` | 1 | 0 | Materi/sumber daya |
| `partners` | 0 | 0 | Data partner |
| `venues` | 0 | 0 | Venue event |
| `team_members` | 0 | 0 | Tim Panggung Kreator |
| `gallery_items` | 0 | 0 | Item galeri |
| `gallery_albums` | 0 | 0 | Album galeri |
| `wa_group_assignments` | 0 | 0 | Penugasan grup WA |
| `media_library` | 0 | 0 | Library media |
| `testimonials` | 0 | 0 | Testimoni |
| `admin_activity_logs` | 0 | 0 | Log aktivitas admin |
| `privilege_groups` | 6 | 0 | ⚠️ BELUM ADA di prod |
| `privilege_items` | 22 | 0 | ⚠️ BELUM ADA di prod |
| `privilege_actions` | 4 | 0 | ⚠️ BELUM ADA di prod |
| `admin_roles` | 2 | 0 | ⚠️ BELUM ADA di prod |
| `admin_role_permissions` | 70 | 0 | ⚠️ BELUM ADA di prod |

### Functions (9 functions)

| Function | Deskripsi |
|---|---|
| `get_email_by_username(p_username)` | Ambil email berdasarkan username |
| `get_member_tier()` | Ambil tier membership user saat ini |
| `has_privilege(user_id, page_slug, action_slug)` | Cek privilege user |
| `is_admin()` | Cek apakah user adalah admin |
| `is_admin_akademi()` | Cek apakah user adalah admin akademi |
| `is_admin_komunitas()` | Cek apakah user adalah admin komunitas |
| `is_super_admin()` | Cek apakah user adalah super admin |
| `update_updated_at_column()` | Trigger auto-update kolom `updated_at` |
| `use_referral_code(p_code, p_member_id)` | Proses penggunaan referral code |

### Gap Analisis (Dev vs Prod)

> ⚠️ **PENTING**: Prod saat ini **TIDAK memiliki** 6 tabel yang ada di dev:
> `privilege_groups`, `privilege_items`, `privilege_actions`, `admin_roles`, `admin_role_permissions`, `gallery_albums`.
> Sistem admin role **belum berfungsi** di prod sampai migrasi dilakukan.

- **Dev** punya **24 tabel** + functions + RLS policies + 1 migration recorded
- **Prod** hanya punya **18 tabel**, semua kosong, **0 migration recorded**

---

## 🏗️ Arsitektur Alur Kerja (Pull → Push)

```
[Dev DB - zpcsqidgedvuaqgrklgp]
        │
        │  supabase db pull
        ▼
[front/supabase/migrations/*.sql]  ← File migrasi baru di-generate
        │
        │  git add + git commit + git push
        ▼
[GitHub Repository]
        │
        │  supabase db push --project-ref wmuzvefmrbgffftkpdnx
        ▼
[Prod DB - wmuzvefmrbgffftkpdnx]
```

---

## 🚀 Fase 1: Migrasi Awal (One-Time Setup)

### Step 1.1 — Install Supabase CLI

```bash
# Masuk ke folder front
cd front

# Install sebagai dev dependency
npm install supabase --save-dev

# Verifikasi
npx supabase --version
```

### Step 1.2 — Login & Link ke Dev

```bash
# Login ke Supabase (akan buka browser untuk autentikasi)
npx supabase login

# Link project ke Dev (sebagai sumber kebenaran)
npx supabase link --project-ref zpcsqidgedvuaqgrklgp
```

### Step 1.3 — Review File Migration yang Ada

File migration sudah ada di `supabase/migrations/20260705002746_remote_schema.sql` (54KB).
File ini sudah berisi full schema dev. **Tidak perlu pull ulang untuk migrasi awal.**

```bash
# Verifikasi isi migration
cat supabase/migrations/20260705002746_remote_schema.sql | head -50
```

### Step 1.4 — Push Schema ke Production

```bash
# Push semua migration ke production
npx supabase db push --project-ref wmuzvefmrbgffftkpdnx
```

> ⚠️ **PERHATIAN**: Perintah ini akan menjalankan semua SQL di `supabase/migrations/` ke database prod.
> Karena prod masih kosong, ini aman dilakukan.

### Step 1.5 — Verifikasi Migration Berhasil

```bash
# Cek status migration di prod
npx supabase migration list --project-ref wmuzvefmrbgffftkpdnx
```

Atau via dashboard:
- [Supabase Prod Tables](https://supabase.com/dashboard/project/wmuzvefmrbgffftkpdnx/database/tables)
- Pastikan **24 tabel** sudah ada
- Pastikan **semua functions** ada di Database > Functions
- Pastikan **RLS enabled** di semua tabel

### Step 1.6 — Seed Data Konfigurasi ke Production

Data ini perlu di-insert manual ke prod (data konfigurasi, bukan data user):

**Export dari Dev** via SQL Editor Supabase Dev:

```sql
-- Export privilege_actions
SELECT 'INSERT INTO privilege_actions (id, name, slug, sort_order, created_at) VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
  quote_literal(slug) || ', ' || sort_order || ', ' || quote_literal(created_at::text) || ');'
FROM privilege_actions ORDER BY sort_order;

-- Export privilege_groups
SELECT 'INSERT INTO privilege_groups (id, name, slug, icon, sort_order, status, created_at) VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
  quote_literal(slug) || ', ' || quote_literal(icon) || ', ' ||
  sort_order || ', ' || quote_literal(status) || ', ' || quote_literal(created_at::text) || ');'
FROM privilege_groups ORDER BY sort_order;

-- Export privilege_items
SELECT 'INSERT INTO privilege_items (id, group_id, name, href, icon_name, slug, sort_order, status, available_actions, created_at) VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(group_id) || ', ' || 
  quote_literal(name) || ', ' || quote_literal(href) || ', ' ||
  quote_literal(icon_name) || ', ' || quote_literal(slug) || ', ' ||
  sort_order || ', ' || quote_literal(status) || ', ' || 
  quote_literal(available_actions::text) || ', ' || quote_literal(created_at::text) || ');'
FROM privilege_items ORDER BY sort_order;

-- Export packages
SELECT 'INSERT INTO packages (id, name, subtitle, price, original_price, is_highlighted, benefits, cta_text, order_index, is_default, tier, is_published) VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(name) || ', ' || 
  COALESCE(quote_literal(subtitle), 'NULL') || ', ' || quote_literal(price) || ', ' ||
  COALESCE(quote_literal(original_price), 'NULL') || ', ' || is_highlighted || ', ' ||
  quote_literal(benefits::text) || ', ' || quote_literal(cta_text) || ', ' ||
  order_index || ', ' || is_default || ', ' || quote_literal(tier) || ', ' || is_published || ');'
FROM packages ORDER BY order_index;

-- Export landing_sections
SELECT 'INSERT INTO landing_sections (id, section_type, site, content, is_visible, section_order) VALUES (' ||
  quote_literal(id) || ', ' || quote_literal(section_type) || ', ' || 
  quote_literal(site) || ', ' || quote_literal(content::text) || ', ' ||
  is_visible || ', ' || section_order || ');'
FROM landing_sections ORDER BY section_order;
```

**Insert hasil export ke Prod** via SQL Editor Supabase Prod.

---

## 🔄 Fase 2: Alur Kerja Harian

### Skenario A — Ada Perubahan Schema di Dev

Ketika mengubah schema di Dev (tambah tabel, kolom, function, RLS policy):

```bash
# 1. Pull perubahan terbaru dari Dev → generate file migration baru
npx supabase db pull

# 2. Review file migration baru
git status
# Output: supabase/migrations/[timestamp]_[auto-name].sql (untracked)

# 3. Rename migration file agar deskriptif (opsional)
# mv supabase/migrations/[timestamp]_remote_schema.sql supabase/migrations/[timestamp]_add_kolom_baru.sql

# 4. Commit dan push ke Git
git add supabase/migrations/
git commit -m "feat(db): [deskripsi perubahan]"
git push origin main

# 5. Push ke Production
npx supabase db push --project-ref wmuzvefmrbgffftkpdnx
```

### Skenario B — Membuat Migration Manual

Untuk perubahan schema yang tidak bisa di-pull otomatis:

```bash
# Buat file migration baru
npx supabase migration new nama_fitur

# Edit file SQL yang dibuat
# supabase/migrations/[timestamp]_nama_fitur.sql

# Push ke prod
npx supabase db push --project-ref wmuzvefmrbgffftkpdnx
```

### Skenario C — Cek Perbedaan Schema

```bash
# Lihat diff antara migration lokal vs schema di prod
npx supabase db diff --project-ref wmuzvefmrbgffftkpdnx

# Lihat status semua migration di prod
npx supabase migration list --project-ref wmuzvefmrbgffftkpdnx
```

---

## ⚙️ Konfigurasi Environment

### File `.env` untuk Development

```env
NEXT_PUBLIC_SUPABASE_URL=https://zpcsqidgedvuaqgrklgp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key dev]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=[service role key dev]
# ... variabel lain
```

### File `.env` untuk Production

```env
NEXT_PUBLIC_SUPABASE_URL=https://wmuzvefmrbgffftkpdnx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon key prod - ambil dari dashboard prod]
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=[service role key prod - ambil dari dashboard prod]
# ... variabel lain sama dengan dev
```

> ⚠️ **KEAMANAN**: Jangan pernah commit `.env` ke Git. Pastikan ada di `.gitignore`.

### Mendapatkan Keys Prod

1. Buka [Supabase Prod Dashboard](https://supabase.com/dashboard/project/wmuzvefmrbgffftkpdnx/settings/api)
2. Salin **Project URL**, **anon key**, dan **service_role key**
3. Simpan di file `.env` lokal

---

## 📁 Struktur File Supabase

```
front/
├── supabase/
│   ├── config.toml              # Konfigurasi Supabase CLI (project_id = "front")
│   ├── migrations/
│   │   ├── 20260705002746_remote_schema.sql  # ✅ Schema awal (sudah ada)
│   │   └── [timestamp]_[nama].sql            # Migration baru (di masa depan)
│   └── .gitignore
├── .env                         # ⚠️ JANGAN DI-COMMIT (ada di .gitignore)
└── .env.backup                  # Template referensi
```

---

## ✅ Checklist Migrasi Awal

### Setup
- [ ] `npm install supabase --save-dev` — install Supabase CLI
- [ ] `npx supabase login` — login ke akun Supabase
- [ ] `npx supabase link --project-ref zpcsqidgedvuaqgrklgp` — link ke Dev

### Migration Schema
- [ ] `npx supabase db push --project-ref wmuzvefmrbgffftkpdnx` — push schema ke Prod
- [ ] Verifikasi 24 tabel ada di Prod (via dashboard atau `migration list`)
- [ ] Verifikasi 9 functions ada di Prod
- [ ] Verifikasi RLS enabled di semua tabel
- [ ] Verifikasi triggers `update_updated_at_column` terpasang

### Seed Data
- [ ] Export & insert `privilege_actions` (4 rows) ke Prod
- [ ] Export & insert `privilege_groups` (6 rows) ke Prod
- [ ] Export & insert `privilege_items` (22 rows) ke Prod
- [ ] Export & insert `packages` (2 rows) ke Prod
- [ ] Export & insert `landing_sections` (13 rows) ke Prod
- [ ] Export & insert `vouchers` (1 row) ke Prod — opsional

### Konfigurasi App
- [ ] Update `.env` production dengan keys dari Prod
- [ ] Test autentikasi di Prod
- [ ] Test fitur admin panel di Prod

---

## 🆘 Troubleshooting

### Error: "Migration already applied"

```bash
# Lihat status migration
npx supabase migration list --project-ref wmuzvefmrbgffftkpdnx

# Tandai migration sebagai sudah diapply
npx supabase migration repair --status applied 20260705002746 --project-ref wmuzvefmrbgffftkpdnx
```

### Error: "Schema mismatch"

```bash
# Lihat perbedaan schema
npx supabase db diff --project-ref wmuzvefmrbgffftkpdnx
```

### Error: "supabase not recognized"

```bash
# Gunakan npx
npx supabase --version

# Atau install global
npm install -g supabase
```

### Error: "Not linked to any project"

```bash
npx supabase link --project-ref zpcsqidgedvuaqgrklgp
```

---

## 📚 Referensi

- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase Migration Guide](https://supabase.com/docs/guides/local-development/overview)
- [Dev Dashboard - Tables](https://supabase.com/dashboard/project/zpcsqidgedvuaqgrklgp/database/tables)
- [Prod Dashboard - Tables](https://supabase.com/dashboard/project/wmuzvefmrbgffftkpdnx/database/tables)
- [Prod Dashboard - API Keys](https://supabase.com/dashboard/project/wmuzvefmrbgffftkpdnx/settings/api)
