const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role for inspection

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('--- Inspecting Foreign Keys ---');
    
    // We can't easily query information_schema via standard Supabase client without a RPC
    // But we can try to query a property and see if the join works with a simpler select
    const { data, error } = await supabase
        .from('properties')
        .select('id, barrio_id, barrios(id, slug)')
        .limit(1);

    if (error) {
        console.error('Join Error:', error.message);
        console.log('Trying without join...');
        const { data: data2, error: error2 } = await supabase
            .from('properties')
            .select('id, barrio_id')
            .limit(1);
        if (error2) {
            console.error('Basic Select Error:', error2.message);
        } else {
            console.log('Basic select worked. barrio_id is:', data2[0].barrio_id);
        }
    } else {
        console.log('Join worked! Result:', JSON.stringify(data[0], null, 2));
    }
}

inspectSchema();
