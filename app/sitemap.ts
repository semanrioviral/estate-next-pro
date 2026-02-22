import { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase-server';
import { slugify } from '@/lib/supabase/seo-helpers';

/**
 * Fase 11: Generador de Sitemap Dinámico
 * Incluye todas las rutas estáticas y dinámicas (propiedades, tags, barrios, ciudades).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const siteUrl = 'https://www.tucasalospatios.com';
    const supabase = await createClient();

    const { count: ventaCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('operacion', 'venta');

    const { count: arriendoCount } = await supabase
        .from('properties')
        .select('id', { count: 'exact', head: true })
        .eq('operacion', 'arriendo');

    // 1. Rutas Estáticas
    const routes = [
        '',
        '/venta',
        '/nosotros',
        '/contacto',
        ...(ventaCount && ventaCount > 0 ? ['/propiedades'] : []),
        ...(arriendoCount && arriendoCount >= 2 ? ['/arriendo'] : []),
    ].map((route) => ({
        url: `${siteUrl}${route}`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // 2. Propiedades (Individuales)
    const { data: properties } = await supabase
        .from('properties')
        .select('slug, updated_at');

    const propertyRoutes = (properties || []).map((p) => ({
        url: `${siteUrl}/propiedades/${p.slug}`,
        lastModified: p.updated_at || new Date().toISOString(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    // 3. Ciudades con listados reales de venta
    const { data: cityData } = await supabase
        .from('properties')
        .select('ciudad')
        .eq('operacion', 'venta');

    const cityCounts = (cityData || []).reduce<Record<string, number>>((acc, item) => {
        const city = item.ciudad?.trim();
        if (!city) return acc;
        acc[city] = (acc[city] || 0) + 1;
        return acc;
    }, {});

    const uniqueCities = Object.keys(cityCounts).filter((city) => cityCounts[city] >= 2);

    const cityRoutes = uniqueCities.map((city) => {
        const citySlug = slugify(city);
        return {
            url: `${siteUrl}/venta/${citySlug}`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
        };
    });

    // 4. Blog (Artículos)
    const { data: blogPosts } = await supabase
        .from('blog_posts')
        .select('slug, published_at')
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString());

    const blogPostsLive = await Promise.all(
        (blogPosts || []).map(async (post) => {
            try {
                const response = await fetch(`${siteUrl}/blog/${post.slug}`, { cache: 'no-store' });
                if (response.status !== 200) return null;

                const html = await response.text();
                if (/name="robots"\s+content="[^"]*noindex/i.test(html)) return null;

                return post;
            } catch {
                return null;
            }
        })
    );

    const blogRoutes = blogPostsLive
        .filter((post): post is { slug: string; published_at: string | null } => Boolean(post))
        .map((post) => ({
            url: `${siteUrl}/blog/${post.slug}`,
            lastModified: post.published_at || new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

    const allRoutes = [
        ...routes,
        ...propertyRoutes,
        ...cityRoutes,
        ...blogRoutes,
    ];

    return Array.from(new Map(allRoutes.map((route) => [route.url, route])).values());
}
