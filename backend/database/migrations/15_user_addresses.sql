-- =============================================
-- 15_user_addresses.sql
-- Saved addresses for streamlined checkout
-- =============================================

CREATE TABLE IF NOT EXISTS public.user_addresses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Address Category
    type TEXT DEFAULT 'shipping' CHECK (type IN ('shipping', 'billing', 'both')),
    is_default BOOLEAN DEFAULT false,
    label TEXT, -- e.g., 'Home', 'Office'
    
    -- Address Details
    full_name TEXT NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT DEFAULT 'India',
    phone TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.user_addresses(user_id);

-- RLS
ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Users can manage their own addresses
CREATE POLICY "Users can view own addresses" 
    ON public.user_addresses FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own addresses" 
    ON public.user_addresses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own addresses" 
    ON public.user_addresses FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own addresses" 
    ON public.user_addresses FOR DELETE 
    USING (auth.uid() = user_id);

-- Helper function to handle default address logic
-- When one address is set to default, others for that user should be unset
CREATE OR REPLACE FUNCTION handle_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default THEN
        UPDATE public.user_addresses
        SET is_default = false
        WHERE user_id = NEW.user_id AND id <> NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_default_address
BEFORE INSERT OR UPDATE OF is_default ON public.user_addresses
FOR EACH ROW
WHEN (NEW.is_default = true)
EXECUTE FUNCTION handle_default_address();
