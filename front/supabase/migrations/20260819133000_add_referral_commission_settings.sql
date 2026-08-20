-- Migration: Add Referral Commission Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Public read system settings'
  ) THEN
    CREATE POLICY "Public read system settings"
      ON public.system_settings FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'system_settings' AND policyname = 'Admin manage system settings'
  ) THEN
    CREATE POLICY "Admin manage system settings"
      ON public.system_settings FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

INSERT INTO public.system_settings (key, value)
VALUES
  ('referral_reward_mode',        'flat'),
  ('referral_reward_flat_amount', '10000'),
  ('referral_reward_percentage',  '10')
ON CONFLICT (key) DO NOTHING;
