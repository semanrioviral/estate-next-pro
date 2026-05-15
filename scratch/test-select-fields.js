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

async function testSelectFields() {
    console.log('--- Testing Property Select Fields ---');
    const { data, error } = await supabase
        .from('properties')
        .select(PROPERTY_SELECT_FIELDS)
        .limit(1);

    if (error) {
        console.error('Error:', error.message);
        console.error('Hint:', error.hint);
        console.error('Details:', error.details);
    } else {
        console.log('Success! Data retrieved.');
        console.log('Sample data:', JSON.stringify(data[0], null, 2));
    }
}

testSelectFields();
