import { createClient } from '../supabase-server';
import { PROPERTY_SELECT_FIELDS } from './select-fields';

export type Property = {
    id: string;
    titulo: string;
    descripcion: string;
    descripcion_corta?: string;
    direccion?: string;
    ciudad: string;
    barrio: string;
    precio: number;
    negociable?: boolean;
    estado?: string;
    tipo: 'casa' | 'apartamento' | 'lote' | 'comercial' | 'proyecto';
    habitaciones: number;
    baños: number;
    area_m2: number;
    medidas_lote?: string;
    tipo_uso?: string;
    servicios?: string[];
    financiamiento?: string;
    imagen_principal: string;
    slug: string;
    destacado: boolean;
    meta_titulo?: string;
    meta_descripcion?: string;
    canonical?: string;
    etiquetas?: string[];
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
            .select(PROPERTY_SELECT_FIELDS)
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
            .select(PROPERTY_SELECT_FIELDS)
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
            .select(PROPERTY_SELECT_FIELDS)
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
            .select(PROPERTY_SELECT_FIELDS)
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

export async function getPropertyById(id: string): Promise<Property | null> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS)
            .eq('id', id)
            .single();

        if (error || !data) {
            console.error('Error fetching property by ID:', error);
            return null;
        }

        return mapProperty(data);
    } catch (err) {
        console.error('Critical exception in getPropertyById:', err);
        return null;
    }
}

export async function getFeaturedProperties(limit = 3): Promise<Property[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS)
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
                .select(PROPERTY_SELECT_FIELDS)
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

        // 1. Insertar propiedad en tabla 'properties'
        const { data: property, error: propError } = await supabase
            .from('properties')
            .insert([
                {
                    ...propertyData,
                    imagen_principal: imageUrls[0] || '',
                    servicios: propertyData.servicios || [],
                    etiquetas: propertyData.etiquetas || [],
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

export async function deleteProperty(id: string) {
    const supabase = await createClient();
    try {
        console.log('[DB] INICIANDO ELIMINACIÓN DE PROPIEDAD ID:', id);

        // El esquema tiene ON DELETE CASCADE en property_images referenciando properties(id)
        // Por lo tanto, borrar de 'properties' debería limpiar automáticamente 'property_images'
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[DB] ERROR al eliminar propiedad:', error.message);
            return { error: error.message };
        }

        console.log('[DB] Propiedad eliminada exitosamente');
        return { success: true };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN en deleteProperty:', err.message);
        return { error: err.message || 'Error desconocido al eliminar la propiedad.' };
    }
}

export async function updateProperty(
    id: string,
    propertyData: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at' | 'galeria'>>,
    imageUrls: string[]
) {
    const supabase = await createClient();
    try {
        console.log('---------------------------------------------------------');
        console.log('[DB] INICIANDO ACTUALIZACIÓN DE PROPIEDAD ID:', id);

        // 1. Actualizar datos básicos en tabla 'properties'
        const updatePayload = {
            ...propertyData,
            imagen_principal: imageUrls[0] || '',
            servicios: propertyData.servicios || [],
            etiquetas: propertyData.etiquetas || [],
        };

        const { error: propError } = await supabase
            .from('properties')
            .update(updatePayload)
            .eq('id', id);

        if (propError) {
            console.error('[DB] ERROR al actualizar propiedad:', propError.message);
            return { error: propError.message };
        }

        // 2. Sincronizar galería de imágenes
        // Borramos las existentes e insertamos las nuevas (estrategia simple de reemplazo total)
        console.log('[DB] Sincronizando galería de imágenes...');
        const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('property_id', id);

        if (deleteError) {
            console.error('[DB] ERROR al limpiar galería antigua:', deleteError.message);
            // No lanzamos error aquí, intentamos insertar las nuevas de todos modos
        }

        if (imageUrls.length > 0) {
            const imagesToInsert = imageUrls.map((url) => ({
                property_id: id,
                url: url
            }));

            const { error: imgError } = await supabase
                .from('property_images')
                .insert(imagesToInsert);

            if (imgError) {
                console.error('[DB] ERROR al insertar nueva galería:', imgError.message);
                return { error: `Propiedad actualizada, pero falló la galería: ${imgError.message}` };
            }
        }

        console.log('[DB] ACTUALIZACIÓN FINALIZADA CON ÉXITO');
        console.log('---------------------------------------------------------');
        return { success: true };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN en updateProperty:', err.message);
        return { error: err.message || 'Error desconocido al actualizar la propiedad.' };
    }
}


