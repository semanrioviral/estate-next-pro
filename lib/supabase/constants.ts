/**
 * Constantes compartidas para validación de filtros y SEO.
 * Este archivo no contiene dependencias de servidor (como next/headers).
 */

export const VALID_CITIES = ['cucuta', 'los-patios', 'villa-del-rosario'];
export const VALID_TYPES = ['casa', 'apartamento', 'lote', 'proyecto', 'local', 'oficina', 'bodega', 'finca', 'comercial'];

/**
 * Normalización de slugs para búsqueda y rutas.
 * Maneja plurales comunes y asegura consistencia con VALID_CITIES y VALID_TYPES.
 */
export function normalizeFilterSlug(slug: string): string {
    if (!slug) return '';
    const s = slug.toLowerCase().trim();

    // Mapeo de plurales a singulares para tipos
    const typePlurals: Record<string, string> = {
        'casas': 'casa',
        'apartamentos': 'apartamento',
        'lotes': 'lote',
        'proyectos': 'proyecto',
        'locales': 'local',
        'oficinas': 'oficina',
        'bodegas': 'bodega',
        'fincas': 'finca',
        'comerciales': 'comercial'
    };

    if (typePlurals[s]) return typePlurals[s];

    // Normalización de nombres de ciudad comunes
    if (s === 'patios' || s === 'lospatios') return 'los-patios';
    if (s === 'villa-rosario' || s === 'villarosario') return 'villa-del-rosario';

    return s;
}

export const CIUDAD_MAP: Record<string, string> = {
    'cucuta': 'Cúcuta',
    'los-patios': 'Los Patios',
    'villa-del-rosario': 'Villa del Rosario'
};

export const TIPO_MAP: Record<string, string> = {
    'casa': 'Casa',
    'apartamento': 'Apartamento',
    'lote': 'Lote',
    'proyecto': 'Proyecto',
    'local': 'Local',
    'oficina': 'Oficina',
    'bodega': 'Bodega',
    'finca': 'Finca',
    'comercial': 'Comercial'
};

/**
 * Valida si un slug corresponde a una ciudad o tipo conocido.
 */
export function isValidFilter(slug: string): { isValid: boolean; type: 'ciudad' | 'tipo' | null; normalized: string; dbName: string } {
    const normalized = normalizeFilterSlug(slug);
    if (VALID_CITIES.includes(normalized)) {
        return { isValid: true, type: 'ciudad', normalized, dbName: CIUDAD_MAP[normalized] || normalized };
    }
    if (VALID_TYPES.includes(normalized)) {
        return { isValid: true, type: 'tipo', normalized, dbName: TIPO_MAP[normalized] || normalized };
    }
    return { isValid: false, type: null, normalized, dbName: '' };
}
