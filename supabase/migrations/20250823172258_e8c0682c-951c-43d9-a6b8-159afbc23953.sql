-- First, sync all existing tickets_inbox data to tickets
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
    ti.tenant_id,
    ti.created_at,
    ti.updated_at
FROM tickets_inbox ti
WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.id = ti.id)
ON CONFLICT (id) DO NOTHING;