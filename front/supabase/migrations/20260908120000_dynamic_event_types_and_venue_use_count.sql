-- Migration: Dynamic Event Types and Venue Usage Count
-- 1. Create event_types table for dynamic tag management
CREATE TABLE IF NOT EXISTS public.event_types (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  value text NOT NULL UNIQUE,
  color text DEFAULT 'bg-cyan-500',
  created_at timestamptz DEFAULT now()
);

-- 2. Seed initial default event types
INSERT INTO public.event_types (name, value, color) VALUES
  ('Open Mic', 'open_mic', 'bg-amber-500'),
  ('Speech Practice', 'speech_practice', 'bg-blue-500'),
  ('MC Practice', 'mc_practice', 'bg-purple-500'),
  ('Networking', 'networking', 'bg-emerald-500'),
  ('Content Class', 'content_class', 'bg-rose-500'),
  ('Mentoring', 'mentoring', 'bg-indigo-500'),
  ('Sharing Session', 'sharing_session', 'bg-sky-500'),
  ('Workshop', 'workshop', 'bg-orange-500'),
  ('Voice Over', 'voice_over', 'bg-teal-500'),
  ('Level Up', 'level_up', 'bg-violet-500'),
  ('Branding Class', 'branding_class', 'bg-pink-500'),
  ('Lainnya', 'lainnya', 'bg-zinc-500')
ON CONFLICT (value) DO NOTHING;

-- 3. Drop check constraint on events.event_type to allow dynamic event types
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_event_type_check;

-- 4. Enable RLS and grant access for event_types
ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_types' AND policyname = 'Public read event_types'
  ) THEN
    CREATE POLICY "Public read event_types" ON public.event_types FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'event_types' AND policyname = 'Admins can manage event_types'
  ) THEN
    CREATE POLICY "Admins can manage event_types" ON public.event_types USING (public.is_admin());
  END IF;
END $$;

GRANT ALL ON TABLE public.event_types TO anon, authenticated, service_role;

-- 5. Add use_count to venues table for frequency ordering
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS use_count integer DEFAULT 0;
