"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { handleQuickStatusUpdate } from "@/app/admin/actions";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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

    const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (newStatus === currentStatus) return;

        // Confirmación visual inmediata
        setSelectedStatus(newStatus);
        setFeedback('saving');

        try {
            const result = await handleQuickStatusUpdate(propertyId, newStatus);
            if (result.success) {
                setFeedback('success');
                router.refresh();
                setTimeout(() => setFeedback('idle'), 2000);
            } else {
                setFeedback('error');
                setSelectedStatus(currentStatus); // revertir
                setTimeout(() => setFeedback('idle'), 3000);
            }
        } catch {
            setFeedback('error');
            setSelectedStatus(currentStatus); // revertir
            setTimeout(() => setFeedback('idle'), 3000);
        }
    };

    return (
        <div className="relative inline-flex items-center gap-1.5">
            <select
                value={selectedStatus}
                onChange={handleChange}
                className={`
                    appearance-none cursor-pointer rounded-full px-3 py-1.5 pr-8 text-[9px] font-black uppercase tracking-wider border
                    transition-all outline-none
                    ${STATUS_COLORS[selectedStatus] || 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}
                    ${feedback === 'saving' ? 'opacity-60 cursor-wait' : 'hover:ring-2 hover:ring-red-300'}
                `}
            >
                {ALL_ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                ))}
            </select>

            {/* Feedback indicator */}
            {feedback === 'saving' && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center">
                    <Loader2 size={10} className="animate-spin text-red-600" />
                </div>
            )}
            {feedback === 'success' && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center">
                    <CheckCircle2 size={10} className="text-emerald-500" />
                </div>
            )}
            {feedback === 'error' && (
                <div className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-white dark:bg-zinc-900 rounded-full shadow-sm flex items-center justify-center">
                    <AlertCircle size={10} className="text-red-500" />
                </div>
            )}
        </div>
    );
}
