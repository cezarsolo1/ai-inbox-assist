-- Drop existing delete policies if they exist
DROP POLICY IF EXISTS "Tenants can delete their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "Admins can delete any ticket" ON public.tickets;

-- Create delete policies for tickets
CREATE POLICY "Tenants can delete their own tickets" 
ON public.tickets
FOR DELETE 
USING (auth.uid() = tenant_id);

CREATE POLICY "Admins can delete any ticket" 
ON public.tickets
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Also allow public deletion for now (can be restricted later)
CREATE POLICY "Allow public delete for tickets" 
ON public.tickets
FOR DELETE 
USING (true);