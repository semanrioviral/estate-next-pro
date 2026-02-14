// lib/supabase/properties.ts

import { createClient } from '../supabase-server';

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
    // Intenta extraer imágenes de múltiples posibles nombres de relación
    const rawImages = prop.property_images || prop.property_image || [];
    const galeria = Array.isArray(rawImages) ? rawImages.map((img: any) => img.url) : [];

    // Log diagnóstico si no hay galería pero sí id
    if (galeria.length === 0 && prop.id) {
        // console.log(`[DEBUG] Propiedad ${prop.slug} sin imágenes en tabla relacionada.`);
    }

    return {
        ...prop,
        galeria
    };
}

export async function getProperties(): Promise<Property[]> {
    try {
        const supabase = await createClient();
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

        return (data || []).map(mapProperty) as Property[];
    } catch (err) {
        console.error('Critical exception in getProperties:', err);
        return [];
    }
}

export async function getPropertiesByCity(city: string): Promise<Property[]> {
    try {
        const supabase = await createClient();
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

        return (data || []).map(mapProperty) as Property[];
    } catch (err) {
        console.error('Critical exception in getPropertiesByCity:', err);
        return [];
    }
}

export async function getPropertiesByTypeAndCity(tipo: string, city: string): Promise<Property[]> {
    try {
        const supabase = await createClient();
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

        return (data || []).map(mapProperty) as Property[];
    } catch (err) {
        console.error('Critical exception in getPropertiesByTypeAndCity:', err);
        return [];
    }
}

export async function getPropertyBySlug(slug: string): Promise<Property | null> {
    try {
        const supabase = await createClient();
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
    } catch (err) {
        console.error('Critical exception in getPropertyBySlug:', err);
        return null;
    }
}

export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
    try {
        const supabase = await createClient();
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

            return (recentData || []).map(mapProperty);
        }

        return (data || []).map(mapProperty);
    } catch (err) {
        console.error('Critical exception in getFeaturedProperties:', err);
        return [];
    }
}

export async function createProperty(
    propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'galeria'>,
    imageUrls: string[]
) {
    const supabase = await createClient();
    let propertyId: string | null = null;

    try {
        console.log('[DB] Iniciando creación de propiedad:', propertyData.titulo);
        console.log('[DB] URLs de imágenes recibidas:', imageUrls);

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
            console.error('[DB] Error al insertar propiedad:', propError);
            throw new Error(`Error base de datos (propiedad): ${propError.message}`);
        }

        propertyId = property.id;
        console.log('[DB] Propiedad creada con ID:', propertyId);

        // 2. Insert images
        if (imageUrls.length > 0) {
            console.log('[DB] Insertando', imageUrls.length, 'imágenes...');

            const imagesToInsert = imageUrls.map((url) => ({
                property_id: propertyId,
                url: url,
                // El campo 'orden' ha sido eliminado por no existir en el esquema actual
            }));

            const { data: imgData, error: imgError } = await supabase
                .from('property_images')
                .insert(imagesToInsert)
                .select();

            if (imgError) {
                console.error('[DB] Error al insertar imágenes:', imgError);

                // ROLLBACK MANUAL: Eliminar la propiedad creada si las imágenes fallan
                console.warn('[DB] Iniciando rollback manual para propiedad ID:', propertyId);
                await supabase.from('properties').delete().eq('id', propertyId);

                throw new Error(`Error base de datos (imágenes): ${imgError.message}`);
            }

            console.log('[DB] Imágenes insertadas exitosamente:', imgData?.length);
        }

        return { data: property };
    } catch (err: any) {
        console.error('[DB] Excepción crítica en createProperty:', err);
        return { error: err.message || 'Error desconocido al crear la propiedad.' };
    }
}


