import { getPropertiesByOperacion, getTrendingProperties } from '@/lib/supabase/properties';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import ExploreAlso from '@/components/ExploreAlso';
import ListingConversionBanner from '@/components/ListingConversionBanner';
import { Metadata } from 'next';
import { Search, Flame, Building2 } from 'lucide-react';
import Pagination from '@/components/design-system/Pagination';

interface ArriendoPageProps {
    searchParams: Promise<{
        habitaciones?: string;
        orden?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ searchParams }: ArriendoPageProps): Promise<Metadata> {
    const { habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;

    const { properties } = await getPropertiesByOperacion('arriendo', numHabitaciones, orden, currentPage);
    const siteUrl = 'https://www.tucasalospatios.com';
    let title = 'Propiedades en arriendo';
    let description = 'Encuentra las mejores propiedades en arriendo en Norte de Santander. Casas, apartamentos, locales y más.';

    if (numHabitaciones) {
        title = `Propiedades en arriendo con ${numHabitaciones}+ habitaciones`;
        description = `Explora casas y apartamentos en arriendo con ${numHabitaciones} o más habitaciones en Cúcuta y Los Patios.`;
    }

    const canonicalUrl = `${siteUrl}/arriendo`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        robots: {
            index: properties.length >= 2,
            follow: true,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonicalUrl,
        },
        twitter: {
            title,
            description,
        },
    };
}

export default async function ArriendoPage({ searchParams }: ArriendoPageProps) {
    const { habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;

    const [{ properties, totalCount }, trendingProperties] = await Promise.all([
        getPropertiesByOperacion('arriendo', numHabitaciones, orden, currentPage),
        getTrendingProperties(7, 3)
    ]);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const canonicalUrl = `${siteUrl}/arriendo`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${canonicalUrl}#collection`,
                "name": "Propiedades en Arriendo",
                "description": "Catálogo completo de propiedades en arriendo en Norte de Santander.",
                "url": canonicalUrl,
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": totalCount,
                    "itemListElement": properties.map((property, index: number) => ({
                        "@type": "ListItem",
                        "position": ((currentPage - 1) * 12) + index + 1,
                        "url": `${siteUrl}/propiedades/${property.slug}`
                    }))
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${canonicalUrl}#breadcrumb`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Inicio",
                        "item": siteUrl
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Arriendo",
                        "item": canonicalUrl
                    }
                ]
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
                title={<>Propiedades en <span className="text-brand">Arriendo</span></>}
                description="Encuentre su próximo hogar u oficina con el respaldo de nuestra gestión profesional. Trámites ágiles y documentación garantizada."
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Catálogo Arriendo' }
                ]}
                badge={{
                    icon: Building2,
                    text: 'Alquiler Garantizado'
                }}
            />

            <div className="container-wide px-4 py-20">
                {/* Properties Grid */}
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
                        <Search className="w-12 h-12 text-text-muted mb-6" />
                        <h3 className="text-text-primary mb-2">No hay propiedades en arriendo</h3>
                        <p className="text-text-secondary font-medium text-center max-w-md">Estamos actualizando nuestra oferta de arriendos. Vuelva pronto para ver nuevas opciones.</p>
                    </div>
                )}

                {/* Trending Section */}
                {trendingProperties && trendingProperties.length > 0 && (
                    <section className="mt-32 pt-24 border-t border-border-clean">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                            <div className="max-w-xl">
                                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Flame className="w-3 h-3 fill-current" />
                                    <span>Alta Demanda</span>
                                </p>
                                <h2>Lo más <span className="text-brand">Buscado</span></h2>
                                <p className="mt-4 text-text-secondary font-medium text-lg leading-relaxed">
                                    Inmuebles que están captando la mayor atención de nuestros clientes esta semana.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {trendingProperties.map((prop) => (
                                <PropertyCardV3 key={prop.id} property={prop} />
                            ))}
                        </div>
                    </section>
                )}

                {/* Navigation and conversion blocks */}
                <div className="mt-32 space-y-24 pb-32">
                    <ExploreAlso currentOperacion="arriendo" />
                    <ListingConversionBanner />
                </div>
            </div>
        </main >
    );
}
