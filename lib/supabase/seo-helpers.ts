import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Genera slug SEO-friendly desde un texto
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Convierte array de strings a registros en tabla 'tags'
 * Crea automáticamente tags que no existan usando UPSERT
 * @returns Array de IDs de tags
 */
export async function upsertTags(
    tagNames: string[],
    supabase: SupabaseClient
): Promise<string[]> {
    if (!tagNames || tagNames.length === 0) return [];

    const tagRecords = tagNames.map(name => ({
        nombre: name,
        slug: slugify(name),
        meta_titulo: `${name} - Inmobiliaria Tucasa Los Patios`,
        meta_descripcion: `Propiedades con ${name.toLowerCase()} en Norte de Santander`
    }));

    // UPSERT: crea los que no existen, actualiza los existentes
    const { data, error } = await supabase
        .from('tags')
        .upsert(tagRecords, {
            onConflict: 'slug',
            ignoreDuplicates: false
        })
        .select('id');

    if (error) {
        console.error('[SEO] Error upserting tags:', error.message);
        throw new Error(`Error al sincronizar tags: ${error.message}`);
    }

    return data?.map(t => t.id) || [];
}

/**
 * Convierte array de strings a registros en tabla 'amenidades'
 * Crea automáticamente amenidades que no existan usando UPSERT
 * @returns Array de IDs de amenidades
 */
export async function upsertAmenidades(
    amenidadNames: string[],
    supabase: SupabaseClient
): Promise<string[]> {
    if (!amenidadNames || amenidadNames.length === 0) return [];

    const amenidadRecords = amenidadNames.map(name => ({
        nombre: name,
        slug: slugify(name)
    }));

    // UPSERT: crea las que no existen, actualiza las existentes
    const { data, error } = await supabase
        .from('amenidades')
        .upsert(amenidadRecords, {
            onConflict: 'slug',
            ignoreDuplicates: false
        })
        .select('id');

    if (error) {
        console.error('[SEO] Error upserting amenidades:', error.message);
        throw new Error(`Error al sincronizar amenidades: ${error.message}`);
    }

    return data?.map(a => a.id) || [];
}

/**
 * Sincroniza relación property ↔ tags
 * Usa UPSERT para evitar errores de PK duplicada
 */
export async function syncPropertyTags(
    propertyId: string,
    tagIds: string[],
    supabase: SupabaseClient
): Promise<void> {
    // 1. Eliminar relaciones anteriores
    await supabase.from('property_tags').delete().eq('property_id', propertyId);

    // 2. Si no hay tags, terminar aquí
    if (!tagIds || tagIds.length === 0) return;

    // 3. Crear nuevas relaciones usando UPSERT (evita conflictos de PK)
    const propertyTags = tagIds.map(tagId => ({
        property_id: propertyId,
        tag_id: tagId
    }));

    const { error } = await supabase
        .from('property_tags')
        .upsert(propertyTags, { onConflict: 'property_id,tag_id' });

    if (error) {
        console.error('[SEO] Error syncing property_tags:', error.message);
        throw new Error(`Error al vincular tags: ${error.message}`);
    }
}

/**
 * Sincroniza relación property ↔ amenidades
 * Usa UPSERT para evitar errores de PK duplicada
 */
export async function syncPropertyAmenidades(
    propertyId: string,
    amenidadIds: string[],
    supabase: SupabaseClient
): Promise<void> {
    // 1. Eliminar relaciones anteriores
    await supabase.from('property_amenidades').delete().eq('property_id', propertyId);

    // 2. Si no hay amenidades, terminar aquí
    if (!amenidadIds || amenidadIds.length === 0) return;

    // 3. Crear nuevas relaciones usando UPSERT (evita conflictos de PK)
    const propertyAmenidades = amenidadIds.map(amenidadId => ({
        property_id: propertyId,
        amenidad_id: amenidadId
    }));

    const { error } = await supabase
        .from('property_amenidades')
        .upsert(propertyAmenidades, { onConflict: 'property_id,amenidad_id' });

    if (error) {
        console.error('[SEO] Error syncing property_amenidades:', error.message);
        throw new Error(`Error al vincular amenidades: ${error.message}`);
    }
}

/**
 * Crea o actualiza un barrio y retorna su ID
 * Asegura consistencia de slugs y evita duplicados
 */
export async function upsertBarrio(
    nombre: string,
    ciudad: string,
    supabase: SupabaseClient
): Promise<string> {
    if (!nombre) throw new Error('El nombre del barrio es requerido');

    const barrioRecord = {
        nombre: nombre,
        slug: slugify(nombre),
        ciudad: ciudad
    };

    // UPSERT por slug para evitar duplicados tipo "Llanitos" vs "llanitos"
    const { data, error } = await supabase
        .from('barrios')
        .upsert(barrioRecord, {
            onConflict: 'slug',
            ignoreDuplicates: false
        })
        .select('id')
        .single();

    if (error) {
        console.error('[SEO] Error upserting barrio:', error.message);
        throw new Error(`Error al sincronizar barrio: ${error.message}`);
    }

    return data.id;
}

/**
 * Optimiza las URLs de Cloudinary agregando parámetros de autoformato, calidad y ancho automático.
 * f_auto: formato automático (webp/avif)
 * q_auto: calidad automática
 * w_auto: ancho automático (útil para transformaciones dinámicas)
 */
export function optimizeCloudinaryUrl(url: string, width: number | 'auto' = 'auto'): string {
    if (!url) return '';
    if (url.includes('cloudinary.com') && !url.includes('f_auto,q_auto')) {
        // Formato estándar: .../upload/v123456/path
        if (url.includes('/upload/')) {
            const params = `f_auto,q_auto${width ? `,w_${width}` : ''}`;
            return url.replace('/upload/', `/upload/${params}/`);
        }
    }
    return url;
}
