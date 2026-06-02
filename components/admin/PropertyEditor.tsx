"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, Check, Loader2, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";
import { useToast } from "@/components/admin/Toast";
import type { Property, GalleryImage } from "@/lib/supabase/properties";
import TabBasica from "./editor/TabBasica";
import TabDetalles from "./editor/TabDetalles";
import TabContenido from "./editor/TabContenido";
import TabSEO from "./editor/TabSEO";

type TabId = 'basica' | 'media' | 'detalles' | 'contenido' | 'seo';

const TABS: { id: TabId; label: string; shortLabel: string; keys: string[] }[] = [
    { id: 'basica', label: 'Básica', shortLabel: 'Básica', keys: ['1'] },
    { id: 'media', label: 'Media', shortLabel: 'Fotos', keys: ['2'] },
    { id: 'detalles', label: 'Detalles', shortLabel: 'Detalles', keys: ['3'] },
    { id: 'contenido', label: 'Contenido', shortLabel: 'Contenido', keys: ['4'] },
    { id: 'seo', label: 'SEO', shortLabel: 'SEO', keys: ['5'] },
];

interface PropertyEditorProps {
    initialData?: Property | null;
    onSubmitAction: (formData: FormData, images: GalleryImage[]) => Promise<{ error?: string; success?: boolean; slug?: string }>;
    tags: { id: string; nombre: string }[];
    amenidades: { id: string; nombre: string }[];
    agents: { id: string; full_name: string }[];
    isEdit?: boolean;
}

