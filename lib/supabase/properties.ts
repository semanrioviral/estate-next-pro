import { createClient, createPublicClient, createAdminClient } from '../supabase-server';
import { PROPERTY_SELECT_FIELDS } from './select-fields';
import { upsertTags, upsertAmenidades, syncPropertyTags, syncPropertyAmenidades, upsertBarrio, slugify } from './seo-helpers';
import { unstable_cache } from 'next/cache';
import { VALID_CITIES, VALID_TYPES, normalizeFilterSlug, isValidFilter } from './constants';

export { VALID_CITIES, VALID_TYPES, normalizeFilterSlug, isValidFilter };

export type Property = {
    id: string;
    titulo: string;
    descripcion: string;
    descripcion_corta?: string;
    direccion?: string;
    ciudad: string;
    barrio: string;
    barrio_id?: string;
    barrio_slug?: string;
    precio: number;
    negociable?: boolean;
    estado?: string;
    operacion: 'venta' | 'arriendo';
    tipo: 'casa' | 'apartamento' | 'lote' | 'comercial' | 'proyecto' | 'local' | 'oficina' | 'bodega' | 'finca';
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
    agente_id?: string | null;
    agente_nombre?: string;
    agente_nombre_publico?: string | null;
    agente_foto_url?: string | null;
    parqueaderos?: number;
    latitud?: number | null;
    longitud?: number | null;
    año_construccion?: number | null;
    antigüedad?: string | null;
    estrato?: number | null;
    canon_administracion?: number | null;
    codigo_postal?: string | null;
    moneda?: string;
    video_url?: string | null;
    fecha_disponible?: string | null;
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

export interface PaginatedProperties {
    properties: Property[];
    totalCount: number;
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

    // Normalizar servicios y etiquetas (pueden venir como string o null)
    const servicios = Array.isArray(prop.servicios)
        ? prop.servicios
        : (typeof prop.servicios === 'string' ? prop.servicios.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    const etiquetas = Array.isArray(prop.etiquetas)
        ? prop.etiquetas
        : (typeof prop.etiquetas === 'string' ? prop.etiquetas.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

    return {
        ...prop,
        agente_nombre: prop.profiles?.full_name || undefined,
        barrio_slug: prop.barrios?.slug,
        galeria,
        image_metadata,
        servicios,
        etiquetas
    };
}

/**
 * Función interna para adjuntar las imágenes de la tabla property_images
 * a un array de propiedades de forma eficiente (2da consulta desacoplada).
 */
export async function attachImagesToProperties(props: any[], supabase: any): Promise<Property[]> {
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

        // Normalizar servicios y etiquetas (pueden venir como string o null)
        const servicios = Array.isArray(prop.servicios)
            ? prop.servicios
            : (typeof prop.servicios === 'string' ? prop.servicios.split(',').map((s: string) => s.trim()).filter(Boolean) : []);

        const etiquetas = Array.isArray(prop.etiquetas)
            ? prop.etiquetas
            : (typeof prop.etiquetas === 'string' ? prop.etiquetas.split(',').map((s: string) => s.trim()).filter(Boolean) : []);


        return {
            ...prop,
            agente_nombre: prop.profiles?.full_name || undefined,
            galeria: rawImages.map(img => img.url),
            image_metadata: rawImages.map(img => ({
                id: img.id,
                url: img.url,
                orden: img.orden || 0,
                es_principal: img.es_principal || false
            })),
            servicios,
            etiquetas
        } as Property;
    });
}

function applyOrder(query: any, orden?: string) {
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

export async function getProperties(orden?: string, page: number = 1, pageSize: number = 12, searchTerm?: string, estadoFilter?: string): Promise<PaginatedProperties> {
    try {
        const supabase = createPublicClient();
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' });

        // Búsqueda por texto (título, barrio, ciudad) — solo lectura, 0 riesgo
        if (searchTerm && searchTerm.trim()) {
            const term = `%${searchTerm.trim()}%`;
            query = query.or(`titulo.ilike.${term},barrio.ilike.${term},ciudad.ilike.${term}`);
        }

        // Filtro por estado — solo lectura, 0 riesgo
        if (estadoFilter && estadoFilter.trim()) {
            query = query.eq('estado', estadoFilter.trim());
        }

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data, error, count } = await query;
        if (error) {
            console.error('Error fetching properties:', error);
            return { properties: [], totalCount: 0 };
        }

        const properties = await attachImagesToProperties(data || [], supabase);
        return {
            properties,
            totalCount: count || 0
        };
    } catch (err: any) {
        console.error('Critical exception in getProperties:', err.message);
        return { properties: [], totalCount: 0 };
    }
}

// 1. getPropertiesByCity: Retorna array paginado
export async function getPropertiesByCity(city: string, orden?: string, page: number = 1): Promise<PaginatedProperties> {
    try {
        const supabase = createPublicClient();
        const pageSize = 12;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
            .eq('ciudad', city);

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching properties by city:', error);
            return { properties: [], totalCount: 0 };
        }

        const properties = await attachImagesToProperties(data || [], supabase);
        return {
            properties,
            totalCount: count || 0
        };
    } catch (err: any) {
        console.error('Critical exception in getPropertiesByCity:', err.message);
        return { properties: [], totalCount: 0 };
    }
}

export async function getPropertiesByTypeAndCity(tipoSlug: string, citySlug: string, orden?: string, page: number = 1): Promise<PaginatedProperties> {
    try {
        const cityValid = isValidFilter(citySlug);
        const typeValid = isValidFilter(tipoSlug);
        const supabase = createPublicClient();
        const pageSize = 12;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
            .eq('ciudad', cityValid.dbName)
            .eq('tipo', typeValid.normalized);

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            console.error('Error fetching properties by type and city:', error);
            return { properties: [], totalCount: 0 };
        }

        const properties = await attachImagesToProperties(data || [], supabase);
        return {
            properties,
            totalCount: count || 0
        };
    } catch (err) {
        console.error('Critical exception in getPropertiesByTypeAndCity:', err);
        return { properties: [], totalCount: 0 };
    }
}

