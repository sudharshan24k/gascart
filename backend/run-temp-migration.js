const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
    connectionString: 'postgresql://postgres:Vsk2409%402004@db.csycozofjlggasgzrpzn.supabase.co:5432/postgres'
});

async function run() {
    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'database/migrations/29_vendor_enquiry_documents.sql'), 'utf8');
        await client.query(sql);
        console.log('Migration successful');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

run();
