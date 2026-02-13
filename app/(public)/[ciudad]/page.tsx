import { Metadata } from "next";
import { getPropertiesByCity } from "@/lib/supabase/properties";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";

interface Props {
    params: Promise<{ ciudad: string }>;
}

const CIUDAD_MAP: Record<string, string> = {
    "cucuta": "Cúcuta",
    "los-patios": "Los Patios",
    "villa-del-rosario": "Villa del Rosario",
};

const CITY_SEO_DATA: Record<string, { title: string; description: string; text: string }> = {
    "cucuta": {
        title: "Inmobiliaria en Cúcuta - Casas y apartamentos en venta | TucasaLosPatios",
        description: "Explora el catálogo más completo de inmuebles en Cúcuta. Casas en La Riviera, Caobos y más sectores exclusivos de Norte de Santander.",
        text: "Cúcuta, la vibrante capital de Norte de Santander, ofrece un mercado inmobiliario dinámico y lleno de oportunidades para todo tipo de compradores. Si está interesado en casas y apartamentos en venta en Cúcuta, descubrirá que la ciudad cuenta con sectores de alta valorización y prestigio como La Riviera, Caobos y Quinta Oriental, donde la arquitectura moderna se mezcla con la calidez del clima local. Como centro comercial y logístico estratégico en la frontera, Cúcuta atrae inversiones constantes, lo que se traduce en una oferta de vivienda robusta que incluye desde apartamentes de lujo con vistas panorámicas hasta casas confortables en urbanizaciones seguras. Ya sea que busque su primera vivienda o una propiedad para inversión, Cúcuta proporciona todas las comodidades urbanas, centros comerciales de primer nivel, instituciones educativas reconocidas y una infraestructura vial en mejora permanente. Confíe en nuestra experiencia para encontrar el inmueble perfecto en la Perla del Norte."
    },
    "los-patios": {
        title: "Casas y apartamentos en venta en Los Patios, N.S. | TucasaLosPatios",
        description: "Encuentra las mejores opciones de vivienda en Los Patios, Norte de Santander. Casas amplias, apartamentos modernos y lotes con gran ubicación. ¡Tu hogar ideal te espera!",
        text: "Los Patios se ha consolidado como uno de los municipios con mayor crecimiento residencial en el área metropolitana de Cúcuta. Su clima agradable, ambiente familiar y la tranquilidad de sus barrios lo convierten en la opción predilecta para quienes buscan un hogar equilibrado. Al buscar casas y apartamentos en venta en Los Patios, encontrará una oferta variada que incluye desde modernos conjuntos cerrados con zonas sociales completas hasta amplias casas independientes en sectores tradicionales. Esta zona ofrece una excelente conectividad con la capital del departamento, permitiendo disfrutar de la paz de un municipio residencial sin alejarse de los servicios comerciales y profesionales de la ciudad. Invertir en finca raíz en Los Patios garantiza valorización a largo plazo, gracias al desarrollo de infraestructura y la constante demanda de vivienda de calidad en sectores como Valles del Mirador o Tierra Linda."
    },
    "villa-del-rosario": {
        title: "Venta de casas en Villa del Rosario, Norte de Santander | TucasaLosPatios",
        description: "Propiedades destacadas en Villa del Rosario. Vive cerca de la historia y el progreso en sectores como Juan Frío y el Centro Histórico.",
        text: "Villa del Rosario no solo es la cuna de la Gran Colombia, sino también uno de los destinos residenciales más prometedores de Norte de Santander. La búsqueda de casas y apartamentos en venta en Villa del Rosario es hoy una tendencia creciente debido a su ubicación estratégica cerca de los puentes internacionales y su desarrollo urbanístico ordenado. El municipio ofrece un estilo de vida más pausado y tradicional, ideal para familias que valoran el espacio y la tranquilidad sin renunciar a la cercanía con el dinamismo comercial de Cúcuta. Los nuevos proyectos de vivienda en sectores como La Parada o el centro histórico están diseñados para cumplir con altos estándares de confort y seguridad, atrayendo a quienes desean habitar en un entorno con un profundo valor cultural y un horizonte de valorización garantizado. Con servicios públicos eficientes, parques recreativos y una comunidad acogedora, Villa del Rosario es el lugar donde su inversión inmobiliaria se transforma en un hogar con identidad y futuro."
    }
};

export function generateStaticParams() {
    return [
        { ciudad: "cucuta" },
        { ciudad: "los-patios" },
        { ciudad: "villa-del-rosario" }
    ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { ciudad } = await params;
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
            siteName: "TucasaLosPatios",
            locale: "es_CO",
            type: "website",
            images: [
                {
                    url: `${siteUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: "TucasaLosPatios | Inmobiliaria Líder",
                },
            ],
        },
    };
}

export default async function CiudadPage({ params }: Props) {
    const { ciudad } = await params;
    const cityName = CIUDAD_MAP[ciudad];
    const seo = CITY_SEO_DATA[ciudad];

    if (!cityName || !seo) {
        notFound();
    }

    const filteredProperties = await getPropertiesByCity(cityName);
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
                "itemListElement": filteredProperties.map((p, index) => ({
                    "@type": "ListItem",
                    "position": index + 1,
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
            },
            {
                "@type": ["LocalBusiness", "RealEstateAgent"],
                "@id": `${siteUrl}/#organization`,
                "name": "TucasaLosPatios",
                "image": `${siteUrl}/logo.png`,
                "url": siteUrl,
                "telephone": "+57 322 304 7435",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": cityName,
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO"
                }
            }
        ]
    };

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <Breadcrumbs items={[{ label: cityName }]} />

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div className="max-w-2xl">
                    <p className="text-sm font-bold uppercase tracking-widest text-blue-600">
                        {filteredProperties.length} propiedades disponibles
                    </p>
                    <h1 className="mt-2 text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl uppercase">
                        {cityName}
                    </h1>
                </div>
            </div>

            <div className="mt-8 prose prose-zinc dark:prose-invert max-w-4xl">
                <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                    {seo.text}
                </p>
            </div>

            <section className="mt-16">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Inmuebles Destacados en {cityName}</h2>
                {filteredProperties.length > 0 ? (
                    <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <p className="mt-10 text-center text-zinc-500">No hay propiedades disponibles en este momento en esta ciudad.</p>
                )}
            </section>
        </div>
    );
}
