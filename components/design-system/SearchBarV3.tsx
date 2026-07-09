'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname, useSearchParams } from 'next/navigation';
import { Search, MapPin, Building2, ChevronDown, Map, Bed } from 'lucide-react';
import { getActiveBarriosByCity } from '@/lib/supabase/client-queries';
import { trackSearchFilter } from '@/components/tracking/gtag';

const CITIES = [
    { id: 'cucuta', label: 'Cúcuta', slug: 'cucuta' },
    { id: 'los-patios', label: 'Los Patios', slug: 'los-patios' },
    { id: 'villa-del-rosario', label: 'Villa del Rosario', slug: 'villa-del-rosario' }
];

const PROPERTY_TYPES = [
    { id: 'casa', label: 'Casa' },
    { id: 'apartamento', label: 'Apartamento' },
    { id: 'lote', label: 'Lote' },
    { id: 'proyecto', label: 'Proyecto' },
    { id: 'local', label: 'Local' },
    { id: 'oficina', label: 'Oficina' },
    { id: 'bodega', label: 'Bodega' },
    { id: 'finca', label: 'Finca' },
    { id: 'comercial', label: 'Comercial' }
];

interface SearchBarV3Props {
    variant?: 'hero' | 'compact';
}

export default function SearchBarV3({ variant = 'hero' }: SearchBarV3Props) {
    const router = useRouter();
    const params = useParams();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [operacion, setOperacion] = useState<'venta' | 'arriendo'>('venta');
    const [ciudad, setCiudad] = useState('');
    const [barrio, setBarrio] = useState('');
    const [tipo, setTipo] = useState('');
    const [habitaciones, setHabitaciones] = useState('');
    const [precioMin, setPrecioMin] = useState('');
    const [precioMax, setPrecioMax] = useState('');

    const [availableBarrios, setAvailableBarrios] = useState<{ nombre: string; slug: string }[]>([]);
    const [isLoadingBarrios, setIsLoadingBarrios] = useState(false);

    // Pre-fill from URL
    useEffect(() => {
        const nextOperacion: 'venta' | 'arriendo' = pathname.includes('/arriendo') ? 'arriendo' : 'venta';
        setOperacion((prev) => (prev === nextOperacion ? prev : nextOperacion));

        const paramCiudad = typeof params.ciudad === 'string' ? params.ciudad : '';
        const paramTipo = typeof params.tipo === 'string' ? params.tipo : '';

        let nextCiudad = '';
        let nextTipo = '';

        if (paramCiudad) {
            const isCity = CITIES.some(c => c.slug === paramCiudad);
            const isType = PROPERTY_TYPES.some(t => t.id === paramCiudad);

            if (isCity) {
                nextCiudad = paramCiudad;
            } else if (isType) {
                nextTipo = paramCiudad;
            }
        }

        if (paramTipo) {
            nextTipo = paramTipo;
        }

        setCiudad((prev) => (prev === nextCiudad ? prev : nextCiudad));
        setTipo((prev) => (prev === nextTipo ? prev : nextTipo));

        const barrioQuery = searchParams.get('barrio') || '';
        const habsQuery = searchParams.get('habitaciones') || '';
        const precioMinQuery = searchParams.get('precioMin') || '';
        const precioMaxQuery = searchParams.get('precioMax') || '';

        setBarrio((prev) => (prev === barrioQuery ? prev : barrioQuery));
        setHabitaciones((prev) => (prev === habsQuery ? prev : habsQuery));
        setPrecioMin((prev) => (prev === precioMinQuery ? prev : precioMinQuery));
        setPrecioMax((prev) => (prev === precioMaxQuery ? prev : precioMaxQuery));
    }, [params.ciudad, params.tipo, pathname, searchParams]);

    // Fetch barrios when city changes
    useEffect(() => {
        if (!ciudad) {
            setAvailableBarrios([]);
            setBarrio('');
            return;
        }

        const fetchBarrios = async () => {
            setIsLoadingBarrios(true);
            try {
                const barrios = await getActiveBarriosByCity(ciudad);
                setAvailableBarrios(barrios);
            } catch (error) {
                console.error('[SearchBar] Error loading barrios:', error);
            } finally {
                setIsLoadingBarrios(false);
            }
        };

        fetchBarrios();
    }, [ciudad]);

    const handleSearch = () => {
        // Build clean SEO URL: /operacion/ciudad/tipo
        let path = `/${operacion}`;

        if (ciudad) {
            path += `/${ciudad}`;
            if (tipo) {
                path += `/${tipo}`;
            }
        } else if (tipo) {
            path += `/${tipo}`;
        }

        // Search params
        const qParams = new URLSearchParams();
        if (barrio) qParams.set('barrio', barrio);
        if (habitaciones) qParams.set('habitaciones', habitaciones);
        if (precioMin) qParams.set('precioMin', precioMin);
        if (precioMax) qParams.set('precioMax', precioMax);

        const queryString = qParams.toString();
        if (queryString) {
            path += `?${queryString}`;
        }

        // GA4 event tracking
        const filterParams: Record<string, string | number> = { operacion };
        if (ciudad) filterParams.ciudad = ciudad;
        if (tipo) filterParams.tipo = tipo;
        if (barrio) filterParams.barrio = barrio;
        if (habitaciones) filterParams.habitaciones = Number(habitaciones);
        if (precioMin) filterParams.precio_min = Number(precioMin);
        if (precioMax) filterParams.precio_max = Number(precioMax);
        trackSearchFilter(filterParams);

        router.push(path);
    };

    const isCompact = variant === 'compact';

    return (
        <div className={`w-full ${isCompact ? 'max-w-none' : 'max-w-6xl md:mx-auto px-4'} z-50`}>
            {/* Main Search Bar Container */}
            <div className={`bg-white ${isCompact ? 'rounded-xl shadow-sm border-slate-100' : 'rounded-3xl md:rounded-[6px] shadow-lg border-slate-100'} border md:border flex flex-col md:flex-row items-stretch p-2 gap-2`}>

                {/* 1. Operation Selector (Toggle) */}
                <div className={`flex bg-slate-50 p-1 ${isCompact ? 'rounded-xl' : 'rounded-2xl md:rounded-[4px]'} md:min-w-[160px]`}>
                    <button
                        onClick={() => setOperacion('venta')}
                        className={`flex-1 px-4 ${isCompact ? 'py-4' : 'py-3'} ${isCompact ? 'rounded-[3px]' : 'rounded-xl md:rounded-[3px]'} text-[11px] font-black uppercase tracking-widest transition-all ${operacion === 'venta'
                            ? 'bg-white text-brand shadow-sm border border-slate-100'
                            : 'text-slate-500 hover:text-slate-600'
                            }`}
                    >
                        Venta
                    </button>
                    <button
                        onClick={() => setOperacion('arriendo')}
                        className={`flex-1 px-4 ${isCompact ? 'py-4' : 'py-3'} ${isCompact ? 'rounded-[3px]' : 'rounded-xl md:rounded-[3px]'} text-[11px] font-black uppercase tracking-widest transition-all ${operacion === 'arriendo'
                            ? 'bg-white text-brand shadow-sm border border-slate-100'
                            : 'text-slate-500 hover:text-slate-600'
                            }`}
                    >
                        Arriendo
                    </button>
                </div>

                {/* 2. City Selector */}
                <div className="relative flex-1 group min-w-[130px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <MapPin className="w-4 h-4 text-slate-500 group-focus-within:text-brand transition-colors" />
                    </div>
                    <select
                        value={ciudad}
                        onChange={(e) => setCiudad(e.target.value)}
                        aria-label="Seleccionar ciudad"
                        className={`w-full pl-11 pr-10 ${isCompact ? 'py-4' : 'py-4'} bg-transparent text-slate-900 font-bold text-sm appearance-none focus:outline-none cursor-pointer border-r border-slate-100 md:border-r`}
                    >
                        <option value="">Ciudad</option>
                        {CITIES.map(c => (
                            <option key={c.id} value={c.slug}>{c.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-300" />
                    </div>
                </div>

                {/* 3. Barrio Selector (Dynamic) */}
                <div className="relative flex-1 group min-w-[140px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Map className={`w-4 h-4 transition-colors ${!ciudad ? 'text-slate-200' : 'text-slate-500 group-focus-within:text-brand'}`} />
                    </div>
                    <select
                        value={barrio}
                        onChange={(e) => setBarrio(e.target.value)}
                        disabled={!ciudad || isLoadingBarrios}
                        aria-label="Seleccionar barrio"
                        className={`w-full pl-11 pr-10 ${isCompact ? 'py-4' : 'py-4'} bg-transparent text-slate-900 font-bold text-sm appearance-none focus:outline-none cursor-pointer border-r border-slate-100 md:border-r disabled:cursor-not-allowed disabled:text-slate-300`}
                    >
                        <option value="">{isLoadingBarrios ? 'Cargando...' : 'Barrio (Opcional)'}</option>
                        {availableBarrios.map(b => (
                            <option key={b.slug} value={b.slug}>{b.nombre}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className={`w-4 h-4 ${!ciudad ? 'text-slate-200' : 'text-slate-300'}`} />
                    </div>
                </div>

                {/* 4. Type Selector */}
                <div className="relative flex-1 group min-w-[140px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Building2 className="w-4 h-4 text-slate-500 group-focus-within:text-brand transition-colors" />
                    </div>
                    <select
                        value={tipo}
                        onChange={(e) => setTipo(e.target.value)}
                        aria-label="Seleccionar tipo de inmueble"
                        className={`w-full pl-11 pr-10 ${isCompact ? 'py-4' : 'py-4'} bg-transparent text-slate-900 font-bold text-sm appearance-none focus:outline-none cursor-pointer last:border-0 md:border-r border-slate-100`}
                    >
                        <option value="">Tipo Inmueble</option>
                        {PROPERTY_TYPES.map(t => (
                            <option key={t.id} value={t.id}>{t.label}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-300" />
                    </div>
                </div>

                {/* 5. Bedrooms Selector */}
                <div className="relative flex-1 group min-w-[120px]">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <Bed className="w-4 h-4 text-slate-500 group-focus-within:text-brand transition-colors" />
                    </div>
                    <select
                        value={habitaciones}
                        onChange={(e) => setHabitaciones(e.target.value)}
                        aria-label="Seleccionar número de habitaciones"
                        className={`w-full pl-11 pr-10 ${isCompact ? 'py-2' : 'py-4'} bg-transparent text-slate-900 font-bold text-sm appearance-none focus:outline-none cursor-pointer last:border-0 md:border-r border-slate-100`}
                    >
                        <option value="">Habitaciones</option>
                        <option value="1">1+</option>
                        <option value="2">2+</option>
                        <option value="3">3+</option>
                        <option value="4">4+</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ChevronDown className="w-4 h-4 text-slate-300" />
                    </div>
                </div>

                {/* 6. Price Range (Min - Max) */}
                <div className="relative flex-1 group min-w-[200px] flex gap-1 px-2">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">$</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={precioMin}
                            onChange={(e) => setPrecioMin(e.target.value)}
                            placeholder="Min"
                            aria-label="Precio mínimo"
                            min="0"
                            step="1000000"
                            className={`w-full pl-7 pr-2 ${isCompact ? 'py-4' : 'py-4'} bg-transparent text-slate-900 font-bold text-sm focus:outline-none placeholder:text-slate-300 placeholder:font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                    </div>
                    <span className="self-center text-slate-300 font-bold text-xs">-</span>
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400 pointer-events-none">$</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={precioMax}
                            onChange={(e) => setPrecioMax(e.target.value)}
                            placeholder="Max"
                            aria-label="Precio máximo"
                            min="0"
                            step="1000000"
                            className={`w-full pl-7 pr-2 ${isCompact ? 'py-4' : 'py-4'} bg-transparent text-slate-900 font-bold text-sm focus:outline-none placeholder:text-slate-300 placeholder:font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                        />
                    </div>
                </div>

                {/* 6. Search Button */}
                <button
                    onClick={handleSearch}
                    className={`bg-brand text-white ${isCompact ? 'px-6 py-4' : 'px-8 py-4 md:py-0'} ${isCompact ? 'rounded-[4px]' : 'rounded-xl md:rounded-[4px]'} font-black text-[11px] uppercase tracking-[0.2em] hover:bg-brand-700 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group min-w-[120px]`}
                >
                    <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    {isCompact ? 'Filtrar' : 'Buscar'}
                </button>
            </div>

        </div>
    );
}
