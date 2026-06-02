"use client";

import { Building2, DollarSign, MapPin } from "lucide-react";
import type { Property } from "@/lib/supabase/properties";

interface TabBasicaProps {
    data: Partial<Property>;
    onChange: (field: string, value: any) => void;
}

const TIPOS = ['casa', 'apartamento', 'lote', 'comercial', 'proyecto', 'local', 'oficina', 'bodega', 'finca'];
const TIPO_LABELS: Record<string, string> = {
    casa: 'Casa', apartamento: 'Apartamento', lote: 'Lote / Terreno',
    comercial: 'Local Comercial', proyecto: 'Proyecto Inmobiliario',
    local: 'Local', oficina: 'Oficina', bodega: 'Bodega', finca: 'Finca',
};
const ESTADOS = ['Disponible', 'En Venta', 'Vendido', 'Destacado', 'Reservado', 'En Remate'];

export default function TabBasica({ data, onChange }: TabBasicaProps) {
    return (
        <div className="space-y-5">
            <div className="flex items-center gap-2.5 mb-1">
                <Building2 size={18} className="text-red-500" />
                <h2 className="text-sm font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">Información básica</h2>
                <span className="text-[10px] text-zinc-400 font-bold">· Campos requeridos</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tipo */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Tipo *</span>
                    <select
                        value={data.tipo || 'casa'}
                        onChange={e => onChange('tipo', e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                        {TIPOS.map(t => <option key={t} value={t}>{TIPO_LABELS[t]}</option>)}
                    </select>
                </label>

                {/* Operación */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Operación *</span>
                    <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        {(['venta', 'arriendo'] as const).map(op => (
                            <button
                                key={op}
                                type="button"
                                onClick={() => onChange('operacion', op)}
                                className={`flex-1 py-2.5 text-sm font-bold uppercase tracking-wider transition-all ${
                                    (data.operacion || 'venta') === op
                                        ? 'bg-red-600 text-white'
                                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-700'
                                }`}
                            >
                                {op === 'venta' ? 'Venta' : 'Arriendo'}
                            </button>
                        ))}
                    </div>
                </label>

                {/* Precio */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Precio *</span>
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                            <input
                                type="number"
                                value={data.precio || ''}
                                onChange={e => onChange('precio', Number(e.target.value))}
                                placeholder="0"
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                        </div>
                        <select
                            value={data.moneda || 'COP'}
                            onChange={e => onChange('moneda', e.target.value)}
                            className="w-20 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm font-bold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                        >
                            <option value="COP">COP</option>
                            <option value="USD">USD</option>
                        </select>
                    </div>
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={data.negociable || false}
                            onChange={e => onChange('negociable', e.target.checked)}
                            className="w-4 h-4 rounded accent-red-600"
                        />
                        <span className="text-[11px] font-semibold text-zinc-500">¿Precio negociable?</span>
                    </label>
                </label>

                {/* Estado */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Estado</span>
                    <select
                        value={data.estado || 'Disponible'}
                        onChange={e => onChange('estado', e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    >
                        {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                </label>

                {/* Ciudad */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Ciudad *</span>
                    <input
                        type="text"
                        value={data.ciudad || ''}
                        onChange={e => onChange('ciudad', e.target.value)}
                        placeholder="Ej: Cúcuta, Los Patios..."
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Barrio */}
                <label className="block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Barrio</span>
                    <input
                        type="text"
                        value={data.barrio || ''}
                        onChange={e => onChange('barrio', e.target.value)}
                        placeholder="Ej: Centro, La Sabana..."
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                </label>

                {/* Título (requerido) */}
                <label className="sm:col-span-2 block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Título *</span>
                    <input
                        type="text"
                        value={data.titulo || ''}
                        onChange={e => onChange('titulo', e.target.value)}
                        placeholder="Ej: Casa en Venta en Tierra Linda, Los Patios — 3 Habitaciones"
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                    />
                    {!data.titulo && (
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                            ⚠️ Si no escribes un título, se generará uno automáticamente
                        </p>
                    )}
                </label>

                {/* Dirección */}
                <label className="sm:col-span-2 block">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1.5 block">Dirección</span>
                    <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                            type="text"
                            value={data.direccion || ''}
                            onChange={e => onChange('direccion', e.target.value)}
                            placeholder="Cra. 4 #10-25, Los Patios..."
                            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                    </div>
                </label>
            </div>
        </div>
    );
}
