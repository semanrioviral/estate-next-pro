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

async function attachImagesToProperties(props, supabase) {
    if (!props || props.length === 0) return [];
    const propertyIds = props.map(p => p.id).filter(Boolean);
    const { data: images, error } = await supabase
        .from('property_images')
        .select('id, property_id, url, orden, es_principal')
        .in('property_id', propertyIds);

    const imagesByPropId = {};
    if (images) {
        images.forEach(img => {
            if (!imagesByPropId[img.property_id]) imagesByPropId[img.property_id] = [];
            imagesByPropId[img.property_id].push(img);
        });
    }

    return props.map(prop => {
        const rawImages = (imagesByPropId[prop.id] || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));
        return {
            ...prop,
            galeria: rawImages.map(img => img.url),
        };
    });
}

async function testGetProperties() {
    console.log('--- Testing getProperties ---');
    const { data, error, count } = await supabase
        .from('properties')
        .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
        .range(0, 11);

    if (error) {
        console.error('Error:', error.message);
        return;
    }

    const properties = await attachImagesToProperties(data || [], supabase);
    console.log(`Found ${properties.length} properties (Total: ${count})`);
    if (properties.length > 0) {
        console.log('First property:', properties[0].titulo, 'Slug:', properties[0].slug);
    }
}

testGetProperties();
