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
    const title = "Vender mi Casa en Los Patios | Inmobiliaria Tucasa Los Patios";
    const description = "Venda su propiedad en Los Patios con expertos. Valoración estratégica, marketing profesional y cierre seguro.";
    const canonicalUrl = `${siteUrl}/vender-casa-en-los-patios`;

    return {
        title,
        description,
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            type: 'website',
            images: [{ url: `${siteUrl}/images/og-vender-los-patios.jpg` }]
        }
    };
}

export default function VenderLosPatiosPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    const faqs = [
        { q: "¿Cuánto tiempo toma vender una casa en Los Patios?", a: "En promedio, nuestras propiedades se venden en un plazo de 45 a 90 días, gracias a nuestra estrategia de segmentación digital." },
        { q: "¿Tengo que pagar algo por adelantado?", a: "No. Solo cobramos comisión al momento de cerrar la venta exitosa ante notaría." },
        { q: "¿Cómo determinan el precio de mi inmueble?", a: "Realizamos un análisis técnico basado en transacciones reales recientes en su barrio." }
    ];

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Service",
                "name": "Venta de inmuebles en Los Patios",
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
                            <span className="text-[10px] font-black text-brand uppercase tracking-widest">Maximización de Activos 2026</span>
                        </div>
                        <h1 className="text-white mb-8">
                            Venda su Inmueble en <span className="text-brand">Los Patios</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mb-12 font-medium leading-relaxed">
                            Valoración técnica, marketing inmersivo y asesoría legal de principio a fin. Conectamos su patrimonio con inversionistas reales.
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
                    <div className="text-center mb-20">
                        <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Estrategia</p>
                        <h2 className="mb-4">Su Venta en <span className="text-brand">3 Pasos</span></h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: "Valoración Estratégica", text: "Analizamos el mercado real de Los Patios para fijar un precio competitivo que maximice su ganancia.", icon: BarChart3 },
                            { title: "Marketing Profesional", text: "Captura de alta fidelidad y difusión masiva en canales digitales premium para mayor alcance.", icon: Zap },
                            { title: "Cierre Seguro", text: "Gestión documental y legal exhaustiva para garantizar una transacción transparente y exitosa.", icon: ShieldCheck }
                        ].map((step, i) => (
                            <div key={i} className="p-10 bg-bg-alt rounded-xl border border-zinc-100 group hover:border-brand transition-all">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center mb-8 group-hover:bg-brand group-hover:text-white transition-all">
                                    <step.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-xl font-black mb-4">{step.title}</h3>
                                <p className="text-text-secondary leading-relaxed font-medium">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* AUTHORITY - Phase 20 Metric Section */}
            <section className="py-24 bg-zinc-950 text-white rounded-[5rem] mx-4 overflow-hidden relative">
                <div className="container-wide px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <h2 className="text-white mb-8">Liderazgo en el <span className="text-brand">Mercado Local</span></h2>
                            <div className="grid grid-cols-2 gap-10">
                                <div>
                                    <div className="text-5xl font-black text-brand mb-2">+450</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Casas Vendidas</div>
                                </div>
                                <div>
                                    <div className="text-5xl font-black text-brand mb-2">98%</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Satisfacción</div>
                                </div>
                                <div>
                                    <div className="text-5xl font-black text-brand mb-2">60d</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Venta Promedio</div>
                                </div>
                                <div>
                                    <div className="text-5xl font-black text-brand mb-2">$0</div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inversión Inicial</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-12 rounded-xl border border-white/10">
                            <blockquote className="text-2xl font-medium italic mb-8 leading-relaxed text-zinc-300">
                                "La venta de mi casa en Pinar del Río fue impecable. Profesionalismo y rapidez absoluta."
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center font-black">M</div>
                                <div>
                                    <div className="font-black text-sm">Melissa Ortiz</div>
                                    <div className="text-[10px] uppercase tracking-widest text-zinc-500">Vendedora Satisfecha</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FORMULARIO */}
            <section className="py-24" id="vender">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">Consignación</p>
                            <h2 className="mb-8">Inicie la Venta <br /> de su <span className="text-brand">Propiedad</span></h2>
                            <p className="text-xl text-text-secondary mb-12 font-medium">Complete el formulario y reciba un diagnóstico de mercado profesional para su inmueble.</p>
                            <ul className="space-y-6">
                                {[
                                    "Avalúo comercial competitivo",
                                    "Marketing digital de alto impacto",
                                    "Asesoría jurídica integral",
                                    "Reportes periódicos de gestión"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 font-bold text-zinc-800">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-bg-alt p-1 rounded-xl border border-zinc-100">
                            <PropertyOwnerForm defaultCity="Los Patios" whatsappNumber={whatsappNumber} />
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="py-24 bg-bg-alt border-t border-zinc-100">
                <div className="container-wide px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-4">
                                <HelpCircle className="w-3 h-3 text-brand" />
                                <span className="text-[10px] font-black text-brand uppercase tracking-widest">Dudas</span>
                            </div>
                            <h2 className="mb-4">Preguntas <span className="text-brand">Frecuentes</span></h2>
                        </div>
                        <FAQAccordion items={faqs} />
                    </div>
                </div>
            </section>
        </main>
    );
}