// 2. getPropertyBySlug: Retorna UN objeto (necesita manejo especial de array)
export async function getPropertyBySlug(slug: string): Promise<Property | null> {
    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS)
            .eq('slug', slug)
            .not('estado', 'in', '("Vendido","Reservado")')
            .single();

        if (error || !data) {
            console.error('[DB] Error fetching property by slug:', {
                slug,
                message: error?.message,
                details: error?.details,
                hint: error?.hint,
                code: error?.code
            });
            return null;
        }

        // attachImagesToProperties espera un array, así que envolvemos 'data'
        const propsWithImages = await attachImagesToProperties([data], supabase);
        return propsWithImages[0] || null;
    } catch (err: any) {
        console.error(`[DB] Critical exception in getPropertyBySlug for slug '${slug}':`, err.message);
        return null;
    }
}

// 2b. getPropertyBySlugIncludeInactive: Consulta sin filtro de estado (para 301 redirect)
export async function getPropertyBySlugIncludeInactive(slug: string): Promise<Property | null> {
    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS)
            .eq('slug', slug)
            .single();

        if (error || !data) return null;
        return data as unknown as Property;
    } catch (err: any) {
        return null;
    }
}

// 3. getPropertyById: Retorna UN objeto
export async function getPropertyById(id: string): Promise<Property | null> {
    try {
        const supabase = createPublicClient();
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
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS)
            .eq('destacado', true)
            .not('estado', 'in', '("Vendido","Reservado")')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching featured properties:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });
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

/**
 * Obtiene el catálogo completo de etiquetas para sugerencias en el admin.
 */
export async function getAllTags(): Promise<{ id: string; nombre: string; slug: string }[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('tags')
            .select('id, nombre, slug')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('[DB] Error fetching all tags:', error.message);
            return [];
        }

        return data || [];
    } catch (err: any) {
        console.error('[DB] Critical exception in getAllTags:', err.message);
        return [];
    }
}

/**
 * Obtiene el catálogo completo de amenidades para sugerencias en el admin.
 */
export async function getAllAmenidades(): Promise<{ id: string; nombre: string }[]> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('amenidades')
            .select('id, nombre')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('[DB] Error fetching all amenidades:', error.message);
            return [];
        }

        return data || [];
    } catch (err: any) {
        console.error('[DB] Critical exception in getAllAmenidades:', err.message);
        return [];
    }
}

/**
 * Obtiene una etiqueta por su slug (para metadata SEO)
 */
export async function getTagBySlug(slug: string): Promise<{
    id: string;
    nombre: string;
    slug: string;
    descripcion?: string;
    meta_titulo?: string;
    meta_descripcion?: string;
} | null> {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('tags')
            .select('id, nombre, slug, descripcion, meta_titulo, meta_descripcion')
            .eq('slug', slug)
            .maybeSingle();

        if (error) {
            console.error('[DB] Error fetching tag by slug:', error.message);
            return null;
        }

        return data;
    } catch (err: any) {
        console.error('[DB] Critical exception in getTagBySlug:', err.message);
        return null;
    }
}

/**
 * Obtiene todas las propiedades asociadas a un tag por su slug
 */
export async function getPropertiesByTagSlug(slug: string, orden?: string, page: number = 1): Promise<PaginatedProperties> {
    try {
        const supabase = await createClient();
        const pageSize = 12;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 1. Obtener el tag por slug
        const { data: tag, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', slug)
            .single();

        if (tagError || !tag) {
            console.error('[DB] Tag not found for slug:', slug);
            return { properties: [], totalCount: 0 };
        }

        // 2. Obtener property_ids desde la tabla junction
        const { data: propertyTags, error: junctionError } = await supabase
            .from('property_tags')
            .select('property_id')
            .eq('tag_id', tag.id);

        if (junctionError || !propertyTags || propertyTags.length === 0) {
            return { properties: [], totalCount: 0 };
        }

        const propertyIds = propertyTags.map(pt => pt.property_id);

        // 3. Obtener propiedades por IDs usando PROPERTY_SELECT_FIELDS
        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
            .in('id', propertyIds);

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data: properties, error: propsError, count } = await query;

        if (propsError) {
            console.error('[DB] Error fetching properties by tag:', propsError.message);
            return { properties: [], totalCount: 0 };
        }

        const attached = await attachImagesToProperties(properties || [], supabase);
        return {
            properties: attached,
            totalCount: count || 0
        };
    } catch (err: any) {
        console.error('[DB] Critical exception in getPropertiesByTagSlug:', err.message);
        return { properties: [], totalCount: 0 };
    }
}

