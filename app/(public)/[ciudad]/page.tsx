import { Metadata } from "next";
import { getPropertiesByCity } from "@/lib/supabase/properties";
import PropertyCardV3 from "@/components/design-system/PropertyCardV3";
import { notFound } from "next/navigation";
import Link from 'next/link';
import { Home, Building2 } from 'lucide-react';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import Pagination from '@/components/design-system/Pagination';

interface Props {
    params: Promise<{ ciudad: string }>;
    searchParams: Promise<{ orden?: string; page?: string }>;
}

import { CIUDAD_MAP } from "@/lib/supabase/constants";

const CITY_SEO_DATA: Record<string, { title: string; description: string; text: string }> = {
    "cucuta": {
        title: "Inmobiliaria en Cúcuta - Casas y apartamentos en venta | Inmobiliaria Tucasa Los Patios",
        description: "Explora el catálogo más completo de inmuebles en Cúcuta. Casas en La Riviera, Caobos y más sectores exclusivos de Norte de Santander.",
        text: "Cúcuta, la vibrante capital de Norte de Santander, ofrece un mercado inmobiliario dinámico y lleno de oportunidades para todo tipo de compradores. Si está interesado en casas y apartamentos en venta en Cúcuta, descubrirá que la ciudad cuenta con sectores de alta valorización y prestigio como La Riviera, Caobos y Quinta Oriental, donde la arquitectura moderna se mezcla con la calidez del clima local. Como centro comercial y logístico estratégico en la frontera, Cúcuta atrae inversiones constantes, lo que se traduce en una oferta de vivienda robusta que incluye desde apartamentes de lujo con vistas panorámicas hasta casas confortables en urbanizaciones seguras. Ya sea que busque su primera vivienda o una propiedad para inversión, Cúcuta proporciona todas las comodidades urbanas, centros comerciales de primer nivel, instituciones educativas reconocidas y una infraestructura vial en mejora permanente. Confíe en nuestra experiencia para encontrar el inmueble perfecto en la Perla del Norte."
    },
    "los-patios": {
        title: "Casas y apartamentos en venta en Los Patios, N.S. | Inmobiliaria Tucasa Los Patios",
        description: "Encuentra las mejores opciones de vivienda en Los Patios, Norte de Santander. Casas amplias, apartamentos modernos y lotes con gran ubicación. ¡Tu hogar ideal te espera!",
        text: "Los Patios se ha consolidado como uno de los municipios con mayor crecimiento residencial en el área metropolitana de Cúcuta. Su clima agradable, ambiente familiar y la tranquilidad de sus barrios lo convierten en la opción predilecta para quienes buscan un hogar equilibrado. Al buscar casas y apartamentos en venta en Los Patios, encontrará una oferta variada que incluye desde modernos conjuntos cerrados con zonas sociales completas hasta amplias casas independientes en sectores tradicionales. Esta zona ofrece una excelente conectividad con la capital del departamento, permitiendo disfrutar de la paz de un municipio residencial sin alejarse de los servicios comerciales y profesionales de la ciudad. Invertir en finca raíz en Los Patios garantiza valorización a largo plazo, gracias al desarrollo de infraestructura y la constante demanda de vivienda de calidad en sectores como Valles del Mirador o Tierra Linda."
    },
    "villa-del-rosario": {
        title: "Venta de casas en Villa del Rosario, Norte de Santander | Inmobiliaria Tucasa Los Patios",
        description: "Propiedades destacadas en Villa del Rosario. Vive cerca de la historia y el progreso en sectores como Juan Frío y el Centro Histórico.",
        text: "Villa del Rosario no solo es la cuna de la Gran Colombia, sino también uno de los destinos residenciales más prometedores de Norte de Santander. La búsqueda de casas y apartamentos en venta en Villa del Rosario es hoy una tendencia creciente debido a su ubicación estratégica cerca de los puentes internacionales y su desarrollo urbanístico ordenado. El municipio ofrece un estilo de vida más pausado y tradicional, ideal para familias que valoran el espacio y la tranquilidad sin renunciar a la cercanía con el dinamismo comercial de Cúcuta. Los nuevos proyectos de vivienda en sectores como La Parada o el centro histórico están diseñados para cumplir con altos estándares de confort y seguridad, atrayendo a quienes desean habitar en un entorno con un profundo valor cultural y un horizonte de valorización garantizado. Con servicios públicos eficientes, parques recreativos y una comunidad acogedora, Villa del Rosario es el lugar donde su inversión inmobiliaria se transforma en un hogar con identidad y futuro."
    }
};

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { ciudad } = await params;
    const { orden } = await searchParams;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tucasalospatios.com";
    const seo = CITY_SEO_DATA[ciudad];

    if (!seo) return { title: "Ciudad no encontrada" };

    return {
        metadataBase: new URL(siteUrl),
        title: seo.title,
        description: seo.description,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${siteUrl}/${ciudad}`,
        },
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: `${siteUrl}/${ciudad}`,
            siteName: "Inmobiliaria Tucasa Los Patios",
            locale: "es_CO",
            type: "website",
            images: [
                {
                    url: `${siteUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: "Inmobiliaria Tucasa Los Patios | Inmobiliaria Líder",
                },
            ],
        },
    };
}

export default async function CiudadPage({ params, searchParams }: Props) {
    const { ciudad } = await params;
    const { orden, page: pageParam } = await searchParams;
    const currentPage = Number(pageParam) || 1;
    const cityName = CIUDAD_MAP[ciudad];
    const seo = CITY_SEO_DATA[ciudad];

    if (!cityName || !seo) {
        notFound();
    }

    const { properties, totalCount } = await getPropertiesByCity(cityName, orden, currentPage);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tucasalospatios.com";

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${siteUrl}/${ciudad}#webpage`,
                "url": `${siteUrl}/${ciudad}`,
                "name": seo.title,
                "description": seo.description,
            },
            {
                "@type": "ItemList",
                "name": `Propiedades en venta en ${cityName}`,
                "url": `${siteUrl}/${ciudad}`,
                "numberOfItems": totalCount,
                "itemListElement": properties.map((p, index) => ({
                    "@type": "ListItem",
                    "position": ((currentPage - 1) * 12) + index + 1,
                    "url": `${siteUrl}/propiedades/${p.slug}`,
                    "name": p.titulo,
                    "image": p.imagen_principal.startsWith('http') ? p.imagen_principal : `${siteUrl}${p.imagen_principal}`,
                })),
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${siteUrl}/${ciudad}#breadcrumb`,
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
                        "item": `${siteUrl}/propiedades`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": cityName,
                        "item": `${siteUrl}/${ciudad}`
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
                title={<>Inmuebles en <span className="text-brand">{cityName}</span></>}
                description={seo.text}
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Venta', href: '/propiedades' },
                    { label: cityName }
                ]}
                badge={{
                    icon: Building2,
                    text: 'Enfoque Regional'
                }}
            />

            <section className="py-20">
                <div className="container-wide px-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                        <div>
                            <h2 className="mb-2">Oportunidades en <span className="text-brand">{cityName}</span></h2>
                            <p className="text-text-secondary font-medium">Listado actualizado de propiedades verificadas.</p>
                        </div>
                    </div>

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
                        <div className="text-center py-32 bg-bg-alt rounded-2xl border border-border-clean border-dashed">
                            <p className="text-text-muted font-bold text-sm uppercase tracking-widest">
                                Actualizando catálogo en {cityName}...
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </main >
    );
}
