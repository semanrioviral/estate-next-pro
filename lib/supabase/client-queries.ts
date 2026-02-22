import { supabase } from '@/lib/supabase';
import { slugify } from './seo-helpers';
import { isValidFilter } from './constants';

/**
 * Obtiene barrios únicos con inventario activo por ciudad (Versión para Cliente).
 * No depende de next/headers ni de supabase-server.ts
 */
export async function getActiveBarriosByCity(ciudadSlug: string): Promise<{ nombre: string; slug: string }[]> {
    try {
        // 1. Obtener la ciudad normalizada
        const validation = isValidFilter(ciudadSlug);
        if (validation.type !== 'ciudad') return [];

        // 2. Consultar barrios únicos desde la tabla properties
        // Join con la tabla barrios para obtener el slug real
        const { data, error } = await supabase
            .from('properties')
            .select('ciudad, barrio, barrios(slug)')
            .not('barrio', 'is', null);

        if (error) {
            console.error('[DB] Error fetching active barrios:', error.message);
            return [];
        }

        // 3. Filtrar por ciudad (slugify matches normalized city slug)
        const filteredBarrios = (data as any[])
            .filter(p => {
                const hasBarrio = !!p.barrio;
                const cityMatch = p.ciudad && slugify(p.ciudad) === validation.normalized;
                return hasBarrio && cityMatch;
            })
            .map(p => ({
                nombre: p.barrio,
                slug: p.barrios?.slug || slugify(p.barrio)
            }))
            .filter((v, i, a) => a.findIndex(t => t.slug === v.slug) === i);

        return filteredBarrios.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } catch (err) {
        console.error('[CLIENT DB] Exception in getActiveBarriosByCity:', err);
        return [];
    }
}
