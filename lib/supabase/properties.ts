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
    image_metadata?: GalleryImage[];
};

export interface GalleryImage {
    id?: string;
    url: string;
    orden: number;
    es_principal: boolean;
}

function mapProperty(prop: any): Property {
    // Intenta extraer imágenes de múltiples posibles nombres de relación
    const rawImages = prop.property_images || prop.property_image || [];
    const galeria = Array.isArray(rawImages) ? rawImages.map((img: any) => img.url) : [];
    const image_metadata: GalleryImage[] = Array.isArray(rawImages)
        ? rawImages.map((img: any) => ({
            id: img.id,
            url: img.url,
            orden: img.orden || 0,
            es_principal: img.es_principal || false
        }))
        : [];

    return {
        ...prop,
        galeria,
        image_metadata
    };
}

/**
 * Función interna para adjuntar las imágenes de la tabla property_images
 * a un array de propiedades de forma eficiente (2da consulta desacoplada).
 */
async function attachImagesToProperties(props: any[], supabase: any): Promise<Property[]> {
    if (!props || props.length === 0) return [];

    const propertyIds = props.map(p => p.id).filter(Boolean);
    if (propertyIds.length === 0) {
        return props.map(p => ({
            ...p,
            galeria: [],
            image_metadata: []
        })) as Property[];
    }

    // 1. Obtener imágenes filtrando por IDs de propiedad (SIN order en la query)
    const { data: images, error } = await supabase
        .from('property_images')
        .select('id, property_id, url, orden, es_principal')
        .in('property_id', propertyIds);

    if (error) {
        console.error('[DB] Error fetching images separately:', error.message);
        return props.map(p => ({
            ...p,
            galeria: [],
            image_metadata: []
        })) as Property[];
    }

    // 2. Agrupar imágenes por property_id en memoria
    const imagesByPropId: Record<string, any[]> = {};
    (images || []).forEach((img: any) => {
        if (!imagesByPropId[img.property_id]) {
            imagesByPropId[img.property_id] = [];
        }
        imagesByPropId[img.property_id].push(img);
    });

    // 3. Reconstruir cada objeto Property con ordenamiento manual en memoria
    return props.map(prop => {
        const rawImages = (imagesByPropId[prop.id] || []).sort((a, b) => (a.orden || 0) - (b.orden || 0));

        return {
            ...prop,
            galeria: rawImages.map(img => img.url),
            image_metadata: rawImages.map(img => ({
                id: img.id,
                url: img.url,
                orden: img.orden || 0,
                es_principal: img.es_principal || false
            }))
        } as Property;
    });
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

        // Sincronizar galería usando el helper con el mismo cliente
        return await attachImagesToProperties(data || [], supabase);
    } catch (err: any) {
        console.error('Critical exception in getProperties:', err.message);
        return [];
    }
}

// 1. getPropertiesByCity: Retorna array
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

        return await attachImagesToProperties(data || [], supabase);
    } catch (err: any) {
        console.error('Critical exception in getPropertiesByCity:', err.message);
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

// 2. getPropertyBySlug: Retorna UN objeto (necesita manejo especial de array)
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

        // attachImagesToProperties espera un array, así que envolvemos 'data'
        const propsWithImages = await attachImagesToProperties([data], supabase);
        return propsWithImages[0] || null;
    } catch (err: any) {
        console.error('Critical exception in getPropertyBySlug:', err.message);
        return null;
    }
}

// 3. getPropertyById: Retorna UN objeto
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

        const propsWithImages = await attachImagesToProperties([data], supabase);
        return propsWithImages[0] || null;
    } catch (err: any) {
        console.error('Critical exception in getPropertyById:', err.message);
        return null;
    }
}

// 4. getFeaturedProperties: Retorna array
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

        // Lógica de fallback si no hay destacados
        let finalData = data || [];
        if (finalData.length === 0) {
            const { data: recentData, error: recentError } = await supabase
                .from('properties')
                .select(PROPERTY_SELECT_FIELDS)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (!recentError && recentData) {
                finalData = recentData;
            }
        }

        return await attachImagesToProperties(finalData, supabase);
    } catch (err: any) {
        console.error('Critical exception in getFeaturedProperties:', err.message);
        return [];
    }
}

export async function createProperty(
    propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'galeria'>,
    images: GalleryImage[]
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
                    imagen_principal: images.find(img => img.es_principal)?.url || images[0]?.url || '',
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
        if (images && images.length > 0) {
            console.log(`[DB] Preparando inserción de ${images.length} imágenes en 'property_images'...`);

            const imagesToInsert = images.map((img) => ({
                property_id: propertyId,
                url: img.url,
                orden: img.orden,
                es_principal: img.es_principal
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
    images: GalleryImage[]
) {
    const supabase = await createClient();
    try {
        console.log('---------------------------------------------------------');
        console.log('[DB] INICIANDO ACTUALIZACIÓN DE PROPIEDAD ID:', id);

        // 1. Actualizar datos básicos en tabla 'properties'
        const updatePayload = {
            ...propertyData,
            imagen_principal: images.find(img => img.es_principal)?.url || images[0]?.url || '',
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

        if (images.length > 0) {
            const imagesToInsert = images.map((img) => ({
                property_id: id,
                url: img.url,
                orden: img.orden,
                es_principal: img.es_principal
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
        return { error: err.message || 'Error inesperado al actualizar.' };
    }
}

export async function syncPropertyGallery(propertyId: string, images: GalleryImage[]) {
    const supabase = await createClient();
    try {
        console.log(`[DB] Iniciando syncPropertyGallery para propiedad: ${propertyId}`);

        // 1. Recalcular orden secuencial (0, 1, 2...)
        const imagesWithOrder = images.map((img, index) => ({
            ...img,
            orden: index
        }));

        // 2. Identificar URL de la imagen principal
        const primaryImage = imagesWithOrder.find(img => img.es_principal) || imagesWithOrder[0];
        const primaryUrl = primaryImage?.url || '';

        // 3. Actualización individual (no destructiva)
        // Solo actualizamos registros que ya tienen ID (existentes)
        const updates = imagesWithOrder
            .filter(img => img.id && !img.id.startsWith('init-')) // Solo los que vienen de DB
            .map(img =>
                supabase
                    .from('property_images')
                    .update({
                        orden: img.orden,
                        es_principal: img.es_principal
                    })
                    .eq('id', img.id)
            );

        if (updates.length > 0) {
            console.log(`[DB] Ejecutando ${updates.length} actualizaciones en 'property_images'...`);
            const results = await Promise.all(updates);

            const firstError = results.find(r => r.error);
            if (firstError && firstError.error) {
                throw new Error(`Error actualizando imágenes: ${firstError.error.message}`);
            }
        }

        // 4. Actualizar properties.imagen_principal
        console.log(`[DB] Sincronizando imagen_principal: ${primaryUrl}`);
        const { error: propError } = await supabase
            .from('properties')
            .update({ imagen_principal: primaryUrl })
            .eq('id', propertyId);

        if (propError) {
            throw new Error(`Error actualizando propiedad principal: ${propError.message}`);
        }

        console.log('[DB] Sincronización de galería completada con éxito');
        return { success: true };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN en syncPropertyGallery:', err.message);
        return { error: err.message || 'Error al sincronizar galería.' };
    }
}
