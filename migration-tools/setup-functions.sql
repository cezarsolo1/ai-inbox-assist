-- Custom functions for new Supabase project
-- Run after creating tables

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS user_role
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT role FROM public.user_roles 
    WHERE user_id = user_uuid 
    LIMIT 1;
$function$;

-- Function to check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role user_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- Function to set user role (admin only)
CREATE OR REPLACE FUNCTION public.set_user_role(user_uuid uuid, new_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can set user roles';
    END IF;
    
    -- Insert or update user role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (user_uuid, new_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Remove other roles for this user
    DELETE FROM public.user_roles 
    WHERE user_id = user_uuid 
    AND role != new_role;
END;
$function$;

-- Function to get users with roles (admin only)
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE(id uuid, email text, role user_role, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Check if caller is admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    ) THEN
        RAISE EXCEPTION 'Only admins can view all users';
    END IF;
    
    -- Return users with their roles
    RETURN QUERY
    SELECT 
        ur.user_id as id,
        COALESCE(au.email, 'Unknown User') as email,
        ur.role,
        ur.created_at
    FROM public.user_roles ur
    LEFT JOIN auth.users au ON au.id = ur.user_id
    ORDER BY ur.created_at DESC;
END;
$function$;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'tenant');
  RETURN new;
END;
$function$;

-- Function to update tickets timestamp
CREATE OR REPLACE FUNCTION public.update_tickets_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Validation functions for updates
CREATE OR REPLACE FUNCTION public.inbox_messages_validate_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- If anon role, only allow changing the 'seen' column
  IF auth.role() = 'anon' THEN
    IF (NEW IS DISTINCT FROM OLD) THEN
      IF (
        NEW.id           IS DISTINCT FROM OLD.id OR
        NEW.channel      IS DISTINCT FROM OLD.channel OR
        NEW.from_msisdn  IS DISTINCT FROM OLD.from_msisdn OR
        NEW.to_msisdn    IS DISTINCT FROM OLD.to_msisdn OR
        NEW.body         IS DISTINCT FROM OLD.body OR
        NEW.profile_name IS DISTINCT FROM OLD.profile_name OR
        NEW.twilio_sid   IS DISTINCT FROM OLD.twilio_sid OR
        NEW.media        IS DISTINCT FROM OLD.media OR
        NEW.raw          IS DISTINCT FROM OLD.raw OR
        NEW.created_at   IS DISTINCT FROM OLD.created_at
      ) THEN
        RAISE EXCEPTION 'Only the seen field can be updated by anon role';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.email_messages_validate_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  IF auth.role() = 'anon' THEN
    IF (NEW IS DISTINCT FROM OLD) THEN
      IF (
        NEW.id          IS DISTINCT FROM OLD.id OR
        NEW.thread_id   IS DISTINCT FROM OLD.thread_id OR
        NEW.direction   IS DISTINCT FROM OLD.direction OR
        NEW.from_email  IS DISTINCT FROM OLD.from_email OR
        NEW.to_email    IS DISTINCT FROM OLD.to_email OR
        NEW.body        IS DISTINCT FROM OLD.body OR
        NEW.attachments IS DISTINCT FROM OLD.attachments OR
        NEW.created_at  IS DISTINCT FROM OLD.created_at
      ) THEN
        RAISE EXCEPTION 'Only the seen field can be updated by anon role';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;