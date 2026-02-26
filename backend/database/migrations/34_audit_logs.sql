-- =============================================
-- 34_audit_logs.sql
-- Create admin_audit_logs table to track administrative actions
-- =============================================

CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    admin_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL, -- e.g., 'product', 'category', 'inventory'
    target_id TEXT, -- ID of the affected resource
    details JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'success' -- 'success', 'failure', 'updated', 'optimal'
);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for admin
CREATE POLICY "Admins can view all audit logs"
    ON public.admin_audit_logs
    FOR SELECT
    TO authenticated
    USING (true); -- Assuming only admins have access to the dashboard for now

CREATE POLICY "Admins can insert audit logs"
    ON public.admin_audit_logs
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Indices for faster lookups
CREATE INDEX idx_audit_logs_target ON public.admin_audit_logs(target_type, target_id);
CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
