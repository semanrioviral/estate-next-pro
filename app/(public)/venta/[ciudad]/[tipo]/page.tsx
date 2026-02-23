import { getPropertiesByOperacionCiudadTipo, getPropertiesByOperacionCiudadTipoAndTagSlug, getTagBySlug } from '@/lib/supabase/properties';
import { notFound } from 'next/navigation';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { Metadata } from 'next';
import { Search, Building2, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import ExploreAlso from '@/components/ExploreAlso';
import Pagination from '@/components/design-system/Pagination';
import { generateListingFAQ } from '@/lib/seo/generateListingFAQ';

interface VentaCiudadTipoPageProps {
    params: Promise<{
        ciudad: string;
        tipo: string;
    }>;
    searchParams: Promise<{
        barrio?: string;
        habitaciones?: string;
        orden?: string;
        page?: string;
    }>;
}

export async function generateMetadata({ params, searchParams }: VentaCiudadTipoPageProps): Promise<Metadata> {
    const { ciudad: ciudadSlug, tipo: tipoParam } = await params;
    const { barrio, habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;
    const siteUrl = 'https://www.tucasalospatios.com';

    // Parsing combo (tipo-tag)
    let tipoSlug = tipoParam;
    let tagSlug: string | null = null;
    let tagData = null;

    if (tipoParam.includes('-')) {
        const dashIndex = tipoParam.indexOf('-');
        const potentialTipo = tipoParam.substring(0, dashIndex);
        const potentialTag = tipoParam.substring(dashIndex + 1);
        tagData = await getTagBySlug(potentialTag);
        if (tagData) {
            tipoSlug = potentialTipo;
            tagSlug = potentialTag;
        }
    }

    const { properties, totalCount } = tagSlug
        ? await getPropertiesByOperacionCiudadTipoAndTagSlug('venta', ciudadSlug, tipoSlug, tagSlug, orden) || { properties: [], totalCount: 0 }
        : await getPropertiesByOperacionCiudadTipo('venta', ciudadSlug, tipoSlug, barrio, numHabitaciones, orden) || { properties: [], totalCount: 0 };

    if (!properties) {
        return {
            title: 'No encontrado',
            robots: { index: false, follow: false },
        };
    }

    // Obtener nombres reales
    const ciudadNombre = properties.length > 0 ? properties[0].ciudad : ciudadSlug.replace(/-/g, ' ');
    const tipoNombre = properties.length > 0 ? properties[0].tipo : tipoSlug.replace(/-/g, ' ');
    const tagNombre = tagData?.nombre || '';

    const tipoPluralizado = tipoNombre.toLowerCase().endsWith('s') ? tipoNombre : `${tipoNombre}s`;

    let title = tagNombre
        ? `${tipoPluralizado.charAt(0).toUpperCase() + tipoPluralizado.slice(1)} con ${tagNombre} en venta en ${ciudadNombre}`
        : `${tipoPluralizado.charAt(0).toUpperCase() + tipoPluralizado.slice(1)} en venta en ${ciudadNombre}`;

    if (barrio && !tagNombre) {
        title = `${tipoPluralizado.charAt(0).toUpperCase() + tipoPluralizado.slice(1)} en venta en ${barrio.replace(/-/g, ' ')}, ${ciudadNombre}`;
    }

    const description = tagNombre
        ? `Encuentra ${tipoPluralizado.toLowerCase()} con ${tagNombre} en venta en ${ciudadNombre}. Propiedades verificadas y asesoría profesional.`
        : `Encuentra los mejores ${tipoPluralizado.toLowerCase()} en venta en ${ciudadNombre}, Norte de Santander. Explora opciones disponibles y recibe asesoría inmobiliaria profesional.`;

    const canonicalUrl =
        currentPage > 1
            ? `${siteUrl}/venta/${ciudadSlug}/${tipoParam}?page=${currentPage}`
            : `${siteUrl}/venta/${ciudadSlug}/${tipoParam}`;
    const totalPages = Math.ceil(totalCount / 12);
    const prevUrl =
        currentPage > 1
            ? `${siteUrl}/venta/${ciudadSlug}/${tipoParam}${currentPage - 1 === 1 ? '' : `?page=${currentPage - 1}`}`
            : null;
    const nextUrl =
        currentPage < totalPages
            ? `${siteUrl}/venta/${ciudadSlug}/${tipoParam}?page=${currentPage + 1}`
            : null;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        other: {
            ...(prevUrl ? { 'link:prev': prevUrl } : {}),
            ...(nextUrl ? { 'link:next': nextUrl } : {}),
        },
        robots: (!properties || properties.length < 2) ? { index: false, follow: true } : { index: true, follow: true },
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonicalUrl,
            images: [
                {
                    url: `${siteUrl}/og-general.jpg`,
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

export default async function VentaCiudadTipoPage({ params, searchParams }: VentaCiudadTipoPageProps) {
    const { ciudad: ciudadSlug, tipo: tipoParam } = await params;
    const { barrio, habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;

    // Parsing combo logic
    let tipoSlug = tipoParam;
    let tagSlug: string | null = null;
    let tagData = null;

    if (tipoParam.includes('-')) {
        const dashIndex = tipoParam.indexOf('-');
        const potentialTipo = tipoParam.substring(0, dashIndex);
        const potentialTag = tipoParam.substring(dashIndex + 1);
        tagData = await getTagBySlug(potentialTag);
        if (tagData) {
            tipoSlug = potentialTipo;
            tagSlug = potentialTag;
        }
    }

    const { properties, totalCount } = tagSlug
        ? await getPropertiesByOperacionCiudadTipoAndTagSlug('venta', ciudadSlug, tipoSlug, tagSlug, orden, currentPage) || { properties: [], totalCount: 0 }
        : await getPropertiesByOperacionCiudadTipo('venta', ciudadSlug, tipoSlug, barrio, numHabitaciones, orden, currentPage) || { properties: [], totalCount: 0 };

    if (!properties || (properties.length === 0 && currentPage === 1)) {
        notFound();
    }

    const ciudadNombre = properties.length > 0 ? properties[0].ciudad : ciudadSlug.replace(/-/g, ' ');
    const tipoNombre = properties.length > 0 ? properties[0].tipo : tipoSlug.replace(/-/g, ' ');
    const tagNombre = tagData?.nombre || '';
    const tipoPluralizado = tipoNombre.toLowerCase().endsWith('s') ? tipoNombre : `${tipoNombre}s`;
    const displayBarrio = barrio ? barrio.replace(/-/g, ' ') : '';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const canonicalUrl =
        currentPage > 1
            ? `${siteUrl}/venta/${ciudadSlug}/${tipoParam}?page=${currentPage}`
            : `${siteUrl}/venta/${ciudadSlug}/${tipoParam}`;
    const itemListId = `${canonicalUrl}#itemlist`;
    const { faqItems, faqJsonLd } = generateListingFAQ({
        operacion: 'venta',
        ciudad: ciudadNombre,
        tipo: tipoNombre,
    });

    let displayTitle = tagNombre
        ? `${tipoPluralizado} con ${tagNombre} en Venta en ${ciudadNombre}`
        : `${tipoPluralizado} en Venta en ${ciudadNombre}`;

    if (barrio && !tagNombre) {
        displayTitle = `${tipoPluralizado} en Venta en ${displayBarrio}, ${ciudadNombre}`;
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": canonicalUrl,
                "url": canonicalUrl,
                "name": displayTitle,
                "description": tagNombre
                    ? `Catálogo de ${tipoPluralizado.toLowerCase()} con ${tagNombre} en venta en ${ciudadNombre}.`
                    : `Encuentra los mejores ${tipoPluralizado.toLowerCase()} en venta en ${ciudadNombre}, Norte de Santander. Explora opciones disponibles y recibe asesoría inmobiliaria profesional.`,
                "inLanguage": "es-CO",
                "dateModified": new Date().toISOString(),
                "about": {
                    "@type": "Place",
                    "name": ciudadNombre
                },
                "isPartOf": {
                    "@type": "WebSite",
                    "url": siteUrl
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
                        "name": ciudadNombre,
                        "item": `${siteUrl}/venta/${ciudadSlug}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": tipoPluralizado,
                        "item": canonicalUrl
                    }
                ]
            },
            {
                "@type": "ItemList",
                "@id": itemListId,
                "numberOfItems": totalCount,
                "itemListElement": properties.map((property, index: number) => ({
                    "@type": "ListItem",
                    "position": ((currentPage - 1) * 12) + index + 1,
                    "item": {
                        "@type": "Product",
                        "name": property.titulo,
                        "url": `${siteUrl}/propiedades/${property.slug}`,
                        "image": property?.imagen_principal || undefined,
                        "description": property?.descripcion_corta || undefined,
                        "brand": {
                            "@type": "Brand",
                            "name": "Inmobiliaria Tucasa Los Patios"
                        },
                        ...(property?.precio ? {
                            "offers": {
                                "@type": "Offer",
                                "price": property.precio,
                                "priceCurrency": "COP",
                                "availability": "https://schema.org/InStock",
                                "url": `${siteUrl}/propiedades/${property.slug}`
                            }
                        } : {})
                    }
                }))
            },
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
                title={tagNombre ? (
                    <>{tipoPluralizado} con <span className="text-brand">{tagNombre}</span></>
                ) : (
                    <>{tipoPluralizado} en <span className="text-brand">{ciudadNombre}</span></>
                )}
                description={tagNombre
                    ? `Explora los mejores ${tipoPluralizado.toLowerCase()} con ${tagNombre} disponibles para la compra en la ciudad de ${ciudadNombre}.`
                    : `Explora nuestra selección rigurosa de ${tipoPluralizado.toLowerCase()} disponibles en ${ciudadNombre}, Norte de Santander.`
                }
                totalCount={totalCount}
                breadcrumbs={tagSlug ? [
                    { label: 'Venta', href: '/venta' },
                    { label: ciudadNombre, href: `/venta/${ciudadSlug}` },
                    { label: tipoPluralizado, href: `/venta/${ciudadSlug}/${tipoSlug}` },
                    { label: tagNombre }
                ] : [
                    { label: 'Venta', href: '/venta' },
                    { label: ciudadNombre, href: `/venta/${ciudadSlug}` },
                    { label: tipoPluralizado }
                ]}
                badge={{
                    icon: Building2,
                    text: 'Inversión Patrimonial'
                }}
            />

            {/* Properties Grid */}
            <section className="py-8 md:py-20">
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
                                Actualmente no tenemos {tipoPluralizado.toLowerCase()} {tagNombre ? `con ${tagNombre}` : ''} en venta en {ciudadNombre}. Explore otras opciones en el catálogo general.
                            </p>
                            <Link href="/venta" className="btn-primary">
                                <ArrowLeft className="w-5 h-5" />
                                Ver Todas las Ventas
                            </Link>
                        </div>
                    )}

                    <section className="mt-20 pt-14 border-t border-border-clean">
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

                    <div className="mt-24">
                        <ExploreAlso currentOperacion="venta" currentSlug={ciudadSlug} />
                    </div>
                </div>
            </section>
        </main>
    );
}
