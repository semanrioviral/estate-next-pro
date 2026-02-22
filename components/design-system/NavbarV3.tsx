"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, MessageCircle, Phone, ChevronRight, User } from "lucide-react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
    { label: "Venta", href: "/venta" },
    { label: "Arriendo", href: "/arriendo" },
    { label: "Blog", href: "/blog" },
    { label: "Vender", href: "/vender-casa-en-cucuta" },
    { label: "Contacto", href: "/contacto" },
];

export default function NavbarV3() {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "573223047435";

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? "bg-white shadow-sm py-4 border-b border-slate-200"
                    : isHome
                        ? "bg-transparent py-8 border-transparent"
                        : "bg-white py-4 border-b border-slate-200"
                    }`}
            >
                <div className="container-wide flex items-center justify-between gap-4">
                    {/* Logo Section (Left) */}
                    <div className="flex-initial min-w-[160px]">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-40 h-16 transition-transform group-active:scale-95">
                                <Image
                                    src="/logo.png"
                                    alt="Inmobiliaria Tucasa Los Patios"
                                    fill
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Center Links */}
                    <div className="hidden lg:flex flex-1 justify-center items-center gap-6">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-[15px] font-bold transition-all hover:text-brand-600 ${pathname === link.href
                                    ? "text-brand-600"
                                    : scrolled || !isHome
                                        ? "text-slate-600"
                                        : "text-white hover:text-white/80"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Actions (Right) */}
                    <div className="hidden md:flex items-center justify-end gap-3 min-w-[180px]">
                        <Link
                            href="/admin"
                            className={`px-5 h-10 rounded-full text-[13px] font-bold flex items-center justify-center border transition-all ${scrolled || !isHome
                                ? "border-slate-200 text-slate-900 hover:bg-slate-50"
                                : "border-white/20 text-white hover:bg-white/10"
                                }`}
                        >
                            Iniciar Sesión
                        </Link>

                        <Link
                            href="/admin/propiedades/nuevo"
                            className="bg-whatsapp text-white px-5 h-10 rounded-full text-[13px] font-bold flex items-center gap-2 hover:bg-green-600 transition-all active:scale-[0.98] shadow-sm"
                        >
                            <span className="text-lg leading-none">+</span>
                            Publicar
                        </Link>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className={`md:hidden p-2 transition-colors ${scrolled || !isHome ? "text-slate-900" : "text-white"
                            }`}
                        onClick={() => setIsOpen(!isOpen)}
                        aria-label="Menu"
                    >
                        {isOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>

                {/* Mobile Menu Overlay */}
                <div
                    className={`fixed inset-0 top-0 bg-white z-[60] transition-transform duration-500 md:hidden ${isOpen ? "translate-x-0" : "translate-x-full"
                        }`}
                >
                    <div className="p-8 flex flex-col h-full overflow-y-auto">
                        <div className="flex items-center justify-between mb-12">
                            <span className="text-xl font-bold tracking-tight text-slate-900 uppercase">Menú Principal</span>
                            <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-50 rounded-full transition-colors active:bg-slate-100">
                                <X className="w-8 h-8 text-slate-900" />
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-2xl font-bold py-4 flex items-center justify-between border-b border-slate-50 ${pathname === link.href ? "text-brand-600" : "text-slate-900"
                                        }`}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {link.label}
                                    <ChevronRight className={`w-6 h-6 transition-transform ${pathname === link.href ? "text-brand-600" : "text-slate-300"}`} />
                                </Link>
                            ))}
                        </div>

                        <div className="mt-auto pt-12 space-y-4">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Canales de Atención</p>
                            <a
                                href={`https://wa.me/${whatsappNumber}`}
                                className="bg-whatsapp text-white w-full h-14 rounded-full flex items-center justify-center gap-3 text-lg font-bold shadow-sm active:scale-95 transition-all"
                            >
                                <MessageCircle className="w-5 h-5 fill-current" />
                                WhatsApp Directo
                            </a>
                            <a
                                href={`tel:+${whatsappNumber}`}
                                className="bg-slate-50 text-slate-900 w-full h-14 rounded-full flex items-center justify-center gap-3 text-lg font-bold border border-slate-200"
                            >
                                <Phone className="w-5 h-5 text-brand-600" />
                                Llamar ahora
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}
