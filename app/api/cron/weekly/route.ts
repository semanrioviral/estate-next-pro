import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 60; // Cron can take longer due to multiple API calls

// ── Types (manual, avoid Supabase TS parser confusion with special chars) ──
interface CronProperty {
    id: string;
    titulo: string;
    descripcion: string | null;
    descripcion_corta: string | null;
    precio: number;
    barrio: string | null;
    ciudad: string;
    slug: string;
    tipo: string | null;
    operacion: string;
    habitaciones: number | null;
    baños: number | null;
    area_m2: number | null;
    imagen_principal: string | null;
}

/**
 * Weekly Automation Cron
 *
 * Runs on schedule (default: every Monday 9AM COT) to:
 * 1. Pick a random featured/available property
 * 2. Create a blog post about it
 * 3. Publish a GBP post about it
 *
 * Auth: x-vercel-cron (Vercel built-in) or Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
    const startTime = Date.now();

    try {
        // ── Auth ──────────────────────────────────────────────
        // If CRON_SECRET is configured, require it. If not, allow (graceful fallback).
        const authHeader = request.headers.get('authorization');
        const secret = process.env.CRON_SECRET;
        const isDev = process.env.NODE_ENV === 'development';

        if (!isDev && secret && authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();
        const results: Record<string, unknown>[] = [];

        // ── 1. Pick a property ─────────────────────────────────
        // Use * select to avoid TS parser issues with special chars (baños, área)
        async function fetchProperties(onlyFeatured: boolean): Promise<CronProperty[]> {
            let query = supabase
                .from('properties')
                .select('*')
                .neq('estado', 'vendida')
                .limit(30);

            if (onlyFeatured) {
                query = query.eq('destacado', true).limit(10);
            }

            const { data, error } = await query;
            if (error) {
                console.error(`Fetch properties (featured=${onlyFeatured}):`, error);
                return [];
            }
            return (data || []) as unknown as CronProperty[];
        }

        let pool = await fetchProperties(true);
        if (!pool.length) {
            pool = await fetchProperties(false);
        }

        if (!pool.length) {
            return NextResponse.json({
                success: false,
                error: 'No available properties found',
                duration: `${Date.now() - startTime}ms`
            }, { status: 404 });
        }

        // Random selection
        const property = pool[Math.floor(Math.random() * pool.length)];

        results.push({
            step: 'pick-property',
            success: true,
            propertyId: property.id,
            title: property.titulo
        });

        // ── 2. Create Blog Post ────────────────────────────────
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            maximumFractionDigits: 0
        }).format(property.precio);

        const tipoLabel =
            property.tipo === 'casa' ? 'Casa' :
            property.tipo === 'apartamento' ? 'Apartamento' :
            property.tipo === 'lote' ? 'Lote' : 'Propiedad';

        const operacionLabel = property.operacion === 'venta' ? 'Venta' : 'Arriendo';
        const categoria =
            property.tipo === 'lote' ? 'Inversión' :
            'Compra y Venta';

        // Sanitize slug: remove special chars, lowercase, hyphenate
        const cleanSlug = (s: string) =>
            s.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

        const baseSlug = cleanSlug(`propiedad-en-venta-en-${property.slug}`);
        let blogSlug = baseSlug;

        // Ensure slug uniqueness
        const { data: existing } = await supabase
            .from('blog_posts')
            .select('slug')
            .eq('slug', blogSlug)
            .maybeSingle();

        if (existing) {
            blogSlug = `${baseSlug}-${Date.now().toString(36)}`;
        }

        const title = `${tipoLabel} en ${operacionLabel} en ${property.barrio || property.ciudad}, ${property.ciudad}`;
        const excerpt = property.descripcion_corta ||
            `Descubre esta ${tipoLabel.toLowerCase()} en ${property.barrio || property.ciudad}. ` +
            `${property.habitaciones ?? '—'} habitaciones, ${property.baños ?? '—'} baños, ` +
            `${property.area_m2 ?? '—'}m². ${formattedPrice}.`;

        const metaDescripcion =
            `${tipoLabel} en ${operacionLabel.toLowerCase()} en ${property.barrio || property.ciudad}, ${property.ciudad}. ` +
            `${property.habitaciones ? property.habitaciones + ' hab, ' : ''}` +
            `${property.baños ? property.baños + ' bañ, ' : ''}` +
            `${property.area_m2 ? property.area_m2 + 'm². ' : ''}` +
            `${formattedPrice}. ¡Agenda tu cita!`.substring(0, 160);

        const desc = property.descripcion || 'Propiedad disponible en excelente ubicación.';

        const contenidos = [
            // Template 1: Block-style with features list
            `${tipoLabel} en ${operacionLabel} — ${property.barrio || property.ciudad}, ${property.ciudad}

${desc}

**Características Principales**
- Tipo: ${tipoLabel}
- Operación: ${operacionLabel}
- Ubicación: ${property.barrio || property.ciudad}, ${property.ciudad}
- Precio: ${formattedPrice}
- Área: ${property.area_m2 ? property.area_m2 + ' m²' : '—'}
- Habitaciones: ${property.habitaciones ?? '—'}
- Baños: ${property.baños ?? '—'}

**Ubicación Estratégica**
${property.barrio || property.ciudad} es una de las zonas más atractivas del área metropolitana, con excelente conectividad, cerca de centros comerciales, instituciones educativas y principales vías de acceso.

**Agende su Visita**
No pierda la oportunidad de conocer personalmente esta propiedad.

Agendar Visita → https://tucasalospatios.com/propiedades/${property.slug}
WhatsApp: https://wa.me/573214699604?text=Hola,%20me%20interesa%20la%20propiedad%20${encodeURIComponent(property.titulo)}

---

*Artículo generado el ${new Date().toLocaleDateString('es-CO')} — Precios y disponibilidad sujetos a cambio.*`,

            // Template 2: Table-style with CTA
            `${tipoLabel} Disponible en ${property.barrio || property.ciudad} — Oportunidad de Inversión

${desc}

**Lo Que Necesita Saber**
Tipo: ${tipoLabel} | Ubicación: ${property.barrio || property.ciudad}, ${property.ciudad} | Precio: ${formattedPrice}
Área: ${property.area_m2 ? property.area_m2 + ' m²' : '—'} | Habitaciones: ${property.habitaciones ?? '—'} | Baños: ${property.baños ?? '—'}

**El Sector**
${property.barrio || property.ciudad} se ha consolidado como uno de los sectores más atractivos para la inversión inmobiliaria, con alta plusvalía y calidad de vida.

**¡Separe su Cita!**
WhatsApp: https://wa.me/573214699604?text=Quiero%20agendar%20una%20visita%20para%20${encodeURIComponent(property.titulo)}
Ficha completa: https://tucasalospatios.com/propiedades/${property.slug}

---

${new Date().toLocaleDateString('es-CO')} — Inmobiliaria Tu Casa Los Patios. Cra. 4 #23a-18, Los Patios.`
        ];

        // Alternate template based on property id
        const contentIndex = property.id.charCodeAt(0) % contenidos.length;
        const contenido = contenidos[contentIndex];

        // Check if this property was already blogged
        const { data: alreadyBlogged } = await supabase
            .from('blog_posts')
            .select('id')
            .ilike('slug', `%${property.slug}%`)
            .order('created_at', { ascending: false })
            .limit(1);

        let blogResult: {
            data: unknown;
            error: { message: string } | null;
        };

        if (alreadyBlogged?.length) {
            // Update existing
            blogResult = await supabase
                .from('blog_posts')
                .update({
                    titulo: title,
                    excerpt,
                    contenido,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', alreadyBlogged[0].id)
                .select()
                .single() as unknown as typeof blogResult;

            results.push({
                step: 'create-blog-post',
                action: 'updated',
                success: !blogResult.error,
                postId: alreadyBlogged[0].id,
                error: blogResult.error?.message || null
            });
        } else {
            // Create new
            blogResult = await supabase
                .from('blog_posts')
                .insert({
                    titulo: title,
                    slug: blogSlug,
                    excerpt,
                    contenido,
                    ciudad: property.ciudad,
                    categoria,
                    meta_titulo: title.substring(0, 60),
                    meta_descripcion: metaDescripcion,
                    status: 'published',
                    published: true,
                    published_at: new Date().toISOString(),
                })
                .select()
                .single() as unknown as typeof blogResult;

            results.push({
                step: 'create-blog-post',
                action: 'created',
                success: !blogResult.error,
                slug: blogSlug,
                error: blogResult.error?.message || null
            });
        }

        // ── 3. Create GBP Post ──────────────────────────────────
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucasalospatios.com';
        const propertyUrl = `${siteUrl}/propiedades/${property.slug}`;

        const viaSocketUrl = process.env.VIASOCKET_MCP_URL;

        // Helper: try legacy auto-poster as fallback
        const callLegacyPoster = async () => {
            return await fetch(
                `${siteUrl}/api/automation/google-business`,
                {
                    headers: {
                        'Authorization': `Bearer ${secret || ''}`
                    },
                    signal: AbortSignal.timeout(10000)
                }
            );
        };

        if (viaSocketUrl) {
            try {
                // viaSocket MCP exposes ONE tool: "Google_Business_Profile"
                // with action_name enum to select the specific GBP action.
                // "Create Local Post" = row286m6edjb
                const mcpPayload = {
                    jsonrpc: '2.0',
                    id: 1,
                    method: 'tools/call',
                    params: {
                        name: 'Google_Business_Profile',
                        arguments: {
                            thread_id: `cron-weekly-${Date.now().toString(36)}`,
                            action_name: 'row286m6edjb',
                            instructions: [
                                `Create a Local Post on Google Business Profile.`,
                                `Topic type: STANDARD`,
                                `Summary:`,
                                `🏡 ${property.titulo}`,
                                `📍 ${property.barrio || property.ciudad}, ${property.ciudad}`,
                                `💰 ${formattedPrice}`,
                                ``,
                                `Learn more: ${propertyUrl}`,
                                `Call to action: LEARN_MORE → ${propertyUrl}`
                            ].join('\n')
                        }
                    }
                };

                const viaSocketResponse = await fetch(viaSocketUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/event-stream',
                    },
                    body: JSON.stringify(mcpPayload),
                    signal: AbortSignal.timeout(60000)
                });

                const viaSocketText = await viaSocketResponse.text();
                let viaSocketData: unknown;
                try {
                    viaSocketData = JSON.parse(viaSocketText);
                } catch {
                    viaSocketData = viaSocketText;
                }

                results.push({
                    step: 'create-gbp-post',
                    method: 'viasocket',
                    success: viaSocketResponse.ok,
                    response: viaSocketData
                });

                if (!viaSocketResponse.ok) {
                    // Fallback if viaSocket fails
                    console.warn('viaSocket returned non-OK, trying legacy fallback');
                    const legacyFallback = await callLegacyPoster();
                    const legacyData = await legacyFallback.json();
                    results.push({
                        step: 'create-gbp-post-fallback',
                        method: 'legacy-fallback',
                        success: legacyFallback.ok,
                        response: legacyData
                    });
                }

            } catch (mcpError: unknown) {
                const mcpErrMsg = mcpError instanceof Error ? mcpError.message : String(mcpError);
                console.error('viaSocket MCP call failed:', mcpErrMsg);

                const legacyResponse = await callLegacyPoster();
                const legacyData = await legacyResponse.json();
                results.push({
                    step: 'create-gbp-post',
                    method: 'legacy-fallback',
                    success: legacyResponse.ok,
                    viasocketError: mcpErrMsg,
                    response: legacyData
                });
            }
        } else {
            // No viaSocket — use legacy auto-poster
            const legacyResponse = await callLegacyPoster();
            const legacyData = await legacyResponse.json();
            results.push({
                step: 'create-gbp-post',
                method: 'legacy',
                success: legacyResponse.ok,
                response: legacyData
            });
        }

        // ── Response ────────────────────────────────────────────
        const duration = `${Date.now() - startTime}ms`;

        return NextResponse.json({
            success: true,
            cron: 'weekly',
            timestamp: new Date().toISOString(),
            duration,
            property: {
                id: property.id,
                titulo: property.titulo,
                slug: property.slug,
                ciudad: property.ciudad
            },
            results
        });

    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('[CRON-WEEKLY] Fatal error:', errMsg);

        return NextResponse.json({
            success: false,
            error: 'Internal Server Error',
            message: errMsg,
            duration: `${Date.now() - startTime}ms`
        }, { status: 500 });
    }
}
