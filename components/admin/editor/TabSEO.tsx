"use client";

import { Globe, Star, MapPin } from "lucide-react";
import type { Property } from "@/lib/supabase/properties";

interface TabSEOProps {
    data: Partial<Property>;
    onChange: (field: string, value: any) => void;
    agents: { id: string; full_name: string }[];
}

export default function TabSEO({ data, onChange, agents }: TabSEOProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
                <Globe size={18} className="text-red-500" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">SEO & Avanzado</h2>
                <span className="text-[10px] text-zinc-400 font-medium">· Opcional</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Slug */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Slug manual</span>
                    <input
                        type="text"
                        value={data.slug || ''}
                        onChange={e => onChange('slug', e.target.value)}
                        placeholder="casa-campestre-los-patios"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Destacado */}
                <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer hover:border-amber-300 transition-all">
                    <input
                        type="checkbox"
                        checked={data.destacado || false}
                        onChange={e => onChange('destacado', e.target.checked)}
                        className="w-4 h-4 rounded accent-red-600"
                    />
                    <div>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                            <Star size={14} className="text-amber-500" />
                            ¿Propiedad destacada?
                        </span>
                        <p className="text-[10px] text-zinc-500 mt-0.5">Aparece primero en búsquedas y homepage</p>
                    </div>
                </label>

                {/* Meta título */}
                <label className="sm:col-span-2 block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Meta Título (SEO)</span>
                    <input
                        type="text"
                        value={data.meta_titulo || ''}
                        onChange={e => onChange('meta_titulo', e.target.value)}
                        placeholder="Título para Google (50-60 caracteres)"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Meta descripción */}
                <label className="sm:col-span-2 block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Meta Descripción (SEO)</span>
                    <textarea
                        value={data.meta_descripcion || ''}
                        onChange={e => onChange('meta_descripcion', e.target.value)}
                        rows={2}
                        placeholder="Resumen para Google (150-160 caracteres)"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none"
                    />
                </label>

                {/* Canonical */}
                <label className="sm:col-span-2 block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">URL Canónica</span>
                    <input
                        type="text"
                        value={data.canonical || ''}
                        onChange={e => onChange('canonical', e.target.value)}
                        placeholder="https://tucasalospatios.com/propiedades/..."
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>
            </div>

            {/* Agente + Coordenadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Agente responsable</span>
                    <select
                        value={data.agente_id || ''}
                        onChange={e => onChange('agente_id', e.target.value || null)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                        <option value="">Sin agente</option>
                        {agents.map(a => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                    </select>
                </label>
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Nombre público asesor</span>
                    <input
                        type="text"
                        value={data.agente_nombre_publico || ''}
                        onChange={e => onChange('agente_nombre_publico', e.target.value)}
                        placeholder="Ej: Laura Mendoza"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">Latitud</span>
                    <input type="number" step="any" value={data.latitud ?? ''} onChange={e => onChange('latitud', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </label>
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">Longitud</span>
                    <input type="number" step="any" value={data.longitud ?? ''} onChange={e => onChange('longitud', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </label>
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Código Postal</span>
                    <input type="text" value={data.codigo_postal || ''} onChange={e => onChange('codigo_postal', e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all" />
                </label>
            </div>
        </div>
    );
}
