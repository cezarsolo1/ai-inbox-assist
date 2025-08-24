-- Backfill existing tickets where property contains Northridge, CA 91326
UPDATE public.tickets
SET property_address = 'Noord Holland', updated_at = now()
WHERE property_address ILIKE '%Northridge, CA 91326%';

-- Backfill existing tickets_inbox with address and tenant contact replacements
UPDATE public.tickets_inbox
SET 
  street_address = 'Noord Holland',
  contact_name = 'Cezar Solovastru',
  contact_email = 'solovastrucezar@gmail.com',
  contact_phone = '+31681874782',
  occupant_name = 'Cezar Solovastru',
  occupant_email = 'solovastrucezar@gmail.com',
  occupant_phone = '+31681874782',
  updated_at = now()
WHERE street_address ILIKE '%Northridge, CA 91326%';