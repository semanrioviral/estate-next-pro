const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testBarriosTable() {
    console.log('--- Testing Barrios Table ---');
    const { data, error } = await supabase
        .from('barrios')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Columns found:', Object.keys(data[0]));
    }
}

testBarriosTable();
