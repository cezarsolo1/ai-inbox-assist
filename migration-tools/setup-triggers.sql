-- Triggers for new Supabase project
-- Run after creating tables, functions, and RLS policies

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Trigger for tickets updated_at
CREATE TRIGGER update_tickets_updated_at
    BEFORE UPDATE ON public.tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_tickets_updated_at();

-- Trigger for inbox messages validation
CREATE TRIGGER inbox_messages_validate_update_trigger
    BEFORE UPDATE ON public.inbox_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.inbox_messages_validate_update();

-- Trigger for email messages validation
CREATE TRIGGER email_messages_validate_update_trigger
    BEFORE UPDATE ON public.email_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.email_messages_validate_update();