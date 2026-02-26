import { supabase } from '../config/supabase';

export interface AuditLogParams {
    adminId?: string;
    action: string;
    targetType: string;
    targetId?: string;
    details?: any;
    status?: 'success' | 'failure' | 'updated' | 'optimal';
}

export const logAdminAction = async ({
    adminId,
    action,
    targetType,
    targetId,
    details = {},
    status = 'success'
}: AuditLogParams) => {
    try {
        const { error } = await supabase
            .from('admin_audit_logs')
            .insert([{
                admin_id: adminId,
                action,
                target_type: targetType,
                target_id: targetId,
                details,
                status
            }]);

        if (error) {
            console.error('[AuditService] Failed to log action:', error.message);
        }
    } catch (err) {
        console.error('[AuditService] Logging error:', err);
    }
};
