-- ============================================================
-- Migration: Unify Referral System
-- ============================================================

-- 1. Tambah kolom baru di referral_codes (max_usage + default_reward)
ALTER TABLE public.referral_codes
  ADD COLUMN IF NOT EXISTS max_usage INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS default_reward NUMERIC NOT NULL DEFAULT 0;

-- 2. Tambah kolom referral_credit_used di transactions
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS referral_credit_used NUMERIC NOT NULL DEFAULT 0;

-- 3. Tambah tabel log reward referral (audit trail)
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id    UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  referral_code_id  UUID REFERENCES public.referral_codes(id) ON DELETE SET NULL,
  referrer_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  referred_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  reward_amount     NUMERIC NOT NULL DEFAULT 0,
  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'confirmed', 'redeemed', 'paid_out', 'cancelled')),
  confirmed_by      UUID REFERENCES public.members(id) ON DELETE SET NULL,
  confirmed_at      TIMESTAMPTZ,
  notes             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referral_rewards' AND policyname = 'Referrer can view own rewards') THEN
    CREATE POLICY "Referrer can view own rewards"
      ON public.referral_rewards FOR SELECT
      USING (referrer_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'referral_rewards' AND policyname = 'Admin can manage all rewards') THEN
    CREATE POLICY "Admin can manage all rewards"
      ON public.referral_rewards FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_referral_rewards_referrer ON public.referral_rewards(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_transaction ON public.referral_rewards(transaction_id);

-- Trigger updated_at untuk referral_rewards
DROP TRIGGER IF EXISTS set_referral_rewards_updated_at ON public.referral_rewards;
CREATE TRIGGER set_referral_rewards_updated_at
  BEFORE UPDATE ON public.referral_rewards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Tabel commission_ledger (audit trail mutasi saldo)
CREATE TABLE IF NOT EXISTS public.commission_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
  amount          NUMERIC NOT NULL,
  balance_after   NUMERIC NOT NULL,
  source          TEXT NOT NULL CHECK (source IN (
    'referral_reward',
    'redeem_membership',
    'cash_out',
    'manual_adjustment'
  )),
  reference_id    UUID,
  description     TEXT,
  created_by      UUID REFERENCES public.members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.commission_ledger ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commission_ledger' AND policyname = 'Owner can view own ledger') THEN
    CREATE POLICY "Owner can view own ledger"
      ON public.commission_ledger FOR SELECT
      USING (member_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'commission_ledger' AND policyname = 'Admin can manage all ledger') THEN
    CREATE POLICY "Admin can manage all ledger"
      ON public.commission_ledger FOR ALL
      USING (public.is_admin());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_commission_ledger_member ON public.commission_ledger(member_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_source ON public.commission_ledger(source);

-- 5. Migrasi data affiliate_code → referral_codes (single source of truth)
INSERT INTO public.referral_codes (code, owner_member_id, description, is_active)
SELECT
  affiliate_code, id, 'Auto-migrated dari affiliate_code', true
FROM public.members
WHERE affiliate_code IS NOT NULL
  AND affiliate_code NOT IN (SELECT code FROM public.referral_codes)
ON CONFLICT (code) DO NOTHING;

-- 6. Update fungsi use_referral_code (sinkronisasi + max_usage check)
CREATE OR REPLACE FUNCTION public.use_referral_code(p_code TEXT, p_member_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_referral_id   UUID;
  v_owner_id      UUID;
  v_max_usage     INTEGER;
  v_current_usage INTEGER;
BEGIN
  -- Cari di tabel referral_codes (single source of truth)
  SELECT id, owner_member_id, max_usage, usage_count
  INTO v_referral_id, v_owner_id, v_max_usage, v_current_usage
  FROM public.referral_codes
  WHERE code = p_code AND is_active = true;

  IF v_referral_id IS NULL THEN
    RETURN NULL;  -- kode tidak valid atau tidak aktif
  END IF;

  -- Cek limit penggunaan (0 = unlimited)
  IF v_max_usage > 0 AND v_current_usage >= v_max_usage THEN
    RETURN NULL;  -- kode sudah mencapai batas penggunaan
  END IF;

  -- Increment usage count
  UPDATE public.referral_codes
  SET usage_count = usage_count + 1, updated_at = NOW()
  WHERE id = v_referral_id;

  -- Sinkronisasi: Update kedua kolom referral di members
  UPDATE public.members
  SET referred_by_member_id = v_owner_id,
      referred_by = v_owner_id
  WHERE id = p_member_id;

  RETURN v_owner_id;
END;
$$;
