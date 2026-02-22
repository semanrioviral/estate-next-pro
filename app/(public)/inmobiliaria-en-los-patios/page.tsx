import { getPropertiesByOperacionAndCiudad, getFeaturedBarrios, getAllBarrios } from '@/lib/supabase/properties';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { Metadata } from 'next';
import { Building2, MapPin, CheckCircle2, Search, ArrowRight, ShieldCheck, TrendingUp, Home, Key, Landmark, BadgeCheck, Calculator, BarChart3, PiggyBank, Zap, Gavel } from 'lucide-react';
import Link from 'next/link';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import FAQAccordion from '@/components/FAQAccordion';
import Pagination from '@/components/design-system/Pagination';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = 'Inmobiliaria en Los Patios | Inmobiliaria Tucasa Los Patios';
    const description = "Autoridad definitiva en bienes raíces en Los Patios, Norte de Santander. Guía de inversión 2026, datos de mercado, servicios integrales y seguridad jurídica total.";
    const canonicalUrl = `${siteUrl}/inmobiliaria-en-los-patios`;

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
                    url: `${siteUrl}/images/og-lospatios-dominance.jpg`,
                    width: 1200,
                    height: 630,
                    alt: 'Dominancia Inmobiliaria en Los Patios 2026',
                },
            ],
        },
    };
}

