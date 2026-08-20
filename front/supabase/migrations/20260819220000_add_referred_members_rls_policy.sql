-- Migration: Allow members to view other members referred by them
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'members' AND policyname = 'Users can view members referred by them'
  ) THEN
    CREATE POLICY "Users can view members referred by them"
      ON public.members FOR SELECT
      USING (referred_by = auth.uid() OR referred_by_member_id = auth.uid());
  END IF;
END $$;
