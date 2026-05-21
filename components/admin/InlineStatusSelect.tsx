/**
 * InlineStatusSelect — Cambio rápido de estado mediante formulario HTML estándar.
 * 
 * Funciona SIN JavaScript del lado cliente:
 * - El <form> con action={serverAction} se envía vía POST estándar
 * - Si JS está disponible, Next.js intercepta y lo optimiza
 * - Si JS NO está disponible (hidratación fallida), el navegador envía
 *   el formulario como POST normal y la server action lo procesa
 * 
 * No usa: useState, useEffect, useRouter, ni eventos onClick/onChange.
 * Es un componente servidor puro renderizado como HTML + formulario.
 */

import { handleQuickStatusUpdate } from "@/app/admin/actions";

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
    return (
        <form action={handleQuickStatusUpdate} className="inline-flex items-center gap-1">
            <input type="hidden" name="propertyId" value={propertyId} />
            <select
                name="estado"
                defaultValue={currentStatus}
                className={`
                    appearance-none cursor-pointer rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider border
                    transition-all outline-none
                    ${STATUS_COLORS[currentStatus] || 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'}
                `}
            >
                {ALL_ESTADOS.map((estado) => (
                    <option key={estado} value={estado}>{estado}</option>
                ))}
            </select>
            <button
                type="submit"
                className="rounded-full px-2 py-1.5 text-[8px] font-black uppercase tracking-wider bg-red-600 text-white border border-red-600 hover:bg-red-700 transition-colors"
                title="Guardar cambio de estado"
            >
                ✓
            </button>
        </form>
    );
}
