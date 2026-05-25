import { ImageResponse } from 'next/og';
import { createPublicClient } from '@/lib/supabase-server';
import { SITE_URL } from '@/lib/supabase/constants';

// Cambiado de 'edge' a 'nodejs' porque Satori/ImageResponse devuelve 0 bytes
// en el Edge runtime de Next.js 16 (posible incompatibilidad con la versión rc).
export const runtime = 'nodejs';

function formatCOP(price: number): string {
    return '$' + price.toLocaleString('es-CO', { style: 'decimal', maximumFractionDigits: 0 }) + ' COP';
}

function getTipoDisplay(tipo: string): string {
    const map: Record<string, string> = {
        casa: 'Casa',
        apartamento: 'Apartamento',
        lote: 'Lote',
        proyecto: 'Proyecto',
        local: 'Local',
        oficina: 'Oficina',
        bodega: 'Bodega',
        finca: 'Finca',
        comercial: 'Inmueble Comercial',
    };
    return map[tipo?.toLowerCase()] || 'Propiedad';
}

async function loadFont(): Promise<ArrayBuffer | null> {
    try {
        const cssResp = await fetch(
            'https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&display=swap',
            { signal: AbortSignal.timeout(5000) }
        );
        const css = await cssResp.text();
        const match = css.match(/src: url\((.+?)\)/);
        if (!match) return null;
        const fontResp = await fetch(match[1], { signal: AbortSignal.timeout(5000) });
        return await fontResp.arrayBuffer();
    } catch {
        return null;
    }
}

interface PropertyData {
    titulo: string | null;
    precio: number;
    habitaciones: number;
    baños: number;
    area_m2: number;
    operacion: string;
    tipo: string;
    barrio: string;
    ciudad: string;
    imagen_principal: string | null;
}

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    let property: PropertyData | null = null;

    try {
        const supabase = createPublicClient();
        const { data } = await supabase
            .from('properties')
            .select('titulo, precio, habitaciones, baños, area_m2, operacion, tipo, barrio, ciudad, imagen_principal')
            .eq('slug', slug)
            .maybeSingle();
        property = data as PropertyData | null;
    } catch {
        property = null;
    }

    const fontData = await loadFont();

    const bgImage = property?.imagen_principal
        ? property.imagen_principal.includes('/upload/')
            ? property.imagen_principal.replace('/upload/', '/upload/f_auto,q_auto,c_fill,w_1200,h_630,g_auto/')
            : property.imagen_principal
        : `${SITE_URL}/og-default.jpg`;

    const tipoDisplay = property ? getTipoDisplay(property.tipo) : 'Propiedad';
    const operationText = property?.operacion === 'arriendo' ? 'En Arriendo' : (property?.tipo === 'proyecto' ? 'Proyecto' : 'En Venta');

    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    position: 'relative',
                    backgroundColor: '#1a1a2e',
                    fontFamily: fontData ? 'Outfit' : 'sans-serif',
                }}
            >
                <img
                    src={bgImage}
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                    }}
                    alt=""
                />

                <div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)',
                    }}
                />

                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 100%)',
                        padding: '32px 50px 60px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 14,
                        }}
                    >
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                            <rect width="40" height="40" rx="10" fill="white" />
                            <text x="20" y="26" textAnchor="middle" fontSize="22" fill="#1a1a2e">🏠</text>
                        </svg>
                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                color: 'white',
                                fontSize: 16,
                                fontWeight: 700,
                                letterSpacing: '-0.3',
                                textShadow: '0 1px 4px rgba(0,0,0,0.4)',
                            }}
                        >
                            <span>Inmobiliaria</span>
                            <span>Tucasa Los Patios</span>
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            backgroundColor: 'rgba(255,255,255,0.95)',
                            color: '#1a1a2e',
                            padding: '10px 22px',
                            borderRadius: 30,
                            fontSize: 15,
                            fontWeight: 700,
                            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                        }}
                    >
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                            <circle cx="5" cy="5" r="5" fill={operationText === 'En Arriendo' ? '#2d8cf0' : '#e63946'} />
                        </svg>
                        {operationText}
                    </div>
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        padding: '40px 50px 45px',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <div
                        style={{
                            fontSize: 48,
                            fontWeight: 800,
                            color: '#fff',
                            marginBottom: 8,
                            textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            display: 'flex',
                        }}
                    >
                        {property ? formatCOP(property.precio) : ''}
                    </div>

                    <div
                        style={{
                            fontSize: 28,
                            fontWeight: 600,
                            color: '#fff',
                            opacity: 0.95,
                            textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                            display: 'flex',
                            marginBottom: 14,
                        }}
                    >
                        {property ? `${tipoDisplay} en ${operationText.replace('En ', '').toLowerCase()} en ${property.barrio || ''}, ${property.ciudad || ''}` : 'Inmobiliaria Tucasa Los Patios'}
                    </div>

                    {property && (
                        <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                            {property.habitaciones > 0 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: '#fff',
                                        fontSize: 17,
                                        fontWeight: 600,
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        padding: '7px 16px',
                                        borderRadius: 20,
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M3 7v11a1 1 0 001 1h16a1 1 0 001-1V7" />
                                        <path d="M21 7H3l2-4h14l2 4z" />
                                        <path d="M7 11h4v2H7z" />
                                        <path d="M13 11h4v2h-4z" />
                                    </svg>
                                    {property.habitaciones}
                                </div>
                            )}
                            {property.baños > 0 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: '#fff',
                                        fontSize: 17,
                                        fontWeight: 600,
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        padding: '7px 16px',
                                        borderRadius: 20,
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <path d="M4 12h16a1 1 0 011 1v3a4 4 0 01-4 4H7a4 4 0 01-4-4v-3a1 1 0 011-1z" />
                                        <path d="M6 12V5a2 2 0 012-2h2a2 2 0 012 2v7" />
                                    </svg>
                                    {property.baños}
                                </div>
                            )}
                            {property.area_m2 > 0 && (
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 6,
                                        color: '#fff',
                                        fontSize: 17,
                                        fontWeight: 600,
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        padding: '7px 16px',
                                        borderRadius: 20,
                                    }}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <path d="M3 12h18" />
                                        <path d="M12 3v18" />
                                    </svg>
                                    {property.area_m2} m²
                                </div>
                            )}
                        </div>
                    )}

                    {property && (
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 6,
                                color: 'rgba(255,255,255,0.8)',
                                fontSize: 17,
                                fontWeight: 500,
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {property.barrio}, {property.ciudad} &middot; Norte de Santander
                        </div>
                    )}
                </div>

                <div
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: 'linear-gradient(90deg, #e63946 0%, #f4a261 50%, #e63946 100%)',
                    }}
                />
            </div>
        ),
        {
            width: 1200,
            height: 630,
            fonts: fontData ? [{ name: 'Outfit', data: fontData, style: 'normal', weight: 400 as const }] : undefined,
            headers: {
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        }
    );
}
