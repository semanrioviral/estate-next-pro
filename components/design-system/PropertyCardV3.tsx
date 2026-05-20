import Link from 'next/link';
import { MapPin, Bed, Bath, Square, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { optimizeCloudinaryUrl } from '@/lib/supabase/seo-helpers';

interface Property {
    id: string;
    titulo: string;
    slug: string;
    precio: number;
    operacion: string;
    tipo: string;
    ciudad: string;
    barrio?: string;
    habitaciones?: number;
    baños?: number;
    area_m2?: number;
    imagen_principal: string;
}

interface PropertyCardV3Props {
    property: Property;
    priority?: boolean;
    variant?: 'default' | 'homepage';
}

export default function PropertyCardV3({ property, priority = false, variant = 'default' }: PropertyCardV3Props) {
    const formattedPrice = new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
    }).format(property.precio);

    // V19 Title Optimization
    const optimizedTitle = property.titulo
        .replace(/en venta/gi, '')
        .replace(/en arriendo/gi, '')
        .replace(/\s+/g, ' ')
        .trim();

    return (
        <div className="group/card relative bg-white rounded-xl border border-slate-200/60 overflow-visible transition-all duration-250 ease-in-out h-[480px] lg:h-[490px] flex flex-col shadow-sm hover:border-brand-300/40 lg:hover:border-brand-200 lg:hover:scale-[1.02] lg:hover:shadow-md">

            {/* 0. Ethereal Top Light (Atmospheric Highlight) */}
            <div className="absolute inset-x-0 -top-[1px] h-[1px] bg-gradient-to-r from-transparent via-white/80 to-transparent z-40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

            {/* Full Card Link Wrapper - Integrated Interaction */}
            <Link
                href={`/propiedades/${property.slug}`}
                className="absolute inset-0 z-10"
                aria-label={`Ver información de ${optimizedTitle}`}
            />

            {/* 1. Media Carrier - 16:9 Ratio with fixed dimensions to prevent CLS */}
            <div 
                className="relative w-full rounded-t-xl overflow-hidden block transition-all duration-500 ease-out"
                style={{ aspectRatio: '16/9', minHeight: '200px' }}
            >
                <Image
                    src={variant === 'homepage'
                        ? property.imagen_principal.replace('/upload/', '/upload/f_webp,q_50,w_400/')
                        : optimizeCloudinaryUrl(property.imagen_principal)}
                    alt={optimizedTitle}
                    fill
                    priority={variant === 'homepage' ? false : priority}
                    loading={variant === 'homepage' ? 'lazy' : undefined}
                    className="object-cover transition-transform duration-700 lg:group-hover/card:scale-[1.03]"
                    sizes={variant === 'homepage' ? '(max-width: 768px) 50vw, 33vw' : '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'}
                    style={{ objectFit: 'cover' }}
                    unoptimized={variant === 'homepage'}
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-20 flex gap-1.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-widest border border-slate-200">
                        {property.operacion || 'VENTA'}
                    </span>
                </div>

                {/* Subtle Brand Overlay */}
                <div className="absolute inset-0 bg-slate-950/10 opacity-0 group-hover/card:opacity-10 transition-opacity pointer-events-none"></div>
            </div>

            {/* 2. Content Section - Editorial Spacing */}
            <div className="p-5 pt-5 flex flex-col flex-grow relative z-20 bg-white rounded-b-xl">

                {/* 2.1 Price - Connected to Media */}
                <div className="mb-2">
                    <span className="text-[24px] font-bold text-slate-900 tracking-tighter flex items-baseline gap-1 leading-none">
                        {formattedPrice}
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-tighter">COP</span>
                    </span>
                </div>

                {/* 2.2 Title - Professional Contrast */}
                <h3 className="text-[15px] font-semibold text-slate-900 leading-snug line-clamp-2 mb-3 antialiased !text-[15px]">
                    {optimizedTitle}
                </h3>

                {/* 2.3 Location - Secondary Scanner */}
                <div className="flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[13px] font-medium text-slate-500 uppercase tracking-tight truncate">
                        {property.barrio ? `${property.barrio}, ` : ''}{property.ciudad}
                    </span>
                </div>

                {/* 3. Technical Attributes - Editorial Density */}
                <div className="flex flex-col border-t border-slate-100/60 transition-all duration-500 group-hover/card:border-slate-200">
                    <div className="flex items-center justify-center gap-6 py-4 px-0.5">
                        {property.habitaciones ? (
                            <div className="flex items-center gap-1.5 grayscale opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                                <Bed className="w-4 h-4 text-slate-600 group-hover/card:text-brand-600 transition-colors" />
                                <span className="text-[13px] font-bold text-slate-800">{property.habitaciones}</span>
                            </div>
                        ) : null}
                        {property.baños ? (
                            <div className="flex items-center gap-1.5 grayscale opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                                <Bath className="w-4 h-4 text-slate-600 group-hover/card:text-brand-600 transition-colors" />
                                <span className="text-[13px] font-bold text-slate-800">{property.baños}</span>
                            </div>
                        ) : null}
                        {property.area_m2 ? (
                            <div className="flex items-center gap-1.5 grayscale opacity-70 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all">
                                <Square className="w-4 h-4 text-slate-600 group-hover/card:text-brand-600 transition-colors" />
                                <span className="text-[13px] font-bold text-slate-800">{Math.round(property.area_m2)}m²</span>
                            </div>
                        ) : null}
                    </div>

                    {/* V24 Desktop-only Additional Line: Fade-in suave */}
                    <div className="hidden lg:block h-0 overflow-hidden group-hover/card:h-5 transition-all duration-300">
                        <p className="text-[12px] text-slate-600 font-medium text-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ease-in-out pb-2">
                            Zona residencial de alta valorización
                        </p>
                    </div>
                </div>

                {/* 4. Single Focused CTA — Editorial & Refined */}
                <div className="mt-auto pt-2">
                    <div className="relative z-30">
                        <Link
                            href={`/propiedades/${property.slug}`}
                            className="w-full h-10 bg-brand hover:bg-brand-700 text-white text-[13px] font-semibold uppercase rounded-[6px] flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98] tracking-wider"
                        >
                            Ver inmueble
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
