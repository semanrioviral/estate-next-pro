import { cache } from 'react';
import { getTagBySlug, getPropertiesByTagSlug } from '@/lib/supabase/properties';
import { notFound } from 'next/navigation';
import { Search, Hash, Building2 } from 'lucide-react';
import { Metadata } from 'next';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import Pagination from '@/components/design-system/Pagination';

interface TagPageProps {
    params: { slug: string };
    searchParams?: { orden?: string; page?: string };
}

const getTagBySlugCached = cache(async (slug: string) => getTagBySlug(slug));

export async function generateMetadata({ params, searchParams }: TagPageProps): Promise<Metadata> {
    const { slug } = params;
    const { orden } = searchParams ?? {};
    const tag = await getTagBySlugCached(slug);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    if (!tag) {
        return {
            title: 'Etiqueta no encontrada - Inmobiliaria Tucasa Los Patios',
            description: 'La etiqueta que buscas no existe.',
        };
    }

    const title = tag.meta_titulo || `${tag.nombre} - Propiedades en Inmobiliaria Tucasa Los Patios`;
    const description = tag.meta_descripcion || `Encuentra propiedades con ${tag.nombre} en Norte de Santander.`;
    const canonicalUrl = `${siteUrl}/tag/${slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonicalUrl,
        },
    };
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
    const { slug } = params;
    const { orden, page: pageParam } = searchParams ?? {};
    const currentPage = Number(pageParam) || 1;
    const tag = await getTagBySlugCached(slug);

    if (!tag) {
        return notFound();
    }

    const { properties, totalCount } = await getPropertiesByTagSlug(slug, orden, currentPage);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const canonicalUrl = `${siteUrl}/tag/${slug}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${canonicalUrl}#collection`,
                "name": tag.nombre,
                "description": tag.meta_descripcion || `Propiedades con ${tag.nombre} en Norte de Santander.`,
                "url": canonicalUrl,
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": totalCount,
                    "itemListElement": properties.map((property, index) => ({
                        "@type": "ListItem",
                        "position": ((currentPage - 1) * 12) + index + 1,
                        "url": `${siteUrl}/propiedades/${property.slug}`
                    }))
                }
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <CatalogHeader
                title={<>Resultados para <span className="text-brand">{tag.nombre}</span></>}
                description={tag.descripcion || `Explora nuestra selección de propiedades categorizadas bajo la etiqueta ${tag.nombre} en Norte de Santander.`}
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Propiedades', href: '/propiedades' },
                    { label: `Etiqueta: ${tag.nombre}` }
                ]}
                badge={{
                    icon: Hash,
                    text: 'Colección Temática'
                }}
            />

            <section className="py-20">
                <div className="container-wide px-4">
                    {properties.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {properties.map((property) => (
                                    <PropertyCardV3 key={property.id} property={property} />
                                ))}
                            </div>

                            <div className="mt-12">
                                <Pagination
                                    totalItems={totalCount}
                                    itemsPerPage={12}
                                    currentPage={currentPage}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-bg-alt rounded-2xl border border-border-clean border-dashed">
                            <Search className="w-12 h-12 text-text-muted mb-4" />
                            <h2 className="text-2xl font-bold text-text-primary mb-2">
                                No hay propiedades disponibles
                            </h2>
                            <p className="text-text-secondary text-center max-w-md font-medium px-6">
                                Actualmente no hay propiedades con la etiqueta "{tag.nombre}". Vuelve pronto para ver nuevas opciones.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}