export async function createProperty(
    propertyData: Omit<Property, 'id' | 'created_at' | 'updated_at' | 'galeria'>,
    images: GalleryImage[]
) {
    // Use service_role client — auth is enforced by middleware before reaching this function
    const supabase = createAdminClient();
    let propertyId: string | null = null;

    try {

        // 0. NUEVO: Sincronizar Barrio (Phase 7)
        let barrio_id: string | undefined = undefined;
        if (propertyData.barrio) {
            try {
                barrio_id = await upsertBarrio(propertyData.barrio, propertyData.ciudad, supabase);
            } catch (barrioError: any) {
                console.error('[SEO] Error en sincronización de barrio:', barrioError.message);
                // No bloqueamos la creación por ahora si falla el barrio, pero guardamos el log
            }
        }

        // 1. Insertar propiedad en tabla 'properties'
        const insertData = sanitizePayload({
            ...propertyData as unknown as Record<string, unknown>,
            barrio_id,
            imagen_principal: images.find(img => img.es_principal)?.url || images[0]?.url || '',
            servicios: propertyData.servicios || [],
            etiquetas: propertyData.etiquetas || [],
        });

        const { data: property, error: propError } = await supabase
            .from('properties')
            .insert([insertData])
            .select()
            .maybeSingle();

        if (propError) {
            console.error('[DB] ERROR CRÍTICO al insertar propiedad:', {
                message: propError.message,
                details: propError.details,
                hint: propError.hint,
                code: propError.code,
            });
            throw new Error(`Error base de datos (propiedad): ${propError.message}`);
        }

        if (!property || !property.id) {
            console.error('[DB] INSERT no retornó fila — posible RLS bloqueando. Payload:', JSON.stringify(insertData).slice(0, 200));
            throw new Error('No se pudo crear la propiedad. Verifica tus permisos (RLS).');
        }

        propertyId = property.id;

        // 2. Insertar fotos en tabla 'property_images'
        if (images && images.length > 0) {

            const imagesToInsert = images.map((img) => ({
                property_id: propertyId,
                url: img.url,
                orden: img.orden,
                es_principal: img.es_principal
            }));

            const { error: imgError } = await supabase
                .from('property_images')
                .insert(imagesToInsert)
                .select();

            if (imgError) {
                console.error('[DB] ERROR CRÍTICO al insertar imágenes:', imgError.message);
                throw new Error(`Error al persistir galería de imágenes: ${imgError.message}`);
            }
        }

        // 3. NUEVO: Sincronizar tags en tablas relacionales
        if (propertyData.etiquetas && propertyData.etiquetas.length > 0) {
            try {
                const tagIds = await upsertTags(propertyData.etiquetas, supabase);
                await syncPropertyTags(propertyId!, tagIds, supabase);
            } catch (seoError: any) {
                console.error('[SEO] Error en sincronización de tags:', seoError.message);
                throw seoError; // Propagar para activar rollback
            }
        }

        // 4. NUEVO: Sincronizar amenidades en tablas relacionales
        if (propertyData.servicios && propertyData.servicios.length > 0) {
            try {
                const amenidadIds = await upsertAmenidades(propertyData.servicios, supabase);
                await syncPropertyAmenidades(propertyId!, amenidadIds, supabase);
            } catch (seoError: any) {
                console.error('[SEO] Error en sincronización de amenidades:', seoError.message);
                throw seoError; // Propagar para activar rollback
            }
        }


        return { data: property };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN capturada en createProperty:', err.message);

        // ROLLBACK COMPLETO: Eliminar propiedad y todas sus relaciones
        if (propertyId) {
            const { error: rollbackError } = await supabase
                .from('properties')
                .delete()
                .eq('id', propertyId);

            // ON DELETE CASCADE eliminará automáticamente:
            // - property_images
            // - property_tags  
            // - property_amenidades

            if (rollbackError) {
                console.error('[DB] ERROR ADICIONAL en rollback:', rollbackError.message);
            } else {
            }
        }

        return { error: err.message || 'Error desconocido al crear la propiedad.' };
    }
}

export async function deleteProperty(id: string) {
    // Use service_role client — auth is enforced by middleware before reaching this function
    const supabase = createAdminClient();
    try {

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

        return { success: true };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN en deleteProperty:', err.message);
        return { error: err.message || 'Error desconocido al eliminar la propiedad.' };
    }
}

/** Columns that are known to exist in the 'properties' table.
 *  Used as a safety filter so unknown/missing columns don't break PATCH requests. */
const KNOWN_PROPERTY_COLUMNS = new Set([
    'titulo', 'precio', 'descripcion', 'descripcion_corta', 'direccion',
    'barrio', 'ciudad', 'tipo', 'habitaciones', 'baños', 'area_m2',
    'negociable', 'estado', 'operacion', 'medidas_lote', 'tipo_uso',
    'servicios', 'financiamiento', 'imagen_principal', 'slug', 'destacado',
    'agente_id', 'agente_nombre', 'agente_nombre_publico', 'agente_foto_url',
    'parqueaderos', 'latitud', 'longitud', 'año_construccion', 'antigüedad',
    'estrato', 'canon_administracion', 'codigo_postal', 'moneda',
    'video_url', 'fecha_disponible', 'meta_titulo', 'meta_descripcion',
    'canonical', 'etiquetas', 'barrio_id',
]);

/** Strips any keys from `data` that are not in KNOWN_PROPERTY_COLUMNS.
 *  Prevents PostgREST 400 errors when a column doesn't exist yet in the DB. */
function sanitizePayload<T extends Record<string, unknown>>(data: T): Partial<T> {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
        if (KNOWN_PROPERTY_COLUMNS.has(key)) {
            sanitized[key] = value;
        }
    }
    return sanitized as Partial<T>;
}

