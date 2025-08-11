-- Fix the security definer view by recreating it without SECURITY DEFINER
drop view if exists conversation_messages;

create or replace view conversation_messages as
  select id, 'inbound'::text as direction, channel,
         from_msisdn as counterparty, to_msisdn as our_number,
         body, media, created_at, null::text as status, twilio_sid
  from inbox_messages
  union all
  select id, 'outbound'::text, channel,
         to_msisdn as counterparty, from_msisdn as our_number,
         body, media, created_at, status, twilio_sid
  from outbound_messages;