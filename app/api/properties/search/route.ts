import { NextRequest, NextResponse } from 'next/server';
import {
    getProperties,
    getPropertiesByOperacion,
    getPropertiesByOperacionAndCiudad,
    getPropertiesByOperacionCiudadTipo,
    getPropertiesByOperacionAndTagSlug,
    getPropertiesByOperacionCiudadTipoAndTagSlug,
    getPropertiesByCity,
    getPropertiesByTagSlug,
    getPropertiesByBarrioSlug,
} from '@/lib/supabase/properties';
import { CIUDAD_MAP } from '@/lib/supabase/constants';
import type { Property } from '@/lib/supabase/properties';

/**
 * POST /api/properties/search
 *
 * Unified API endpoint for "Load More" progressive browsing.
 * Accepts a JSON body describing which catalog source to query
 * and returns a single page of paginated property results.
 *
 * Body:
 *   source:       'operacion' | 'operacion_ciudad' | 'operacion_ciudad_tipo'
 *                 | 'all' | 'city' | 'tag' | 'barrio' | 'operacion_tag'
 *                 | 'operacion_ciudad_tipo_tag'
 *   operacion?:   'venta' | 'arriendo'
 *   ciudadSlug?:  string   (slug of the ciudad, e.g. "cucuta", "los-patios")
 *   tipoSlug?:    string   (slug of the tipo, e.g. "casa", "apartamento")
 *   tagSlug?:     string   (slug of the tag, e.g. "caja-honor")
 *   barrioSlug?:  string
 *   habitaciones?: number
 *   orden?:       string   (e.g. "precio_asc", "precio_desc", "area_asc")
 *   page:         number   (1-indexed, defaults to 1)
 *
 * Response: { properties: Property[], totalCount: number }
 */

interface SearchRequestBody {
    source?: string;
    operacion?: string;
    ciudadSlug?: string;
    tipoSlug?: string;
    tagSlug?: string;
    barrioSlug?: string;
    habitaciones?: number;
    orden?: string;
    page?: number;
}

export async function POST(request: NextRequest) {
    try {
        const body: SearchRequestBody = await request.json();
        const page = body.page || 1;
        const source = body.source || 'all';

        let result: { properties: Property[]; totalCount: number } = { properties: [], totalCount: 0 };

        switch (source) {
            case 'operacion':
                result = await getPropertiesByOperacion(
                    body.operacion || 'venta',
                    body.habitaciones,
                    body.orden,
                    page
                );
                break;

            case 'operacion_ciudad':
                result = (await getPropertiesByOperacionAndCiudad(
                    body.operacion || 'venta',
                    body.ciudadSlug || '',
                    body.barrioSlug,
                    body.habitaciones,
                    body.orden,
                    page
                )) ?? { properties: [], totalCount: 0 };
                break;

            case 'operacion_ciudad_tipo':
                result = (await getPropertiesByOperacionCiudadTipo(
                    body.operacion || 'venta',
                    body.ciudadSlug || '',
                    body.tipoSlug || '',
                    body.barrioSlug,
                    body.habitaciones,
                    body.orden,
                    page
                )) ?? { properties: [], totalCount: 0 };
                break;

            case 'operacion_tag':
                result = await getPropertiesByOperacionAndTagSlug(
                    body.operacion as 'venta' | 'arriendo',
                    body.tagSlug || '',
                    body.orden,
                    page
                );
                break;

            case 'operacion_ciudad_tipo_tag': {
                const tagResult = await getPropertiesByOperacionCiudadTipoAndTagSlug(
                    body.operacion as 'venta' | 'arriendo',
                    body.ciudadSlug || '',
                    body.tipoSlug || '',
                    body.tagSlug || '',
                    body.orden,
                    page
                );
                result = tagResult || { properties: [], totalCount: 0 };
                break;
            }

            case 'city':
                result = await getPropertiesByCity(
                    CIUDAD_MAP[body.ciudadSlug || ''] || body.ciudadSlug || '',
                    body.orden,
                    page
                );
                break;

            case 'tag':
                result = await getPropertiesByTagSlug(
                    body.tagSlug || '',
                    body.orden,
                    page
                );
                break;

            case 'barrio':
                result = await getPropertiesByBarrioSlug(
                    body.barrioSlug || '',
                    body.orden,
                    page
                );
                break;

            case 'all':
            default:
                result = await getProperties(body.orden, page);
                break;
        }

        return NextResponse.json({
            properties: result.properties,
            totalCount: result.totalCount,
        });
    } catch (error) {
        console.error('[API] Error in /api/properties/search:', error);
        return NextResponse.json(
            { error: 'Internal server error', properties: [], totalCount: 0 },
            { status: 500 }
        );
    }
}
