'use client'

import React, { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'

interface PropertyGalleryProps {
    images: string[]
    title: string
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [mainViewportRef, emblaMainApi] = useEmblaCarousel({ loop: true, duration: 30 })
    const [thumbViewportRef, emblaThumbsApi] = useEmblaCarousel({
        containScroll: 'keepSnaps',
        dragFree: true,
    })

    // Ensure we don't have duplicates and preserve order
    const allImages = Array.from(new Set(images))

    const onThumbClick = useCallback(
        (index: number) => {
            if (!emblaMainApi || !emblaThumbsApi) return
            emblaMainApi.scrollTo(index)
        },
        [emblaMainApi, emblaThumbsApi]
    )

    const onSelect = useCallback(() => {
        if (!emblaMainApi || !emblaThumbsApi) return
        setSelectedIndex(emblaMainApi.selectedScrollSnap())
        emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
    }, [emblaMainApi, emblaThumbsApi, setSelectedIndex])

    useEffect(() => {
        if (!emblaMainApi) return
        onSelect()
        emblaMainApi.on('select', onSelect)
        emblaMainApi.on('reInit', onSelect)
    }, [emblaMainApi, onSelect])

    const scrollPrev = useCallback(() => emblaMainApi && emblaMainApi.scrollPrev(), [emblaMainApi])
    const scrollNext = useCallback(() => emblaMainApi && emblaMainApi.scrollNext(), [emblaMainApi])

    if (allImages.length === 0) return null

    return (
        <div className="space-y-4">
            {/* Main Slider */}
            <div className="relative group aspect-video overflow-hidden rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <div className="overflow-hidden h-full" ref={mainViewportRef}>
                    <div className="flex h-full">
                        {allImages.map((src, index) => (
                            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={index}>
                                <Image
                                    src={src}
                                    alt={`${title} - foto ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 800px"
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Navigation Buttons */}
                {allImages.length > 1 && (
                    <>
                        <button
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-2xl glass text-zinc-900 dark:text-zinc-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                            onClick={scrollPrev}
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-2xl glass text-zinc-900 dark:text-zinc-50 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-95 z-20"
                            onClick={scrollNext}
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>
                    </>
                )}

                {/* Indicator */}
                <div className="absolute bottom-6 right-6 z-20">
                    <span className="glass px-4 py-2 rounded-2xl text-xs font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-widest border border-white/20 shadow-lg">
                        {selectedIndex + 1} / {allImages.length}
                    </span>
                </div>
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="relative px-2">
                    <div className="overflow-hidden" ref={thumbViewportRef}>
                        <div className="flex gap-4">
                            {allImages.map((src, index) => (
                                <button
                                    key={index}
                                    onClick={() => onThumbClick(index)}
                                    className={`relative flex-[0_0_80px] sm:flex-[0_0_120px] aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 ${index === selectedIndex
                                        ? 'border-[#fb2c36] ring-4 ring-[#fb2c36]/20 scale-105 z-10'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <Image
                                        src={src}
                                        alt={`${title} - miniatura ${index + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="120px"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
