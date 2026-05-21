import React from 'react';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import {
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    Car,
    ChevronRight,
    ChevronLeft,
    Phone,
    Star,
    Check
} from 'lucide-react';
import { getPropertyBySlug, getAllPropertySlugs, getSimilarProperties, getPopularInBarrio, getTrendingProperties, recordPropertyView, getWeeklyViews, getAveragePriceByBarrio, getAdjacentProperties, Property } from '@/lib/supabase/properties';
import { generatePropertySEO, generatePropertyJSONLD } from '@/lib/seo/generatePropertySEO';
import PropertyGallery from '@/components/PropertyGallery';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import ExpandableText from '@/components/ExpandableText';
import MobileStickyCTA from '@/components/MobileStickyCTA';
import TrackedWhatsappButton from '@/components/tracking/TrackedWhatsappButton';
import VolverResultados from '@/components/VolverResultados';
import { SITE_URL } from '@/lib/supabase/constants';

const PropertyViewTracker = dynamic(() => import('@/components/PropertyViewTracker'));
const RecentlyViewed = dynamic(() => import('@/components/RecentlyViewed'));
const ExploreAlso = dynamic(() => import('@/components/ExploreAlso'));
const RetentionModal = dynamic(() => import('@/components/RetentionModal'));
const MetaPixelViewContent = dynamic(() => import('@/components/tracking/MetaPixelViewContent'));

function slugify(text: string) {
    return text
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}

interface Props {
    params: Promise<{ slug: string }>;
}

const getPropertyBySlugCached = cache(async (slug: string) => getPropertyBySlug(slug));

const getDetailPageData = unstable_cache(
    async (propertyId: string, barrioId: string | null, tipo: string, precio: number) => {
        const [similarProperties, popularInBarrio, trendingProperties, weeklyViews, avgPriceBarrio] =
            await Promise.all([
                getSimilarProperties(propertyId, barrioId || undefined, tipo, precio),
                barrioId ? getPopularInBarrio(barrioId, 3) : ([] as Property[]),
                getTrendingProperties(7, 3),
                getWeeklyViews(propertyId),
                barrioId ? getAveragePriceByBarrio(barrioId) : null,
            ]);
        return { similarProperties, popularInBarrio, trendingProperties, weeklyViews, avgPriceBarrio };
    },
    ['property-detail-data'],
    { revalidate: 300 }
);

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
    const slugs = await getAllPropertySlugs();
    return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const property = await getPropertyBySlugCached(slug);

    if (!property) return { title: 'Propiedad no encontrada' };

    const siteUrl = SITE_URL;

    const seo = generatePropertySEO(property, { siteUrl });

    return {
        title: { absolute: seo.title },
        description: seo.description,
        alternates: seo.alternates,
        openGraph: seo.openGraph,
        twitter: seo.twitter,
        other: {
            'googlebot': 'index, follow, max-image-preview:large',
        },
    };
}

