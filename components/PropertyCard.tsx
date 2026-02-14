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
                        <span className="text-lg font-black text-[#fb2c36] dark:text-[#fb2c36]">
                            {formattedPrice}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-8">
                <div className="mb-4">
                    <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 leading-tight mb-2 group-hover:text-[#fb2c36] transition-colors line-clamp-1">
                        {property.titulo}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#fb2c36]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.barrio}, {property.ciudad}
                    </p>
                </div>

                {/* Features Grid */}
                {/* ... existing features section ... */}

                <div className="flex items-center justify-between">
                    <div className="hidden sm:flex flex-col">
                        <span className="text-[10px] uppercase tracking-widest font-black text-zinc-400 mb-0.5">Precio</span>
                        <span className="text-2xl font-black text-[#fb2c36] dark:text-[#fb2c36] tracking-tight">
                            {formattedPrice}
                        </span>
                    </div>
                    <Link
                        href={`/propiedades/${property.slug}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 px-8 py-4 rounded-2xl text-sm font-black transition-all hover:bg-[#fb2c36] dark:hover:bg-[#fb2c36] hover:text-white dark:hover:text-white active:scale-95 shadow-xl shadow-zinc-200 dark:shadow-none"
                    >
                        Ver Detalles
                    </Link>
                </div>
            </div>
        </div>
    );
}
