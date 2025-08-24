-- Create function to enforce ticket status as pending
CREATE OR REPLACE FUNCTION public.enforce_ticket_status()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

-- Create trigger to enforce pending status on ticket creation and updates
DROP TRIGGER IF EXISTS enforce_ticket_status_trigger ON public.tickets;
CREATE TRIGGER enforce_ticket_status_trigger
    BEFORE INSERT OR UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_ticket_status();