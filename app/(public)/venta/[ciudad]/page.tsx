import { getPropertiesByOperacionAndCiudad, getTagBySlug, getPropertiesByOperacionAndTagSlug, isValidFilter } from '@/lib/supabase/properties';
import { notFound } from 'next/navigation';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import SearchBarV3 from '@/components/design-system/SearchBarV3';
import { Suspense } from 'react';
import ExploreAlso from '@/components/ExploreAlso';
import ListingConversionBanner from '@/components/ListingConversionBanner';
import { Metadata } from 'next';
import { Search, MapPin, ArrowLeft, Building2, Award, Clock } from 'lucide-react';
import Link from 'next/link';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import Pagination from '@/components/design-system/Pagination';
import { generateListingFAQ } from '@/lib/seo/generateListingFAQ';

interface VentaCiudadPageProps {
    params: Promise<{
        ciudad: string;
    }>;
    searchParams: Promise<{
        barrio?: string;
        habitaciones?: string;
        orden?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ params, searchParams }: VentaCiudadPageProps): Promise<Metadata> {
    const { ciudad: slug } = await params;
    const { barrio, habitaciones, orden } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const siteUrl = 'https://www.tucasalospatios.com';

    const tag = await getTagBySlug(slug);
    if (tag) {
        const { properties } = await getPropertiesByOperacionAndTagSlug('venta', slug, orden);
        const title = `Propiedades en Venta con ${tag.nombre} en Los Patios y Cúcuta`;
        const description = tag.meta_descripcion || `Descubre una selección exclusiva de propiedades en venta con la característica "${tag.nombre}" en Cúcuta y Los Patios.`;
        const canonicalUrl = `${siteUrl}/venta/${slug}`;
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
                        url: `${siteUrl}/og-venta-${slug}.jpg`,
                        width: 1200,
                        height: 630
                    }
                ]
            },
            twitter: { title, description },
        };
    }

    const { properties } = await getPropertiesByOperacionAndCiudad('venta', slug, barrio, numHabitaciones, orden) || { properties: [], totalCount: 0 };
    if (!properties || properties.length === 0) return { title: 'No encontrado', robots: { index: false, follow: false } };

    const filter = isValidFilter(slug);
    const isCityFilter = filter.type === 'ciudad';
    const ciudadNombre = properties.length > 0
        ? properties[0].ciudad
        : (isCityFilter ? (filter.dbName || slug.replace(/-/g, ' ')) : slug.replace(/-/g, ' '));

    const normalizedTitle = isCityFilter
        ? `Casas y apartamentos en venta en ${ciudadNombre} | Inmobiliaria Tucasa`
        : (barrio
            ? `Inmuebles en venta en ${barrio.replace(/-/g, ' ')}, ${ciudadNombre}`
            : `Inmuebles en venta en ${ciudadNombre}`);

    const description = isCityFilter
        ? `Casas, apartamentos y lotes en venta en ${ciudadNombre}, Norte de Santander. Encuentra tu propiedad ideal con asesoría profesional.`
        : (barrio
            ? `Encuentra casas, apartamentos y lotes en venta en el barrio ${barrio.replace(/-/g, ' ')} de ${ciudadNombre}.`
            : `Descubre las mejores casas, apartamentos y lotes en venta en ${ciudadNombre}, Norte de Santander. Encuentra tu próxima propiedad.`);

    const canonicalUrl = `${siteUrl}/venta/${slug}`;

    return {
        title: normalizedTitle,
        description,
        alternates: { canonical: canonicalUrl },
        robots: {
            index: properties.length >= 2,
            follow: true,
        },
        openGraph: {
            title: normalizedTitle,
            description,
            type: 'website',
            url: canonicalUrl,
            images: [
                {
                    url: `${siteUrl}/og-venta-${slug}.jpg`,
                    width: 1200,
                    height: 630
                }
            ]
        },
        twitter: { title: normalizedTitle, description },
    };
}

