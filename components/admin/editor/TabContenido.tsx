"use client";

import { FileText, Video, Calendar } from "lucide-react";
import type { Property } from "@/lib/supabase/properties";
import MultiSelectCheckbox from "@/components/admin/MultiSelectCheckbox";

interface TabContenidoProps {
    data: Partial<Property>;
    onChange: (field: string, value: any) => void;
    tags: { id: string; nombre: string }[];
    amenidades: { id: string; nombre: string }[];
}

export default function TabContenido({ data, onChange, tags, amenidades }: TabContenidoProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
                <FileText size={18} className="text-red-500" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Contenido editorial</h2>
            </div>

            {/* Descripción Corta */}
            <label className="block">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">
                    Descripción corta <span className="text-zinc-400 font-medium">· Cards y SEO</span>
                </span>
                <input
                    type="text"
                    value={data.descripcion_corta || ''}
                    onChange={e => onChange('descripcion_corta', e.target.value)}
                    maxLength={160}
                    placeholder="Resumen impactante en 160 caracteres..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                />
                <span className="text-[10px] text-zinc-400 mt-1 block text-right">{(data.descripcion_corta || '').length}/160</span>
            </label>

            {/* Descripción Larga */}
            <label className="block">
                <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Descripción completa</span>
                <textarea
                    value={data.descripcion || ''}
                    onChange={e => onChange('descripcion', e.target.value)}
                    rows={5}
                    placeholder="Describe la propiedad en detalle: distribución, acabados, ubicación, plusvalía..."
                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-y min-h-[120px]"
                />
            </label>

            {/* Servicios y Etiquetas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MultiSelectCheckbox
                    label="Servicios / Comodidades"
                    options={amenidades}
                    value={data.servicios || []}
                    onChange={v => onChange('servicios', v)}
                    placeholder="Buscar amenidades..."
                />
                <MultiSelectCheckbox
                    label="Etiquetas (Flags)"
                    options={tags}
                    value={data.etiquetas || []}
                    onChange={v => onChange('etiquetas', v)}
                    placeholder="Buscar etiquetas..."
                />
            </div>

            {/* Video + Fecha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Video size={13} /> Video Tour (URL)
                    </span>
                    <input
                        type="text"
                        value={data.video_url || ''}
                        onChange={e => onChange('video_url', e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Calendar size={13} /> Fecha Disponible
                    </span>
                    <input
                        type="date"
                        value={data.fecha_disponible ? String(data.fecha_disponible).split('T')[0] : ''}
                        onChange={e => onChange('fecha_disponible', e.target.value || null)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>
            </div>
        </div>
    );
}
