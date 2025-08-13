-- Complete the security fix for remaining policies
-- Drop dangerous public access policies that weren't removed
DROP POLICY IF EXISTS "outbound_insert" ON public.outbound_messages;
DROP POLICY IF EXISTS "outbound_update" ON public.outbound_messages;
DROP POLICY IF EXISTS "outbound_delete" ON public.outbound_messages;
DROP POLICY IF EXISTS "Enable delete for all users" ON public.inbox_messages;

-- Create secure authenticated-only policies for outbound messages
CREATE POLICY "Authenticated users can insert outbound messages" 
ON public.outbound_messages 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update outbound messages" 
ON public.outbound_messages 
FOR UPDATE 
TO authenticated
USING (true) 
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete outbound messages" 
ON public.outbound_messages 
FOR DELETE 
TO authenticated
USING (true);

-- Secure inbox message deletion to authenticated users only
CREATE POLICY "Authenticated users can delete inbox messages" 
ON public.inbox_messages 
FOR DELETE 
TO authenticated
USING (true);