-- Migration 51: Update career_applications category constraint to allow O&M categories

ALTER TABLE public.career_applications 
DROP CONSTRAINT IF EXISTS career_applications_category_check;

ALTER TABLE public.career_applications 
ADD CONSTRAINT career_applications_category_check 
CHECK (category IN ('Technicians', 'Officers', 'Entry level management', 'Middle management', 'O&M - CBG', 'O&M - CNG'));
