import { getPropertiesByOperacionAndCiudad, getFeaturedBarrios } from '@/lib/supabase/properties';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { Metadata } from 'next';
import { Building2, Landmark, Search, ArrowRight, TrendingUp, Home, PiggyBank, Flame, CheckCircle2, MapPin } from 'lucide-react';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import Pagination from '@/components/design-system/Pagination';
import Link from 'next/link';
import FAQAccordion from '@/components/FAQAccordion';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = 'Inmobiliaria en Cúcuta | Inmobiliaria Tucasa Los Patios';
    const description = "Tu inmobiliaria de confianza en Cúcuta y el Área Metropolitana. Expertos en venta y arriendo con asesoría legal profesional y el mejor catálogo de inmuebles.";
    const canonicalUrl = `${siteUrl}/inmobiliaria-en-cucuta`;

    return {
        title,
        description,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            title,
            description,
            type: 'website',
            url: canonicalUrl,
            images: [
                {
                    url: `${siteUrl}/images/og-cucuta-authority.jpg`,
                    width: 1200,
                    height: 630,
                    alt: 'Inmobiliaria en Cúcuta - Autoridad Metropolitana',
                },
            ],
        },
    };
}

export default async function CucutaPillarPage({
    searchParams
}: {
    searchParams: Promise<{ orden?: string; page?: string }>;
}) {
    const { orden, page: pageParam } = await searchParams;
    const currentPage = Number(pageParam) || 1;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    // Data fetching
    const [propertiesData, featuredBarrios] = await Promise.all([
        getPropertiesByOperacionAndCiudad('venta', 'cucuta', undefined, undefined, orden, currentPage),
        getFeaturedBarrios(6)
    ]);

    const { properties, totalCount } = propertiesData || { properties: [], totalCount: 0 };

    const FAQs = [
        {
            q: "¿Por qué invertir en inmuebles en Cúcuta este 2026?",
            a: "Cúcuta es el nodo logístico del oriente colombiano. La reactivación comercial y su estatus de Zona Económica Especial atraen capital que busca activos con alta rotación y renta comercial segura."
        },
        {
            q: "¿Cuáles son las mejores zonas para comprar apartamento en Cúcuta?",
            a: "Barrios como Caobos y Sayago son ideales para perfiles corporativos y rentas cortas. Para familias, sectores como Lleras y Prados del Este ofrecen seguridad y cercanía a los principales centros comerciales."
        },
        {
            q: "¿Qué es la ZESE y cómo beneficia mi inversión inmobiliaria?",
            a: "La Zona Económica y Social Especial (ZESE) ofrece beneficios tributarios a empresas que se instalen en Cúcuta, lo que aumenta la demanda de oficinas, locales y vivienda de alto nivel para ejecutivos."
        },
        {
            q: "¿Es rentable el modelo de rentas cortas (Airbnb) en Cúcuta?",
            a: "Sí, la ciudad tiene un flujo constante de turismo de salud, negocios y tránsito fronterizo. Un apartamento bien ubicado en Caobos puede generar retornos superiores al arriendo tradicional."
        },
        {
            q: "¿Qué garantías legales ofrece su inmobiliaria en Cúcuta?",
            a: "Realizamos un estudio de títulos exhaustivo, verificamos gravámenes y acompañamos el proceso notarial para asegurar que la tradición del inmueble sea perfecta y sin riesgos para el comprador."
        },
        {
            q: "¿Cómo puede comprar un colombiano en el exterior desde Cúcuta?",
            a: "Gestionamos la compra mediante poder legal. Facilitamos el envío de divisas bajo normativa cambiaria y coordinamos con bancos para créditos de vivienda para colombianos residentes fuera del país."
        },
        {
            q: "¿Qué gastos notariales debe asumir el comprador en Cúcuta?",
            a: "Normalmente, los gastos notariales se dividen 50/50 entre comprador y vendedor. El comprador asume además la Retención en la fuente (si aplica) y los derechos de registro de la escritura."
        },
        {
            q: "¿Cuál es la diferencia de invertir en Cúcuta frente a Los Patios?",
            a: "Cúcuta es ideal para activos comerciales y de renta rápida urbana. Los Patios se especializa en vivienda residencial de descanso y campestre con mayor tranquilidad y calidad de aire."
        }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${siteUrl}/inmobiliaria-en-cucuta#webpage`,
                "url": `${siteUrl}/inmobiliaria-en-cucuta`,
                "name": "Inmobiliaria en Cúcuta y Área Metropolitana",
                "description": "Referencia de autoridad sobre el mercado inmobiliario en San José de Cúcuta."
            },
            {
                "@type": ["LocalBusiness", "RealEstateAgent"],
                "@id": `${siteUrl}/inmobiliaria-en-cucuta#localbusiness`,
                "name": "Inmobiliaria Tucasa Los Patios - División Cúcuta",
                "image": `${siteUrl}/logo.png`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Cúcuta",
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO"
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": "7.8939",
                    "longitude": "-72.5078"
                },
                "url": `${siteUrl}/inmobiliaria-en-cucuta`,
                "telephone": "+573223047435",
                "priceRange": "$$",
                "areaServed": [
                    { "@type": "City", "name": "Cúcuta" },
                    { "@type": "City", "name": "Los Patios" },
                    { "@type": "City", "name": "Villa del Rosario" }
                ]
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${siteUrl}/inmobiliaria-en-cucuta#breadcrumb`,
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": siteUrl },
                    { "@type": "ListItem", "position": 2, "name": "Inmobiliaria en Cúcuta", "item": `${siteUrl}/inmobiliaria-en-cucuta` }
                ]
            },
            {
                "@type": "FAQPage",
                "mainEntity": FAQs.map(faq => ({
                    "@type": "Question",
                    "name": faq.q,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": faq.a
                    }
                }))
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
                title={<>Expertos en <span className="text-brand">Inmobiliaria</span> en Cúcuta</>}
                description={<>Su socio estratégico para <Link href="/venta/cucuta" className="text-text-primary border-b-2 border-brand/30 hover:border-brand transition-colors">invertir en activos</Link> de alta rentabilidad en el oriente colombiano.</>}
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Inmobiliaria en Cúcuta' }
                ]}
                badge={{
                    icon: Landmark,
                    text: 'Liderazgo Regional 2026'
                }}
            />

            {/* Contexto Regional */}
            <section className="py-24">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest mb-4 block">Contexto Regional</span>
                            <h2 className="mb-8 font-black">Mercados Estratégicos en <span className="text-brand">Norte de Santander</span></h2>
                            <div className="space-y-6 text-lg text-text-secondary leading-relaxed">
                                <p>
                                    Cúcuta es el epicentro comercial y logístico del oriente colombiano. Elegir una <strong>inmobiliaria en Cúcuta</strong> con conocimiento territorial es la clave para una inversión exitosa. La ciudad ofrece una mezcla única de barrios tradicionales y zonas de expansión moderna.
                                </p>
                                <p>
                                    Zonas como <strong>Caobos, Sayago y Lleras</strong> son las preferidas por inversores que buscan rentabilidad por rentas cortas y comerciales. Nuestro equipo le ofrece el respaldo legal necesario para operar en esta zona económica especial.
                                </p>
                            </div>
                        </div>
                        <div className="bg-bg-alt p-10 md:p-14 rounded-3xl border border-border-clean shadow-sm">
                            <h3 className="text-lg font-black mb-10 text-text-primary uppercase tracking-widest border-b border-border-clean pb-4">Zonas de Valorización</h3>
                            <ul className="space-y-8">
                                <li className="flex gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-border-clean flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <TrendingUp className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1 text-lg">Barrio Caobos</h4>
                                        <p className="text-text-secondary leading-relaxed">Hub gastronómico y corporativo de primer nivel.</p>
                                    </div>
                                </li>
                                <li className="flex gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-border-clean flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <Home className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1 text-lg">Lleras y Sayago</h4>
                                        <p className="text-text-secondary leading-relaxed">Demanda constante de vivienda multifamiliar.</p>
                                    </div>
                                </li>
                                <li className="flex gap-5">
                                    <div className="w-12 h-12 bg-white rounded-2xl border border-border-clean flex items-center justify-center flex-shrink-0 shadow-sm">
                                        <PiggyBank className="w-6 h-6 text-brand" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary mb-1 text-lg">Av. Libertadores</h4>
                                        <p className="text-text-secondary leading-relaxed">Plusvalía comercial garantizada por alto flujo.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* COMPARATIVA */}
            <section className="py-24 bg-bg-alt border-y border-border-clean">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <h2 className="mb-4 font-black">¿Cúcuta o <span className="text-brand">Los Patios</span>?</h2>
                        <p className="text-text-secondary font-medium max-w-2xl mx-auto text-lg">Dos mercados distintos para perfiles de inversión diferentes.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-10 bg-white rounded-3xl border border-border-clean shadow-sm">
                            <h4 className="text-xl font-black mb-6 flex items-center gap-3 text-text-primary">
                                <Landmark className="w-6 h-6 text-brand" />
                                Perfil Cúcuta
                            </h4>
                            <ul className="space-y-4 text-text-secondary font-medium">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand" />
                                    Activos comerciales de alta rotación
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand" />
                                    Rentas cortas (Airbnb) en barrios VIP
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand" />
                                    Mayor densidad urbana y servicios
                                </li>
                            </ul>
                        </div>
                        <div className="p-10 bg-white rounded-3xl border border-border-clean shadow-sm">
                            <h4 className="text-xl font-black mb-6 flex items-center gap-3 text-text-primary">
                                <MapPin className="w-6 h-6 text-brand" />
                                Perfil Los Patios
                            </h4>
                            <ul className="space-y-4 text-text-secondary font-medium">
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand" />
                                    Casas residenciales y campestres
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand" />
                                    Valorización por calidad de vida
                                </li>
                                <li className="flex items-center gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-brand" />
                                    Entorno tranquilo y aire puro
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* DOMINIO TERRITORIAL */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black text-brand uppercase tracking-widest mb-4 block">Nuestra Red Metropolitan</span>
                        <h2 className="mb-4 font-black">Domino del <span className="text-brand">Territorio</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <Link href="/inmobiliaria-en-los-patios" className="p-12 bg-bg-alt rounded-3xl border border-border-clean hover:border-brand transition-all group">
                            <h3 className="text-2xl font-black mb-2 text-text-primary">Los Patios</h3>
                            <p className="text-text-secondary mb-8 font-medium">El pulmón residencial de la región.</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand group-hover:gap-3 transition-all flex items-center justify-center gap-2">
                                Ver Guía <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                        <div className="p-12 bg-white rounded-3xl border-2 border-brand shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3">
                                <div className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black mb-2 text-text-primary">Cúcuta</h3>
                            <p className="text-text-secondary mb-8 font-medium">Epicentro comercial corporativo.</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Página Actual</span>
                        </div>
                        <Link href="/inmobiliaria-en-villa-del-rosario" className="p-12 bg-bg-alt rounded-3xl border border-border-clean hover:border-brand transition-all group">
                            <h3 className="text-2xl font-black mb-2 text-text-primary">Villa del Rosario</h3>
                            <p className="text-text-secondary mb-8 font-medium">Historia y expansión fronteriza.</p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand group-hover:gap-3 transition-all flex items-center justify-center gap-2">
                                Ver Guía <ArrowRight className="w-4 h-4" />
                            </span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* FAQS */}
            <section className="py-24 bg-bg-alt border-y border-border-clean">
                <div className="container-wide px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="mb-4 text-3xl font-black">Guía del <span className="text-brand">Inversionista</span></h2>
                            <p className="text-text-secondary font-medium text-lg">Respuestas técnicas a sus dudas sobre el mercado en Cúcuta.</p>
                        </div>
                        <FAQAccordion items={FAQs} />
                    </div>
                </div>
            </section>

            {/* PROPIEDADES DESTACADAS */}
            <section className="py-24">
                <div className="container-wide px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest mb-4 block">Portafolio Curado</span>
                            <h2 className="mb-2 font-black">Inmuebles en <span className="text-brand">Cúcuta</span></h2>
                        </div>
                        <Link href="/venta/cucuta" className="text-[10px] font-black text-brand uppercase tracking-widest flex items-center gap-2 group border-b border-brand/20 pb-1">
                            Ver Todo en Cúcuta <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {properties.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                                {properties.map((prop: any) => (
                                    <PropertyCardV3 key={prop.id} property={prop} />
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
                        <div className="py-32 text-center bg-bg-alt rounded-3xl border border-border-clean border-dashed">
                            <Search className="w-12 h-12 text-text-muted mx-auto mb-6" />
                            <h3 className="text-xl font-black mb-4">Catálogo en Actualización</h3>
                            <Link href="/contacto" className="text-brand font-black hover:underline transition-all">Contactar un Asesor →</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-24 bg-white border-t border-border-clean">
                <div className="container-wide px-4 text-center">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-black mb-6">¿Desea <span className="text-brand">vender</span> su inmueble?</h2>
                        <p className="text-xl text-text-secondary font-medium mb-12 leading-relaxed">
                            Aproveche nuestra plataforma líder y red de inversionistas para vender al mejor precio de mercado en 2026. Realizamos el avalúo técnico y el estudio legal completo.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link href="/vender-casa-en-cucuta" className="btn-primary py-5 px-12 text-lg inline-flex items-center gap-3">
                                Vender en Cúcuta <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
