-- Create function to get users with their roles for admin management
CREATE OR REPLACE FUNCTION public.get_users_with_roles()
RETURNS TABLE (
    id UUID,
    email TEXT,
    role user_role,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;