'use client';

import React, { useEffect, useState } from 'react';
import { X, MessageCircle, ArrowRight } from 'lucide-react';

interface RetentionModalProps {
    ciudad: string;
}

export default function RetentionModal({ ciudad }: RetentionModalProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkRetention = async () => {
            const history = localStorage.getItem('recently_viewed');
            const shownFlag = sessionStorage.getItem('retention_shown');

            if (shownFlag) return;

            const viewedIds = history ? JSON.parse(history) : [];

            // Si ha visto al menos 3 propiedades
            if (viewedIds.length >= 3) {
                // Esperar 10 segundos según recomendación
                const timer = setTimeout(() => {
                    setIsOpen(true);
                    sessionStorage.setItem('retention_shown', 'true');
                }, 10000);

                return () => clearTimeout(timer);
            }
        };

        checkRetention();
    }, []);

    if (!isOpen) return null;

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const message = encodeURIComponent(`Hola, estoy explorando propiedades en ${ciudad} y quiero recibir opciones similares.`);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4 bg-zinc-950/40 backdrop-blur-sm animate-in fade-in duration-500">
            <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 shadow-2xl border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 duration-300">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6">
                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-6">
                        <MessageCircle className="w-8 h-8 text-[#fb2c36]" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
                        ¿Quiere recibir propiedades similares directamente en WhatsApp?
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium">
                        Le ayudamos a encontrar su próximo hogar enviándole las mejores opciones según lo que está buscando en <span className="text-[#fb2c36] font-bold">{ciudad}</span>.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-[#fb2c36] text-white py-4 rounded-2xl font-black transition-all hover:bg-[#fb2c36]/90 active:scale-95 shadow-xl shadow-red-500/10"
                    >
                        Sí, enviar opciones
                        <ArrowRight className="w-5 h-5" />
                    </a>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="py-4 text-zinc-500 dark:text-zinc-400 font-bold text-sm hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                    >
                        Seguir explorando
                    </button>
                </div>
            </div>
        </div>
    );
}