export default async function VentaCiudadPage({ params, searchParams }: VentaCiudadPageProps) {
    const { ciudad: slug } = await params;
    const { barrio, habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;
    const siteUrl = 'https://www.tucasalospatios.com';

    // 1. Check for Tag
    const tag = await getTagBySlug(slug);

    if (tag) {
        const { properties, totalCount } = await getPropertiesByOperacionAndTagSlug('venta', slug, orden, currentPage);
        const canonicalUrl = `${siteUrl}/venta/${slug}`;
        const { faqItems, faqJsonLd } = generateListingFAQ({ operacion: 'venta' });

        const jsonLd = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "CollectionPage",
                    "@id": `${canonicalUrl}#collection`,
                    "name": `Propiedades en Venta con ${tag.nombre}`,
                    "description": `Listado de propiedades en venta destacadas por la etiqueta: ${tag.nombre}.`,
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
                }
                ,
                ...faqJsonLd["@graph"]
            ]
        };

        return (
            <main className="min-h-screen bg-white">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                <CatalogHeader
                    title={<>{tag.nombre} en <span className="text-brand">Venta</span></>}
                    description={tag.meta_descripcion || `Explora nuestra selección de inmuebles en venta destacados por la característica: ${tag.nombre}.`}
                    totalCount={totalCount}
                    breadcrumbs={[
                        { label: 'Propiedades en Venta', href: '/venta' },
                        { label: tag.nombre }
                    ]}
                    badge={{
                        icon: Award,
                        text: 'Filtro Especializado'
                    }}
                />

                <div className="container-wide px-4 py-20">
                    {properties.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {properties.map((property) => (
                                    <PropertyCardV3 key={property.id} property={property} />
                                ))}
                            </div>

                            <Pagination
                                totalItems={totalCount}
                                itemsPerPage={12}
                                currentPage={currentPage}
                            />
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 bg-bg-alt rounded-2xl border border-border-clean border-dashed">
                            <Search className="w-16 h-16 text-text-muted mb-8" />
                            <h3 className="text-text-primary">Sin resultados</h3>
                            <p className="text-text-secondary text-center max-w-md font-medium px-4 mt-2">No encontramos propiedades en venta con la categoría "{tag.nombre}" en este momento.</p>
                        </div>
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

                    <div className="mt-32 space-y-24">
                        <ExploreAlso currentOperacion="venta" currentSlug={slug} />
                        <ListingConversionBanner />
                    </div>
                </div>
            </main >
        );
    }

    // 2. Check for City or Type
    const filter = isValidFilter(slug);
    const { properties, totalCount } = await getPropertiesByOperacionAndCiudad('venta', slug, barrio, numHabitaciones, orden, currentPage) || { properties: [], totalCount: 0 };

    if (!properties || (properties.length === 0 && currentPage === 1)) {
        notFound();
    }

    // Determine proper display titles based on whether slug is a City or Type
    const isTypeFilter = filter.type === 'tipo';
    const displayTitle = isTypeFilter
        ? `${filter.dbName}s en Venta`
        : `Venta en ${filter.dbName || slug.replace(/-/g, ' ')}`;

    const ciudadNombre = !isTypeFilter ? (filter.dbName || slug.replace(/-/g, ' ')) : 'Norte de Santander';

    const displayBarrio = barrio ? barrio.replace(/-/g, ' ') : '';
    const canonicalUrl = `${siteUrl}/venta/${slug}`;
    const itemListId = `${canonicalUrl}#itemlist`;
    const { faqItems, faqJsonLd } = generateListingFAQ({
        operacion: 'venta',
        ciudad: isTypeFilter ? undefined : ciudadNombre,
        tipo: isTypeFilter ? String(filter.dbName) : undefined,
    });

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": canonicalUrl,
                "url": canonicalUrl,
                "name": isTypeFilter ? `${filter.dbName}s en venta` : `Propiedades en venta en ${ciudadNombre}`,
                "description": isTypeFilter
                    ? `Catálogo de ${String(filter.dbName).toLowerCase()}s en venta en Norte de Santander.`
                    : `Casas, apartamentos y lotes en venta en ${ciudadNombre}, Norte de Santander. Encuentra tu propiedad ideal con asesoría profesional.`,
                "inLanguage": "es-CO",
                "dateModified": new Date().toISOString(),
                "about": {
                    "@type": "Place",
                    "name": ciudadNombre
                },
                "mainEntity": { "@id": itemListId }
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
                        "item": `${siteUrl}/venta`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": isTypeFilter ? `${filter.dbName}` : ciudadNombre,
                        "item": canonicalUrl
                    }
                ]
            },
            {
                "@type": "ItemList",
                "@id": itemListId,
                "numberOfItems": totalCount,
                "itemListElement": properties.map((property, index) => ({
                    "@type": "ListItem",
                    "position": ((currentPage - 1) * 12) + index + 1,
                    "url": `${siteUrl}/propiedades/${property.slug}`,
                    "name": property.titulo
                }))
            },
            ...faqJsonLd["@graph"]
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <CatalogHeader
                title={barrio ? (
                    <>Venta en <span className="text-brand">{displayBarrio}</span></>
                ) : (
                    isTypeFilter ? (
                        <>{filter.dbName}s en <span className="text-brand">Venta</span></>
                    ) : (
                        <>Venta en <span className="text-brand">{ciudadNombre}</span></>
                    )
                )}
                description={barrio
                    ? `Explora las mejores casas, apartamentos y oportunidades de inversión en el barrio ${displayBarrio} de ${ciudadNombre}.`
                    : `Descubre las mejores opciones de ${isTypeFilter ? filter.dbName.toLowerCase() + 's' : 'propiedades'} en venta en ${ciudadNombre}, Norte de Santander.`
                }
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Propiedades en Venta', href: '/venta' },
                    { label: isTypeFilter ? `${filter.dbName}s` : ciudadNombre }
                ]}
                badge={{
                    icon: MapPin,
                    text: barrio ? `Barrio ${displayBarrio}` : (isTypeFilter ? `Tipo: ${filter.dbName}` : 'Ubicación Estratégica')
                }}
            />

            <div className="container-wide px-4 py-20">
                {properties.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {properties.map((property) => (
                                <PropertyCardV3 key={property.id} property={property} />
                            ))}
                        </div>

                        <Pagination
                            totalItems={totalCount}
                            itemsPerPage={12}
                            currentPage={currentPage}
                        />
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 bg-bg-alt rounded-2xl border border-border-clean border-dashed">
                        <Search className="w-16 h-16 text-text-muted mb-8" />
                        <h3 className="text-text-primary text-center px-4">
                            Sin resultados {barrio ? `en ${displayBarrio}` : `en ${ciudadNombre}`}
                        </h3>
                        <p className="text-text-secondary text-center max-w-md font-medium px-6 mt-4 mb-10">
                            Actualmente no tenemos propiedades en venta que coincidan con estos criterios de búsqueda.
                        </p>
                        <Link href="/venta" className="btn-primary px-10">
                            Ver Todo el Catálogo
                        </Link>
                    </div>
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

                <div className="mt-32 space-y-24">
                    <ExploreAlso currentOperacion="venta" currentSlug={slug} />
                    <ListingConversionBanner />
                </div>
            </div>
        </main>
    );
}
