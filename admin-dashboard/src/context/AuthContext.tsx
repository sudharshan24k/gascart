import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isSuperAdmin: boolean;
    permissions: string[];
    loading: boolean;
    userProfile: any | null;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    isAdmin: false,
    isSuperAdmin: false,
    permissions: [],
    loading: true,
    userProfile: null,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [isSuperAdmin, setIsSuperAdmin] = useState(false);
    const [permissions, setPermissions] = useState<string[]>([]);
    const [userProfile, setUserProfile] = useState<any | null>(null);

    useEffect(() => {
        const fetchAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const isHardcodedAdmin = localStorage.getItem('admin_logged_in') === 'true';

            if (isHardcodedAdmin) {
                setIsAuthenticated(true);
                setIsAdmin(true);
                setIsSuperAdmin(true);
                setPermissions(['super_admin']); // Super admin has all permissions implicitly
                setLoading(false);
                return;
            }

            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile?.account_status === 'banned' || profile?.account_status === 'deactivated') {
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                } else if (profile?.role === 'admin') {
                    setIsAuthenticated(true);
                    setIsAdmin(true);
                    setUserProfile(profile);

                    const perms = profile?.admin_permissions || [];
                    setPermissions(perms);
                    setIsSuperAdmin(perms.includes('super_admin'));
                } else {
                    await supabase.auth.signOut();
                    setIsAuthenticated(false);
                }
            } else {
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        fetchAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
            fetchAuth();
        });

        return () => subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, isAdmin, isSuperAdmin, permissions, loading, userProfile }}>
            {children}
        </AuthContext.Provider>
    );
};
