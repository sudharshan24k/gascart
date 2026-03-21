import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { session, loading } = useAuth();
    const location = useLocation();

    console.log('[ProtectedRoute] Checking access:', {
        pathname: location.pathname,
        loading,
        hasSession: !!session
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-neutral-500 font-medium animate-pulse">Checking authentication...</p>
                </div>
            </div>
        );
    }

    if (!session) {
        const redirectUrl = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
        console.log('[ProtectedRoute] No session, redirecting to:', redirectUrl);
        // Redirect to login but save the current location they were trying to access
        return <Navigate to={redirectUrl} replace />;
    }

    console.log('[ProtectedRoute] Access granted to:', location.pathname);
    return <>{children}</>;
};

export default ProtectedRoute;
