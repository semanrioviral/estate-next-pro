
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPersistence() {
    const slug = 'test-property-' + Math.random().toString(36).substring(7);
    const imageUrls = ['http://example.com/1.jpg', 'http://example.com/2.jpg', 'http://example.com/3.jpg'];

    console.log('--- TEST: Creando propiedad:', slug);

    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert([{
            titulo: 'Propiedad de Prueba',
            descripcion: 'Prueba de galería',
            ciudad: 'Cúcuta',
            barrio: 'La Riviera',
            precio: 1000000,
            tipo: 'casa',
            slug: slug,
            imagen_principal: imageUrls[0]
        }])
        .select()
        .single();

    if (propError) {
        console.error('Error al crear propiedad:', propError);
        return;
    }

    console.log('Propiedad creada ID:', property.id);

    const imagesToInsert = imageUrls.map(url => ({
        property_id: property.id,
        url: url
    }));

    const { data: imgData, error: imgError } = await supabase
        .from('property_images')
        .insert(imagesToInsert)
        .select();

    if (imgError) {
        console.error('Error al insertar imágenes:', imgError);
        return;
    }

    console.log('Imágenes insertadas:', imgData.length);

    console.log('--- TEST: Recuperando propiedad:', slug);
    const { data: fetched, error: fetchError } = await supabase
        .from('properties')
        .select('*, property_images(url)')
        .eq('slug', slug)
        .single();

    if (fetchError) {
        console.error('Error al recuperar:', fetchError);
        return;
    }

    console.log('Resultado recuperado:');
    console.log('Imagen Principal:', fetched.imagen_principal);
    console.log('Gallery Count:', fetched.property_images?.length);
    console.log('Gallery URLs:', fetched.property_images?.map(i => i.url));

    // Cleanup
    await supabase.from('properties').delete().eq('id', property.id);
    console.log('Cleanup realizado.');
}

testPersistence();
