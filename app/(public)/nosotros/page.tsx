import { ShieldCheck, Users, TrendingUp, Award, Eye, Target } from 'lucide-react';

export default function NosotrosPage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section - Minimalist & Bold */}
            <section className="bg-zinc-950 py-32">
                <div className="container-wide px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest mb-8 border border-brand/20">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Confianza Verificada</span>
                        </div>
                        <h1 className="text-white mb-8">
                            Sobre <span className="text-brand">Nosotros</span>
                        </h1>
                        <p className="text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed">
                            En <span className="text-white">Inmobiliaria Tucasa Los Patios</span> no solo vendemos propiedades; construimos el patrimonio de las familias en el Norte de Santander con transparencia y rigor técnico.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section - High Contrast */}
            <section className="py-24 border-b border-zinc-50">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: 'Años de Experiencia', val: '10+' },
                            { label: 'Propiedades Vendidas', val: '500+' },
                            { label: 'Familias Felices', val: '450+' },
                            { label: 'Asesores Expertos', val: '12+' },
                        ].map((stat, i) => (
                            <div key={i}>
                                <p className="text-[26px] font-black text-brand mb-2">{stat.val}</p>
                                <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-tight">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Content Section - Values & Vision */}
            <section className="py-24">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                        {/* Vision & Mission Cards */}
                        <div className="space-y-12">
                            <div className="p-10 bg-zinc-50 rounded-xl border border-zinc-100 group hover:border-brand/30 transition-all">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-8 shadow-sm">
                                    <Target className="w-6 h-6 text-brand" />
                                </div>
                                <h2 className="mb-6">Nuestra <span className="text-brand">Misión</span></h2>
                                <p className="text-text-secondary font-medium leading-relaxed">
                                    Simplificar el proceso de compra, venta y arriendo de inmuebles en Cúcuta y alrededores, garantizando seguridad jurídica y asesoría financiera de alto nivel.
                                </p>
                            </div>

                            <div className="p-10 bg-zinc-50 rounded-xl border border-zinc-100 group hover:border-brand/30 transition-all">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-8 shadow-sm">
                                    <Eye className="w-6 h-6 text-brand" />
                                </div>
                                <h2 className="mb-6">Nuestra <span className="text-brand">Visión</span></h2>
                                <p className="text-text-secondary font-medium leading-relaxed">
                                    Ser la inmobiliaria número uno en innovación tecnológica y satisfacción al cliente en todo el departamento del Norte de Santander para el 2030.
                                </p>
                            </div>
                        </div>

                        {/* Why Us? */}
                        <div>
                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-4">¿Por qué elegirnos?</p>
                            <h2 className="mb-12">Autoridad que genera <span className="text-brand">resultados</span></h2>
                            <div className="space-y-8">
                                {[
                                    { title: 'Rigor Legal', desc: 'Cada contrato y propiedad pasa por una auditoría exhaustiva de nuestro equipo jurídico.', icon: Award },
                                    { title: 'Tecnología Predictiva', desc: 'Usamos datos del mercado real para tasar su propiedad al precio exacto de venta.', icon: TrendingUp },
                                    { title: 'Atención 24/7', desc: 'Canales directos de comunicación para resolver dudas en tiempo real.', icon: Users },
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6">
                                        <div className="w-10 h-10 bg-brand/5 rounded-lg flex items-center justify-center shrink-0">
                                            <item.icon className="w-5 h-5 text-brand" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black mb-2">{item.title}</h4>
                                            <p className="text-sm text-text-secondary font-medium leading-relaxed">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
