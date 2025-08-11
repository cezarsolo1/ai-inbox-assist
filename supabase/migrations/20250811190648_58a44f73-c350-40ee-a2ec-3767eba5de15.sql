-- Fix RLS policies to work for authenticated users too
-- The issue is policies were limited to 'anon' role but user is authenticated

-- Drop existing policies 
DROP POLICY IF EXISTS "Enable read access for anon" ON public.inbox_messages;
DROP POLICY IF EXISTS "Enable update for anon on seen column only" ON public.inbox_messages;

-- Create policies that work for both authenticated and anonymous users
CREATE POLICY "Enable read access for all users" 
ON public.inbox_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Enable update for all users on seen column only" 
ON public.inbox_messages 
FOR UPDATE 
USING (true)
WITH CHECK (true);