import React from 'react';
import { cache } from 'react';
import { unstable_cache } from 'next/cache';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, permanentRedirect } from 'next/navigation';
import { headers } from 'next/headers';
import {
    MapPin, BedDouble, Bath, Maximize, Car, ChevronRight, ChevronLeft,
    Phone, Check, CalendarDays, Video, Send, User, Mail, MessageSquare,
} from 'lucide-react';
import { getPropertyBySlug, getPropertyBySlugIncludeInactive, getAllPropertySlugs, getSimilarProperties, getPopularInBarrio, getTrendingProperties, recordPropertyView, getWeeklyViews, getAveragePriceByBarrio, getAdjacentProperties, Property } from '@/lib/supabase/properties';
import { generatePropertySEO, generatePropertyJSONLD } from '@/lib/seo/generatePropertySEO';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import MobileStickyCTA from '@/components/MobileStickyCTA';
import TrackedWhatsappButton from '@/components/tracking/TrackedWhatsappButton';
import { SITE_URL } from '@/lib/supabase/constants';
import PropertyContactForm from '@/components/PropertyContactForm';

const PropertyGallery = dynamic(() => import('@/components/PropertyGallery'), { ssr: true });
const PropertyViewTracker = dynamic(() => import('@/components/PropertyViewTracker'));
const RetentionModal = dynamic(() => import('@/components/RetentionModal'));
const MetaPixelViewContent = dynamic(() => import('@/components/tracking/MetaPixelViewContent'));

function slugify(t: string) { return t.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^\w-]+/g,'').replace(/--+/g,'-').replace(/^-+/,'').replace(/-+$/,''); }
function getVideoEmbedUrl(url: string): string | null {
    try { const u=new URL(url); if(u.hostname.includes('youtube.com')&&u.searchParams.get('v'))return`https://www.youtube.com/embed/${u.searchParams.get('v')}`; if(u.hostname==='youtu.be')return`https://www.youtube.com/embed${u.pathname}`; if(u.hostname.includes('youtube.com')&&u.pathname.startsWith('/embed/'))return url; if(u.hostname==='vimeo.com'||u.hostname==='player.vimeo.com'){const v=u.pathname.replace(/^\/+/,'').split('/')[0];if(v)return`https://player.vimeo.com/video/${v}`;} return null; } catch { return null; }
}

interface Props { params: Promise<{ slug: string }> }
const getPropertyBySlugCached = cache(async (slug: string) => getPropertyBySlug(slug));

const getDetailPageData = unstable_cache(
    async (propertyId: string, barrioId: string | null, tipo: string, precio: number) => {
        const [similarProperties, popularInBarrio, trendingProperties, weeklyViews, avgPriceBarrio] = await Promise.all([
            getSimilarProperties(propertyId, barrioId || undefined, tipo, precio),
            barrioId ? getPopularInBarrio(barrioId, 3) : ([] as Property[]),
            getTrendingProperties(7, 3),
            getWeeklyViews(propertyId),
            barrioId ? getAveragePriceByBarrio(barrioId) : null,
        ]);
        return { similarProperties, popularInBarrio, trendingProperties, weeklyViews, avgPriceBarrio };
    }, ['property-detail-data'], { revalidate: 300 }
);

export const revalidate = 300;
export const dynamicParams = true;
export async function generateStaticParams() { const slugs = await getAllPropertySlugs(); return slugs.map(slug=>({slug})); }
export async function generateMetadata({ params }: Props) {
    const { slug } = await params;
    const property = await getPropertyBySlugCached(slug);
    if (!property) {
        const inactiveProperty = await getPropertyBySlugIncludeInactive(slug);
        if (inactiveProperty) {
            return { title: 'Propiedad no disponible', robots: { index: false, follow: true } };
        }
        return { title: 'Propiedad no encontrada' };
    }
    const seo = generatePropertySEO(property, { siteUrl: SITE_URL });
    return { title: { absolute: seo.title }, description: seo.description, alternates: seo.alternates, openGraph: seo.openGraph, twitter: seo.twitter, other: { 'googlebot': 'index, follow, max-image-preview:large' } };
}

