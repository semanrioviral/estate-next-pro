"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { updatePropertyGallery } from "@/app/admin/actions";
import ImageUploader from "@/components/admin/ImageUploader";
import { GalleryImage } from "@/lib/supabase/properties";
import { ArrowLeft, Save, Building2, MapPin, Layout, Info, Loader2, Star, Shield, Tags, Globe, Video, Calendar, DollarSign, Map } from "lucide-react";
import Link from "next/link";
import { Property } from "@/lib/supabase/properties";
import MultiSelectCheckbox from "@/components/admin/MultiSelectCheckbox";
import { useToast } from "@/components/admin/Toast";

interface PropertyFormProps {
    initialData?: Property;
    onSubmitAction: (formData: FormData, images: GalleryImage[]) => Promise<{ error?: string, success?: boolean, slug?: string }>;
    title: React.ReactNode;
    subtitle: string;
    tags: { id: string; nombre: string }[];
    amenidades: { id: string; nombre: string }[];
    agents: { id: string; full_name: string }[];
}

export default function PropertyForm({ initialData, onSubmitAction, title, subtitle, tags, amenidades, agents }: PropertyFormProps) {
    const router = useRouter();
    const { success: showSuccess, error: showError } = useToast();
    const [loading, setLoading] = useState(false);

    // Transform initial galeria (string[]) to GalleryImage[]
    const [images, setImages] = useState<GalleryImage[]>(() => {
        if (!initialData) return [];

        // Use image_metadata if available (has IDs), otherwise fallback to mapping galeria
        if (initialData.image_metadata && initialData.image_metadata.length > 0) {
            return initialData.image_metadata;
        }

        // If initialData exists, map the galeria
        // Note: In the future, the backend will return the correct order. 
        // For now, we use the array index as order.
        return (initialData.galeria || []).map((url, index) => ({
            url,
            orden: index,
            es_principal: url === initialData.imagen_principal
        }));
    });

    const [isSavingGallery, setIsSavingGallery] = useState(false);

    // State controlado para nombre público del asesor (auto-fill al seleccionar agente)
    const [agentName, setAgentName] = useState(initialData?.agente_nombre_publico || '');
    const [agentPhotoUrl, setAgentPhotoUrl] = useState(initialData?.agente_foto_url || '');
    const agentsMap = useMemo(() => {
        const map: Record<string, { name: string }> = {};
        agents.forEach((a) => { map[a.id] = { name: a.full_name }; });
        return map;
    }, [agents]);

    const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const agentId = e.target.value;
        if (agentId && agentsMap[agentId]) {
            setAgentName(agentsMap[agentId].name);
            setAgentPhotoUrl('');
        } else {
            setAgentName('');
            setAgentPhotoUrl('');
        }
    };

    // State for servicios and etiquetas
    const [selectedServicios, setSelectedServicios] = useState<string[]>(initialData?.servicios || []);
    const [selectedEtiquetas, setSelectedEtiquetas] = useState<string[]>(initialData?.etiquetas || []);

    const handleSaveGallery = async () => {
        if (!initialData?.id) return;
        setIsSavingGallery(true);
        try {
            const res = await updatePropertyGallery(initialData.id, images);
            if (res.success) {
                showSuccess('Galería actualizada correctamente');
            } else {
                showError(res.error || 'Error al actualizar galería');
            }
        } catch (err) {
            showError('Error de red al actualizar galería');
        } finally {
            setIsSavingGallery(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (images.length === 0) {
            showError('Debes subir al menos una imagen');
            return;
        }

        setLoading(true);
        const formData = new FormData(e.currentTarget);

        // Auto-fill: si se seleccionó un agente pero el nombre público está vacío, completarlo
        const agentId = formData.get('agente_id') as string;
        const agentNameFromField = formData.get('agente_nombre_publico') as string;
        if (agentId && agentsMap[agentId] && !agentNameFromField?.trim()) {
            console.log('[PropertyForm] Auto-filling agent name:', agentsMap[agentId].name);
            formData.set('agente_nombre_publico', agentsMap[agentId].name);
        }

        // Append selectedServicios and selectedEtiquetas as comma-separated strings
        formData.set('servicios', selectedServicios.join(', '));
        formData.set('etiquetas', selectedEtiquetas.join(', '));

        try {
            const result = await onSubmitAction(formData, images);

            if (result?.error) {
                showError(result.error);
                setLoading(false);
            } else if (result?.success) {
                showSuccess(`¡Propiedad ${initialData ? 'actualizada' : 'publicada'} con éxito!`);
                router.push("/admin/propiedades");
                router.refresh();
            }
        } catch (error) {
            console.error("Submission error:", error);
            showError('Ocurrió un error inesperado');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-32">
            {/* ... (rest of the component remains the same, but using 'images' instead of 'imageUrls') */}
            {/* Header */}
            <div className="flex items-center gap-6">
                <Link
                    href="/admin/propiedades"
                    className="p-3 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all shadow-sm border border-zinc-100 dark:border-zinc-800"
                >
                    <ArrowLeft size={24} />
                </Link>
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase leading-none mb-2">
                        {title}
                    </h1>
                    <p className="text-zinc-500 font-medium tracking-wide">{subtitle}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                <div className="xl:col-span-8 space-y-12">

                    {/* 1. SECCIÓN GENERAL */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Building2 size={120} />
                        </div>

                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <Info size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Información General</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label className="md:col-span-2 block group">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block group-focus-within:text-red-500 transition-colors">Título de la propiedad *</span>
                                <input
                                    name="titulo"
                                    required
                                    defaultValue={initialData?.titulo}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold text-lg transition-all shadow-inner"
                                    placeholder="Ej: Penthouse de Lujo en Los Patios"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Precio *</span>
                                <div className="relative flex gap-3">
                                    <div className="relative flex-1">
                                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span>
                                        <input
                                            name="precio"
                                            type="number"
                                            required
                                            defaultValue={initialData?.precio}
                                            className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl pl-12 pr-8 py-5 outline-none font-black text-xl transition-all shadow-inner"
                                            placeholder="0"
                                        />
                                    </div>
                                    <select
                                        name="moneda"
                                        defaultValue={initialData?.moneda || 'COP'}
                                        className="w-28 bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-4 py-5 outline-none font-black text-center appearance-none shadow-inner"
                                    >
                                        <option value="COP">COP</option>
                                        <option value="USD">USD</option>
                                    </select>
                                </div>
                                <div className="mt-3 flex items-center gap-3">
                                    <input name="negociable" type="checkbox" value="true" defaultChecked={initialData?.negociable} className="w-5 h-5 rounded-lg accent-red-600 cursor-pointer" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">¿Precio Negociable?</span>
                                </div>
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Estado del Inmueble</span>
                                <select
                                    name="estado"
                                    defaultValue={initialData?.estado || 'Disponible'}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer appearance-none transition-all shadow-inner"
                                >
                                    <option value="Disponible">Disponible</option>
                                    <option value="En Venta">En Venta</option>
                                    <option value="Vendido">Vendido</option>
                                    <option value="Destacado">Destacado</option>
                                    <option value="Reservado">Reservado</option>
                                    <option value="Remate">En Remate</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Tipo de Operación *</span>
                                <select
                                    name="operacion"
                                    required
                                    defaultValue={initialData?.operacion || 'venta'}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold text-zinc-700 dark:text-zinc-200 cursor-pointer appearance-none transition-all shadow-inner"
                                >
                                    <option value="venta">Venta</option>
                                    <option value="arriendo">Arriendo</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Tipo de Inmueble *</span>
                                <select
                                    name="tipo"
                                    defaultValue={initialData?.tipo || 'casa'}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold text-zinc-700 dark:text-zinc-200 appearance-none shadow-inner"
                                >
                                    <option value="casa">Casa</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="lote">Lote / Terreno</option>
                                    <option value="comercial">Local Comercial</option>
                                    <option value="proyecto">Proyecto Inmobiliario</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Tipo de Uso</span>
                                <select
                                    name="tipo_uso"
                                    defaultValue={initialData?.tipo_uso || 'Residencial'}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold text-zinc-700 dark:text-zinc-200 appearance-none shadow-inner"
                                >
                                    <option value="Residencial">Residencial</option>
                                    <option value="Comercial">Comercial</option>
                                    <option value="Mixto">Mixto (Residencial/Comercial)</option>
                                    <option value="Industrial">Industrial</option>
                                </select>
                            </label>

                            <label className="md:col-span-2 block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Descripción Corta (SEO / Cards)</span>
                                <input
                                    name="descripcion_corta"
                                    defaultValue={initialData?.descripcion_corta}
                                    placeholder="Resumen impactante en 150 caracteres..."
                                    maxLength={160}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-zinc-600 dark:text-zinc-400 shadow-inner"
                                />
                            </label>

                            <label className="md:col-span-2 block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Descripción Detallada *</span>
                                <textarea
                                    name="descripcion"
                                    rows={8}
                                    required
                                    defaultValue={initialData?.descripcion}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-[2.5rem] px-8 py-6 outline-none font-medium text-zinc-700 dark:text-zinc-300 shadow-inner leading-relaxed"
                                    placeholder="Describe detalladamente el inmueble, acabados, entorno..."
                                />
                            </label>
                        </div>
                    </section>

                    {/* 2. SECCIÓN UBICACIÓN */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <MapPin size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Ubicación Precisa</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <label className="md:col-span-2 block font-medium">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Dirección Completa</span>
                                <input
                                    name="direccion"
                                    defaultValue={initialData?.direccion}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                    placeholder="Ej: Calle 15 # 2-45, Barrio Centro"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Ciudad *</span>
                                <input
                                    name="ciudad"
                                    required
                                    defaultValue={initialData?.ciudad}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                    placeholder="Ej: Los Patios"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Barrio / Sector *</span>
                                <input
                                    name="barrio"
                                    required
                                    defaultValue={initialData?.barrio}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                    placeholder="Ej: Villa Betania"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Código Postal</span>
                                <input
                                    name="codigo_postal"
                                    defaultValue={initialData?.codigo_postal || ''}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                    placeholder="Ej: 540001"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Latitud</span>
                                <input
                                    name="latitud"
                                    type="number"
                                    step="any"
                                    defaultValue={initialData?.latitud ?? ''}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                    placeholder="Ej: 7.8375"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Longitud</span>
                                <input
                                    name="longitud"
                                    type="number"
                                    step="any"
                                    defaultValue={initialData?.longitud ?? ''}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                    placeholder="Ej: -72.5062"
                                />
                            </label>
                        </div>
                    </section>

                    {/* 3. SECCIÓN TÉCNICA */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <Layout size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Especificaciones Técnicas</h2>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Habitaciones</span>
                                <input name="habitaciones" type="number" defaultValue={initialData?.habitaciones || 0} className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Baños</span>
                                <input name="baños" type="number" defaultValue={initialData?.baños || 0} className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Parqueaderos</span>
                                <input
                                    name="parqueaderos"
                                    type="number"
                                    min={0}
                                    defaultValue={initialData?.parqueaderos || 0}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Área (m²)</span>
                                <input name="area_m2" type="number" defaultValue={initialData?.area_m2 || 0} className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Medidas Lote</span>
                                <input name="medidas_lote" defaultValue={initialData?.medidas_lote} placeholder="Ej: 7x15m" className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner" />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Año Construcción</span>
                                <input name="año_construccion" type="number" min={1900} max={2099} defaultValue={initialData?.año_construccion ?? ''} placeholder="Ej: 2024" className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner" />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Antigüedad</span>
                                <select
                                    name="antigüedad"
                                    defaultValue={initialData?.antigüedad || ''}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center appearance-none shadow-inner"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Nuevo">Nuevo</option>
                                    <option value="Usado">Usado</option>
                                    <option value="En construcción">En construcción</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Estrato</span>
                                <select
                                    name="estrato"
                                    defaultValue={initialData?.estrato ?? ''}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center appearance-none shadow-inner"
                                >
                                    <option value="">N/A</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Canon Administración</span>
                                <input name="canon_administracion" type="number" min={0} defaultValue={initialData?.canon_administracion ?? ''} placeholder="$ 0" className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-black text-center shadow-inner" />
                            </label>
                        </div>

                        <label className="block">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Financiamiento / Programa</span>
                            <input
                                name="financiamiento"
                                defaultValue={initialData?.financiamiento}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                                placeholder="Ej: Acepta Caja Honor / Crédito Hipotecario / Directo"
                            />
                        </label>

                        <label className="block">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Agente Responsable</span>
                            <select
                                name="agente_id"
                                defaultValue={initialData?.agente_id || ''}
                                onChange={handleAgentChange}
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold text-zinc-700 dark:text-zinc-200 appearance-none shadow-inner"
                            >
                                <option value="">Sin agente asignado</option>
                                {agents.map((agent) => (
                                    <option key={agent.id} value={agent.id}>{agent.full_name}</option>
                                ))}
                            </select>
                            <p className="mt-2 text-[11px] text-zinc-500 font-medium">Al seleccionar un agente, el sistema completa automáticamente nombre y foto si existen en su perfil.</p>
                        </label>

                        <label className="block">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Nombre público del asesor</span>
                            <input
                                name="agente_nombre_publico"
                                value={agentName}
                                onChange={(e) => setAgentName(e.target.value)}
                                placeholder="Ej: Laura Mendoza"
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-bold shadow-inner"
                            />
                        </label>

                        <label className="md:col-span-2 block">
                            <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Foto del asesor (URL)</span>
                            <input
                                name="agente_foto_url"
                                value={agentPhotoUrl}
                                onChange={(e) => setAgentPhotoUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium shadow-inner"
                            />
                        </label>
                    </section>
                </div>

                <div className="xl:col-span-4 space-y-12">
                    {/* 4. GALERÍA (En sidebar para visualización constante) */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <Building2 size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Galería Visual</h2>
                        </div>
                        <ImageUploader
                            onUploadComplete={setImages}
                            initialUrls={initialData?.galeria}
                            initialImages={initialData?.image_metadata}
                        />

                        {initialData?.id && (
                            <button
                                type="button"
                                onClick={handleSaveGallery}
                                disabled={isSavingGallery}
                                className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#fb2c36] dark:hover:bg-[#fb2c36] hover:text-white transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isSavingGallery ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                {isSavingGallery ? 'Guardando...' : 'Guardar Orden de Galería'}
                            </button>
                        )}
                    </section>

                    {/* 5. COMODIDADES Y ETIQUETAS */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <Tags size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Extras y Tags</h2>
                        </div>

                        <div className="space-y-6">
                            <MultiSelectCheckbox
                                label="Servicios / Comodidades"
                                options={amenidades}
                                value={selectedServicios}
                                onChange={setSelectedServicios}
                                placeholder="Buscar amenidades..."
                            />

                            <MultiSelectCheckbox
                                label="Etiquetas (Flags)"
                                options={tags}
                                value={selectedEtiquetas}
                                onChange={setSelectedEtiquetas}
                                placeholder="Buscar etiquetas..."
                            />

                            <div className="pt-6 border-t border-zinc-50 dark:border-zinc-800/50">
                                <label className="flex items-center gap-4 cursor-pointer group bg-zinc-50 dark:bg-zinc-950 p-4 rounded-2xl border border-transparent hover:border-red-200 transition-all">
                                    <div className="relative">
                                        <input name="destacado" type="checkbox" value="true" defaultChecked={initialData?.destacado} className="peer hidden" id="destaque-check" />
                                        <div className="w-12 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-full peer-checked:bg-red-600 transition-colors"></div>
                                        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                                    </div>
                                    <span className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">¿Propiedad Destacada?</span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* 6. MULTIMEDIA */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <Video size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Multimedia Extra</h2>
                        </div>

                        <div className="space-y-6">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Video Tour (URL)</span>
                                <input
                                    name="video_url"
                                    defaultValue={initialData?.video_url || ''}
                                    placeholder="https://youtube.com/watch?v=..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-sm shadow-inner"
                                />
                            </label>

                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Fecha Disponible</span>
                                <input
                                    name="fecha_disponible"
                                    type="date"
                                    defaultValue={initialData?.fecha_disponible ? initialData.fecha_disponible.split('T')[0] : ''}
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-sm shadow-inner"
                                />
                            </label>
                        </div>
                    </section>

                    {/* 7. SEO */}
                    <section className="bg-white dark:bg-zinc-900/50 p-10 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 shadow-xl space-y-8">
                        <div className="flex items-center gap-4 text-red-600 border-b border-zinc-50 dark:border-zinc-800/50 pb-6">
                            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-2xl">
                                <Globe size={24} />
                            </div>
                            <h2 className="font-black uppercase tracking-[0.2em] text-lg dark:text-white">Optimización SEO</h2>
                        </div>

                        <div className="space-y-6">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Slug Manual</span>
                                <input
                                    name="slug"
                                    defaultValue={initialData?.slug}
                                    placeholder="ej: casa-campestre-los-patios"
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-sm shadow-inner"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Meta Título</span>
                                <input
                                    name="meta_titulo"
                                    defaultValue={initialData?.meta_titulo}
                                    placeholder="Título para buscadores..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-sm shadow-inner"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">Meta Descripción</span>
                                <textarea
                                    name="meta_descripcion"
                                    rows={3}
                                    defaultValue={initialData?.meta_descripcion}
                                    placeholder="Resumen para Google..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-sm shadow-inner"
                                />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400 mb-3 block">URL Canónica</span>
                                <input
                                    name="canonical"
                                    defaultValue={initialData?.canonical}
                                    placeholder="https://..."
                                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-3xl px-8 py-5 outline-none font-medium text-sm shadow-inner"
                                />
                            </label>
                        </div>
                    </section>

                    <div className="sticky bottom-10 z-50">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-red-600 to-red-700 text-white font-black py-8 rounded-[2.5rem] hover:from-red-700 hover:to-red-800 transition-all shadow-2xl shadow-red-600/30 disabled:opacity-50 flex items-center justify-center gap-4 uppercase tracking-[0.3em] text-xs"
                        >
                            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-[-20deg]"></div>
                            {loading ? <Loader2 className="animate-spin" /> : <Shield size={22} />}
                            {loading ? (initialData ? "Sincronizando..." : "Publicando...") : (initialData ? "Actualizar Inmueble" : "Publicar Inmueble")}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
