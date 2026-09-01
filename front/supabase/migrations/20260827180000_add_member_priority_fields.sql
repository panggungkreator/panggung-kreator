-- 1. Hapus kolom sosmed lama yang tidak terpakai di tabel public.members
ALTER TABLE public.members 
  DROP COLUMN IF EXISTS instagram_username,
  DROP COLUMN IF EXISTS tiktok_username,
  DROP COLUMN IF EXISTS youtube_url,
  DROP COLUMN IF EXISTS linkedin_url;

-- 2. Tambah kolom baru di tabel public.members (menggunakan JSONB untuk social_media)
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb;

-- 3. Tambah kolom baru di tabel public.member_interests
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
