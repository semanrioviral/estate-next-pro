import Link from 'next/link';
import { Mail, Phone, MapPin, Instagram, Facebook, MessageCircle, ArrowRight } from 'lucide-react';
import TrackedWhatsappButton from '@/components/tracking/TrackedWhatsappButton';

export default function FooterV3() {
    const currentYear = new Date().getFullYear();
    const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || "3223047435";
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573223047435";

    return (
        <footer className="bg-zinc-900 text-white pt-24 pb-12">
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
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-brand transition-all">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-brand transition-all">
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
                                <li><Link href="/vender-casa-en-cucuta" className="text-sm font-bold text-white/60 hover:text-white transition-colors flex items-center gap-2 group"><ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-all" /> Vender propiedad</Link></li>
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
                        <MessageCircle className="w-5 h-5 fill-current" />
                        Soporte Inmediato
                    </TrackedWhatsappButton>
                </div>
            </div>
        </footer>
    );
}
