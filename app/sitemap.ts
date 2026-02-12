import { MetadataRoute } from 'next';
import { properties } from '@/data/properties';

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const now = new Date();

    // 1. Páginas Estáticas Principales y de Ciudad
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: siteUrl,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${siteUrl}/propiedades`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${siteUrl}/cucuta`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/los-patios`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/villa-del-rosario`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${siteUrl}/contacto`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${siteUrl}/nosotros`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${siteUrl}/terminos`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${siteUrl}/privacidad`,
            lastModified: now,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    // 2. Propiedades Individuales Dinámicas (SSG)
    const propertyRoutes: MetadataRoute.Sitemap = properties.map((property) => ({
        url: `${siteUrl}/propiedades/${property.slug}`,
        lastModified: property.updatedAt ? new Date(property.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
    }));

    // 3. Rutas de Venta Jerárquicas (9 combinaciones)
    const tipos = ['casas', 'apartamentos', 'lotes'];
    const ciudades = ['cucuta', 'los-patios', 'villa-del-rosario'];

    const salesRoutes: MetadataRoute.Sitemap = tipos.flatMap((tipo) =>
        ciudades.map((ciudad) => ({
            url: `${siteUrl}/venta/${tipo}/${ciudad}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.9,
        }))
    );

    return [...staticRoutes, ...propertyRoutes, ...salesRoutes];
}
