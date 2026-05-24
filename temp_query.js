const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://uehajzlrvqvirtsubsdq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI'
);
async function main() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = 'properties' ORDER BY ordinal_position"
  });
  if (error) {
    console.log('rpc error:', JSON.stringify(error));
    const { data: d2, error: e2 } = await supabase.from('properties').select('*').limit(1);
    if (e2) console.log('query error:', JSON.stringify(e2));
    else console.log('columns from select:', Object.keys(d2[0]).join('\n'));
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}
main();