export default function PropertyEditor({ initialData, onSubmitAction, tags, amenidades, agents, isEdit }: PropertyEditorProps) {
    const router = useRouter();
    const { success: showSuccess, error: showError } = useToast();
    const [activeTab, setActiveTab] = useState<TabId>('basica');
    const [loading, setLoading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const autosaveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Form state
    const [data, setData] = useState<Partial<Property>>(() => ({
        tipo: initialData?.tipo || 'casa',
        operacion: initialData?.operacion || 'venta',
        precio: initialData?.precio || 0,
        moneda: initialData?.moneda || 'COP',
        negociable: initialData?.negociable || false,
        estado: initialData?.estado || 'Disponible',
        ciudad: initialData?.ciudad || '',
        barrio: initialData?.barrio || '',
        direccion: initialData?.direccion || '',
        titulo: initialData?.titulo || '',
        descripcion: initialData?.descripcion || '',
        descripcion_corta: initialData?.descripcion_corta || '',
        habitaciones: initialData?.habitaciones ?? 0,
        baños: initialData?.baños ?? 0,
        parqueaderos: initialData?.parqueaderos ?? 0,
        area_m2: initialData?.area_m2 ?? 0,
        medidas_lote: initialData?.medidas_lote || '',
        tipo_uso: initialData?.tipo_uso || 'Residencial',
        financiamiento: initialData?.financiamiento || '',
        año_construccion: initialData?.año_construccion ?? null,
        antigüedad: initialData?.antigüedad || null,
        estrato: initialData?.estrato ?? null,
        canon_administracion: initialData?.canon_administracion ?? null,
        servicios: initialData?.servicios || [],
        etiquetas: initialData?.etiquetas || [],
        video_url: initialData?.video_url || '',
        fecha_disponible: initialData?.fecha_disponible || null,
        slug: initialData?.slug || '',
        meta_titulo: initialData?.meta_titulo || '',
        meta_descripcion: initialData?.meta_descripcion || '',
        canonical: initialData?.canonical || '',
        destacado: initialData?.destacado || false,
        agente_id: initialData?.agente_id || null,
        agente_nombre_publico: initialData?.agente_nombre_publico || '',
        agente_foto_url: initialData?.agente_foto_url || '',
        latitud: initialData?.latitud ?? null,
        longitud: initialData?.longitud ?? null,
        codigo_postal: initialData?.codigo_postal || '',
    }));

    // Images state
    const [images, setImages] = useState<GalleryImage[]>(() => {
        if (!initialData) return [];
        if (initialData.image_metadata?.length) return initialData.image_metadata;
        return (initialData.galeria || []).map((url, i) => ({ url, orden: i, es_principal: url === initialData.imagen_principal }));
    });

    const updateField = useCallback((field: string, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
        setDirty(true);
    }, []);

    const requiredFields = ['tipo', 'operacion', 'precio', 'ciudad', 'titulo'];
    const filledRequired = requiredFields.filter(f => {
        const v = (data as any)[f];
        return v !== '' && v !== 0 && v !== null && v !== undefined;
    }).length;
    const progress = Math.round((filledRequired / requiredFields.length) * 100);

    // Build FormData for submission
    const buildFormData = useCallback(() => {
        const fd = new FormData();
        for (const [key, value] of Object.entries(data)) {
            if (value === null || value === undefined) continue;
            if (key === 'servicios' || key === 'etiquetas') {
                fd.set(key, (value as string[]).join(', '));
            } else if (typeof value === 'boolean') {
                fd.set(key, value ? 'true' : 'false');
            } else {
                fd.set(key, String(value));
            }
        }
        return fd;
    }, [data]);

    // Helper: capitalize each word in a string
    const capitalizeWords = (str: string): string =>
        str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

    // Build titulo from tipo + operacion + barrio if no titulo set
    const displayTitle = data.titulo || [
        data.tipo ? capitalizeWords(data.tipo) : 'Propiedad',
        data.operacion === 'venta' ? 'en Venta' : 'en Arriendo',
        data.barrio ? `en ${capitalizeWords(data.barrio)}` : '',
        data.ciudad ? `- ${capitalizeWords(data.ciudad)}` : '',
    ].filter(Boolean).join(' ');

    // Submit handler
    const handleSubmit = async (publish: boolean) => {
        if (images.length === 0) {
            showError('Debes subir al menos una imagen');
            setActiveTab('media');
            return;
        }
        if (!data.tipo || !data.operacion || !data.precio || !data.ciudad) {
            showError('Completa los campos requeridos en Básica');
            setActiveTab('basica');
            return;
        }

        setLoading(true);
        const fd = buildFormData();
        if (!data.titulo) fd.set('titulo', displayTitle);
        if (publish && !data.estado) fd.set('estado', 'Disponible');

        try {
            const result = await onSubmitAction(fd, images);
            if (result?.error) {
                showError(result.error);
                setLoading(false);
            } else {
                showSuccess(`¡Propiedad ${isEdit ? 'actualizada' : 'publicada'} con éxito!`);
                router.push('/admin/propiedades');
                router.refresh();
            }
        } catch (err) {
            showError('Error inesperado al guardar');
            setLoading(false);
        }
    };

    // Autosave
    useEffect(() => {
        if (dirty && initialData?.id) {
            autosaveRef.current = setInterval(async () => {
                const fd = buildFormData();
                if (!data.titulo) fd.set('titulo', displayTitle);
                const result = await onSubmitAction(fd, images);
                if (result?.success) {
                    setDirty(false);
                    setLastSaved(new Date());
                }
            }, 30000);
            return () => { if (autosaveRef.current) clearInterval(autosaveRef.current); };
        }
    }, [dirty, isEdit]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.metaKey || e.ctrlKey) {
                const tabKey = e.key;
                const tab = TABS.find(t => t.keys.includes(tabKey));
                if (tab) { e.preventDefault(); setActiveTab(tab.id); return; }
                if (e.key === 's') { e.preventDefault(); handleSubmit(false); return; }
                if (e.key === 'Enter') { e.preventDefault(); handleSubmit(true); return; }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [data, images]);

    const currentTabIndex = TABS.findIndex(t => t.id === activeTab);
    const goToTab = (dir: 1 | -1) => {
        const next = currentTabIndex + dir;
        if (next >= 0 && next < TABS.length) setActiveTab(TABS[next].id);
    };

    const imageCount = images.length;

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)]">
            {/* ============ TAB BAR ============ */}
            <div className="flex items-center gap-1 px-1 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-xl mb-4 shrink-0 overflow-x-auto">
                {TABS.map((tab, i) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                                isActive
                                    ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 shadow-sm'
                                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
                            }`}
                        >
                            <span className="hidden sm:inline">{tab.label}</span>
                            <span className="sm:hidden">{tab.shortLabel}</span>
                            {tab.id === 'media' && imageCount > 0 && (
                                <span className="text-[9px] bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full font-black">
                                    {imageCount}
                                </span>
                            )}
                            {isActive && (
                                <span className="hidden sm:inline text-[9px] text-zinc-400 font-mono ml-0.5">
                                    Ctrl+{tab.keys[0]}
                                </span>
                            )}
                        </button>
                    );
                })}

                {/* Progress */}
                <div className="hidden sm:flex items-center gap-2 ml-auto mr-2">
                    <div className="w-20 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-red-500 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400">{progress}%</span>
                </div>

                {/* Nav arrows */}
                <button onClick={() => goToTab(-1)} disabled={currentTabIndex === 0}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors">
                    <ChevronLeft size={16} />
                </button>
                <button onClick={() => goToTab(1)} disabled={currentTabIndex === TABS.length - 1}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 disabled:opacity-30 transition-colors">
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* ============ CONTENT AREA ============ */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden">
                {/* LEFT: Tab Content */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-5 sm:p-6">
                        {activeTab === 'basica' && <TabBasica data={data} onChange={updateField} />}
                        {activeTab === 'media' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2.5">
                                    <Camera size={18} className="text-red-500" />
                                    <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Galería de imágenes</h2>
                                    <span className="text-[10px] text-zinc-400 font-bold">{imageCount} foto{imageCount !== 1 ? 's' : ''}</span>
                                </div>
                                <ImageUploader
                                    onUploadComplete={setImages}
                                    initialUrls={initialData?.galeria}
                                    initialImages={initialData?.image_metadata}
                                />
                            </div>
                        )}
                        {activeTab === 'detalles' && <TabDetalles data={data} onChange={updateField} />}
                        {activeTab === 'contenido' && <TabContenido data={data} onChange={updateField} tags={tags} amenidades={amenidades} />}
                        {activeTab === 'seo' && <TabSEO data={data} onChange={updateField} agents={agents} />}
                    </div>
                </div>

                {/* RIGHT: Media Panel (persistent) */}
                <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col shrink-0">
                    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 dark:border-zinc-800 p-4 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                                <ImageIcon size={13} />
                                Fotos ({imageCount})
                            </h3>
                            {imageCount > 0 && (
                                <span className="text-[10px] text-zinc-400 font-medium">
                                    ★ = principal
                                </span>
                            )}
                        </div>
                        {images.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 overflow-y-auto flex-1 content-start">
                                {images.map((img, i) => (
                                    <div
                                        key={i}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer group ${
                                            img.es_principal
                                                ? 'border-amber-400 shadow-md shadow-amber-200'
                                                : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
                                        }`}
                                        onClick={() => {
                                            setImages(prev => prev.map((im, j) => ({
                                                ...im,
                                                es_principal: j === i,
                                            })));
                                        }}
                                    >
                                        <Image
                                            src={img.url}
                                            alt={`Foto ${i + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                        {img.es_principal && (
                                            <div className="absolute top-1 left-1 bg-amber-400 text-white rounded-md px-1 py-0.5 text-[9px] font-black shadow-sm">
                                                ★
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                            {i + 1}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-zinc-300 dark:text-zinc-600">
                                <div className="text-center">
                                    <ImageIcon size={40} className="mx-auto mb-2 opacity-40" />
                                    <p className="text-xs font-medium">Sin imágenes</p>
                                    <p className="text-[10px] mt-0.5">Ve al tab Media para subir</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ============ STICKY BOTTOM BAR ============ */}
            <div className="shrink-0 mt-4 flex items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 rounded-xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3 text-xs">
                    {dirty && (
                        <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                            Cambios sin guardar
                        </span>
                    )}
                    {!dirty && lastSaved && (
                        <span className="flex items-center gap-1.5 text-zinc-400 font-medium">
                            <Check size={13} className="text-emerald-500" />
                            Guardado {lastSaved.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    {!dirty && !lastSaved && isEdit && (
                        <span className="text-zinc-400 font-medium flex items-center gap-1.5">
                            <Check size={13} className="text-emerald-500" />
                            Sin cambios
                        </span>
                    )}
                    <span className="text-zinc-300 dark:text-zinc-700">|</span>
                    <span className="text-zinc-400 font-medium">
                        {filledRequired}/{requiredFields.length} requeridos
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        disabled={loading}
                        className="px-4 py-2.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : 'Guardar'}
                    </button>
                    <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        disabled={loading}
                        className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                    >
                        {loading ? <Loader2 size={15} className="animate-spin" /> : (isEdit ? 'Actualizar' : 'Publicar')}
                    </button>
                </div>
            </div>
        </div>
    );
}