export async function updateProperty(
    id: string,
    propertyData: Partial<Omit<Property, 'id' | 'created_at' | 'updated_at' | 'galeria'>>,
    images: GalleryImage[]
) {
    // Use service_role client — auth is enforced by middleware before reaching this function
    const supabase = createAdminClient();
    try {

        // 0. NUEVO: Sincronizar Barrio (Phase 7)
        let barrio_id: string | undefined = undefined;
        if (propertyData.barrio) {
            try {
                barrio_id = await upsertBarrio(propertyData.barrio, propertyData.ciudad || '', supabase);
            } catch (barrioError: any) {
                console.error('[SEO] Error en sincronización de barrio:', barrioError.message);
            }
        }

        // 1. Actualizar datos básicos en tabla 'properties'
        const updatePayload = {
            ...propertyData,
            ...(barrio_id && { barrio_id }),
            imagen_principal: images.find(img => img.es_principal)?.url || images[0]?.url || '',
            // Solo incluir servicios y etiquetas si vienen en el payload
            ...(propertyData.servicios !== undefined && { servicios: propertyData.servicios }),
            ...(propertyData.etiquetas !== undefined && { etiquetas: propertyData.etiquetas }),
        };

        // Sanitize: strip any keys that don't match known columns (safety net for partial migrations)
        const sanitized = sanitizePayload(updatePayload);


        // Use .select() with maybeSingle() to verify the row was actually updated (RLS can silently block)
        const { data: updatedRow, error: propError } = await supabase
            .from('properties')
            .update(sanitized)
            .eq('id', id)
            .select('id')
            .maybeSingle();

        if (propError) {
            console.error('[DB] ERROR al actualizar propiedad:', {
                message: propError.message,
                details: propError.details,
                hint: propError.hint,
                code: propError.code,
            });
            return { error: `Error de base de datos: ${propError.message}` };
        }

        if (!updatedRow) {
            console.error('[DB] UPDATE no afectó ninguna fila — posible RLS bloqueando o propiedad inexistente. ID:', id);
            return { error: 'No se pudo actualizar la propiedad. Verifica que exista y tengas permisos.' };
        }


        // 2. Sincronizar galería de imágenes
        const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('property_id', id);

        if (deleteError) {
            console.error('[DB] ERROR al limpiar galería antigua:', deleteError.message);
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

        // 3. NUEVO: Sincronizar tags si se enviaron
        if (propertyData.etiquetas !== undefined) {
            try {
                if (propertyData.etiquetas.length > 0) {
                    const tagIds = await upsertTags(propertyData.etiquetas, supabase);
                    await syncPropertyTags(id, tagIds, supabase);
                } else {
                    // Si no hay tags, eliminar todas las relaciones
                    await syncPropertyTags(id, [], supabase);
                }
            } catch (seoError: any) {
                console.error('[SEO] Error sincronizando tags:', seoError.message);
                // No retornamos error porque la propiedad ya se actualizó
            }
        }

        // 4. NUEVO: Sincronizar amenidades si se enviaron
        if (propertyData.servicios !== undefined) {
            try {
                if (propertyData.servicios.length > 0) {
                    const amenidadIds = await upsertAmenidades(propertyData.servicios, supabase);
                    await syncPropertyAmenidades(id, amenidadIds, supabase);
                } else {
                    // Si no hay amenidades, eliminar todas las relaciones
                    await syncPropertyAmenidades(id, [], supabase);
                }
            } catch (seoError: any) {
                console.error('[SEO] Error sincronizando amenidades:', seoError.message);
            }
        }

        return { success: true };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN en updateProperty:', err.message);
        return { error: err.message || 'Error inesperado al actualizar.' };
    }
}

export async function syncPropertyGallery(propertyId: string, images: GalleryImage[]) {
    // Use service_role client — auth is enforced by middleware before reaching this function
    const supabase = createAdminClient();
    try {

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
            const results = await Promise.all(updates);

            const firstError = results.find(r => r.error);
            if (firstError && firstError.error) {
                throw new Error(`Error actualizando imágenes: ${firstError.error.message}`);
            }
        }

        // 4. Actualizar properties.imagen_principal
        const { error: propError } = await supabase
            .from('properties')
            .update({ imagen_principal: primaryUrl })
            .eq('id', propertyId);

        if (propError) {
            throw new Error(`Error actualizando propiedad principal: ${propError.message}`);
        }

        return { success: true };
    } catch (err: any) {
        console.error('[DB] EXCEPCIÓN en syncPropertyGallery:', err.message);
        return { error: err.message || 'Error al sincronizar galería.' };
    }
}

/**
 * Obtiene la información de un barrio por su slug (Fase 15.4 con SEO)
 */
export async function getBarrioBySlug(slug: string) {
    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from('barrios')
            .select('id, nombre, slug, ciudad, descripcion, meta_titulo, meta_descripcion, destacado, orden')
            .eq('slug', slug)
            .maybeSingle();

        if (error) {
            console.error('[DB] Error fetching barrio by slug:', error.message);
            return null;
        }
        return data;
    } catch (err: any) {
        console.error('[DB] Exception in getBarrioBySlug:', err.message);
        return null;
    }
}

/**
 * Fase 15.4: Obtiene barrios destacados para la página pilar.
 */
export async function getFeaturedBarrios(limit = 6): Promise<{ id: string; nombre: string; slug: string; destacado: boolean }[]> {
    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('barrios')
            .select('id, nombre, slug, destacado, orden')
            .order('destacado', { ascending: false })
            .order('orden', { ascending: true })
            .limit(limit);

        if (error) {
            console.error('[DB] Error fetching featured barrios:', error.message);
            return [];
        }
        return data || [];
    } catch (err: any) {
        console.error('[DB] Exception in getFeaturedBarrios:', err.message);
        return [];
    }
}

/**
 * Obtiene todas las propiedades asociadas a un barrio por su slug
 */
export async function getPropertiesByBarrioSlug(slug: string, orden?: string, page: number = 1): Promise<PaginatedProperties> {
    try {
        const supabase = createPublicClient();
        const pageSize = 12;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 1. Obtener la información del barrio para saber el nombre exacto
        const barrio = await getBarrioBySlug(slug);

        if (!barrio) {
            console.error('[DB] Barrio not found for slug:', slug);
            return { properties: [], totalCount: 0 };
        }

        // 2. Obtener propiedades por el ID del barrio usando PROPERTY_SELECT_FIELDS
        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
            .eq('barrio_id', barrio.id);

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data: properties, error: propsError, count } = await query;

        if (propsError) {
            console.error('[DB] Error fetching properties by barrio_id:', propsError.message);
            return { properties: [], totalCount: 0 };
        }

        const attached = await attachImagesToProperties(properties || [], supabase);
        return {
            properties: attached,
            totalCount: count || 0
        };
    } catch (err: any) {
        console.error('[DB] Critical exception in getPropertiesByBarrioSlug:', err.message);
        return { properties: [], totalCount: 0 };
    }
}


