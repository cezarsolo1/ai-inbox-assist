-- Fix DELETE policies on tickets to be permissive so they combine with OR instead of AND
ALTER POLICY "Tenants can delete their own tickets"
ON public.tickets
AS PERMISSIVE;

ALTER POLICY "Admins can delete any ticket"
ON public.tickets
AS PERMISSIVE;

ALTER POLICY "Authenticated users can delete tickets"
ON public.tickets
AS PERMISSIVE;