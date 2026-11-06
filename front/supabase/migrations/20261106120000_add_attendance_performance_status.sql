ALTER TABLE public.attendances
  ADD COLUMN IF NOT EXISTS has_performed boolean NOT NULL DEFAULT false;