/**
 * Obtiene todas las propiedades filtradas por tipo de operación (venta/arriendo)
 */
export const getPropertiesByOperacion = (
    operacion: string,
    habitaciones?: number,
    orden?: string,
    page: number = 1,
    precioMin?: number,
    precioMax?: number
): Promise<PaginatedProperties> => {
    // v2: cache bust for new Supabase keys (sb_publishable_)
    const key = `props-operacion-v2-${operacion}-hab${habitaciones ?? 'all'}-ord${orden ?? 'default'}-pmin${precioMin ?? 'all'}-pmax${precioMax ?? 'all'}-p${page}`;
    return unstable_cache(
        async (op: string, hab?: number, ord?: string, pg: number = 1, pmin?: number, pmax?: number): Promise<PaginatedProperties> => {
            // inner function — params come from outer closure via cache key
            try {
                const supabase = createPublicClient();
                const pageSize = 12;
                const from = (pg - 1) * pageSize;
                const to = from + pageSize - 1;

                let query = supabase
                    .from('properties')
                    .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
                    .eq('operacion', op);

                if (hab) {
                    query = query.gte('habitaciones', hab);
                }
                if (pmin) {
                    query = query.gte('precio', pmin);
                }
                if (pmax) {
                    query = query.lte('precio', pmax);
                }

                query = applyOrder(query, ord);
                query = query.range(from, to);

                const { data: properties, error, count } = await query;

                if (error) {
                    console.error('[DB] Error fetching properties by operacion:', error.message);
                    return { properties: [], totalCount: 0 };
                }

                return {
                    properties: await attachImagesToProperties(properties || [], supabase),
                    totalCount: count || 0
                };
            } catch (err: any) {
                console.error('[DB] Critical exception in getPropertiesByOperacion:', err.message);
                return { properties: [], totalCount: 0 };
            }
        },
        [key],
        { revalidate: 3600, tags: ['properties'] }
    )(operacion, habitaciones, orden, page, precioMin, precioMax);
};

/**
 * Obtiene propiedades filtradas por operación y ciudad
 * @param operacion - Tipo de operación (venta/arriendo)
 * @param ciudadSlug - Slug de la ciudad (se comparará con ciudad normalizada)
 */
export const getPropertiesByOperacionAndCiudad = (
    operacion: string,
    slug: string,
    barrioSlug?: string,
    habitaciones?: number,
    orden?: string,
    page: number = 1
): Promise<PaginatedProperties | null> => {
    const key = `props-op-ciudad-${operacion}-${slug}-b${barrioSlug ?? 'none'}-hab${habitaciones ?? 'all'}-ord${orden ?? 'default'}-p${page}`;
    return unstable_cache(
        async (op: string, sl: string, bsl?: string, hab?: number, ord?: string, pg: number = 1): Promise<PaginatedProperties | null> => {
            try {
                const validation = isValidFilter(sl);
                if (!validation.isValid) {
                    return null;
                }

                const supabase = createPublicClient();
                const pageSize = 12;
                const from = (pg - 1) * pageSize;
                const to = from + pageSize - 1;

                let query = supabase
                    .from('properties')
                    .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
                    .eq('operacion', op);

                // Mover filtros a la query para que la paginación sea correcta
                if (validation.type === 'ciudad') {
                    query = query.eq('ciudad', validation.dbName);
                } else if (validation.type === 'tipo') {
                    // Usar normalized (ej: 'casa') para la DB, no dbName (ej: 'Casa') que es para UI
                    query = query.eq('tipo', validation.normalized);
                }

                if (hab) {
                    query = query.gte('habitaciones', hab);
                }

                if (bsl) {
                    // Resolver el ID del barrio desde el slug
                    const { data: barrioData, error: barrioError } = await supabase
                        .from('barrios')
                        .select('id')
                        .eq('slug', bsl)
                        .single();

                    if (barrioError || !barrioData) {
                        // Si el barrio no existe, no devolvemos nada para evitar confusión
                        return { properties: [], totalCount: 0 };
                    }

                    // Filtrar por ID de barrio
                    query = query.eq('barrio_id', barrioData.id);
                }

                query = applyOrder(query, ord);
                query = query.range(from, to);

                const { data: properties, error, count } = await query;

                if (error) {
                    console.error('[DB] Error fetching properties by operacion and slug:', error.message);
                    return { properties: [], totalCount: 0 };
                }

                const attached = await attachImagesToProperties(properties || [], supabase);
                return {
                    properties: attached,
                    totalCount: count || 0
                };
            } catch (err: any) {
                console.error('[DB] Critical exception in getPropertiesByOperacionAndCiudad:', err.message);
                return { properties: [], totalCount: 0 };
            }
        },
        [key],
        { revalidate: 3600, tags: ['properties'] }
    )(operacion, slug, barrioSlug, habitaciones, orden, page);
};

/**
 * Obtiene propiedades filtradas por operación, ciudad y tipo de inmueble
 * @param operacion - Tipo de operación (venta/arriendo)
 * @param ciudadSlug - Slug de la ciudad
 * @param tipoSlug - Slug del tipo de inmueble
 */
