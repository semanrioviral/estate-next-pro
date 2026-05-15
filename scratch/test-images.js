const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testImages() {
    console.log('Testing property_images table');
    const { data, error } = await supabase
        .from('property_images')
        .select('*')
        .limit(5);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data length:', data.length);
        console.log('Sample images:', data);
    }
}

testImages();
