const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImageColumns() {
    console.log('--- Testing Property Images Columns ---');
    const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log('Columns found:', Object.keys(data));
        console.log('Sample data:', data);
    }
}

testImageColumns();
