-- Create outbound_messages table
create table if not exists outbound_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'whatsapp',
  to_msisdn text not null,
  from_msisdn text not null,
  body text not null,
  media jsonb not null default '[]'::jsonb,
  status text not null default 'queued',  -- queued | sent | delivered | failed
  twilio_sid text,
  error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists outbound_messages_thread_idx on outbound_messages (to_msisdn, created_at desc);

-- RLS (MVP: allow FE to insert + update status; we can lock this down later)
alter table outbound_messages enable row level security;
create policy "outbound_select" on outbound_messages for select using (true);
create policy "outbound_insert" on outbound_messages for insert with check (true);
create policy "outbound_update" on outbound_messages for update using (true) with check (true);

-- Unified view for the UI
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