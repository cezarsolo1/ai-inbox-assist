-- Function to sync tickets_inbox data to tickets table
CREATE OR REPLACE FUNCTION public.sync_tickets_inbox_to_tickets()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update tickets table with data from tickets_inbox
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
        NEW.tenant_id,
        NEW.created_at,
        NEW.updated_at
    )
    ON CONFLICT (id) 
    DO UPDATE SET
        title = COALESCE(NEW.notes_for_contractor, ''),
        description = NEW.description,
        property_address = NEW.street_address,
        tenant_id = NEW.tenant_id,
        updated_at = NEW.updated_at;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Create trigger for INSERT operations on tickets_inbox
CREATE TRIGGER sync_tickets_inbox_insert_trigger
    AFTER INSERT ON public.tickets_inbox
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_tickets_inbox_to_tickets();

-- Create trigger for UPDATE operations on tickets_inbox  
CREATE TRIGGER sync_tickets_inbox_update_trigger
    AFTER UPDATE ON public.tickets_inbox
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_tickets_inbox_to_tickets();