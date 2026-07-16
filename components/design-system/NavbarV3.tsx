"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Phone, ChevronRight, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { openWhatsapp } from '@/lib/trackWhatsapp';
import FavoritesCounter from '@/components/FavoritesCounter';

const NAV_LINKS = [
    { label: "Venta", href: "/venta" },
    { label: "Arriendo", href: "/arriendo" },
    { label: "Blog", href: "/blog" },
    { label: "Consignar", href: "/consignar-propiedad" },
    { label: "Contacto", href: "/contacto" },
];

export default function NavbarV3() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 80);
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Recalcular al cambiar de ruta (navegación SPA) para no quedarse en estado incorrecto
    useEffect(() => {
        setScrolled(window.scrollY > 80);
    }, [pathname]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573223047435";

    const isLightNav = scrolled || !isHome;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,box-shadow,border-color,padding] duration-500 ${
                    isLightNav
                        ? "bg-white shadow-sm py-3 border-b border-slate-200"
                        : "bg-transparent py-4 md:py-6 border-transparent"
                }`}
            >
                <div className="container-wide">
                    <div className="flex items-center justify-between gap-6 lg:gap-10">
                        {/* Logo (Left) */}
                        <Link href="/" className="flex items-center gap-2 shrink-0 group">
                            <div className="relative w-40 h-14 md:w-52 md:h-16 transition-transform group-hover:scale-105">
                                <Image
                                    src="https://res.cloudinary.com/dwdlmbftw/image/upload/f_webp,q_80,w_240/logo/logo"
                                    alt="Inmobiliaria Tucasa Los Patios"
                                    fill
                                    className="object-contain"
                                    priority
                                    sizes="208px"
                                />
                            </div>
                        </Link>

                        {/* Desktop Center Links */}
                        <div className="hidden lg:flex items-center gap-8 xl:gap-10 flex-1 justify-center">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-[15px] font-bold transition-colors hover:text-brand-600 whitespace-nowrap ${
                                        pathname === link.href
                                            ? "text-brand-600"
                                            : isLightNav
                                                ? "text-slate-700"
                                                : "text-white hover:text-white/80"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className={`hidden lg:block w-px h-8 ${isLightNav ? 'bg-slate-200' : 'bg-white/20'}`} />

                        {/* Desktop Actions (Right) */}
                        <div className="hidden md:flex items-center gap-3 lg:gap-4 shrink-0">
                            <FavoritesCounter variant="desktop" />
                            <a
                                href={`tel:+${whatsappNumber}`}
                                className={`h-11 px-5 rounded-full text-base font-bold inline-flex items-center justify-center gap-2 border transition-colors ${
                                    isLightNav
                                        ? "border-slate-300 text-slate-900 hover:bg-slate-50"
                                        : "border-white/30 text-white hover:bg-white/10"
                                }`}
                            >
                                <Phone className="w-4 h-4" />
                                <span className="hidden xl:inline">Llamar</span>
                            </a>
                        </div>

                        {/* Mobile Toggle */}
                        <button
                            className={`md:hidden p-2 transition-colors shrink-0 ${
                                isLightNav ? "text-slate-900" : "text-white"
                            }`}
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label="Menu"
                        >
                            {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 top-0 bg-white z-[60] transition-transform duration-500 md:hidden ${
                        isOpen ? "translate-x-0" : "translate-x-full"
                    }`}
                >
                    <div className="p-6 flex flex-col h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-10">
                            <span className="text-lg font-bold tracking-tight text-slate-900 uppercase">Menú</span>
                            <button
                                onClick={() => setIsOpen(false)}
                                aria-label="Cerrar menú"
                                className="p-2 bg-slate-50 rounded-full transition-colors active:bg-slate-100"
                            >
                                <X className="w-7 h-7 text-slate-900" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-1">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-xl font-bold py-4 flex items-center justify-between border-b border-slate-100 ${
                                        pathname === link.href ? "text-brand-600" : "text-slate-900"
                                    }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                    <ChevronRight className={`w-5 h-5 ${pathname === link.href ? "text-brand-600" : "text-slate-300"}`} />
                                </Link>
                            ))}
                            <FavoritesCounter variant="mobile" onClick={() => setIsOpen(false)} />
                        </div>

                        <div className="mt-auto pt-10 space-y-3">
                            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Contacto Directo</p>
                            <button
                                type="button"
                                onClick={() => openWhatsapp(`https://wa.me/${whatsappNumber}`)}
                                className="bg-[#25D366] text-white w-full h-13 rounded-full flex items-center justify-center gap-3 text-base font-bold shadow-sm active:scale-95 transition-all py-3"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.5 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                WhatsApp
                            </button>
                            <a
                                href={`tel:+${whatsappNumber}`}
                                className="bg-slate-50 text-slate-900 w-full h-13 rounded-full flex items-center justify-center gap-3 text-base font-bold border border-slate-200 py-3"
                            >
                                <Phone className="w-5 h-5 text-brand-600" />
                                Llamar
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
