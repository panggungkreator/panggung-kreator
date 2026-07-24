-- ============================================================
-- FASE 1: Migration — Member Profile, Interests, Portfolio & Affiliate
-- File: supabase/migrations/20260721132703_add_member_profile_portfolio.sql
-- ============================================================

-- ----------------------------------------------------------
-- 1A. ALTER TABLE members — tambah kolom baru
-- ----------------------------------------------------------
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS city                   text,
  ADD COLUMN IF NOT EXISTS youtube_url            text,
  ADD COLUMN IF NOT EXISTS linkedin_url           text,
  ADD COLUMN IF NOT EXISTS portfolio_url          text,
  ADD COLUMN IF NOT EXISTS avatar_url             text,
  ADD COLUMN IF NOT EXISTS tier_changed_at        timestamptz,
  ADD COLUMN IF NOT EXISTS tier_changed_by        uuid REFERENCES public.members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS tier_note              text,
  ADD COLUMN IF NOT EXISTS subscribed_newsletter  boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS newsletter_subscribed_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS profile_completed_at   timestamptz,
  ADD COLUMN IF NOT EXISTS affiliate_code         text UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by            uuid REFERENCES public.members(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS commission_balance     numeric NOT NULL DEFAULT 0;

-- Tambahkan kolom community & membership_tier jika belum ada
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS community text NOT NULL DEFAULT 'panggung_kreator'
    CHECK (community IN ('panggung_kreator', 'berani_tampil_bicara')),
  ADD COLUMN IF NOT EXISTS membership_tier text NOT NULL DEFAULT 'free'
    CHECK (membership_tier IN ('free', 'priority', 'membership'));

-- ----------------------------------------------------------
-- 1B. ALTER TABLE transactions — tambah kolom baru (affiliate)
-- ----------------------------------------------------------
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS affiliate_code_used text,
  ADD COLUMN IF NOT EXISTS commission_earned numeric NOT NULL DEFAULT 0;

-- ----------------------------------------------------------
-- 1C. CREATE TABLE member_interests
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_interests (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id           uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  primary_interests   text[] NOT NULL DEFAULT '{}',
  experience_level    text CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  goals               text[] NOT NULL DEFAULT '{}',
  content_topics      text[] NOT NULL DEFAULT '{}',
  availability        text CHECK (availability IN ('morning', 'afternoon', 'evening', 'night', 'flexible')),
  learning_preference text[] NOT NULL DEFAULT '{}',
  referral_source     text,
  ai_analysis         text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT member_interests_member_id_unique UNIQUE (member_id)
);

-- Trigger updated_at otomatis
CREATE TRIGGER member_interests_updated_at
  BEFORE UPDATE ON public.member_interests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------
-- 1D. CREATE TABLE portfolio_items
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  pillar          text NOT NULL CHECK (pillar IN ('public_speaking', 'content_creation', 'personal_branding')),
  item_type       text NOT NULL CHECK (item_type IN ('video', 'image', 'article', 'link', 'achievement')),
  title           text NOT NULL,
  description     text,
  media_url       text,
  media_source    text NOT NULL CHECK (media_source IN ('youtube', 'instagram', 'tiktok', 'storage', 'external')),
  thumbnail_url   text,
  is_featured     boolean NOT NULL DEFAULT false,
  is_public       boolean NOT NULL DEFAULT true,
  view_count      integer NOT NULL DEFAULT 0,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index untuk query profil publik
CREATE INDEX IF NOT EXISTS portfolio_items_member_id_idx ON public.portfolio_items (member_id);
CREATE INDEX IF NOT EXISTS portfolio_items_pillar_idx ON public.portfolio_items (pillar);
CREATE INDEX IF NOT EXISTS portfolio_items_featured_idx ON public.portfolio_items (member_id, is_featured) WHERE is_featured = true;

-- Trigger updated_at otomatis
CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ----------------------------------------------------------
-- 1E. RLS — member_interests
-- ----------------------------------------------------------
ALTER TABLE public.member_interests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Member read own interests"
  ON public.member_interests FOR SELECT
  USING (auth.uid() = member_id);

CREATE POLICY "Member upsert own interests"
  ON public.member_interests FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admin read all interests"
  ON public.member_interests FOR SELECT
  USING (public.is_admin());

-- ----------------------------------------------------------
-- 1F. RLS — portfolio_items
-- ----------------------------------------------------------
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read portfolio"
  ON public.portfolio_items FOR SELECT
  USING (is_public = true);

CREATE POLICY "Member CRUD own portfolio"
  ON public.portfolio_items FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

CREATE POLICY "Admin read all portfolio"
  ON public.portfolio_items FOR SELECT
  USING (public.is_admin());
