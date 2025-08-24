-- Enable secure deletion of tickets while maintaining RLS
-- Policy 1: Tenants can delete their own tickets
CREATE POLICY IF NOT EXISTS "Tenants can delete their own tickets"
ON public.tickets
FOR DELETE
USING (auth.uid() = tenant_id);

-- Policy 2: Admins can delete any ticket
CREATE POLICY IF NOT EXISTS "Admins can delete any ticket"
ON public.tickets
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));