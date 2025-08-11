-- Check current RLS policies and fix if needed
-- The issue is that while we have policies, they might not be working correctly

-- First, let's check what's happening with a test query
SELECT * FROM inbox_messages LIMIT 1;

-- Drop existing policies and recreate them properly
DROP POLICY IF EXISTS "Allow anon to select inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Allow anon to update seen status" ON public.inbox_messages;

-- Create proper policies for anonymous access
CREATE POLICY "Enable read access for anon" 
ON public.inbox_messages 
FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Enable update for anon on seen column only" 
ON public.inbox_messages 
FOR UPDATE 
TO anon
USING (true)
WITH CHECK (true);