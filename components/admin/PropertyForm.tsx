"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import { ArrowLeft, Save, Building2, MapPin, Layout, Info, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { Property } from "@/lib/supabase/properties";

interface PropertyFormProps {
    initialData?: Property;
    onSubmitAction: (formData: FormData, imageUrls: string[]) => Promise<{ error?: string, success?: boolean, slug?: string }>;
    title: React.ReactNode;
    subtitle: string;
}

export default function PropertyForm({ initialData, onSubmitAction, title, subtitle }: PropertyFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [imageUrls, setImageUrls] = useState<string[]>(initialData?.galeria || (initialData?.imagen_principal ? [initialData.imagen_principal] : []));
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus({ type: null, message: '' });

        if (imageUrls.length === 0) {
            setStatus({ type: 'error', message: 'Debes subir al menos una imagen' });
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);

        try {
            const result = await onSubmitAction(formData, imageUrls);

            if (result?.error) {
                setStatus({ type: 'error', message: result.error });
                setLoading(false);
            } else if (result?.success) {
                setStatus({ type: 'success', message: `¡Propiedad ${initialData ? 'actualizada' : 'publicada'} con éxito! Redirigiendo...` });

                setTimeout(() => {
                    router.push("/admin/propiedades");
                    router.refresh();
                }, 1500);
            }
        } catch (error) {
            console.error("Submission error:", error);
            setStatus({ type: 'error', message: 'Ocurrió un error inesperado' });
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/propiedades"
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                        {title}
                    </h1>
                    <p className="text-zinc-500 font-medium">{subtitle}</p>
                </div>
            </div>

            {status.type && (
                <div
                    className={`p-6 rounded-3xl border animate-in fade-in slide-in-from-top-4 duration-500 ${status.type === 'success'
                        ? 'bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
                        : 'bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                        }`}
                >
                    <div className="flex items-center gap-3 font-bold">
                        {status.type === 'success' ? <Star className="h-5 w-5" /> : <Info className="h-5 w-5" />}
                        <p className="uppercase tracking-widest text-sm">{status.message}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <Info size={20} />
                            <h2 className="font-black uppercase tracking-widest text-sm">Información Principal</h2>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Título de la propiedad</span>
                                <input
                                    name="titulo"
                                    required
                                    defaultValue={initialData?.titulo}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                                    placeholder="Ej: Hermosa Casa en Los Patios"
                                />
                            </label>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Precio (COP)</span>
                                    <input
                                        name="precio"
                                        type="number"
                                        required
                                        defaultValue={initialData?.precio}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                                        placeholder="0"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Tipo de Inmueble</span>
                                    <select
                                        name="tipo"
                                        defaultValue={initialData?.tipo || 'casa'}
                                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                                    >
                                        <option value="casa">Casa</option>
                                        <option value="apartamento">Apartamento</option>
                                        <option value="lote">Lote</option>
                                    </select>
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Descripción Detallada</span>
                                <textarea
                                    name="descripcion"
                                    rows={6}
                                    required
                                    defaultValue={initialData?.descripcion}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none font-medium text-zinc-700 dark:text-zinc-300"
                                    placeholder="Describe las características principales..."
                                />
                            </label>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <MapPin size={20} />
                            <h2 className="font-black uppercase tracking-widest text-sm">Ubicación</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Ciudad</span>
                                <input
                                    name="ciudad"
                                    required
                                    defaultValue={initialData?.ciudad}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                                    placeholder="Ej: Los Patios"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Barrio / Sector</span>
                                <input
                                    name="barrio"
                                    required
                                    defaultValue={initialData?.barrio}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-red-600 outline-none font-bold"
                                    placeholder="Ej: Villa del Rosario"
                                />
                            </label>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <Building2 size={20} />
                            <h2 className="font-black uppercase tracking-widest text-sm">Características Galería</h2>
                        </div>

                        <ImageUploader onUploadComplete={setImageUrls} initialUrls={imageUrls} />
                    </section>
                </div>

                <div className="space-y-8">
                    <section className="bg-white dark:bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-red-600 mb-2">
                            <Layout size={20} />
                            <h2 className="font-black uppercase tracking-widest text-sm">Detalles Técnicos</h2>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Habitaciones</span>
                                <input name="habitaciones" type="number" defaultValue={initialData?.habitaciones || 0} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none font-bold" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Baños</span>
                                <input name="baños" type="number" defaultValue={initialData?.baños || 0} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none font-bold" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-2 block">Área (m²)</span>
                                <input name="area_m2" type="number" defaultValue={initialData?.area_m2 || 0} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-2xl px-6 py-4 outline-none font-bold" />
                            </label>

                            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input name="destacado" type="checkbox" value="true" defaultChecked={initialData?.destacado} className="w-5 h-5 rounded accent-red-600" />
                                    <span className="font-bold text-sm uppercase tracking-widest text-zinc-600 dark:text-zinc-400">Propiedad Destacada</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white font-black py-6 rounded-[2rem] hover:bg-red-700 transition-all shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                        {loading ? (initialData ? "Actualizando..." : "Publicando...") : (initialData ? "Guardar Cambios" : "Publicar Inmueble")}
                    </button>
                </div>
            </form>
        </div>
    );
}
