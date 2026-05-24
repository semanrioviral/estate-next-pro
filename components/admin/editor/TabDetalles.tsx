"use client";

import { Ruler } from "lucide-react";
import type { Property } from "@/lib/supabase/properties";

interface TabDetallesProps {
    data: Partial<Property>;
    onChange: (field: string, value: any) => void;
}

const ANTIGUEDAD_OPTS = ['', 'Nuevo', 'Usado', 'En construcción'];
const USO_OPTS = ['Residencial', 'Comercial', 'Mixto', 'Industrial'];

export default function TabDetalles({ data, onChange }: TabDetallesProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
                <Ruler size={18} className="text-red-500" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Características</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Habitaciones */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Habitaciones</span>
                    <input
                        type="number" min={0}
                        value={data.habitaciones ?? ''}
                        onChange={e => onChange('habitaciones', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Baños */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Baños</span>
                    <input
                        type="number" min={0}
                        value={data.baños ?? ''}
                        onChange={e => onChange('baños', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Parqueaderos */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Parqueaderos</span>
                    <input
                        type="number" min={0}
                        value={data.parqueaderos ?? ''}
                        onChange={e => onChange('parqueaderos', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Área */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Área (m²)</span>
                    <input
                        type="number" min={0}
                        value={data.area_m2 ?? ''}
                        onChange={e => onChange('area_m2', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Estrato */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Estrato</span>
                    <select
                        value={data.estrato ?? ''}
                        onChange={e => onChange('estrato', e.target.value === '' ? null : Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                        <option value="">N/A</option>
                        {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </label>

                {/* Canon */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Canon Admin</span>
                    <input
                        type="number" min={0}
                        value={data.canon_administracion ?? ''}
                        onChange={e => onChange('canon_administracion', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="$ 0"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Año construcción */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Año Construc.</span>
                    <input
                        type="number" min={1900} max={2099}
                        value={data.año_construccion ?? ''}
                        onChange={e => onChange('año_construccion', e.target.value === '' ? null : Number(e.target.value))}
                        placeholder="2024"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Antigüedad */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Antigüedad</span>
                    <select
                        value={data.antigüedad || ''}
                        onChange={e => onChange('antigüedad', e.target.value || null)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                        {ANTIGUEDAD_OPTS.map(o => <option key={o} value={o}>{o || 'Seleccionar...'}</option>)}
                    </select>
                </label>

                {/* Tipo de uso */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Tipo de Uso</span>
                    <select
                        value={data.tipo_uso || 'Residencial'}
                        onChange={e => onChange('tipo_uso', e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-bold text-center text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                        {USO_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </label>
            </div>

            {/* Lote + Financiamiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Medidas del Lote</span>
                    <input
                        type="text"
                        value={data.medidas_lote || ''}
                        onChange={e => onChange('medidas_lote', e.target.value)}
                        placeholder="Ej: 8x15m"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Financiamiento</span>
                    <input
                        type="text"
                        value={data.financiamiento || ''}
                        onChange={e => onChange('financiamiento', e.target.value)}
                        placeholder="Ej: Crédito Hipotecario"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>
            </div>
        </div>
    );
}
