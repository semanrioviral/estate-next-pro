'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, X, Grid3X3 } from 'lucide-react'
import { optimizeCloudinaryUrl } from '@/lib/supabase/seo-helpers'

interface PropertyGalleryProps {
    images: string[]
    title: string
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ loop: false, duration: 25, skipSnaps: false })
    const [lightboxViewportRef, emblaLightboxApi] = useEmblaCarousel({ loop: false, startIndex: selectedIndex })

    useEffect(() => {
        if (isLightboxOpen && emblaLightboxApi) emblaLightboxApi.scrollTo(selectedIndex, true)
    }, [isLightboxOpen, emblaLightboxApi, selectedIndex])

    const onLightboxSelect = useCallback(() => {
        if (!emblaLightboxApi) return
        setSelectedIndex(emblaLightboxApi.selectedScrollSnap())
    }, [emblaLightboxApi])

    useEffect(() => {
        if (!emblaLightboxApi) return
        emblaLightboxApi.on('select', onLightboxSelect)
        return () => { emblaLightboxApi.off('select', onLightboxSelect) }
    }, [emblaLightboxApi, onLightboxSelect])

    const onSelect = useCallback(() => {
        if (!emblaMainApi) return
        setSelectedIndex(emblaMainApi.selectedScrollSnap())
    }, [emblaMainApi])

    useEffect(() => {
        if (!emblaMainApi) return
        emblaMainApi.on('select', onSelect)
        return () => { emblaMainApi.off('select', onSelect) }
    }, [emblaMainApi, onSelect])

    const scrollPrev = useCallback((e: React.MouseEvent) => { e.stopPropagation(); emblaMainApi?.scrollPrev() }, [emblaMainApi])
    const scrollNext = useCallback((e: React.MouseEvent) => { e.stopPropagation(); emblaMainApi?.scrollNext() }, [emblaMainApi])
    const scrollLbPrev = useCallback((e: React.MouseEvent) => { e.stopPropagation(); emblaLightboxApi?.scrollPrev() }, [emblaLightboxApi])
    const scrollLbNext = useCallback((e: React.MouseEvent) => { e.stopPropagation(); emblaLightboxApi?.scrollNext() }, [emblaLightboxApi])

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (!isLightboxOpen) return
            if (e.key === 'Escape') setIsLightboxOpen(false)
            if (e.key === 'ArrowLeft') emblaLightboxApi?.scrollPrev()
            if (e.key === 'ArrowRight') emblaLightboxApi?.scrollNext()
        }
        window.addEventListener('keydown', handler)
        document.body.style.overflow = isLightboxOpen ? 'hidden' : ''
        return () => { window.removeEventListener('keydown', handler); document.body.style.overflow = '' }
    }, [isLightboxOpen, emblaLightboxApi])

    const allImages = useMemo(() => {
        return Array.from(new Set(images.filter(Boolean))).map(img => optimizeCloudinaryUrl(img))
    }, [images])

    if (allImages.length === 0) {
        return (
            <div className="aspect-[16/9] w-full bg-zinc-100 flex items-center justify-center border border-zinc-200 rounded-none md:rounded-xl">
                <span className="text-zinc-400 font-medium text-sm">Sin fotos disponibles</span>
            </div>
        )
    }

    const openLightbox = (index: number) => { setSelectedIndex(index); setIsLightboxOpen(true) }

    // ---- LIGHTBOX ----
    const lightbox = isLightboxOpen ? (
        <div className="fixed inset-0 z-[9999] bg-zinc-950/98 flex items-center justify-center animate-in fade-in duration-200">
            <button
                className="absolute top-4 right-4 z-50 p-3 text-white/60 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full"
                onClick={() => setIsLightboxOpen(false)} aria-label="Cerrar"
            ><X size={22} /></button>

            <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="overflow-hidden w-full h-full" ref={lightboxViewportRef}>
                    <div className="flex h-full">
                        {allImages.map((src, i) => (
                            <div key={i} className="relative flex-[0_0_100%] min-w-0 h-full flex items-center justify-center p-6 md:p-16">
                                <Image src={src} alt={`${title} - Foto ${i + 1}`} fill className="object-contain" priority={i === selectedIndex} sizes="100vw" />
                            </div>
                        ))}
                    </div>
                </div>
                {allImages.length > 1 && (
                    <>
                        <button onClick={scrollLbPrev} className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-20" aria-label="Anterior">
                            <ChevronLeft size={22} />
                        </button>
                        <button onClick={scrollLbNext} className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-20" aria-label="Siguiente">
                            <ChevronRight size={22} />
                        </button>
                    </>
                )}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-white text-xs font-bold tracking-wider">
                    {selectedIndex + 1} / {allImages.length}
                </div>
            </div>
        </div>
    ) : null

    // ---- 1 image: simple full-width ----
    if (allImages.length === 1) {
        return (
            <>
                <div className="relative aspect-[16/9] md:aspect-[2/1] w-full overflow-hidden bg-zinc-100 cursor-pointer rounded-none md:rounded-xl" onClick={() => openLightbox(0)}>
                    <Image src={allImages[0]} alt={title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 1200px" />
                </div>
                {lightbox}
            </>
        )
    }

    // ---- 2 images: side by side ----
    if (allImages.length === 2) {
        return (
            <>
                <div className="grid grid-cols-2 gap-1 md:gap-2 rounded-none md:rounded-xl overflow-hidden">
                    {allImages.map((src, i) => (
                        <div key={i} className="relative aspect-[4/3] cursor-pointer bg-zinc-100 overflow-hidden" onClick={() => openLightbox(i)}>
                            <Image src={src} alt={`${title} - Foto ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 600px" priority={i === 0} />
                        </div>
                    ))}
                </div>
                {lightbox}
            </>
        )
    }

    // ---- 3+ images: grid layout ----
    const showGrid = allImages.length >= 3
    const gridImages = allImages.slice(0, 5) // show max 5 in grid
    const remaining = allImages.length - 5

    return (
        <>
            {/* ---- DESKTOP: Grid 3-col ---- */}
            <div className="hidden md:grid md:grid-cols-4 md:grid-rows-2 md:gap-1.5 md:rounded-xl md:overflow-hidden md:h-[520px]">
                {/* Main image: col-span-2 row-span-2 */}
                <div className="relative col-span-2 row-span-2 cursor-pointer bg-zinc-100 overflow-hidden" onClick={() => openLightbox(0)}>
                    <Image src={allImages[0]} alt={`${title} - Principal`} fill className="object-cover hover:scale-105 transition-transform duration-700" priority sizes="50vw" />
                </div>
                {/* Secondary images */}
                {allImages.slice(1, 3).map((src, i) => (
                    <div key={i} className="relative cursor-pointer bg-zinc-100 overflow-hidden" onClick={() => openLightbox(i + 1)}>
                        <Image src={src} alt={`${title} - Foto ${i + 2}`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="25vw" />
                    </div>
                ))}
                {/* Third row: image 4 + "show all" button */}
                {allImages.length > 3 ? (
                    <div className="relative cursor-pointer bg-zinc-100 overflow-hidden" onClick={() => openLightbox(3)}>
                        <Image src={allImages[3]} alt={`${title} - Foto 4`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="25vw" />
                    </div>
                ) : <div className="bg-zinc-50" />}
                <div
                    className="relative cursor-pointer bg-zinc-100 overflow-hidden"
                    onClick={() => openLightbox(allImages.length > 3 ? 4 : 3)}
                >
                    {allImages.length > 4 ? (
                        <>
                            <Image src={allImages[4]} alt={`${title} - Foto 5`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="25vw" />
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-1 transition-colors hover:bg-black/50">
                                <Grid3X3 size={24} className="text-white" />
                                <span className="text-white font-bold text-sm">+{remaining > 0 ? remaining : allImages.length - 4}</span>
                                <span className="text-white/80 text-[10px] font-medium">Ver todas</span>
                            </div>
                        </>
                    ) : (
                        <Image src={allImages[4]} alt={`${title} - Foto 5`} fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="25vw" />
                    )}
                </div>
            </div>

            {/* ---- MOBILE: Horizontal swipe ---- */}
            <div className="md:hidden relative">
                <div className="overflow-hidden rounded-none" ref={mainViewportRef}>
                    <div className="flex">
                        {allImages.map((src, i) => (
                            <div key={i} className="relative flex-[0_0_100%] min-w-0 aspect-[4/3] cursor-pointer bg-zinc-100" onClick={() => openLightbox(i)}>
                                <Image src={src} alt={`${title} - Foto ${i + 1}`} fill className="object-cover" sizes="100vw" priority={i === 0} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Mobile counter */}
                <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold">
                    {selectedIndex + 1} / {allImages.length}
                </div>
                {/* Mobile arrows */}
                {allImages.length > 1 && (
                    <>
                        <button onClick={scrollPrev} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-sm active:scale-95" aria-label="Anterior">
                            <ChevronLeft size={18} />
                        </button>
                        <button onClick={scrollNext} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 text-zinc-700 shadow-sm active:scale-95" aria-label="Siguiente">
                            <ChevronRight size={18} />
                        </button>
                    </>
                )}
                {/* Dots */}
                {allImages.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allImages.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => emblaMainApi?.scrollTo(i)}
                                className={`h-1.5 rounded-full transition-all ${i === selectedIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                                aria-label={`Ir a foto ${i + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {lightbox}
        </>
    )
}
