-- Function to replace Northridge property with Noord Holland and update tenant data
CREATE OR REPLACE FUNCTION public.replace_northridge_tenant_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if property contains Northridge, CA 91326
  IF NEW.property_address IS NOT NULL AND NEW.property_address ILIKE '%Northridge, CA 91326%' THEN
    NEW.property_address := 'Noord Holland';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Function for tickets_inbox to replace data
CREATE OR REPLACE FUNCTION public.replace_northridge_tenant_data_inbox()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Check if street address contains Northridge, CA 91326
  IF NEW.street_address IS NOT NULL AND NEW.street_address ILIKE '%Northridge, CA 91326%' THEN
    NEW.street_address := 'Noord Holland';
    -- Update tenant contact information
    NEW.contact_name := 'Cezar Solovastru';
    NEW.contact_email := 'solovastrucezar@gmail.com';
    NEW.contact_phone := '+31681874782';
    NEW.occupant_name := 'Cezar Solovastru';
    NEW.occupant_email := 'solovastrucezar@gmail.com';
    NEW.occupant_phone := '+31681874782';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for tickets table
DROP TRIGGER IF EXISTS replace_northridge_data_trigger ON public.tickets;
CREATE TRIGGER replace_northridge_data_trigger
  BEFORE INSERT OR UPDATE ON public.tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.replace_northridge_tenant_data();

-- Create trigger for tickets_inbox table  
DROP TRIGGER IF EXISTS replace_northridge_data_inbox_trigger ON public.tickets_inbox;
CREATE TRIGGER replace_northridge_data_inbox_trigger
  BEFORE INSERT OR UPDATE ON public.tickets_inbox
  FOR EACH ROW
  EXECUTE FUNCTION public.replace_northridge_tenant_data_inbox();