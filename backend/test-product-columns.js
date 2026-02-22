require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data } = await supabase.from('products').select('*').limit(1);
  console.log("Product keys:", Object.keys(data?.[0] || {}));
}
run();