export default async function PropertyDetailPage({ params }: Props) {
    const { slug } = await params;
    const property = await getPropertyBySlugCached(slug);
    if (!property) {
        const inactiveProperty = await getPropertyBySlugIncludeInactive(slug);
        if (inactiveProperty) {
            permanentRedirect('/propiedades');
        }
        notFound();
    }

    const siteUrl = SITE_URL;
    const propertyUrl = `${siteUrl}/propiedades/${property.slug}`;
    const currencyLocale = property.moneda === 'USD' ? 'en-US' : 'es-CO';
    const formattedPrice = property.precio.toLocaleString(currencyLocale);
    const currencyLabel = property.moneda === 'USD' ? ' USD' : '';
    const priceDisplay = property.operacion === 'arriendo' ? `$${formattedPrice}${currencyLabel} / mes` : `$${formattedPrice}${currencyLabel}`;
    const pricePerM2 = property.area_m2 > 0 ? Math.round(property.precio / property.area_m2).toLocaleString(currencyLocale) : null;
    const operationText = property.operacion === 'venta' ? 'Venta' : 'Arriendo';

    const parkingMeta = (property.servicios || []).find(s => /^parqueaderos?:\s*\d+/i.test(s));
    const parkingFromServicios = parkingMeta ? Number(parkingMeta.match(/\d+/)?.[0] || 0) : 0;
    const hasParkingInServicios = property.servicios?.some(s => s.toLowerCase().includes('parqueadero'));
    const parkingDisplay = property.parqueaderos != null && property.parqueaderos > 0 ? String(property.parqueaderos) : parkingFromServicios > 0 ? String(parkingFromServicios) : hasParkingInServicios ? 'Si' : '--';
    const displayServicios = (property.servicios || []).filter(s => !/^parqueaderos?:\s*\d+/i.test(s));
    const assignedAgentName = property.agente_nombre_publico?.trim() || property.agente_nombre?.trim() || 'Equipo de Ventas';
    const assignedAgentPhoto = property.agente_foto_url?.trim() || '';
    const assignedAgentInitials = assignedAgentName.split(' ').filter(Boolean).slice(0,2).map(p=>p[0]?.toUpperCase()).join('')||'EV';
    const descriptionText = property.descripcion?.trim() || '';

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const phoneNumber = process.env.NEXT_PUBLIC_PHONE_NUMBER || '3223047435';
    const whatsappMessage = `Hola, estoy interesado en la propiedad:\n${property.titulo}.\nPrecio: $${formattedPrice} COP\nOperación: ${operationText}\nReferencia: ${propertyUrl}\n\n¿Podrías darme más información?`;
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
    const callUrl = `tel:+57${phoneNumber}`;

    const headerList = await headers();
    const forwardedFor = headerList.get('x-forwarded-for');
    recordPropertyView(property.id, forwardedFor ? forwardedFor.split(',')[0] : 'anonymous');

    const { similarProperties } = await getDetailPageData(property.id, property.barrio_id || null, property.tipo, property.precio);
    const { prev: prevSlug, next: nextSlug } = await getAdjacentProperties(property.id, property.operacion);
    const allImages = Array.from(new Set([property.imagen_principal, ...(property.galeria || [])].filter(Boolean)));
    const hasTechnicalDetails = property.medidas_lote || property.tipo_uso || property.financiamiento || property.estrato || property.año_construccion || property.antigüedad || property.canon_administracion != null || property.codigo_postal;
    const jsonLd = generatePropertyJSONLD(property, siteUrl);

    return (
        <main className="bg-white min-h-screen pb-24 md:pb-16">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
            <PropertyViewTracker propertyId={property.id} />
            <MetaPixelViewContent contentIds={[property.id]} contentType="product" value={property.precio} currency="COP" />

            {/* ====== GALLERY (NO price overlay) ====== */}
            <PropertyGallery images={allImages} title={property.titulo} />

            {/* ====== BREADCRUMB + HERO ====== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex items-center gap-1.5 pt-5 pb-2 text-xs text-zinc-400 font-medium">
                    <Link href="/" className="hover:text-zinc-600 transition-colors">Inicio</Link><ChevronRight size={11} />
                    <Link href={`/${property.operacion}`} className="hover:text-zinc-600 transition-colors">{operationText}</Link><ChevronRight size={11} />
                    <Link href={`/${slugify(property.ciudad)}`} className="hover:text-zinc-600 transition-colors">{property.ciudad}</Link><ChevronRight size={11} />
                    <span className="text-zinc-500 truncate max-w-[160px]">{property.barrio}</span>
                </nav>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="bg-red-600 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">{operationText}</span>
                    <span className="bg-zinc-100 text-zinc-600 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-200">{property.tipo}</span>
                    {property.estado && property.estado !== 'Disponible' && (
                        <span className="bg-zinc-100 text-zinc-600 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-zinc-200">{property.estado}</span>
                    )}
                    {property.negociable && (
                        <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border border-emerald-200">Negociable</span>
                    )}
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 tracking-tight leading-tight mb-2">{property.titulo}</h1>
                <div className="flex items-center text-zinc-500 font-medium text-sm sm:text-base mb-1">
                    <MapPin size={16} className="mr-1.5 text-red-500 shrink-0" />{property.barrio}, {property.ciudad}{property.direccion ? ` · ${property.direccion}` : ''}
                </div>
                {property.fecha_disponible && (
                    <span className="inline-flex items-center gap-1 text-xs text-zinc-400 font-medium mt-1">
                        <CalendarDays size={12} /> Disponible {new Date(property.fecha_disponible).toLocaleDateString('es-CO',{day:'numeric',month:'long',year:'numeric'})}
                    </span>
                )}

                {/* Mobile Price + Quick CTAs */}
                <div className="lg:hidden mt-5 p-4 bg-zinc-50 rounded-2xl border border-zinc-200/60">
                    <p className="text-2xl font-black text-zinc-900 tracking-tight">$ {formattedPrice}{currencyLabel}</p>
                    {property.operacion === 'arriendo' && <p className="text-xs text-zinc-500 font-medium">por mes</p>}
                    {pricePerM2 && <p className="text-xs text-zinc-400 mt-0.5">$ {pricePerM2} {property.moneda}/m²</p>}
                    {property.negociable && <p className="text-[11px] font-bold text-emerald-600 mt-1 uppercase tracking-wider">Precio negociable</p>}
                    <div className="flex gap-2.5 mt-3">
                        <TrackedWhatsappButton url={whatsappUrl} propertyId={property.id} propertyTitle={property.titulo} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors active:scale-95">
                            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            WhatsApp
                        </TrackedWhatsappButton>
                        <a href={callUrl} className="flex items-center justify-center gap-2 px-5 py-2.5 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-600 uppercase tracking-wider hover:bg-white transition-colors">
                            <Phone size={14} /> Llamar
                        </a>
                    </div>
                </div>
            </div>

            {/* ====== MAIN CONTENT (2-col desktop) ====== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                <div className="lg:grid lg:grid-cols-3 lg:gap-10">
                    {/* LEFT: Content */}
                    <div className="lg:col-span-2 space-y-10">
                        {/* DESCRIPTION */}
                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 border-l-2 border-red-500/60 pl-4">Descripción</h2>
                            <div className="text-zinc-600 leading-relaxed text-[15px] sm:text-base whitespace-pre-line font-medium">
                                {descriptionText}
                            </div>
                        </section>

                        {/* STATS GRID */}
                        <section>
                            <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 border-l-2 border-red-500/60 pl-4">El espacio</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {[{icon:Maximize,value:`${property.area_m2} m²`,label:'Área total'},{icon:BedDouble,value:property.habitaciones||'--',label:'Habitaciones'},{icon:Bath,value:property.baños||'--',label:'Baños'},{icon:Car,value:parkingDisplay,label:'Parqueadero'}].map((s,i)=>(
                                    <div key={i} className="flex flex-col items-center text-center gap-2 bg-zinc-50 rounded-xl py-5 px-3 border border-zinc-100">
                                        <div className="h-11 w-11 rounded-full bg-white flex items-center justify-center border border-zinc-200 shadow-sm"><s.icon size={20} className="text-red-500"/></div>
                                        <span className="text-xl font-bold text-zinc-900">{s.value}</span>
                                        <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">{s.label}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AMENITIES */}
                        {displayServicios.length > 0 && (
                            <section>
                                <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 border-l-2 border-red-500/60 pl-4">Servicios y comodidades</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {displayServicios.map((a,i)=>(
                                        <div key={i} className="flex items-center gap-2.5 bg-zinc-50 rounded-lg px-3.5 py-2.5 border border-zinc-100">
                                            <div className="h-5 w-5 rounded-full bg-red-50 flex items-center justify-center shrink-0"><Check size={11} className="text-red-500"/></div>
                                            <span className="text-sm font-medium text-zinc-700">{a}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* TECHNICAL */}
                        {hasTechnicalDetails && (
                            <section>
                                <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 border-l-2 border-red-500/60 pl-4">Detalles técnicos</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-8 gap-y-4 bg-zinc-50 rounded-xl p-5 border border-zinc-100">
                                    {property.estrato && <Detail label="Estrato" value={String(property.estrato)}/>}
                                    {property.año_construccion && <Detail label="Año construcción" value={String(property.año_construccion)}/>}
                                    {property.antigüedad && <Detail label="Antigüedad" value={property.antigüedad}/>}
                                    {property.canon_administracion != null && <Detail label="Canon admin" value={property.canon_administracion>0?`$${property.canon_administracion.toLocaleString('es-CO')}`:'Sin canon'}/>}
                                    {property.tipo_uso && <Detail label="Tipo de uso" value={property.tipo_uso}/>}
                                    {property.medidas_lote && <Detail label="Medidas lote" value={property.medidas_lote}/>}
                                    {property.codigo_postal && <Detail label="Código postal" value={property.codigo_postal}/>}
                                    {property.financiamiento && <div className="col-span-full mt-1"><span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Financiamiento</span><span className="text-sm text-zinc-600 font-medium">{property.financiamiento}</span></div>}
                                </div>
                            </section>
                        )}

                        {/* VIDEO */}
                        {property.video_url && (
                            <section>
                                <h2 className="text-base sm:text-lg font-bold text-zinc-900 mb-4 border-l-2 border-red-500/60 pl-4 flex items-center gap-2"><Video size={18} className="text-red-500"/>Video Tour</h2>
                                {(()=>{const e=getVideoEmbedUrl(property.video_url!);return e?<div className="relative w-full aspect-video rounded-xl overflow-hidden bg-zinc-100"><iframe src={e} title="Video Tour" className="absolute inset-0 w-full h-full" allowFullScreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" loading="lazy"/></div>:<a href={property.video_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-red-600 font-semibold hover:underline text-sm"><Video size={16}/>Ver video tour externo</a>})()}
                            </section>
                        )}
                    </div>

                    {/* RIGHT: Sticky Sidebar */}
                    <aside className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-28 space-y-4 bg-zinc-50/80 backdrop-blur-sm rounded-2xl p-4 border border-zinc-200/60">
                            {/* Price */}
                            <div>
                                <p className="text-2xl font-black text-zinc-900 tracking-tight">$ {formattedPrice}{currencyLabel}</p>
                                {property.operacion === 'arriendo' && <p className="text-xs text-zinc-500 font-medium">por mes</p>}
                                {pricePerM2 && <p className="text-xs text-zinc-400 font-medium mt-0.5">$ {pricePerM2} {property.moneda}/m²</p>}
                                {property.negociable && <p className="text-[11px] font-bold text-emerald-600 mt-1.5 uppercase tracking-wider">Precio negociable</p>}
                            </div>

                            {/* CTAs */}
                            <div className="space-y-2">
                                <TrackedWhatsappButton url={whatsappUrl} propertyId={property.id} propertyTitle={property.titulo} className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors active:scale-[0.98]">
                                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    WhatsApp
                                </TrackedWhatsappButton>
                                <a href={callUrl} className="w-full flex items-center justify-center gap-2 py-2.5 border border-zinc-300 rounded-xl text-xs font-bold text-zinc-600 uppercase tracking-wider hover:bg-white transition-colors">
                                    <Phone size={14}/> Llamar
                                </a>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-zinc-200/60" />

                            {/* Agent */}
                            <div className="flex items-center gap-2.5">
                                {assignedAgentPhoto ? (
                                    <Image src={assignedAgentPhoto} alt={assignedAgentName} width={36} height={36} className="rounded-full object-cover ring-1 ring-zinc-200 shrink-0" />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">{assignedAgentInitials}</div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-800 truncate">{assignedAgentName}</p>
                                    <p className="text-[10px] text-zinc-400">Asesor inmobiliario</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-zinc-200/60" />

                            {/* Contact Form */}
                            <div>
                                <h3 className="text-xs font-bold text-zinc-700 mb-0.5">¿Te interesa?</h3>
                                <p className="text-[10px] text-zinc-400 mb-3">Déjanos tus datos y te contactamos.</p>
                                <PropertyContactForm propertyId={property.id} propertyTitle={property.titulo} />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* ====== SIMILAR PROPERTIES ====== */}
            {similarProperties.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
                    <div className="flex items-end justify-between mb-6">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-zinc-900">Propiedades similares</h2>
                            <p className="text-sm text-zinc-500 mt-0.5">Inmuebles que podrían interesarte</p>
                        </div>
                        <Link href="/propiedades" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-red-600 transition-colors">Ver catálogo <ChevronRight size={15}/></Link>
                    </div>
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-2 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 sm:overflow-visible sm:pb-0">
                        {similarProperties.slice(0,3).map((item,i)=>(
                            <div key={item.property.id} className="min-w-[82%] sm:min-w-0 snap-start"><PropertyCardV3 property={item.property} priority={i===0}/></div>
                        ))}
                    </div>
                    <div className="text-center mt-6 sm:hidden"><Link href="/propiedades" className="inline-flex items-center gap-1.5 text-sm font-bold text-red-600">Ver todo el catálogo <ChevronRight size={16}/></Link></div>
                </div>
            )}

            {/* ====== PREV / NEXT ====== */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="flex items-stretch gap-3">
                    {prevSlug ? <Link href={`/propiedades/${prevSlug}`} className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all group min-w-0"><ChevronLeft size={20} className="text-zinc-400 group-hover:text-zinc-600 shrink-0 group-hover:-translate-x-0.5 transition-transform"/><div className="min-w-0 text-left"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Anterior</span><p className="text-sm font-semibold text-zinc-700 truncate group-hover:text-zinc-900">Ver propiedad</p></div></Link> : <div className="flex-1"/>}
                    {nextSlug ? <Link href={`/propiedades/${nextSlug}`} className="flex-1 flex items-center justify-end gap-3 p-4 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all group min-w-0"><div className="min-w-0 text-right"><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Siguiente</span><p className="text-sm font-semibold text-zinc-700 truncate group-hover:text-zinc-900">Ver propiedad</p></div><ChevronRight size={20} className="text-zinc-400 group-hover:text-zinc-600 shrink-0 group-hover:translate-x-0.5 transition-transform"/></Link> : <div className="flex-1"/>}
                </div>
            </div>

            <MobileStickyCTA whatsappUrl={whatsappUrl} callUrl={callUrl} price={priceDisplay} propertyId={property.id} propertyTitle={property.titulo} />
            <RetentionModal ciudad={property.ciudad} />
        </main>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return <div><span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{label}</span><p className="text-sm font-semibold text-zinc-800 mt-0.5">{value}</p></div>;
}
