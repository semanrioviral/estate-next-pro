import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
    console.log('Checking for missing columns...');
    
    // Check current columns
    const { data: cols, error: colError } = await supabase
        .rpc('exec_sql', { sql: "SELECT column_name FROM information_schema.columns WHERE table_name = 'properties' AND column_name IN ('año_construccion', 'antigüedad')" });
    
    if (colError) {
        console.log('RPC not available, trying direct approach...');
    } else {
        console.log('Columns found:', cols);
    }
    
    // Try adding columns with raw SQL via Supabase REST API
    console.log('Attempting to add año_construccion...');
    const { error: err1 } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS año_construccion INTEGER;"
    });
    if (err1) console.log('Error adding año_construccion:', err1.message);
    else console.log('? año_construccion added');
    
    console.log('Attempting to add antigüedad...');
    const { error: err2 } = await supabase.rpc('exec_sql', {
        sql: "ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS antigüedad TEXT;"
    });
    if (err2) console.log('Error adding antigüedad:', err2.message);
    else console.log('? antigüedad added');
    
    // Verify
    const { data: verify } = await supabase.rpc('exec_sql', {
        sql: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'properties' AND column_name IN ('año_construccion', 'antigüedad');"
    });
    console.log('Verification:', verify);
}

main().catch(console.error);
