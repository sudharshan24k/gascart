import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        if (id.includes('react')) return 'vendor-react';
                        if (id.includes('@supabase/supabase-js')) return 'vendor-supabase';
                        if (id.includes('lucide-react')) return 'vendor-lucide';
                        if (id.includes('framer-motion')) return 'vendor-framer-motion';
                        return 'vendor';
                    }
                }
            }
        }
    }
})
