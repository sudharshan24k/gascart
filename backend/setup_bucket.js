require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketNames = buckets?.map(b => b.name) || [];
  console.log("Current buckets:", bucketNames);
  
  if (!bucketNames.includes('products')) {
    console.log("Creating 'products' bucket...");
    const { error } = await supabase.storage.createBucket('products', { public: true });
    if (error) console.error("Error creating bucket:", error);
    else console.log("Created 'products' bucket.");
  }
}
run();
