-- Create tickets table to store tenant complaints/tickets
CREATE TABLE public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  property_address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Create policies for tickets
CREATE POLICY "Allow public read access to tickets" 
ON public.tickets 
FOR SELECT 
USING (true);

CREATE POLICY "Tenants can create their own tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update their own tickets" 
ON public.tickets 
FOR UPDATE 
USING (auth.uid() = tenant_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_tickets_updated_at();