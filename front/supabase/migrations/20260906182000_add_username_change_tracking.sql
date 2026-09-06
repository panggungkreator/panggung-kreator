-- Add columns to track username changes and cooldown
ALTER TABLE public.members 
ADD COLUMN IF NOT EXISTS username_changes_count INT NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_username_change TIMESTAMPTZ;

COMMENT ON COLUMN public.members.username_changes_count IS 'Jumlah kali username telah diubah oleh member';
COMMENT ON COLUMN public.members.last_username_change IS 'Waktu terakhir username diubah';