'use client';

/**
 * CatalogSkeleton — Skeleton loading state para páginas de listado de propiedades.
 *
 * Imita visualmente la estructura de:
 *   - CatalogHeader (breadcrumbs, título, descripción, search bar, results count + sorting)
 *   - Grid de PropertyCardV3 (6 cards, 3 columnas en desktop)
 *
 * Diseñado con animate-pulse y bg-slate-100/200, sin JS extra ni deps externas.
 */
export default function CatalogSkeleton() {
    return (
        <main className="min-h-screen bg-white">
            {/* ── Header Skeleton ────────────────────────────────────────────── */}
            <section className="bg-white pt-20 md:pt-28 pb-8 md:pb-16 relative border-b border-slate-200/60">
                <div className="container-wide px-4">
                    {/* Breadcrumbs */}
                    <div className="flex flex-col items-start md:items-center mb-4 md:mb-8">
                        <div className="flex items-center gap-2 mb-3 md:mb-6">
                            <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-3 text-slate-200">›</div>
                            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="max-w-4xl mx-auto text-center mb-6 md:mb-12">
                        <div className="flex justify-center mb-4 md:mb-6">
                            <div className="h-10 w-72 md:w-96 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="flex justify-center">
                            <div className="h-4 w-full max-w-xl bg-slate-200 rounded animate-pulse" />
                        </div>
                    </div>

                    {/* Search bar placeholder */}
                    <div className="w-full max-w-6xl mx-auto mb-5 md:mb-12">
                        <div className="py-1 md:py-2">
                            <div className="h-[336px] md:h-16 bg-slate-100 animate-pulse rounded-xl border border-slate-200/60" />
                        </div>
                    </div>

                    {/* Results count & Sorting */}
                    <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-3 md:gap-8 pt-4 md:pt-8 border-t border-slate-100">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <div className="h-5 w-56 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-40 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="w-full md:w-auto">
                            <div className="h-12 w-full md:w-64 bg-slate-200 rounded-xl animate-pulse" />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Property Grid Skeleton ─────────────────────────────────────── */}
            <section className="py-20 bg-white">
                <div className="container-wide px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <PropertyCardSkeleton key={i} />
                        ))}
                    </div>

                    {/* Load More / Pagination placeholder */}
                    <div className="mt-10 md:mt-16 flex flex-col items-center gap-3">
                        <div className="h-14 w-full max-w-xs bg-slate-200 rounded-xl animate-pulse" />
                        <div className="h-3 w-72 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>
            </section>
        </main>
    );
}

/**
 * PropertyCardSkeleton — Card individual que imita PropertyCardV3.
 * Misma jerarquía visual: imagen → precio → título → ubicación → atributos → CTA.
 */
function PropertyCardSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-slate-200/60 overflow-hidden h-[480px] lg:h-[490px] flex flex-col shadow-sm">
            {/* 1. Image area — 16:9 */}
            <div
                className="relative w-full bg-slate-200 animate-pulse rounded-t-xl"
                style={{ aspectRatio: '16/9', minHeight: '200px' }}
            />

            {/* 2. Content section */}
            <div className="p-5 pt-5 flex flex-col flex-grow">

                {/* 2.1 Price */}
                <div className="mb-2">
                    <div className="flex items-baseline gap-1">
                        <div className="h-8 w-44 bg-slate-200 rounded animate-pulse" />
                        <div className="h-3 w-8 bg-slate-200 rounded animate-pulse" />
                    </div>
                </div>

                {/* 2.2 Title (2 lines) */}
                <div className="space-y-2 mb-3">
                    <div className="h-4 w-full bg-slate-200 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse" />
                </div>

                {/* 2.3 Location */}
                <div className="flex items-center gap-1.5 mb-4">
                    <div className="h-3.5 w-3.5 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-36 bg-slate-200 rounded animate-pulse" />
                </div>

                {/* 3. Divider + Attributes */}
                <div className="flex flex-col border-t border-slate-100/60">
                    <div className="flex items-center justify-center gap-6 py-4 px-0.5">
                        <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-5 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-5 bg-slate-200 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="h-4 w-4 bg-slate-200 rounded animate-pulse" />
                            <div className="h-3 w-10 bg-slate-200 rounded animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* 4. CTA Button */}
                <div className="mt-auto pt-2">
                    <div className="h-10 w-full bg-slate-200 rounded-[6px] animate-pulse" />
                </div>
            </div>
        </div>
    );
}
