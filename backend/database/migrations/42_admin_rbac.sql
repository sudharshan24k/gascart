-- =============================================
-- 42_admin_rbac.sql
-- Admin Role-Based Access Control (RBAC)
-- =============================================

-- 1. Add admin_permissions column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS admin_permissions TEXT[] DEFAULT '{}'::TEXT[];

-- 2. Helper function to check permissions
-- 'super_admin' permission acts as a global override
CREATE OR REPLACE FUNCTION public.has_admin_permission(required_permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'admin' 
        AND (required_permission = ANY(admin_permissions) OR 'super_admin' = ANY(admin_permissions))
    );
$$;

-- 3. Update Policy for Products to use RBAC
DROP POLICY IF EXISTS "Admins can manage products" ON public.products;
CREATE POLICY "Admins can manage products" 
    ON public.products FOR ALL 
    USING (public.has_admin_permission('manage_products'));

-- 4. Update Policy for Categories to use RBAC
DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories" 
    ON public.categories FOR ALL 
    USING (public.has_admin_permission('manage_products'));

-- 5. Update Policy for Careers to use RBAC
DROP POLICY IF EXISTS "Admins can full manage career applications" ON public.career_applications;
CREATE POLICY "Admins can full manage career applications" 
    ON public.career_applications FOR ALL 
    USING (public.has_admin_permission('manage_careers'));

-- 6. Update Policy for Profiles to use RBAC
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (
        id = auth.uid() OR 
        public.has_admin_permission('manage_users') OR 
        public.has_admin_permission('manage_admins')
    );

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" 
    ON public.profiles FOR UPDATE 
    USING (
        id = auth.uid() OR 
        public.has_admin_permission('manage_users') OR 
        public.has_admin_permission('manage_admins')
    );
