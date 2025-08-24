-- Update all existing tickets to have pending status
UPDATE public.tickets 
SET status = 'pending' 
WHERE status != 'pending';