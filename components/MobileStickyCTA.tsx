'use client';

import React from 'react';
import { MessageCircle, Phone } from 'lucide-react';

interface MobileStickyCTAProps {
    whatsappUrl: string;
    callUrl: string;
    price: string;
}

export default function MobileStickyCTA({ whatsappUrl, callUrl, price }: MobileStickyCTAProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] md:hidden">
            <div className="bg-gradient-to-t from-zinc-100/90 to-transparent pt-2">
                <div className="max-w-lg mx-auto px-3 pb-safe pb-3">
                    <div className="rounded-2xl border border-zinc-200 bg-white shadow-[0_-10px_24px_rgba(0,0,0,0.1)] p-2.5">
                        <div className="flex items-center gap-2.5">
                            <div className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
                                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Precio</p>
                                <p className="text-[1.05rem] font-black text-zinc-900 tracking-tight leading-none truncate mt-1">{price}</p>
                            </div>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Contactar por WhatsApp"
                                className="h-11 w-11 rounded-xl bg-[#25D366] hover:bg-[#1ebe5d] text-white inline-flex items-center justify-center transition-colors active:scale-95 shadow-sm"
                            >
                                <MessageCircle className="w-5 h-5 fill-current" />
                            </a>
                            <a
                                href={callUrl}
                                aria-label="Llamar ahora"
                                className="h-11 w-11 rounded-xl border border-zinc-300 bg-white text-zinc-900 inline-flex items-center justify-center active:scale-95 shadow-sm"
                            >
                                <Phone className="h-5 w-5 text-zinc-700" />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
