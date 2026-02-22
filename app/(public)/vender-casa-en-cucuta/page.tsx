import { Metadata } from 'next';
import {
    TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle2,
    BarChart3, Users, Star, MessageCircle, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import PropertyOwnerForm from '@/components/PropertyOwnerForm';
import FAQAccordion from '@/components/FAQAccordion';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = "Vender In inmueble en Cúcuta | Inmobiliaria Profesional 2026";
    const description = "Venda su casa, apartamento o local en Cúcuta con la mejor estrategia. Mi Casa Ya, Caja Honor y créditos hipotecarios. ¡Expertos en cierre!";
    const canonicalUrl = `${siteUrl}/vender-casa-en-cucuta`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'website',
            images: [{ url: `${siteUrl}/images/og-vender-cucuta.jpg` }]
        }
    };
}

export default function VenderCucutaPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    const faqs = [
        { q: "¿En qué zonas de Cúcuta tienen mayor demanda?", a: "Actualmente barrios como Caobos, Lleras y Prados del Este tienen una altísima rotación. Sin embargo, cubrimos toda la ciudad y el área metropolitana." },
        { q: "¿Cómo manejan los trámites de Caja Honor?", a: "Tenemos un departamento jurídico experto en Fuerzas Armadas. Gestionamos la compraventa bajo los estándares legales de las cajas militares para su seguridad." },
        { q: "¿Qué marketing hacen para mi propiedad?", a: "Usamos pauta segmentada en Meta y Google, portales premium y nuestra base de datos activa de más de 5,000 compradores potenciales." }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": "Venta de inmuebles en Cúcuta",
                "serviceType": "Venta de inmuebles",
                "provider": {
                    "@type": "LocalBusiness",
                    "name": "Inmobiliaria Tucasa Los Patios",
                    "image": `${siteUrl}/logo.png`
                },
                "areaServed": {
                    "@type": "City",
                    "name": "Cúcuta"
                },
                "description": "Intermediación profesional para venta de casas y apartamentos en Cúcuta."
            },
            {
                "@type": "FAQPage",
                "mainEntity": faqs.map(faq => ({
                    "@type": "Question",
                    "name": faq.q,
                    "acceptedAnswer": { "@type": "Answer", "text": faq.a }
                }))
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* HERO - Phase 20 Style */}
            <section className="bg-zinc-950 py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-brand/5 blur-[120px] rounded-full translate-x-1/2"></div>
                <div className="container-wide px-4 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-8">
                            <TrendingUp className="w-4 h-4 text-brand" />
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Maximización de Activos</span>
                        </div>
                        <h1 className="!text-white mb-8 drop-shadow-2xl">
                            Venda su Inmueble en <span className="text-brand">Cúcuta</span>
                        </h1>
                        <p className="text-xl md:text-2xl !text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed drop-shadow-lg">
                            Conectamos su propiedad con los mejores inversores mediante estrategias de marketing digital de alto impacto.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <a href="#proceso" className="px-10 py-5 bg-white text-zinc-950 rounded-xl font-black text-lg hover:bg-zinc-100 transition-colors">
                                Nuestro Método
                            </a>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="px-10 py-5 bg-brand text-white rounded-xl font-black text-lg hover:bg-red-600 transition-colors flex items-center gap-3">
                                <MessageCircle className="w-5 h-5" />
                                WhatsApp Directo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROCESO - Geometric Cards */}
            <section id="proceso" className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="text-center mb-16">
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Metodología TLP</p>
                        <h2 className="mb-4">Estrategia de Venta <span className="text-brand">Profesional</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Valoración de Mercado", text: "Definimos el precio óptimo basado en datos reales de cierre en barrios como Caobos y San Luis.", icon: BarChart3 },
                            { title: "Exposición Digital", text: "Su inmueble aparecerá en portales premium y campañas segmentadas en Google y Meta.", icon: Zap },
                            { title: "Gestión Integral", text: "Coordinamos trámites bancarios, notariales y de registro para garantizar un cierre seguro.", icon: ShieldCheck }
                        ].map((step, i) => (
                            <div key={i} className="p-10 bg-bg-alt rounded-xl border border-zinc-100 group hover:border-brand transition-colors">
                                <div className="w-14 h-14 bg-white rounded-lg shadow-sm flex items-center justify-center mb-8 border border-zinc-100 text-zinc-950 group-hover:bg-brand group-hover:text-white transition-colors">
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{step.title}</h3>
                                <p className="text-text-secondary leading-relaxed font-medium">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FORMULARIO - High Contrast Block */}
            <section className="py-24 bg-zinc-950">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Consignación Directa</p>
                            <h2 className="!text-white mb-8 drop-shadow-xl">Empiece Hoy el Camino <span className="text-brand">a la Venta</span></h2>
                            <p className="text-xl !text-zinc-400 mb-12 font-medium max-w-xl drop-shadow-md">Únase a los cientos de propietarios que ya vendieron con éxito en tiempo récord.</p>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-lg flex items-center justify-center font-black text-brand">1</div>
                                    <p className="font-bold text-white">Asesoría comercial experta</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-lg flex items-center justify-center font-black text-brand">2</div>
                                    <p className="font-bold text-white">Filtro de prospectos calificados</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-brand/10 border border-brand/20 rounded-lg flex items-center justify-center font-black text-brand">3</div>
                                    <p className="font-bold text-white">Cierre legal documentado</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white p-2 rounded-2xl shadow-2xl">
                            <div className="p-2 border border-zinc-100 rounded-xl">
                                <PropertyOwnerForm defaultCity="Cúcuta" whatsappNumber={whatsappNumber} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="mb-4">Información para <span className="text-brand">Propietarios</span></h2>
                            <p className="text-text-secondary font-medium">Transparencia absoluta en cada paso del proceso de venta.</p>
                        </div>
                        <FAQAccordion items={faqs} />
                    </div>
                </div>
            </section>
        </main>
    );
}
