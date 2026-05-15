const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCities() {
    console.log('--- Checking Cities in Database ---');
    const { data, error } = await supabase
        .from('properties')
        .select('ciudad')
        .not('ciudad', 'is', null);

    if (error) {
        console.error('Error:', error.message);
    } else {
        const cities = [...new Set(data.map(p => p.ciudad))];
        console.log('Cities found:', cities);
    }
}

checkCities();
