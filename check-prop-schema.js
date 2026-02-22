
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        env[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProperties() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Columns in properties table:', Object.keys(data[0]));
    console.log('Sample row:', data[0]);
}

checkProperties();
