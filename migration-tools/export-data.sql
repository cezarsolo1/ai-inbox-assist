-- Export all data from current database
-- Run these queries in your current Supabase SQL Editor to export data

-- Export user_roles
COPY (SELECT * FROM public.user_roles) TO '/tmp/user_roles.csv' WITH (FORMAT CSV, HEADER);

-- Export tenants  
COPY (SELECT * FROM public.tenants) TO '/tmp/tenants.csv' WITH (FORMAT CSV, HEADER);

-- Export email_threads
COPY (SELECT * FROM public.email_threads) TO '/tmp/email_threads.csv' WITH (FORMAT CSV, HEADER);

-- Export email_messages
COPY (SELECT * FROM public.email_messages) TO '/tmp/email_messages.csv' WITH (FORMAT CSV, HEADER);

-- Export inbox_messages
COPY (SELECT * FROM public.inbox_messages) TO '/tmp/inbox_messages.csv' WITH (FORMAT CSV, HEADER);

-- Export outbound_messages
COPY (SELECT * FROM public.outbound_messages) TO '/tmp/outbound_messages.csv' WITH (FORMAT CSV, HEADER);

-- Export tickets
COPY (SELECT * FROM public.tickets) TO '/tmp/tickets.csv' WITH (FORMAT CSV, HEADER);

-- Alternative: Use these SELECT queries to copy data manually
-- SELECT * FROM public.user_roles;
-- SELECT * FROM public.tenants;
-- SELECT * FROM public.email_threads;
-- SELECT * FROM public.email_messages;
-- SELECT * FROM public.inbox_messages;
-- SELECT * FROM public.outbound_messages;
-- SELECT * FROM public.tickets;