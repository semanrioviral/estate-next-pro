import React from 'react';
import { cache } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
    MapPin,
    BedDouble,
    Bath,
    Maximize,
    Car,
    CheckCircle2,
    Calendar,
    ChevronRight,
    MessageCircle,
    Phone,
    Star,
    ShieldCheck,
    Award,
    Share2,
    Check
} from 'lucide-react';
import { getPropertyBySlug, getSimilarProperties, getPopularInBarrio, getTrendingProperties, recordPropertyView, getWeeklyViews, getAveragePriceByBarrio, Property } from '@/lib/supabase/properties';
import PropertyGallery from '@/components/PropertyGallery';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import LeadCaptureForm from '@/components/LeadCaptureForm';
import PropertyViewTracker from '@/components/PropertyViewTracker';
import RecentlyViewed from '@/components/RecentlyViewed';
import ExploreAlso from '@/components/ExploreAlso';
import MobileStickyCTA from '@/components/MobileStickyCTA';
import RetentionModal from '@/components/RetentionModal';
import MetaPixelViewContent from '@/components/tracking/MetaPixelViewContent';
import TrackedWhatsappButton from '@/components/tracking/TrackedWhatsappButton';

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

export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const property = await getPropertyBySlugCached(slug);

    if (!property) return { title: 'Propiedad no encontrada' };

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';
    const propertyUrl = `${siteUrl}/propiedades/${property.slug}`;
    const absoluteImage = property.imagen_principal.startsWith('http')
        ? property.imagen_principal
        : `${siteUrl}${property.imagen_principal}`;

    const title = property.meta_titulo || `${property.titulo} | Inmobiliaria Premium`;
    const description = property.meta_descripcion || property.descripcion.substring(0, 160);

    return {
        title,
        description,
        alternates: {
            canonical: propertyUrl,
        },
        openGraph: {
            title,
            description,
            url: propertyUrl,
            siteName: "Inmobiliaria Tucasa Los Patios",
            locale: "es_CO",
            images: [
                {
                    url: absoluteImage,
                    width: 1200,
                    height: 630,
                    alt: property.titulo,
                },
            ],
            type: "article",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [absoluteImage],
        },
    };
}

