import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/supabase/properties';

interface PropertyCardProps {
    property: Property;
    priority?: boolean;
}

export default function PropertyCard({ property, priority = false }: PropertyCardProps) {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(property.precio);

    return (
        <div className="group relative bg-white dark:bg-zinc-900 rounded-[2.5rem] overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_60px_-15px_rgba(59,130,246,0.1)] hover:-translate-y-2">
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={property.imagen_principal}
                    alt={property.titulo}
                    fill
                    priority={priority}
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Badge Overlay */}
                <div className="absolute top-5 left-5 z-10">
                    <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-[0.2em]">
                        {property.tipo}
                    </span>
                </div>

                {/* Price Overlay (Mobile focus) */}
                <div className="absolute bottom-5 right-5 z-10 sm:hidden">
                    <div className="glass px-4 py-2 rounded-2xl">
                        <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                            {formattedPrice}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
                <div className="mb-4">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
                        {property.titulo}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.barrio}, {property.ciudad}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-3 gap-4 py-6 border-y border-zinc-100 dark:border-zinc-800 mb-6">
                    {property.tipo !== 'lote' ? (
                        <>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-zinc-400 dark:text-zinc-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </span>
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{property.habitaciones} Hab</span>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <span className="text-zinc-400 dark:text-zinc-500">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4V4z" />
                                    </svg>
                                </span>
                                <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{property.baños} Baños</span>
                            </div>
                        </>
                    ) : (
                        <div className="col-span-2 flex items-center justify-center gap-2 text-zinc-400">
                            <span className="text-xs font-bold uppercase tracking-wider">Terreno Disponible</span>
                        </div>
                    )}
                    <div className="flex flex-col items-center gap-1">
                        <span className="text-zinc-400 dark:text-zinc-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                            </svg>
                        </span>
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{property.area_m2} m²</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-0.5">Precio</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                            {formattedPrice}
                        </span>
                    </div>
                    <Link
                        href={`/propiedades/${property.slug}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-4 rounded-2xl text-sm font-black transition-all hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                        Ver Detalles
                    </Link>
                </div>
            </div>
        </div>
    );
}
