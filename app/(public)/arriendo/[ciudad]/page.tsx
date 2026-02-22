import { getPropertiesByOperacionAndCiudad, getTagBySlug, getPropertiesByOperacionAndTagSlug, isValidFilter } from '@/lib/supabase/properties';
import { notFound } from 'next/navigation';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { Metadata } from 'next';
import { Search, MapPin, Award } from 'lucide-react';
import Link from 'next/link';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import Pagination from '@/components/design-system/Pagination';
import ExploreAlso from '@/components/ExploreAlso';
import ListingConversionBanner from '@/components/ListingConversionBanner';

interface ArriendoCiudadPageProps {
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

export async function generateMetadata({ params, searchParams }: ArriendoCiudadPageProps): Promise<Metadata> {
    const { ciudad: slug } = await params;
    const { barrio, habitaciones, orden } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const siteUrl = 'https://www.tucasalospatios.com';

    const tag = await getTagBySlug(slug);
    if (tag) {
        const { properties } = await getPropertiesByOperacionAndTagSlug('arriendo', slug, orden);
        const title = `Propiedades en Arriendo con ${tag.nombre} en Los Patios y Cúcuta`;
        const description = tag.meta_descripcion || `Descubre opciones exclusivas de propiedades en arriendo con la característica "${tag.nombre}" en Cúcuta y Los Patios.`;
        const canonicalUrl = `${siteUrl}/arriendo/${slug}`;
        return {
            title,
            description,
            alternates: { canonical: canonicalUrl },
            robots: {
                index: properties.length >= 2,
                follow: true,
            },
            openGraph: { title, description, type: 'website', url: canonicalUrl },
            twitter: { title, description },
        };
    }

    const { properties } = await getPropertiesByOperacionAndCiudad('arriendo', slug, barrio, numHabitaciones, orden) || { properties: [], totalCount: 0 };
    if (!properties || properties.length === 0) return { title: 'No encontrado', robots: { index: false, follow: false } };

    const filter = isValidFilter(slug);
    const isTypeFilter = filter.type === 'tipo';
    const ciudadNombre = !isTypeFilter ? (filter.dbName || slug.replace(/-/g, ' ')) : 'Norte de Santander';

    const title = barrio
        ? `Inmuebles en arriendo en ${barrio.replace(/-/g, ' ')}, ${ciudadNombre} | Inmobiliaria Tucasa Los Patios`
        : (isTypeFilter
            ? `${filter.dbName}s en Arriendo en Cúcuta y Los Patios`
            : `Inmuebles en arriendo en ${ciudadNombre}`);

    const normalizedTitle = title;

    const description = barrio
        ? `Encuentra casas, apartamentos y locales en arriendo en el barrio ${barrio.replace(/-/g, ' ')} de ${ciudadNombre}.`
        : (isTypeFilter
            ? `Encuentra las mejores opciones de ${filter.dbName}s en arriendo en Cúcuta, Los Patios y Villa del Rosario.`
            : `Descubre las mejores casas, apartamentos y locales en arriendo en ${ciudadNombre}, Norte de Santander. Encuentra tu próximo alquiler.`);

    const canonicalUrl = `${siteUrl}/arriendo/${slug}`;

    return {
        title: normalizedTitle,
        description,
        alternates: { canonical: canonicalUrl },
        robots: {
            index: properties.length >= 2,
            follow: true,
        },
        openGraph: { title: normalizedTitle, description, type: 'website', url: canonicalUrl },
        twitter: { title: normalizedTitle, description },
    };
}

export default async function ArriendoCiudadPage({ params, searchParams }: ArriendoCiudadPageProps) {
    const { ciudad: slug } = await params;
    const { barrio, habitaciones, orden, page: pageParam } = await searchParams;
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(pageParam) || 1;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    const tag = await getTagBySlug(slug);

    if (tag) {
        const { properties, totalCount } = await getPropertiesByOperacionAndTagSlug('arriendo', slug, orden, currentPage);
        const canonicalUrl = `${siteUrl}/arriendo/${slug}`;

        const jsonLd = {
            "@context": "https://schema.org",
            "@graph": [
                {
                    "@type": "CollectionPage",
                    "@id": `${canonicalUrl}#collection`,
                    "name": `Propiedades en Arriendo con ${tag.nombre}`,
                    "description": `Listado de propiedades en arriendo destacadas por la etiqueta: ${tag.nombre}.`,
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
            ]
        };

        return (
            <main className="min-h-screen bg-white">
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

                <CatalogHeader
                    title={<>{tag.nombre} en <span className="text-brand">Arriendo</span></>}
                    description={tag.meta_descripcion || `Explora nuestras opciones de ${tag.nombre.toLowerCase()} disponibles para arrendar con gestión profesional.`}
                    totalCount={totalCount}
                    breadcrumbs={[
                        { label: 'Propiedades en Arriendo', href: '/arriendo' },
                        { label: tag.nombre }
                    ]}
                    badge={{
                        icon: Award,
                        text: 'Alquiler Verificado'
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
                            <p className="text-text-secondary text-center max-w-md font-medium px-4 mt-2">No encontramos propiedades en arriendo con la categoría "{tag.nombre}" en este momento.</p>
                        </div>
                    )}

                    <div className="mt-32 space-y-24">
                        <ExploreAlso currentOperacion="arriendo" currentSlug={slug} />
                        <ListingConversionBanner />
                    </div>
                </div>
            </main >
        );
    }

    // 2. Check for City or Type
    const filter = isValidFilter(slug);
    const { properties, totalCount } = await getPropertiesByOperacionAndCiudad('arriendo', slug, barrio, numHabitaciones, orden, currentPage) || { properties: [], totalCount: 0 };

    if (!properties || (properties.length === 0 && currentPage === 1)) {
        notFound();
    }

    const isTypeFilter = filter.type === 'tipo';
    const ciudadNombre = !isTypeFilter ? (filter.dbName || slug.replace(/-/g, ' ')) : 'Norte de Santander';

    const displayBarrio = barrio ? barrio.replace(/-/g, ' ') : '';
    const canonicalUrl = `${siteUrl}/arriendo/${slug}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${canonicalUrl}#collection`,
                "name": isTypeFilter ? `${filter.dbName}s en Arriendo` : `Propiedades en Arriendo en ${ciudadNombre}`,
                "description": `Catálogo de propiedades en arriendo en ${ciudadNombre}, Norte de Santander.`,
                "url": canonicalUrl,
                "mainEntity": {
                    "@type": "ItemList",
                    "numberOfItems": properties.length,
                    "itemListElement": properties.map((property, index) => ({
                        "@type": "ListItem",
                        "position": index + 1,
                        "url": `${siteUrl}/propiedades/${property.slug}`
                    }))
                }
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <CatalogHeader
                title={barrio ? (
                    <>Arriendos en <span className="text-brand">{displayBarrio}</span></>
                ) : (
                    isTypeFilter ? (
                        <>{filter.dbName}s en <span className="text-brand">Arriendo</span></>
                    ) : (
                        <>Arriendos en <span className="text-brand">{ciudadNombre}</span></>
                    )
                )}
                description={barrio
                    ? `Contamos con las mejores opciones de alquiler residencial y comercial en el barrio ${displayBarrio} de ${ciudadNombre}.`
                    : `Contamos con las mejores opciones de ${isTypeFilter ? filter.dbName.toLowerCase() + 's' : 'alquiler residencial y comercial'} en ${ciudadNombre}.`
                }
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Propiedades en Arriendo', href: '/arriendo' },
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
                        <p className="text-text-secondary text-center max-w-md font-medium px-6 mt-2 mb-10">
                            Actualmente no tenemos propiedades en arriendo que coincidan con estos criterios de búsqueda.
                        </p>
                        <Link href="/arriendo" className="btn-primary px-10">
                            Ver Todo el Catálogo
                        </Link>
                    </div>
                )}

                <div className="mt-32 space-y-24">
                    <ExploreAlso currentOperacion="arriendo" currentSlug={slug} />
                    <ListingConversionBanner />
                </div>
            </div>
        </main>
    );
}
