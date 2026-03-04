const { Client } = require('pg');
require('dotenv').config();

async function run() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const sql = `
            DROP POLICY IF EXISTS "Admin Manage Products Bucket" ON storage.objects;
            DROP POLICY IF EXISTS "Admins can manage all storage objects" ON storage.objects;

            CREATE POLICY "Admins can manage all storage objects"
            ON storage.objects FOR ALL
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('superadmin', 'mini admin', 'admin')
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles 
                    WHERE id = auth.uid() AND role IN ('superadmin', 'mini admin', 'admin')
                )
            );
        `;
        await client.query(sql);
        console.log('Migration applied successfully.');
    } catch (err) {
        console.error('Migration failed:', err.message);
    } finally {
        await client.end();
    }
}

run();
