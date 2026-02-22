import { MessageCircle, Mail, MapPin, Phone, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ContactoPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '3223047435';

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section - Direct & Impactful */}
            <section className="bg-zinc-950 py-32">
                <div className="container-wide px-4">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-widest mb-8 border border-brand/20">
                            <MessageCircle className="w-3 h-3" />
                            <span>Respuesta Inmediata</span>
                        </div>
                        <h1 className="text-white mb-8">
                            Estamos para <span className="text-brand">ayudarle</span>
                        </h1>
                        <p className="text-xl text-zinc-400 font-medium max-w-2xl leading-relaxed">
                            Resuelva sus dudas sobre inversiones, arriendos o tasaciones en el <span className="text-white">Norte de Santander</span>. Mi equipo le atenderá de forma personalizada.
                        </p>
                    </div>
                </div>
            </section>

            {/* Contact Cards Grid */}
            <section className="py-24">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* WhatsApp Card - Primary Priority */}
                        <Link
                            href={`https://wa.me/${whatsappNumber}`}
                            className="p-10 bg-zinc-50 rounded-xl border border-zinc-100 hover:border-brand transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand/5 -translate-y-12 translate-x-12 rounded-full group-hover:bg-brand/10 transition-colors"></div>
                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-8 shadow-sm group-hover:scale-110 transition-transform">
                                <MessageCircle className="w-6 h-6 text-brand" />
                            </div>
                            <h3 className="mb-4">Asunto <span className="text-brand">Inmediato</span></h3>
                            <p className="text-sm text-text-secondary font-medium leading-relaxed mb-8">
                                La forma más rápida de agendar una visita o consultar disponibilidad de una propiedad.
                            </p>
                            <span className="text-[10px] font-black uppercase tracking-widest text-brand flex items-center gap-2">
                                Chatear ahora <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </Link>

                        {/* Email Card */}
                        <div className="p-10 bg-white rounded-xl border border-zinc-100 hover:border-brand transition-all group">
                            <div className="w-12 h-12 bg-bg-alt rounded-lg flex items-center justify-center mb-8 shadow-sm">
                                <Mail className="w-6 h-6 text-zinc-400 group-hover:text-brand" />
                            </div>
                            <h3 className="mb-4">Propuestas <span className="text-brand">Formales</span></h3>
                            <p className="text-sm text-text-secondary font-medium leading-relaxed mb-8">
                                Ideal para envío de documentos, propuestas comerciales o consultas técnicas legales.
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-950">
                                contacto@tucasalospatios.com
                            </p>
                        </div>

                        {/* Office Card */}
                        <div className="p-10 bg-white rounded-xl border border-zinc-100 hover:border-brand transition-all group">
                            <div className="w-12 h-12 bg-bg-alt rounded-lg flex items-center justify-center mb-8 shadow-sm">
                                <MapPin className="w-6 h-6 text-zinc-400 group-hover:text-brand" />
                            </div>
                            <h3 className="mb-4">Nuestra <span className="text-brand">Sede</span></h3>
                            <p className="text-sm text-text-secondary font-medium leading-relaxed mb-8">
                                Los Patios, Norte de Santander.<br />
                                Centro de Negocios Regional.
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-950">
                                Cita previa requerida
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Additional Info section */}
            <section className="py-24 bg-bg-alt">
                <div className="container-wide px-4">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-16">
                        <div className="md:w-1/2">
                            <h2 className="mb-8">Horarios de <span className="text-brand">Atención</span></h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Clock className="w-4 h-4 text-brand" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-950">Lunes a Viernes</span>
                                        <span className="text-sm text-text-secondary font-medium">08:00 AM - 06:00 PM</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                                        <Clock className="w-4 h-4 text-brand" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-black uppercase tracking-widest text-zinc-950">Sábados</span>
                                        <span className="text-sm text-text-secondary font-medium">08:00 AM - 12:00 PM</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="md:w-1/2 p-10 bg-white rounded-xl border border-zinc-100 shadow-sm text-center">
                            <Phone className="w-8 h-8 text-brand mx-auto mb-6" />
                            <h4 className="mb-4">Línea Directa</h4>
                            <p className="text-2xl font-black text-zinc-950 mb-2">+57 {phoneNumber}</p>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Atención en Español e Inglés</p>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}
