import { getPropertiesByOperacion, getTrendingProperties } from '@/lib/supabase/properties';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import ExploreAlso from '@/components/ExploreAlso';
import ListingConversionBanner from '@/components/ListingConversionBanner';
import { Metadata } from 'next';
import { Search, Flame, Building2 } from 'lucide-react';
import Pagination from '@/components/design-system/Pagination';
import { generateListingFAQ } from '@/lib/seo/generateListingFAQ';

interface VentaPageProps {
    searchParams: Promise<{
        habitaciones?: string;
        orden?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ searchParams }: VentaPageProps): Promise<Metadata> {
    const { habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;

    const { properties } = await getPropertiesByOperacion('venta', numHabitaciones, orden, currentPage);
    const siteUrl = 'https://www.tucasalospatios.com';
    let title = 'Propiedades en venta en Cúcuta y Los Patios';
    let description = 'Encuentra las mejores propiedades en venta en Norte de Santander. Casas, apartamentos, lotes y más.';

    if (numHabitaciones) {
        title = `Propiedades en venta con ${numHabitaciones}+ habitaciones`;
        description = `Explora casas y apartamentos en venta con ${numHabitaciones} o más habitaciones en Cúcuta y Los Patios.`;
    }

    const canonicalUrl = `${siteUrl}/venta`;

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
            images: [
                {
                    url: `${siteUrl}/og-venta.jpg`,
                    width: 1200,
                    height: 630,
                }
            ]
        },
        twitter: {
            title,
            description,
        },
    };
}

export default async function VentaPage({ searchParams }: VentaPageProps) {
    const { habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;

    const [{ properties, totalCount }, trendingProperties] = await Promise.all([
        getPropertiesByOperacion('venta', numHabitaciones, orden, currentPage),
        getTrendingProperties(7, 3)
    ]);
    const siteUrl = 'https://www.tucasalospatios.com';
    const canonicalUrl = `${siteUrl}/venta`;
    const itemListId = `${canonicalUrl}#itemlist`;
    const { faqItems, faqJsonLd } = generateListingFAQ({ operacion: 'venta' });

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": canonicalUrl,
                "url": canonicalUrl,
                "name": "Propiedades en venta en Cúcuta y Los Patios",
                "description": "Casas, apartamentos y lotes en venta en Cúcuta, Los Patios y Villa del Rosario.",
                "dateModified": new Date().toISOString(),
                ...(properties.length > 0 ? { "mainEntity": { "@id": itemListId } } : {})
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
                        "name": "Venta",
                        "item": canonicalUrl
                    }
                ]
            },
            ...(properties.length > 0
                ? [{
                    "@type": "ItemList",
                    "@id": itemListId,
                    "itemListElement": properties.map((property, index: number) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": `${siteUrl}/propiedades/${property.slug}`,
                        "name": property.titulo
                    }))
                }]
                : []),
            ...faqJsonLd["@graph"]
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <CatalogHeader
                title={<>Propiedades en <span className="text-brand">Venta</span></>}
                description="Explore nuestra selección exclusiva de inmuebles en Cúcuta y el área metropolitana. Invierta con seguridad y respaldo legal total."
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Inicio', href: '/' },
                    { label: 'Venta' }
                ]}
                badge={{
                    icon: Building2,
                    text: 'Inversión Patrimonial'
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
                        <h3 className="text-text-primary mb-2">No hay propiedades en venta</h3>
                        <p className="text-text-secondary font-medium text-center max-w-md">Actualmente estamos actualizando nuestro portafolio de ventas. Vuelva pronto.</p>
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
                                <h2>Oportunidades <span className="text-brand">Destacadas</span></h2>
                                <p className="mt-4 text-text-secondary font-medium text-lg leading-relaxed">
                                    Inmuebles con alta rotación de mercado y gran rentabilidad proyectada en Norte de Santander.
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

                <section className="mt-24 pt-16 border-t border-border-clean">
                    <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Preguntas frecuentes</h2>
                    <div className="mt-8 space-y-6">
                        {faqItems.map((faq) => (
                            <article key={faq.question} className="space-y-2">
                                <h3 className="text-lg font-semibold text-text-primary">{faq.question}</h3>
                                <p className="text-text-secondary font-medium leading-relaxed">{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Navigation and conversion blocks */}
                <div className="mt-32 space-y-24 pb-32">
                    <ExploreAlso currentOperacion="venta" />
                    <ListingConversionBanner />
                </div>
            </div>
        </main >
    );
}
