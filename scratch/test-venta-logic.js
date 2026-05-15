const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// EXACT match of the constants and functions in properties.ts
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

function applyOrder(query, orden) {
    switch (orden) {
        case 'antiguas':
            return query.order('created_at', { ascending: true });
        case 'precio_asc':
            return query.order('precio', { ascending: true });
        case 'precio_desc':
            return query.order('precio', { ascending: false });
        case 'recientes':
        default:
            return query.order('created_at', { ascending: false });
    }
}

async function testVentaPageLogic() {
    console.log('--- Testing Venta Page Logic ---');
    const page = 1;
    const pageSize = 12;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
        .from('properties')
        .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
        .eq('operacion', 'venta');

    query = applyOrder(query, 'recientes');
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`Found ${data.length} properties (Total: ${count})`);
    }
}

testVentaPageLogic();
