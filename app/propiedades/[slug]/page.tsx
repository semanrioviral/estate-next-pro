import { Metadata } from "next";
import { getPropertyBySlug, properties } from "@/data/properties";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
    return properties.map((property) => ({
        slug: property.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const property = getPropertyBySlug(slug);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tucasalospatios.com";

    if (!property) return { title: "Propiedad no encontrada" };

    const title = `${property.tipo === "casa" ? "Casa" : property.tipo === "apartamento" ? "Apartamento" : "Lote"} en venta en ${property.barrio}, ${property.ciudad} | TucasaLosPatios`;
    const description = `${property.tipo} en venta en ${property.barrio}. ${property.habitaciones} habs, ${property.baños} baños, ${property.area_m2}m². ${property.descripcion.substring(0, 100)}...`;
    const absoluteImage = property.imagen_principal.startsWith('http')
        ? property.imagen_principal
        : `${siteUrl}${property.imagen_principal}`;

    return {
        metadataBase: new URL(siteUrl),
        title,
        description,
        authors: [{ name: "TucasaLosPatios" }],
        publisher: "TucasaLosPatios",
        robots: "index, follow",
        alternates: {
            canonical: `${siteUrl}/propiedades/${slug}`,
        },
        openGraph: {
            title,
            description,
            siteName: "TucasaLosPatios",
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

import { Bed, Bath, Square, MapPin, MessageCircle, Calendar, User, Info, Star } from "lucide-react";

export default async function PropertyDetailPage({ params }: Props) {
    const { slug } = await params;
    const property = getPropertyBySlug(slug);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tucasalospatios.com";

    if (!property) {
        notFound();
    }

    const whatsappMessage = encodeURIComponent(`Hola, me interesa la propiedad: ${property.titulo}`);
    const whatsappUrl = `https://wa.me/573223047435?text=${whatsappMessage}`;

    const getAbsoluteUrl = (path: string) => path.startsWith('http') ? path : `${siteUrl}${path}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "Product",
                "@id": `${siteUrl}/propiedades/${property.slug}#product`,
                "name": property.titulo,
                "description": property.descripcion,
                "image": getAbsoluteUrl(property.imagen_principal),
                "offers": {
                    "@type": "Offer",
                    "price": property.precio,
                    "priceCurrency": "COP",
                    "availability": "https://schema.org/InStock",
                    "url": `${siteUrl}/propiedades/${property.slug}`
                }
            },
            {
                "@type": "RealEstateListing",
                "@id": `${siteUrl}/propiedades/${property.slug}#listing`,
                "name": property.titulo,
                "description": property.descripcion,
                "url": `${siteUrl}/propiedades/${property.slug}`,
                "image": [
                    getAbsoluteUrl(property.imagen_principal),
                    ...property.galeria.map(img => getAbsoluteUrl(img))
                ],
                "datePosted": property.createdAt || new Date().toISOString(),
                "numberOfRooms": property.habitaciones,
                "floorSize": {
                    "@type": "QuantitativeValue",
                    "value": property.area_m2,
                    "unitCode": "MTK"
                },
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": property.ciudad,
                    "addressRegion": "Norte de Santander",
                    "addressCountry": "CO",
                    "streetAddress": property.barrio
                }
            },
            {
                "@type": "BreadcrumbList",
                "@id": `${siteUrl}/propiedades/${property.slug}#breadcrumb`,
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Inicio",
                        "item": siteUrl
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Venta",
                        "item": `${siteUrl}/propiedades`
                    },
                    {
                        "@type": "ListItem",
                        "position": 3,
                        "name": property.tipo.charAt(0).toUpperCase() + property.tipo.slice(1) + "s",
                        "item": `${siteUrl}/venta/${property.tipo}s/${property.ciudad.toLowerCase().replace(/ /g, "-")}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 4,
                        "name": property.ciudad,
                        "item": `${siteUrl}/${property.ciudad.toLowerCase().replace(/ /g, "-")}`
                    },
                    {
                        "@type": "ListItem",
                        "position": 5,
                        "name": property.titulo,
                        "item": `${siteUrl}/propiedades/${property.slug}`
                    }
                ]
            }
        ]
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Breadcrumbs */}
            <nav className="mb-6 flex" aria-label="Breadcrumb">
                <ol className="flex items-center space-x-2 text-sm text-zinc-500">
                    <li>
                        <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
                    </li>
                    <li className="flex items-center">
                        <span className="mx-2 text-zinc-300">/</span>
                        <Link href={`/${property.ciudad.toLowerCase().replace(/ /g, "-")}`} className="hover:text-blue-600 transition-colors">
                            {property.ciudad}
                        </Link>
                    </li>
                    <li className="flex items-center">
                        <span className="mx-2 text-zinc-300">/</span>
                        <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate max-w-[150px] sm:max-w-xs">
                            {property.titulo}
                        </span>
                    </li>
                </ol>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Columna Izquierda: Contenido Principal */}
                <div className="lg:col-span-2 space-y-10">
                    {/* Hero Image */}
                    <div className="relative aspect-video overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <Image
                            src={property.imagen_principal}
                            alt={property.titulo}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
                            priority
                        />
                        <div className="absolute top-6 left-6">
                            <span className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-widest border border-white/20 shadow-lg">
                                {property.tipo}
                            </span>
                        </div>
                    </div>

                    {/* Titulo y Ubicacion */}
                    <div>
                        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                            {property.titulo}
                        </h1>
                        <div className="mt-4 flex items-center text-zinc-500 dark:text-zinc-400">
                            <MapPin className="mr-2 h-5 w-5 text-blue-500" />
                            <span className="text-lg font-medium">{property.barrio}, {property.ciudad}</span>
                        </div>
                    </div>

                    {/* Características destacadas */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y border-zinc-100 dark:border-zinc-800">
                        {property.tipo !== "lote" && (
                            <>
                                <div className="flex flex-col items-center p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-blue-500/20 transition-colors">
                                    <Bed className="h-7 w-7 text-blue-500 mb-2" />
                                    <span className="text-sm text-zinc-500 font-medium">Habitaciones</span>
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{property.habitaciones}</span>
                                </div>
                                <div className="flex flex-col items-center p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-blue-500/20 transition-colors">
                                    <Bath className="h-7 w-7 text-blue-500 mb-2" />
                                    <span className="text-sm text-zinc-500 font-medium">Baños</span>
                                    <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{property.baños}</span>
                                </div>
                            </>
                        )}
                        <div className="flex flex-col items-center p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-blue-500/20 transition-colors">
                            <Square className="h-7 w-7 text-blue-500 mb-2" />
                            <span className="text-sm text-zinc-500 font-medium">Área Útil</span>
                            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50">{property.area_m2} m²</span>
                        </div>
                        <div className="flex flex-col items-center p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 border border-transparent hover:border-blue-500/20 transition-colors">
                            <Star className="h-7 w-7 text-blue-500 mb-2" />
                            <span className="text-sm text-zinc-500 font-medium">Categoría</span>
                            <span className="text-xl font-bold text-zinc-900 dark:text-zinc-50 capitalize">{property.tipo}</span>
                        </div>
                    </div>

                    {/* Descripción */}
                    <div className="prose prose-zinc dark:prose-invert max-w-none">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-6 flex items-center">
                            <Info className="mr-3 h-6 w-6 text-blue-500" />
                            Sobre esta propiedad
                        </h2>
                        <div className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-4">
                            {property.descripcion.split('\n').map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                    </div>

                    {/* Galería Secundaria */}
                    {property.galeria.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-8">Galería de Imágenes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {property.galeria.map((img, idx) => (
                                    <div key={idx} className="relative aspect-[4/3] overflow-hidden rounded-[2rem] border border-zinc-200 dark:border-zinc-800 group">
                                        <Image
                                            src={img}
                                            alt={`${property.titulo} - vista ${idx + 1}`}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Columna Derecha: Sidebar Sticky */}
                <div className="lg:relative">
                    <div className="lg:sticky lg:top-24 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl shadow-blue-500/5 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                            <div className="relative">
                                <span className="text-zinc-500 dark:text-zinc-400 font-semibold text-sm uppercase tracking-widest">Inversión Estimada</span>
                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">
                                        ${property.precio.toLocaleString("es-CO")}
                                    </span>
                                    <span className="text-zinc-400 font-medium tracking-tighter uppercase">COP</span>
                                </div>
                            </div>

                            <div className="mt-10 space-y-4">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-6 py-4 text-center text-lg font-bold text-white hover:bg-[#20ba59] transition-all active:scale-[0.98] shadow-lg shadow-green-500/20"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                    Contactar por WhatsApp
                                </a>
                                <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-zinc-900 dark:bg-zinc-50 px-6 py-4 text-center text-lg font-bold text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all active:scale-[0.98] shadow-lg">
                                    <Calendar className="h-6 w-6" />
                                    Agendar Visita
                                </button>
                            </div>

                            {/* Perfil Agente */}
                            <div className="mt-10 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border border-blue-500/10">
                                    <User className="h-8 w-8 text-blue-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-50">TucasaLosPatios</p>
                                    <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">Asesor Inmobiliario Senior</p>
                                </div>
                            </div>
                        </div>

                        {/* Banner de confianza */}
                        <div className="bg-blue-600 rounded-[2rem] p-6 text-white overflow-hidden relative group">
                            <div className="absolute top-0 right-0 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                <Star className="h-24 w-24 -mr-6 -mt-6" />
                            </div>
                            <h4 className="font-bold mb-2">Asesoría de Confianza</h4>
                            <p className="text-sm text-blue-100 leading-relaxed">
                                Garantizamos transparencia y seguridad jurídica en cada proceso de compra o renta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
