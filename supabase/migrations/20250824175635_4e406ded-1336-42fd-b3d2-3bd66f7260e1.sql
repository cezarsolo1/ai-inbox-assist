-- Enforce constant title on all ticket inserts and updates
CREATE OR REPLACE FUNCTION public.enforce_ticket_title()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.title := 'Liftstoring (werkt helemaal niet)';
  RETURN NEW;
END;
$$;

-- Ensure trigger exists and is up-to-date
DROP TRIGGER IF EXISTS trg_enforce_ticket_title ON public.tickets;
CREATE TRIGGER trg_enforce_ticket_title
BEFORE INSERT OR UPDATE ON public.tickets
FOR EACH ROW EXECUTE FUNCTION public.enforce_ticket_title();