import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/data/properties';

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
        <div className="group bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
            {/* Imagen */}
            <div className="relative aspect-[16/9] overflow-hidden">
                <Image
                    src={property.imagen_principal}
                    alt={property.titulo}
                    fill
                    priority={priority}
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4">
                    <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider border border-zinc-200/50 dark:border-zinc-700/50">
                        {property.tipo}
                    </span>
                </div>
            </div>

            {/* Contenido */}
            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {property.titulo}
                    </h3>
                </div>

                <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-4 flex items-center">
                    <svg className="w-4 h-4 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {property.barrio}, {property.ciudad}
                </p>

                <div className="flex items-center space-x-4 mb-6 text-zinc-600 dark:text-zinc-300 text-sm">
                    {property.tipo !== 'lote' && (
                        <>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-1.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span className="font-medium">{property.habitaciones}</span>
                            </div>
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-1.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v20c0 4.418 7.163 8 16 8s16-3.582 16-8V14M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m-32 0v14c0 4.418 7.163 8 16 8s16-3.582 16-8V14" />
                                </svg>
                                {/* SVG simplificado para baño */}
                                <svg className="w-5 h-5 mr-1.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4h16v16H4V4z" />
                                </svg>
                                <span className="font-medium">{property.baños}</span>
                            </div>
                        </>
                    )}
                    <div className="flex items-center">
                        <svg className="w-5 h-5 mr-1.5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className="font-medium">{property.area_m2} m²</span>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-5">
                    <div className="flex flex-col">
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Precio</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
                            {formattedPrice}
                        </span>
                    </div>
                    <Link
                        href={`/propiedades/${property.slug}`}
                        className="inline-flex items-center justify-center bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 shadow-lg shadow-zinc-200 dark:shadow-none"
                    >
                        Detalles
                    </Link>
                </div>
            </div>
        </div>
    );
}
