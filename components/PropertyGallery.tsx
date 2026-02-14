'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'

interface PropertyGalleryProps {
    images: string[]
    title: string
}

/**
 * Optimiza las URLs de Cloudinary agregando parámetros de autoformato y calidad.
 */
const optimizeCloudinaryUrl = (url: string) => {
    if (!url) return ''
    if (url.includes('cloudinary.com') && !url.includes('f_auto,q_auto')) {
        // Asumiendo formato estándar /upload/v123456/path
        if (url.includes('/upload/')) {
            return url.replace('/upload/', '/upload/f_auto,q_auto/')
        }
    }
    return url
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)
    const [mainViewportRef, emblaMainApi] = useEmblaCarousel({
        loop: true,
        duration: 30,
        skipSnaps: false
    })
    const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })

    // Limpiar y optimizar imágenes
    const allImages = useMemo(() => {
        const unique = Array.from(new Set(images.filter(Boolean)))
        return unique.map(optimizeCloudinaryUrl)
    }, [images])

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi || !emblaThumbsApi) return
            emblaMainApi.scrollTo(index)
        },
        [emblaMainApi, emblaThumbsApi]
    )

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return
        const index = emblaMainApi.selectedScrollSnap()
        setSelectedIndex(index)
        emblaThumbsApi.scrollTo(index)
    }, [emblaMainApi, emblaThumbsApi])

    useEffect(() => {
        if (!emblaMainApi) return
        onSelect()
        emblaMainApi.on('select', onSelect)
        emblaMainApi.on('reInit', onSelect)
        return () => {
            emblaMainApi.off('select', onSelect)
            emblaMainApi.off('reInit', onSelect)
        }
    }, [emblaMainApi, onSelect])

    const scrollPrev = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        emblaMainApi && emblaMainApi.scrollPrev()
    }, [emblaMainApi])

    const scrollNext = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        emblaMainApi && emblaMainApi.scrollNext()
    }, [emblaMainApi])

    // Cerrar lightbox con ESC
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsLightboxOpen(false)
            if (e.key === 'ArrowLeft') emblaMainApi?.scrollPrev()
            if (e.key === 'ArrowRight') emblaMainApi?.scrollNext()
        }
        if (isLightboxOpen) {
            window.addEventListener('keydown', handleKeyDown)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isLightboxOpen, emblaMainApi])

    if (allImages.length === 0) {
        return (
            <div className="aspect-[4/3] w-full rounded-[2.5rem] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-700">
                <span className="text-zinc-400 font-medium">No hay fotos disponibles</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Galería Principal */}
            <div
                className="relative group aspect-[4/3] overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl cursor-pointer"
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
                                    loading={index === 0 ? undefined : "lazy"}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Overlays decorativos */}
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Botón Expandir */}
                <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                    <div className="glass p-3 rounded-2xl border border-white/20 shadow-xl text-zinc-900 dark:text-zinc-50">
                        <Maximize2 className="h-5 w-5" />
                    </div>
                </div>

                {/* Navegación (Solo Desktop) */}
                {allImages.length > 1 && (
                    <div className="hidden lg:block">
                        <button
                            className="absolute left-6 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-2xl glass text-zinc-900 dark:text-zinc-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20 shadow-xl border border-white/20"
                            onClick={scrollPrev}
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="h-8 w-8" />
                        </button>
                        <button
                            className="absolute right-6 top-1/2 -translate-y-1/2 w-14 h-14 flex items-center justify-center rounded-2xl glass text-zinc-900 dark:text-zinc-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20 shadow-xl border border-white/20"
                            onClick={scrollNext}
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="h-8 w-8" />
                        </button>
                    </div>
                )}

                {/* Contador de posición */}
                <div className="absolute bottom-6 right-6 z-20">
                    <span className="glass px-5 py-2.5 rounded-2xl text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest border border-white/20 shadow-lg backdrop-blur-md">
                        {selectedIndex + 1} / {allImages.length}
                    </span>
                </div>
            </div>

            {/* Miniaturas */}
            {allImages.length > 1 && (
                <div className="relative">
                    <div className="overflow-hidden" ref={thumbViewportRef}>
                        <div className="flex gap-3 py-2">
                            {allImages.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => onThumbClick(index)}
                                    className={`relative flex-[0_0_100px] sm:flex-[0_0_140px] aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all duration-300 ${index === selectedIndex
                                            ? 'border-[#fb2c36] ring-4 ring-[#fb2c36]/10 scale-[1.02] z-10 opacity-100'
                                            : 'border-transparent opacity-60 hover:opacity-100 grayscale-[0.5] hover:grayscale-0'
                                        }`}
                                >
                                    <Image
                                        src={src}
                                        alt={`${title} miniatura ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="140px"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox / Modal Fullscreen */}
            {isLightboxOpen && (
                <div className="fixed inset-0 z-[9999] bg-zinc-950/95 flex items-center justify-center p-4 md:p-10 transition-all duration-500 animate-in fade-in">
                    <button
                        className="absolute top-6 right-6 z-[10000] p-4 text-zinc-100 hover:text-[#fb2c36] transition-colors glass rounded-2xl border border-white/10"
                        onClick={() => setIsLightboxOpen(false)}
                    >
                        <X className="h-8 w-8" />
                    </button>

                    <div className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center">
                        <div className="relative w-full h-full aspect-auto">
                            <Image
                                src={allImages[selectedIndex]}
                                alt={`${title} fullscreen`}
                                fill
                                className="object-contain"
                                priority
                                sizes="100vw"
                            />
                        </div>

                        {/* Navegación Lightbox */}
                        {allImages.length > 1 && (
                            <>
                                <button
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full glass text-zinc-100 hover:text-[#fb2c36] transition-all hover:scale-110 active:scale-95 z-20 hidden md:flex"
                                    onClick={scrollPrev}
                                >
                                    <ChevronLeft className="h-10 w-10" />
                                </button>
                                <button
                                    className="absolute right-0 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center rounded-full glass text-zinc-100 hover:text-[#fb2c36] transition-all hover:scale-110 active:scale-95 z-20 hidden md:flex"
                                    onClick={scrollNext}
                                >
                                    <ChevronRight className="h-10 w-10" />
                                </button>
                            </>
                        )}

                        {/* Pie de foto Lightbox */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass px-6 py-2 rounded-2xl text-zinc-100 text-sm font-medium tracking-wide">
                            {selectedIndex + 1} de {allImages.length} | {title}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