export default async function PropertyDetailPage({ params }: Props) {
    const { slug } = await params;
    const property = await getPropertyBySlugCached(slug);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.tucasalospatios.com';

    if (!property) {
        redirect('/venta');
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

    const [similarProperties, popularInBarrio, trendingProperties, weeklyViews, avgPriceBarrio] = await Promise.all([
        getSimilarProperties(
            property.id,
            property.barrio_id || undefined,
            property.tipo,
            property.precio
        ),
        property.barrio_id ? getPopularInBarrio(property.barrio_id, 3) : Promise.resolve([] as Property[]),
        getTrendingProperties(7, 3),
        getWeeklyViews(property.id),
        property.barrio_id ? getAveragePriceByBarrio(property.barrio_id) : Promise.resolve(null)
    ]);

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

    const jsonLd: any = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "@id": `${propertyUrl}#product`,
                "name": property.titulo,
                "description": property.descripcion,
                "url": propertyUrl,
                "image": propertyImages.map((img) => getAbsoluteUrl(img)),
                "brand": {
                    "@type": "Organization",
                    "name": "Inmobiliaria Tucasa Los Patios"
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.ciudad,
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO"
                },
                "category": `${property.tipo} en venta`,
                ...(property.precio ? {
                    "offers": {
                        "@type": "Offer",
                        "price": property.precio,
                        "priceCurrency": "COP",
                        "availability": "https://schema.org/InStock",
                        "url": propertyUrl,
                        "seller": {
                            "@type": "RealEstateAgent",
                            "name": "Inmobiliaria Tucasa Los Patios"
                        }
                    }
                } : {}),
                "additionalProperty": [
                    ...(property.habitaciones ? [{
                        "@type": "PropertyValue",
                        "name": "Habitaciones",
                        "value": property.habitaciones
                    }] : []),
                    ...(property.baños ? [{
                        "@type": "PropertyValue",
                        "name": "Baños",
                        "value": property.baños
                    }] : []),
                    ...(property.area_m2 ? [{
                        "@type": "PropertyValue",
                        "name": "Área construida",
                        "value": (property as any).area ?? property.area_m2,
                        "unitCode": "MTK"
                    }] : [])
                ]
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${propertyUrl}#breadcrumb`,
                "itemListElement": [
                    { "@type": "ListItem", "position": 1, "name": "Inicio", "item": siteUrl },
                    { "@type": "ListItem", "position": 2, "name": "Venta", "item": `${siteUrl}/venta` },
                    { "@type": "ListItem", "position": 3, "name": property.titulo, "item": propertyUrl }
                ]
            }
        ]
    };

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

            {/* Breadcrumb - Institutional Style */}
            <div className="bg-gray-50 border-b border-gray-100 py-3 hidden md:block">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <nav className="flex items-center text-[11px] font-medium text-gray-500 uppercase tracking-wider">
                        <Link href="/" className="hover:text-brand transition-colors">Inicio</Link>
                        <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
                        <Link href={`/${property.operacion}`} className="hover:text-brand transition-colors">{operationText}</Link>
                        <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
                        <Link href={`/${slugify(property.ciudad)}`} className="hover:text-brand transition-colors">{property.ciudad}</Link>
                        <ChevronRight className="w-3 h-3 mx-2 text-gray-300" />
                        <span className="text-gray-900 truncate max-w-[200px]">{property.titulo}</span>
                    </nav>
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:px-4 lg:px-8 py-0 md:py-12">
                <div className="px-3 sm:px-4 md:px-0">
                    {/* 1. MOBILE ONLY: HERO GALLERY AT TOP */}
                    <div className="md:hidden mb-5 -mx-3 sm:-mx-4">
                        <PropertyGallery
                            images={[property.imagen_principal, ...(property.galeria || [])]}
                            title={property.titulo}
                            variant="mosaic"
                        />
                    </div>

                    {/* Header Title Section - Anchored */}
                    <div className="mb-5 md:mb-8 pt-1 pb-4 md:pt-0 md:pb-6 md:border-b border-slate-200 space-y-4 md:space-y-6">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                                ID: {property.id.toString().slice(0, 8)}
                            </span>
                            <span className="bg-brand text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                                {operationText}
                            </span>
                            {property.estado && (
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded ${property.estado.toLowerCase() === 'disponible'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-zinc-500 text-white'
                                    }`}>
                                    {property.estado}
                                </span>
                            )}
                            <span className="bg-gray-100 text-gray-900 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded">
                                {property.tipo}
                            </span>
                            {property.etiquetas && property.etiquetas.length > 0 && property.etiquetas.map((tag, idx) => (
                                <span key={idx} className="bg-brand/10 text-brand text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-brand/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex-1">
                                <h1 className="text-[1.65rem] sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-2">
                                    {property.titulo}
                                </h1>
                                <div className="flex items-center text-zinc-500 font-semibold text-wrap">
                                    <MapPin className="w-5 h-5 mr-1.5 text-brand shrink-0" />
                                    <span className="text-base">{property.barrio}, {property.ciudad} {property.direccion ? ` | ${property.direccion}` : ''}</span>
                                </div>
                            </div>
                            {/* Mobile Price - Shown only on small screens */}
                            <div className="md:hidden mt-3 flex flex-col gap-1">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Precio de {operationText}</p>
                                <p className="text-4xl font-black text-zinc-900 tracking-tighter leading-none">
                                    {priceDisplay}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        {/* Left Column (lg:col-span-2) */}
                        <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
                            {/* 2. DESKTOP ONLY: HERO / GALLERY MOSAIC */}
                            <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200 bg-white p-2">
                                <PropertyGallery
                                    images={[property.imagen_principal, ...(property.galeria || [])]}
                                    title={property.titulo}
                                    variant="mosaic"
                                />
                            </div>

                            {/* 4. Characteristics Card */}
                            <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 space-y-5">
                                <div className="space-y-5">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-900 border-l-4 border-brand-600 pl-3 sm:pl-4">
                                        Características principales
                                    </h2>
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                            <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                                <Maximize className="h-4 w-4 text-brand" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{property.area_m2} m²</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Área total</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                            <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                                <BedDouble className="h-4 w-4 text-brand" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{property.habitaciones || '--'}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Habitaciones</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                            <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                                <Bath className="h-4 w-4 text-brand" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{property.baños || '--'}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Baños</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center text-center gap-2 rounded-lg border border-slate-200 py-3 sm:py-4 px-2">
                                            <div className="h-9 w-9 rounded-full bg-red-50 flex items-center justify-center border border-red-100">
                                                <Car className="h-4 w-4 text-brand" />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-lg sm:text-xl font-semibold text-zinc-900 tracking-tight">{parkingDisplay}</span>
                                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parqueadero</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* 5. Description Section */}
                            <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 space-y-4">
                                <h2 className="text-xl lg:text-3xl font-semibold text-zinc-900 border-l-4 border-brand-600 pl-3 sm:pl-4">
                                    Descripción de la propiedad
                                </h2>
                                {hasLongDescription ? (
                                    <>
                                        <div className="text-zinc-600 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-medium">
                                            {descriptionPreview}
                                        </div>
                                        <details className="group">
                                            <summary className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-zinc-700 cursor-pointer list-none hover:bg-slate-50 transition-colors">
                                                <span className="group-open:hidden">Leer más</span>
                                                <span className="hidden group-open:inline">Leer menos</span>
                                            </summary>
                                            <div className="mt-3 text-zinc-600 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-medium">
                                                {descriptionRest}
                                            </div>
                                        </details>
                                    </>
                                ) : (
                                    <div className="text-zinc-600 leading-relaxed text-sm sm:text-base md:text-lg whitespace-pre-line font-medium">
                                        {descriptionText}
                                    </div>
                                )}
                            </section>

                            {/* 6. Amenities */}
                            {displayServicios.length > 0 && (
                                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 space-y-4">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-900 border-l-4 border-brand-600 pl-3 sm:pl-4">
                                        Amenidades y Servicios
                                    </h2>
                                    <div className={`grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 ${displayServicios.length > 10 ? 'max-h-60 overflow-y-auto pr-1' : ''}`}>
                                        {displayServicios.map((amenity, index) => (
                                            <div key={index} className="flex items-start gap-2.5 group rounded-md border border-slate-100 bg-slate-50/40 px-2.5 py-2">
                                                <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center border border-slate-200 group-hover:bg-brand/5 group-hover:border-brand/10 transition-colors shrink-0 mt-0.5">
                                                    <Check className="h-2.5 w-2.5 text-brand/70 group-hover:text-brand" />
                                                </div>
                                                <span className="text-zinc-600 font-medium text-sm tracking-tight leading-snug">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* 7. Technical and Legal Details */}
                            {(property.medidas_lote || property.tipo_uso || property.financiamiento) && (
                                <section className="rounded-lg border border-slate-200 bg-white p-4 sm:p-5 md:p-6 space-y-5">
                                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-zinc-900 border-l-4 border-brand-600 pl-3 sm:pl-4">
                                        Detalles Técnicos y Legales
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-10">
                                        {property.medidas_lote && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medidas del Lote</span>
                                                <span className="text-zinc-900 font-semibold">{property.medidas_lote}</span>
                                            </div>
                                        )}
                                        {property.tipo_uso && (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tipo de Uso</span>
                                                <span className="text-zinc-900 font-semibold capitalize">{property.tipo_uso}</span>
                                            </div>
                                        )}
                                        {property.financiamiento && (
                                            <div className="flex flex-col gap-1 md:col-span-2">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Financiamiento / Información Adicional</span>
                                                <span className="text-zinc-600 font-medium bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed italic">
                                                    {property.financiamiento}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </section>
                            )}

                            {/* 6. Location Section - Integrated & Clean */}
                            <section className="rounded-lg border border-slate-200 bg-white p-6 space-y-6">
                                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                    <h2 className="text-xl lg:text-2xl font-semibold text-zinc-900 border-l-4 border-brand-600 pl-4">
                                        Ubicación Estratégica
                                    </h2>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                        <MapPin className="h-3 w-3 text-brand" />
                                        Exacta bajo solicitud
                                    </div>
                                </div>

                                <div className="aspect-[21/9] w-full rounded-lg overflow-hidden border border-slate-200 bg-white group relative">
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale opacity-[0.03]" />
                                    <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                                        <div className="text-center max-w-md">
                                            <div className="h-12 w-12 bg-brand/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-brand/10">
                                                <MapPin className="h-6 w-6 text-brand" />
                                            </div>
                                            <h3 className="text-xl font-bold text-zinc-900 mb-2">{property.barrio}, {property.ciudad}</h3>
                                            <p className="text-zinc-500 text-sm leading-relaxed mb-6 font-medium">
                                                La ubicación exacta es compartida de manera privada por motivos de seguridad y privacidad.
                                            </p>
                                            <button className="bg-zinc-900 text-white px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95">
                                                Agendar visita física
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN: Sticky Sidebar (1/3) - Hidden on Mobile */}
                        <aside className="hidden lg:block lg:col-span-1">
                            <div className="sticky top-28 space-y-6">
                                {/* Conversion Card Authority */}
                                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden p-6 space-y-6">
                                    {/* Price and Operation */}
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">
                                                Precio de {operationText}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                                Activo hoy
                                            </div>
                                        </div>
                                        <div className="pb-6 border-b border-slate-200 text-center">
                                            <div className="text-4xl lg:text-5xl font-black text-zinc-900 tracking-tighter leading-none mb-2">
                                                {priceDisplay}
                                                {property.negociable && (
                                                    <span className="block mt-2 text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em]">
                                                        ¡Precio Negociable!
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-center gap-3 text-zinc-500 text-sm font-bold uppercase tracking-tight">
                                                <div className="flex items-center gap-1.5">
                                                    <Maximize className="h-4 w-4 text-brand" />
                                                    <span>{property.area_m2} m²</span>
                                                </div>
                                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-[11px]">{Math.round(property.precio / property.area_m2).toLocaleString()} / m²</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* CTAs - WhatsApp Priority */}
                                    <div className="space-y-3 pt-2">
                                        <TrackedWhatsappButton
                                            url={whatsappUrl}
                                            className="w-full bg-[#25D366] text-white h-14 rounded-lg font-black text-base hover:bg-[#1ebe5d] transition-colors active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider"
                                        >
                                            <MessageCircle className="h-5 w-5 fill-current" />
                                            WhatsApp
                                        </TrackedWhatsappButton>

                                        <Link
                                            href={callUrl}
                                            className="w-full h-12 flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-zinc-900 font-extrabold text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95"
                                        >
                                            <Phone className="h-3.5 w-3.5 text-zinc-400" />
                                            Llamar ahora
                                        </Link>
                                    </div>

                                    {/* Agent Card */}
                                    <div className="pt-8 border-t border-zinc-100">
                                        <div className="flex items-center gap-4 mb-6">
                                            {assignedAgentPhoto ? (
                                                <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-brand/5 border-2 border-brand/10 shadow-sm">
                                                    <Image
                                                        src={assignedAgentPhoto}
                                                        alt={assignedAgentName}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-14 w-14 rounded-2xl bg-brand/5 border-2 border-brand/10 shadow-sm flex items-center justify-center text-brand font-black text-sm tracking-wider">
                                                    {assignedAgentInitials}
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-bold text-zinc-900">{assignedAgentName}</div>
                                                <div className="text-[10px] text-brand font-black uppercase tracking-widest">Inmobiliaria Premium</div>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {[1, 2, 3, 4, 5].map((s) => (
                                                        <Star key={s} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-[11px] text-zinc-400 leading-relaxed italic font-medium">
                                            Estamos listos para ayudarte a encontrar el hogar de tus sueños. Consultanos sin compromiso.
                                        </p>
                                    </div>

                                    {/* Trust Indicators */}
                                    <div className="grid grid-cols-3 gap-2 pt-6 border-t border-zinc-50">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center mb-1 border border-zinc-100">
                                                <ShieldCheck className="h-4 w-4 text-brand" />
                                            </div>
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Verificado</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center mb-1 border border-zinc-100">
                                                <CheckCircle2 className="h-4 w-4 text-brand" />
                                            </div>
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Legal</span>
                                        </div>
                                        <div className="flex flex-col items-center text-center">
                                            <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center mb-1 border border-zinc-100">
                                                <Award className="h-4 w-4 text-brand" />
                                            </div>
                                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter">Premium</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Share & Report */}
                                <div className="flex items-center justify-between px-4 mt-6 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                                    <button className="hover:text-brand transition-colors flex items-center gap-1.5">
                                        <Share2 className="h-3.5 w-3.5" />
                                        Compartir
                                    </button>
                                    <button className="hover:text-red-500 transition-colors">
                                        Reportar error
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </div>

            {/* --- SIMILAR PROPERTIES SECTION --- */}
            <div className="bg-white py-10 md:py-16 mt-8 md:mt-12 border-t border-zinc-100">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 mb-6 md:mb-12">
                        <div className="space-y-2 md:space-y-4">
                            <h2 className="text-2xl lg:text-3xl font-semibold text-zinc-900 border-l-4 border-brand-600 pl-4">
                                Inmuebles similares en esta zona
                            </h2>
                            <p className="text-zinc-500 text-sm md:text-lg font-medium">Explora inmuebles con características similares en {property.barrio}</p>
                        </div>
                        <Link
                            href="/propiedades"
                            className="inline-flex items-center gap-2 text-zinc-900 font-bold hover:text-brand transition-colors group bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm"
                        >
                            Ver todo el inventario
                            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
                        {similarProperties.map((item, index) => (
                            <div key={item.property.id} className="min-w-[85%] snap-start md:min-w-0">
                                <PropertyCardV3
                                    property={item.property}
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Barrio Popular Section */}
            {popularInBarrio && popularInBarrio.length > 0 && (
                <section className="py-10 md:py-20 bg-white border-t border-zinc-100">
                    <div className="max-w-7xl mx-auto px-4 lg:px-8">
                        <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-10">
                            <div className="h-1 lg:h-px flex-1 bg-zinc-100" />
                            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-[0.3em] text-center">
                                Destacados en {property.barrio}
                            </h2>
                            <div className="h-1 lg:h-px flex-1 bg-zinc-100" />
                        </div>
                        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 md:grid md:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
                            {popularInBarrio.map((prop) => (
                                <div key={prop.id} className="min-w-[85%] snap-start md:min-w-0">
                                    <PropertyCardV3 property={prop} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            <div className="max-w-7xl mx-auto px-4 lg:px-8">
                <RecentlyViewed />
                <div className="mt-10 pt-10 md:mt-20 md:pt-20 border-t border-zinc-100">
                    <ExploreAlso currentOperacion={property.operacion as 'venta' | 'arriendo'} currentSlug={slugify(property.ciudad)} />
                </div>
            </div>

            <MobileStickyCTA whatsappUrl={whatsappUrl} callUrl={callUrl} price={priceDisplay} />
            <RetentionModal ciudad={property.ciudad} />
        </main>
    );
}
