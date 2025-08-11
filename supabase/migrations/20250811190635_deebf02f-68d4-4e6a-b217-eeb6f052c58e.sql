-- Fix RLS policies to work for authenticated users too
-- Drop existing policies and create new ones that work for both anon and authenticated roles

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

-- Also ensure service role policies exist
CREATE POLICY "Service role can insert messages" 
ON public.inbox_messages 
FOR INSERT 
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can delete messages" 
ON public.inbox_messages 
FOR DELETE 
TO service_role
USING (true);

CREATE POLICY "Service role can update messages" 
ON public.inbox_messages 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);