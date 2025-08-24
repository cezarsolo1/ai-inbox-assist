-- Fix trigger: only enforce pending on INSERT, not UPDATE
DROP TRIGGER IF EXISTS enforce_ticket_status_trigger ON public.tickets;
CREATE TRIGGER enforce_ticket_status_trigger
  BEFORE INSERT ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_ticket_status();