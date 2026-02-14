import { getProperties } from "@/lib/supabase/properties";
import Link from "next/link";
import Image from "next/image";
import { Plus, Search, MapPin, Building2, ExternalLink, Trash2, Edit } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AdminPropiedades() {
    const properties = await getProperties();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 uppercase">
                        Gestión de <span className="text-red-600">Inmuebles</span>
                    </h1>
                    <p className="text-zinc-500 font-medium">Administra el inventario de propiedades de la plataforma.</p>
                </div>
                <Link
                    href="/admin/propiedades/nuevo"
                    className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-red-500 hover:scale-105 active:scale-95 shadow-xl shadow-red-600/20 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Nuevo Inmueble
                </Link>
            </div>

            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-center bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div className="flex-1 max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-6 py-3 flex items-center gap-3 group focus-within:ring-2 focus-within:ring-red-600 transition-all">
                        <Search size={18} className="text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Buscar por título, barrio o ciudad..."
                            className="bg-transparent border-none outline-none w-full text-zinc-900 dark:text-zinc-100 font-bold placeholder:text-zinc-400 text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Inmueble</th>
                                <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Ubicación</th>
                                <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Precio</th>
                                <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Tipo</th>
                                <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900">Imágenes</th>
                                <th className="px-8 py-5 border-b border-zinc-100 dark:border-zinc-900 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                            {properties.length > 0 ? (
                                properties.map((prop) => (
                                    <tr key={prop.id} className="group hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative h-16 w-20 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                                                    <Image
                                                        src={prop.imagen_principal}
                                                        alt={prop.titulo}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="font-black text-zinc-900 dark:text-zinc-50 text-base leading-tight">
                                                        {prop.titulo}
                                                        {prop.destacado && (
                                                            <span className="ml-2 inline-block bg-red-100 text-red-600 text-[8px] font-black uppercase px-2 py-0.5 rounded-full">Destacado</span>
                                                        )}
                                                    </div>
                                                    <div className="text-zinc-400 text-xs font-bold uppercase tracking-wider mt-1">{prop.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">{prop.barrio}</span>
                                                <span className="text-zinc-400 text-xs font-medium">{prop.ciudad}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-zinc-900 dark:text-zinc-50">
                                                ${prop.precio.toLocaleString('es-CO')}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-black uppercase text-zinc-600 dark:text-zinc-400">
                                                <Building2 size={10} />
                                                {prop.tipo}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            <div className="flex flex-col items-center">
                                                <span className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-[10px] font-black ${prop.galeria && prop.galeria.length > 0 ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'}`}>
                                                    {prop.galeria?.length || 0}
                                                </span>
                                                <span className="text-[8px] font-bold uppercase text-zinc-400 mt-1">fotos</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/propiedades/${prop.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-zinc-400 hover:text-blue-600 transition-colors"
                                                    title="Ver en web"
                                                >
                                                    <ExternalLink size={18} />
                                                </Link>
                                                <button className="p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                                                    <Edit size={18} />
                                                </button>
                                                <button className="p-2 text-zinc-400 hover:text-red-600 transition-colors">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-8 py-20 text-center" colSpan={5}>
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="h-20 w-20 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-200 dark:text-zinc-800">
                                                <Building2 size={40} />
                                            </div>
                                            <div className="max-w-xs mx-auto">
                                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-2">Inventario Vacío</p>
                                                <p className="text-zinc-400 text-sm font-medium">No hay propiedades registradas aún. Las propiedades aparecerán aquí cuando las agregue un agente.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

