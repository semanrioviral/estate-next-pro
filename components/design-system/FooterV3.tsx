import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, ArrowRight } from 'lucide-react';
import TrackedWhatsappButton from '@/components/tracking/TrackedWhatsappButton';

export default function FooterV3() {
    const currentYear = new Date().getFullYear();
    const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "3223047435";
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573223047435";

    return (
        <footer className="bg-slate-900 text-white pt-24 pb-12">
            <div className="container-wide">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
                    {/* Brand & Mission */}
                    <div className="lg:col-span-5">
                        <Link href="/" className="flex items-center gap-3 mb-8 group">
                            <div className="w-12 h-12 bg-brand rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6">
                                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                                    <path d="M12 3L4 9V21H20V9L12 3ZM18 19H14V14H10V19H6V10.5L12 6L18 10.5V19Z" />
                                </svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-black tracking-tighter uppercase leading-none">
                                    Inmobiliaria
                                </span>
                                <span className="text-xs font-black tracking-[0.3em] text-white/60">
                                    TUCASA<span className="text-brand">LOSPATIOS</span>
                                </span>
                            </div>
                        </Link>
                        <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-md">
                            Estamos redefiniendo la experiencia inmobiliaria en Norte de Santander con honestidad, tecnología y un trato profundamente humano.
                        </p>

                        <div className="flex gap-4">
                            <a href="https://www.instagram.com/tucasalospatios" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Instagram" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-brand transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://www.facebook.com/inmobiliariatucasalospatios" target="_blank" rel="noopener noreferrer" aria-label="Síguenos en Facebook" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-brand transition-all">
                                <Facebook className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <div className="space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Empresa</h4>
                            <ul className="space-y-5">
                                <li><Link href="/nosotros" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> Sobre nosotros</Link></li>
                                <li><Link href="/blog" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> Nuestro Blog</Link></li>
                                <li><Link href="/contacto" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> Contacto</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-8">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Vínculos</h4>
                            <ul className="space-y-5">
                                <li><Link href="/venta" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> En venta</Link></li>
                                <li><Link href="/arriendo" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> En arriendo</Link></li>
                                <li><Link href="/consignar-propiedad" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> Consignar propiedad</Link></li>
                            </ul>
                        </div>
                        <div className="space-y-8 col-span-2 md:col-span-1">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brand">Contacto</h4>
                            <ul className="space-y-5">
                                <li className="flex items-center gap-4 text-white/60">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                        <Phone className="w-4 h-4 text-brand" />
                                    </div>
                                    <span className="text-sm font-bold text-white">+57 {phoneNumber}</span>
                                </li>
                                <li className="flex items-center gap-4 text-white/60">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-brand" />
                                    </div>
                                    <span className="text-sm font-bold text-white text-xs truncate">contacto@tucasalospatios.com</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Final Credits */}
                <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        © {currentYear} Inmobiliaria Tucasa Los Patios.
                    </p>

                    <TrackedWhatsappButton
                        url={`https://wa.me/${whatsappNumber}`}
                        className="bg-brand text-white px-10 h-14 rounded-[1.2rem] flex items-center gap-3 text-sm font-black uppercase tracking-widest hover:bg-brand-muted transition-all shadow-xl shadow-brand/20 active:scale-95"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                        Soporte Inmediato
                    </TrackedWhatsappButton>
                </div>
            </div>
        </footer>
    );
}
