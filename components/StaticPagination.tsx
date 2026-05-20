import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface StaticPaginationProps {
    totalItems: number;
    itemsPerPage?: number;
    currentPage: number;
    basePath: string;
    /** Current search params WITHOUT the `page` param, e.g. "habitaciones=3&orden=precio_asc" */
    filtersQueryString?: string;
}

/**
 * StaticPagination
 *
 * Renders traditional `<a>` tag-based pagination links for SEO and
 * JS-disabled fallback. When JavaScript loads, LoadMoreProperties
 * hides this component (via `#pagination-fallback`) and shows the
 * interactive "Cargar más" button instead.
 *
 * All links are full-page navigation via `<a>` href, so they work
 * without JavaScript. The existing query string parameters (filters,
 * sort) are preserved through the `searchParams` construction.
 */
export default function StaticPagination({
    totalItems,
    itemsPerPage = 12,
    currentPage,
    basePath,
    filtersQueryString = '',
}: StaticPaginationProps) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalItems <= itemsPerPage) return null;

    // Build a URL with preserved filters + page
    const buildPageUrl = (page: number) => {
        const params = new URLSearchParams(filtersQueryString);
        if (page > 1) {
            params.set('page', String(page));
        } else {
            params.delete('page');
        }
        const qs = params.toString();
        return qs ? `${basePath}?${qs}` : basePath;
    };

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisible = 5;

        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);

            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 2) end = 4;
            else if (currentPage >= totalPages - 1) start = totalPages - 3;

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');

            pages.push(totalPages);
        }
        return pages;
    };

    return (
        <div id="pagination-fallback">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 border-t border-slate-100 pt-12">
                <div className="flex items-center gap-2">
                    {/* Previous link */}
                    {currentPage > 1 ? (
                        <Link
                            href={buildPageUrl(currentPage - 1)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 shadow-sm hover:shadow-md transition-all"
                            aria-label="Anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                    ) : (
                        <span className="p-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                            <ChevronLeft className="w-5 h-5" />
                        </span>
                    )}

                    {/* Page numbers */}
                    <div className="flex items-center gap-1.5">
                        {getPageNumbers().map((page, index) =>
                            page === '...' ? (
                                <span key={`dots-${index}`} className="px-3 py-1 text-slate-400 font-medium">
                                    ...
                                </span>
                            ) : (
                                <Link
                                    key={`page-${page}`}
                                    href={buildPageUrl(Number(page))}
                                    className={`min-w-[40px] h-10 px-3 rounded-xl border font-bold text-sm transition-all ${
                                        currentPage === Number(page)
                                            ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-100 translate-y-[-2px]'
                                            : 'bg-white border-slate-200 text-slate-600 hover:border-brand-300 hover:text-brand-600'
                                    }`}
                                >
                                    {page}
                                </Link>
                            )
                        )}
                    </div>

                    {/* Next link */}
                    {currentPage < totalPages ? (
                        <Link
                            href={buildPageUrl(currentPage + 1)}
                            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-600 shadow-sm hover:shadow-md transition-all"
                            aria-label="Siguiente"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Link>
                    ) : (
                        <span className="p-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-300 cursor-not-allowed">
                            <ChevronRight className="w-5 h-5" />
                        </span>
                    )}
                </div>

                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Página <span className="text-slate-600">{currentPage}</span> de{' '}
                    <span className="text-slate-600">{totalPages}</span>
                </div>
            </div>
        </div>
    );
}
