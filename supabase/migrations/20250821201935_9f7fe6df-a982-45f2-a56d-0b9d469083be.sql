-- Fix security issue for update_tickets_updated_at function
ALTER FUNCTION public.update_tickets_updated_at() SET search_path = 'public';