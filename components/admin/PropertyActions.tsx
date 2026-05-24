"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, X } from "lucide-react";
import { handleDeleteProperty } from "@/app/admin/actions";
import { useToast } from "@/components/admin/Toast";

interface PropertyActionsProps {
    id: string;
    slug: string;
}

export default function PropertyActions({ id, slug }: PropertyActionsProps) {
    const router = useRouter();
    const { success, error: showError } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await handleDeleteProperty(id);
            if (result?.success) {
                success("Propiedad eliminada correctamente");
                router.refresh();
            } else {
                showError(result?.error || "Error al eliminar");
                setIsDeleting(false);
                setShowConfirm(false);
            }
        } catch (err) {
            console.error("Delete error:", err);
            showError("Ocurrió un error inesperado");
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg px-2 py-1.5 border border-red-200 dark:border-red-800/50 animate-in fade-in zoom-in-95 duration-150">
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 whitespace-nowrap">
                    ¿Eliminar?
                </span>
                <button
                    disabled={isDeleting}
                    onClick={onDelete}
                    className="p-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                    aria-label="Confirmar eliminar"
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
                <button
                    disabled={isDeleting}
                    onClick={() => setShowConfirm(false)}
                    className="p-1.5 bg-white dark:bg-zinc-800 text-zinc-500 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                    aria-label="Cancelar"
                >
                    <X size={14} />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setShowConfirm(true)}
            className="p-2 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Eliminar"
            aria-label="Eliminar propiedad"
        >
            <Trash2 size={16} />
        </button>
    );
}
