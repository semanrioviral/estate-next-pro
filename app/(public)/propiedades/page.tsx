import { Metadata } from "next";
import { getProperties } from "@/lib/supabase/properties";
import PropertyCard from "@/components/PropertyCard";
import Breadcrumbs from "@/components/Breadcrumbs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Catálogo de Propiedades | TucasaLosPatios",
    description: "Explora nuestra amplia oferta de casas, apartamentos y lotes en venta en Cúcuta, Los Patios y Villa del Rosario. Tu hogar ideal está aquí.",
    alternates: {
        canonical: "/propiedades",
    },
};

export default async function PropiedadesPage() {
    const properties = await getProperties();

    return (
        <div className="mx-auto max-w-7xl px-6 pt-32 pb-24">
            <Breadcrumbs items={[{ label: "Propiedades" }]} />

            <div className="mt-12 mb-20">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-3xl">
                        <span className="text-[#fb2c36] font-black uppercase tracking-[0.2em] text-sm mb-4 block">
                            Inventario Exclusivo
                        </span>
                        <h1 className="text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-7xl uppercase leading-[0.9] mb-8">
                            Nuestro <br />
                            <span className="text-gradient">Catálogo</span>
                        </h1>
                        <p className="text-xl text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                            Explora las propiedades más exclusivas y verificadas en el área metropolitana de Cúcuta.
                            Filtra por tus preferencias y encuentra tu próximo hogar hoy mismo.
                        </p>
                    </div>
                </div>

                {/* Modern Filter Interface (Abstract/visual only for now) */}
                <div className="mt-16 glass rounded-[2.5rem] p-4 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-1 w-full bg-white dark:bg-zinc-900/50 rounded-2xl px-6 py-4 border border-zinc-100 dark:border-zinc-800 flex items-center gap-4 group">
                        <svg className="w-5 h-5 text-zinc-400 group-focus-within:text-[#fb2c36] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar por barrio o ciudad..."
                            className="bg-transparent border-none outline-none w-full text-zinc-900 dark:text-zinc-100 font-semibold placeholder:text-zinc-400"
                        />
                    </div>

                    <div className="hidden lg:flex items-center gap-4 px-4">
                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>
                        <select className="bg-transparent border-none outline-none font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                            <option>Tipo de Inmueble</option>
                            <option>Casas</option>
                            <option>Apartamentos</option>
                            <option>Lotes</option>
                        </select>
                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800"></div>
                        <select className="bg-transparent border-none outline-none font-bold text-zinc-600 dark:text-zinc-400 cursor-pointer">
                            <option>Rango de Precio</option>
                        </select>
                    </div>

                    <button className="w-full md:w-auto bg-[#fb2c36] text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:bg-[#fb2c36] hover:scale-105 active:scale-95 shadow-xl shadow-[#fb2c36]/20">
                        Filtrar propiedades
                    </button>
                </div>
            </div>

            {properties.length > 0 ? (
                <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {properties.map((property, index) => (
                        <PropertyCard
                            key={property.id}
                            property={property}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-dashed border-zinc-200 dark:border-zinc-800">
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg">
                        Estamos actualizando nuestro catálogo. ¡Vuelve pronto!
                    </p>
                </div>
            )}

            {/* Empty State / Pagination (Placeholder) */}
            {properties.length > 0 && (
                <div className="mt-24 pt-12 border-t border-zinc-100 dark:border-zinc-800 flex flex-col items-center">
                    <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mb-8">Mostrando {properties.length} inmuebles verificados</p>
                    <button className="glass px-8 py-3 rounded-full text-zinc-900 dark:text-zinc-100 font-black text-xs uppercase tracking-widest hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all">
                        Cargar más propiedades
                    </button>
                </div>
            )}
        </div>
    );
}

