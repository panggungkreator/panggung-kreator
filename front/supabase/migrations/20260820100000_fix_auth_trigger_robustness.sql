-- Migration: Make handle_new_user auth trigger robust against exceptions and unique constraint conflicts
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
    '-',
    'Lainnya',
    'panggung_kreator',
    'free',
    'pending',
    'member'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  -- Prevent database trigger error from breaking Auth user creation (returns 500 in Auth API)
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
