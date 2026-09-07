-- ============================================================
-- Migration: Add Affiliate Payouts System & Storage
-- ============================================================

-- 1. Create affiliate_payouts table
CREATE TABLE IF NOT EXISTS public.affiliate_payouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id       UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount          NUMERIC NOT NULL CHECK (amount > 0),
  bank_name       TEXT,
  account_number  TEXT,
  account_holder  TEXT,
  proof_url       TEXT,
  notes           TEXT,
  status          TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'cancelled')),
  confirmed_by    UUID REFERENCES public.members(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_payouts' AND policyname = 'Owner can view own payouts') THEN
    CREATE POLICY "Owner can view own payouts"
      ON public.affiliate_payouts FOR SELECT
      USING (member_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'affiliate_payouts' AND policyname = 'Admin can manage all payouts') THEN
    CREATE POLICY "Admin can manage all payouts"
      ON public.affiliate_payouts FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_member ON public.affiliate_payouts(member_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON public.affiliate_payouts(status);

-- 2. Update commission_ledger check constraint to include affiliate_payout and pending/paid types
ALTER TABLE public.commission_ledger DROP CONSTRAINT IF EXISTS commission_ledger_source_check;
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_source_check
  CHECK (source IN ('referral_reward', 'redeem_membership', 'cash_out', 'manual_adjustment', 'affiliate_payout'));

ALTER TABLE public.commission_ledger DROP CONSTRAINT IF EXISTS commission_ledger_type_check;
ALTER TABLE public.commission_ledger ADD CONSTRAINT commission_ledger_type_check
  CHECK (type IN ('pending', 'paid', 'credit', 'debit'));

-- 3. Storage bucket for payout proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payout-proofs', 'payout-proofs', true)
ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin can upload payout proofs') THEN
    CREATE POLICY "Admin can upload payout proofs"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'payout-proofs');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Public can view payout proofs') THEN
    CREATE POLICY "Public can view payout proofs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'payout-proofs');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admin can manage payout proofs') THEN
    CREATE POLICY "Admin can manage payout proofs"
      ON storage.objects FOR ALL
      USING (bucket_id = 'payout-proofs');
  END IF;
END $$;
