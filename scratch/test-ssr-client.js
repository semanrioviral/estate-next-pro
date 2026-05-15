const { createServerClient } = require('@supabase/ssr');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
        cookies: {
            getAll() { return [] },
            setAll() { },
        },
    }
);

async function testSSRClient() {
    console.log('--- Testing @supabase/ssr Client ---');
    const { data, error } = await supabase
        .from('properties')
        .select('id, titulo')
        .limit(5);

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} properties with @supabase/ssr client.`);
    }
}

testSSRClient();
