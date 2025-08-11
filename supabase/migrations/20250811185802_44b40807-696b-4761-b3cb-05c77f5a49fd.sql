-- Fix RLS policy issue for tenants table
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;

-- Create a simple policy to allow read access for now
CREATE POLICY "Allow anon to read tenants" 
ON public.tenants 
FOR SELECT 
USING (true);