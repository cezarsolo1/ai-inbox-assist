-- Harden function: set immutable search_path
CREATE OR REPLACE FUNCTION public.enforce_ticket_title()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.title := 'Liftstoring (werkt helemaal niet)';
  RETURN NEW;
END;
$$;