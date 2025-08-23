-- Update the sync function to handle tenant_id properly
CREATE OR REPLACE FUNCTION public.sync_tickets_inbox_to_tickets()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update tickets table with data from tickets_inbox
    -- Set tenant_id to NULL if the user doesn't exist in auth.users
    INSERT INTO public.tickets (
        id,
        title,
        description,
        category,
        status,
        property_address,
        tenant_id,
        created_at,
        updated_at
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.notes_for_contractor, ''),
        NEW.description,
        'general', -- default category
        'open', -- default status
        NEW.street_address,
        CASE 
            WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.tenant_id) 
            THEN NEW.tenant_id 
            ELSE NULL 
        END,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        title = COALESCE(NEW.notes_for_contractor, ''),
        description = NEW.description,
        property_address = NEW.street_address,
        tenant_id = CASE 
            WHEN EXISTS (SELECT 1 FROM auth.users WHERE id = NEW.tenant_id) 
            THEN NEW.tenant_id 
            ELSE NULL 
        END,
        updated_at = NEW.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Now sync existing data with NULL tenant_id where user doesn't exist
INSERT INTO public.tickets (
    id,
    title,
    description,
    category,
    status,
    property_address,
    tenant_id,
    created_at,
    updated_at
)
SELECT 
    ti.id,
    COALESCE(ti.notes_for_contractor, '') as title,
    ti.description,
    'general' as category,
    'open' as status,
    ti.street_address as property_address,
    NULL as tenant_id, -- Set to NULL since the tenant_id references don't exist
    ti.created_at,
    ti.updated_at
FROM tickets_inbox ti
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.id = ti.id)
ON CONFLICT (id) DO NOTHING;