const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const PROPERTY_SELECT_FIELDS = `
    id,
    titulo,
    descripcion,
    descripcion_corta,
    direccion,
    ciudad,
    barrio,
    barrio_id,
    barrios(slug),
    precio,
    negociable,
    estado,
    operacion,
    tipo,
    habitaciones,
    baños,
    area_m2,
    medidas_lote,
    tipo_uso,
    servicios,
    financiamiento,
    imagen_principal,
    slug,
    destacado,
    meta_titulo,
    meta_descripcion,
    canonical,
    etiquetas,
    created_at,
    updated_at
`;

async function simulateExactQuery() {
    console.log('--- Simulating EXACT Query Logic ---');
    
    const { data, error, count } = await supabase
        .from('properties')
        .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
        .eq('operacion', 'venta')
        .range(0, 11)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching properties:', error.message);
        return;
    }

    console.log(`Found ${data.length} properties (Total: ${count})`);
}

simulateExactQuery();
