-- CRITICAL SECURITY FIX: Secure customer data access
-- Remove public access to sensitive customer data

-- 1. Drop the dangerous public access policies
DROP POLICY IF EXISTS "Allow anon to select email_threads" ON public.email_threads;
DROP POLICY IF EXISTS "Allow anon to select email_messages" ON public.email_messages;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.inbox_messages;
DROP POLICY IF EXISTS "outbound_select" ON public.outbound_messages;

-- 2. Create secure policies that require authentication
-- Email threads - only authenticated users can access
CREATE POLICY "Authenticated users can view email threads" 
ON public.email_threads 
FOR SELECT 
TO authenticated
USING (true);

-- Email messages - only authenticated users can access
CREATE POLICY "Authenticated users can view email messages" 
ON public.email_messages 
FOR SELECT 
TO authenticated
USING (true);

-- Inbox messages - only authenticated users can access
CREATE POLICY "Authenticated users can view inbox messages" 
ON public.inbox_messages 
FOR SELECT 
TO authenticated
USING (true);

-- Outbound messages - only authenticated users can access
CREATE POLICY "Authenticated users can view outbound messages" 
ON public.outbound_messages 
FOR SELECT 
TO authenticated
USING (true);

-- Keep the update policies for 'seen' field but restrict to authenticated users
DROP POLICY IF EXISTS "Allow anon to update seen email_messages" ON public.email_messages;
CREATE POLICY "Authenticated users can update seen status on email messages" 
ON public.email_messages 
FOR UPDATE 
TO authenticated
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Enable update for all users on seen column only" ON public.inbox_messages;
CREATE POLICY "Authenticated users can update seen status on inbox messages" 
ON public.inbox_messages 
FOR UPDATE 
TO authenticated
USING (true) 
WITH CHECK (true);