
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Basic env parser for .env.local
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFetch() {
  console.log('Fetching properties...');
  const { data, error, count } = await supabase
    .from('properties')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching properties:', error);
    return;
  }

  console.log('Total properties:', count);
  console.log('First property:', data[0] ? data[0].titulo : 'None');

  const { data: ventaData, count: ventaCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('operacion', 'venta');

  console.log('Total properties in venta:', ventaCount);
}

testFetch();
