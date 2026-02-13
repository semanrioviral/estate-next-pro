import { createClient } from './server';

export type Property = {
    id: string;
    titulo: string;
    descripcion: string;
    ciudad: string;
    barrio: string;
    precio: number;
    tipo: 'casa' | 'apartamento' | 'lote';
    habitaciones: number;
    baños: number;
    area_m2: number;
    imagen_principal: string;
    slug: string;
    destacado: boolean;
    created_at: string;
    updated_at: string;
    galeria: string[];
};

function mapProperty(prop: any): Property {
    return {
        ...prop,
        galeria: prop.property_images?.map((img: any) => img.url) || []
    };
}

export async function getProperties() {
    const supabase = await createClient(false);
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (url)
        `)
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching properties:', error);
        return [];
    }

    return data.map(mapProperty) as Property[];
}

export async function getPropertiesByCity(city: string) {
    const supabase = await createClient(false);
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (url)
        `)
        .eq('ciudad', city)
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching properties by city:', error);
        return [];
    }

    return data.map(mapProperty) as Property[];
}

export async function getPropertiesByTypeAndCity(tipo: string, city: string) {
    const supabase = await createClient(false);
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (url)
        `)
        .eq('tipo', tipo)
        .eq('ciudad', city)
        .order('destacado', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching properties by type and city:', error);
        return [];
    }

    return data.map(mapProperty) as Property[];
}

export async function getPropertyBySlug(slug: string) {
    const supabase = await createClient(false);
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (url)
        `)
        .eq('slug', slug)
        .single();

    if (error || !data) {
        console.error('Error fetching property by slug:', error);
        return null;
    }

    return mapProperty(data);
}

export async function getFeaturedProperties(limit = 3) {
    const supabase = await createClient(false);
    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (url)
        `)
        .eq('destacado', true)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching featured properties:', error);
        return [];
    }

    // If we don't have enough featured properties, get the most recent ones
    if (!data || data.length === 0) {
        const { data: recentData, error: recentError } = await supabase
            .from('properties')
            .select(`
                *,
                property_images (url)
            `)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (recentError) return [];

        return recentData.map(mapProperty);
    }

    return data.map(mapProperty);
}

export async function createProperty(
    propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'galeria'>,
    imageUrls: string[]
) {
    const supabase = await createClient();

    // 1. Insert property
    const { data: property, error: propError } = await supabase
        .from('properties')
        .insert([
            {
                ...propertyData,
                imagen_principal: imageUrls[0] || '',
            }
        ])
        .select()
        .single();

    if (propError) {
        console.error('Error creating property:', propError);
        return { error: propError.message };
    }

    // 2. Insert images
    if (imageUrls.length > 0) {
        const imagesToInsert = imageUrls.map((url, index) => ({
            property_id: property.id,
            url: url,
            orden: index,
        }));

        const { error: imgError } = await supabase
            .from('property_images')
            .insert(imagesToInsert);

        if (imgError) {
            console.error('Error uploading property images:', imgError);
        }
    }

    return { data: property };
}


