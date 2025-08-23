-- Update all existing tickets with 'open' status to 'pending'
UPDATE public.tickets 
SET status = 'pending' 
WHERE status = 'open';

-- Change the default status from 'open' to 'pending'
ALTER TABLE public.tickets 
ALTER COLUMN status SET DEFAULT 'pending';