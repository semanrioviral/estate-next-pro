'use client';

import React from 'react';
import { Send, Sparkles, MessageCircle } from 'lucide-react';

export default function ListingConversionBanner() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, no encontré lo que buscaba en la web. ¿Podrían ayudarme a encontrar una propiedad con mis requisitos?')}`;

    return (
        <section className="mt-20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#fb2c36] to-zinc-900 rounded-[3rem]"></div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-500/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="relative px-8 py-12 md:py-16 md:px-16 flex flex-col md:flex-row items-center justify-between gap-10">
                <div className="max-w-xl text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-black text-white uppercase tracking-widest">Servicio Personalizado</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4">
                        ¿No encuentra lo que busca?
                    </h2>
                    <p className="text-lg text-red-50 font-medium leading-relaxed opacity-90">
                        Déjenos sus datos y le enviamos propiedades exclusivas antes de que salgan al mercado local. Nuestro equipo buscará por usted.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-white text-[#fb2c36] rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-zinc-100 transition-all shadow-xl shadow-black/20 active:scale-95 w-full sm:w-auto"
                    >
                        <MessageCircle className="w-5 h-5" />
                        Solicitar por WhatsApp
                    </a>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-transparent text-white border-2 border-white/30 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95 w-full sm:w-auto"
                    >
                        <Send className="w-5 h-5" />
                        Volver a buscar
                    </button>
                </div>
            </div>
        </section>
    );
}
