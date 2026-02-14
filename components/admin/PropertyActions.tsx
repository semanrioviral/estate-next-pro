"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, Trash2, ExternalLink, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { handleDeleteProperty } from "@/app/admin/actions";

interface PropertyActionsProps {
    id: string;
    slug: string;
}

export default function PropertyActions({ id, slug }: PropertyActionsProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const onDelete = async () => {
        setIsDeleting(true);
        try {
            const result = await handleDeleteProperty(id);
            if (result?.success) {
                router.refresh();
            } else {
                alert("Error al eliminar: " + (result?.error || "Desconocido"));
                setIsDeleting(false);
                setShowConfirm(false);
            }
        } catch (error) {
            console.error("Delete error:", error);
            alert("Ocurrió un error inesperado al eliminar.");
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    if (showConfirm) {
        return (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2">
                <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg border border-red-100 dark:border-red-900/30">
                    ¿Confirmar?
                </span>
                <button
                    disabled={isDeleting}
                    onClick={onDelete}
                    className="p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                    {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
                <button
                    disabled={isDeleting}
                    onClick={() => setShowConfirm(false)}
                    className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                >
                    <span className="text-[10px] font-black uppercase px-1">No</span>
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Link
                href={`/propiedades/${slug}`}
                target="_blank"
                className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                title="Ver en web"
            >
                <ExternalLink size={18} />
            </Link>
            <Link
                href={`/admin/propiedades/editar/${id}`}
                className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                title="Editar"
            >
                <Edit size={18} />
            </Link>
            <button
                onClick={() => setShowConfirm(true)}
                className="p-2 text-zinc-400 hover:text-red-600 transition-colors"
                title="Eliminar"
            >
                <Trash2 size={18} />
            </button>
        </div>
    );
}
