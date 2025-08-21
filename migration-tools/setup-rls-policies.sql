-- Row Level Security policies for new Supabase project
-- Run after creating tables and functions

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- User roles policies
CREATE POLICY "Users can view their own roles" ON public.user_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all roles" ON public.user_roles
    FOR ALL USING ((auth.jwt() ->> 'role'::text) = 'service_role'::text);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
    FOR ALL USING (EXISTS (
        SELECT 1 FROM user_roles ur
        WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::user_role
    ));

-- Tenants policies
CREATE POLICY "Allow anon to read tenants" ON public.tenants
    FOR SELECT USING (true);

-- Email threads policies
CREATE POLICY "Allow public read access to email threads" ON public.email_threads
    FOR SELECT USING (true);

CREATE POLICY "Service role can insert threads" ON public.email_threads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update threads" ON public.email_threads
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete threads" ON public.email_threads
    FOR DELETE USING (true);

-- Email messages policies
CREATE POLICY "Allow public read access to email messages" ON public.email_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow public update of seen status on email messages" ON public.email_messages
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can insert messages" ON public.email_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update messages" ON public.email_messages
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete messages" ON public.email_messages
    FOR DELETE USING (true);

-- Inbox messages policies
CREATE POLICY "Allow public read access to inbox messages" ON public.inbox_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow public update of seen status on inbox messages" ON public.inbox_messages
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can insert messages" ON public.inbox_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update messages" ON public.inbox_messages
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Service role can delete messages" ON public.inbox_messages
    FOR DELETE USING (true);

CREATE POLICY "Authenticated users can delete inbox messages" ON public.inbox_messages
    FOR DELETE USING (true);

-- Outbound messages policies
CREATE POLICY "Allow public read access to outbound messages" ON public.outbound_messages
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert outbound messages" ON public.outbound_messages
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update outbound messages" ON public.outbound_messages
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can delete outbound messages" ON public.outbound_messages
    FOR DELETE USING (true);

-- Tickets policies
CREATE POLICY "Allow public read access to tickets" ON public.tickets
    FOR SELECT USING (true);

CREATE POLICY "Tenants can create their own tickets" ON public.tickets
    FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Tenants can update their own tickets" ON public.tickets
    FOR UPDATE USING (auth.uid() = tenant_id);