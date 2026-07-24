-- ============================================================
-- FASE 1: Auth Trigger for automatic member creation
-- File: supabase/migrations/20260721133156_add_auth_trigger.sql
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.members (
    id,
    full_name,
    stage_name,
    whatsapp_number,
    email,
    username,
    instagram_username,
    occupation,
    community,
    membership_tier,
    payment_status,
    role
  ) VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru'),
    coalesce(new.raw_user_meta_data->>'stage_name', coalesce(new.raw_user_meta_data->>'full_name', 'Member Baru')),
    coalesce(new.raw_user_meta_data->>'whatsapp_number', '-'),
    new.email,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    '-', -- placeholder
    'Lainnya', -- placeholder
    'panggung_kreator',
    'free',
    'pending',
    'member'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger hanya dijalankan jika belum ada
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
