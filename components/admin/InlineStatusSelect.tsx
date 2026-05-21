"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { handleQuickStatusUpdate } from "@/app/admin/actions";
import { Loader2, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";

interface InlineStatusSelectProps {
    propertyId: string;
    currentStatus: string;
}

const STATUS_COLORS: Record<string, string> = {
    'Disponible': 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800',
    'En Venta': 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
    'Vendido': 'bg-zinc-100 text-zinc-500 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
    'Destacado': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
    'Reservado': 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    'En Remate': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
};

const ALL_ESTADOS = ['Disponible', 'En Venta', 'Vendido', 'Destacado', 'Reservado', 'En Remate'];

export default function InlineStatusSelect({ propertyId, currentStatus }: InlineStatusSelectProps) {
    const router = useRouter();
    const [feedback, setFeedback] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
    const [selectedStatus, setSelectedStatus] = useState(currentStatus || 'Disponible');
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Cerrar dropdown al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = async (newStatus: string) => {
        console.log('[InlineStatusSelect] handleSelect called:', { propertyId, newStatus, currentStatus });
        if (newStatus === currentStatus) {
            setIsOpen(false);
            return;
        }

        setSelectedStatus(newStatus);
        setFeedback('saving');
        setIsOpen(false);

        try {
            console.log('[InlineStatusSelect] Calling handleQuickStatusUpdate...');
            const result = await handleQuickStatusUpdate(propertyId, newStatus);
            console.log('[InlineStatusSelect] Result:', result);

            if (result.success) {
                console.log('[InlineStatusSelect] Success! Refreshing...');
                setFeedback('success');
                // Forzar refresh completo
                router.refresh();
                // Recarga completa como fallback
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                console.error('[InlineStatusSelect] Server action error:', result.error);
                setFeedback('error');
                setSelectedStatus(currentStatus); // revertir
                setTimeout(() => {
                    setFeedback('idle');
                }, 3000);
            }
        } catch (err) {
            console.error('[InlineStatusSelect] Exception:', err);
            setFeedback('error');
            setSelectedStatus(currentStatus); // revertir
            setTimeout(() => {
                setFeedback('idle');
            }, 3000);
        }
    };

    return (
        <div className="relative inline-flex items-center" ref={dropdownRef}>
            {/* Botón principal que muestra el estado actual */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={feedback === 'saving'}
                className={`
                    inline-flex items-center gap-1.5 cursor-pointer rounded-full px-3 py-1.5 pr-2 text-[9px] font-black uppercase tracking-wider border
                    transition-all outline-none
                    ${STATUS_COLORS[selectedStatus] || 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}
                    ${feedback === 'saving' ? 'opacity-60 cursor-wait' : 'hover:ring-2 hover:ring-red-300'}
                `}
            >
                <span>{selectedStatus}</span>
                <ChevronDown size={10} className="opacity-50" />

                {/* Feedback indicator */}
                {feedback === 'saving' && (
                    <Loader2 size={10} className="animate-spin text-red-600" />
                )}
                {feedback === 'success' && (
                    <CheckCircle2 size={10} className="text-emerald-500" />
                )}
                {feedback === 'error' && (
                    <AlertCircle size={10} className="text-red-500" />
                )}
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-[140px] bg-white dark:bg-zinc-900 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 overflow-hidden">
                    {ALL_ESTADOS.map((estado) => {
                        const isActive = estado === selectedStatus;
                        return (
                            <button
                                key={estado}
                                type="button"
                                onClick={() => handleSelect(estado)}
                                className={`
                                    w-full text-left px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors
                                    ${isActive
                                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                                    }
                                `}
                            >
                                {estado}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