export const getPropertiesByOperacionCiudadTipo = (
    operacion: string,
    ciudadParam: string,
    tipoParam: string,
    barrioSlug?: string,
    habitaciones?: number,
    orden?: string,
    page: number = 1
): Promise<PaginatedProperties | null> => {
    const key = `props-op-ciudad-tipo-${operacion}-${ciudadParam}-${tipoParam}-b${barrioSlug ?? 'none'}-hab${habitaciones ?? 'all'}-ord${orden ?? 'default'}-p${page}`;
    return unstable_cache(
        async (op: string, ciudad: string, tipo: string, bsl?: string, hab?: number, ord?: string, pg: number = 1): Promise<PaginatedProperties | null> => {
            try {
                const ciudadValid = isValidFilter(ciudad);
                const tipoValid = isValidFilter(tipo);

                if (ciudadValid.type !== 'ciudad' || tipoValid.type !== 'tipo') {
                    return null;
                }

                const supabase = createPublicClient();
                const pageSize = 12;
                const from = (pg - 1) * pageSize;
                const to = from + pageSize - 1;

                let query = supabase
                    .from('properties')
                    .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
                    .eq('operacion', op)
                    .eq('ciudad', ciudadValid.dbName)
                    .eq('tipo', tipoValid.normalized);

                if (hab) {
                    query = query.gte('habitaciones', hab);
                }

                if (bsl) {
                    const { data: barrioData, error: barrioError } = await supabase
                        .from('barrios')
                        .select('id')
                        .eq('slug', bsl)
                        .single();

                    if (barrioError || !barrioData) {
                        return { properties: [], totalCount: 0 };
                    }
                    query = query.eq('barrio_id', barrioData.id);
                }

                query = applyOrder(query, ord);
                query = query.range(from, to);

                const { data: properties, error, count } = await query;

                if (error) {
                    console.error('[DB] Error fetching properties by operacion, ciudad and tipo:', error.message);
                    return { properties: [], totalCount: 0 };
                }

                const attached = await attachImagesToProperties(properties || [], supabase);
                return {
                    properties: attached,
                    totalCount: count || 0
                };
            } catch (err: any) {
                console.error('[DB] Critical exception in getPropertiesByOperacionCiudadTipo:', err.message);
                return { properties: [], totalCount: 0 };
            }
        },
        [key],
        { revalidate: 3600, tags: ['properties'] }
    )(operacion, ciudadParam, tipoParam, barrioSlug, habitaciones, orden, page);
};

/**
 * Obtiene todas las propiedades filtradas por operación y el slug de una etiqueta.
 * @param operacion - 'venta' o 'arriendo'
 * @param tagSlug - El slug de la etiqueta (ej: 'caja-honor')
 */
export async function getPropertiesByOperacionAndTagSlug(
    operacion: 'venta' | 'arriendo',
    tagSlug: string,
    orden?: string,
    page: number = 1
): Promise<PaginatedProperties> {
    try {
        const supabase = createPublicClient();
        const pageSize = 12;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 1. Obtener el tag para validar que existe y obtener su ID
        const { data: tag, error: tagError } = await supabase
            .from('tags')
            .select('id, nombre')
            .eq('slug', tagSlug)
            .single();

        if (tagError || !tag) {
            console.error('[DB] Tag not found for slug:', tagSlug);
            return { properties: [], totalCount: 0 };
        }

        // 2. Obtener los IDs de propiedades asociadas a este tag
        const { data: propertyTags, error: ptError } = await supabase
            .from('property_tags')
            .select('property_id')
            .eq('tag_id', tag.id);

        if (ptError || !propertyTags || propertyTags.length === 0) {
            return { properties: [], totalCount: 0 };
        }

        const propertyIds = propertyTags.map(pt => pt.property_id);

        // 3. Consultar las propiedades filtrando por ID y operación
        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
            .in('id', propertyIds)
            .eq('operacion', operacion);

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data: properties, error: pError, count } = await query;

        if (pError || !properties) {
            console.error('[DB] Error fetching properties for tag+operacion:', pError?.message);
            return { properties: [], totalCount: 0 };
        }

        const attached = await attachImagesToProperties(properties, supabase);
        return {
            properties: attached,
            totalCount: count || 0
        };
    } catch (err: any) {
        console.error('[DB] Critical exception in getPropertiesByOperacionAndTagSlug:', err.message);
        return { properties: [], totalCount: 0 };
    }
}

/**
 * Avanzado: Obtiene propiedades combinando Operación, Ciudad, Tipo y Tag (Fase 14.1)
 */
export async function getPropertiesByOperacionCiudadTipoAndTagSlug(
    operacion: 'venta' | 'arriendo',
    ciudadParam: string,
    tipoParam: string,
    tagSlug: string,
    orden?: string,
    page: number = 1
): Promise<PaginatedProperties | null> {
    try {
        const ciudadValid = isValidFilter(ciudadParam);
        const tipoValid = isValidFilter(tipoParam);

        if (ciudadValid.type !== 'ciudad' || tipoValid.type !== 'tipo') {
            return null;
        }

        const supabase = createPublicClient();
        const pageSize = 12;
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;

        // 1. Validar Tag
        const { data: tag, error: tagError } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagSlug)
            .maybeSingle();

        if (tagError || !tag) return { properties: [], totalCount: 0 };

        // 2. Obtener IDs de propiedades con ese Tag
        const { data: ptData, error: ptError } = await supabase
            .from('property_tags')
            .select('property_id')
            .eq('tag_id', tag.id);

        if (ptError || !ptData || ptData.length === 0) return { properties: [], totalCount: 0 };
        const propertyIds = ptData.map(pt => pt.property_id);

        // 3. Consultar propiedades por Operación, Ciudad, Tipo e IDs paginadamente
        // NOTA: Para que el count sea exacto, filtramos ciudad/tipo en la query
        let query = supabase
            .from('properties')
            .select(PROPERTY_SELECT_FIELDS, { count: 'exact' })
            .in('id', propertyIds)
            .eq('operacion', operacion)
            .eq('ciudad', ciudadValid.dbName)
            .eq('tipo', tipoValid.dbName);

        query = applyOrder(query, orden);
        query = query.range(from, to);

        const { data: properties, error: pError, count } = await query;

        if (pError || !properties) return { properties: [], totalCount: 0 };

        const attached = await attachImagesToProperties(properties || [], supabase);
        return {
            properties: attached,
            totalCount: count || 0
        };
    } catch (err: any) {
        console.error('[DB] Critical exception in getPropertiesByOperacionCiudadTipoAndTagSlug:', err.message);
        return { properties: [], totalCount: 0 };
    }
}

