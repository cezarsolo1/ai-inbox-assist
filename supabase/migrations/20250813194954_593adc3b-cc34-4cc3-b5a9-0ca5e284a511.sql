-- Make data publicly accessible for all users
-- Drop authenticated-only policies
DROP POLICY IF EXISTS "Authenticated users can view email threads" ON public.email_threads;
DROP POLICY IF EXISTS "Authenticated users can view email messages" ON public.email_messages;
DROP POLICY IF EXISTS "Authenticated users can view inbox messages" ON public.inbox_messages;
DROP POLICY IF EXISTS "Authenticated users can view outbound messages" ON public.outbound_messages;

-- Create public access policies for viewing data
CREATE POLICY "Allow public read access to email threads" 
ON public.email_threads 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Allow public read access to email messages" 
ON public.email_messages 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Allow public read access to inbox messages" 
ON public.inbox_messages 
FOR SELECT 
TO public
USING (true);

CREATE POLICY "Allow public read access to outbound messages" 
ON public.outbound_messages 
FOR SELECT 
TO public
USING (true);

-- Keep update policies for seen status but make them public
DROP POLICY IF EXISTS "Authenticated users can update seen status on email messages" ON public.email_messages;
DROP POLICY IF EXISTS "Authenticated users can update seen status on inbox messages" ON public.inbox_messages;

CREATE POLICY "Allow public update of seen status on email messages" 
ON public.email_messages 
FOR UPDATE 
TO public
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow public update of seen status on inbox messages" 
ON public.inbox_messages 
FOR UPDATE 
TO public
USING (true) 
WITH CHECK (true);