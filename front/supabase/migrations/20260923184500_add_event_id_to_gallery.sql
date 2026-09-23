-- ============================================================
-- Migration: Add event_id to gallery_albums & Backfill Existing Events
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

-- 2. Tambah Index pada event_id
CREATE INDEX IF NOT EXISTS gallery_albums_event_id_idx ON public.gallery_albums (event_id);

-- 3. Backfill: Hubungkan gallery_albums lama ke events yang cocok (berdasarkan title & event_date)
UPDATE public.gallery_albums ga
SET event_id = e.id
FROM public.events e
WHERE ga.event_id IS NULL
  AND lower(trim(ga.title)) = lower(trim(e.title))
  AND ga.event_date = e.event_date;

-- 4. Backfill: Buat galeri album (draft / is_published = false) untuk semua event yang belum memiliki galeri
INSERT INTO public.gallery_albums (
  event_id,
  title,
  slug,
  category,
  event_date,
  hero_image_url,
  album_link,
  description,
  is_published,
  display_order,
  created_at,
  updated_at
)
SELECT 
  e.id,
  e.title,
  -- Generate safe unique slug with random/id postfix to prevent collision
  trim(both '-' from regexp_replace(lower(trim(e.title)), '[^a-z0-9]+', '-', 'g')) || '-' || substr(e.id::text, 1, 6),
  COALESCE(e.event_type, 'lainnya'),
  e.event_date,
  NULL,
  NULL,
  NULL,
  false,
  0,
  now(),
  now()
FROM public.events e
WHERE NOT EXISTS (
  SELECT 1 FROM public.gallery_albums ga 
  WHERE ga.event_id = e.id
);