/**
 * Fase 11: Obtiene todos los barrios registrados para enlazado interno SEO.
 */
export async function getAllBarrios(): Promise<{ id: string; nombre: string; slug: string }[]> {
    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('barrios')
            .select('id, nombre, slug')
            .order('nombre', { ascending: true });

        if (error) {
            console.error('[DB] Error fetching all barrios:', error.message);
            return [];
        }
        return data || [];
    } catch (err: any) {
        console.error('[DB] Exception in getAllBarrios:', err.message);
        return [];
    }
}

/**
 * Fase 11: Obtiene todas las ciudades únicas con inventario para el sitemap y enlazado.
 */
export async function getAllCities(): Promise<string[]> {
    try {
        const supabase = createPublicClient();
        // Nota: Supabase no soporta DISTINCT directamente en select de forma sencilla sin RPC o trucos.
        // Usamos una consulta simple y filtramos en JS o usamos un truco de select.
        const { data, error } = await supabase
            .from('properties')
            .select('ciudad');

        if (error) {
            console.error('[DB] Error fetching cities:', error.message);
            return [];
        }

        const cities = data
            .map(p => p.ciudad)
            .filter((ciudad, index, self) => ciudad && self.indexOf(ciudad) === index);

        return cities.sort();
    } catch (err: any) {
        console.error('[DB] Exception in getAllCities:', err.message);
        return [];
    }
}

/**
 * Fase 18: Obtiene propiedades similares para aumentar la conversión.
 * Prioridad: Barrio > Tipo > Precio (+/- 15%)
 */
export type SimilarProperty = {
    property: Property;
    matchType: 'barrio' | 'tipo' | 'precio' | 'ninguno';
};

export const getSimilarProperties = unstable_cache(
    async (propertyId: string, barrioId: string | undefined, tipo: string, precio: number): Promise<SimilarProperty[]> => {
        try {
            const supabase = createPublicClient();
            const minPrice = precio * 0.85;
            const maxPrice = precio * 1.15;

            // 1. Intentar por Barrio + Tipo + Precio (Máxima similitud)
            if (barrioId) {
                const { data: barrioProps } = await supabase
                    .from('properties')
                    .select(PROPERTY_SELECT_FIELDS)
                    .eq('barrio_id', barrioId)
                    .eq('tipo', tipo)
                    .gte('precio', minPrice)
                    .lte('precio', maxPrice)
                    .neq('id', propertyId)
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (barrioProps && barrioProps.length >= 1) {
                    const attached = await attachImagesToProperties(barrioProps, supabase);
                    return attached.map(p => ({ property: p, matchType: 'barrio' }));
                }
            }

            // 2. Intentar por Tipo + Precio (Misma categoría y gama) fallback
            const { data: tipoProps } = await supabase
                .from('properties')
                .select(PROPERTY_SELECT_FIELDS)
                .eq('tipo', tipo)
                .gte('precio', minPrice)
                .lte('precio', maxPrice)
                .neq('id', propertyId)
                .order('created_at', { ascending: false })
                .limit(3);

            if (tipoProps && tipoProps.length >= 1) {
                const attached = await attachImagesToProperties(tipoProps, supabase);
                return attached.map(p => ({ property: p, matchType: 'tipo' }));
            }

            // 3. Fallback final: Mismo rango de precio
            const { data: priceProps } = await supabase
                .from('properties')
                .select(PROPERTY_SELECT_FIELDS)
                .gte('precio', minPrice)
                .lte('precio', maxPrice)
                .neq('id', propertyId)
                .order('created_at', { ascending: false })
                .limit(3);

            const attachedFinal = await attachImagesToProperties(priceProps || [], supabase);
            return attachedFinal.map(p => ({ property: p, matchType: 'precio' }));
        } catch (err: any) {
            console.error('[DB] Critical exception in getSimilarProperties:', err.message);
            return [];
        }
    },
    ['similar-properties-v2'],
    { revalidate: 3600, tags: ['properties'] }
);

/**
 * Obtiene slugs de propiedad anterior y siguiente para navegación secuencial.
 * Busca dentro de la misma operación (venta/arriendo) ordenado por created_at descendente.
 */
export const getAdjacentProperties = unstable_cache(
    async (propertyId: string, operacion: string): Promise<{ prev: string | null; next: string | null }> => {
        try {
            const supabase = createPublicClient();

            // Obtener todos los IDs y slugs de la misma operación, ordenados
            const { data: allProps, error } = await supabase
                .from('properties')
                .select('id, slug')
                .eq('operacion', operacion)
                .order('created_at', { ascending: false });

            if (error || !allProps) {
                console.error('[DB] Error fetching adjacent properties:', error?.message);
                return { prev: null, next: null };
            }

            const currentIndex = allProps.findIndex(p => p.id === propertyId);
            if (currentIndex === -1) return { prev: null, next: null };

            return {
                prev: currentIndex < allProps.length - 1 ? allProps[currentIndex + 1].slug : null,
                next: currentIndex > 0 ? allProps[currentIndex - 1].slug : null,
            };
        } catch (err: any) {
            console.error('[DB] Critical exception in getAdjacentProperties:', err.message);
            return { prev: null, next: null };
        }
    },
    ['adjacent-properties'],
    { revalidate: 3600, tags: ['properties'] }
);

/**
 * Fase 19: Registra una visualización de propiedad de forma anónima.
 */
