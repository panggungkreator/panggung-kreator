ALTER TABLE public.attendances
  ADD COLUMN has_performed boolean NOT NULL DEFAULT false;
