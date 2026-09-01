-- Migration: Add MyProfile Tab Visibility Settings
INSERT INTO public.system_settings (key, value)
VALUES
  ('tab_attendance_enabled', 'true'),
  ('tab_portfolio_enabled',  'true'),
  ('tab_affiliate_enabled',  'true')
ON CONFLICT (key) DO NOTHING;