export default async function PropertyDetailPage({ params }: Props) {
    const { slug } = await params;
    const property = await getPropertyBySlugCached(slug);

    const siteUrl = SITE_URL;

    if (!property) {
        notFound();
    }

    const getAbsoluteUrl = (path: string) => path.startsWith('http') ? path : `${siteUrl}${path}`;
    const propertyUrl = `${siteUrl}/propiedades/${property.slug}`;

    const formattedPrice = property.precio.toLocaleString("es-CO");
    const priceDisplay = property.operacion === 'arriendo' ? `$${formattedPrice} / mes` : `$${formattedPrice}`;
    const operationText = property.operacion === 'venta' ? 'Venta' : 'Arriendo';
    const parkingMeta = (property.servicios || []).find((service) => /^parqueaderos?:\s*\d+/i.test(service));
    const parkingCount = parkingMeta ? Number(parkingMeta.match(/\d+/)?.[0] || 0) : 0;
    const parkingDisplay = parkingCount > 0
        ? String(parkingCount)
        : (property.servicios?.some((service) => service.toLowerCase().includes('parqueadero')) ? 'Si' : '--');
    const displayServicios = (property.servicios || []).filter((service) => !/^parqueaderos?:\s*\d+/i.test(service));
    const assignedAgentName = property.agente_nombre_publico?.trim() || property.agente_nombre?.trim() || 'Equipo de Ventas';
    const assignedAgentPhoto = property.agente_foto_url?.trim() || '';
    const assignedAgentInitials = assignedAgentName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('') || 'EV';
    const descriptionText = property.descripcion?.trim() || '';
    const descriptionPreviewLimit = 340;
    const hasLongDescription = descriptionText.length > descriptionPreviewLimit;
    const descriptionPreview = hasLongDescription
        ? `${descriptionText.slice(0, descriptionPreviewLimit).trimEnd()}...`
        : descriptionText;
    const descriptionRest = hasLongDescription
        ? descriptionText.slice(descriptionPreviewLimit).trimStart()
        : '';

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '3223047435';

    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0] : 'anonymous';

    recordPropertyView(property.id, clientIp);

    const { similarProperties, popularInBarrio, trendingProperties, weeklyViews, avgPriceBarrio } =
        await getDetailPageData(
            property.id,
            property.barrio_id || null,
            property.tipo,
            property.precio
        );

    const { prev: prevSlug, next: nextSlug } = await getAdjacentProperties(property.id, property.operacion);

    const whatsappMessage = `Hola, estoy interesado en la propiedad:
${property.titulo}.
Precio: $${formattedPrice} COP
Operación: ${operationText}
Referencia: ${propertyUrl}

¿Podrías darme más información?`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    const callUrl = `tel:+57${phoneNumber}`;

    const propertyImages = Array.from(
        new Set([property.imagen_principal, ...(property.galeria || [])].filter(Boolean))
    );

    const jsonLd = generatePropertyJSONLD(property, siteUrl);

    return (
        <main className="bg-white min-h-screen pb-24 md:pb-20">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <PropertyViewTracker propertyId={property.id} />
            <MetaPixelViewContent
                contentIds={[property.id]}
                contentType="product"
                value={property.precio}
                currency="COP"
            />

            {/* Breadcrumb - Institutional Style (visible all breakpoints) */}
            <div className="bg-gray-50 border-b border-gray-200 py-2 md:py-3">
                <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8">
                    {/* Mobile: simplified nav with Volver + prev/next icons */}
                    <div className="flex md:hidden items-center justify-between min-h-[44px]">
                        <VolverResultados
                            mobileFallbackHref={`/${property.operacion}`}
                            mobileFallbackLabel={`Volver a ${operationText}`}
                        />
                        {/* Prev / Next Mobile inline */}
                        <div className="flex items-center gap-1.5">
                            {prevSlug ? (
                                <Link
                                    href={`/propiedades/${prevSlug}`}
                                    className="p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100/80 transition-all"
                                    aria-label="Propiedad anterior"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </Link>
                            ) : (
                                <span className="p-2 rounded-xl text-slate-200 cursor-not-allowed">
                                    <ChevronLeft className="w-5 h-5" />
                                </span>
                            )}
                            {nextSlug ? (
                                <Link
                                    href={`/propiedades/${nextSlug}`}
                                    className="p-2 rounded-xl text-slate-500 hover:text-brand hover:bg-slate-100/80 transition-all"
                                    aria-label="Propiedad siguiente"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            ) : (
                                <span className="p-2 rounded-xl text-slate-200 cursor-not-allowed">
                                    <ChevronRight className="w-5 h-5" />
                                </span>
                            )}
                        </div>
                    </div>
                    {/* Desktop: full breadcrumb path + contextual "Volver a resultados" */}
                    <div className="hidden md:flex items-center justify-between">
                        <nav className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                            <Link href="/" className="hover:text-brand transition-colors">Inicio</Link>
                            <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
                            <Link href={`/${property.operacion}`} className="hover:text-brand transition-colors">{operationText}</Link>
                            <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
                            <Link href={`/${slugify(property.ciudad)}`} className="hover:text-brand transition-colors">{property.ciudad}</Link>
                            <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
                            <span className="text-gray-900 truncate max-w-[200px]">{property.titulo}</span>
                        </nav>
                        <VolverResultados />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:px-4 lg:px-8 py-0 md:py-12">
                <div className="px-3 sm:px-4 md:px-0">
                    {/* 1. MOBILE ONLY: HERO GALLERY AT TOP */}
                    <div className="md:hidden mb-4 -mx-3 sm:-mx-4">
                        <PropertyGallery
                            images={[property.imagen_principal, ...(property.galeria || [])]}
                            title={property.titulo}
                            variant="mosaic"
                        />
                    </div>

                    {/* Header Title Section - Anchored */}
                    <div className="mb-5 md:mb-6 pt-1 pb-4 md:pt-0 md:pb-4 space-y-4 md:space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-brand text-white text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                                {operationText}
                            </span>
                            {property.estado && (
                                <span className={`text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded ${property.estado.toLowerCase() === 'disponible'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-500 text-white'
                                    }`}>
                                    {property.estado}
                                </span>
                            )}
                            <span className="bg-slate-100 text-slate-700 text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-slate-200">
                                {property.tipo}
                            </span>
                            {property.etiquetas && property.etiquetas.length > 0 && property.etiquetas.slice(0, 1).map((tag, idx) => (
                                <span key={idx} className="bg-brand/10 text-brand text-[12px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-brand/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-2">
                                    {property.titulo}
                                </h1>
                                <div className="flex items-center text-slate-500 font-semibold text-wrap">
                                    <MapPin className="w-5 h-5 mr-1.5 text-brand shrink-0" />
                                    <span className="text-base">{property.barrio}, {property.ciudad} {property.direccion ? ` | ${property.direccion}` : ''}</span>
                                </div>
                            </div>
                            {/* Mobile Price - Shown only on small screens */}
                            <div className="md:hidden mt-3 flex flex-col gap-1">
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.2em]">Precio de {operationText}</p>
                                <p className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                    {priceDisplay}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column (lg:col-span-2) */}
                        <div className="lg:col-span-2 flex flex-col gap-6 md:gap-8">
                            {/* 2. DESKTOP ONLY: HERO / GALLERY MOSAIC */}
                            <div className="hidden md:block overflow-hidden rounded-lg">
                                <PropertyGallery
                                    images={[property.imagen_principal, ...(property.galeria || [])]}
                                    title={property.titulo}
                                    variant="mosaic"
                                />
                            </div>

                            {/* Description — The Story First */}
                            <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 md:p-8 space-y-4">
                                <h2 className="text-xl lg:text-3xl font-semibold text-slate-900 border-l-2 border-brand-600/60 pl-3 sm:pl-4">
                                    Descripción de la propiedad
                                </h2>
                                {hasLongDescription ? (
                                    <ExpandableText preview={descriptionPreview} rest={descriptionRest} />
                                ) : (
                                    <div className="text-slate-600 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-medium">
                                        {descriptionText}
                                    </div>
                                )}
                            </section>

                            {/* Características y Servicios — Unified Block */}
                            <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 md:p-8 space-y-8">
                                <h2 className="text-xl lg:text-2xl font-semibold text-slate-900 border-l-2 border-brand-600/60 pl-3 sm:pl-4">
                                    Características y Servicios
                                </h2>
                                
                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <Maximize className="h-4 w-4 text-brand" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{property.area_m2} m²</span>
                                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Área total</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <BedDouble className="h-4 w-4 text-brand" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{property.habitaciones || '--'}</span>
                                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Habitaciones</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <Bath className="h-4 w-4 text-brand" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{property.baños || '--'}</span>
                                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Baños</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                                            <Car className="h-4 w-4 text-brand" />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">{parkingDisplay}</span>
                                            <span className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">Parqueadero</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Amenities — only if they exist */}
                                {displayServicios.length > 0 && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Servicios incluidos</h3>
                                        <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 ${displayServicios.length > 10 ? 'max-h-60 overflow-y-auto pr-1' : ''}`}>
                                            {displayServicios.map((amenity, index) => (
                                                <div key={index} className="flex items-start gap-2.5 group rounded-md border border-slate-100 bg-slate-50/40 px-2.5 py-2">
                                                    <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center border border-slate-200 group-hover:bg-brand/5 group-hover:border-brand/10 transition-colors shrink-0 mt-0.5">
                                                        <Check className="h-2.5 w-2.5 text-brand/70 group-hover:text-brand" />
                                                    </div>
                                                    <span className="text-slate-600 font-medium text-sm tracking-tight leading-snug">{amenity}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Technical Details — only if they exist */}
                                {(property.medidas_lote || property.tipo_uso || property.financiamiento) && (
                                    <div className="pt-6 border-t border-slate-100">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Detalles técnicos y legales</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
                                            {property.medidas_lote && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Medidas del Lote</span>
                                                    <span className="text-slate-900 font-semibold">{property.medidas_lote}</span>
                                                </div>
                                            )}
                                            {property.tipo_uso && (
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Uso</span>
                                                    <span className="text-slate-900 font-semibold capitalize">{property.tipo_uso}</span>
                                                </div>
                                            )}
                                            {property.financiamiento && (
                                                <div className="flex flex-col gap-1 md:col-span-2">
                                                    <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Financiamiento / Información Adicional</span>
                                                    <span className="text-slate-600 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed italic">
                                                        {property.financiamiento}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Location Section — Compact & Editorial */}
                            <section className="rounded-lg border border-slate-200 bg-white p-5 sm:p-6 md:p-8">
                                <div className="flex items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900 mb-2">
                                            <MapPin className="h-4 w-4 text-brand inline mr-2 -mt-0.5" />
                                            {property.barrio}, {property.ciudad}
                                        </h2>
                                        <p className="text-sm text-slate-500 font-medium">
                                            Ubicación exacta compartida de manera privada por seguridad.
                                        </p>
                                    </div>
                                    <TrackedWhatsappButton
                                        url={whatsappUrl}
                                        className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shrink-0"
                                    >
                                        Contactar
                                    </TrackedWhatsappButton>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Editorial Sidebar — Desktop Only */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-28">
                                <div className="bg-white rounded-xl border border-slate-200 p-8 space-y-8">
                                    {/* Price — Editorial & Dominant */}
                                    <div className="text-center">
                                        <div className="text-4xl lg:text-5xl font-bold text-slate-900 tracking-tighter leading-none mb-3">
                                            {priceDisplay}
                                        </div>
                                        <div className="flex items-center justify-center gap-3 text-sm text-slate-500 font-medium">
                                            <span>{property.area_m2} m²</span>
                                            <span className="text-slate-300">·</span>
                                            <span>{Math.round(property.precio / property.area_m2).toLocaleString()} / m²</span>
                                        </div>
                                        {property.negociable && (
                                            <p className="mt-3 text-xs font-bold text-emerald-600 uppercase tracking-wider">
                                                Precio Negociable
                                            </p>
                                        )}
                                    </div>

                                    {/* CTAs — Clear Hierarchy */}
                                    <div className="space-y-3">
                                        <TrackedWhatsappButton
                                            url={whatsappUrl}
                                            className="w-full bg-slate-900 text-white h-14 rounded-xl font-semibold text-sm hover:bg-slate-800 transition-colors active:scale-[0.98] flex items-center justify-center gap-2 tracking-wide"
                                        >
                                            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                            Contactar
                                        </TrackedWhatsappButton>

                                        <a
                                            href={callUrl}
                                            className="w-full flex items-center justify-center gap-2 py-2 text-slate-500 text-xs font-medium tracking-wide hover:text-brand transition-colors"
                                        >
                                            <Phone className="h-3.5 w-3.5" />
                                            Llamar
                                        </a>
                                    </div>

                                    {/* Agent — Human & Editorial */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-4">
                                            {assignedAgentPhoto ? (
                                                <div className="relative h-12 w-12 rounded-full overflow-hidden bg-slate-100 shrink-0">
                                                    <Image
                                                        src={assignedAgentPhoto}
                                                        alt={assignedAgentName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm tracking-wider shrink-0">
                                                    {assignedAgentInitials}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-semibold text-slate-900">{assignedAgentName}</div>
                                                <div className="flex items-center gap-0.5 mt-0.5">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* --- PREV / NEXT NAVIGATION (Desktop + Mobile) --- */}
            <div className="max-w-7xl mx-auto px-3 md:px-4 lg:px-8 mt-8 md:mt-12">
                <div className="flex items-center justify-between border-t border-b border-slate-200 py-4 md:py-6">
                    {/* Anterior */}
                    <div className="flex-1 min-w-0">
                        {prevSlug ? (
                            <Link
                                href={`/propiedades/${prevSlug}`}
                                className="inline-flex items-center gap-2 md:gap-2.5 text-sm font-semibold text-slate-700 hover:text-brand transition-colors group"
                            >
                                <ChevronLeft className="w-5 h-5 shrink-0 group-hover:-translate-x-1 transition-transform" />
                                <span className="truncate">Anterior</span>
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-2 md:gap-2.5 text-sm font-semibold text-slate-300 cursor-not-allowed">
                                <ChevronLeft className="w-5 h-5 shrink-0" />
                                <span>Anterior</span>
                            </span>
                        )}
                    </div>
                    {/* Label — hidden on mobile, visible md+ */}
                    <div className="hidden md:block text-[12px] font-bold text-slate-500 uppercase tracking-widest px-4 select-none">
                        Navegar propiedades
                    </div>
                    {/* Siguiente */}
                    <div className="flex-1 flex justify-end min-w-0">
                        {nextSlug ? (
                            <Link
                                href={`/propiedades/${nextSlug}`}
                                className="inline-flex items-center gap-2 md:gap-2.5 text-sm font-semibold text-slate-700 hover:text-brand transition-colors group"
                            >
                                <span className="truncate">Siguiente</span>
                                <ChevronRight className="w-5 h-5 shrink-0 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-2 md:gap-2.5 text-sm font-semibold text-slate-300 cursor-not-allowed">
                                <span>Siguiente</span>
                                <ChevronRight className="w-5 h-5 shrink-0" />
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* --- EXPLORAR MÁS PROPIEDADES --- */}
            <section className="bg-white py-12 md:py-20 mt-8 border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="mb-8 md:mb-12">
                        <h2 className="text-2xl lg:text-3xl font-semibold text-slate-900 mb-3">
                            Explorar más propiedades
                        </h2>
                        <p className="text-slate-500 text-sm md:text-lg font-medium">
                            Inmuebles similares en {property.barrio}, {property.ciudad}
                        </p>
                    </div>

                    <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
                        {similarProperties.map((item, index) => (
                            <div key={item.property.id} className="min-w-[85%] snap-start md:min-w-0">
                                <PropertyCardV3
                                    property={item.property}
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {popularInBarrio && popularInBarrio.length > 0 && (
                        <>
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-[0.2em] mt-12 md:mt-16 mb-5">
                                Destacados en {property.barrio}
                            </h3>
                            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
                                {popularInBarrio.map((prop) => (
                                    <div key={prop.id} className="min-w-[85%] snap-start md:min-w-0">
                                        <PropertyCardV3 property={prop} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="text-center mt-10">
                        <Link
                            href="/propiedades"
                            className="inline-flex items-center gap-2 text-slate-900 font-bold hover:text-brand transition-colors group bg-white px-6 py-3 rounded-2xl border border-slate-200 shadow-sm"
                        >
                            Ver todo el inventario
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <RecentlyViewed currentPropertyId={property.id} />
                <div className="mt-10 pt-10 md:mt-20 md:pt-20 border-t border-slate-100">
                    <ExploreAlso currentOperacion={property.operacion as 'venta' | 'arriendo'} currentSlug={slugify(property.ciudad)} />
                </div>
            </div>

            <MobileStickyCTA whatsappUrl={whatsappUrl} callUrl={callUrl} price={priceDisplay} />
            <RetentionModal ciudad={property.ciudad} />
        </main>
    );
}
