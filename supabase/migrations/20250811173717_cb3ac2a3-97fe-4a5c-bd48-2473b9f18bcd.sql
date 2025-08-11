-- Email conversations schema

-- Create threads table
create table if not exists public.email_threads (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  participant_email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create messages table
create table if not exists public.email_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.email_threads(id) on delete cascade,
  direction text not null check (direction in ('in','out')),
  from_email text not null,
  to_email text not null,
  body text,
  attachments jsonb not null default '[]'::jsonb,
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.email_threads enable row level security;
alter table public.email_messages enable row level security;

-- Read access for clients
create policy if not exists "Allow anon to select email_threads"
  on public.email_threads for select using (true);

create policy if not exists "Allow anon to select email_messages"
  on public.email_messages for select using (true);

-- Service role full access
create policy if not exists "Service role can insert threads"
  on public.email_threads for insert with check (true);

create policy if not exists "Service role can update threads"
  on public.email_threads for update using (true) with check (true);

create policy if not exists "Service role can delete threads"
  on public.email_threads for delete using (true);

create policy if not exists "Service role can insert messages"
  on public.email_messages for insert with check (true);

create policy if not exists "Service role can update messages"
  on public.email_messages for update using (true) with check (true);

create policy if not exists "Service role can delete messages"
  on public.email_messages for delete using (true);

-- Allow anon to update only 'seen' on messages (enforced via trigger)
create policy if not exists "Allow anon to update seen email_messages"
  on public.email_messages for update using (true) with check (true);

-- Validation trigger to restrict anon updates to only the 'seen' column
create or replace function public.email_messages_validate_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.role() = 'anon' then
    if (new is distinct from old) then
      if (
        new.id          is distinct from old.id or
        new.thread_id   is distinct from old.thread_id or
        new.direction   is distinct from old.direction or
        new.from_email  is distinct from old.from_email or
        new.to_email    is distinct from old.to_email or
        new.body        is distinct from old.body or
        new.attachments is distinct from old.attachments or
        new.created_at  is distinct from old.created_at
      ) then
        raise exception 'Only the seen field can be updated by anon role';
      end if;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_email_messages_validate_update on public.email_messages;
create trigger trg_email_messages_validate_update
before update on public.email_messages
for each row execute function public.email_messages_validate_update();