/**
 * Database Migration Runner
 * Runs SQL migration files in order against Supabase PostgreSQL database
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const migrationsDir = path.join(__dirname, 'migrations');

async function runMigrations() {
    const client = await pool.connect();

    try {
        // Get all SQL files sorted by name
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        console.log('\n🚀 Starting database migrations...\n');
        console.log(`Found ${files.length} migration files\n`);

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            console.log(`📄 Running: ${file}`);

            try {
                await client.query(sql);
                console.log(`   ✅ Success\n`);
            } catch (err) {
                // Check if it's a "already exists" error - these are okay
                if (err.message.includes('already exists') || err.code === '42P07') {
                    console.log(`   ⚠️  Skipped (already exists)\n`);
                } else {
                    console.error(`   ❌ Error: ${err.message}\n`);
                    // Continue with other migrations instead of stopping
                }
            }
        }

        console.log('🎉 Migration complete!\n');

    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch(console.error);
