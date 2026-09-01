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

-- 3. Ubah ai_analysis dari TEXT ke JSONB (migrasi data lama jika ada)
ALTER TABLE public.member_interests
  ALTER COLUMN ai_analysis TYPE JSONB
  USING CASE
    WHEN ai_analysis IS NULL OR ai_analysis::text = '' THEN NULL
    WHEN pg_typeof(ai_analysis)::text = 'jsonb' THEN ai_analysis::jsonb
    ELSE jsonb_build_object('legacy', ai_analysis::text)
  END;

-- 4. Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
