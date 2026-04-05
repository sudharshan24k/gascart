import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    permissions: string[];
    loading: boolean;
    userProfile: any | null;
    refreshAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isAdmin: false,
    isSuperAdmin: false,
    permissions: [],
    loading: true,
    userProfile: null,
    refreshAuth: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [userProfile, setUserProfile] = useState<any | null>(null);

    const refreshAuth = async () => {
        setLoading(true);
        try {
            // Step 1: Try getSession() — fast path, works once Supabase is hydrated
            let { data: { session }, error: sessionError } = await supabase.auth.getSession();
            if (sessionError) throw sessionError;

            // Step 2: If no session yet, try refreshSession() to force hydration from
            // sessionStorage. This fixes the race condition on page load where
            // onAuthStateChange hasn't fired yet.
            if (!session) {
                try {
                    const { data: { session: refreshed } } = await supabase.auth.refreshSession();
                    session = refreshed;
                } catch (_) {
                    // No refresh token available — user is genuinely not logged in
                }
            }

            if (session) {
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profileError) throw profileError;

                if (profile?.account_status === 'banned' || profile?.account_status === 'deactivated') {
                    console.warn('[Auth] Account deactivated');
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                    setUserProfile(null);
                } else if (profile?.role === 'admin') {
                    setIsAuthenticated(true);
                    setIsAdmin(true);
                    setUserProfile(profile);

                    const perms = profile?.admin_permissions || [];
                    setPermissions(perms);
                    setIsSuperAdmin(perms.includes('super_admin'));
                } else {
                    console.warn('[Auth] User is not an admin');
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                    setUserProfile(null);
                }
            } else {
                setIsAuthenticated(false);
                setIsAdmin(false);
                setIsSuperAdmin(false);
                setPermissions([]);
                setUserProfile(null);
            }
        } catch (err) {
            console.error('[Auth] Refresh error:', err);
            setIsAuthenticated(false);
            setIsAdmin(false);
            setUserProfile(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            console.log(`[Auth] State change: ${event}`);
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
                refreshAuth();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // Autologout idle timer
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;
        const INACTIVITY_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

        const performLogout = async () => {
            console.log('Session expired due to inactivity. Logging out...');
            try {
                await supabase.auth.signOut();
            } catch (e) {
                console.warn('Sign out failed during autologout', e);
            }
            setIsAuthenticated(false);
            setIsAdmin(false);
            window.location.href = '/login?reason=inactivity';
        };

        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (isAuthenticated) {
                timeoutId = setTimeout(performLogout, INACTIVITY_LIMIT_MS);
            }
        };

        if (isAuthenticated) {
            resetTimer();

            const activityEvents = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
            activityEvents.forEach(event => {
                window.addEventListener(event, resetTimer);
            });

            return () => {
                if (timeoutId) clearTimeout(timeoutId);
                activityEvents.forEach(event => {
                    window.removeEventListener(event, resetTimer);
                });
            };
        }
    }, [isAuthenticated]);

    return (
        <AuthContext.Provider value={{
            isAuthenticated,
            isAdmin,
            isSuperAdmin,
            permissions,
            loading,
            userProfile,
            refreshAuth
        }}>
            {children}
        </AuthContext.Provider>
    );
};
