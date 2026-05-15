const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testVenta() {
    console.log('Testing properties by operacion: venta');
    const { data, error, count } = await supabase
        .from('properties')
        .select('id, titulo, operacion, habitaciones', { count: 'exact' })
        .eq('operacion', 'venta')
        .range(0, 11);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Total count:', count);
        console.log('Data length:', data.length);
        console.log('Sample properties:', data.slice(0, 2));
    }
}

testVenta();
