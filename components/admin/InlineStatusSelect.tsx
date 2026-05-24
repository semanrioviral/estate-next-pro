/**
 * InlineStatusSelect — Cambio rápido de estado mediante formulario HTML estándar.
 * 
 * Funciona SIN JavaScript del lado cliente:
 * - El <form> con action={serverAction} se envía vía POST estándar
 * - Si JS está disponible, Next.js intercepta y lo optimiza
 * - Si JS NO está disponible, el navegador envía el formulario como POST normal
 */
import { handleQuickStatusUpdate } from "@/app/admin/actions";

interface InlineStatusSelectProps {
    propertyId: string;
    currentStatus: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    'Disponible': {
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
    },
    'En Venta': {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        text: 'text-blue-700 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
    },
    'Vendido': {
        bg: 'bg-zinc-100 dark:bg-zinc-800',
        text: 'text-zinc-500 dark:text-zinc-400',
        border: 'border-zinc-200 dark:border-zinc-700',
        dot: 'bg-zinc-400',
    },
    'Destacado': {
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
    },
    'Reservado': {
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        text: 'text-purple-700 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        dot: 'bg-purple-500',
    },
    'En Remate': {
        bg: 'bg-red-50 dark:bg-red-900/20',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-200 dark:border-red-800',
        dot: 'bg-red-500',
    },
};

const ALL_ESTADOS = ['Disponible', 'En Venta', 'Vendido', 'Destacado', 'Reservado', 'En Remate'];

export default function InlineStatusSelect({ propertyId, currentStatus }: InlineStatusSelectProps) {
    const style = STATUS_STYLES[currentStatus] || STATUS_STYLES['Disponible'];

    return (
        <form action={handleQuickStatusUpdate} className="inline-flex items-center gap-1.5">
            <input type="hidden" name="propertyId" value={propertyId} />
            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 border text-[10px] font-bold uppercase tracking-wider transition-colors ${style.bg} ${style.text} ${style.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                <select
                    name="estado"
                    defaultValue={currentStatus}
                    className="appearance-none cursor-pointer bg-transparent outline-none font-bold uppercase text-inherit text-[10px] tracking-wider pr-1 min-w-[80px]"
                >
                    {ALL_ESTADOS.map((estado) => (
                        <option key={estado} value={estado} className="text-zinc-900 bg-white">
                            {estado}
                        </option>
                    ))}
                </select>
            </div>
            <button
                type="submit"
                className="rounded-full h-7 w-7 inline-flex items-center justify-center bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-[9px] font-black hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors active:scale-90"
                title="Guardar cambio de estado"
                aria-label="Guardar estado"
            >
                ✓
            </button>
        </form>
    );
}
