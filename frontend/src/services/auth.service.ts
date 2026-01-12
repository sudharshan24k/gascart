import { supabase } from './api';

export const authService = {
    signUp: async (email: string, password: string, options?: any) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: options
            }
        });
        if (error) throw error;
        return data;
    },

    signIn: async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        if (error) throw error;
        return data;
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
    },

    getUser: async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    },

    getSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    }
};
