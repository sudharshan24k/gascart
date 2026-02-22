require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.rpc('get_table_columns_by_name', { table_name: 'consultants' });
  if (error) {
     // fallback to just inserting a bare minimum
     const res = await supabase.from('consultants').insert([{ first_name: 'Test', last_name: 'Test', email: 'x@x.com' }]).select();
     console.log("Fallback insert:", res);
  } else {
     console.log("Columns:", data);
  }
}
run();
