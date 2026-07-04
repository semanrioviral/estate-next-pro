import { Metadata } from 'next';
import Link from 'next/link';
import {
    TrendingUp, ShieldCheck, Zap, ArrowRight, CheckCircle2,
    BarChart3, MessageCircle, HelpCircle, MapPin, Clock,
    DollarSign, Camera, FileCheck, Megaphone, Home as HomeIcon,
    Users, Award, Target
} from 'lucide-react';
import PropertyOwnerForm from '@/components/PropertyOwnerForm';
import FAQAccordion from '@/components/FAQAccordion';
import { SITE_URL } from '@/lib/supabase/constants';

export const metadata: Metadata = {
    title: {
        absolute: 'Consignar Propiedad en Los Patios y Cúcuta | Tu Casa Inmobiliaria'
    },
    description: '¿Quieres vender tu casa en Los Patios, Cúcuta o Villa del Rosario? Consigna tu propiedad con nosotros: avalúo gratis, marketing profesional y comisión solo al vender. Norte de Santander.',
    alternates: {
        canonical: `${SITE_URL}/consignar-propiedad`,
    },
    openGraph: {
        title: 'Consignar Propiedad en Los Patios y Cúcuta | Tu Casa Inmobiliaria',
        description: 'Consigna tu propiedad con expertos en Norte de Santander. Avalúo gratis, marketing profesional y comisión solo al vender.',
        url: `${SITE_URL}/consignar-propiedad`,
        type: 'website',
        images: [{ url: `${SITE_URL}/images/og-consignar-propiedad.jpg`, width: 1200, height: 630, alt: 'Consignar propiedad en Los Patios y Cúcuta' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Consignar Propiedad en Los Patios y Cúcuta',
        description: 'Avalúo gratis, marketing profesional y comisión solo al vender. Norte de Santander.',
        images: [`${SITE_URL}/images/og-consignar-propiedad.jpg`],
    },
    other: {
        'googlebot': 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    keywords: [
        'consignar propiedad',
        'consignar casa',
        'vender mi casa',
        'consignación inmobiliaria',
        'inmobiliaria Los Patios',
        'vender casa Cúcuta',
        'avalúo gratis',
        'vende tu casa Norte de Santander',
        'con qué inmobiliaria vender',
        'valoración de propiedad',
        'marketing inmobiliario',
        'asesoría legal inmobiliaria',
        'vender casa Villa del Rosario',
        'consignar apartamento',
    ],
};

export default function ConsignarPropiedadPage() {
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '573223047435';
    const siteUrl = SITE_URL;

    const faqs = [
        {
            q: '¿Qué es la consignación de una propiedad?',
            a: 'La consignación es un acuerdo donde un propietario confía su inmueble a una inmobiliaria para que esta se encargue del marketing, la muestra a compradores interesados y la gestión de la venta. El propietario mantiene la propiedad hasta que se firma la escritura de compraventa ante notaría.'
        },
        {
            q: '¿Cuánto cuesta consignar mi propiedad con Tu Casa Inmobiliaria?',
            a: 'No hay costos ocultos ni pagos por adelantado. Solo cobramos una comisión porcentual al momento de concretar la venta exitosa ante notaría. Si no vendemos, no pagas nada.'
        },
        {
            q: '¿En cuánto tiempo puedo vender mi casa en Los Patios?',
            a: 'El tiempo promedio de venta para propiedades bien valoradas en Los Patios, Cúcuta y Villa del Rosario es de 45 a 90 días. Propiedades con precio competitivo y buena presentación pueden venderse en menos de 30 días.'
        },
        {
            q: '¿Cómo determinan el precio de mi propiedad?',
            a: 'Realizamos un avalúo comercial basado en transacciones reales recientes en tu barrio, características del inmueble (área, estrato, edad, acabados), oferta y demanda local, y condiciones del mercado en Norte de Santander.'
        },
        {
            q: '¿Qué documentos necesito para consignar mi propiedad?',
            a: 'Necesitas: certificado de tradición y libertad (no mayor a 30 días), copia del documento de identidad del propietario, certificado de paz y salvo de administración (si aplica), y planos o documentos del inmueble si están disponibles. Te asesoramos en todo el proceso documental.'
        },
        {
            q: '¿Puedo seguir mostrando mi propiedad mientras está consignada?',
            a: 'Sí, pero recomendamos centralizar las visitas a través de nosotros para evitar filtraciones de información, asegurar compradores calificados y mantener un control profesional del proceso de venta.'
        },
        {
            q: '¿Trabajan con propiedades en Cúcuta y Villa del Rosario?',
            a: 'Sí. Aunque nuestra sede principal está en Los Patios, cubrimos todo el área metropolitada de Cúcuta incluyendo Villa del Rosario, Los Patios, San Cayetano y zonas aledañas del Norte de Santander.'
        },
        {
            q: '¿Qué tipos de propiedades aceptan en consignación?',
            a: 'Aceptamos casas, apartamentos, lotes, locales comerciales, oficinas, bodegas y fincas en venta. También gestionamos propiedades en arriendo bajo un esquema de administración de inmuebles.'
        },
    ];

    const benefits = [
        { icon: BarChart3, title: 'Avalúo comercial gratis', text: 'Valoración profesional basada en datos reales del mercado de Los Patios y Cúcuta para fijar un precio que venda rápido.' },
        { icon: Camera, title: 'Fotografía profesional', text: 'Sesión fotográfica de alta calidad y tour virtual 360° que destacan los mejores ángulos de tu propiedad.' },
        { icon: Megaphone, title: 'Marketing digital premium', text: 'Publicación en portales inmobiliarios, redes sociales y campañas pagadas dirigidas a compradores calificados.' },
        { icon: ShieldCheck, title: 'Asesoría legal integral', text: 'Verificación documental, estudio de títulos y acompañamiento jurídico de principio a fin hasta la firma notarial.' },
        { icon: Users, title: 'Filtro de compradores', text: 'Calificamos a cada interesado para que solo visites tu propiedad con compradores reales y capacidad de pago.' },
        { icon: DollarSign, title: 'Comisión solo al vender', text: 'Sin pagos por adelantado, sin costos ocultos. Solo cobramos cuando tu propiedad se vende exitosamente.' },
    ];

    const steps = [
        { number: '01', icon: BarChart3, title: 'Valoración y avalúo', text: 'Visitamos tu propiedad, analizamos el mercado local y definimos un precio competitivo que maximice tu ganancia.' },
        { number: '02', icon: Camera, title: 'Preparación y publicación', text: 'Fotografía profesional, redacción de descripción optimizada y publicación en todos nuestros canales digitales.' },
        { number: '03', icon: Users, title: 'Gestión de compradores', text: 'Filtramos interesados, coordinamos visitas y negociamos las mejores condiciones para ti.' },
        { number: '04', icon: FileCheck, title: 'Cierre y escrituración', text: 'Acompañamiento legal completo hasta la firma ante notaría y entrega de la propiedad al nuevo propietario.' },
    ];

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebPage',
                '@id': `${siteUrl}/consignar-propiedad`,
                'url': `${siteUrl}/consignar-propiedad`,
                'name': 'Consignar Propiedad en Los Patios y Cúcuta',
                'description': 'Consigna tu propiedad con expertos en Norte de Santander. Avalúo gratis, marketing profesional y comisión solo al vender.',
                'inLanguage': 'es-CO',
                'isPartOf': { '@id': `${siteUrl}/#website` },
            },
            {
                '@type': 'Service',
                'name': 'Consignación de propiedades en Los Patios, Cúcuta y Villa del Rosario',
                'serviceType': 'Consignación inmobiliaria',
                'description': 'Servicio de consignación de propiedades que incluye avalúo comercial gratis, fotografía profesional, marketing digital, filtro de compradores calificados, asesoría legal integral y acompañamiento hasta la escrituración.',
                'url': `${siteUrl}/consignar-propiedad`,
                'areaServed': [
                    { '@type': 'City', 'name': 'Los Patios', 'addressRegion': 'Norte de Santander', 'addressCountry': 'CO' },
                    { '@type': 'City', 'name': 'Cúcuta', 'addressRegion': 'Norte de Santander', 'addressCountry': 'CO' },
                    { '@type': 'City', 'name': 'Villa del Rosario', 'addressRegion': 'Norte de Santander', 'addressCountry': 'CO' },
                ],
                'provider': {
                    '@type': 'RealEstateAgent',
                    '@id': `${siteUrl}/#organization`,
                    'name': 'Tu Casa Inmobiliaria',
                    'telephone': '+573223047435',
                    'image': `${siteUrl}/logo.png`,
                    'url': siteUrl,
                    'priceRange': '$$',
                    'address': {
                        '@type': 'PostalAddress',
                        'addressLocality': 'Los Patios',
                        'addressRegion': 'Norte de Santander',
                        'addressCountry': 'CO'
                    },
                    'geo': {
                        '@type': 'GeoCoordinates',
                        'latitude': '7.8386',
                        'longitude': '-72.5039'
                    },
                },
                'offers': {
                    '@type': 'Offer',
                    'description': 'Avalúo comercial gratuito. Comisión solo al vender. Sin pagos por adelantado.',
                    'price': '0',
                    'priceCurrency': 'COP',
                    'availability': 'https://schema.org/InStock',
                },
            },
            {
                '@type': 'FAQPage',
                'mainEntity': faqs.map(faq => ({
                    '@type': 'Question',
                    'name': faq.q,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': faq.a,
                    },
                })),
            },
            {
                '@type': 'BreadcrumbList',
                'itemListElement': [
                    { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': siteUrl },
                    { '@type': 'ListItem', 'position': 2, 'name': 'Consignar Propiedad', 'item': `${siteUrl}/consignar-propiedad` },
                ],
            },
        ],
    };

    return (
        <main className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            {/* ====== HERO ====== */}
            <section className="bg-slate-900 py-20 md:py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-brand/5 blur-[120px] rounded-full translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-brand/5 blur-[100px] rounded-full -translate-x-1/2" />
                <div className="container-wide px-4 relative z-10">
                    <div className="max-w-4xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-6">
                            <TrendingUp className="w-4 h-4 text-brand" />
                            <span className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest">Consignación Inmobiliaria 2026</span>
                        </div>
                        <h1 className="!text-white mb-6">
                            Consigne su Propiedad en <span className="text-brand">Los Patios</span>, Cúcuta y Villa del Rosario
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 font-medium leading-relaxed">
                            Venda su casa con la inmobiliaria líder del Norte de Santander. Avalúo comercial gratis, marketing profesional, filtro de compradores y comisión solo al vender. Sin costos ocultos.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a href="#consignar" className="px-8 md:px-10 py-4 md:py-5 bg-white text-slate-950 rounded-xl font-black text-base md:text-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
                                Consignar mi propiedad <ArrowRight className="w-5 h-5" />
                            </a>
                            <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, quiero consignar mi propiedad. ¿Me pueden dar información?')}`} target="_blank" rel="noopener noreferrer" className="px-8 md:px-10 py-4 md:py-5 bg-brand text-white rounded-xl font-black text-base md:text-lg hover:bg-red-600 transition-colors inline-flex items-center gap-3">
                                <MessageCircle className="w-5 h-5" /> WhatsApp
                            </a>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-12">
                            <div className="flex items-center gap-2 text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold">Avalúo gratis</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold">Sin pagos por adelantado</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                <span className="text-sm font-semibold">Comisión solo al vender</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== BENEFITS ====== */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="text-center mb-12 md:mb-20">
                        <p className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest mb-4">Por qué consignar con nosotros</p>
                        <h2 className="text-zinc-900 mb-4">
                            Ventajas de <span className="text-brand">consignar su propiedad</span> con Tu Casa
                        </h2>
                        <p className="text-base md:text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
                            Maximizamos el valor de su inmueble con una estrategia integral de marketing y ventas.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {benefits.map((benefit, i) => (
                            <div key={i} className="p-8 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-brand/30 transition-all duration-300">
                                <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-zinc-200 flex items-center justify-center mb-6 group-hover:bg-brand group-hover:text-white transition-all duration-300">
                                    <benefit.icon className="w-7 h-7" />
                                </div>
                                <h3 className="text-lg md:text-xl font-black text-zinc-900 mb-3">{benefit.title}</h3>
                                <p className="text-sm md:text-base text-zinc-600 leading-relaxed font-medium">{benefit.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== PROCESS ====== */}
            <section id="proceso" className="py-16 md:py-24 bg-zinc-50 border-t border-zinc-100">
                <div className="container-wide px-4">
                    <div className="text-center mb-12 md:mb-20">
                        <p className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest mb-4">El proceso</p>
                        <h2 className="text-zinc-900 mb-4">
                            Cómo <span className="text-brand">consignar y vender</span> en 4 pasos
                        </h2>
                        <p className="text-base md:text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
                            De la valoración inicial hasta la firma notarial. Un proceso transparente y profesional.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                        {steps.map((step, i) => (
                            <div key={i} className="relative p-8 bg-white rounded-2xl border border-zinc-200 hover:border-brand/30 transition-all duration-300">
                                <div className="text-5xl font-black text-zinc-100 mb-4 leading-none">{step.number}</div>
                                <div className="w-12 h-12 bg-brand/10 rounded-xl flex items-center justify-center mb-5">
                                    <step.icon className="w-6 h-6 text-brand" />
                                </div>
                                <h3 className="text-base md:text-lg font-black text-zinc-900 mb-3">{step.title}</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed font-medium">{step.text}</p>
                                {i < steps.length - 1 && (
                                    <ArrowRight className="hidden lg:block absolute top-1/2 -right-4 w-6 h-6 text-zinc-200" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ====== STATS / AUTHORITY ====== */}
            <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1/2 h-full bg-brand/5 blur-[120px] rounded-full -translate-x-1/2" />
                <div className="container-wide px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        <div>
                            <p className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest mb-4">Resultados reales</p>
                        <h2 className="!text-white mb-8">
                            Liderazgo en el <span className="text-brand">mercado inmobiliario</span> del Norte de Santander
                        </h2>
                            <div className="grid grid-cols-2 gap-8 md:gap-10">
                                <div>
                                    <div className="text-4xl md:text-5xl font-black text-brand mb-2">+450</div>
                                    <div className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-500">Propiedades gestionadas</div>
                                </div>
                                <div>
                                    <div className="text-4xl md:text-5xl font-black text-brand mb-2">45-90</div>
                                    <div className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-500">Días promedio venta</div>
                                </div>
                                <div>
                                    <div className="text-4xl md:text-5xl font-black text-brand mb-2">$0</div>
                                    <div className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-500">Costo inicial</div>
                                </div>
                                <div>
                                    <div className="text-4xl md:text-5xl font-black text-brand mb-2">100%</div>
                                    <div className="text-[11px] md:text-[12px] font-black uppercase tracking-widest text-slate-500">Transparencia legal</div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/5 p-8 md:p-12 rounded-2xl border border-white/10">
                            <blockquote className="text-xl md:text-2xl font-medium italic mb-8 leading-relaxed text-slate-300">
                                &ldquo;Consigné mi casa en Los Patios con Tu Casa y la vendieron en 60 días. El proceso fue completamente transparente, sin estrés y con un precio justo. Recomiendo totalmente sus servicios.&rdquo;
                            </blockquote>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-brand rounded-lg flex items-center justify-center font-black text-white">M</div>
                                <div>
                                    <div className="font-black text-sm text-white">Melissa Ortiz</div>
                                    <div className="text-[11px] uppercase tracking-widest text-slate-500">Vendedora — Los Patios</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== SERVICE AREAS ====== */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="text-center mb-12">
                        <p className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest mb-4">Cobertura</p>
                        <h2 className="text-zinc-900 mb-4">
            Dónde <span className="text-brand">consignamos propiedades</span>
                        </h2>
                        <p className="text-base md:text-lg text-zinc-500 max-w-2xl mx-auto font-medium">
                            Cubrimos el área metropolitana de Cúcuta y todo el Norte de Santander.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                        <Link href="/vender-casa-en-los-patios" className="group p-8 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand/30 transition-all duration-300 text-center">
                            <MapPin className="w-8 h-8 text-brand mx-auto mb-4" />
                            <h3 className="text-lg font-black text-zinc-900 mb-2">Los Patios</h3>
                            <p className="text-sm text-zinc-500 font-medium">Consignar casa en Los Patios, barrios y conjuntos cerrados.</p>
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand mt-4 group-hover:gap-2 transition-all">Ver más <ArrowRight className="w-4 h-4" /></span>
                        </Link>
                        <Link href="/vender-casa-en-cucuta" className="group p-8 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand/30 transition-all duration-300 text-center">
                            <MapPin className="w-8 h-8 text-brand mx-auto mb-4" />
                            <h3 className="text-lg font-black text-zinc-900 mb-2">Cúcuta</h3>
                            <p className="text-sm text-zinc-500 font-medium">Consignar propiedad en Cúcuta y zonas urbanas.</p>
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand mt-4 group-hover:gap-2 transition-all">Ver más <ArrowRight className="w-4 h-4" /></span>
                        </Link>
                        <Link href="/vender-casa-en-villa-del-rosario" className="group p-8 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-brand/30 transition-all duration-300 text-center">
                            <MapPin className="w-8 h-8 text-brand mx-auto mb-4" />
                            <h3 className="text-lg font-black text-zinc-900 mb-2">Villa del Rosario</h3>
                            <p className="text-sm text-zinc-500 font-medium">Consignar inmueble en Villa del Rosario y zona fronteriza.</p>
                            <span className="inline-flex items-center gap-1 text-sm font-bold text-brand mt-4 group-hover:gap-2 transition-all">Ver más <ArrowRight className="w-4 h-4" /></span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ====== FORM ====== */}
            <section id="consignar" className="py-16 md:py-24 bg-zinc-50 border-t border-zinc-100">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
                        <div>
                            <p className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest mb-4">Consignación</p>
                            <h2 className="text-zinc-900 mb-6">
                                Inicie la <span className="text-brand">consignación</span> de su propiedad
                            </h2>
                            <p className="text-base md:text-lg text-zinc-500 mb-10 font-medium leading-relaxed">
                                Complete el formulario y reciba un avalúo comercial gratuito y un plan de marketing personalizado para su inmueble en menos de 24 horas.
                            </p>
                            <ul className="space-y-5 mb-10">
                                {[
                                    'Avalúo comercial competitivo sin costo',
                                    'Marketing digital de alto impacto',
                                    'Asesoría jurídica integral durante todo el proceso',
                                    'Reportes periódicos de gestión y visitas',
                                    'Filtro profesional de compradores calificados',
                                    'Acompañamiento hasta la firma notarial',
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 font-bold text-zinc-800 text-sm md:text-base">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <div className="flex items-center gap-3 text-sm text-zinc-500 font-medium">
                                <Clock className="w-4 h-4 text-brand" />
                                <span>Respondemos en menos de 24 horas hábiles</span>
                            </div>
                        </div>
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-zinc-200 shadow-sm">
                            <PropertyOwnerForm defaultCity="Los Patios" whatsappNumber={whatsappNumber} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ====== FAQ ====== */}
            <section className="py-16 md:py-24 bg-white">
                <div className="container-wide px-4">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12 md:mb-16">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 border border-brand/20 rounded-xl mb-4">
                                <HelpCircle className="w-3 h-3 text-brand" />
                                <span className="text-[11px] md:text-[12px] font-black text-brand uppercase tracking-widest">Dudas frecuentes</span>
                            </div>
                            <h2 className="text-zinc-900 mb-4">
                                Preguntas sobre <span className="text-brand">consignar propiedades</span>
                            </h2>
                            <p className="text-base md:text-lg text-zinc-500 font-medium">
                                Resolvemos las dudas más comunes sobre el proceso de consignación inmobiliaria.
                            </p>
                        </div>
                        <FAQAccordion items={faqs} />
                    </div>
                </div>
            </section>

            {/* ====== CTA FINAL ====== */}
            <section className="py-16 md:py-20 bg-slate-900 text-white">
                <div className="container-wide px-4 text-center">
                    <h2 className="!text-white mb-6 max-w-3xl mx-auto">
                        ¿Listo para <span className="text-brand">vender su propiedad</span> con profesionales?
                    </h2>
                    <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto mb-10 font-medium">
                        Sin costos ocultos. Sin pagos por adelantado. Solo pagas cuando su propiedad se vende.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a href="#consignar" className="px-8 md:px-10 py-4 md:py-5 bg-white text-slate-950 rounded-xl font-black text-base md:text-lg hover:bg-slate-100 transition-colors inline-flex items-center gap-2">
                            Iniciar consignación <ArrowRight className="w-5 h-5" />
                        </a>
                        <a href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, quiero consignar mi propiedad')}`} target="_blank" rel="noopener noreferrer" className="px-8 md:px-10 py-4 md:py-5 bg-brand text-white rounded-xl font-black text-base md:text-lg hover:bg-red-600 transition-colors inline-flex items-center gap-3">
                            <MessageCircle className="w-5 h-5" /> WhatsApp directo
                        </a>
                    </div>
                </div>
            </section>
        </main>
    );
}
