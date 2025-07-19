-- Assign admin role to all existing users who don't have it
INSERT INTO public.user_roles (user_id, role, assigned_at)
SELECT p.user_id, 'admin'::app_role, now()
FROM public.profiles p
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = p.user_id AND ur.role = 'admin'::app_role
);

-- Update the trigger function to assign both 'user' and 'admin' roles by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
    INSERT INTO public.profiles (user_id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    
    -- Assign default 'user' role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    -- Assign 'admin' role by default
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin');
    
    RETURN NEW;
END;
$function$;