-- Migration: Add 'new_member' to membership_tier constraint and update menu item
ALTER TABLE public.members DROP CONSTRAINT IF EXISTS members_membership_tier_check;

ALTER TABLE public.members ADD CONSTRAINT members_membership_tier_check 
CHECK (membership_tier IN ('free', 'regular', 'priority', 'membership', 'mvp', 'admin', 'new_member'));

UPDATE public.privilege_items 
SET name = 'New Member', href = '/admin/new_member', slug = 'new_member'
WHERE href = '/admin/registration' OR slug = 'registration' OR name = 'Registration';
