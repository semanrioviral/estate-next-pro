import Image from 'next/image';
import Link from 'next/link';
import { Property } from '@/lib/supabase/properties';
import { optimizeCloudinaryUrl } from '@/lib/supabase/seo-helpers';
import { MapPin, Bed, Bath, Square } from 'lucide-react';

interface PropertyCardV2Props {
    property: Property;
    priority?: boolean;
    matchType?: 'barrio' | 'tipo' | 'precio' | 'ninguno';
}

export default function PropertyCardV2({ property, priority = false, matchType }: PropertyCardV2Props) {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(property.precio);

    const priceDisplay = property.operacion === 'arriendo' ? `${formattedPrice} / mes` : formattedPrice;

    return (
        <div className="group bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full shadow-sm hover:border-brand/30 transition-all duration-300">
            {/* Image Section - Mandatory 4:3 */}
            <div className="relative aspect-[4/3] overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                <Image
                    src={optimizeCloudinaryUrl(property.imagen_principal)}
                    alt={property.titulo}
                    fill
                    priority={priority}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />

                {/* Status Badge - Fixed Top Left */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black text-white uppercase tracking-wider shadow-sm ${property.operacion === 'venta' ? 'bg-brand' : 'bg-green-600'}`}>
                        {property.operacion}
                    </span>
                </div>

                {/* Match Type (Phase 20 Minimalist Style) */}
                {matchType && matchType !== 'ninguno' && (
                    <div className="absolute bottom-3 left-3 z-10">
                        <span className="bg-zinc-950/80 backdrop-blur-sm px-2 py-1 rounded-md text-[9px] font-bold text-white uppercase tracking-tight border border-white/10">
                            {matchType === 'barrio' && 'Mismo Barrio'}
                            {matchType === 'tipo' && 'Mismo Tipo'}
                            {matchType === 'precio' && 'Precio Similar'}
                        </span>
                    </div>
                )}
            </div>

            {/* Content Section */}
            <div className="p-4 flex flex-col flex-grow">
                <div className="mb-3">
                    <h3 className="text-base font-bold text-text-primary dark:text-zinc-100 line-clamp-2 mb-1 leading-snug">
                        {property.titulo}
                    </h3>
                    <div className="flex items-center text-text-secondary dark:text-zinc-400">
                        <MapPin className="w-3 h-3 mr-1 text-zinc-400" />
                        <span className="text-xs font-medium uppercase tracking-tight">{property.barrio}</span>
                    </div>
                </div>

                {/* Vital Specs Grid - Ultra Minimalist */}
                <div className="flex items-center gap-4 mb-4 py-3 border-y border-zinc-50 dark:border-zinc-800/50">
                    <div className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-bold text-text-primary dark:text-zinc-200">{property.habitaciones || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-bold text-text-primary dark:text-zinc-200">{property.baños || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Square className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="text-xs font-bold text-text-primary dark:text-zinc-200">{property.area_m2}m²</span>
                    </div>
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none mb-1">Precio</span>
                        <span className="text-xl font-black text-brand leading-none">
                            {priceDisplay}
                        </span>
                    </div>

                    <Link
                        href={`/propiedades/${property.slug}`}
                        className="h-10 px-5 inline-flex items-center justify-center bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-lg text-xs font-black transition-all active:scale-95 hover:bg-zinc-800 dark:hover:bg-zinc-100"
                    >
                        Ver más
                    </Link>
                </div>
            </div>
        </div>
    );
}
