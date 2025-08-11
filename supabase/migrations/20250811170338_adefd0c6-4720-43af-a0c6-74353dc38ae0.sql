-- Create inbox_messages table for WhatsApp messages
CREATE TABLE public.inbox_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
  from_msisdn TEXT NOT NULL,
  to_msisdn TEXT NOT NULL,
  body TEXT,
  profile_name TEXT,
  twilio_sid TEXT,
  media JSONB DEFAULT '[]'::jsonb,
  raw JSONB,
  seen BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow anonymous users to SELECT all rows (read-only access)
CREATE POLICY "Allow anon to select inbox messages" 
ON public.inbox_messages 
FOR SELECT 
TO anon 
USING (true);

-- Allow anonymous users to update only the seen field
CREATE POLICY "Allow anon to update seen status" 
ON public.inbox_messages 
FOR UPDATE 
TO anon 
USING (true)
WITH CHECK (true);

-- Only service role can insert/delete messages (for Make.com integration)
CREATE POLICY "Service role can insert messages" 
ON public.inbox_messages 
FOR INSERT 
TO service_role 
WITH CHECK (true);

CREATE POLICY "Service role can delete messages" 
ON public.inbox_messages 
FOR DELETE 
TO service_role 
USING (true);

-- Create index for better performance
CREATE INDEX idx_inbox_messages_created_at ON public.inbox_messages(created_at DESC);
CREATE INDEX idx_inbox_messages_channel ON public.inbox_messages(channel);
CREATE INDEX idx_inbox_messages_seen ON public.inbox_messages(seen);