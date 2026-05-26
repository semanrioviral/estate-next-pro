import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export const maxDuration = 60;

// ── Types ──
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
    estrato: number | null;
    parqueaderos: number | null;
    antigüedad: string | null;
    negociable: boolean | null;
    financiamiento: string | null;
    estado: string | null;
    servicios: string[] | null;
    moneda: string | null;
    año_construccion: number | null;
}

interface ImageResult {
    url: string;
    es_principal: boolean | null;
}

/**
 * Weekly Automation Cron
 *
 * Runs every Monday 9AM COT to:
 * 1. Pick a random featured/available property
 * 2. Generate & publish SEO-optimized blog post
 * 3. Publish a GBP post with photo
 */
export async function GET(request: Request) {
    const startTime = Date.now();

    try {
        // ── Auth ──
        const authHeader = request.headers.get('authorization');
        const secret = process.env.CRON_SECRET;
        const isDev = process.env.NODE_ENV === 'development';

        if (!isDev && secret && authHeader !== `Bearer ${secret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createAdminClient();
        const results: Record<string, unknown>[] = [];

        // ── 1. Pick a property ──
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

        const property = pool[Math.floor(Math.random() * pool.length)];

        results.push({
            step: 'pick-property',
            success: true,
            propertyId: property.id,
            title: property.titulo
        });

        // ── 2. Format data ──
        const formattedPrice = new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: property.moneda || 'COP',
            maximumFractionDigits: 0
        }).format(property.precio);

        const formattedPriceShort = new Intl.NumberFormat('es-CO', {
            style: 'decimal',
            maximumFractionDigits: 0
        }).format(property.precio);

        const tipoLabel =
            property.tipo === 'casa' ? 'Casa' :
            property.tipo === 'apartamento' ? 'Apartamento' :
            property.tipo === 'lote' ? 'Lote' :
            property.tipo === 'comercial' ? 'Local Comercial' :
            property.tipo === 'proyecto' ? 'Proyecto' : 'Propiedad';

        const operacionLabel = property.operacion === 'venta' ? 'Venta' : 'Arriendo';
        const operacionPrep = property.operacion === 'venta' ? 'en venta' : 'en arriendo';

        const categoria =
            property.tipo === 'lote' ? 'Inversión' :
            property.tipo === 'proyecto' ? 'Proyectos' :
            'Compra y Venta';

        const ubicacionStr = `${property.barrio ? property.barrio + ', ' : ''}${property.ciudad}`;

        // ── 3. Fetch additional data ──
        // 3a. Property images (for GBP post)
        const { data: propertyImages } = await supabase
            .from('property_images')
            .select('url, es_principal')
            .eq('property_id', property.id)
            .order('es_principal', { ascending: false })
            .order('orden', { ascending: true })
            .limit(5) as unknown as { data: ImageResult[] | null };

        const mainImage = property.imagen_principal ||
            propertyImages?.find(i => i.es_principal)?.url ||
            propertyImages?.[0]?.url ||
            null;

        const allImages = propertyImages?.map(i => i.url).filter(Boolean) || [];
        const galleryImages = allImages.length > 1 ? allImages.slice(1) : [];

        // 3b. Property amenities
        const { data: amenidadLinks } = await supabase
            .from('property_amenidades')
            .select('amenidad_id')
            .eq('property_id', property.id);

        let amenidadNames: string[] = [];
        if (amenidadLinks?.length) {
            const ids = amenidadLinks.map(a => a.amenidad_id);
            const { data: amenidades } = await supabase
                .from('amenidades')
                .select('nombre')
                .in('id', ids);
            amenidadNames = (amenidades || []).map(a => a.nombre);
        }

        // Merge servicios + amenidades
        const allFeatures = [
            ...(property.servicios || []),
            ...amenidadNames.filter(n => !(property.servicios || []).some(s =>
                s.toLowerCase().includes(n.toLowerCase())
            ))
        ];

        // ── 4. Generate SEO blog content ──
        const cleanSlug = (s: string) =>
            s.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9-]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');

        const baseSlug = cleanSlug(`${tipoLabel.toLowerCase()}-${operacionPrep.replace(' ', '-')}-${property.slug}`);
        let blogSlug = baseSlug;

        const { data: existingSlug } = await supabase
            .from('blog_posts')
            .select('slug')
            .eq('slug', blogSlug)
            .maybeSingle();

        if (existingSlug) {
            blogSlug = `${baseSlug}-${Date.now().toString(36)}`;
        }

        const title = `${tipoLabel} ${operacionPrep} en ${ubicacionStr}`;

        // SEO Meta description (max 160 chars)
        const metaDescripcion = (
            `${tipoLabel} ${operacionPrep} en ${ubicacionStr}. ` +
            (property.habitaciones ? `${property.habitaciones} hab, ` : '') +
            (property.baños ? `${property.baños} baños, ` : '') +
            (property.area_m2 ? `${property.area_m2}m², ` : '') +
            `${formattedPrice}. ` +
            (property.negociable ? 'Precio negociable. ' : '') +
            `✓ Trato directo con Inmobiliaria Tu Casa Los Patios. ¡Agenda tu visita!`
        ).substring(0, 160);

        // SEO-optimized excerpt (for blog cards)
        const excerpt = property.descripcion_corta ||
            `${tipoLabel} ${operacionPrep} en ${ubicacionStr}. ` +
            `${property.habitaciones ? property.habitaciones + ' habitaciones, ' : ''}` +
            `${property.baños ? property.baños + ' baños, ' : ''}` +
            `${property.area_m2 ? property.area_m2 + 'm², ' : ''}` +
            `${formattedPrice}. ` +
            `Conoce todos los detalles y agenda tu visita.`;

        // ---- SEO Blog Content Template ----
        // Rich, structured content optimized for search intent
        const introDesc = property.descripcion ||
            `${tipoLabel} disponible ${operacionPrep} en ${ubicacionStr}. ` +
            `Una excelente oportunidad en el mercado inmobiliario de Norte de Santander.`;

        // Build features bullet list
        const featuresBullets = [
            `**Tipo de propiedad:** ${tipoLabel}`,
            `**Operación:** ${operacionLabel}`,
            `**Ubicación:** ${ubicacionStr}`,
            `**Precio:** ${formattedPrice}${property.negociable ? ' (negociable)' : ''}`,
            property.area_m2 ? `**Área:** ${property.area_m2} m²` : null,
            property.habitaciones ? `**Habitaciones:** ${property.habitaciones}` : null,
            property.baños ? `**Baños:** ${property.baños}` : null,
            property.parqueaderos ? `**Parqueaderos:** ${property.parqueaderos}` : null,
            property.estrato ? `**Estrato:** ${property.estrato}` : null,
            property.antigüedad ? `**Antigüedad:** ${property.antigüedad}` : null,
            property.año_construccion ? `**Año de construcción:** ${property.año_construccion}` : null,
            property.financiamiento ? `**Financiamiento:** ${property.financiamiento}` : null,
        ].filter(Boolean).join('\n');

        // Neighborhood description
        const neighborhoodDesc = property.barrio
            ? `${property.barrio} es un sector residencial bien ubicado en ${property.ciudad}, ` +
              `con fácil acceso a vías principales, transporte público, ` +
              `centros comerciales, instituciones educativas y servicios de salud. ` +
              `Es una zona de alta demanda inmobiliaria por su tranquilidad y ` +
              `excelente relación calidad-precio.`
            : `${property.ciudad} se ha consolidado como uno de los municipios ` +
              `con mayor crecimiento urbano en el área metropolitana de Cúcuta, ` +
              `ofreciendo excelente calidad de vida, conectividad y proyección de valorización.`;

        // FAQ section
        const faqItems = [
            {
                q: `¿Cuál es el precio de ${operacionPrep === 'en venta' ? 'esta' : 'esta'} ${tipoLabel.toLowerCase()}?`,
                a: `El precio de ${operacionPrep === 'en venta' ? 'venta' : 'arriendo'} es de ${formattedPrice}${property.negociable ? ', aunque es negociable.' : '.'} Para más detalles, contáctanos.`
            },
            {
                q: `¿Dónde queda ${operacionPrep === 'en venta' ? 'esta' : 'esta'} ${tipoLabel.toLowerCase()}?`,
                a: `Está ubicada en ${ubicacionStr}, una zona residencial de fácil acceso y con todos los servicios cerca.`
            },
            {
                q: `¿Cómo puedo agendar una visita para ver ${operacionPrep === 'en venta' ? 'esta' : 'esta'} propiedad?`,
                a: `Puedes agendar tu visita llamándonos al 322 304 7435 o enviándonos un WhatsApp. También puedes ver la ficha completa en nuestro sitio web.`
            },
            {
                q: `¿Qué documentos necesito para ${property.operacion === 'venta' ? 'comprar' : 'arrendar'}?`,
                a: `Para ${property.operacion === 'venta' ? 'la compra' : 'el arriendo'} se requiere documentación básica como cédula de ciudadanía, ` +
                   `certificado de tradición y libertad, y en caso de ${property.operacion === 'venta' ? 'compra con crédito hipotecario, carta de aprobación bancaria' : 'contrato laboral y referencias'}. ` +
                   `Nosotros te guiamos en todo el proceso.`
            }
        ];

        const faqSection = faqItems.map((item, i) =>
            `**${i + 1}. ${item.q}**\n${item.a}`
        ).join('\n\n');

        // Main content body
        const sitioUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucasalospatios.com';
        const propUrl = `${sitioUrl}/propiedades/${property.slug}`;
        const whatsappUrl = `https://wa.me/573214699604?text=${encodeURIComponent(`Hola, me interesa la propiedad: ${property.titulo} (${propUrl})`)}`;

        // Rich content with H2/H3 structure
        const contenido_1 = `${tipoLabel} ${operacionPrep} en ${ubicacionStr}

${introDesc}

---

## 📋 Características de la ${tipoLabel.toLowerCase()}

${featuresBullets}

${allFeatures.length ? `**Servicios y amenidades incluidas:**\n${allFeatures.map(f => `✅ ${f.charAt(0).toUpperCase() + f.slice(1)}`).join('\n')}` : ''}

---

## 📍 Ubicación y entorno

${neighborhoodDesc}

${property.barrio ? `${property.barrio} cuenta con vías pavimentadas, alumbrado público, ` +
`transporte urbano cercano y acceso rápido a centros comerciales como ` +
`[venta de centros comerciales locales]. Es una zona con excelente proyección ` +
`de valorización inmobiliaria.` : ''}

---

## 💰 Precio y condiciones

**Precio:** ${formattedPrice}${property.negociable ? ' *(negociable)*' : ''}
${property.financiamiento ? `**Opciones de financiamiento aceptadas:** ${property.financiamiento}` : ''}

> 💡 *¿Te interesa esta propiedad? Contáctanos hoy y recibe asesoría personalizada sin compromiso.*

---

## ❓ Preguntas Frecuentes

${faqSection}

---

## 📞 ¿Cómo agendar una visita?

Puedes contactarnos de las siguientes formas:

📱 **WhatsApp Directo:** [322 304 7435](${whatsappUrl})
📋 **Ficha completa de la propiedad:** [${property.titulo}](${propUrl})
🏢 **Oficina:** Inmobiliaria Tu Casa Los Patios, Cra. 4 #23a-18, Los Patios

---

*Artículo actualizado el ${new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}. ` +
`Precios y disponibilidad sujetos a cambio sin previo aviso. ` +
`© Inmobiliaria Tu Casa Los Patios — Expertos en bienes raíces en Norte de Santander.`;

        const contenido = contenido_1;

        // ── 5. Upsert blog post ──
        const { data: alreadyBlogged } = await supabase
            .from('blog_posts')
            .select('id')
            .ilike('slug', `%${cleanSlug(property.slug)}%`)
            .order('created_at', { ascending: false })
            .limit(1);

        let blogResult: {
            data: unknown;
            error: { message: string } | null;
        };

        if (alreadyBlogged?.length) {
            blogResult = await supabase
                .from('blog_posts')
                .update({
                    titulo: title,
                    excerpt,
                    contenido,
                    meta_titulo: title.substring(0, 60),
                    meta_descripcion: metaDescripcion,
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

        // ── 6. Create GBP Post (with photo via Google API) ──
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucasalospatios.com';
        const propertyUrl = `${siteUrl}/propiedades/${property.slug}`;

        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const googleRefreshToken = process.env.GOOGLE_REFRESH_TOKEN;
        const googleAccountId = process.env.GOOGLE_ACCOUNT_ID;
        const googleLocationId = process.env.GOOGLE_LOCATION_ID;
        const viaSocketUrl = process.env.VIASOCKET_MCP_URL;

        // Helper: post via Google My Business API directly (supports photos)
        const postToGoogleDirect = async (): Promise<{ ok: boolean; data: unknown }> => {
            if (!googleClientId || !googleClientSecret || !googleRefreshToken ||
                !googleAccountId || !googleLocationId) {
                return { ok: false, data: { error: 'Missing Google OAuth or account vars' } };
            }

            try {
                // Get access token via OAuth
                const tokenResp = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        client_id: googleClientId,
                        client_secret: googleClientSecret,
                        refresh_token: googleRefreshToken,
                        grant_type: 'refresh_token',
                    }).toString(),
                    signal: AbortSignal.timeout(10000)
                });

                const tokenData = await tokenResp.json() as { access_token?: string; error?: string };
                if (!tokenResp.ok || !tokenData.access_token) {
                    return { ok: false, data: { error: 'Token refresh failed', details: tokenData } };
                }

                const accessToken = tokenData.access_token;
                const gbpPostText = `🏡 ${property.titulo}\n📍 ${ubicacionStr}\n💰 ${formattedPrice}\n\nAgenda tu visita hoy:\n${propertyUrl}`;

                // Build media array if mainImage exists
                const media = mainImage ? [
                    {
                        mediaFormat: 'PHOTO',
                        sourceUrl: mainImage
                    }
                ] : [];

                // Post to Google My Business API
                const gbpResp = await fetch(
                    `https://mybusiness.googleapis.com/v4/accounts/${googleAccountId}/locations/${googleLocationId}/localPosts`,
                    {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            languageCode: 'es',
                            summary: gbpPostText,
                            callToAction: {
                                actionType: 'LEARN_MORE',
                                url: propertyUrl
                            },
                            media,
                            topicType: 'STANDARD'
                        }),
                        signal: AbortSignal.timeout(15000)
                    }
                );

                const gbpData = await gbpResp.json() as Record<string, unknown>;
                return { ok: gbpResp.ok, data: gbpData };

            } catch (err: unknown) {
                const errMsg = err instanceof Error ? err.message : String(err);
                return { ok: false, data: { error: errMsg } };
            }
        };

        // Helper: post via viaSocket MCP (no photo support)
        const postToViaSocket = async (): Promise<{ ok: boolean; data: unknown }> => {
            if (!viaSocketUrl) {
                return { ok: false, data: { error: 'No viaSocket URL configured' } };
            }

            try {
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
                                `📍 ${ubicacionStr}`,
                                `💰 ${formattedPrice}`,
                                ``,
                                `Learn more: ${propertyUrl}`,
                                `Call to action: LEARN_MORE → ${propertyUrl}`
                            ].join('\n')
                        }
                    }
                };

                const resp = await fetch(viaSocketUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/event-stream',
                    },
                    body: JSON.stringify(mcpPayload),
                    signal: AbortSignal.timeout(60000)
                });

                const text = await resp.text();
                let data: unknown;
                try { data = JSON.parse(text); } catch { data = text; }
                return { ok: resp.ok, data };

            } catch (err: unknown) {
                const errMsg = err instanceof Error ? err.message : String(err);
                return { ok: false, data: { error: errMsg } };
            }
        };

        // Strategy: try Google API direct first (with photo), fallback to viaSocket
        const hasGoogleVars = !!(googleClientId && googleClientSecret && googleRefreshToken &&
            googleAccountId && googleLocationId);

        if (hasGoogleVars) {
            // Try direct Google API (supports photos)
            const directResult = await postToGoogleDirect();

            if (directResult.ok) {
                results.push({
                    step: 'create-gbp-post',
                    method: 'google-api-direct',
                    hasPhoto: !!mainImage,
                    success: true,
                    response: directResult.data
                });
            } else {
                results.push({
                    step: 'create-gbp-post',
                    method: 'google-api-direct',
                    success: false,
                    error: directResult.data
                });

                // Fallback to viaSocket
                console.warn('Google direct API failed, trying viaSocket fallback');
                const viaResult = await postToViaSocket();
                results.push({
                    step: 'create-gbp-post-fallback',
                    method: 'viasocket-fallback',
                    success: viaResult.ok,
                    response: viaResult.data
                });
            }
        } else if (viaSocketUrl) {
            // No Google OAuth vars — use viaSocket
            const viaResult = await postToViaSocket();
            results.push({
                step: 'create-gbp-post',
                method: 'viasocket',
                success: viaResult.ok,
                response: viaResult.data
            });
        } else {
            results.push({
                step: 'create-gbp-post',
                method: 'none',
                success: false,
                error: 'No GBP posting method configured (neither Google OAuth nor viaSocket)'
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
