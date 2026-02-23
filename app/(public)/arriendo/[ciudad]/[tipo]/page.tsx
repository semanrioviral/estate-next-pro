import { getPropertiesByOperacionCiudadTipo, getPropertiesByOperacionCiudadTipoAndTagSlug, getTagBySlug } from '@/lib/supabase/properties';
import { notFound } from 'next/navigation';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { Metadata } from 'next';
import { Search, Building2, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import ExploreAlso from '@/components/ExploreAlso';
import Pagination from '@/components/design-system/Pagination';

interface ArriendoCiudadTipoPageProps {
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

export async function generateMetadata({ params, searchParams }: ArriendoCiudadTipoPageProps): Promise<Metadata> {
    const { ciudad: ciudadSlug, tipo: tipoParam } = await params;
    const { barrio, habitaciones, orden, page } = await searchParams; // Destructure 'page' here
    const numHabitaciones = habitaciones ? parseInt(habitaciones) : undefined;
    const currentPage = Number(page) || 1; // Define currentPage for metadata
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
        ? await getPropertiesByOperacionCiudadTipoAndTagSlug('arriendo', ciudadSlug, tipoSlug, tagSlug, orden) || { properties: [], totalCount: 0 }
        : await getPropertiesByOperacionCiudadTipo('arriendo', ciudadSlug, tipoSlug, barrio, numHabitaciones, orden) || { properties: [], totalCount: 0 };

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
        ? `${tipoPluralizado.charAt(0).toUpperCase() + tipoPluralizado.slice(1)} con ${tagNombre} en arriendo en ${ciudadNombre}`
        : `${tipoPluralizado.charAt(0).toUpperCase() + tipoPluralizado.slice(1)} en arriendo en ${ciudadNombre}`;

    if (barrio && !tagNombre) {
        title = `${tipoPluralizado.charAt(0).toUpperCase() + tipoPluralizado.slice(1)} en arriendo en ${barrio.replace(/-/g, ' ')}, ${ciudadNombre}`;
    }

    const description = tagNombre
        ? `Encuentra ${tipoPluralizado.toLowerCase()} con ${tagNombre} en arriendo en ${ciudadNombre}. Gestión segura y asesoría profesional.`
        : `Encuentra los mejores ${tipoPluralizado.toLowerCase()} para arrendar en ${ciudadNombre}, Norte de Santander. Explora opciones disponibles.` + (numHabitaciones ? ` Con ${numHabitaciones} habitaciones.` : '');

    const canonicalUrl = `${siteUrl}/arriendo/${ciudadSlug}/${tipoParam}`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        robots: (!properties || properties.length < 2) ? { index: false, follow: true } : { index: true, follow: true },
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

export default async function ArriendoCiudadTipoPage({ params, searchParams }: ArriendoCiudadTipoPageProps) {
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
        ? await getPropertiesByOperacionCiudadTipoAndTagSlug('arriendo', ciudadSlug, tipoSlug, tagSlug, orden, currentPage) || { properties: [], totalCount: 0 }
        : await getPropertiesByOperacionCiudadTipo('arriendo', ciudadSlug, tipoSlug, barrio, numHabitaciones, orden, currentPage) || { properties: [], totalCount: 0 };

    if (!properties || (properties.length === 0 && currentPage === 1)) {
        notFound();
    }

    const ciudadNombre = properties.length > 0 ? properties[0].ciudad : ciudadSlug.replace(/-/g, ' ');
    const tipoNombre = properties.length > 0 ? properties[0].tipo : tipoSlug.replace(/-/g, ' ');
    const tagNombre = tagData?.nombre || '';
    const tipoPluralizado = tipoNombre.toLowerCase().endsWith('s') ? tipoNombre : `${tipoNombre}s`;
    const displayBarrio = barrio ? barrio.replace(/-/g, ' ') : '';

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const canonicalUrl = `${siteUrl}/arriendo/${ciudadSlug}/${tipoParam}`;

    let displayTitle = tagNombre
        ? `${tipoPluralizado} con ${tagNombre} en Arriendo en ${ciudadNombre}`
        : `${tipoPluralizado} en Arriendo en ${ciudadNombre}`;

    if (barrio && !tagNombre) {
        displayTitle = `${tipoPluralizado} en Arriendo en ${displayBarrio}, ${ciudadNombre}`;
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${canonicalUrl}#collection`,
                "name": displayTitle,
                "description": tagNombre
                    ? `Catálogo de ${tipoPluralizado.toLowerCase()} con ${tagNombre} para arrendar en ${ciudadNombre}.`
                    : `Catálogo de ${tipoPluralizado.toLowerCase()} en arriendo en ${ciudadNombre}, Norte de Santander.`,
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
                    ? `Explora los mejores ${tipoPluralizado.toLowerCase()} con ${tagNombre} disponibles para arrendar en la ciudad de ${ciudadNombre}.`
                    : `Explora nuestra selección rigurosa de ${tipoPluralizado.toLowerCase()} disponibles para arrendar en ${ciudadNombre}, Norte de Santander.`
                }
                totalCount={totalCount}
                breadcrumbs={tagSlug ? [
                    { label: 'Arriendo', href: '/arriendo' },
                    { label: ciudadNombre, href: `/arriendo/${ciudadSlug}` },
                    { label: tipoPluralizado, href: `/arriendo/${ciudadSlug}/${tipoSlug}` },
                    { label: tagNombre }
                ] : [
                    { label: 'Arriendo', href: '/arriendo' },
                    { label: ciudadNombre, href: `/arriendo/${ciudadSlug}` },
                    { label: tipoPluralizado }
                ]}
                badge={{
                    icon: Building2,
                    text: 'Alquiler Verificado'
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
                                Actualmente no tenemos {tipoPluralizado.toLowerCase()} {tagNombre ? `con ${tagNombre}` : ''} en arriendo en {ciudadNombre}. Explore otras opciones en el catálogo general.
                            </p>
                            <Link href="/arriendo" className="btn-primary">
                                <ArrowLeft className="w-5 h-5" />
                                Ver Todos los Arriendos
                            </Link>
                        </div>
                    )}

                    <div className="mt-24">
                        <ExploreAlso currentOperacion="arriendo" currentSlug={ciudadSlug} />
                    </div>
                </div>
            </section>
        </main>
    );
}
