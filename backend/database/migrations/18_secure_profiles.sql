-- =============================================
-- 18_secure_profiles.sql
-- Security Hardening: Restrict Profile Access
-- Prevents scraping of customer emails
-- =============================================

-- Drop the insecure "allow all" policy
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- 1. Users can view their own profile
CREATE POLICY "Users can view own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- 2. Public can view ACTIVE VENDOR profiles
-- Needed for product listings to show vendor name/company
CREATE POLICY "Public can view active vendors" 
    ON public.profiles FOR SELECT 
    USING (role = 'vendor' AND visibility_status = 'active');

-- 3. Admins can view all profiles (Redundant if "Admins can manage all" exists, but safe to add for explicit SELECT)
-- The "Admins can manage all profiles" policy (USING public.is_admin()) covers ALL operations, so this is optional but good for clarity if that policy is ever modified.
-- We will rely on the existing "Admins can manage all profiles" for admin access.

-- Ensure Admin Policy is strictly correct (re-apply just in case)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" 
    ON public.profiles FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
