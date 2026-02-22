'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronDown, ListFilter } from 'lucide-react';
import { useCallback } from 'react';

export default function SortingControls() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentOrden = searchParams.get('orden') || 'recientes';

    const createQueryString = useCallback(
        (params: Record<string, string | null>) => {
            const newParams = new URLSearchParams(searchParams.toString());

            Object.entries(params).forEach(([name, value]) => {
                if (value === null || value === '') {
                    newParams.delete(name);
                } else {
                    newParams.set(name, value);
                }
            });

            return newParams.toString();
        },
        [searchParams]
    );

    const handleSort = (value: string) => {
        const queryString = createQueryString({ orden: value });
        router.push(`${pathname}?${queryString}`, { scroll: false });
    };

    return (
        <div className="flex flex-col md:flex-row items-end md:items-center justify-end gap-3 mb-8">
            <label htmlFor="sort-select" className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Ordenar por
            </label>
            <div className="relative group w-full md:w-auto">
                <select
                    id="sort-select"
                    value={currentOrden}
                    onChange={(e) => handleSort(e.target.value)}
                    className="appearance-none w-full md:w-64 bg-white border border-slate-200 rounded-xl px-5 py-3 text-xs font-bold text-slate-700 uppercase tracking-wider outline-none transition-all hover:bg-slate-50 hover:border-slate-300 focus:border-brand focus:ring-4 focus:ring-brand/5 cursor-pointer"
                >
                    <option value="recientes">Más recientes</option>
                    <option value="antiguas">Más antiguas</option>
                    <option value="precio_asc">Precio: menor a mayor</option>
                    <option value="precio_desc">Precio: mayor a menor</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-slate-600 transition-colors">
                    <ChevronDown className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
