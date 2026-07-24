-- ============================================================
-- FASE 1: Storage Buckets & Policies Provisioning
-- File: supabase/migrations/20260721133036_add_storage_buckets.sql
-- ============================================================

-- 1. Insert Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('member-avatars', 'member-avatars', true),
  ('portfolio-images', 'portfolio-images', true),
  ('portfolio-thumbnails', 'portfolio-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS Policies for member-avatars
CREATE POLICY "Public read avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'member-avatars');

CREATE POLICY "Owner upload avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'member-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Owner delete avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'member-avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. RLS Policies for portfolio-images and portfolio-thumbnails
CREATE POLICY "Public read portfolio files"
  ON storage.objects FOR SELECT
  USING (bucket_id IN ('portfolio-images', 'portfolio-thumbnails'));

CREATE POLICY "Owner manage portfolio files"
  ON storage.objects FOR ALL
  USING (
    bucket_id IN ('portfolio-images', 'portfolio-thumbnails')
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id IN ('portfolio-images', 'portfolio-thumbnails')
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
