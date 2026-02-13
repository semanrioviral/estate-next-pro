import { Metadata } from "next";
import { getPropertiesByTypeAndCity } from "@/lib/supabase/properties";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import { Property } from "@/lib/supabase/properties";

interface Props {
    params: Promise<{ tipo: string; ciudad: string }>;
}

const TIPO_MAP: Record<string, Property["tipo"]> = {
    casas: "casa",
    apartamentos: "apartamento",
    lotes: "lote",
};

const CIUDAD_MAP: Record<string, Property["ciudad"]> = {
    cucuta: "Cúcuta",
    "los-patios": "Los Patios",
    "villa-del-rosario": "Villa del Rosario",
};

const CIUDAD_DISPLAY_MAP: Record<string, string> = {
    cucuta: "Cúcuta",
    "los-patios": "Los Patios",
    "villa-del-rosario": "Villa del Rosario",
};

const TIPO_DISPLAY_MAP: Record<string, string> = {
    casas: "Casas",
    apartamentos: "Apartamentos",
    lotes: "Lotes",
};

export function generateStaticParams() {
    const tipos = ["casas", "apartamentos", "lotes"];
    const ciudades = ["cucuta", "los-patios", "villa-del-rosario"];

    return tipos.flatMap((tipo) =>
        ciudades.map((ciudad) => ({
            tipo,
            ciudad,
        }))
    );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { tipo, ciudad } = await params;
    const tipoDisplay = TIPO_DISPLAY_MAP[tipo];
    const ciudadDisplay = CIUDAD_DISPLAY_MAP[ciudad];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tucasalospatios.com";

    if (!tipoDisplay || !ciudadDisplay) return { title: "Página no encontrada" };

    return {
        metadataBase: new URL(siteUrl),
        title: `${tipoDisplay} en venta en ${ciudadDisplay} | TucasaLosPatios`,
        description: `Descubre las mejores ${tipoDisplay.toLowerCase()} en venta en ${ciudadDisplay}. Precios actualizados, fotos reales y asesoría personalizada en Norte de Santander.`,
        robots: { index: true, follow: true },
        alternates: {
            canonical: `${siteUrl}/venta/${tipo}/${ciudad}`,
        },
        openGraph: {
            title: `${tipoDisplay} en venta en ${ciudadDisplay}`,
            description: `Listado exclusivo de ${tipoDisplay.toLowerCase()} en ${ciudadDisplay}.`,
            url: `${siteUrl}/venta/${tipo}/${ciudad}`,
            siteName: "TucasaLosPatios",
            locale: "es_CO",
            type: "website",
            images: [
                {
                    url: `${siteUrl}/og-image.png`,
                    width: 1200,
                    height: 630,
                    alt: `Venta de ${tipoDisplay.toLowerCase()} en ${ciudadDisplay}`,
                },
            ],
        },
    };
}

