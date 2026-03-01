-- Migration 40: Audit Logs table
-- Stores all significant actions for traceability (login, create, update, delete, etc.)

CREATE TABLE IF NOT EXISTS audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Who did it
    actor_id        UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_email     TEXT,               -- denormalized so it survives user deletion
    actor_role      TEXT,               -- 'admin', 'user', 'vendor', 'consultant' etc.

    -- What happened
    action          TEXT NOT NULL,      -- 'LOGIN', 'CREATE', 'UPDATE', 'DELETE', 'STATUS_CHANGE', 'ASSIGN', 'UPLOAD', 'EXPORT'
    entity_type     TEXT,               -- 'product', 'category', 'consultant', 'user', 'document', 'rfq', 'inquiry', 'order' ...
    entity_id       TEXT,               -- the ID of the affected record
    entity_label    TEXT,               -- human readable, e.g. "Biogas Valve Kit"

    -- Detail
    description     TEXT NOT NULL,      -- plain-English summary, e.g. "Admin deleted product 'Biogas Valve Kit'"
    metadata        JSONB DEFAULT '{}', -- optional extra detail (before/after values, IP, etc.)

    -- Where from
    ip_address      TEXT,
    user_agent      TEXT
);

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id     ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action       ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type  ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at   ON audit_logs(created_at DESC);

-- RLS: only admins can read; backend service role can write
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read audit logs"
    ON audit_logs FOR SELECT
    USING (
        (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    );

-- Backend writes via service role (bypasses RLS), so no INSERT policy needed for authenticated users.
