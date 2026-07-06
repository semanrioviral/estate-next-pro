import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';
import { slugify } from '@/lib/supabase/seo-helpers';
import { SITE_URL } from '@/lib/supabase/constants';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = SITE_URL;
    const supabase = await createClient();

    const now = new Date().toISOString();

    const [
        { count: ventaCount },
        { count: arriendoCount },
        { data: properties },
        { data: ventaProperties },
        { data: arriendoProperties },
        { data: barrios },
        { data: blogPosts },
    ] = await Promise.all([
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('operacion', 'venta').not('estado', 'in', '("Vendido","Reservado")'),
        supabase.from('properties').select('id', { count: 'exact', head: true }).eq('operacion', 'arriendo').not('estado', 'in', '("Vendido","Reservado")'),
        supabase.from('properties').select('slug, updated_at').not('estado', 'in', '("Vendido","Reservado")'),
        supabase.from('properties').select('ciudad, tipo').eq('operacion', 'venta').not('estado', 'in', '("Vendido","Reservado")'),
        supabase.from('properties').select('ciudad, tipo').eq('operacion', 'arriendo').not('estado', 'in', '("Vendido","Reservado")'),
        supabase.from('barrios').select('id, nombre, slug'),
        supabase.from('blog_posts').select('slug, published_at').eq('status', 'published').lte('published_at', now),
    ]);

    // 1. Static routes
    const staticRoutes = [
        '',
        '/venta',
        '/nosotros',
        '/contacto',
        '/blog',
        '/inmobiliaria-en-cucuta',
        '/inmobiliaria-en-los-patios',
        '/inmobiliaria-en-villa-del-rosario',
        '/vender-casa-en-cucuta',
        '/vender-casa-en-los-patios',
        '/vender-casa-en-villa-del-rosario',
        '/consignar-propiedad',
        ...(ventaCount && ventaCount > 0 ? ['/propiedades'] : []),
        ...(arriendoCount && arriendoCount >= 2 ? ['/arriendo'] : []),
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: now,
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Property pages
    const propertyRoutes = (properties || []).map((p) => ({
        url: `${siteUrl}/propiedades/${p.slug}`,
        lastModified: p.updated_at || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Barrio pages (only those with at least 1 property)
    const { data: barrioIdsWithProps } = await supabase
        .from('properties')
        .select('barrio_id')
        .not('barrio_id', 'is', null)
        .not('estado', 'in', '("Vendido","Reservado")');

    const activeBarrioIds = [...new Set((barrioIdsWithProps || []).map((p) => p.barrio_id).filter(Boolean))];

    const barrioRoutes = (barrios || [])
        .filter((b) => activeBarrioIds.includes(b.id))
        .map((b) => ({
            url: `${siteUrl}/barrio/${b.slug}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

    // 4. City pages by operation
    const cityCounts = (ventaProperties || []).reduce<Record<string, number>>((acc, item) => {
        const city = item.ciudad?.trim();
        if (!city) return acc;
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    const cityRoutes = Object.entries(cityCounts)
        .filter(([, count]) => count >= 2)
        .map(([city]) => ({
            url: `${siteUrl}/venta/${slugify(city)}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

    // 5. City + tipo combos for venta (only with 2+ properties)
    const cityTipoCounts: Record<string, Record<string, number>> = {};
    for (const item of ventaProperties || []) {
        const city = item.ciudad?.trim().toLowerCase();
        const tipo = item.tipo?.trim().toLowerCase();
        if (!city || !tipo) continue;
        if (!cityTipoCounts[city]) cityTipoCounts[city] = {};
        cityTipoCounts[city][tipo] = (cityTipoCounts[city][tipo] || 0) + 1;
    }

    const cityTipoRoutes: MetadataRoute.Sitemap = [];
    for (const [city, tipos] of Object.entries(cityTipoCounts)) {
        for (const [tipo, count] of Object.entries(tipos)) {
            if (count >= 2) {
                cityTipoRoutes.push({
                    url: `${siteUrl}/venta/${slugify(city)}/${slugify(tipo)}`,
                    lastModified: now,
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                });
            }
        }
    }

    // 5b. Arriendo city routes and city+tipo combos
    const arriendoCityCounts = (arriendoProperties || []).reduce<Record<string, number>>((acc, item) => {
        const city = item.ciudad?.trim();
        if (!city) return acc;
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    const arriendoCityRoutes = Object.entries(arriendoCityCounts)
        .filter(([, count]) => count >= 2)
        .map(([city]) => ({
            url: `${siteUrl}/arriendo/${slugify(city)}`,
            lastModified: now,
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        }));

    const arriendoCityTipoCounts: Record<string, Record<string, number>> = {};
    for (const item of arriendoProperties || []) {
        const city = item.ciudad?.trim().toLowerCase();
        const tipo = item.tipo?.trim().toLowerCase();
        if (!city || !tipo) continue;
        if (!arriendoCityTipoCounts[city]) arriendoCityTipoCounts[city] = {};
        arriendoCityTipoCounts[city][tipo] = (arriendoCityTipoCounts[city][tipo] || 0) + 1;
    }

    const arriendoCityTipoRoutes: MetadataRoute.Sitemap = [];
    for (const [city, tipos] of Object.entries(arriendoCityTipoCounts)) {
        for (const [tipo, count] of Object.entries(tipos)) {
            if (count >= 2) {
                arriendoCityTipoRoutes.push({
                    url: `${siteUrl}/arriendo/${slugify(city)}/${slugify(tipo)}`,
                    lastModified: now,
                    changeFrequency: 'weekly' as const,
                    priority: 0.5,
                });
            }
        }
    }

    // 6. Blog posts (DB-only filtering — no external fetch)
    const blogRoutes = (blogPosts || []).map((post) => ({
        url: `${siteUrl}/blog/${post.slug}`,
        lastModified: post.published_at || now,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const allRoutes = [
        ...staticRoutes,
        ...propertyRoutes,
        ...barrioRoutes,
        ...cityRoutes,
        ...cityTipoRoutes,
        ...arriendoCityRoutes,
        ...arriendoCityTipoRoutes,
        ...blogRoutes,
    ];

    return Array.from(new Map(allRoutes.map((route) => [route.url, route])).values());
}
