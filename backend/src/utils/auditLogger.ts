import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import { Request } from 'express';

export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'STATUS_CHANGE'
    | 'ASSIGN'
    | 'UPLOAD'
    | 'EXPORT'
    | 'DOWNLOAD'
    | 'VIEW';

export type AuditEntity =
    | 'product'
    | 'category'
    | 'consultant'
    | 'user'
    | 'document'
    | 'rfq'
    | 'inquiry'
    | 'order'
    | 'vendor'
    | 'article'
    | 'media'
    | 'inventory'
    | 'system';

interface AuditLogEntry {
    actor_id?: string;
    actor_email?: string;
    actor_role?: string;
    action: AuditAction;
    entity_type?: AuditEntity;
    entity_id?: string;
    entity_label?: string;
    description: string;
    metadata?: Record<string, any>;
    ip_address?: string;
    user_agent?: string;
}

/**
 * Write a single audit log entry to the database.
 * Uses the service key so it bypasses RLS.
 * Failure is non-fatal — errors are only console-logged.
 */
export const writeAuditLog = async (entry: AuditLogEntry): Promise<void> => {
    try {
        const { error } = await supabase
            .from('audit_logs')
            .insert([entry]);

        if (error) {
            console.error('[AuditLog] Failed to write log:', error.message);
        }
    } catch (err: any) {
        console.error('[AuditLog] Unexpected error:', err.message);
    }
};

/**
 * Convenience helper — extracts actor info from req.user automatically.
 */
export const logAction = async (
    req: Request | AuthRequest,
    action: AuditAction,
    description: string,
    opts?: {
        entity_type?: AuditEntity;
        entity_id?: string;
        entity_label?: string;
        metadata?: Record<string, any>;
    }
): Promise<void> => {
    const user = (req as AuthRequest).user;

    await writeAuditLog({
        actor_id: user?.id,
        actor_email: user?.email,
        actor_role: user?.role,
        action,
        description,
        entity_type: opts?.entity_type,
        entity_id: opts?.entity_id,
        entity_label: opts?.entity_label,
        metadata: opts?.metadata,
        ip_address: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress,
        user_agent: req.headers['user-agent'],
    });
};
