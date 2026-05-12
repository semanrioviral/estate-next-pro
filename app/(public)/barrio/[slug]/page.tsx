import { cache } from 'react';
import { getBarrioBySlug, getPropertiesByBarrioSlug } from '@/lib/supabase/properties';
import { notFound } from 'next/navigation';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import ExploreAlso from '@/components/ExploreAlso';
import { Metadata } from 'next';
import { MapPin, Search, ArrowLeft, Building2 } from 'lucide-react';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import Link from 'next/link';
import Pagination from '@/components/design-system/Pagination';
import { generateBarrioSEO, generateBarrioJSONLD } from '@/lib/seo/generatePropertySEO';

interface BarrioPageProps {
    params: { slug: string };
    searchParams?: { orden?: string; page?: string };
}

const getBarrioBySlugCached = cache(async (slug: string) => getBarrioBySlug(slug));

export async function generateMetadata({ params, searchParams }: BarrioPageProps): Promise<Metadata> {
    const { slug } = params;
    const barrio = await getBarrioBySlugCached(slug);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucasalospatios.com';

    if (!barrio) {
        return {
            title: 'Barrio no encontrado - Inmobiliaria Tucasa Los Patios',
            description: 'El barrio que buscas no existe en nuestro catálogo.',
        };
    }

    const { properties, totalCount } = await getPropertiesByBarrioSlug(slug);

    const seo = generateBarrioSEO(barrio.nombre, barrio.nombre, totalCount, slug, { siteUrl });

    return {
        title: seo.title,
        description: seo.description,
        alternates: seo.alternates,
        openGraph: seo.openGraph,
        twitter: seo.twitter,
        robots: {
            index: properties && properties.length > 0,
            follow: true,
        },
    };
}

export default async function BarrioPage({ params, searchParams }: BarrioPageProps) {
    const { slug } = params;
    const { orden, page: pageParam } = searchParams ?? {};
    const currentPage = Number(pageParam) || 1;
    const barrio = await getBarrioBySlugCached(slug);

    if (!barrio) {
        return notFound();
    }

    const { properties, totalCount } = await getPropertiesByBarrioSlug(slug, orden, currentPage);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tucasalospatios.com';

    const jsonLd = generateBarrioJSONLD(barrio.nombre, barrio.nombre, totalCount, siteUrl, slug);

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <CatalogHeader
                title={<>Propiedades en <span className="text-brand">{barrio.nombre}</span></>}
                description={barrio.meta_descripcion || `Explora las mejores opciones inmobiliarias disponibles en el sector de ${barrio.nombre}, Norte de Santander.`}
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Propiedades', href: '/propiedades' },
                    { label: `Barrio ${barrio.nombre}` }
                ]}
                badge={{
                    icon: MapPin,
                    text: 'Ubicación Estratégica'
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
                            <Search className="w-10 h-10 text-text-muted mb-6" />
                            <h3 className="text-text-primary mb-4 text-center">Sin resultados disponibles</h3>
                            <p className="text-text-secondary text-center max-w-md font-medium px-6 mb-10">
                                Actualmente no tenemos propiedades registradas en el barrio {barrio.nombre}. Explore otras zonas aledañas.
                            </p>
                            <Link href="/propiedades" className="btn-primary">
                                <ArrowLeft className="w-5 h-5" />
                                Ver Todo el Portafolio
                            </Link>
                        </div>
                    )}

                    <div className="mt-24">
                        <ExploreAlso currentSlug={slug} />
                    </div>
                </div>
            </section>
        </main>
    );
}
