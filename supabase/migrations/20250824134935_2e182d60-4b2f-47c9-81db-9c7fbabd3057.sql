-- Fix the RLS policy for outbound_messages to properly check authentication
DROP POLICY IF EXISTS "Authenticated users can insert outbound messages" ON outbound_messages;

CREATE POLICY "Authenticated users can insert outbound messages" 
ON outbound_messages 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Also fix the update policy
DROP POLICY IF EXISTS "Authenticated users can update outbound messages" ON outbound_messages;

CREATE POLICY "Authenticated users can update outbound messages" 
ON outbound_messages 
FOR UPDATE 
USING (auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() IS NOT NULL);

-- And fix the delete policy  
DROP POLICY IF EXISTS "Authenticated users can delete outbound messages" ON outbound_messages;

CREATE POLICY "Authenticated users can delete outbound messages" 
ON outbound_messages 
FOR DELETE 
USING (auth.uid() IS NOT NULL);