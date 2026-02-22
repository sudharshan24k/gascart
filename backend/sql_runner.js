const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.csycozofjlggasgzrpzn:Vsk2409%402004@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
});

async function run() {
  await client.connect();
  const fs = require('fs');
  const sql = fs.readFileSync('database/migrations/31_consultant_inquiries.sql', 'utf8');
  
  try {
    await client.query(sql);
    console.log("Migration successful");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}
run();
