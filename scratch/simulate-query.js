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
    precio,
    ciudad,
    barrio,
    tipo,
    operacion,
    habitaciones,
    banos,
    area_construida,
    created_at,
    slug
`;

async function simulateGetPropertiesByOperacion() {
    console.log('--- Simulating getPropertiesByOperacion("venta") ---');
    
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
    
    if (data.length > 0) {
        const propertyIds = data.map(p => p.id);
        console.log('Property IDs:', propertyIds);

        const { data: imagesData, error: imagesError } = await supabase
            .from('property_images')
            .select('property_id, url')
            .in('property_id', propertyIds)
            .order('orden', { ascending: true });

        if (imagesError) {
            console.error('Error fetching images:', imagesError.message);
        } else {
            console.log(`Found ${imagesData.length} images`);
            const properties = data.map(property => {
                const propertyImages = imagesData?.filter(img => img.property_id === property.id) || [];
                return {
                    ...property,
                    galeria: propertyImages.map(img => img.url)
                };
            });
            console.log('First property with images:', JSON.stringify(properties[0], null, 2));
        }
    }
}

simulateGetPropertiesByOperacion();
