const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    const { data, error } = await supabase.from('barrios').select('count', { count: 'exact', head: true });
    if (error) {
        console.error('Error checking barrios table:', error.message);
    } else {
        console.log('Barrios table exists and has rows.');
    }
}

checkTables();
