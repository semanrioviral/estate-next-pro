import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/supabase/properties';
import { optimizeCloudinaryUrl } from '@/lib/supabase/seo-helpers';

interface PropertyCardProps {
    property: Property;
    priority?: boolean;
    matchType?: 'barrio' | 'tipo' | 'precio' | 'ninguno';
}

export default function PropertyCard({ property, priority = false, matchType }: PropertyCardProps) {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(property.precio);

    const priceDisplay = property.operacion === 'arriendo' ? `${formattedPrice} / mes` : formattedPrice;

    return (
        <div className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm">
            {/* Image Section - Mandatory 4:3 */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={optimizeCloudinaryUrl(property.imagen_principal)}
                    alt={property.titulo}
                    fill
                    priority={priority}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Status Badge - Top Right */}
                <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider shadow-sm ${property.operacion === 'venta' ? 'bg-[#fb2c36]' : 'bg-green-600'}`}>
                        {property.operacion}
                    </span>
                </div>

                {/* Match type badge */}
                {matchType && matchType !== 'ninguno' && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-zinc-900/90 px-3 py-1 rounded-lg text-[9px] font-black text-white uppercase tracking-wider border border-white/10">
                            {matchType === 'barrio' && 'Mismo Barrio'}
                            {matchType === 'tipo' && 'Mismo Tipo'}
                            {matchType === 'precio' && 'Precio Similar'}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-5 flex flex-col flex-grow">
                <div className="mb-4">
                    <span className="text-[26px] font-black text-[#fb2c36] block leading-tight mb-1">
                        {priceDisplay}
                    </span>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2 mb-2">
                        {property.titulo}
                    </h3>
                    <p className="text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase tracking-tight flex items-center gap-1">
                        <svg className="w-3 h-3 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {property.barrio}
                    </p>
                </div>

                <div className="mt-auto">
                    <Link
                        href={`/propiedades/${property.slug}`}
                        className="w-full inline-flex items-center justify-center bg-[#fb2c36] text-white py-4 rounded-xl text-sm font-black transition-all active:scale-95 shadow-sm"
                    >
                        Ver Detalles
                    </Link>
                </div>
            </div>
        </div>
    );
}
