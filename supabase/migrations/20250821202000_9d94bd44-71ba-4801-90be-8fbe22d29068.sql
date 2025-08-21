-- Fix security definer view issue by recreating conversation_messages view without security definer
DROP VIEW IF EXISTS public.conversation_messages;

CREATE VIEW public.conversation_messages AS 
SELECT 
  id,
  'inbound'::text as direction,
  channel,
  from_msisdn as counterparty,
  to_msisdn as our_number,
  body,
  media,
  created_at,
  null::text as status,
  twilio_sid
FROM public.inbox_messages
UNION ALL
SELECT 
  id,
  'outbound'::text as direction,
  channel,
  to_msisdn as counterparty,
  from_msisdn as our_number,
  body,
  media,
  created_at,
  status,
  twilio_sid
FROM public.outbound_messages;