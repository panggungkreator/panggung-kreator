# Panduan & Referensi Migrasi Production Database Supabase

Dokumen ini mencatat seluruh perubahan struktur database (*schema migration*) yang telah diterapkan di lingkungan **Development** (`zpcsqidgedvuaqgrklgp`) dan **Production** (`wmuzvefmrbgffftkpdnx`).

---

## 📋 Informasi Supabase Project

| Environment | Project Ref ID | Database Host | Status Migrasi |
| --- | --- | --- | --- |
| **Development** | `zpcsqidgedvuaqgrklgp` | `zpcsqidgedvuaqgrklgp.supabase.co` | ✅ Terpasang & Teruji |
| **Production** | `wmuzvefmrbgffftkpdnx` | `wmuzvefmrbgffftkpdnx.supabase.co` | ✅ Terpasang & Identik (1 Sep 2026) |

---

## 📄 Migration 1: `20260827180000_add_member_priority_fields.sql`

```sql
-- 1. Hapus kolom sosmed lama yang tidak terpakai dari tabel public.members
ALTER TABLE public.members 
  DROP COLUMN IF EXISTS instagram_username,
  DROP COLUMN IF EXISTS tiktok_username,
  DROP COLUMN IF EXISTS youtube_url,
  DROP COLUMN IF EXISTS linkedin_url;

-- 2. Tambahkan kolom baru di tabel public.members
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- 3. Tambahkan kolom awal di tabel public.member_interests
ALTER TABLE public.member_interests
  ADD COLUMN IF NOT EXISTS skills_to_master TEXT,
  ADD COLUMN IF NOT EXISTS monetization_interest TEXT,
  ADD COLUMN IF NOT EXISTS active_communities TEXT,
  ADD COLUMN IF NOT EXISTS career_obstacle TEXT;

-- 4. Perbarui handle_new_user trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.members (
    id, full_name, stage_name, whatsapp_number, email, username,
    occupation, community, membership_tier, payment_status, role, social_media
  ) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru'),
    coalesce(new.raw_user_meta_data->>'stage_name', coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru')),
    coalesce(new.raw_user_meta_data->>'whatsapp_number', '-'),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'Lainnya', 'panggung_kreator', 'free', 'pending', 'member', '{}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
```

---

## 📄 Migration 2: `20260828090000_optimize_member_interests_ai.sql`

```sql
-- 1. Drop kolom yang tidak terpakai oleh form maupun UI
ALTER TABLE public.member_interests
  DROP COLUMN IF EXISTS referral_source;

-- 2. Tambah 7 kolom baru dari form priority
ALTER TABLE public.member_interests
  ADD COLUMN IF NOT EXISTS ps_challenges    TEXT[]   DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS confidence_scale SMALLINT,
  ADD COLUMN IF NOT EXISTS nervous_trigger  TEXT,
  ADD COLUMN IF NOT EXISTS role_model       TEXT,
  ADD COLUMN IF NOT EXISTS target_audience  TEXT,
  ADD COLUMN IF NOT EXISTS expert_desire    TEXT,
  ADD COLUMN IF NOT EXISTS time_commitment  TEXT;

-- 3. Ubah ai_analysis dari TEXT ke JSONB
ALTER TABLE public.member_interests
  ALTER COLUMN ai_analysis TYPE JSONB
  USING CASE
    WHEN ai_analysis IS NULL OR ai_analysis::text = '' THEN NULL
    ELSE jsonb_build_object('legacy', ai_analysis::text)
  END;

NOTIFY pgrst, 'reload schema';
```

---

## 📄 Migration 3: `20260901150000_sync_prod_schema.sql` (Audit & Sync 1 Sep 2026)

```sql
-- 1. Penyesuaian Kolom Tabel public.members (Tanpa DROP kolom lama agar data aman)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- 2. Penyesuaian Kolom Tabel public.member_interests
ALTER TABLE public.member_interests
  ADD COLUMN IF NOT EXISTS skills_to_master TEXT,
  ADD COLUMN IF NOT EXISTS monetization_interest TEXT,
  ADD COLUMN IF NOT EXISTS active_communities TEXT,
  ADD COLUMN IF NOT EXISTS career_obstacle TEXT;

-- 3. Penyesuaian Kolom Tabel public.venues
ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS city TEXT NOT NULL DEFAULT 'Bandung'::text;

-- 4. Pembaruan Trigger Function handle_new_user()
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.members (
    id, full_name, stage_name, whatsapp_number, email, username,
    occupation, community, membership_tier, payment_status, role, social_media
  ) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru'),
    coalesce(new.raw_user_meta_data->>'stage_name', coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru')),
    coalesce(new.raw_user_meta_data->>'whatsapp_number', '-'),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'Lainnya', 'panggung_kreator', 'free', 'pending', 'member', '{}'::jsonb
  ) ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Inisialisasi Pengaturan Default di public.system_settings
INSERT INTO public.system_settings (key, value) VALUES
  ('referral_reward_mode',        'flat'),
  ('referral_reward_flat_amount', '10000'),
  ('referral_reward_percentage',  '10'),
  ('tab_attendance_enabled',      'true'),
  ('tab_portfolio_enabled',       'true'),
  ('tab_affiliate_enabled',       'true')
ON CONFLICT (key) DO NOTHING;

-- 6. Penyesuaian RLS Policies (admin_role_permissions, admin_roles, privilege_actions)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_role_permissions' AND policyname = 'Allow read for authenticated users') THEN
    CREATE POLICY "Allow read for authenticated users" ON public.admin_role_permissions FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_role_permissions' AND policyname = 'Allow manage for admin users') THEN
    CREATE POLICY "Allow manage for admin users" ON public.admin_role_permissions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_roles' AND policyname = 'Allow read for authenticated users') THEN
    CREATE POLICY "Allow read for authenticated users" ON public.admin_roles FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'admin_roles' AND policyname = 'Allow manage for admin users') THEN
    CREATE POLICY "Allow manage for admin users" ON public.admin_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privilege_actions' AND policyname = 'Allow read for authenticated users') THEN
    CREATE POLICY "Allow read for authenticated users" ON public.privilege_actions FOR SELECT TO authenticated USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'privilege_actions' AND policyname = 'Allow write for authenticated users') THEN
    CREATE POLICY "Allow write for authenticated users" ON public.privilege_actions FOR ALL TO authenticated USING (true) WITH CHECK (true);
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
```
