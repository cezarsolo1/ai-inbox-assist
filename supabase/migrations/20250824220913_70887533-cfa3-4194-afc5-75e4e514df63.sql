-- Allow authenticated users to update ticket status while protecting other fields
-- 1) RLS policy to allow updates by authenticated users
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'tickets' 
      AND policyname = 'Authenticated users can update tickets (status only)') THEN
    CREATE POLICY "Authenticated users can update tickets (status only)"
      ON public.tickets
      FOR UPDATE
      USING (auth.uid() IS NOT NULL)
      WITH CHECK (auth.uid() IS NOT NULL);
  END IF;
END $$;

-- 2) Validation trigger to restrict which columns can be changed by non-admins
CREATE OR REPLACE FUNCTION public.tickets_validate_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Admins can update anything
  IF has_role(auth.uid(), 'admin') THEN
    RETURN NEW;
  END IF;

  -- For non-admins (including tenants/authenticated), only allow status changes
  IF (NEW IS DISTINCT FROM OLD) THEN
    IF (
      -- Disallow changes to any fields except status (updated_at may change via separate trigger)
      NEW.title            IS DISTINCT FROM OLD.title OR
      NEW.description      IS DISTINCT FROM OLD.description OR
      NEW.category         IS DISTINCT FROM OLD.category OR
      NEW.priority         IS DISTINCT FROM OLD.priority OR
      NEW.property_address IS DISTINCT FROM OLD.property_address OR
      NEW.tenant_id        IS DISTINCT FROM OLD.tenant_id OR
      NEW.created_at       IS DISTINCT FROM OLD.created_at OR
      NEW.id               IS DISTINCT FROM OLD.id
    ) THEN
      RAISE EXCEPTION 'Only status can be updated by non-admin users';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- 3) Attach trigger (runs before the updated_at trigger)
DROP TRIGGER IF EXISTS tickets_validate_update_trigger ON public.tickets;
CREATE TRIGGER tickets_validate_update_trigger
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.tickets_validate_update();