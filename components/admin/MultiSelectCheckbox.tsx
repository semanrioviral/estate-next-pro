'use client';

import { useState, useMemo } from 'react';
import { X, Search, Plus } from 'lucide-react';

interface MultiSelectCheckboxProps {
    label: string;
    options: { id: string; nombre: string }[];
    value: string[]; // Array de nombres seleccionados
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export default function MultiSelectCheckbox({
    label,
    options,
    value,
    onChange,
    placeholder = 'Buscar...'
}: MultiSelectCheckboxProps) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filtrar opciones basado en búsqueda
    const filteredOptions = useMemo(() => {
        if (!searchTerm.trim()) return options;
        const search = searchTerm.toLowerCase();
        return options.filter(opt =>
            opt.nombre.toLowerCase().includes(search)
        );
    }, [options, searchTerm]);

    // Alternar selección
    const toggleOption = (nombre: string) => {
        if (value.includes(nombre)) {
            onChange(value.filter(v => v !== nombre));
        } else {
            onChange([...value, nombre]);
        }
    };

    // Remover chip
    const removeChip = (nombre: string) => {
        onChange(value.filter(v => v !== nombre));
    };

    // Crear nueva opción
    const createNewOption = () => {
        const trimmed = searchTerm.trim();

        // Validar que no esté vacío
        if (!trimmed) return;

        // Evitar duplicados (case-insensitive)
        if (value.some(v => v.toLowerCase() === trimmed.toLowerCase())) {
            return;
        }

        // Agregar al array de seleccionados
        onChange([...value, trimmed]);

        // Limpiar búsqueda
        setSearchTerm('');
    };

    return (
        <div className="space-y-3">
            <label className="block text-xs font-black uppercase tracking-[0.2em] text-zinc-400">
                {label}
            </label>

            {/* Chips de seleccionados */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    {value.map((nombre) => (
                        <div
                            key={nombre}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-full text-xs font-bold"
                        >
                            <span>{nombre}</span>
                            <button
                                type="button"
                                onClick={() => removeChip(nombre)}
                                className="hover:bg-red-200 rounded-full p-0.5 transition-colors"
                                aria-label={`Eliminar ${nombre}`}
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border-2 border-transparent focus:border-red-500 rounded-2xl pl-12 pr-4 py-3 outline-none font-bold text-sm transition-all shadow-inner"
                />
            </div>

            {/* Lista de checkboxes con scroll */}
            <div className="max-h-64 overflow-y-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950">
                {filteredOptions.length === 0 ? (
                    <div className="p-4">
                        {searchTerm.trim() ? (
                            // Botón para crear nueva opción
                            <button
                                type="button"
                                onClick={createNewOption}
                                className="w-full flex items-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition-colors border-2 border-dashed border-red-300 hover:border-red-400"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-bold text-sm">
                                    Crear &ldquo;{searchTerm.trim()}&rdquo;
                                </span>
                            </button>
                        ) : (
                            <div className="text-center text-zinc-500 text-sm font-medium py-6">
                                No se encontraron opciones
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {filteredOptions.map((option) => {
                            const isChecked = value.includes(option.nombre);
                            return (
                                <label
                                    key={option.id}
                                    className="flex items-center gap-3 p-3 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleOption(option.nombre)}
                                        className="w-4 h-4 text-red-600 border-zinc-300 dark:border-zinc-700 rounded focus:ring-red-500 cursor-pointer"
                                    />
                                    <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300 select-none flex-1">
                                        {option.nombre}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contador de seleccionados */}
            <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
                {value.length} de {options.length} seleccionado{value.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
