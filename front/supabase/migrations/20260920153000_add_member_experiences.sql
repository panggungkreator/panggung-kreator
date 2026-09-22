-- ============================================================
-- Migration: Add Member Experiences Table & Indices
-- File: supabase/migrations/20260920153000_add_member_experiences.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.member_experiences (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  role            text NOT NULL,
  institution     text NOT NULL,
  start_date      date NOT NULL,
  end_date        date,
  is_current      boolean NOT NULL DEFAULT false,
  description     text,
  location        text,
  sort_order      integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS member_experiences_member_id_idx ON public.member_experiences (member_id);
CREATE INDEX IF NOT EXISTS member_experiences_sort_order_idx ON public.member_experiences (member_id, sort_order);

-- Trigger updated_at otomatis
DROP TRIGGER IF EXISTS member_experiences_updated_at ON public.member_experiences;
CREATE TRIGGER member_experiences_updated_at
  BEFORE UPDATE ON public.member_experiences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.member_experiences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public read member experiences" ON public.member_experiences;
CREATE POLICY "Public read member experiences"
  ON public.member_experiences FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Member CRUD own experiences" ON public.member_experiences;
CREATE POLICY "Member CRUD own experiences"
  ON public.member_experiences FOR ALL
  USING (auth.uid() = member_id)
  WITH CHECK (auth.uid() = member_id);

DROP POLICY IF EXISTS "Admin read all experiences" ON public.member_experiences;
CREATE POLICY "Admin read all experiences"
  ON public.member_experiences FOR SELECT
  USING (public.is_admin());
