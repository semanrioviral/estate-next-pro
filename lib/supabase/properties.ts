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
        console.log('---------------------------------------------------------');
        console.log('[DB] INICIANDO CREACIÓN DE PROPIEDAD:', propertyData.titulo);
        console.log('[DB] URLs de imágenes recibidas:', imageUrls.length);
        console.log('[DB] Detalle URLs:', imageUrls);

        // 1. Insertar propiedad en tabla 'properties'
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
            console.error('[DB] ERROR CRÍTICO al insertar propiedad:', propError.message);
            throw new Error(`Error base de datos (propiedad): ${propError.message}`);
        }

        if (!property || !property.id) {
            console.error('[DB] ERROR: La propiedad se insertó pero no se devolvió el ID');
            throw new Error('No se pudo obtener el ID de la propiedad creada.');
        }

        propertyId = property.id;
        console.log('[DB] Propiedad creada exitosamente. ID:', propertyId);

        // 2. Insertar fotos en tabla 'property_images'
        if (imageUrls && imageUrls.length > 0) {
            console.log(`[DB] Preparando inserción de ${imageUrls.length} imágenes en 'property_images'...`);

            const imagesToInsert = imageUrls.map((url) => ({
                property_id: propertyId,
                url: url // El esquema usa 'url', no 'image_url' ni 'order'
            }));

            const { data: imgData, error: imgError } = await supabase
                .from('property_images')
                .insert(imagesToInsert)
                .select();

            if (imgError) {
                console.error('[DB] ERROR CRÍTICO al insertar imágenes:', imgError.message);

                // ROLLBACK: Si fallan las imágenes, eliminamos la propiedad para mantener integridad
                console.warn(`[DB] REALIZANDO ROLLBACK: Eliminando propiedad ID ${propertyId} por fallo en imágenes.`);
                const { error: rollbackError } = await supabase
                    .from('properties')
                    .delete()
                    .eq('id', propertyId);

                if (rollbackError) {
                    console.error('[DB] ERROR ADICIONAL en rollback:', rollbackError.message);
                }

                throw new Error(`Error al persistir galería de imágenes: ${imgError.message}. Se canceló la creación.`);
            }

            console.log(`[DB] ÉXITO: Se insertaron ${imgData?.length || 0} registros en 'property_images'.`);
        } else {
            console.warn('[DB] ADVERTENCIA: No se recibieron URLs de imágenes para insertar en la galería.');
        }

        console.log('[DB] FLUJO FINALIZADO CORRECTAMENTE');
        console.log('---------------------------------------------------------');

        return { data: property };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN capturada en createProperty:', err.message);
        return { error: err.message || 'Error desconocido al crear la propiedad.' };
    }
}


