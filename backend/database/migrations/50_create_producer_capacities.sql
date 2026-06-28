-- =============================================
-- 50_create_producer_capacities.sql
-- Database migration for Producer Excess Capacities registry
-- =============================================

CREATE TABLE IF NOT EXISTS public.producer_capacities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    producer_name TEXT NOT NULL,
    capacity NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    spare_capacity NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    location_name TEXT NOT NULL,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_producer_capacities_status ON public.producer_capacities(status);
CREATE INDEX IF NOT EXISTS idx_producer_capacities_created ON public.producer_capacities(created_at DESC);

-- Enable RLS
ALTER TABLE public.producer_capacities ENABLE ROW LEVEL SECURITY;

-- Drop policies if they already exist
DROP POLICY IF EXISTS "Anyone can view approved producer capacities" ON public.producer_capacities;
DROP POLICY IF EXISTS "Anyone can insert producer capacity submissions" ON public.producer_capacities;
DROP POLICY IF EXISTS "Admins can manage all producer capacities" ON public.producer_capacities;

-- RLS Policies
CREATE POLICY "Anyone can view approved producer capacities"
    ON public.producer_capacities FOR SELECT
    USING (status = 'approved' OR EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));

CREATE POLICY "Anyone can insert producer capacity submissions"
    ON public.producer_capacities FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Admins can manage all producer capacities"
    ON public.producer_capacities FOR ALL
    USING (EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    ));