export default async function LosPatiosDominanceAuthorityPage({
    searchParams
}: {
    searchParams: Promise<{ orden?: string; page?: string }>;
}) {
    const { orden, page: pageParam } = await searchParams;
    const currentPage = Number(pageParam) || 1;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    // Data fetching
    const [propertiesData, featuredBarrios, allBarrios] = await Promise.all([
        getPropertiesByOperacionAndCiudad('venta', 'los-patios', undefined, undefined, orden, currentPage),
        getFeaturedBarrios(6),
        getAllBarrios()
    ]);

    const { properties, totalCount } = propertiesData || { properties: [], totalCount: 0 };

    const FAQs = [
        {
            q: "¿Es buena inversión comprar en Los Patios este 2026?",
            a: "Definitivamente. Los Patios se ha consolidado como el municipio de mayor valorización en Norte de Santander, ofreciendo una rentabilidad anual proyectada del 15%."
        },
        {
            q: "¿Qué barrios tienen mayor valorización en Los Patios?",
            a: "Sectores como La Sabana, Pinar del Río y el Kilómetro 8 (KM 8) lideran la plusvalía. Estos barrios ofrecen infraestructura moderna y seguridad privada."
        },
        {
            q: "¿Cuánto cuesta el metro cuadrado en Los Patios?",
            a: "Para este 2026, el precio promedio por metro cuadrado oscila entre $2.8M y $3.5M COP, dependiendo del estrato."
        },
        {
            q: "¿Cómo comprar vivienda con Caja Honor en Los Patios?",
            a: "Nuestra inmobiliaria es experta en trámites con Caja Honor. Gestionamos los subsidios y créditos para miembros de la Fuerza Pública."
        }
    ];

    const services = [
        { title: "Venta de Inmuebles", desc: "Comercialización estratégica con alcance masivo.", icon: TrendingUp },
        { title: "Arriendos Garantizados", desc: "Gestión integral con pólizas de cumplimiento.", icon: Key },
        { title: "Avalúos Comerciales", desc: "Certificación profesional del valor real.", icon: Calculator },
        { title: "Asesoría Legal", desc: "Acompañamiento en escrituración y trámites notariales.", icon: Gavel }
    ];

    const marketData = [
        { label: "Precio prom. m²", value: "$2.8M - $3.4M", trend: "+12% vs 2025", icon: BarChart3 },
        { label: "Valorización Anual", value: "15.4%", trend: "Sostenido", icon: TrendingUp },
        { label: "Demanda Vivienda", value: "65% Nueva", trend: "En crecimiento", icon: PiggyBank },
        { label: "Tiempo Cierre", value: "45 Días", trend: "Promedio local", icon: Zap }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${siteUrl}/inmobiliaria-en-los-patios#webpage`,
                "url": `${siteUrl}/inmobiliaria-en-los-patios`,
                "name": "Autoridad Máxima Inmobiliaria en Los Patios",
                "description": "El recurso definitivo sobre el mercado inmobiliario en Los Patios, Norte de Santander."
            },
            {
                "@type": ["LocalBusiness", "RealEstateAgent"],
                "@id": `${siteUrl}/#localbusiness`,
                "name": "Inmobiliaria Tucasa Los Patios",
                "image": `${siteUrl}/logo.png`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Los Patios",
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO"
                }
            },
            {
                "@type": "FAQPage",
                "mainEntity": FAQs.map(faq => ({
                    "@type": "Question",
                    "name": faq.q,
                    "acceptedAnswer": { "@type": "Answer", "text": faq.a }
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
                title={<>Inmobiliaria en <span className="text-brand">Los Patios</span></>}
                description={<>Líderes en gestión de <Link href="/venta/los-patios" className="text-text-primary border-b border-brand/30 hover:border-brand transition-colors">inmuebles en venta</Link> y <Link href="/arriendo/los-patios" className="text-text-primary border-b border-brand/30 hover:border-brand transition-colors">arriendos</Link> en el pulmón residencial de la región.</>}
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Inmobiliaria en Los Patios' }
                ]}
                badge={{
                    icon: BadgeCheck,
                    text: 'Referente Municipal 2026'
                }}
            />

            {/* MERCADO */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Contexto Municipal</p>
                            <h2 className="mb-8">Mercado Inmobiliario en <span className="text-brand">Los Patios</span></h2>
                            <div className="space-y-6 text-lg text-text-secondary leading-relaxed font-secondary">
                                <p>
                                    El panorama de <strong>inmobiliaria en Los Patios, Norte de Santander</strong>, ha dado un salto cualitativo este 2026. La consolidación de la autopista internacional y la modernización de servicios públicos han posicionado al municipio como un polo de inversión independiente.
                                </p>
                                <p>
                                    Los Patios ofrece una tranquilidad residencial superior, atrayendo a familias que buscan casas en barrios como <strong>La Sabana</strong> o <strong>Pinar del Río</strong>. Nuestra experticia local nos permite identificar las mejores oportunidades de valorización.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 bg-bg-alt rounded-xl border border-zinc-100 flex flex-col items-center text-center group hover:border-brand transition-colors">
                                <TrendingUp className="w-10 h-10 text-brand mb-4" />
                                <span className="text-3xl font-black text-zinc-950">+10 Años</span>
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-2">Experiencia Real</span>
                            </div>
                            <div className="p-8 bg-zinc-950 rounded-xl flex flex-col items-center text-center group">
                                <ShieldCheck className="w-10 h-10 text-brand mb-4" />
                                <span className="text-3xl font-black text-white">100%</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-2">Cierres Legales</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            {/* MARKET DATA */}
            <section className="py-24 bg-bg-alt border-y border-zinc-100">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <h2 className="mb-4">Métricas del <span className="text-brand">Mercado</span> 2026</h2>
                        <p className="text-text-secondary font-medium italic">Información estratégica basada en operaciones reales.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {marketData.map((data, i) => (
                            <div key={i} className="p-10 bg-white rounded-xl border border-zinc-100 relative group hover:border-brand transition-colors">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">{data.label}</h4>
                                <div className="text-3xl font-black text-zinc-950 mb-2">{data.value}</div>
                                <div className="text-xs font-black text-brand flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> {data.trend}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SERVICIOS */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Soluciones 360°</p>
                        <h2 className="mb-4">Servicios <span className="text-brand">Integrales</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {services.map((service, i) => (
                            <div key={i} className="p-10 bg-zinc-950 rounded-xl group border border-zinc-800 hover:border-brand transition-colors">
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center mb-6 text-brand">
                                    <service.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-black text-white mb-4 uppercase tracking-tight">{service.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed font-medium">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* PROPIEDADES */}
            <section className="py-24 bg-white border-t border-zinc-100">
                <div className="container-wide px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Portafolio Curado</p>
                            <h2 className="mb-2">Inmuebles en <span className="text-brand">Los Patios</span></h2>
                        </div>
                        <Link href="/venta/los-patios" className="text-xs font-black text-brand uppercase tracking-widest flex items-center gap-2 group">
                            Ver Todo en Los Patios <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                        <div className="py-32 text-center bg-bg-alt rounded-xl border border-zinc-100">
                            <Search className="w-16 h-16 text-zinc-300 mx-auto mb-6" />
                            <h3 className="text-2xl font-black mb-4">Catálogo en Actualización</h3>
                            <Link href="/contacto" className="text-brand font-black underline">Contactar un Asesor →</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* COBERTURA METROPOLITANA */}
            <section className="py-24 bg-zinc-950">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-white mb-4">Dominio del <span className="text-brand">Territorio</span></h2>
                        <p className="text-zinc-400 font-medium">Conectamos las mejores oportunidades en el Norte de Santander.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-10 bg-brand rounded-xl shadow-xl">
                            <h3 className="text-xl font-black mb-2 text-white">Los Patios</h3>
                            <p className="text-sm text-white/80 mb-6 font-medium">Líder residencial y calidad de vida.</p>
                            <span className="text-xs font-black uppercase tracking-widest text-white">Página Actual</span>
                        </div>
                        <Link href="/inmobiliaria-en-cucuta" className="p-10 bg-white/5 rounded-xl border border-white/10 hover:border-brand transition-colors group">
                            <h3 className="text-xl font-black mb-2 text-white">Cúcuta</h3>
                            <p className="text-sm text-zinc-500 mb-6 font-medium group-hover:text-zinc-400">Epicentro comercial y corporativo.</p>
                            <span className="text-xs font-black uppercase tracking-widest text-brand">Ver Guía →</span>
                        </Link>
                        <Link href="/inmobiliaria-en-villa-del-rosario" className="p-10 bg-white/5 rounded-xl border border-white/10 hover:border-brand transition-colors group">
                            <h3 className="text-xl font-black mb-2 text-white">Villa del Rosario</h3>
                            <p className="text-sm text-zinc-500 mb-6 font-medium group-hover:text-zinc-400">Historia y expansión fronteriza.</p>
                            <span className="text-xs font-black uppercase tracking-widest text-brand">Ver Guía →</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-24 bg-white border-t border-zinc-100">
                <div className="container-wide px-4 text-center">
                    <h2 className="mb-6">¿Desea <span className="text-brand">vender</span> en Los Patios?</h2>
                    <p className="text-xl text-text-secondary font-medium mb-12 max-w-2xl mx-auto">
                        Aproveche nuestra plataforma líder para vender al mejor precio de mercado en 2026.
                    </p>
                    <Link href="/vender-casa-en-los-patios" className="px-10 py-5 bg-zinc-950 text-white rounded-xl font-black text-lg hover:bg-zinc-800 transition-colors flex items-center gap-3 justify-center w-fit mx-auto">
                        Iniciar Proceso de Venta <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </main>
    );
}
