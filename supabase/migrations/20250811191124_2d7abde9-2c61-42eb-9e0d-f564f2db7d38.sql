-- Add RLS policy to allow authenticated users to delete messages
CREATE POLICY "Enable delete for all users" 
ON public.inbox_messages 
FOR DELETE 
USING (true);