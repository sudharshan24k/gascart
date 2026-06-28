const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:Vsk2409%402004@db.csycozofjlggasgzrpzn.supabase.co:5432/postgres'
});

async function run() {
  const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'career_applications'");
  console.log(res.rows);
  const constraintRes = await pool.query("SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'career_applications_category_check'");
  console.log(constraintRes.rows);
  pool.end();
}
run();
