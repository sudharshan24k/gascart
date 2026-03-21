import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

interface RequirePermissionProps {
    permission?: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
    requireSuperAdmin?: boolean;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({
    permission,
    children,
    fallback = null,
    requireSuperAdmin = false
}) => {
    const { permissions, isSuperAdmin, loading } = useAuth();

    if (loading) return null;

    if (isSuperAdmin) {
        return <>{children}</>;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
        return <>{fallback}</>;
    }

    if (permission && !(permissions || []).includes(permission)) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export const ProtectedRoute: React.FC<{ permission?: string; requireSuperAdmin?: boolean }> = ({ permission, requireSuperAdmin }) => {
    const { isAuthenticated, permissions, isSuperAdmin, loading } = useAuth();

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    if (!isAuthenticated) {
        // Redirect to login with the current path as a redirect parameter
        const currentPath = window.location.pathname;
        const search = window.location.search;
        const fullPath = currentPath + search;
        
        return <Navigate to={`/login?redirect=${encodeURIComponent(fullPath)}`} replace />;
    }

    if (requireSuperAdmin && !isSuperAdmin) {
        return <Navigate to="/" replace />;
    }

    if (permission && !isSuperAdmin && !(permissions || []).includes(permission)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default RequirePermission;
