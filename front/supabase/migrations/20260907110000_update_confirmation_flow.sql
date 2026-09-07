-- Migration to update privilege_items: Move Confirmation under DATA CENTER group and update href/name/slug
DO $$
DECLARE
    datacenter_group_id UUID;
BEGIN
    SELECT id INTO datacenter_group_id FROM privilege_groups WHERE UPPER(name) = 'DATA CENTER' LIMIT 1;
    
    IF datacenter_group_id IS NOT NULL THEN
        UPDATE privilege_items
        SET 
            group_id = datacenter_group_id,
            name = 'Confirmation',
            href = '/admin/confirmation',
            slug = 'confirmation',
            icon_name = 'check-circle'
        WHERE href IN ('/admin/new_member', '/admin/registration');
    ELSE
        UPDATE privilege_items
        SET 
            name = 'Confirmation',
            href = '/admin/confirmation',
            slug = 'confirmation',
            icon_name = 'check-circle'
        WHERE href IN ('/admin/new_member', '/admin/registration');
    END IF;
END $$;
