import { Metadata } from 'next';
import {
    TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle2,
    BarChart3, MessageCircle, HelpCircle
} from 'lucide-react';
import Link from 'next/link';
import PropertyOwnerForm from '@/components/PropertyOwnerForm';
import FAQAccordion from '@/components/FAQAccordion';

export async function generateMetadata(): Promise<Metadata> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const title = "Vender Inmueble en Villa del Rosario | Inmobiliaria Tucasa Los Patios";
    const description = "¿Quiere vender su propiedad en Villa del Rosario? Valoración técnica y marketing profesional para captar el interés de compradores.";
    const canonicalUrl = `${siteUrl}/vender-casa-en-villa-del-rosario`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'website',
            images: [{ url: `${siteUrl}/images/og-vender-villa.jpg` }]
        }
    };
}

export default function VenderVillaPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    const faqs = [
        { q: "¿En qué sectores de Villa del Rosario operan?", a: "Operamos en todo el municipio, con especial énfasis en Lomitas, Centro y las nuevas zonas residenciales de la autopista." },
        { q: "¿Cómo atraen compradores para mi casa?", a: "Villa del Rosario tiene gran interés fronterizo. Nuestra web y embudos de marketing segmentan perfiles con capacidad de pago inmediata." },
        { q: "¿Es necesario tener escrituras al día?", a: "Sí, para un proceso ágil. Si tiene trámites pendientes, nuestro equipo legal puede asesorarle." }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": "Venta de inmuebles en Villa del Rosario",
                "serviceType": "Venta de inmuebles",
                "provider": {
                    "@type": "LocalBusiness",
                    "name": "Inmobiliaria Tucasa Los Patios",
                    "image": `${siteUrl}/logo.png`
                }
            }
        ]
    };

    return (
        <main className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* HERO - Phase 20 Aesthetic */}
            <section className="bg-zinc-950 py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-brand/5 blur-[120px] rounded-full translate-x-1/2"></div>
                <div className="container-wide px-4 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-8">
                            <TrendingUp className="w-4 h-4 text-brand" />
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Respaldo Metropolitano 2026</span>
                        </div>
                        <h1 className="text-white mb-8">
                            Venda en <span className="text-brand">Villa Rosario</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed">
                            Potenciamos el valor histórico y moderno de su inmueble mediante estrategias de marketing digital de alto impacto.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <a href="#vender" className="px-10 py-5 bg-white text-zinc-950 rounded-xl font-black text-lg hover:bg-zinc-100 transition-colors">
                                Consignar Ahora
                            </a>
                            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" className="px-10 py-5 bg-brand text-white rounded-xl font-black text-lg hover:bg-red-600 transition-colors flex items-center gap-3">
                                <MessageCircle className="w-5 h-5" />
                                Consultar Avalúo
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* PROCESO - Geometric Icons */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="text-center mb-20">
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Nuestro Método</p>
                        <h2 className="mb-4">Compromiso de <span className="text-brand">Venta</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        {[
                            { title: "Valoración Técnica", text: "Precio real de mercado para garantizar una venta ágil y sin complicaciones.", icon: BarChart3 },
                            { title: "Plan de Medios", text: "Presencia en portales líderes y redes sociales con segmentación avanzada.", icon: Zap },
                            { title: "Asesoría Legal", text: "Verificación exhaustiva de tradición para una firma notarial segura.", icon: ShieldCheck }
                        ].map((step, i) => (
                            <div key={i} className="flex flex-col items-center group">
                                <div className="w-16 h-16 bg-bg-alt rounded-xl flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-colors">
                                    <step.icon className="w-8 h-8 text-brand group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-black mb-4">{step.title}</h3>
                                <p className="text-text-secondary font-medium px-4">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FORMULARIO & METRICS */}
            <section className="py-24 bg-bg-alt border-y border-zinc-100" id="vender">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Propietarios</p>
                            <h2 className="mb-8">¿Vende en <span className="text-brand">Villa del Rosario</span>?</h2>
                            <p className="text-xl text-text-secondary mb-12 font-medium">Confíe en la agencia con mayor cobertura y resultados probados en el área metropolitana.</p>

                            <div className="grid grid-cols-2 gap-8 mb-12">
                                <div className="p-6 bg-white rounded-xl border border-zinc-100 shadow-sm">
                                    <div className="text-4xl font-black text-brand mb-1">12 d</div>
                                    <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Captación Promedio</div>
                                </div>
                                <div className="p-6 bg-white rounded-xl border border-zinc-100 shadow-sm">
                                    <div className="text-4xl font-black text-brand mb-1">+2k</div>
                                    <div className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Compradores Activos</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-brand/5 rounded-xl border border-brand/10">
                                <CheckCircle2 className="w-5 h-5 text-brand" />
                                <span className="text-sm font-bold text-zinc-800">Especialistas en el sector fronterizo</span>
                            </div>
                        </div>
                        <div className="bg-white p-1 rounded-xl shadow-xl border border-zinc-100">
                            <PropertyOwnerForm defaultCity="Villa del Rosario" whatsappNumber={whatsappNumber} />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-4">
                                <HelpCircle className="w-3 h-3 text-brand" />
                                <span className="text-[10px] font-black text-brand uppercase tracking-widest">Dudas</span>
                            </div>
                            <h2 className="mb-4">Consultas <span className="text-brand">Frecuentes</span></h2>
                        </div>
                        <FAQAccordion items={faqs} />
                    </div>
                </div>
            </section>
        </main>
    );
}
