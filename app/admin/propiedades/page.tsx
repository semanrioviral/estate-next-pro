import { getProperties } from "@/lib/supabase/properties";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, Building2, X, Edit, Trash2, ExternalLink, MapPin, DollarSign, ImageIcon, ChevronRight } from "lucide-react";
import PropertyActions from "@/components/admin/PropertyActions";
import BulkImporter from "@/components/admin/BulkImporter";
import Pagination from "@/components/design-system/Pagination";
import InlineStatusSelect from "@/components/admin/InlineStatusSelect";
import AdminBreadcrumbs from "@/components/admin/AdminBreadcrumbs";

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

const STATUS_COLORS: Record<string, string> = {
    'Disponible': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'En Venta': 'bg-blue-50 text-blue-700 border-blue-200',
    'Vendido': 'bg-zinc-100 text-zinc-500 border-zinc-200',
    'Destacado': 'bg-amber-50 text-amber-700 border-amber-200',
    'Reservado': 'bg-purple-50 text-purple-700 border-purple-200',
    'En Remate': 'bg-red-50 text-red-700 border-red-200',
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
        <div className="space-y-6">
            <AdminBreadcrumbs items={[{ label: 'Dashboard', href: '/admin' }, { label: 'Propiedades' }]} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                        <span className="text-red-600">Propiedades</span>
                    </h1>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                        {totalCount} inmueble{totalCount !== 1 ? 's' : ''} en inventario
                    </p>
                </div>
                <Link
                    href="/admin/propiedades/nuevo"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-2xl font-bold text-sm hover:bg-red-700 transition-colors active:scale-95 shadow-lg shadow-red-600/20"
                >
                    <Plus size={18} />
                    Nuevo Inmueble
                </Link>
            </div>

            {/* Bulk Import */}
            <BulkImporter />

            {/* Filters Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/60 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-5 space-y-4">
                    {/* Search */}
                    <form method="GET" action="/admin/propiedades">
                        <div className="relative">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                            <input
                                type="text"
                                name="q"
                                defaultValue={searchQuery || ''}
                                placeholder="Buscar por título, barrio o ciudad..."
                                className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-11 pr-12 py-3 text-sm font-medium text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                            />
                            {searchQuery && (
                                <Link
                                    href={`/admin/propiedades${estadoFilter ? `?estado=${encodeURIComponent(estadoFilter)}` : ''}`}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 transition-colors"
                                    aria-label="Limpiar búsqueda"
                                >
                                    <X size={16} />
                                </Link>
                            )}
                        </div>
                    </form>

                    {/* Status Filter Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        {ESTADOS.map((estado) => {
                            const isActive = estado === (estadoFilter || '');
                            const href = isActive
                                ? '/admin/propiedades' + (searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '')
                                : `/admin/propiedades${estado ? `?estado=${encodeURIComponent(estado)}` : ''}${searchQuery ? `${estado ? '&' : '?'}q=${encodeURIComponent(searchQuery)}` : ''}`;
                            return (
                                <Link
                                    key={estado || 'todos'}
                                    href={href}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all duration-150 border ${
                                        isActive
                                            ? 'bg-red-600 text-white border-red-600 shadow-md shadow-red-200'
                                            : 'bg-white dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-red-300 hover:text-red-600'
                                    }`}
                                >
                                    {ESTADO_LABELS[estado]}
                                </Link>
                            );
                        })}
                        {hasActiveFilters && (
                            <Link
                                href="/admin/propiedades"
                                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <X size={13} />
                                Limpiar filtros
                            </Link>
                        )}
                    </div>
                </div>

                {/* ============ MOBILE: Card View ============ */}
                <div className="lg:hidden divide-y divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800">
                    {properties.length > 0 ? properties.map((prop) => (
                        <div key={prop.id} className="p-4 space-y-3">
                            {/* Card Top: Image + Info */}
                            <div className="flex gap-4">
                                <div className="relative h-24 w-32 rounded-xl overflow-hidden shadow-sm shrink-0 bg-zinc-100 dark:bg-zinc-800">
                                    {prop.imagen_principal ? (
                                        <Image
                                            src={prop.imagen_principal}
                                            alt={prop.titulo}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <ImageIcon size={24} className="text-zinc-300 dark:text-zinc-600" />
                                        </div>
                                    )}
                                    {prop.destacado && (
                                        <div className="absolute top-2 left-2 bg-amber-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-sm">
                                            ★
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-snug line-clamp-2">
                                        {prop.titulo}
                                    </h3>
                                    <div className="flex items-center gap-1.5 mt-1.5 text-zinc-500 dark:text-zinc-400 text-xs">
                                        <MapPin size={12} className="shrink-0" />
                                        <span className="truncate">{prop.barrio}, {prop.ciudad}</span>
                                    </div>
                                    <p className="mt-1.5 text-base font-black text-zinc-900 dark:text-zinc-100">
                                        ${prop.precio.toLocaleString('es-CO')}
                                    </p>
                                </div>
                            </div>

                            {/* Card Bottom: Meta + Actions */}
                            <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-50 dark:border-zinc-800/50">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${STATUS_COLORS[prop.estado || 'Disponible'] || STATUS_COLORS['Disponible']}`}>
                                        {prop.estado || 'Disponible'}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[9px] font-bold uppercase border border-zinc-200 dark:border-zinc-700">
                                        <Building2 size={9} />
                                        {prop.tipo}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-400">
                                        {prop.galeria?.length || 0} fotos
                                    </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Link
                                        href={`/propiedades/${prop.slug}`}
                                        target="_blank"
                                        className="p-2 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                        aria-label="Ver en web"
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                    <Link
                                        href={`/admin/propiedades/editar/${prop.id}`}
                                        className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                        aria-label="Editar"
                                    >
                                        <Edit size={16} />
                                    </Link>
                                    {/* Delete is handled by PropertyActions inline */}
                                    <PropertyActions id={prop.id} slug={prop.slug} />
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-10 text-center">
                            <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Building2 size={24} className="text-zinc-300 dark:text-zinc-600" />
                            </div>
                            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                {hasActiveFilters ? 'Sin resultados' : 'Inventario vacío'}
                            </p>
                            <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                                {hasActiveFilters
                                    ? 'No hay propiedades que coincidan con los filtros. Intenta con otros términos.'
                                    : 'No hay propiedades registradas. ¡Crea la primera!'}
                            </p>
                        </div>
                    )}
                </div>

                {/* ============ DESKTOP: Table View ============ */}
                <div className="hidden lg:block overflow-x-auto border-t border-zinc-100 dark:border-zinc-800">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-50/80 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.15em]">
                                <th className="px-6 py-4 font-black">Inmueble</th>
                                <th className="px-6 py-4 font-black">Ubicación</th>
                                <th className="px-6 py-4 font-black">Precio</th>
                                <th className="px-6 py-4 font-black">Tipo</th>
                                <th className="px-6 py-4 font-black">Estado</th>
                                <th className="px-6 py-4 font-black text-center">Fotos</th>
                                <th className="px-6 py-4 font-black text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                            {properties.length > 0 ? (
                                properties.map((prop) => (
                                    <tr key={prop.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-12 w-16 rounded-lg overflow-hidden shadow-sm shrink-0 bg-zinc-100 dark:bg-zinc-800">
                                                    {prop.imagen_principal ? (
                                                        <Image
                                                            src={prop.imagen_principal}
                                                            alt={prop.titulo}
                                                            fill
                                                            className="object-cover"
                                                            sizes="64px"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <ImageIcon size={16} className="text-zinc-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0 max-w-[220px]">
                                                    <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-tight truncate">
                                                        {prop.titulo}
                                                        {prop.destacado && (
                                                            <span className="ml-1.5 inline-block text-amber-500 text-[9px]">★</span>
                                                        )}
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5 truncate">{prop.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-xs">{prop.barrio}</span>
                                                <span className="text-zinc-400 text-[11px]">{prop.ciudad}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">
                                                ${prop.precio.toLocaleString('es-CO')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[9px] font-bold uppercase text-zinc-600 dark:text-zinc-400">
                                                <Building2 size={9} />
                                                {prop.tipo}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <InlineStatusSelect
                                                propertyId={prop.id}
                                                currentStatus={prop.estado || 'Disponible'}
                                            />
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center justify-center h-7 w-7 rounded-full text-[9px] font-bold ${
                                                prop.galeria && prop.galeria.length > 0
                                                    ? 'bg-red-50 text-red-600 border border-red-200'
                                                    : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                                            }`}>
                                                {prop.galeria?.length || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link
                                                    href={`/propiedades/${prop.slug}`}
                                                    target="_blank"
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                                    title="Ver en web"
                                                >
                                                    <ExternalLink size={15} />
                                                </Link>
                                                <Link
                                                    href={`/admin/propiedades/editar/${prop.id}`}
                                                    className="p-2 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={15} />
                                                </Link>
                                                <PropertyActions id={prop.id} slug={prop.slug} />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Building2 size={24} className="text-zinc-300 dark:text-zinc-600" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                                            {hasActiveFilters ? 'Sin resultados' : 'Inventario vacío'}
                                        </p>
                                        <p className="text-xs text-zinc-400 dark:text-zinc-500 max-w-xs mx-auto">
                                            {hasActiveFilters
                                                ? 'No hay propiedades con los filtros actuales.'
                                                : 'Crea tu primera propiedad para empezar.'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalCount > itemsPerPage && (
                    <div className="p-4 sm:p-6 border-t border-zinc-100 dark:border-zinc-800">
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
