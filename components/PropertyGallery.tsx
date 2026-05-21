'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { optimizeCloudinaryUrl } from '@/lib/supabase/seo-helpers'

interface PropertyGalleryProps {
    images: string[]
    title: string
    variant?: 'default' | 'mosaic'
}

export default function PropertyGallery({ images, title, variant = 'default' }: PropertyGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    // Main Carousel
    const [mainViewportRef, emblaMainApi] = useEmblaCarousel({
        loop: true,
        duration: 30,
        skipSnaps: false
    })

    // Thumbs Carousel
    const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })

    // Lightbox Carousel
    const [lightboxViewportRef, emblaLightboxApi] = useEmblaCarousel({
        loop: true,
        startIndex: selectedIndex,
    })

    // Sync lightbox with selectedIndex when it opens
    useEffect(() => {
        if (isLightboxOpen && emblaLightboxApi) {
            emblaLightboxApi.scrollTo(selectedIndex, true);
        }
    }, [isLightboxOpen, emblaLightboxApi, selectedIndex]);

    const onLightboxSelect = useCallback(() => {
        if (!emblaLightboxApi) return;
        setSelectedIndex(emblaLightboxApi.selectedScrollSnap());
    }, [emblaLightboxApi]);

    useEffect(() => {
        if (!emblaLightboxApi) return;
        emblaLightboxApi.on('select', onLightboxSelect);
        return () => {
            emblaLightboxApi.off('select', onLightboxSelect);
        };
    }, [emblaLightboxApi, onLightboxSelect]);

    const scrollLightboxPrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (emblaLightboxApi) emblaLightboxApi.scrollPrev();
    }, [emblaLightboxApi]);

    const scrollLightboxNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (emblaLightboxApi) emblaLightboxApi.scrollNext();
    }, [emblaLightboxApi]);

    // Limpiar y optimizar imágenes
    const allImages = useMemo(() => {
        const unique = Array.from(new Set(images.filter(Boolean)));
        return unique.map(img => optimizeCloudinaryUrl(img));
    }, [images]);

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi) return;
            emblaMainApi.scrollTo(index);
        },
        [emblaMainApi]
    );

    const onSelect = useCallback(() => {
        if (!emblaMainApi) return;
        const index = emblaMainApi.selectedScrollSnap();
        setSelectedIndex(index);
        emblaThumbsApi?.scrollTo(index);
    }, [emblaMainApi, emblaThumbsApi]);

    useEffect(() => {
        if (!emblaMainApi) return;
        emblaMainApi.on('select', onSelect);
        emblaMainApi.on('reInit', onSelect);
        return () => {
            emblaMainApi.off('select', onSelect);
            emblaMainApi.off('reInit', onSelect);
        };
    }, [emblaMainApi, onSelect]);

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (emblaMainApi) emblaMainApi.scrollPrev();
    }, [emblaMainApi]);

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        if (emblaMainApi) emblaMainApi.scrollNext();
    }, [emblaMainApi]);

    // Cerrar lightbox con ESC y Navegación teclado
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowLeft') {
                if (isLightboxOpen) emblaLightboxApi?.scrollPrev();
                else emblaMainApi?.scrollPrev();
            }
            if (e.key === 'ArrowRight') {
                if (isLightboxOpen) emblaLightboxApi?.scrollNext();
                else emblaMainApi?.scrollNext();
            }
        };
        if (isLightboxOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isLightboxOpen, emblaLightboxApi, emblaMainApi]);

    if (allImages.length === 0) {
        return (
            <div className="aspect-[4/3] w-full rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-400 font-medium">No hay fotos disponibles</span>
            </div>
        )
    }

    const lightboxModal = isLightboxOpen ? (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/95 flex items-center justify-center transition-all duration-500 animate-in fade-in backdrop-blur-md">
            <button
                className="absolute top-4 right-4 md:top-6 md:right-6 z-[10000] p-2.5 md:p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full border border-white/10"
                onClick={() => setIsLightboxOpen(false)}
                aria-label="Cerrar"
            >
                <X className="h-5 w-5 md:h-6 md:w-6" />
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="overflow-hidden w-full h-full cursor-grab active:cursor-grabbing" ref={lightboxViewportRef}>
                    <div className="flex h-full">
                        {allImages.map((src, index) => (
                            <div className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-4 md:p-12" key={index}>
                                <div className="relative w-full h-full">
                                    <Image
                                        src={src}
                                        alt={`${title} - Vista Fullscreen ${index + 1}`}
                                        fill
                                        className="object-contain"
                                        priority={index === selectedIndex}
                                        sizes="100vw"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {allImages.length > 1 && (
                    <>
                        <button
                            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 z-20 border border-white/10"
                            onClick={scrollLightboxPrev}
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
                        </button>
                        <button
                            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110 active:scale-95 z-20 border border-white/10"
                            onClick={scrollLightboxNext}
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
                        </button>
                    </>
                )}

                <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-1.5 md:px-6 md:py-2.5 rounded-full text-white/90 text-xs md:text-sm font-bold tracking-widest border border-white/10 shadow-2xl">
                    {selectedIndex + 1} / {allImages.length}
                </div>
            </div>
        </div>
    ) : null

    if (variant === 'mosaic') {
        const mainImage = allImages[0]
        const MAX_THUMBS = 4
        const thumbnails = allImages.slice(1, 1 + MAX_THUMBS)
        const hasMoreThumbs = allImages.length > 1 + MAX_THUMBS

        return (
            <>
                <div className="relative group w-full flex flex-col gap-2 overflow-hidden rounded-none md:rounded-lg">
                    {/* Mobile Swipe Gallery */}
                    <div className="md:hidden relative h-[72vw] min-h-[280px] max-h-[440px] overflow-hidden bg-zinc-100">
                        <div className="overflow-hidden h-full" ref={mainViewportRef}>
                            <div className="flex h-full">
                                {allImages.map((src, index) => (
                                    <div
                                        key={index}
                                        className="relative flex-[0_0_100%] min-w-0 h-full cursor-pointer"
                                        onClick={() => {
                                            setSelectedIndex(index)
                                            setIsLightboxOpen(true)
                                        }}
                                    >
                                        <Image
                                            src={src}
                                            alt={`${title} - Foto ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="100vw"
                                            priority={index === 0}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {allImages.length > 1 && (
                            <div className="absolute bottom-3 right-3 z-10">
                                <span className="bg-white/90 backdrop-blur-sm text-slate-700 px-2.5 py-1 rounded-lg text-[12px] font-semibold tracking-wide shadow-sm border border-slate-200/50">
                                    {selectedIndex + 1} / {allImages.length}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Desktop: Main Image — Full Width, Sin Recortes */}
                    <div
                        className="hidden md:block relative w-full h-[45vh] min-h-[360px] max-h-[520px] cursor-pointer overflow-hidden bg-zinc-100 rounded-lg"
                        onClick={() => {
                            setSelectedIndex(0)
                            setIsLightboxOpen(true)
                        }}
                    >
                        <Image
                            src={mainImage}
                            alt={`${title} - Principal`}
                            fill
                            className="object-contain"
                            priority
                            sizes="(max-width: 768px) 100vw, 66vw"
                        />
                        {allImages.length > 1 && (
                            <div className="absolute bottom-4 right-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm border border-slate-200/50">
                                {allImages.length} fotos
                            </div>
                        )}
                    </div>

                    {/* Desktop: Miniaturas en Mosaico — Sin Recortes */}
                    {thumbnails.length > 0 && (
                        <div className="hidden md:grid grid-cols-4 gap-2">
                            {thumbnails.map((src, idx) => {
                                const colSpan =
                                    thumbnails.length === 1 ? 'col-span-4' :
                                    thumbnails.length === 2 ? 'col-span-2' : ''
                                return (
                                    <div
                                        key={idx}
                                        className={`relative aspect-[4/3] cursor-pointer overflow-hidden rounded-md bg-zinc-100 ${colSpan}`}
                                        onClick={() => {
                                            setSelectedIndex(idx + 1)
                                            setIsLightboxOpen(true)
                                        }}
                                    >
                                        <Image
                                            src={src}
                                            alt={`${title} - Foto ${idx + 2}`}
                                            fill
                                            className="object-contain"
                                            sizes="25vw"
                                        />
                                        {hasMoreThumbs && idx === thumbnails.length - 1 && (
                                            <div className="absolute inset-0 bg-zinc-900/50 flex items-center justify-center rounded-md pointer-events-none">
                                                <span className="text-white font-bold text-lg">+{allImages.length - 1 - MAX_THUMBS}</span>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Maximize button */}
                    <button
                        type="button"
                        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur p-2 rounded-lg border border-zinc-200 shadow-sm"
                        onClick={() => {
                            setSelectedIndex(0)
                            setIsLightboxOpen(true)
                        }}
                        aria-label="Abrir galería en pantalla completa"
                    >
                        <Maximize2 className="h-4 w-4 text-zinc-900" />
                    </button>
                </div>
                {lightboxModal}
            </>
        )
    }

    return (
        <div className="space-y-4">
            {/* Galería Principal */}
            <div
                className="relative group aspect-[4/3] overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-md cursor-pointer"
                onClick={() => setIsLightboxOpen(true)}
            >
                <div className="overflow-hidden h-full" ref={mainViewportRef}>
                    <div className="flex h-full">
                        {allImages.map((src, index) => (
                            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                                <Image
                                    src={src}
                                    alt={`${title} - Vista ${index + 1}`}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 1024px) 100vw, 850px"
                                    priority={index === 0}
                                    loading="eager"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overlays decorativos */}
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Botón Expandir */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <div className="bg-white/90 backdrop-blur p-2.5 rounded-lg border border-zinc-200 shadow-lg text-zinc-900">
                        <Maximize2 className="h-5 w-5" />
                    </div>
                </div>

                {/* Navegación (Solo Desktop) */}
                {allImages.length > 1 && (
                    <div className="hidden lg:block">
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur text-zinc-900 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20 shadow-lg border border-zinc-200"
                            onClick={scrollPrev}
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="h-7 w-7" />
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-lg bg-white/90 backdrop-blur text-zinc-900 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20 shadow-lg border border-zinc-200"
                            onClick={scrollNext}
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="h-7 w-7" />
                        </button>
                    </div>
                )}

                {/* Contador de posición */}
                <div className="absolute bottom-4 right-4 z-20">
                    <span className="bg-white/90 backdrop-blur px-4 py-2 rounded-lg text-xs font-bold text-zinc-900 uppercase tracking-widest border border-zinc-200 shadow-md">
                        {selectedIndex + 1} / {allImages.length}
                    </span>
                </div>
            </div>

            {/* Miniaturas */}
            {allImages.length > 1 && (
                <div className="relative">
                    <div className="overflow-hidden" ref={thumbViewportRef}>
                        <div className="flex gap-2 py-2">
                            {allImages.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => onThumbClick(index)}
                                    className={`relative flex-[0_0_100px] sm:flex-[0_0_140px] aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all duration-300 ${index === selectedIndex
                                        ? 'border-brand ring-4 ring-brand/10 scale-[1.02] z-10 opacity-100'
                                        : 'border-transparent opacity-60 hover:opacity-100 grayscale-[0.5] hover:grayscale-0'
                                        }`}
                                >
                                    <Image
                                        src={src}
                                        alt={`${title} miniatura ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100px, 140px"
                                        loading="eager"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {lightboxModal}
        </div>
    );
}
