"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Send, Check, Pencil, X, Upload, Building2, ImageIcon } from "lucide-react";
import Image from "next/image";
import ImageUploader from "@/components/admin/ImageUploader";
import { GalleryImage } from "@/lib/supabase/properties";
import { handleCreateProperty } from "@/app/admin/actions";
import { useToast } from "@/components/admin/Toast";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

interface GeneratedProperty {
    titulo: string; tipo: string; operacion: string; precio: number; moneda: string;
    negociable: boolean; ciudad: string; barrio: string; direccion: string;
    habitaciones: number; baños: number; parqueaderos: number; area_m2: number;
    medidas_lote: string | null; estrato: number | null; antigüedad: string | null;
    año_construccion: number | null; canon_administracion: number | null;
    tipo_uso: string; descripcion_corta: string; descripcion: string;
    servicios: string[]; etiquetas: string[]; financiamiento: string | null;
    codigo_postal: string | null; meta_titulo: string; meta_descripcion: string;
    slug: string; canonical: string | null;
}

export default function AIChatCreator() {
    const router = useRouter();
    const { success: toast, error: toastErr } = useToast();
    const [text, setText] = useState("");
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState<GeneratedProperty | null>(null);
    const [publishing, setPublishing] = useState(false);
    const [edited, setEdited] = useState<Partial<GeneratedProperty>>({});
    const [uploadReady, setUploadReady] = useState(false);
    const [apiKey, setApiKey] = useState(() => {
        if (typeof window !== 'undefined') return localStorage.getItem('ai_api_key') || '';
        return '';
    });

    const prop = generated ? { ...generated, ...edited } : null;

    const handleGenerate = async () => {
        if (text.trim().length < 10) { toastErr("Escribe al menos 10 caracteres describiendo la propiedad."); return; }
        if (!uploadReady || images.length === 0) { toastErr("Espera a que las imágenes terminen de subir."); return; }
        if (apiKey.trim()) localStorage.setItem('ai_api_key', apiKey.trim());
        setLoading(true);
        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: text.trim(), imageUrls: images.map(i => i.url), apiKey: apiKey.trim() || undefined }),
            });
            const data = await res.json();
            if (data.error) { toastErr(data.error); return; }
            setGenerated(data.property);
            setEdited({});
            toast("¡Propiedad generada! Revisa y publica.");
        } catch { toastErr("Error al conectar con la IA."); }
        finally { setLoading(false); }
    };

    const handlePublish = async () => {
        if (!prop || !images.length) { toastErr("Sube al menos una imagen."); return; }
        setPublishing(true);
        const fd = new FormData();
        fd.set("titulo", prop.titulo);
        fd.set("precio", String(prop.precio));
        fd.set("moneda", prop.moneda);
        fd.set("tipo", prop.tipo);
        fd.set("operacion", prop.operacion);
        fd.set("negociable", prop.negociable ? "true" : "false");
        fd.set("ciudad", prop.ciudad);
        fd.set("barrio", prop.barrio);
        fd.set("direccion", prop.direccion || "");
        fd.set("estado", "Disponible");
        fd.set("habitaciones", String(prop.habitaciones));
        fd.set("baños", String(prop.baños));
        fd.set("parqueaderos", String(prop.parqueaderos));
        fd.set("area_m2", String(prop.area_m2));
        if (prop.medidas_lote) fd.set("medidas_lote", prop.medidas_lote);
        if (prop.estrato) fd.set("estrato", String(prop.estrato));
        if (prop.antigüedad) fd.set("antigüedad", prop.antigüedad);
        if (prop.año_construccion) fd.set("año_construccion", String(prop.año_construccion));
        if (prop.canon_administracion) fd.set("canon_administracion", String(prop.canon_administracion));
        fd.set("tipo_uso", prop.tipo_uso);
        fd.set("descripcion_corta", prop.descripcion_corta);
        fd.set("descripcion", prop.descripcion);
        fd.set("servicios", prop.servicios.join(", "));
        fd.set("etiquetas", prop.etiquetas.join(", "));
        if (prop.financiamiento) fd.set("financiamiento", prop.financiamiento);
        if (prop.codigo_postal) fd.set("codigo_postal", prop.codigo_postal);
        fd.set("meta_titulo", prop.meta_titulo);
        fd.set("meta_descripcion", prop.meta_descripcion);
        fd.set("slug", prop.slug);
        if (prop.canonical) fd.set("canonical", prop.canonical);
        fd.set("destacado", "false");

        try {
            const result = await handleCreateProperty(fd, images);
            if (result?.error) { toastErr(result.error); }
            else { toast("¡Propiedad publicada!"); router.push("/admin/propiedades"); router.refresh(); }
        } catch { toastErr("Error al publicar."); }
        finally { setPublishing(false); }
    };

    const update = (field: string, value: any) => setEdited(prev => ({ ...prev, [field]: value }));

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <AdminBreadcrumbs items={[{ label: "Dashboard", href: "/admin" }, { label: "Propiedades", href: "/admin/propiedades" }, { label: "Crear con IA" }]} />
            <div>
                <h1 className="text-2xl font-black text-zinc-900 flex items-center gap-2"><Sparkles size={24} className="text-amber-500" /> Creador IA</h1>
                <p className="text-sm text-zinc-500 mt-0.5">Pega la información de la propiedad y la IA genera todo automáticamente.</p>
            </div>

            {/* INPUT */}
            {!generated && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/60 p-6 space-y-4">
                    <label className="block">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">🔑 API Key (opcional — solo si no la configuraste en Vercel)</span>
                        <input
                            type="password" value={apiKey} onChange={e => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-amber-500/20"
                        />
                    </label>
                    <label className="block">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">📝 Pega aquí la info de la propiedad</span>
                        <textarea
                            value={text} onChange={e => setText(e.target.value)}
                            placeholder={`Pega el mensaje de WhatsApp, correo o notas del agente...\n\nEjemplo:\n"Apartamento en Caobos, 120m2, 3 habitaciones, 2 baños, piscina, gimnasio, seguridad 24h. Precio: 280 millones negociables. Entrega inmediata. Piso 8, vista panorámica."`}
                            rows={8}
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-amber-500/20 resize-y"
                        />
                    </label>
                <div>
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2 block">📸 Imágenes ({images.length} {uploadReady ? '✓ listas' : 'subiendo...'})</span>
                    <ImageUploader onUploadComplete={(imgs) => { setImages(imgs); setUploadReady(true); }} />
                </div>
                    <button onClick={handleGenerate} disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50">
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                        {loading ? "Analizando con IA..." : "Generar propiedad con IA"}
                    </button>
                </div>
            )}

            {/* RESULT */}
            {prop && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl border border-emerald-200/60 overflow-hidden">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 px-5 py-3 border-b border-emerald-200 flex items-center gap-2">
                        <Check size={18} className="text-emerald-600" />
                        <span className="text-sm font-black text-emerald-700">Propiedad generada — revisa y publica</span>
                        <span className="text-xs text-emerald-600 ml-2">{images.length} fotos listas</span>
                        <button onClick={() => { setGenerated(null); setText(""); setEdited({}); setUploadReady(false); setImages([]); }} className="ml-auto text-xs font-bold text-zinc-500 hover:text-red-600">× Cancelar</button>
                    </div>
                    {images.length > 0 && (
                        <div className="px-6 py-3 border-b border-zinc-100 flex gap-2 overflow-x-auto">
                            {images.slice(0, 8).map((img, i) => (
                                <div key={i} className="relative h-16 w-24 rounded-lg overflow-hidden shrink-0 border-2 border-zinc-200">
                                    <Image src={img.url} alt={`Foto ${i+1}`} fill className="object-cover" sizes="96px" />
                                    {img.es_principal && <div className="absolute top-1 left-1 bg-amber-400 text-white rounded px-1 text-[9px] font-black">★</div>}
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <EditableField label="Título" value={prop.titulo} onChange={v => update("titulo", v)} />
                        <div className="flex gap-3">
                            <EditableField label="Precio" value={String(prop.precio)} onChange={v => update("precio", Number(v) || 0)} type="number" />
                            <EditableField label="Moneda" value={prop.moneda} onChange={v => update("moneda", v)} className="w-20" />
                        </div>
                        <div className="flex gap-3">
                            <EditableField label="Tipo" value={prop.tipo} onChange={v => update("tipo", v)} />
                            <EditableField label="Operación" value={prop.operacion} onChange={v => update("operacion", v)} />
                        </div>
                        <EditableField label="Negociable" value={prop.negociable ? "Sí" : "No"} onChange={v => update("negociable", v === "Sí" || v === "true")} />
                        <EditableField label="Ciudad" value={prop.ciudad} onChange={v => update("ciudad", v)} />
                        <EditableField label="Barrio" value={prop.barrio} onChange={v => update("barrio", v)} />
                        <EditableField label="Dirección" value={prop.direccion || ""} onChange={v => update("direccion", v)} className="lg:col-span-2" />
                        <EditableField label="Habitaciones" value={String(prop.habitaciones)} onChange={v => update("habitaciones", Number(v))} type="number" />
                        <EditableField label="Baños" value={String(prop.baños)} onChange={v => update("baños", Number(v))} type="number" />
                        <EditableField label="Parqueaderos" value={String(prop.parqueaderos)} onChange={v => update("parqueaderos", Number(v))} type="number" />
                        <EditableField label="Área (m²)" value={String(prop.area_m2)} onChange={v => update("area_m2", Number(v))} type="number" />
                        {prop.estrato && <EditableField label="Estrato" value={String(prop.estrato)} onChange={v => update("estrato", Number(v))} type="number" />}
                        {prop.año_construccion && <EditableField label="Año const." value={String(prop.año_construccion)} onChange={v => update("año_construccion", Number(v))} type="number" />}
                        {prop.antigüedad && <EditableField label="Antigüedad" value={prop.antigüedad} onChange={v => update("antigüedad", v)} />}
                        {prop.canon_administracion != null && <EditableField label="Canon admin" value={String(prop.canon_administracion)} onChange={v => update("canon_administracion", Number(v))} type="number" />}
                        <EditableField label="Tipo de uso" value={prop.tipo_uso} onChange={v => update("tipo_uso", v)} />
                        {prop.medidas_lote && <EditableField label="Medidas lote" value={prop.medidas_lote} onChange={v => update("medidas_lote", v)} />}
                        
                        <div className="lg:col-span-2">
                            <EditableField label="Descripción corta" value={prop.descripcion_corta} onChange={v => update("descripcion_corta", v)} textarea />
                        </div>
                        <div className="lg:col-span-2">
                            <EditableField label="Descripción larga" value={prop.descripcion} onChange={v => update("descripcion", v)} textarea rows={4} />
                        </div>
                        
                        <EditableField label="Servicios (coma separados)" value={prop.servicios.join(", ")} onChange={v => update("servicios", v.split(",").map((s: string) => s.trim()).filter(Boolean))} />
                        <EditableField label="Etiquetas (coma separados)" value={prop.etiquetas.join(", ")} onChange={v => update("etiquetas", v.split(",").map((s: string) => s.trim()).filter(Boolean))} />
                        {prop.financiamiento && <EditableField label="Financiamiento" value={prop.financiamiento} onChange={v => update("financiamiento", v)} className="lg:col-span-2" />}
                        
                        <div className="lg:col-span-2 border-t border-zinc-100 pt-4 mt-2">
                            <p className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-3">🔍 SEO Generado</p>
                        </div>
                        <EditableField label="Meta título" value={prop.meta_titulo} onChange={v => update("meta_titulo", v)} className="lg:col-span-2" />
                        <EditableField label="Meta descripción" value={prop.meta_descripcion} onChange={v => update("meta_descripcion", v)} className="lg:col-span-2" textarea rows={2} />
                        <EditableField label="Slug" value={prop.slug} onChange={v => update("slug", v)} />
                        {prop.canonical && <EditableField label="Canonical" value={prop.canonical} onChange={v => update("canonical", v)} />}
                    </div>

                    <div className="px-6 py-4 border-t border-zinc-100 flex items-center gap-3 bg-zinc-50">
                        <button onClick={handleGenerate} className="px-4 py-2 text-sm font-bold text-zinc-600 bg-white border border-zinc-300 rounded-lg hover:bg-zinc-100 transition-colors flex items-center gap-2">
                            <Sparkles size={14} /> Regenerar
                        </button>
                        <button onClick={handlePublish} disabled={publishing} className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                            {publishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={14} />}
                            {publishing ? "Publicando..." : "Publicar propiedad"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function EditableField({ label, value, onChange, type, textarea, rows, className }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; textarea?: boolean; rows?: number; className?: string;
}) {
    const [editing, setEditing] = useState(false);
    const [local, setLocal] = useState(value);

    const save = () => { onChange(local); setEditing(false); };

    if (!editing) {
        return (
            <div className={className}>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span>
                <p className="text-sm font-medium text-zinc-800 mt-0.5 cursor-pointer hover:text-red-600 transition-colors flex items-center gap-1.5" onClick={() => { setLocal(value); setEditing(true); }}>
                    {value || <span className="text-zinc-300 italic">Vacío</span>}
                    <Pencil size={11} className="text-zinc-300" />
                </p>
            </div>
        );
    }

    const inputClass = "w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-amber-500/20";

    return (
        <div className={className}>
            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{label}</span>
            <div className="flex gap-1.5 mt-0.5">
                {textarea ? (
                    <textarea value={local} onChange={e => setLocal(e.target.value)} rows={rows || 2} className={inputClass + " resize-y"} autoFocus onKeyDown={e => { if (e.key === "Escape") { setLocal(value); setEditing(false); } }} />
                ) : (
                    <input type={type || "text"} value={local} onChange={e => setLocal(e.target.value)} className={inputClass} autoFocus onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setLocal(value); setEditing(false); } }} />
                )}
                <button onClick={save} className="px-2 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold hover:bg-amber-600"><Check size={14} /></button>
                <button onClick={() => { setLocal(value); setEditing(false); }} className="px-2 py-1 bg-zinc-200 text-zinc-600 rounded-lg text-xs font-bold hover:bg-zinc-300"><X size={14} /></button>
            </div>
        </div>
    );
}
