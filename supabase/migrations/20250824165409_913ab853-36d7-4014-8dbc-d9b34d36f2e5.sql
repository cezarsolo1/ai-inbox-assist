-- Fix ticket delete policies to avoid recursion and allow authenticated deletion
DROP POLICY IF EXISTS "Admins can delete any ticket" ON public.tickets;
DROP POLICY IF EXISTS "Allow public delete for tickets" ON public.tickets;

-- Use the SECURITY DEFINER helper to avoid recursive lookups
CREATE POLICY "Admins can delete any ticket"
ON public.tickets
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Allow any authenticated user to delete tickets (adjust later if needed)
CREATE POLICY "Authenticated users can delete tickets"
ON public.tickets
FOR DELETE
USING (auth.uid() IS NOT NULL);