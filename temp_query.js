const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://uehajzlrvqvirtsubsdq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || (() => { throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada'); })()
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
