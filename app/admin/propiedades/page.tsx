import { getProperties } from "@/lib/supabase/properties";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Building2, X } from "lucide-react";
import PropertyActions from "@/components/admin/PropertyActions";
import BulkImporter from "@/components/admin/BulkImporter";
import Pagination from "@/components/design-system/Pagination";
import InlineStatusSelect from "@/components/admin/InlineStatusSelect";

export const dynamic = 'force-dynamic';

const ESTADOS = ['', 'Disponible', 'En Venta', 'Vendido', 'Destacado', 'Reservado', 'En Remate'];
const ESTADO_LABELS: Record<string, string> = {
    '': 'Todos',
    'Disponible': 'Disponible',
    'En Venta': 'En Venta',
    'Vendido': 'Vendido',
    'Destacado': 'Destacado',
    'Reservado': 'Reservado',
    'En Remate': 'En Remate',
};

export default async function AdminPropiedades({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; estado?: string }>;
}) {
    const { page: pageParam, q: searchQuery, estado: estadoFilter } = await searchParams;
    const currentPage = Number(pageParam) || 1;
    const itemsPerPage = 24;
    const { properties, totalCount } = await getProperties(undefined, currentPage, itemsPerPage, searchQuery, estadoFilter);

    const hasActiveFilters = searchQuery || estadoFilter;

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                        Gestión de <span className="text-red-600">Inmuebles</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">Administra el inventario de propiedades de la plataforma.</p>
                </div>
                <div className="flex gap-4">
                    <Link
                        href="/admin/propiedades/nuevo"
                        className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-red-500 hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Nuevo Inmueble
                    </Link>
                </div>
            </div>

            <div className="mb-12">
                <BulkImporter />
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                {/* BUSCADOR + FILTROS */}
                <div className="p-6 lg:p-8 border-b border-zinc-50 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 space-y-5">
                    {/* Buscador */}
                    <form method="GET" action="/admin/propiedades" className="flex-1 max-w-2xl">
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-3 group focus-within:ring-2 focus-within:ring-red-600 transition-all shadow-sm">
                            <Search size={18} className="text-zinc-400 shrink-0" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={searchQuery || ''}
                                placeholder="Buscar por título, barrio o ciudad..."
                                className="bg-transparent border-none outline-none w-full text-zinc-900 dark:text-zinc-100 font-bold placeholder:text-zinc-400 text-sm"
                            />
                            {searchQuery && (
                                <Link
                                    href={`/admin/propiedades${estadoFilter ? `?estado=${encodeURIComponent(estadoFilter)}` : ''}`}
                                    className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X size={16} />
                                </Link>
                            )}
                        </div>
                    </form>

                    {/* Tabs de filtro por estado */}
                    <div className="flex flex-wrap items-center gap-2">
                        {ESTADOS.map((estado) => {
                            const isActive = estado === (estadoFilter || '');
                            const href = isActive
                                ? '/admin/propiedades' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '')
                                : `/admin/propiedades${estado ? `?estado=${encodeURIComponent(estado)}` : ''}${searchQuery ? `${estado ? '&' : '?'}q=${encodeURIComponent(searchQuery)}` : ''}`;
                            return (
                                <Link
                                    key={estado || 'todos'}
                                    href={href}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border ${isActive
                                        ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200 dark:shadow-red-900/30'
                                        : 'bg-white dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-red-300 hover:text-red-600'
                                        }`}
                                >
                                    {ESTADO_LABELS[estado]}
                                </Link>
                            );
                        })}

                        {hasActiveFilters && (
                            <Link
                                href="/admin/propiedades"
                                className="px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            >
                                <X size={14} className="inline mr-1" />
                                Limpiar
                            </Link>
                        )}

                        <span className="ml-auto text-xs font-bold text-zinc-400 dark:text-zinc-500">
                            {totalCount} resultado{totalCount !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>

                {/* TABLA */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Inmueble</th>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Ubicación</th>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Precio</th>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Tipo</th>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Estado</th>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Imágenes</th>
                                <th className="px-6 lg:px-8 py-5 border-b border-zinc-100 dark:border-zinc-900 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                            {properties.length > 0 ? (
                                properties.map((prop) => (
                                    <tr key={prop.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-6 lg:px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-14 w-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                    <Image
                                                        src={prop.imagen_principal || '/placeholder.jpg'}
                                                        alt={prop.titulo}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-black text-zinc-900 dark:text-zinc-50 text-sm leading-tight truncate max-w-[200px]">
                                                        {prop.titulo}
                                                        {prop.destacado && (
                                                            <span className="ml-2 inline-block bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">★</span>
                                                        )}
                                                    </div>
                                                    <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider mt-0.5 truncate">{prop.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-700 dark:text-zinc-300 text-xs">{prop.barrio}</span>
                                                <span className="text-zinc-400 text-[11px] font-medium">{prop.ciudad}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5">
                                            <span className="font-black text-zinc-900 dark:text-zinc-50 text-sm">
                                                ${prop.precio.toLocaleString('es-CO')}
                                            </span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[9px] font-black uppercase text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                                                <Building2 size={9} />
                                                {prop.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5">
                                            <InlineStatusSelect
                                                propertyId={prop.id}
                                                currentStatus={prop.estado || 'Disponible'}
                                            />
                                        </td>
                                        <td className="px-6 lg:px-8 py-5 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-[9px] font-black ${prop.galeria && prop.galeria.length > 0 ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                                                    {prop.galeria?.length || 0}
                                                </span>
                                                <span className="text-[7px] font-bold uppercase text-zinc-400 mt-0.5">fotos</span>
                                            </div>
                                        </td>
                                        <td className="px-6 lg:px-8 py-5">
                                            <PropertyActions id={prop.id} slug={prop.slug} />
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-6 lg:px-8 py-16 text-center" colSpan={7}>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-16 w-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-200 dark:text-zinc-800">
                                                <Building2 size={32} />
                                            </div>
                                            <div className="max-w-xs mx-auto">
                                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">
                                                    {hasActiveFilters ? 'Sin Resultados' : 'Inventario Vacío'}
                                                </p>
                                                <p className="text-zinc-400 text-sm font-medium">
                                                    {hasActiveFilters
                                                        ? 'No hay propiedades que coincidan con los filtros aplicados. Intenta con otros términos.'
                                                        : 'No hay propiedades registradas aún. Las propiedades aparecerán aquí cuando las agregue un agente.'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalCount > itemsPerPage && (
                    <div className="p-6 lg:p-8 border-t border-zinc-50 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                        <Pagination
                            totalItems={totalCount}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}

