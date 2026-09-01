# Panduan & Referensi Migrasi Production Database Supabase

Dokumen ini mencatat seluruh perubahan struktur database (*schema migration*) yang telah diterapkan di lingkungan **Development** (`zpcsqidgedvuaqgrklgp`), sebagai referensi resmi ketika database **Production** (`wmuzvefmrbgffftkpdnx`) siap diperbarui/dimigrasikan nanti.

---

## 📋 Informasi Supabase Project

| Environment | Project Ref ID | Database Host | Status Migrasi |
|---|---|---|---|
| **Development** | `zpcsqidgedvuaqgrklgp` | `zpcsqidgedvuaqgrklgp.supabase.co` | ✅ Terpasang & Teruji |
| **Production** | `wmuzvefmrbgffftkpdnx` | `wmuzvefmrbgffftkpdnx.supabase.co` | ⏳ Menunggu Stabil (Belum Diubah) |

---

## 📄 File Migration

Perubahan schema disimpan secara permanen di repository dalam file migrasi resmi:
- **Lokasi File:** `front/supabase/migrations/20260827180000_add_member_priority_fields.sql`

---

## 🗄️ Rincian Perubahan Schema SQL

```sql
-- ============================================================================
-- REFERENSI MIGRASI DATABASE: Member Priority & Field Updates
-- Project Target: wmuzvefmrbgffftkpdnx (Production)
-- ============================================================================

-- 1. Hapus kolom sosmed lama yang tidak terpakai dari tabel public.members
ALTER TABLE public.members 
  DROP COLUMN IF EXISTS instagram_username,
  DROP COLUMN IF EXISTS tiktok_username,
  DROP COLUMN IF EXISTS youtube_url,
  DROP COLUMN IF EXISTS linkedin_url;

-- 2. Tambahkan kolom baru di tabel public.members (menggunakan JSONB untuk social_media)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- 3. Tambahkan kolom baru di tabel public.member_interests
ALTER TABLE public.member_interests
  ADD COLUMN IF NOT EXISTS skills_to_master TEXT,
  ADD COLUMN IF NOT EXISTS monetization_interest TEXT,
  ADD COLUMN IF NOT EXISTS active_communities TEXT,
  ADD COLUMN IF NOT EXISTS career_obstacle TEXT;

-- 4. Perbarui function handle_new_user auth trigger agar kompatibel dengan schema baru
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.members (
    id,
    full_name,
    stage_name,
    whatsapp_number,
    email,
    username,
    occupation,
    community,
    membership_tier,
    payment_status,
    role,
    social_media
  ) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru'),
    coalesce(new.raw_user_meta_data->>'stage_name', coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru')),
    coalesce(new.raw_user_meta_data->>'whatsapp_number', '-'),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'Lainnya',
    'panggung_kreator',
    'free',
    'pending',
    'member',
    '{}'::jsonb
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Reload PostgREST Schema Cache setelah penerapan migrasi
NOTIFY pgrst, 'reload schema';
```

---

## 🚀 Cara Menjalankan Migrasi ke Production (Nanti saat Sudah Stabil)

### Opsi 1: Menggunakan Supabase CLI (Direkomendasikan)

Buka terminal di folder `front/` dan jalankan perintah:

```bash
# Push seluruh file migrasi lokal ke Production
npx supabase db push --project-ref wmuzvefmrbgffftkpdnx
```

---

### Opsi 2: Menggunakan Supabase SQL Editor

1. Buka [Dashboard Supabase Production - SQL Editor](https://supabase.com/dashboard/project/wmuzvefmrbgffftkpdnx/sql/new)
2. Copy-Paste seluruh skrip SQL dari **Rincian Perubahan Schema SQL** di atas.
3. Klik tombol **Run**.
