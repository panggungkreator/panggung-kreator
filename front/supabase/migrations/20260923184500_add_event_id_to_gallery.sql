-- ============================================================
-- Migration: Add event_id to gallery_albums & Link Existing Data
-- File: supabase/migrations/20260923184500_add_event_id_to_gallery.sql
-- ============================================================

-- 1. Tambah kolom event_id ke tabel gallery_albums (jika belum ada)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'gallery_albums'
      AND column_name = 'event_id'
  ) THEN
    ALTER TABLE public.gallery_albums
    ADD COLUMN event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 2. Tambah Index pada event_id untuk performa pencarian instan
CREATE INDEX IF NOT EXISTS gallery_albums_event_id_idx ON public.gallery_albums (event_id);

-- 3. Backfill: Hubungkan seluruh gallery_albums lama ke event_id yang cocok berdasarkan judul acara
UPDATE public.gallery_albums ga
SET event_id = e.id
FROM public.events e
WHERE ga.event_id IS NULL
  AND lower(trim(ga.title)) = lower(trim(e.title));
