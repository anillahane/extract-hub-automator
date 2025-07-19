-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    assigned_by UUID REFERENCES auth.users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table for additional user info
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name TEXT,
    email TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create permissions table for granular access control
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL
);

-- Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
('query_run', 'Execute queries and jobs', 'execution'),
('query_schedule', 'Schedule jobs for future execution', 'scheduling'),
('job_create', 'Create new jobs', 'jobs'),
('job_edit', 'Edit existing jobs', 'jobs'),
('job_delete', 'Delete jobs', 'jobs'),
('credential_manage', 'Manage database credentials', 'credentials'),
('output_download', 'Download job execution outputs', 'outputs'),
('user_manage', 'Manage users (admin only)', 'administration'),
('role_assign', 'Assign roles to users (admin only)', 'administration');

-- Create role_permissions table
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role app_role NOT NULL,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    UNIQUE (role, permission_id)
);

-- Insert default role permissions
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions 
WHERE name IN ('query_run', 'query_schedule', 'job_create', 'job_edit', 'credential_manage', 'output_download');

INSERT INTO public.role_permissions (role, permission_id)
SELECT 'user', id FROM public.permissions 
WHERE name IN ('query_run', 'output_download');

-- Security definer function to check if user has a role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
        AND role = _role
    )
$$;

-- Security definer function to check if user has a permission
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role = rp.role
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = _user_id
        AND p.name = _permission
    )
$$;

-- Security definer function to get user roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id UUID)
RETURNS TABLE(role app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
    SELECT ur.role
    FROM public.user_roles ur
    WHERE ur.user_id = _user_id
$$;

-- RLS Policies for user_roles
CREATE POLICY "Admins can manage all user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for profiles
CREATE POLICY "Admins can manage all profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- RLS Policies for permissions (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view permissions"
ON public.permissions
FOR SELECT
TO authenticated
USING (true);

-- RLS Policies for role_permissions (read-only for all authenticated users)
CREATE POLICY "All authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
TO authenticated
USING (true);

-- Update existing jobs RLS policies to include permission checks
DROP POLICY "Users can create their own jobs" ON public.jobs;
DROP POLICY "Users can update their own jobs" ON public.jobs;
DROP POLICY "Users can delete their own jobs" ON public.jobs;

CREATE POLICY "Users can create jobs if they have permission"
ON public.jobs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_permission(auth.uid(), 'job_create'));

CREATE POLICY "Users can update their own jobs if they have permission"
ON public.jobs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND public.has_permission(auth.uid(), 'job_edit'));

CREATE POLICY "Users can delete their own jobs if they have permission"
ON public.jobs
FOR DELETE
TO authenticated
USING (auth.uid() = user_id AND public.has_permission(auth.uid(), 'job_delete'));

-- Update existing credentials RLS policies
DROP POLICY "Users can create their own credentials" ON public.credentials;

CREATE POLICY "Users can create credentials if they have permission"
ON public.credentials
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id AND public.has_permission(auth.uid(), 'credential_manage'));

-- Function to auto-create profile on user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
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
    
    RETURN NEW;
END;
$$;

-- Trigger to create profile and assign role on user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();