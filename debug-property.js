
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProperty() {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', 'propiedad-de-prueba-consistencia-101')
        .single();

    if (error) {
        console.error('Error fetching property:', error);
        return;
    }

    console.log('--- RAW PROPERTY DATA ---');
    console.log(JSON.stringify(data, null, 2));
}

checkProperty();
