const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  // Try using the REST API directly to access the database
  // The service_role key can be used to query the database via REST
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', 'properties')
    .in('column_name', ['año_construccion', 'antigüedad']);
  
  if (error) {
    console.error('Error querying schema:', error.message);
    return;
  }
  
  console.log('EXISTING COLUMNS:', JSON.stringify(data, null, 2));
}

main().catch(err => { console.error('ERROR:', err.message); process.exit(1); });