export default async function VentaTipoCiudadPage({ params }: Props) {
    const { tipo, ciudad } = await params;
    const tipoKey = TIPO_MAP[tipo];
    const ciudadKey = CIUDAD_MAP[ciudad];

    if (!tipoKey || !ciudadKey) {
        notFound();
    }

    const filteredProperties = await getPropertiesByTypeAndCity(tipoKey || '', ciudadKey || '');

    const tipoDisplay = TIPO_DISPLAY_MAP[tipo];
    const ciudadDisplay = CIUDAD_DISPLAY_MAP[ciudad];
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tucasalospatios.com";

    const getFaqs = (city: string) => {
        const cityName = CIUDAD_DISPLAY_MAP[city];
        return [
            {
                question: `¿Cuál es el precio promedio de las ${tipoDisplay.toLowerCase()} en ${cityName}?`,
                answer: `El precio de las ${tipoDisplay.toLowerCase()} en ${cityName} varía según el barrio y las comodidades, pero actualmente contamos con opciones desde ${filteredProperties.length > 0 ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Math.min(...filteredProperties.map(p => p.precio))) : 'precios competitivos'}.`
            },
            {
                question: `¿Qué barrios son los más recomendados para comprar ${tipoDisplay.toLowerCase()} en ${cityName}?`,
                answer: city === 'cucuta'
                    ? "Los barrios más cotizados en Cúcuta incluyen La Riviera, Caobos y Bellavista, conocidos por su seguridad y alta valorización."
                    : city === 'los-patios'
                        ? "En Los Patios, sectores como Tierra Linda y Valles del Mirador son altamente recomendados por su clima y tranquilidad."
                        : "En Villa del Rosario, el Centro Histórico y las nuevas urbanizaciones cerca de la autopista son excelentes opciones de inversión."
            },
            {
                question: `¿Cómo puedo agendar una visita para ver ${tipoDisplay.toLowerCase()} en ${cityName}?`,
                answer: "Puedes agendar una visita fácilmente haciendo clic en el botón de WhatsApp o contactándonos al +57 322 304 7435. Un asesor experto te acompañará en todo el proceso."
            }
        ];
    };

    const getSeoText = (city: string) => {
        if (city === "los-patios") {
            return `
        Los Patios se ha convertido en el epicentro del desarrollo residencial en el área metropolitana de Cúcuta. 
        Al buscar ${tipoDisplay.toLowerCase()} en venta en Los Patios, los inversionistas y familias encuentran un entorno equilibrado. 
        Este municipio ofrece no solo una ubicación estratégica cerca del centro de la capital, sino también un microclima agradable y una tranquilidad inigualable. 
        Sectores como Tierra Linda y Valles del Mirador destacan por su alta valorización y seguridad. 
        Nuestra oferta de comercialización garantiza que cada propiedad cuente con los estándares legales y técnicos requeridos. 
        Vivir en Los Patios significa tener acceso a centros comerciales, colegios de prestigio y vías de conexión rápida, manteniendo la esencia de un hogar acogedor. 
        Nuestros asesores senior conocen cada rincón de este municipio, asegurando que su inversión en finca raíz sea segura y rentable a largo plazo.
        Además, el crecimiento exponencial de proyectos de vivienda nueva ha dinamizado el mercado, permitiendo opciones tanto para familias jóvenes como para adultos mayores que buscan comodidad y accesos nivelados.
      `;
        }
        if (city === "cucuta") {
            return `
        Cúcuta es la puerta de entrada comercial a Colombia y su mercado inmobiliario refleja ese dinamismo constante. 
        Las ${tipoDisplay.toLowerCase()} en venta en Cúcuta son altamente demandadas por su rentabilidad y ubicación fronteriza estratégica. 
        Barrios como La Riviera, Caobos y Bellavista representan la excelencia residencial, con infraestructuras modernas y cercanía a nodos financieros. 
        La ciudad no solo ofrece un clima cálido y gente amable, sino también un desarrollo urbanístico que prioriza los espacios verdes y la conectividad. 
        Invertir en Cúcuta is apostar por una ciudad en transformación, donde el sector de servicios y el comercio internacional impulsan el valor de la tierra. 
        En TucasaLosPatios, pre-filtramos cada inmueble para asegurar que reciba solo fotos reales y descripciones honestas. 
        La Perla del Norte sigue siendo un polo de atracción para colombianos en el exterior que buscan retornar a una ciudad con calidad de vida y costos competitivos.
        La infraestructura vial mejorada y la expansión hacia el anillo vial han abierto nuevas zonas de expansión urbana con proyectos residenciales de vanguardia.
      `;
        }
        if (city === "villa-del-rosario") {
            return `
        Villa del Rosario combina perfectamente la profundidad histórica con el progreso urbanístico moderno. 
        Encontrar ${tipoDisplay.toLowerCase()} en venta en Villa del Rosario es descubrir tesoros residenciales cerca de hitos como el Templo Histórico. 
        Su proximidad a los puentes internacionales la hace un punto neurálgico para el comercio y la movilidad internacional. 
        Muchas familias eligen este municipio por su ambiente tradicional y sus nuevas urbanizaciones cerradas que ofrecen seguridad privada y zonas sociales completas. 
        El sector inmobiliario aquí se beneficia de la expansión de Cúcuta, pero manteniendo una identidad propia y precios de metro cuadrado más accesibles en ciertos segmentos. 
        Es el lugar ideal para quienes buscan una vida pausada sin perder la ventaja de estar a minutos del centro de la capital. 
        Nuestra asesoría incluye el acompañamiento en todo el proceso de cierre para que su experiencia en Villa del Rosario sea totalmente satisfactoria.
        El desarrollo de nuevas zonas comerciales en la entrada del municipio ha incrementado el interés de inversionistas que buscan propiedades con potencial mixto o residencial de alta demanda.
      `;
        }
        return "";
    };

    const advancedSchema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "CollectionPage",
                "@id": `${siteUrl}/venta/${tipo}/${ciudad}#webpage`,
                "url": `${siteUrl}/venta/${tipo}/${ciudad}`,
                "name": `${tipoDisplay} en venta en ${ciudadDisplay}`,
                "description": `Listado exclusivo de ${tipoDisplay.toLowerCase()} en ${ciudadDisplay}.`,
            },
            {
                "@type": "ItemList",
                "name": `${tipoDisplay} en venta en ${ciudadDisplay}`,
                "url": `${siteUrl}/venta/${tipo}/${ciudad}`,
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
                "@id": `${siteUrl}/venta/${tipo}/${ciudad}#breadcrumb`,
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
                        "name": tipoDisplay,
                        "item": `${siteUrl}/venta/${tipo}/${ciudad}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": ciudadDisplay,
                        "item": `${siteUrl}/venta/${tipo}/${ciudad}`
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
                "priceRange": "$$$",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Los Patios",
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO"
                },
                "areaServed": {
                    "@type": "State",
                    "name": "Norte de Santander"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": getFaqs(ciudad).map(faq => ({
                    "@type": "Question",
                    "name": faq.question,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.answer
                    }
                }))
            }
        ]
    };

    return (
        <div className="mx-auto max-w-7xl px-6 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedSchema) }}
            />

            <Breadcrumbs
                items={[
                    { label: "Venta", href: "/propiedades" },
                    { label: tipoDisplay, href: `/venta/${tipo}/${ciudad}` },
                    { label: ciudadDisplay }
                ]}
            />

            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl uppercase leading-tight">
                        {tipoDisplay} en venta en {ciudadDisplay}
                    </h1>
                    <p className="mt-4 text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl">
                        Catálogo exclusivo de {tipoDisplay.toLowerCase()} en {ciudadDisplay}.
                        Propiedades verificadas con la mejor ubicación de Norte de Santander.
                    </p>
                </div>

                {filteredProperties.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                            {filteredProperties.map((p, index) => (
                                <PropertyCard key={p.id} property={p} priority={index < 3} />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 rounded-[2.5rem] p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Próximamente más inmuebles</h2>
                        <p className="mt-4 text-zinc-600 dark:text-zinc-400">
                            Actualmente estamos actualizando nuestro inventario de {tipoDisplay.toLowerCase()} en {ciudadDisplay}.
                            Contáctanos para recibir ofertas exclusivas antes de que se publiquen.
                        </p>
                        <div className="mt-8">
                            <a
                                href="https://wa.me/573223047435"
                                className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-500 transition-all"
                            >
                                Consultar disponibilidad
                            </a>
                        </div>
                    </div>
                )}

                {/* SEO Content Section */}
                <section className="mt-20 pt-20 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <h2 className="text-3xl font-black text-zinc-900 dark:text-zinc-50 mb-10 uppercase tracking-tight">
                            Análisis del mercado: {tipoDisplay} en {ciudadDisplay}
                        </h2>
                        <div className="columns-1 md:columns-2 gap-12 text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg">
                            <p className="mb-6 whitespace-pre-line">
                                {getSeoText(ciudad)}
                            </p>
                            <p>
                                La importancia de contar con un aliado local en Norte de Santander es fundamental.
                                Nuestra plataforma TucasaLosPatios no solo ofrece un listado de inmuebles, sino una experiencia completa de asesoría inmobiliaria.
                                Entendemos que comprar una casa o apartamento es una de las decisiones financieras más importantes de su vida.
                                Por ello, nos esforzamos en proporcionar datos precisos sobre servicios públicos, estratificación y cercanía a puntos de interés.
                                Tanto en Cúcuta como en sus municipios metropolitanos, el mercado de finca raíz se mantiene sólido a pesar de las fluctuaciones económicas globales.
                                La frontera ofrece oportunidades únicas de inversión, especialmente para aquellos que buscan rentas cortas o residencias permanentes en una zona de alto intercambio cultural.
                                Contáctenos hoy mismo para agendar una visita personalizada y descubrir por qué somos la inmobiliaria de confianza en la región.
                                Nuestro compromiso con la excelencia nos obliga a revisar cada contrato y cada título, brindándole la paz mental necesaria para que usted solo se preocupe por imaginar su vida en su nuevo hogar.
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
