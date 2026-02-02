-- =============================================
-- 25_update_profiles_trigger.sql
-- Add phone and business_details to profiles
-- Update trigger to copy metadata on signup
-- =============================================

-- 1. Add columns if they don't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS business_details TEXT;

-- 2. Update the trigger function to copy metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id, 
        email, 
        full_name, 
        phone, 
        company_name, 
        business_details
    )
    VALUES (
        new.id, 
        new.email, 
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'phone',
        new.raw_user_meta_data->>'company_name',
        new.raw_user_meta_data->>'business_details'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
