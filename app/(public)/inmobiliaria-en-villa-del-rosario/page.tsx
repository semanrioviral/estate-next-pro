import { getPropertiesByOperacionAndCiudad } from '@/lib/supabase/properties';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { Metadata } from 'next';
import { Building2, Search, ArrowRight, TrendingUp, BadgeCheck, History, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import CatalogHeader from '@/components/design-system/CatalogHeader';
import FAQAccordion from '@/components/FAQAccordion';
import Pagination from '@/components/design-system/Pagination';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = 'Inmobiliaria en Villa del Rosario | Inmobiliaria Tucasa Los Patios';
    const description = "Tu inmobiliaria experta en Villa del Rosario. Descubre casas y apartamentos en venta y arriendo en el municipio histórico.";
    const canonicalUrl = `${siteUrl}/inmobiliaria-en-villa-del-rosario`;

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
                    url: `${siteUrl}/images/og-villa-rosario-authority.jpg`,
                    width: 1200,
                    height: 630,
                    alt: 'Inmobiliaria en Villa del Rosario - Autoridad',
                },
            ],
        },
    };
}

export default async function VillaRosarioPillarPage({
    searchParams
}: {
    searchParams: Promise<{ orden?: string; page?: string }>;
}) {
    const { orden, page: pageParam } = await searchParams;
    const currentPage = Number(pageParam) || 1;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    // Data fetching
    const [propertiesData] = await Promise.all([
        getPropertiesByOperacionAndCiudad('venta', 'villa-del-rosario', undefined, undefined, orden, currentPage)
    ]);

    const { properties, totalCount } = propertiesData || { properties: [], totalCount: 0 };

    const FAQs = [
        {
            q: "¿Por qué elegir Villa del Rosario para vivir este 2026?",
            a: "El municipio ofrece un equilibrio entre historia, tranquilidad y desarrollo. Precios competitivos y excelente clima."
        },
        {
            q: "¿Cuáles son los barrios con mayor proyección?",
            a: "Sectores como Lomitas y las zonas aledañas al Templo Histórico están viendo un crecimiento acelerado."
        }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebPage",
                "@id": `${siteUrl}/inmobiliaria-en-villa-del-rosario#webpage`,
                "url": `${siteUrl}/inmobiliaria-en-villa-del-rosario`,
                "name": "Inmobiliaria en Villa del Rosario",
                "description": "Recurso oficial sobre el mercado inmobiliario en Villa del Rosario."
            },
            {
                "@type": ["LocalBusiness", "RealEstateAgent"],
                "@id": `${siteUrl}/inmobiliaria-en-villa-del-rosario#localbusiness`,
                "name": "Inmobiliaria Tucasa Los Patios - Villa del Rosario",
                "image": `${siteUrl}/logo.png`,
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Villa del Rosario",
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO"
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
                title={<>Inmobiliaria en <span className="text-brand">Villa Rosario</span></>}
                description={<>Oportunidades únicas de <Link href="/venta/villa-del-rosario" className="text-text-primary border-b border-brand/30 hover:border-brand transition-colors">vivienda en Villa del Rosario</Link> con el respaldo de nuestra red metropolitana.</>}
                totalCount={totalCount}
                breadcrumbs={[
                    { label: 'Inmobiliaria en Villa del Rosario' }
                ]}
                badge={{
                    icon: History,
                    text: 'Patrimonio Histórico 2026'
                }}
            />


            {/* MERCADO */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Eje Histórico</p>
                            <h2 className="mb-8">Mercado Inmobiliario en <span className="text-brand">Villa del Rosario</span></h2>
                            <div className="space-y-6 text-lg text-text-secondary leading-relaxed font-secondary">
                                <p>
                                    Villa del Rosario es uno de los ejes de mayor expansión urbana en el <strong>área metropolitana de Cúcuta</strong>. Entender la dinámica fronteriza y el crecimiento proyectado es vital para cualquier inversor.
                                </p>
                                <p>
                                    Ofrece una oferta diversificada que incluye desde casas coloniales hasta modernos conjuntos cerrados en zonas de alta valorización como <strong>Lomitas</strong>.
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-8 bg-bg-alt rounded-xl border border-zinc-100 flex flex-col items-center text-center group hover:border-brand transition-colors">
                                <TrendingUp className="w-10 h-10 text-brand mb-4" />
                                <span className="text-3xl font-black text-zinc-950">Alto</span>
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-2">Crecimiento Urbano</span>
                            </div>
                            <div className="p-8 bg-zinc-950 rounded-xl flex flex-col items-center text-center group">
                                <History className="w-10 h-10 text-brand mb-4" />
                                <span className="text-3xl font-black text-white">Único</span>
                                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black mt-2">Valor Histórico</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* COBERTURA METROPOLITANA */}
            <section className="py-24 bg-zinc-950">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-white mb-4">Estrategia de <span className="text-brand">Cobertura</span></h2>
                        <p className="text-zinc-400 font-medium">Interconectamos las mejores opciones del área metropolitana.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Link href="/inmobiliaria-en-cucuta" className="p-10 bg-white/5 rounded-xl border border-white/10 hover:border-brand transition-colors group">
                            <h3 className="text-xl font-black mb-2 text-white">Cúcuta</h3>
                            <p className="text-sm text-zinc-500 mb-6 font-medium group-hover:text-zinc-400">Motor comercial regional.</p>
                            <span className="text-xs font-black uppercase tracking-widest text-brand">Ver Guía →</span>
                        </Link>
                        <Link href="/inmobiliaria-en-los-patios" className="p-10 bg-white/5 rounded-xl border border-white/10 hover:border-brand transition-colors group">
                            <h3 className="text-xl font-black mb-2 text-white">Los Patios</h3>
                            <p className="text-sm text-zinc-500 mb-6 font-medium group-hover:text-zinc-400">Excelencia residencial.</p>
                            <span className="text-xs font-black uppercase tracking-widest text-brand">Ver Guía →</span>
                        </Link>
                        <div className="p-10 bg-brand rounded-xl shadow-xl">
                            <h3 className="text-xl font-black mb-2 text-white">Villa Rosario</h3>
                            <p className="text-sm text-white/80 mb-6 font-medium">Patrimonio y expansión.</p>
                            <span className="text-xs font-black uppercase tracking-widest text-white">Página Actual</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQs */}
            <section className="py-24 bg-bg-alt border-y border-zinc-100">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-4">
                            <HelpCircle className="w-3 h-3 text-brand" />
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Consultas</span>
                        </div>
                        <h2 className="mb-4">Inversión en <span className="text-brand">Villa Rosario</span></h2>
                        <p className="text-text-secondary font-medium">Resolvemos sus dudas sobre el mercado histórico.</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <FAQAccordion items={FAQs} />
                    </div>
                </div>
            </section>

            {/* PROPIEDADES */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Portafolio Destacado</p>
                            <h2 className="mb-2">Oportunidades en <span className="text-brand">Villa Rosario</span></h2>
                        </div>
                        <Link href="/venta/villa-del-rosario" className="text-xs font-black text-brand uppercase tracking-widest flex items-center gap-2 group">
                            Ver Todo el Portafolio <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
                            <Link href="/contacto" className="text-brand font-black underline">Consultar Opciones →</Link>
                        </div>
                    )}
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-24 bg-zinc-950 text-white rounded-t-[5rem]">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-white mb-6">¿Desea <span className="text-brand">vender</span> en Villa del Rosario?</h2>
                            <p className="text-xl text-zinc-400 font-medium mb-12">
                                Aproveche nuestra red de inversionistas para vender al mejor precio de mercado en 2026.
                            </p>
                            <Link href="/vender-casa-en-villa-del-rosario" className="px-10 py-5 bg-brand text-white rounded-xl font-black text-lg hover:bg-red-600 transition-colors flex items-center gap-3 w-fit">
                                Iniciar Proceso <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <div className="bg-white/5 p-10 rounded-xl border border-white/10">
                            <h4 className="text-brand font-black text-[10px] uppercase tracking-widest mb-8">Navegación</h4>
                            <ul className="grid grid-cols-2 gap-4 text-sm font-bold">
                                <li><Link href="/vender-casa-en-los-patios" className="text-zinc-400 hover:text-white">Vender Los Patios</Link></li>
                                <li><Link href="/vender-casa-en-cucuta" className="text-zinc-400 hover:text-white">Vender Cúcuta</Link></li>
                                <li><Link href="/venta/villa-del-rosario" className="text-zinc-400 hover:text-white">Casas en Venta</Link></li>
                                <li><Link href="/contacto" className="text-zinc-400 hover:text-white">Contacto</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
