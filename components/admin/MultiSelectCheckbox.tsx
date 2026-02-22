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
            <label className="block text-sm font-medium text-gray-700">
                {label}
            </label>

            {/* Chips de seleccionados */}
            {value.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {value.map((nombre) => (
                        <div
                            key={nombre}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                            <span>{nombre}</span>
                            <button
                                type="button"
                                onClick={() => removeChip(nombre)}
                                className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
            </div>

            {/* Lista de checkboxes con scroll */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-white">
                {filteredOptions.length === 0 ? (
                    <div className="p-4">
                        {searchTerm.trim() ? (
                            // Botón para crear nueva opción
                            <button
                                type="button"
                                onClick={createNewOption}
                                className="w-full flex items-center gap-2 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors border-2 border-dashed border-green-300 hover:border-green-400"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">
                                    Crear "{searchTerm.trim()}"
                                </span>
                            </button>
                        ) : (
                            <div className="text-center text-gray-500 text-sm">
                                No se encontraron opciones
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {filteredOptions.map((option) => {
                            const isChecked = value.includes(option.nombre);
                            return (
                                <label
                                    key={option.id}
                                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleOption(option.nombre)}
                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-gray-700 select-none flex-1">
                                        {option.nombre}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Contador de seleccionados */}
            <div className="text-xs text-gray-500">
                {value.length} de {options.length} seleccionado{value.length !== 1 ? 's' : ''}
            </div>
        </div>
    );
}
