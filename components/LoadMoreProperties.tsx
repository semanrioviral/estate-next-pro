'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import PropertyCardV3 from '@/components/design-system/PropertyCardV3';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { Property } from '@/lib/supabase/properties';

// ── Inline animation for smooth card entrance ──────────────────────
const fadeInKeyframes = `
@keyframes fadeInUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
}`;

interface LoadMorePropertiesProps {
    /** Total number of matching properties (used to know if there are more pages) */
    totalCount: number;
    /** Number of properties per page (defaults to 12) */
    itemsPerPage?: number;
    /** The page that was server-rendered (from URL params) */
    currentPage: number;
    /**
     * Parameters to send to the API route for fetching the next page.
     * Must include `source` and any params required by that source.
     * Example: { source: 'operacion', operacion: 'venta', habitaciones: 3, orden: 'precio_asc' }
     */
    fetchParams: Record<string, string | number | boolean | undefined>;
    /** Base path for the catalog page (used for URL updates and fallback) */
    basePath: string;
}

export default function LoadMoreProperties({
    totalCount,
    itemsPerPage = 12,
    currentPage: initialPage,
    fetchParams,
    basePath,
}: LoadMorePropertiesProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const totalPages = Math.ceil(totalCount / itemsPerPage);

    // Track which pages have been loaded client-side.
    // The SSR-rendered page (initialPage) is implicitly loaded.
    const [loadedPages, setLoadedPages] = useState<number[]>([initialPage]);
    // Properties fetched client-side (appended AFTER the SSR grid)
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(initialPage < totalPages);
    const initialized = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Track loaded pages in a ref for the event listener
    const loadedPagesRef = useRef(loadedPages);
    useEffect(() => { loadedPagesRef.current = loadedPages; }, [loadedPages]);

    // ── On mount: hide static pagination fallback ──────────────────
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        // Hide the static pagination fallback rendered for JS-off users
        const fallback = document.getElementById('pagination-fallback');
        if (fallback) {
            fallback.style.display = 'none';
        }
    }, []);

    // ── Save loaded pages to sessionStorage when a property card is clicked ──
    // This lets us preserve the full browsing context when user returns from PDP.
    useEffect(() => {
        const handleCardClick = (e: MouseEvent) => {
            let target = e.target as HTMLElement | null;
            while (target && target.tagName !== 'A') {
                target = target.parentElement;
            }
            if (!target) return;

            const href = (target as HTMLAnchorElement).getAttribute('href');
            if (href && href.startsWith('/propiedades/')) {
                try {
                    // Extend the existing catalog_context with loadedPages
                    const saved = sessionStorage.getItem('catalog_context');
                    if (saved) {
                        const ctx = JSON.parse(saved);
                        ctx.loadedPages = loadedPagesRef.current;
                        sessionStorage.setItem('catalog_context', JSON.stringify(ctx));
                    }
                } catch {
                    // Silently fail
                }
            }
        };

        document.addEventListener('click', handleCardClick, { capture: true });
        return () => document.removeEventListener('click', handleCardClick, { capture: true });
    }, []);

    // ── Handle "Cargar más" click ──────────────────────────────────
    const handleLoadMore = useCallback(async () => {
        if (loading || !hasMore) return;

        const nextPage = loadedPages[loadedPages.length - 1] + 1;
        if (nextPage > totalPages) {
            setHasMore(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/properties/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...fetchParams,
                    page: nextPage,
                }),
            });

            if (!response.ok) {
                throw new Error(`Error del servidor (${response.status})`);
            }

            const data = await response.json();
            const newProperties: Property[] = data.properties || [];

            if (newProperties.length === 0) {
                setHasMore(false);
                setLoading(false);
                return;
            }

            setProperties(prev => [...prev, ...newProperties]);
            setLoadedPages(prev => [...prev, nextPage]);

            // Update URL to reflect the latest page loaded
            const params = new URLSearchParams(searchParams.toString());
            params.set('page', String(nextPage));
            router.replace(`${basePath}?${params.toString()}`, { scroll: false });

            // Check if there are more pages
            setHasMore(nextPage < totalPages);
        } catch (err: any) {
            console.error('[LoadMore] Error:', err);
            setError(err.message || 'Error al cargar más propiedades');
        } finally {
            setLoading(false);
        }
    }, [loading, hasMore, loadedPages, fetchParams, totalPages, basePath, router, searchParams]);

    // ── Nothing to render if no more pages and no appended properties ──
    if (!hasMore && properties.length === 0 && loadedPages.length <= 1) {
        return null;
    }

    const totalDisplayed = Math.min(
        (loadedPages.length - 1) * itemsPerPage + itemsPerPage /* SSR page */,
        totalCount
    );

    return (
        <>
            <style>{fadeInKeyframes}</style>

            {/* Client-appended property cards (pages 2+, loaded on demand) */}
            {properties.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {properties.map((property, index) => (
                        <div
                            key={property.id}
                            style={{
                                animation: `fadeInUp 0.4s ease-out ${(index % itemsPerPage) * 60}ms both`,
                            }}
                        >
                            <PropertyCardV3 property={property} />
                        </div>
                    ))}
                </div>
            )}

            {/* Load More button */}
            {hasMore && (
                <div className="mt-10 md:mt-16 flex flex-col items-center gap-3">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="inline-flex items-center gap-2.5 px-8 py-4 bg-white border-2 border-slate-200 hover:border-brand/40 text-slate-700 hover:text-brand font-bold text-sm rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
                        aria-label="Cargar más propiedades"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Cargando...
                            </>
                        ) : (
                            <>
                                <ChevronDown className="w-4 h-4" />
                                Cargar más propiedades
                            </>
                        )}
                    </button>

                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Mostrando {totalDisplayed} de {totalCount} propiedades
                    </p>
                </div>
            )}

            {/* Error state — allows retry */}
            {error && !loading && (
                <div className="mt-6 text-center">
                    <p className="text-red-500 text-sm font-medium mb-3">{error}</p>
                    <button
                        onClick={handleLoadMore}
                        className="text-brand text-sm font-bold hover:underline"
                    >
                        Intentar de nuevo
                    </button>
                </div>
            )}

            {/* All loaded state */}
            {!hasMore && properties.length > 0 && (
                <div className="mt-10 md:mt-16 text-center">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                        Mostrando todas las {totalCount} propiedades
                    </p>
                </div>
            )}
        </>
    );
}