export async function recordPropertyView(propertyId: string, clientIp?: string, sessionId?: string) {
    try {
        const supabase = await createClient(); // Solo servidor para inserción segura

        let ip_hash = '';
        if (clientIp) {
            // Hash simple para anonimizar IP
            ip_hash = require('crypto').createHash('sha256').update(clientIp).digest('hex');
        }

        const { error } = await supabase
            .from('property_views')
            .insert([
                {
                    property_id: propertyId,
                    ip_hash,
                    session_id: sessionId
                }
            ]);

        if (error) {
        }
    } catch (err: any) {
        console.error('[ANALYTICS] Critical error in recordPropertyView:', err.message);
    }
}

/**
 * Fase 19: Obtiene las propiedades más vistas históricamente.
 */
export const getMostViewedProperties = unstable_cache(
    async (limit = 6): Promise<Property[]> => {
        try {
            const supabase = createPublicClient();

            // Usamos una query con agregación si es posible, o simplemente traemos los IDs más repetidos
            // Dado que Supabase no soporta GROUP BY directo en el cliente de forma sencilla sin RPC, 
            // haremos una consulta a la tabla property_views y limitaremos.

            const { data: views, error } = await supabase
                .rpc('get_most_viewed_properties_ids', { max_limit: limit });

            if (error) {
                // Si el RPC no existe, fallback a recent properties para no romper la UI
                return getFeaturedProperties(limit);
            }

            const ids = views.map((v: any) => v.property_id);
            const { data: props } = await supabase
                .from('properties')
                .select(PROPERTY_SELECT_FIELDS)
                .in('id', ids);

            return await attachImagesToProperties(props || [], supabase);
        } catch (err: any) {
            console.error('[DB] Error in getMostViewedProperties:', err.message);
            return [];
        }
    },
    ['most-viewed-properties'],
    { revalidate: 3600, tags: ['properties', 'views'] }
);

/**
 * Fase 19: Obtiene propiedades en tendencia (más vistas en los últimos X días).
 */
export const getTrendingProperties = unstable_cache(
    async (days = 7, limit = 6): Promise<Property[]> => {
        try {
            const supabase = createPublicClient();
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - days);

            const { data: views, error } = await supabase
                .from('property_views')
                .select('property_id')
                .gte('created_at', dateThreshold.toISOString());

            if (error || !views || views.length === 0) {
                return getFeaturedProperties(limit);
            }

            // Contar ocurrencias localmente si no hay RPC
            const counts: Record<string, number> = {};
            views.forEach(v => {
                counts[v.property_id] = (counts[v.property_id] || 0) + 1;
            });

            const sortedIds = Object.keys(counts)
                .sort((a, b) => counts[b] - counts[a])
                .slice(0, limit);

            const { data: props } = await supabase
                .from('properties')
                .select(PROPERTY_SELECT_FIELDS)
                .in('id', sortedIds);

            // Re-sort to maintain popularity order - Use any cast to bypass PostgREST parser inference error
            const finalProps = ((props as any) || []).sort((a: any, b: any) => sortedIds.indexOf(a.id) - sortedIds.indexOf(b.id));

            return await attachImagesToProperties(finalProps, supabase);
        } catch (err: any) {
            return getFeaturedProperties(limit);
        }
    },
    ['trending-properties'],
    { revalidate: 1800, tags: ['properties', 'views'] }
);

/**
 * Fase 19: Obtiene propiedades populares en un barrio específico.
 */
export const getPopularInBarrio = unstable_cache(
    async (barrioId: string, limit = 3): Promise<Property[]> => {
        try {
            const supabase = createPublicClient();

            // Similar a trending pero filtrado por barrio
            const { data: props, error } = await supabase
                .from('properties')
                .select(PROPERTY_SELECT_FIELDS)
                .eq('barrio_id', barrioId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) return [];

            return await attachImagesToProperties(props || [], supabase);
        } catch (err: any) {
            return [];
        }
    },
    ['popular-in-barrio'],
    { revalidate: 3600, tags: ['properties'] }
);
/**
 * Fase 19: Obtiene el promedio de precio de las propiedades publicadas en un barrio.
 */
export const getAveragePriceByBarrio = unstable_cache(
    async (barrioId: string): Promise<number | null> => {
        try {
            const supabase = createPublicClient();
            const { data, error } = await supabase
                .from('properties')
                .select('precio')
                .eq('barrio_id', barrioId);

            if (error || !data || data.length === 0) return null;

            const sum = data.reduce((acc, curr) => acc + curr.precio, 0);
            return sum / data.length;
        } catch (err) {
            return null;
        }
    },
    ['barrio-avg-price'],
    { revalidate: 3600, tags: ['properties'] }
);

/**
 * Fase 19: Obtiene las visitas de una propiedad en los últimos 7 días.
 */
export const getWeeklyViews = unstable_cache(
    async (propertyId: string): Promise<number> => {
        try {
            const supabase = createPublicClient();
            const dateThreshold = new Date();
            dateThreshold.setDate(dateThreshold.getDate() - 7);

            const { count, error } = await supabase
                .from('property_views')
                .select('*', { count: 'exact', head: true })
                .eq('property_id', propertyId)
                .gte('created_at', dateThreshold.toISOString());

            if (error) return 0;
            return count || 0;
        } catch (err) {
            return 0;
        }
    },
    ['weekly-views'],
    { revalidate: 600, tags: ['views'] }
);

export async function getAllPropertySlugs(): Promise<string[]> {
    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from('properties')
            .select('slug')
            .not('estado', 'in', '("Vendido","Reservado")');

        if (error) {
            console.error('[DB] Error fetching property slugs:', error.message);
            return [];
        }

        return (data || []).map((p: { slug: string }) => p.slug);
    } catch (err) {
        console.error('[DB] Unexpected error fetching property slugs:', err);
        return [];
    }
}

