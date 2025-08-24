-- Set default title for new tickets
ALTER TABLE public.tickets 
ALTER COLUMN title SET DEFAULT 'Liftstoring (werkt helemaal niet)';

-- Verify that status already defaults to 'pending' (should already be set)
-- This is just for confirmation - no change needed as it's already 'pending'